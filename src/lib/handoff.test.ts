import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  APP_URLS,
  handoffUrl,
  IDP_URL,
  noneUrl,
  parseHandoff,
  pullUrl,
  readHandoff,
  readPullRequest,
  requestCode,
  safeRoute,
  shouldPull,
  signInWithCode,
  PULL_COOLDOWN_MS,
} from "../vendor/chadm-handoff.js";
import { markSignedIn, sharedSession, signedOutSince, ssoAlive } from "../vendor/chadm-session.js";
import { AUTH_CLIENT_ID, AUTH_TOKENS_KEY, ensureFreshAuth, hostedAuthTime, loadStoredAuth, tokensFromHandoff } from "./auth";

const CODE = "Abc_def-123456789012345678901234567890123"; // 43 chars, base64url
function jwt(claims: Record<string, unknown>): string {
  return `eyJhbGciOiJub25lIn0.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.sig`;
}
function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
function fakeLoc(href: string) {
  const u = new URL(href);
  return { hash: u.hash, pathname: u.pathname, search: u.search };
}

describe("handoff fragment", () => {
  it("round-trips code, username and a route", () => {
    const url = handoffUrl("duki", { code: CODE, username: "8b1c-uuid" }, "#/read/x%20y");
    expect(url.startsWith(APP_URLS.duki + "#sso=")).toBe(true);
    expect(parseHandoff(new URL(url).hash)).toEqual({ code: CODE, username: "8b1c-uuid", to: "#/read/x%20y" });
  });
  it("is null without #sso=, 'none' for none or junk", () => {
    expect(parseHandoff("#/read/1")).toBeNull();
    expect(parseHandoff("")).toBeNull();
    expect(parseHandoff("#sso=none")).toEqual({ none: true, to: "" });
    expect(parseHandoff("#sso=short&u=x")).toEqual({ none: true, to: "" });
    expect(parseHandoff(`#sso=${CODE}`)).toEqual({ none: true, to: "" }); // no username
    expect(parseHandoff(`#sso=${CODE}<script>&u=x`)).toEqual({ none: true, to: "" });
  });
  it("only accepts in-app #/ routes", () => {
    expect(safeRoute("#/stats")).toBe("#/stats");
    expect(safeRoute("https://evil.example/")).toBe("");
    expect(safeRoute("#javascript:alert(1)")).toBe("");
    expect(safeRoute("#/" + "a".repeat(400))).toBe("");
    expect(noneUrl("library", "//evil")).toBe(APP_URLS.library + "#sso=none");
  });
  it("readHandoff clears the fragment at once and restores the route", () => {
    const replaceState = vi.fn();
    const h = readHandoff(fakeLoc(handoffUrl("duki", { code: CODE, username: "u" }, "#/stats")), { replaceState });
    expect(h).toEqual({ code: CODE, username: "u", to: "#/stats" });
    expect(replaceState).toHaveBeenCalledWith(null, "", "/#/stats");
    const untouched = vi.fn();
    expect(readHandoff(fakeLoc("https://duki.chadmurchison.com/#/read/1"), { replaceState: untouched })).toBeNull();
    expect(untouched).not.toHaveBeenCalled();
  });
});

