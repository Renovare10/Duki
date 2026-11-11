import { afterEach, describe, expect, it, vi } from "vitest";
import type { LibraryText, WordRecord } from "../types";
import {
  cloudSyncEnabled,
  languageWordsView,
  localOnlyBuild,
  mandarinOnly,
  readLanguage,
  wordStorageKey,
  writeLanguage,
} from "./language";
import { packSnapshot, pullSnapshotWithTag, pushSnapshot } from "./sync";

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
    expect(languageWordsView(words, "en").get("ok")?.hanzi).toBe("ok");
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

describe("production cloud sync (Mandarin, v1, unchanged)", () => {
  it("is on unless a build explicitly sets VITE_DUKI_CLOUD_SYNC=off", () => {
    expect(cloudSyncEnabled(undefined)).toBe(true);
    expect(cloudSyncEnabled({})).toBe(true);
    expect(cloudSyncEnabled({ VITE_DUKI_CLOUD_SYNC: "on" })).toBe(true);
    expect(cloudSyncEnabled({ VITE_DUKI_CLOUD_SYNC: "off" })).toBe(false);
    vi.stubEnv("VITE_DUKI_CLOUD_SYNC", "");
    expect(localOnlyBuild()).toBe(false);
  });

  it("reads the live duki-sync GET (x-duki-sync-version: 2 header on every response, v1 legacy body)", async () => {
    vi.stubEnv("VITE_DUKI_API", "https://test.invalid");
    const body = packSnapshot({ words: [word("中")], texts: [], sessions: [], settings, now: 1 });
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), { status: 200, headers: { "x-duki-sync-version": "2", etag: '"e1"' } }),
    );
    const pulled = await pullSnapshotWithTag(token, fetcher);
    expect(pulled.snapshot?.words.map((w) => w.hanzi)).toEqual(["中"]);
    // No version header is sent, so the server keeps answering with the legacy (Mandarin-only) projection.
    const init = fetcher.mock.calls[0][1] as RequestInit | undefined;
    expect(JSON.stringify(init?.headers ?? {})).not.toMatch(/x-duki-sync-version/i);
  });

  it("PUTs a byte-identical v1 Mandarin body whether or not English rows exist on the device", async () => {
    vi.stubEnv("VITE_DUKI_API", "https://test.invalid");
    const zh = { words: [word("中")], texts: [text("zh-1")], sessions: [{ id: "s1", textId: "zh-1", finishedAt: 1, uniqueUnknown: 0, uniqueShaky: 0 }] as never, settings };
    const withEn = {
      words: [...zh.words, word("en:cat")],
      texts: [...zh.texts, text("en-1", "en")],
      sessions: [...zh.sessions, { id: "s2", textId: "en-1", finishedAt: 1, uniqueUnknown: 0, uniqueShaky: 0 }] as never,
      settings,
    };
    const bodies: string[] = [];
    const fetcher = vi.fn(async (_url: string, init?: RequestInit) => {
      bodies.push(String(init?.body));
      return new Response(null, { status: 204 });
    });
    await pushSnapshot(token, packSnapshot({ ...mandarinOnly(zh), now: 1 }), fetcher as never);
    await pushSnapshot(token, packSnapshot({ ...mandarinOnly(withEn), now: 1 }), fetcher as never);
    expect(bodies).toHaveLength(2);
    expect(bodies[1]).toBe(bodies[0]);
    const sent = JSON.parse(bodies[1]);
    expect(sent.v).toBe(1);
    expect(bodies[1]).not.toMatch(/en:|"lang"/);
  });
});
