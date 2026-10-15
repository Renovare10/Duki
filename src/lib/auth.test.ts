import { describe, expect, it } from "vitest";
import {
  AUTH_CLIENT_ID,
  AUTH_DOMAIN,
  authorizeUrl,
  createPkce,
  ensureFreshAuth,
  parseAuthCallback,
  stripAuthQuery,
  subjectFromIdToken,
  hasSignedInHint,
  shouldTrySilentSignIn,
  signedInHintCookie,
  signupUrl,
  AuthExpiredError,
  AUTH_TOKENS_KEY,
  migrateAuthStorage,
  SCHEMA_KEY,
  authTimeFromIdToken,
  sessionStart,
} from "./auth";

function jwtWithExp(expSeconds: number): string {
  const payload = Buffer.from(JSON.stringify({ exp: expSeconds, email: "a@b.c" })).toString(
    "base64url",
  );
  return `eyJhbGciOiJub25lIn0.${payload}.sig`;
}

describe("createPkce", () => {
  it("builds an S256 challenge of at least 43 characters", async () => {
    const pkce = await createPkce();
    expect(pkce.verifier.length).toBeGreaterThanOrEqual(43);
    expect(pkce.challenge.length).toBeGreaterThanOrEqual(43);
    expect(pkce.challenge).not.toBe(pkce.verifier);
    expect(/^[A-Za-z0-9_-]+$/.test(pkce.challenge)).toBe(true);
  });
});

describe("parseAuthCallback", () => {
  it("reads code from the query and ignores hash routes", () => {
    expect(parseAuthCallback("?code=abc123", "#/read/sample-home")).toEqual({ code: "abc123" });
    expect(parseAuthCallback("?code=abc123&scope=openid", "#/")).toEqual({ code: "abc123" });
  });

  it("is a no-op when there is no code", () => {
    expect(parseAuthCallback("", "#/")).toBeNull();
    expect(parseAuthCallback("?", "#/read/foo")).toBeNull();
    expect(parseAuthCallback("", "#/?code=from-hash")).toBeNull();
    expect(parseAuthCallback("?error=access_denied", "#/")).toBeNull();
  });

  it("does not treat the hash as the query", () => {
    expect(parseAuthCallback("", "#/r/wiki/猫")).toBeNull();
    expect(stripAuthQuery("/", "#/read/sample-home")).toBe("/#/read/sample-home");
  });
});

describe("authorizeUrl", () => {
  it("points at the hosted UI with PKCE", () => {
    const url = authorizeUrl("http://localhost:5173", "challenge_value_here");
    expect(url.startsWith(`${AUTH_DOMAIN}/oauth2/authorize?`)).toBe(true);
    expect(url).toContain(`client_id=${AUTH_CLIENT_ID}`);
    expect(url).toContain("response_type=code");
    expect(url).toContain("code_challenge_method=S256");
    expect(url).toContain("redirect_uri=http%3A%2F%2Flocalhost%3A5173%2F");
  });
});