describe("pull request", () => {
  it("goes to the peer with a fixed return app", () => {
    expect(pullUrl("duki", "#/read/7")).toBe("https://library.chadmurchison.com/?sso_for=duki#/read/7");
    expect(pullUrl("library", "#evil")).toBe("https://duki.chadmurchison.com/?sso_for=library");
  });
  it("is answered only for the peer app, and always stripped", () => {
    const replaceState = vi.fn();
    expect(readPullRequest("duki", fakeLoc("https://duki.chadmurchison.com/?sso_for=library&x=1#/stats"), { replaceState })).toEqual({
      app: "library",
      to: "#/stats",
    });
    expect(replaceState).toHaveBeenCalledWith(null, "", "/?x=1#/stats");
    const r2 = vi.fn();
    expect(readPullRequest("duki", fakeLoc("https://duki.chadmurchison.com/?sso_for=evil"), { replaceState: r2 })).toBeNull();
    expect(r2).toHaveBeenCalledWith(null, "", "/");
    expect(readPullRequest("duki", fakeLoc("https://duki.chadmurchison.com/"), { replaceState: vi.fn() })).toBeNull();
  });
  it("happens only signed out, with the hint, online, not in progress, not lately", () => {
    const base = { signedIn: false, hint: true, online: true, inProgress: false, lastTriedAt: 0, now: 1e12 };
    expect(shouldPull(base)).toBe(true);
    expect(shouldPull({ ...base, signedIn: true })).toBe(false);
    expect(shouldPull({ ...base, hint: false })).toBe(false);
    expect(shouldPull({ ...base, online: false })).toBe(false);
    expect(shouldPull({ ...base, inProgress: true })).toBe(false);
    expect(shouldPull({ ...base, lastTriedAt: 1e12 - 1000 })).toBe(false);
    expect(shouldPull({ ...base, lastTriedAt: 1e12 - PULL_COOLDOWN_MS - 1 })).toBe(true);
  });
});

describe("requestCode", () => {
  it("POSTs /sso/code with the ID token", async () => {
    const fetchImpl = vi.fn(async () => json(200, { code: CODE, username: "u", app: "library", expiresIn: 60 }));
    const out = await requestCode({ apiUrl: "https://api.test/", idToken: "ID", fetchImpl });
    expect(out.code).toBe(CODE);
    expect(fetchImpl).toHaveBeenCalledWith("https://api.test/sso/code", {
      method: "POST",
      headers: { Authorization: "Bearer ID" },
    });
  });
  it("throws on refusal or a malformed answer", async () => {
    await expect(requestCode({ apiUrl: "https://a", idToken: "x", fetchImpl: async () => json(401, {}) })).rejects.toThrow(/401/);
    await expect(requestCode({ apiUrl: "https://a", idToken: "x", fetchImpl: async () => json(200, { code: 1 }) })).rejects.toThrow();
  });
});

describe("signInWithCode (Cognito CUSTOM_AUTH)", () => {
  it("InitiateAuth then RespondToAuthChallenge with the code", async () => {
    const calls: { target: string; body: Record<string, unknown> }[] = [];
    const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
      expect(url).toBe(IDP_URL);
      const headers = init.headers as Record<string, string>;
      expect(headers["Content-Type"]).toBe("application/x-amz-json-1.1");
      const target = headers["X-Amz-Target"];
      calls.push({ target, body: JSON.parse(String(init.body)) });
      if (target.endsWith("InitiateAuth"))
        return json(200, { ChallengeName: "CUSTOM_CHALLENGE", Session: "S1", ChallengeParameters: { USERNAME: "u" } });
      return json(200, { AuthenticationResult: { IdToken: "I", AccessToken: "A", RefreshToken: "R", ExpiresIn: 3600 } });
    });
    const out = await signInWithCode({ clientId: AUTH_CLIENT_ID, username: "u", code: CODE, fetchImpl: fetchImpl as never });
    expect(out).toEqual({ idToken: "I", accessToken: "A", refreshToken: "R", expiresIn: 3600 });
    expect(calls[0]).toEqual({
      target: "AWSCognitoIdentityProviderService.InitiateAuth",
      body: { AuthFlow: "CUSTOM_AUTH", ClientId: AUTH_CLIENT_ID, AuthParameters: { USERNAME: "u" } },
    });
    expect(calls[1]).toEqual({
      target: "AWSCognitoIdentityProviderService.RespondToAuthChallenge",
      body: {
        ChallengeName: "CUSTOM_CHALLENGE",
        ClientId: AUTH_CLIENT_ID,
        Session: "S1",
        ChallengeResponses: { USERNAME: "u", ANSWER: CODE },
      },
    });
  });
  it("throws when the code is refused (wrong, used or expired)", async () => {
    const fetchImpl = async (_u: string, init: RequestInit) =>
      String((init.headers as Record<string, string>)["X-Amz-Target"]).endsWith("InitiateAuth")
        ? json(200, { ChallengeName: "CUSTOM_CHALLENGE", Session: "S" })
        : json(400, { __type: "NotAuthorizedException", message: "Incorrect username or password." });
    await expect(signInWithCode({ clientId: "c", username: "u", code: CODE, fetchImpl: fetchImpl as never })).rejects.toMatchObject({
      code: "NotAuthorizedException",
    });
  });
});

