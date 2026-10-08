import { describe, expect, it } from "vitest";
import type { ReaderSettings } from "../types";
import {
  accountThemeKey,
  legacyDeviceTheme,
  readThemeCache,
  rememberAccountTheme,
  rememberDeviceTheme,
  resolveTheme,
  THEME_CACHE_KEY,
  themeChoiceRank,
  type ThemeInputs,
} from "./theme";

const paper: ReaderSettings = { fontFamily: "serif", fontSize: 28, theme: "paper" };
const night: ReaderSettings = { ...paper, theme: "night" };

function inputs(over: Partial<ThemeInputs> = {}): ThemeInputs {
  return {
    authPending: false,
    signedIn: false,
    deviceTheme: null,
    deviceMigrated: true,
    accountTheme: null,
    settings: null,
    accountSettled: false,
    ...over,
  };
}

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    data,
  };
}

describe("resolveTheme: signed out", () => {
  it("is light with no device choice", () => {
    expect(resolveTheme(inputs())).toBe("paper");
  });

  it("respects an explicit toggle on this device", () => {
    expect(resolveTheme(inputs({ deviceTheme: "night" }))).toBe("night");
    expect(resolveTheme(inputs({ deviceTheme: "paper" }))).toBe("paper");
  });

  it("ignores account settings left in IndexedDB once migrated", () => {
    expect(
      resolveTheme(inputs({ settings: { ...night, themeSetAt: 5_000 } })),
    ).toBe("paper");
  });

  it("waits (stays dark) for local settings before the one-time migration", () => {
    expect(resolveTheme(inputs({ deviceMigrated: false }))).toBeNull();
  });

  it("keeps a pre-existing night choice before migration", () => {
    expect(resolveTheme(inputs({ deviceMigrated: false, settings: night }))).toBe("night");
    expect(resolveTheme(inputs({ deviceMigrated: false, settings: paper }))).toBe("paper");
  });

  it("stays unresolved while a sign-in code is being exchanged", () => {
    expect(resolveTheme(inputs({ authPending: true, deviceTheme: "paper" }))).toBeNull();
  });
});

describe("resolveTheme: signed in", () => {
  const base = { signedIn: true } as const;

  it("stays dark (unresolved) with no cache until the account pull settles", () => {
    expect(resolveTheme(inputs({ ...base, settings: paper }))).toBeNull();
  });

  it("uses the cached account theme before the pull, ignoring the device choice", () => {
    expect(
      resolveTheme(inputs({ ...base, accountTheme: "night", deviceTheme: "paper" })),
    ).toBe("night");
    expect(resolveTheme(inputs({ ...base, accountTheme: "paper", settings: night }))).toBe(
      "paper",
    );
  });

  it("follows the synced settings once settled", () => {
    expect(
      resolveTheme(inputs({ ...base, accountSettled: true, settings: night, accountTheme: "paper" })),
    ).toBe("night");
    expect(
      resolveTheme(inputs({ ...base, accountSettled: true, settings: paper, accountTheme: "night" })),
    ).toBe("paper");
  });

  it("an account with no saved choice ends light", () => {
    expect(resolveTheme(inputs({ ...base, accountSettled: true, settings: paper }))).toBe("paper");
  });

  it("settled but settings not read yet falls back to the cache", () => {
    expect(resolveTheme(inputs({ ...base, accountSettled: true, accountTheme: "night" }))).toBe(
      "night",
    );
    expect(resolveTheme(inputs({ ...base, accountSettled: true }))).toBeNull();
  });
});

describe("legacy and merge ranking", () => {
  it("treats an old stamp-less night as this device's choice", () => {
    expect(legacyDeviceTheme(night)).toBe("night");
    expect(legacyDeviceTheme({ ...night, themeSetAt: 9 })).toBe("paper");
    expect(legacyDeviceTheme(paper)).toBe("paper");
  });

  it("ranks default < legacy night < stamped choices", () => {
    expect(themeChoiceRank(null)).toBe(-1);
    expect(themeChoiceRank(paper)).toBe(0);
    expect(themeChoiceRank(night)).toBe(1);
    expect(themeChoiceRank({ ...paper, themeSetAt: 100 })).toBe(100);
  });
});

describe("theme cache", () => {
  it("keys accounts by sub, else email", () => {
    expect(accountThemeKey("abc", "a@b.c")).toBe("sub:abc");
    expect(accountThemeKey(null, "A@B.c")).toBe("email:a@b.c");
    expect(accountThemeKey(null, null)).toBeNull();
  });

  it("round-trips device and per-account themes", () => {
    const storage = memoryStorage();
    rememberDeviceTheme("night", storage);
    rememberAccountTheme("sub:1", "paper", storage);
    rememberAccountTheme("sub:2", "night", storage);
    expect(readThemeCache(storage)).toEqual({
      device: "night",
      migrated: true,
      accounts: { "sub:1": "paper", "sub:2": "night" },
    });
  });

  it("survives garbage", () => {
    const storage = memoryStorage({
      [THEME_CACHE_KEY]: JSON.stringify({ device: "dark", accounts: { x: "blue", y: "night" } }),
    });
    expect(readThemeCache(storage)).toEqual({
      device: null,
      migrated: false,
      accounts: { y: "night" },
    });
    expect(readThemeCache(memoryStorage({ [THEME_CACHE_KEY]: "{nope" }))).toEqual({
      device: null,
      migrated: false,
      accounts: {},
    });
    expect(readThemeCache(null).accounts).toEqual({});
  });
});
