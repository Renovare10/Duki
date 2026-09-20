import { describe, expect, it } from "vitest";
import {
  AUTH_CLIENT_ID,
  AUTH_DOMAIN,
  authorizeUrl,
  createPkce,
  ensureFreshAuth,
  parseAuthCallback,
  stripAuthQuery,
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
});
