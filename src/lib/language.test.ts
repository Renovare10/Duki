import { afterEach, describe, expect, it, vi } from "vitest";
import type { LibraryText, WordRecord } from "../types";
import {
  cloudSyncEnabled,
  languageWordsView,
  mandarinOnly,
  previewNoSync,
  readLanguage,
  wordStorageKey,
  writeLanguage,
} from "./language";
import {
  assertSyncV2Body,
  CloudWritesDisabledError,
  packSnapshot,
  pullSnapshotWithTag,
  pushSnapshot,
  SyncVersionError,
} from "./sync";

const token = `test.${btoa(JSON.stringify({ email_verified: true }))}.test`;
const settings = { fontFamily: "serif", fontSize: 28, theme: "paper" } as const;
const word = (hanzi: string, status: WordRecord["status"] = "known") => ({ hanzi, status, updatedAt: 1 }) as WordRecord;
const text = (id: string, lang?: "zh" | "en") =>
  ({ id, lang, title: id, blurb: "", body: "", createdAt: 1, readAt: null, bookmark: null, kind: "paste" }) as LibraryText;
const snap = () => packSnapshot({ words: [word("中")], texts: [], sessions: [], settings, now: 1 });

afterEach(() => vi.unstubAllEnvs());

describe("language preference", () => {
  it("defaults to Mandarin and persists English", () => {
    const store = new Map<string, string>();
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
    expect(readLanguage(storage)).toBe("zh");
    writeLanguage(storage, "en");
    expect(readLanguage(storage)).toBe("en");
    writeLanguage(storage, "zh");
    expect(readLanguage(storage)).toBe("zh");
    expect(readLanguage({ getItem: () => { throw new Error("blocked"); } })).toBe("zh");
  });
});

describe("language-separated words", () => {
  it("keeps English records apart from Mandarin keys, including Latin ones like OK/DNA", () => {
    const words = new Map([
      ["中", word("中")],
      ["OK", word("OK")],
      ["DNA", word("DNA", "shaky")],
      [wordStorageKey("en", "OK"), word(wordStorageKey("en", "OK"), "unknown")],
    ]);
    expect(wordStorageKey("en", "Cat")).toBe("en:cat");
    expect(wordStorageKey("zh", "OK")).toBe("OK");
    expect([...languageWordsView(words, "zh").keys()]).toEqual(["中", "OK", "DNA"]);
    expect([...languageWordsView(words, "en").keys()]).toEqual(["ok"]);
    expect(languageWordsView(words, "zh").get("OK")?.status).toBe("known");
  });

  it("strips every English row before a (Mandarin-only v1) snapshot is merged or sent", () => {
    const out = mandarinOnly({
      words: [word("中"), word("en:cat")],
      texts: [text("zh-1"), text("legacy"), text("en-1", "en")],
      sessions: [
        { id: "s1", textId: "zh-1" },
        { id: "s2", textId: "en-1" },
      ] as never,
    });
    expect(out.words.map((w) => w.hanzi)).toEqual(["中"]);
    expect(out.texts.map((t) => t.id)).toEqual(["zh-1", "legacy"]);
    expect(out.sessions.map((s) => s.id)).toEqual(["s1"]);
  });
});

describe("preview / no-sync mode", () => {
  it("is on unless the build explicitly enables cloud sync", () => {
    expect(cloudSyncEnabled(undefined)).toBe(false);
    expect(cloudSyncEnabled({})).toBe(false);
    expect(cloudSyncEnabled({ VITE_DUKI_CLOUD_SYNC: "true" })).toBe(false);
    expect(cloudSyncEnabled({ VITE_DUKI_CLOUD_SYNC: "on" })).toBe(true);
    vi.stubEnv("VITE_DUKI_CLOUD_SYNC", "");
    expect(previewNoSync()).toBe(true);
  });

  it("blocks every cloud PUT before any request is made", async () => {
    vi.stubEnv("VITE_DUKI_API", "https://test.invalid");
    vi.stubEnv("VITE_DUKI_CLOUD_SYNC", "");
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    await expect(pushSnapshot(token, snap(), fetcher)).rejects.toBeInstanceOf(CloudWritesDisabledError);
    await expect(pushSnapshot(token, snap(), fetcher, [], { noSync: true })).rejects.toBeInstanceOf(CloudWritesDisabledError);
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe("sync body version", () => {
  it("rejects bodies whose v is not 2", () => {
    for (const body of [{ v: 1 }, { v: "2" }, { v: 3 }, {}, null, "x"]) {
      expect(() => assertSyncV2Body(body)).toThrow(SyncVersionError);
    }
    expect(assertSyncV2Body({ v: 2 }).v).toBe(2);
  });

  it("refuses a GET that advertises v2 but carries a v1 body, before any merge or PUT", async () => {
    vi.stubEnv("VITE_DUKI_API", "https://test.invalid");
    const body = packSnapshot({ words: [word("中")], texts: [], sessions: [], settings, now: 1 });
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), { status: 200, headers: { "x-duki-sync-version": "2" } }),
    );
    await expect(pullSnapshotWithTag(token, fetcher)).rejects.toBeInstanceOf(SyncVersionError);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][1]?.method ?? "GET").toBe("GET");
  });

  it("refuses an unknown body version instead of treating it as an empty account", async () => {
    vi.stubEnv("VITE_DUKI_API", "https://test.invalid");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ v: 2, words: [] }), { status: 200 }));
    await expect(pullSnapshotWithTag(token, fetcher)).rejects.toBeInstanceOf(SyncVersionError);
  });
});
