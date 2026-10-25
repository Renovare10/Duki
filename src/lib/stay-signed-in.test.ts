import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthExpiredError, ensureFreshAuth, forceRefresh } from "./auth";
import { DEFAULT_SETTINGS } from "./db";
import { packSnapshot, pullSnapshotWithTag, pushSnapshot, SignInExpiredError } from "./sync";
import { markSignedIn, markSignedOut, sharedSession } from "../vendor/chadm-session.js";

function jwt(claims: Record<string, unknown>): string {
  return `eyJhbGciOiJub25lIn0.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.sig`;
}
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const fresh = () => jwt({ sub: "s", email: "a@b.c", email_verified: true, exp: Math.floor(Date.now() / 1000) + 3600 });

describe("silent refresh keeps the session", () => {
  it("forceRefresh refreshes a fresh-looking token and keeps signedInAt and via", async () => {
    const fetchImpl = vi.fn(async () => json(200, { access_token: "A2", id_token: fresh() }));
    const t = { accessToken: "A", idToken: fresh(), refreshToken: "R", email: "a@b.c", signedInAt: 5, via: "sso" as const };
    const next = await forceRefresh(t, fetchImpl as never);
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(next).toMatchObject({ accessToken: "A2", refreshToken: "R", signedInAt: 5, via: "sso" });
  });
  it("a refused refresh is AuthExpiredError; no refresh token too", async () => {
    const stale = { accessToken: "A", idToken: jwt({ sub: "s", exp: 1 }), refreshToken: "R", email: null };
    await expect(ensureFreshAuth(stale, (async () => json(400, { error: "invalid_grant" })) as never)).rejects.toBeInstanceOf(AuthExpiredError);
    await expect(forceRefresh({ ...stale, refreshToken: undefined })).rejects.toBeInstanceOf(AuthExpiredError);
  });
  it("a server hiccup (5xx) is not a sign-out", async () => {
    const stale = { accessToken: "A", idToken: jwt({ sub: "s", exp: 1 }), refreshToken: "R", email: null };
    const err = await ensureFreshAuth(stale, (async () => json(503, {})) as never).catch((e) => e);
    expect(err).not.toBeInstanceOf(AuthExpiredError);
  });
});

describe("API 401 is a typed SignInExpiredError (so the app refreshes once and retries)", () => {
  beforeEach(() => vi.stubEnv("VITE_DUKI_API", "https://api.test"));
  afterEach(() => vi.unstubAllEnvs());
  it("on GET /me", async () => {
    const err = await pullSnapshotWithTag("x", (async () => json(401, {})) as never).catch((e) => e);
    expect(err).toBeInstanceOf(SignInExpiredError);
    expect(err.message).toBe("Sign in expired.");
  });
  it("on PUT /me", async () => {
    const snap = packSnapshot({ words: [], texts: [], sessions: [], settings: DEFAULT_SETTINGS });
    const err = await pushSnapshot(fresh(), snap, (async () => json(401, {})) as never).catch((e) => e);
    expect(err).toBeInstanceOf(SignInExpiredError);
  });
});

describe("shared cookies are persistent, not session cookies", () => {
  let writes: string[];
  let jar: Record<string, string>;
  beforeEach(() => {
    writes = [];
    jar = {};
    vi.stubGlobal("location", { hostname: "duki.chadmurchison.com" });
    vi.stubGlobal("document", {
      get cookie() {
        return Object.entries(jar).map(([k, v]) => `${k}=${v}`).join("; ");
      },
      set cookie(v: string) {
        writes.push(v);
        const [pair] = v.split(";");
        const i = pair.indexOf("=");
        if (/Max-Age=0\b/.test(v)) delete jar[pair.slice(0, i)];
        else jar[pair.slice(0, i)] = pair.slice(i + 1);
      },
    });
  });
  afterEach(() => vi.unstubAllGlobals());
  const maxAge = (name: string) => Number(/Max-Age=(\d+)/.exec(writes.filter((w) => w.startsWith(name + "=")).pop() ?? "")?.[1]);

  it("hint and user last 30 days (renewed on each signed-in load); sso_until too", () => {
    markSignedIn({ email: "a@b.c", authTime: Math.floor(Date.now() / 1000) });
    expect(maxAge("chadm_signed_in")).toBe(30 * 86400);
    expect(maxAge("chadm_user")).toBe(30 * 86400);
    expect(maxAge("chadm_sso_until")).toBe(30 * 86400);
    expect(writes.every((w) => /Max-Age=\d+/.test(w) && /Domain=\.chadmurchison\.com/.test(w) && /Secure/.test(w))).toBe(true);
  });
  it("Sign out everywhere clears the hint and leaves a 400-day sign-out marker", () => {
    markSignedIn({ email: "a@b.c" });
    markSignedOut({ everywhere: true });
    expect(sharedSession().signedIn).toBe(false);
    expect(sharedSession().email).toBeNull();
    expect(sharedSession().signoutAt).toBeGreaterThan(0);
    expect(maxAge("chadm_signout_at")).toBe(400 * 86400);
  });
});
