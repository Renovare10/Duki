// Types for the shared chadm-handoff.js (copied from Alexandrea's Library; see its docs/SSO.md).
export type ChadmAppId = "library" | "duki";
export type Handoff = { code: string; username: string; to: string } | { none: true; to: string };
export type HandoffTokens = { idToken: string; accessToken: string; refreshToken?: string; expiresIn: number };
export const REGION: string;
export const IDP_URL: string;
export const APP_URLS: Readonly<Record<ChadmAppId, string>>;
export const PEER: Readonly<Record<ChadmAppId, ChadmAppId>>;
export const PULL_COOLDOWN_MS: number;
export function safeRoute(to: unknown): string;
export function handoffUrl(app: ChadmAppId, code: { code: string; username: string }, to?: string): string;
export function noneUrl(app: ChadmAppId, to?: string): string;
export function parseHandoff(hash: string): Handoff | null;
export function readHandoff(
  loc?: Pick<Location, "hash" | "pathname" | "search">,
  hist?: Pick<History, "replaceState">,
): Handoff | null;
export function readPullRequest(
  self: ChadmAppId,
  loc?: Pick<Location, "hash" | "pathname" | "search">,
  hist?: Pick<History, "replaceState">,
): { app: ChadmAppId; to: string } | null;
export function pullUrl(self: ChadmAppId, route?: string): string;
export function shouldPull(opts: {
  signedIn: boolean;
  hint: boolean;
  online: boolean;
  inProgress: boolean;
  lastTriedAt: number | null;
  now?: number;
}): boolean;
export function lastPullAt(store?: Pick<Storage, "getItem">): number;
export function markPulled(now?: number, store?: Pick<Storage, "setItem">): void;
export function requestCode(opts: {
  apiUrl: string;
  idToken: string;
  fetchImpl?: typeof fetch;
}): Promise<{ code: string; username: string; app?: string; expiresIn?: number }>;
export function signInWithCode(opts: {
  clientId: string;
  username: string;
  code: string;
  fetchImpl?: typeof fetch;
}): Promise<HandoffTokens>;
