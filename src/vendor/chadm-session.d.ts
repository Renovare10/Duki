// Types for the shared chadmurchison.com session cookies (copied from Alexandrea's Library; docs/SSO.md).
export const DOMAIN: string;
export type SharedSession = { signedIn: boolean; email: string | null; ssoUntil: number; signoutAt: number };
export function readCookie(name: string, cookie?: string): string | null;
export function sharedSession(cookie?: string): SharedSession;
export function ssoAlive(s?: SharedSession, now?: number): boolean;
export function signedOutSince(sessionStart: number, s?: SharedSession): boolean;
export function markSignedIn(opts?: { email?: string | null; authTime?: number }): void;
export function markSignedOut(opts?: { everywhere?: boolean }): void;
