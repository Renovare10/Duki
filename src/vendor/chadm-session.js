// chadm-session.js: the small, non-secret cookies the chadmurchison.com apps share so each one
// knows someone is signed in on this browser. NO TOKENS ever go in here; every app keeps its own
// tokens in its own storage. Same file in the library, Duki and the main site (see docs/SSO.md).
//
//   chadm_signed_in=1        someone is signed in on this browser
//   chadm_user=<email>       display only (avatar initial, "Continue as …")
//   chadm_sso_until=<ms>     until when the accounts (Cognito) session can sign in silently
//                            (interactive sign-in time + 1 h; Cognito's fixed limit)
//   chadm_signout_at=<ms>    last "Sign out" anywhere: older sessions in the other apps end too
export const DOMAIN = 'chadmurchison.com';
const NAMES = { hint: 'chadm_signed_in', user: 'chadm_user', ssoUntil: 'chadm_sso_until', signoutAt: 'chadm_signout_at' };
const MAX_AGE = 30 * 86400;                 // = the refresh token lifetime
const COGNITO_SESSION_MS = 3600e3;
const MARGIN_MS = 2 * 60e3;

const onDomain = () => typeof location !== 'undefined' && (location.hostname === DOMAIN || location.hostname.endsWith('.' + DOMAIN));
function write(name, value, maxAge) {
  if (!onDomain()) return;
  document.cookie = `${name}=${value}; Domain=.${DOMAIN}; Path=/; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
export function readCookie(name, cookie = typeof document !== 'undefined' ? document.cookie : '') {
  for (const part of cookie.split(/;\s*/)) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i) === name) {
      try { return decodeURIComponent(part.slice(i + 1)); } catch { return null; }
    }
  }
  return null;
}

/** { signedIn, email, ssoUntil, signoutAt } from the shared cookies. */
export function sharedSession(cookie) {
  const n = k => Number(readCookie(NAMES[k], cookie)) || 0;
  return { signedIn: readCookie(NAMES.hint, cookie) === '1', email: readCookie(NAMES.user, cookie) || null,
    ssoUntil: n('ssoUntil'), signoutAt: n('signoutAt') };
}

/** Can a redirect to the accounts page sign in without a password right now? */
export const ssoAlive = (s = sharedSession(), now = Date.now()) => s.signedIn && s.ssoUntil > now;

/** Did someone sign out (in any app) after this app's session started? Then end it here too. */
export const signedOutSince = (sessionStart, s = sharedSession()) => s.signoutAt > 0 && s.signoutAt > (sessionStart || 0);

/** Call whenever this app has a valid session (load, refresh, sign-in). authTime: ID token auth_time (s). */
export function markSignedIn({ email, authTime } = {}) {
  write(NAMES.hint, '1', MAX_AGE);
  if (email) write(NAMES.user, encodeURIComponent(email), MAX_AGE);
  const until = authTime ? authTime * 1000 + COGNITO_SESSION_MS - MARGIN_MS : 0;
  if (until > sharedSession().ssoUntil) write(NAMES.ssoUntil, String(until), MAX_AGE);
}

/** Signed out here. everywhere: a real "Sign out" (the other apps end their sessions on next load). */
export function markSignedOut({ everywhere = false } = {}) {
  write(NAMES.hint, '', 0);
  write(NAMES.user, '', 0);
  write(NAMES.ssoUntil, '', 0);
  if (everywhere) write(NAMES.signoutAt, String(Date.now()), MAX_AGE);
}
