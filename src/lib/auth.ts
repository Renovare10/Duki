export const AUTH_DOMAIN = "https://accounts.chadmurchison.com";
export const AUTH_CLIENT_ID = "34crk50b2obng6cdgh2mhp029s";
export const AUTH_SCOPES = "openid email profile";
export const PKCE_VERIFIER_KEY = "duki.pkce.verifier";
export const AUTH_TOKENS_KEY = "duki.auth.tokens";

export type AuthTokens = {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  email: string | null;
  /** When this sign-in happened here (ms); kept through refreshes. Older stored tokens lack it. */
  signedInAt?: number;
};

export function authRedirectUri(origin: string): string {
  return `${origin.replace(/\/$/, "")}/`;
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const byte of bytes) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function createPkce(): Promise<{ verifier: string; challenge: string }> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const verifier = bytesToBase64Url(bytes);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  const challenge = bytesToBase64Url(new Uint8Array(digest));
  return { verifier, challenge };
}

export function authorizeUrl(origin: string, challenge: string, loginHint?: string | null): string {
  const params = new URLSearchParams({
    ...(loginHint ? { login_hint: loginHint } : {}),
    client_id: AUTH_CLIENT_ID,
    response_type: "code",
    scope: AUTH_SCOPES,
    redirect_uri: authRedirectUri(origin),
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  return `${AUTH_DOMAIN}/oauth2/authorize?${params.toString()}`;
}

/** Hosted UI sign-up page (self sign-up is enabled on the shared pool). Same PKCE flow as sign-in. */
export function signupUrl(origin: string, challenge: string, _loginHint?: string | null): string {
  void _loginHint;
  return authorizeUrl(origin, challenge).replace("/oauth2/authorize?", "/signup?");
}

// ---------------------------------------------------------------- shared sign-in hint
// A non-secret cookie shared by the chadmurchison.com apps: "someone signed in on this browser".
// It carries no token. When it is present and this app is signed out, we do one top-level redirect
// to /oauth2/authorize; Cognito's own session cookie then returns a code without a password.
export const SIGNED_IN_HINT_COOKIE = "chadm_signed_in";
export const SILENT_SIGNIN_KEY = "duki.sso.tried";
export const SILENT_SIGNIN_COOLDOWN_MS = 5 * 60_000;
const HINT_DOMAIN = "chadmurchison.com";
const HINT_MAX_AGE_S = 30 * 24 * 3600;

/** Cookie string to set (`on`) or clear the hint; null when not on a chadmurchison.com host. */
export function signedInHintCookie(hostname: string, on: boolean): string | null {
  if (hostname !== HINT_DOMAIN && !hostname.endsWith("." + HINT_DOMAIN)) return null;
  return `${SIGNED_IN_HINT_COOKIE}=${on ? "1" : ""}; Domain=.${HINT_DOMAIN}; Path=/; Secure; SameSite=Lax; Max-Age=${on ? HINT_MAX_AGE_S : 0}`;
}

export function hasSignedInHint(cookie: string): boolean {
  return cookie.split(/;\s*/).some((c) => c === `${SIGNED_IN_HINT_COOKIE}=1`);
}

export function setSignedInHint(on: boolean): void {
  const c = signedInHintCookie(window.location.hostname, on);
  if (c) document.cookie = c;
}

/** Try a silent sign-in? Only when signed out here, the hint exists, online, and not tried recently. */
export function shouldTrySilentSignIn(opts: {
  signedIn: boolean;
  callbackInUrl: boolean;
  hint: boolean;
  online: boolean;
  lastTriedAt: number | null;
  /** Cognito's session can still sign in without a password (chadm_sso_until, see docs/SSO.md). */
  ssoAlive: boolean;
  now?: number;
}): boolean {
  const now = opts.now ?? Date.now();
  if (opts.signedIn || opts.callbackInUrl || !opts.hint || !opts.online || !opts.ssoAlive) return false;
  return opts.lastTriedAt == null || now - opts.lastTriedAt > SILENT_SIGNIN_COOLDOWN_MS;
}

export function logoutUrl(origin: string): string {
  const params = new URLSearchParams({
    client_id: AUTH_CLIENT_ID,
    logout_uri: authRedirectUri(origin),
  });
  return `${AUTH_DOMAIN}/logout?${params.toString()}`;
}

export function tokenUrl(): string {
  return `${AUTH_DOMAIN}/oauth2/token`;
}

/** Reads `?code=` from the query. Hash routes (`#/read/…`) are ignored. No code → no-op. */
export function parseAuthCallback(search: string, hash = ""): { code: string } | null {
  void hash;
  const query = (search.startsWith("?") ? search.slice(1) : search).split("#")[0];
  if (!query) return null;
  const code = new URLSearchParams(query).get("code");
  if (!code) return null;
  return { code };
}

/** UI hint only. The API must verify the signed token and this claim itself. */
export function emailVerifiedFromIdToken(idToken: string): boolean {
  try {
    return JSON.parse(base64UrlToJson(idToken.split(".")[1] ?? "")).email_verified === true;
  } catch {
    return false;
  }
}

export function emailFromIdToken(idToken: string): string | null {
  const parts = idToken.split(".");
  if (parts.length < 2) return null;
  try {
    const json = JSON.parse(base64UrlToJson(parts[1])) as { email?: string };
    return typeof json.email === "string" && json.email ? json.email : null;
  } catch {
    return null;
  }
}

/** The ID token's auth_time (s): when the user last typed their password. 0 if missing. */
export function authTimeFromIdToken(idToken: string): number {
  const parts = idToken.split(".");
  if (parts.length < 2) return 0;
  try {
    const json = JSON.parse(base64UrlToJson(parts[1])) as { auth_time?: number };
    return typeof json.auth_time === "number" ? json.auth_time : 0;
  } catch {
    return 0;
  }
}

/** When this device's session began (ms): sign-in time, else auth_time. */
export function sessionStart(tokens: AuthTokens): number {
  return tokens.signedInAt ?? authTimeFromIdToken(tokens.idToken) * 1000;
}

/** Cognito `sub` (stable per account). Used only as a local cache key, never trusted. */
export function subjectFromIdToken(idToken: string): string | null {
  const parts = idToken.split(".");
  if (parts.length < 2) return null;
  try {
    const json = JSON.parse(base64UrlToJson(parts[1])) as { sub?: string };
    return typeof json.sub === "string" && json.sub ? json.sub : null;
  } catch {
    return null;
  }
}

function base64UrlToJson(part: string): string {
  const padded = part.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((part.length + 3) % 4);
  return atob(padded);
}

export function loadStoredAuth(): AuthTokens | null {
  try {
    const raw = window.localStorage.getItem(AUTH_TOKENS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthTokens>;
    if (typeof parsed.accessToken !== "string" || typeof parsed.idToken !== "string") return null;
    return {
      accessToken: parsed.accessToken,
      idToken: parsed.idToken,
      refreshToken: typeof parsed.refreshToken === "string" ? parsed.refreshToken : undefined,
      email: typeof parsed.email === "string" ? parsed.email : emailFromIdToken(parsed.idToken),
      ...(typeof parsed.signedInAt === "number" ? { signedInAt: parsed.signedInAt } : {}),
    };
  } catch {
    return null;
  }
}

export function storeAuth(tokens: AuthTokens): void {
  window.localStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens));
}

export function clearAuth(): void {
  window.localStorage.removeItem(AUTH_TOKENS_KEY);
  window.sessionStorage.removeItem(PKCE_VERIFIER_KEY);
}

export function stripAuthQuery(pathname: string, hash: string): string {
  return `${pathname}${hash || ""}`;
}

export async function exchangeAuthCode(
  code: string,
  verifier: string,
  origin: string,
  fetchImpl: typeof fetch = fetch,
): Promise<AuthTokens> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: AUTH_CLIENT_ID,
    code,
    redirect_uri: authRedirectUri(origin),
    code_verifier: verifier,
  });
  const res = await fetchImpl(tokenUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error("Sign in did not complete.");
  const json = (await res.json()) as {
    access_token?: string;
    id_token?: string;
    refresh_token?: string;
  };
  if (!json.access_token || !json.id_token) throw new Error("Sign in did not complete.");
  return {
    accessToken: json.access_token,
    idToken: json.id_token,
    refreshToken: json.refresh_token,
    email: emailFromIdToken(json.id_token),
  };
}