describe("handoff tokens in Duki", () => {
  it("are marked via sso, keep it through refresh, and report no hosted auth time", async () => {
    const id = jwt({ sub: "s", email: "a@b.c", auth_time: 1_900_000_000, exp: 1 });
    const t = tokensFromHandoff({ idToken: id, accessToken: "A", refreshToken: "R" }, 123);
    expect(t).toMatchObject({ email: "a@b.c", signedInAt: 123, via: "sso", refreshToken: "R" });
    expect(hostedAuthTime(t)).toBe(0);
    expect(hostedAuthTime({ ...t, via: undefined })).toBe(1_900_000_000);
    const fresh = jwt({ sub: "s", email: "a@b.c", exp: Math.floor(Date.now() / 1000) + 3600 });
    const fetchImpl = async () => json(200, { access_token: "A2", id_token: fresh });
    const next = await ensureFreshAuth(t, fetchImpl as never);
    expect(next).toMatchObject({ accessToken: "A2", refreshToken: "R", signedInAt: 123, via: "sso" });
  });
});

describe("shared cookies with a handoff sign-in (chadm-session.js)", () => {
  let jar: Record<string, string>;
  beforeEach(() => {
    jar = {};
    const store = new Map<string, string>();
    vi.stubGlobal("location", { hostname: "duki.chadmurchison.com" });
    vi.stubGlobal("document", {
      get cookie() {
        return Object.entries(jar).map(([k, v]) => `${k}=${v}`).join("; ");
      },
      set cookie(v: string) {
        const [pair] = v.split(";");
        const i = pair.indexOf("=");
        const name = pair.slice(0, i);
        if (/Max-Age=0\b/.test(v)) delete jar[name];
        else jar[name] = pair.slice(i + 1);
      },
    });
    vi.stubGlobal("window", { localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) } });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("sets the hint but never promises a silent sign-in", () => {
    const t = tokensFromHandoff({ idToken: jwt({ sub: "s", email: "a@b.c", auth_time: Math.floor(Date.now() / 1000) }), accessToken: "A" });
    markSignedIn({ email: t.email ?? undefined, authTime: hostedAuthTime(t) });
    const s = sharedSession();
    expect(s.signedIn).toBe(true);
    expect(s.email).toBe("a@b.c");
    expect(s.ssoUntil).toBe(0);
    expect(ssoAlive(s)).toBe(false);
  });
  it("keeps an earlier real ssoUntil (only ever raised)", () => {
    const authTime = Math.floor(Date.now() / 1000) - 60;
    markSignedIn({ email: "a@b.c", authTime });
    const before = sharedSession().ssoUntil;
    markSignedIn({ email: "a@b.c", authTime: 0 });
    expect(sharedSession().ssoUntil).toBe(before);
    expect(ssoAlive()).toBe(true);
  });
  it("a later Sign out anywhere still ends a handoff session", () => {
    const t = tokensFromHandoff({ idToken: jwt({ sub: "s" }), accessToken: "A" }, 1000);
    jar.chadm_signout_at = "2000";
    expect(signedOutSince(t.signedInAt)).toBe(true);
    jar.chadm_signout_at = "500";
    expect(signedOutSince(t.signedInAt)).toBe(false);
  });
  it("stored handoff tokens load back with via", () => {
    const t = tokensFromHandoff({ idToken: jwt({ sub: "s", email: "a@b.c" }), accessToken: "A" }, 5);
    window.localStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(t));
    expect(loadStoredAuth()).toMatchObject({ via: "sso", signedInAt: 5 });
  });
});