describe("ensureFreshAuth", () => {
  it("keeps tokens when the id token is still valid", async () => {
    const tokens = {
      accessToken: "a",
      idToken: jwtWithExp(Math.floor(Date.now() / 1000) + 3600),
      refreshToken: "r",
      email: "a@b.c",
    };
    const next = await ensureFreshAuth(tokens, async () => {
      throw new Error("should not refresh");
    });
    expect(next.idToken).toBe(tokens.idToken);
  });

  it("refreshes an expired id token", async () => {
    const fresh = jwtWithExp(Math.floor(Date.now() / 1000) + 3600);
    const tokens = {
      accessToken: "old",
      idToken: jwtWithExp(Math.floor(Date.now() / 1000) - 30),
      refreshToken: "r1",
      email: "a@b.c",
    };
    const next = await ensureFreshAuth(tokens, async (_url, init) => {
      const body = String(init?.body);
      expect(body).toContain("grant_type=refresh_token");
      expect(body).toContain("refresh_token=r1");
      expect(body).toContain(`client_id=${AUTH_CLIENT_ID}`);
      return new Response(JSON.stringify({ access_token: "new-a", id_token: fresh }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    expect(next.accessToken).toBe("new-a");
    expect(next.idToken).toBe(fresh);
    expect(next.refreshToken).toBe("r1");
  });

  const expired = () => ({
    accessToken: "old",
    idToken: jwtWithExp(Math.floor(Date.now() / 1000) - 30),
    refreshToken: "r1",
    email: "a@b.c",
  });

  it("reports a refused refresh (4xx) as signed out", async () => {
    await expect(
      ensureFreshAuth(expired(), async () => new Response('{"error":"invalid_grant"}', { status: 400 })),
    ).rejects.toBeInstanceOf(AuthExpiredError);
  });

  it("treats an expired token with nothing to refresh with as signed out", async () => {
    await expect(ensureFreshAuth({ ...expired(), refreshToken: undefined })).rejects.toBeInstanceOf(
      AuthExpiredError,
    );
  });

  it("keeps the sign-in on server trouble (5xx) or no network", async () => {
    const e5 = await ensureFreshAuth(expired(), async () => new Response("", { status: 503 })).catch((e) => e);
    expect(e5).not.toBeInstanceOf(AuthExpiredError);
    const net = await ensureFreshAuth(expired(), async () => {
      throw new TypeError("Failed to fetch");
    }).catch((e) => e);
    expect(net).not.toBeInstanceOf(AuthExpiredError);
  });
});

describe("session start", () => {
  it("prefers the local sign-in time, else the token's auth_time, and survives a refresh", async () => {
    const t = Math.floor(Date.now() / 1000);
    const id = (o: object) => `h.${Buffer.from(JSON.stringify({ exp: t + 3600, ...o })).toString("base64url")}.s`;
    expect(authTimeFromIdToken(id({ auth_time: 123 }))).toBe(123);
    expect(sessionStart({ accessToken: "a", idToken: id({ auth_time: 123 }), email: null })).toBe(123000);
    expect(sessionStart({ accessToken: "a", idToken: id({ auth_time: 123 }), email: null, signedInAt: 5 })).toBe(5);
    const old = { accessToken: "a", idToken: id({ exp: t - 30 }), refreshToken: "r", email: null, signedInAt: 77 };
    const next = await ensureFreshAuth(old, async () =>
      new Response(JSON.stringify({ access_token: "b", id_token: id({}) }), { status: 200 }),
    );
    expect(next.signedInAt).toBe(77);
  });
});

describe("migrateAuthStorage", () => {
  function fakeWindow(entries: Record<string, string>) {
    const mk = (init: Record<string, string>) => {
      const m = new Map(Object.entries(init));
      return {
        getItem: (k: string) => m.get(k) ?? null,
        setItem: (k: string, v: string) => void m.set(k, v),
        removeItem: (k: string) => void m.delete(k),
        map: m,
      };
    };
    const local = mk(entries);
    const session = mk({ "duki.sso.tried": "1" });
    (globalThis as unknown as { window: unknown }).window = {
      localStorage: local,
      sessionStorage: session,
      location: { hostname: "localhost" },
    };
    return { local, session };
  }

  it("keeps readable tokens exactly as they are", () => {
    const tokens = JSON.stringify({ accessToken: "a", idToken: "b", refreshToken: "r", email: "x@y.z" });
    const { local } = fakeWindow({ [AUTH_TOKENS_KEY]: tokens });
    migrateAuthStorage();
    expect(local.map.get(AUTH_TOKENS_KEY)).toBe(tokens);
    expect(local.map.get(SCHEMA_KEY)).toBe("1");
  });

  it("drops only an unreadable sign-in", () => {
    const { local, session } = fakeWindow({ [AUTH_TOKENS_KEY]: "{broken", "duki.other": "keep" });
    migrateAuthStorage();
    expect(local.map.has(AUTH_TOKENS_KEY)).toBe(false);
    expect(local.map.get("duki.other")).toBe("keep");
    expect(session.map.has("duki.sso.tried")).toBe(false);
  });
});

describe("subjectFromIdToken", () => {
  it("reads sub from the payload", () => {
    const payload = Buffer.from(JSON.stringify({ sub: "u-123", email: "a@b.c" })).toString(
      "base64url",
    );
    expect(subjectFromIdToken(`h.${payload}.s`)).toBe("u-123");
  });

  it("returns null for malformed tokens", () => {
    expect(subjectFromIdToken("nope")).toBeNull();
    expect(subjectFromIdToken("a.%%%.c")).toBeNull();
  });
});

describe("shared sign-in hint", () => {
  it("builds the shared-domain cookie only on chadmurchison.com hosts, with no token", () => {
    const on = signedInHintCookie("duki.chadmurchison.com", true);
    expect(on).toBe(
      "chadm_signed_in=1; Domain=.chadmurchison.com; Path=/; Secure; SameSite=Lax; Max-Age=2592000",
    );
    expect(signedInHintCookie("duki.chadmurchison.com", false)).toContain("Max-Age=0");
    expect(signedInHintCookie("localhost", true)).toBeNull();
    expect(signedInHintCookie("evilchadmurchison.com", true)).toBeNull();
  });

  it("reads the hint from document.cookie", () => {
    expect(hasSignedInHint("a=b; chadm_signed_in=1")).toBe(true);
    expect(hasSignedInHint("chadm_signed_in=")).toBe(false);
    expect(hasSignedInHint("")).toBe(false);
  });

  it("tries a silent sign-in only when signed out, hinted, online and not recently tried", () => {
    const base = { signedIn: false, callbackInUrl: false, hint: true, online: true, lastTriedAt: null, ssoAlive: true, now: 1e9 };
    expect(shouldTrySilentSignIn(base)).toBe(true);
    expect(shouldTrySilentSignIn({ ...base, signedIn: true })).toBe(false);
    expect(shouldTrySilentSignIn({ ...base, hint: false })).toBe(false);
    expect(shouldTrySilentSignIn({ ...base, online: false })).toBe(false);
    // past Cognito's 1-hour session a redirect would only show a password page: offer one tap instead
    expect(shouldTrySilentSignIn({ ...base, ssoAlive: false })).toBe(false);
    expect(shouldTrySilentSignIn({ ...base, callbackInUrl: true })).toBe(false);
    expect(shouldTrySilentSignIn({ ...base, lastTriedAt: 1e9 - 60_000 })).toBe(false);
    expect(shouldTrySilentSignIn({ ...base, lastTriedAt: 1e9 - 10 * 60_000 })).toBe(true);
  });

  it("points sign-up at the hosted UI /signup with the same PKCE params", () => {
    const url = new URL(signupUrl("https://duki.chadmurchison.com", "abc"));
    expect(url.origin + url.pathname).toBe(`${AUTH_DOMAIN}/signup`);
    expect(url.searchParams.get("client_id")).toBe(AUTH_CLIENT_ID);
    expect(url.searchParams.get("code_challenge")).toBe("abc");
  });
});
