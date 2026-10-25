// One-time sign-in handoff with Alexandrea's Library (docs/SSO.md in the library repo).
// The protocol lives in the shared src/vendor/chadm-handoff.js; this is Duki's wiring.
import {
  handoffUrl,
  noneUrl,
  readHandoff,
  readPullRequest,
  requestCode,
  signInWithCode,
  type Handoff,
} from "../vendor/chadm-handoff.js";
import { signedOutSince } from "../vendor/chadm-session.js";
import {
  AUTH_CLIENT_ID,
  type AuthTokens,
  ensureFreshAuth,
  loadStoredAuth,
  sessionStart,
  storeAuth,
  tokensFromHandoff,
} from "./auth";
import { dukiApiBase } from "./gutenberg";

let startup: Handoff | null = null;
let hadHandoff = false;

/** Call once in main.tsx, before the app reads the #route: reads and clears #sso=…. */
export function captureHandoff(): Handoff | null {
  try {
    startup = readHandoff();
    hadHandoff = startup !== null;
  } catch {
    startup = null;
  }
  return startup;
}

/** This page load came with a #sso= fragment (code or "none"), consumed or not. */
export function hadStartupHandoff(): boolean {
  return hadHandoff;
}

/** The startup handoff (not consumed). */
export function peekHandoff(): Handoff | null {
  return startup;
}

/** The startup handoff, once (StrictMode runs effects twice; a code works only once). */
export function takeHandoff(): Handoff | null {
  const h = startup;
  startup = null;
  return h;
}

/** Sign in here with a handoff code. Throws when the code is refused (then stay signed out). */
export async function signInWithHandoff(
  h: { code: string; username: string },
  fetchImpl: typeof fetch = fetch,
  now = Date.now(),
): Promise<AuthTokens> {
  const result = await signInWithCode({ clientId: AUTH_CLIENT_ID, username: h.username, code: h.code, fetchImpl });
  const tokens = tokensFromHandoff(result, now);
  storeAuth(tokens);
  return tokens;
}

/**
 * The library URL that signs the library in with a fresh code from Duki's API, or null when that
 * isn't possible (signed out, no API configured). Fresh tokens are stored (and reported) first.
 */
export async function libraryHandoffUrl(
  stored: AuthTokens | null,
  route = "",
  opts: { fetchImpl?: typeof fetch; apiUrl?: string; onRefreshed?: (t: AuthTokens) => void } = {},
): Promise<string | null> {
  const apiUrl = opts.apiUrl ?? dukiApiBase();
  if (!stored || !apiUrl) return null;
  const fetchImpl = opts.fetchImpl ?? fetch;
  const tokens = await ensureFreshAuth(stored, fetchImpl);
  if (tokens !== stored) {
    storeAuth(tokens);
    opts.onRefreshed?.(tokens);
  }
  const code = await requestCode({ apiUrl, idToken: tokens.idToken, fetchImpl });
  return handoffUrl("library", code, route);
}

/**
 * ?sso_for=library: the library (signed out there) asks Duki for a code. Returns where to go
 * (a handoff URL, or the library's #sso=none), or null when this page load is no such request.
 * Call in main.tsx before rendering.
 */
export async function answerPullRequest(fetchImpl: typeof fetch = fetch): Promise<string | null> {
  let req: { app: "library" | "duki"; to: string } | null = null;
  try {
    req = readPullRequest("duki");
  } catch {
    return null;
  }
  if (!req) return null;
  try {
    const stored = loadStoredAuth();
    if (stored && !signedOutSince(sessionStart(stored))) {
      const url = await libraryHandoffUrl(stored, req.to, { fetchImpl });
      if (url) return url;
    }
  } catch {
    /* fall through: signed out / offline / refused */
  }
  return noneUrl("library", req.to);
}
