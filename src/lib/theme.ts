import type { ReaderSettings, ReaderTheme } from "../types";
import { THEME_COLORS } from "./page";

/**
 * Dark-first theme.
 *
 * index.html paints night before any JS runs (inline <style>; the production
 * CSP blocks inline scripts, so there's no inline boot script). React then
 * holds night until it knows whose preference applies:
 *
 * - signed in: the account's synced `settings.theme`. A per-account cache in
 *   localStorage gives the last-known value right at mount, so a dark account
 *   never blinks light while the sync runs.
 * - signed out: light, unless this device's toggle was used while signed out.
 */

export const BOOT_THEME: ReaderTheme = "night";
export const THEME_CACHE_KEY = "duki.theme";

/** Page background for each theme (matches --paper in index.css). */
export const THEME_BACKGROUNDS: Record<ReaderTheme, string> = {
  paper: "#f4eadc",
  night: "#1c1612",
};

export type ThemeCache = {
  /** Theme picked with the toggle on this device while signed out. */
  device: ReaderTheme | null;
  /** True once a pre-existing (legacy) IndexedDB theme has been folded into `device`. */
  migrated: boolean;
  /** Last-known synced theme per account (key: Cognito sub, else email). */
  accounts: Record<string, ReaderTheme>;
};

export type ThemeInputs = {
  /** `?code=` sign-in exchange still running: identity unknown, stay dark. */
  authPending: boolean;
  signedIn: boolean;
  /** This device's own signed-out choice. */
  deviceTheme: ReaderTheme | null;
  deviceMigrated: boolean;
  /** Cached last-known theme for the signed-in account. */
  accountTheme: ReaderTheme | null;
  /** IndexedDB settings; null until loaded. */
  settings: ReaderSettings | null;
  /** The account pull finished (or failed / timed out / no API configured). */
  accountSettled: boolean;
};

function isTheme(value: unknown): value is ReaderTheme {
  return value === "paper" || value === "night";
}

/**
 * The theme to show, or null while it's still unknown (keep the boot theme).
 * Pure so the rules can be tested without a DOM.
 */
export function resolveTheme(input: ThemeInputs): ReaderTheme | null {
  if (input.authPending) return null;
  if (input.signedIn) {
    if (input.accountSettled && input.settings) return input.settings.theme;
    return input.accountTheme;
  }
  if (input.deviceTheme) return input.deviceTheme;
  if (input.deviceMigrated) return "paper";
  if (!input.settings) return null;
  return legacyDeviceTheme(input.settings);
}

/**
 * Before this change the toggle only wrote IndexedDB settings and the default
 * was paper, so a stored night with no `themeSetAt` is someone's old explicit
 * choice. Settings that carry `themeSetAt` were written by a signed-in toggle,
 * i.e. they're an account's preference, not this device's.
 */
export function legacyDeviceTheme(settings: ReaderSettings): ReaderTheme {
  return settings.theme === "night" && !settings.themeSetAt ? "night" : "paper";
}

/**
 * How "deliberate" a settings theme is, for merging two snapshots:
 * 0 = never chosen (default paper), 1 = legacy night, else the toggle time.
 */
export function themeChoiceRank(settings: ReaderSettings | null | undefined): number {
  if (!settings) return -1;
  if (typeof settings.themeSetAt === "number" && settings.themeSetAt > 1) return settings.themeSetAt;
  return settings.theme === "night" ? 1 : 0;
}

export function accountThemeKey(sub: string | null, email: string | null): string | null {
  if (sub) return `sub:${sub}`;
  if (email) return `email:${email.toLowerCase()}`;
  return null;
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function defaultStorage(): StorageLike | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function readThemeCache(storage: StorageLike | null = defaultStorage()): ThemeCache {
  const empty: ThemeCache = { device: null, migrated: false, accounts: {} };
  if (!storage) return empty;
  try {
    const raw = storage.getItem(THEME_CACHE_KEY);
    if (!raw) return empty;
    const data = JSON.parse(raw) as Partial<ThemeCache> | null;
    if (!data || typeof data !== "object") return empty;
    const accounts: Record<string, ReaderTheme> = {};
    if (data.accounts && typeof data.accounts === "object") {
      for (const [key, value] of Object.entries(data.accounts)) {
        if (isTheme(value)) accounts[key] = value;
      }
    }
    return {
      device: isTheme(data.device) ? data.device : null,
      migrated: data.migrated === true,
      accounts,
    };
  } catch {
    return empty;
  }
}

export function writeThemeCache(
  update: (cache: ThemeCache) => ThemeCache,
  storage: StorageLike | null = defaultStorage(),
): ThemeCache {
  const next = update(readThemeCache(storage));
  if (storage) {
    try {
      storage.setItem(THEME_CACHE_KEY, JSON.stringify(next));
    } catch {
      /* private mode / quota: the theme just won't be remembered */
    }
  }
  return next;
}

export function rememberDeviceTheme(theme: ReaderTheme, storage?: StorageLike | null): ThemeCache {
  return writeThemeCache((c) => ({ ...c, device: theme, migrated: true }), storage);
}

export function rememberAccountTheme(
  key: string,
  theme: ReaderTheme,
  storage?: StorageLike | null,
): ThemeCache {
  return writeThemeCache((c) => ({ ...c, accounts: { ...c.accounts, [key]: theme } }), storage);
}

const FADE_MS = 320;

/**
 * Set data-theme plus the mobile chrome hints. With `fade`, a veil in the old
 * background color dissolves over the new theme (backgrounds are gradients,
 * which don't transition on their own).
 */
export function applyDocumentTheme(theme: ReaderTheme, opts: { fade?: boolean } = {}): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const previous = root.dataset.theme === "night" ? "night" : "paper";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  document
    .querySelector('meta[name="color-scheme"]')
    ?.setAttribute("content", theme === "night" ? "dark" : "light");
  if (root.dataset.theme === theme) return;

  const reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!opts.fade || reduceMotion || !document.body) {
    root.dataset.theme = theme;
    return;
  }

  document.querySelectorAll(".theme-veil").forEach((el) => el.remove());
  const veil = document.createElement("div");
  veil.className = "theme-veil";
  veil.setAttribute("aria-hidden", "true");
  veil.style.backgroundColor = THEME_BACKGROUNDS[previous];
  veil.style.transitionDuration = `${FADE_MS}ms`;
  document.body.appendChild(veil);
  root.dataset.theme = theme;
  const remove = () => veil.remove();
  veil.addEventListener("transitionend", remove, { once: true });
  window.setTimeout(remove, FADE_MS + 400);
  // Two frames so the veil is painted opaque before it starts fading.
  window.requestAnimationFrame(() =>
    window.requestAnimationFrame(() => veil.classList.add("theme-veil-out")),
  );
}
