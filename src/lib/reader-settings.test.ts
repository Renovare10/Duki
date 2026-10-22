import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, normalizeSettings, parseBackup } from "./db";
import { mergeSettings, packSnapshot, parseSnapshot } from "./sync";
import type { ReaderSettings } from "../types";

const base: ReaderSettings = { fontFamily: "serif", fontSize: 28, theme: "paper" };
describe("reader settings compatibility", () => {
  it("adds safe defaults without a DB version migration", () => {
    expect(normalizeSettings(base)).toEqual({ ...base, highlightStyle: "color-coded", textWidth: "medium" });
    expect(normalizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
  });
  it("keeps larger characters and all widths, clamps invalid sizes", () => {
    for (const textWidth of ["narrow", "medium", "wide", "full"] as const) {
      expect(normalizeSettings({ ...base, textWidth, fontSize: 96, highlightStyle: "normal" }))
        .toEqual({ ...base, textWidth, fontSize: 96, highlightStyle: "normal" });
    }
    expect(normalizeSettings({ fontSize: 999 }).fontSize).toBe(96);
    expect(normalizeSettings({ fontSize: 0 }).fontSize).toBe(18);
    expect(normalizeSettings({ fontSize: NaN }).fontSize).toBe(28);
    expect(normalizeSettings({ fontSize: Infinity }).fontSize).toBe(28);
    expect(normalizeSettings({ textWidth: "oops", highlightStyle: "oops" } as unknown as ReaderSettings))
      .toMatchObject({ textWidth: "medium", highlightStyle: "color-coded" });
  });
  it("round trips settings through old-format backups and sync payloads", () => {
    const settings = { ...base, fontSize: 80, highlightStyle: "normal" as const, textWidth: "full" as const, readerSetAt: 123 };
    expect(parseBackup(JSON.parse(JSON.stringify({ app: "duki", version: 2, words: [], texts: [], settings }))).settings).toEqual(settings);
    const packed = packSnapshot({ words: [], texts: [], sessions: [], settings });
    expect(parseSnapshot(JSON.parse(JSON.stringify(packed)))?.settings).toEqual(settings);
    expect(parseBackup({ app: "duki", version: 1, words: [], texts: [], settings: base }).settings)
      .toEqual({ ...base, highlightStyle: "color-coded", textWidth: "medium" });
  });
  it("syncs the newest reader choice independently of the richest vocabulary and theme", () => {
    const rich = { ...base, theme: "night" as const, themeSetAt: 400, readerSetAt: 100 };
    const newest = { ...base, fontSize: 96, textWidth: "wide" as const, highlightStyle: "normal" as const, readerSetAt: 300 };
    for (const [a, b] of [[rich, newest], [newest, rich]]) {
      expect(mergeSettings(a, b)).toEqual({ ...newest, theme: "night", themeSetAt: 400 });
    }
    expect(mergeSettings(base, newest)).toMatchObject(newest);
    expect(mergeSettings(newest, base)).toMatchObject(newest);
  });
  it("rejects invalid reader timestamps without disturbing old theme timestamps", () => {
    expect(normalizeSettings({ readerSetAt: NaN, themeSetAt: 99 })).not.toHaveProperty("readerSetAt");
    expect(normalizeSettings({ readerSetAt: -1 }).readerSetAt).toBeUndefined();
    expect(normalizeSettings({ readerSetAt: 1, themeSetAt: 99 })).toMatchObject({ readerSetAt: 1, themeSetAt: 99 });
  });
});
