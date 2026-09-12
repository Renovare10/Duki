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

export function authorizeUrl(origin: string, challenge: string): string {
  const params = new URLSearchParams({
    client_id: AUTH_CLIENT_ID,
    response_type: "code",
    scope: AUTH_SCOPES,
    redirect_uri: authRedirectUri(origin),
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  return `${AUTH_DOMAIN}/oauth2/authorize?${params.toString()}`;
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
