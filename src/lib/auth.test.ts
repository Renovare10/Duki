import { describe, expect, it } from "vitest";
import {
  AUTH_CLIENT_ID,
  AUTH_DOMAIN,
  authorizeUrl,
  createPkce,
  parseAuthCallback,
  stripAuthQuery,
} from "./auth";

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
