// chadm-handoff.js: one-time sign-in handoff between the chadmurchison.com apps (docs/SSO.md,
// "One-time handoff code via Cognito custom auth"). Same file in the library (js/) and Duki
// (src/vendor/). No dependencies, no tokens stored here.
//
// PUSH (app tray): signed-in app A -> POST <A's API>/sso/code (A's ID token) -> { code, username }
//   -> open app B at  https://<B>/#sso=<code>&u=<username>[&to=<#/route>]
// B reads the fragment at startup (readHandoff), clears it at once, then
//   Cognito InitiateAuth(CUSTOM_AUTH, USERNAME) + RespondToAuthChallenge(ANSWER = code) -> B's own tokens.
// PULL (arriving signed out, e.g. from the main site's tray or a bookmark, while the shared cookie
// says someone is signed in): B goes to  https://<A>/?sso_for=<B>[#<route>]. A, if signed in, sends a
// code back as above; otherwise it returns  https://<B>/#sso=none  and B shows "Continue as".
//
// The code is single use, valid 60 s, bound to the user and to B's client id (checked by the
// pool's verify trigger), and only ever travels in a URL fragment (never sent to a server).

export const REGION = 'us-east-2';
export const IDP_URL = `https://cognito-idp.${REGION}.amazonaws.com/`;
export const APP_URLS = Object.freeze({
  library: 'https://library.chadmurchison.com/',
  duki: 'https://duki.chadmurchison.com/',
});
export const PEER = Object.freeze({ library: 'duki', duki: 'library' });
const PULL_KEY = 'chadm.sso.pull';          // sessionStorage: last pull attempt (ms), no loops
export const PULL_COOLDOWN_MS = 5 * 60_000;

/** A safe in-app hash route to restore after a handoff ('#/…', short), else ''. */
export function safeRoute(to) {
  return typeof to === 'string' && /^#\/[\w\-./%~!$&'()*+,;=:@?]*$/.test(to) && to.length <= 300 ? to : '';
}

/** https://<app>/#sso=<code>&u=<username>[&to=<route>] */
export function handoffUrl(app, { code, username }, to = '') {
  const base = APP_URLS[app];
  if (!base || !code || !username) throw new Error('bad handoff');
  const p = new URLSearchParams({ sso: code, u: username });
  const route = safeRoute(to);
  if (route) p.set('to', route);
  return `${base}#${p.toString()}`;
}

/** https://<app>/#sso=none[&to=<route>]: the peer could not hand off (signed out there). */
export function noneUrl(app, to = '') {
  const p = new URLSearchParams({ sso: 'none' });
  const route = safeRoute(to);
  if (route) p.set('to', route);
  return `${APP_URLS[app]}#${p.toString()}`;
}

/** Parse a handoff fragment. { code, username, to } | { none: true, to } | null. Pure. */
export function parseHandoff(hash) {
  const h = String(hash || '').replace(/^#/, '');
  if (!/^sso=/.test(h)) return null;
  const p = new URLSearchParams(h);
  const sso = p.get('sso') || '';
  const to = safeRoute(p.get('to') || '');
  if (sso === 'none') return { none: true, to };
  const username = p.get('u') || '';
  if (sso.length < 20 || sso.length > 200 || !/^[\w-]+$/.test(sso) || !username || username.length > 128) return { none: true, to };
  return { code: sso, username, to };
}

/** Read and IMMEDIATELY clear a handoff fragment (the route, if any, is put back). */
export function readHandoff(loc = location, hist = history) {
  const h = parseHandoff(loc.hash);
  if (h) hist.replaceState(null, '', loc.pathname + loc.search + (h.to || ''));
  return h;
}

/** ?sso_for=<app> on this page: the other app asks for a code. Returns that app id (and strips it), else null. */
export function readPullRequest(self, loc = location, hist = history) {
  const params = new URLSearchParams(loc.search);
  const forApp = params.get('sso_for');
  if (!forApp) return null;
  params.delete('sso_for');
  const q = params.toString();
  hist.replaceState(null, '', loc.pathname + (q ? `?${q}` : '') + loc.hash);
  return forApp === PEER[self] ? { app: forApp, to: safeRoute(loc.hash) } : null;
}

/** https://<peer>/?sso_for=<self>[#route] */
export function pullUrl(self, route = '') {
  const peer = PEER[self];
  return `${APP_URLS[peer]}?sso_for=${encodeURIComponent(self)}${safeRoute(route)}`;
}

/** Should this app ask its peer for a code? Signed out here, the shared cookie says signed in, not tried lately. */
export function shouldPull({ signedIn, hint, online, inProgress, lastTriedAt, now = Date.now() }) {
  if (signedIn || !hint || !online || inProgress) return false;
  return !lastTriedAt || now - lastTriedAt > PULL_COOLDOWN_MS;
}
export function lastPullAt(store = sessionStorage) { try { return Number(store.getItem(PULL_KEY)) || 0; } catch { return 0; } }
export function markPulled(now = Date.now(), store = sessionStorage) { try { store.setItem(PULL_KEY, String(now)); } catch { /* ignore */ } }

/** POST <apiUrl>/sso/code with this app's ID token -> { code, username, app }. Throws on failure. */
export async function requestCode({ apiUrl, idToken, fetchImpl = fetch }) {
  const res = await fetchImpl(`${String(apiUrl).replace(/\/+$/, '')}/sso/code`, {
    method: 'POST', headers: { Authorization: `Bearer ${idToken}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || typeof body.code !== 'string' || typeof body.username !== 'string') {
    const err = new Error(`sso code failed (${res.status})`); err.status = res.status; throw err;
  }
  return body;
}

async function idp(target, payload, fetchImpl) {
  const res = await fetchImpl(IDP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-amz-json-1.1', 'X-Amz-Target': `AWSCognitoIdentityProviderService.${target}` },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.message || body.__type || `${target} failed (${res.status})`);
    err.status = res.status; err.code = String(body.__type || '').split('#').pop() || 'idp_error';
    throw err;
  }
  return body;
}

/**
 * Exchange a handoff code for this app's own tokens (CUSTOM_AUTH, one challenge).
 * -> { idToken, accessToken, refreshToken, expiresIn }. Throws when the code is refused/expired/used.
 */
export async function signInWithCode({ clientId, username, code, fetchImpl = fetch }) {
  const start = await idp('InitiateAuth', { AuthFlow: 'CUSTOM_AUTH', ClientId: clientId, AuthParameters: { USERNAME: username } }, fetchImpl);
  if (start.ChallengeName !== 'CUSTOM_CHALLENGE' || !start.Session) throw Object.assign(new Error('unexpected challenge'), { code: 'bad_challenge' });
  const done = await idp('RespondToAuthChallenge', {
    ChallengeName: 'CUSTOM_CHALLENGE', ClientId: clientId, Session: start.Session,
    ChallengeResponses: { USERNAME: start.ChallengeParameters?.USERNAME || username, ANSWER: code },
  }, fetchImpl);
  const r = done.AuthenticationResult;
  if (!r?.IdToken || !r?.AccessToken) throw Object.assign(new Error('sign-in refused'), { code: 'refused' });
  return { idToken: r.IdToken, accessToken: r.AccessToken, refreshToken: r.RefreshToken, expiresIn: r.ExpiresIn || 3600 };
}