describe("Duki answering the library (lib/handoff.ts)", () => {
  let store: Map<string, string>;
  let replaced: string[];
  function setup(href: string, cookie = "") {
    store = new Map();
    replaced = [];
    const u = new URL(href);
    vi.stubGlobal("location", { hostname: u.hostname, hash: u.hash, pathname: u.pathname, search: u.search });
    vi.stubGlobal("history", { replaceState: (_s: unknown, _t: string, url: string) => replaced.push(url) });
    vi.stubGlobal("document", { cookie });
    vi.stubGlobal("window", {
      localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) },
    });
    vi.stubEnv("VITE_DUKI_API", "https://duki-api.test");
  }
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
  const fresh = () => jwt({ sub: "s", email: "a@b.c", exp: Math.floor(Date.now() / 1000) + 3600 });

  it("ignores a normal page load", async () => {
    setup("https://duki.chadmurchison.com/#/stats");
    const { answerPullRequest } = await import("./handoff");
    expect(await answerPullRequest(vi.fn() as never)).toBeNull();
  });
  it("signed out here: sends the library back with #sso=none", async () => {
    setup("https://duki.chadmurchison.com/?sso_for=library#/book/x");
    const { answerPullRequest } = await import("./handoff");
    expect(await answerPullRequest(vi.fn() as never)).toBe("https://library.chadmurchison.com/#sso=none&to=%23%2Fbook%2Fx");
  });
  it("signed in here: gets a code from Duki's API for the library", async () => {
    setup("https://duki.chadmurchison.com/?sso_for=library");
    store.set(AUTH_TOKENS_KEY, JSON.stringify({ accessToken: "A", idToken: fresh(), email: "a@b.c", signedInAt: 10 }));
    const fetchImpl = vi.fn(async () => json(200, { code: CODE, username: "u", app: "library" }));
    const { answerPullRequest } = await import("./handoff");
    const url = await answerPullRequest(fetchImpl as never);
    expect(fetchImpl).toHaveBeenCalledWith("https://duki-api.test/sso/code", expect.objectContaining({ method: "POST" }));
    expect(url).toBe(`https://library.chadmurchison.com/#sso=${CODE}&u=u`);
  });
  it("signed out elsewhere since this session began: no code", async () => {
    setup("https://duki.chadmurchison.com/?sso_for=library", "chadm_signout_at=20");
    store.set(AUTH_TOKENS_KEY, JSON.stringify({ accessToken: "A", idToken: fresh(), email: "a@b.c", signedInAt: 10 }));
    const fetchImpl = vi.fn();
    const { answerPullRequest } = await import("./handoff");
    expect(await answerPullRequest(fetchImpl as never)).toBe("https://library.chadmurchison.com/#sso=none");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  it("API refusal falls back to #sso=none", async () => {
    setup("https://duki.chadmurchison.com/?sso_for=library");
    store.set(AUTH_TOKENS_KEY, JSON.stringify({ accessToken: "A", idToken: fresh(), email: "a@b.c" }));
    const { answerPullRequest } = await import("./handoff");
    expect(await answerPullRequest((async () => json(500, {})) as never)).toBe("https://library.chadmurchison.com/#sso=none");
  });
  it("tray: no URL when signed out or no API", async () => {
    setup("https://duki.chadmurchison.com/");
    const { libraryHandoffUrl } = await import("./handoff");
    expect(await libraryHandoffUrl(null)).toBeNull();
    expect(await libraryHandoffUrl({ accessToken: "A", idToken: fresh(), email: null }, "", { apiUrl: "" })).toBeNull();
  });
  it("signInWithHandoff stores via-sso tokens", async () => {
    setup("https://duki.chadmurchison.com/");
    const id = jwt({ sub: "s", email: "a@b.c" });
    const fetchImpl = async (_u: string, init: RequestInit) =>
      String((init.headers as Record<string, string>)["X-Amz-Target"]).endsWith("InitiateAuth")
        ? json(200, { ChallengeName: "CUSTOM_CHALLENGE", Session: "S" })
        : json(200, { AuthenticationResult: { IdToken: id, AccessToken: "A", RefreshToken: "R" } });
    const { signInWithHandoff } = await import("./handoff");
    const t = await signInWithHandoff({ code: CODE, username: "u" }, fetchImpl as never, 77);
    expect(t).toMatchObject({ via: "sso", signedInAt: 77, email: "a@b.c" });
    expect(JSON.parse(store.get(AUTH_TOKENS_KEY)!)).toMatchObject({ via: "sso", refreshToken: "R" });
  });
});