const REFRESH_SKEW_MS = 60_000;

/** The account server said no (refresh token expired/revoked): this device is signed out. */
export class AuthExpiredError extends Error {
  constructor() {
    super("Sign in expired.");
    this.name = "AuthExpiredError";
  }
}

/** Anything stored under the token key (even unreadable): Sign out must stay reachable. */
export function hasStoredAuthKey(): boolean {
  try {
    return window.localStorage.getItem(AUTH_TOKENS_KEY) != null;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------- storage schema
// Bump when the stored shape changes. Upgrading only drops a sign-in it can't read (and its
// hint cookie); texts, words, sessions and settings in IndexedDB are never touched. Readable
// tokens stay exactly where they are.
export const STORAGE_SCHEMA = 1;
export const SCHEMA_KEY = "duki.schema";
export function migrateAuthStorage(): void {
  try {
    const from = Number(window.localStorage.getItem(SCHEMA_KEY)) || 0;
    if (from >= STORAGE_SCHEMA) return;
    if (hasStoredAuthKey() && !loadStoredAuth()) {
      window.localStorage.removeItem(AUTH_TOKENS_KEY);
      setSignedInHint(false);
    }
    window.sessionStorage.removeItem(SILENT_SIGNIN_KEY);
    window.localStorage.setItem(SCHEMA_KEY, String(STORAGE_SCHEMA));
  } catch {
    /* storage blocked: nothing to migrate */
  }
}

export function idTokenExpiresAt(idToken: string): number | null {
  const parts = idToken.split(".");
  if (parts.length < 2) return null;
  try {
    const json = JSON.parse(base64UrlToJson(parts[1])) as { exp?: number };
    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function idTokenIsFresh(idToken: string, now = Date.now(), skewMs = REFRESH_SKEW_MS): boolean {
  const exp = idTokenExpiresAt(idToken);
  return exp != null && exp - skewMs > now;
}

export async function refreshSession(
  refreshToken: string,
  fetchImpl: typeof fetch = fetch,
): Promise<AuthTokens> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: AUTH_CLIENT_ID,
    refresh_token: refreshToken,
  });
  const res = await fetchImpl(tokenUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  // 4xx = refused (expired / revoked): signed out. 5xx = server trouble: try again later.
  if (res.status >= 400 && res.status < 500) throw new AuthExpiredError();
  if (!res.ok) throw new Error(`Token refresh failed (${res.status}).`);
  const json = (await res.json()) as {
    access_token?: string;
    id_token?: string;
    refresh_token?: string;
  };
  if (!json.access_token || !json.id_token) throw new AuthExpiredError();
  return {
    accessToken: json.access_token,
    idToken: json.id_token,
    refreshToken: json.refresh_token || refreshToken,
    email: emailFromIdToken(json.id_token),
  };
}

export async function ensureFreshAuth(
  tokens: AuthTokens,
  fetchImpl: typeof fetch = fetch,
  now = Date.now(),
): Promise<AuthTokens> {
  if (idTokenIsFresh(tokens.idToken, now)) return tokens;
  if (!tokens.refreshToken) throw new AuthExpiredError();
  const next = await refreshSession(tokens.refreshToken, fetchImpl);
  return tokens.signedInAt ? { ...next, signedInAt: tokens.signedInAt } : next;
}
