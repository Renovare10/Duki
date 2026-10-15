/**
 * Library v2 must not disturb existing user data. These tests pin the
 * backward-compatibility guarantees: no text re-IDs, old rows normalise
 * exactly as before, new fields are optional and survive sync/backup, and
 * work-chapter rows never leak into shelves or carry bodies into storage.
 */
import { describe, expect, it } from "vitest";
import type { LibraryText, WordRecord } from "../types";
import { CATALOG } from "../data/library";
import oldIds from "./__fixtures__/catalog-ids-c6dfe46.json";
import { collapseTexts } from "./books";
import { parseBackup } from "./db";
import { buildShelves } from "./shelves";
import { mergeSnapshots, packSnapshot, parseSnapshot, type SyncSnapshot } from "./sync";
import { normalizeText } from "./text";
import { workChapterRow, workRowId } from "./works";

const settings = { fontFamily: "serif" as const, fontSize: 28, theme: "paper" as const };

function oldRow(partial: Partial<LibraryText> & { id: string }): LibraryText {
  // Shape written by the production app before library v2 (no openedAt).
  return {
    title: partial.id,
    blurb: "",
    body: "正文",
    kind: "sample",
    category: "story",
    createdAt: 1,
    readAt: null,
    bookmark: null,
    ...partial,
  };
}

function word(hanzi: string, updatedAt: number): WordRecord {
  return {
    hanzi,
    status: "known",
    updatedAt,
    dontKnowCount: 0,
    barelyCount: 1,
    okayCount: 3,
    ease: 2.3,
    intervalDays: 6,
    repetitions: 2,
    dueAt: 1_800_000_000_000,
  };
}

describe("text ids", () => {
  it("keeps every catalog id from main (c6dfe46) — nothing renamed or removed", () => {
    const now = new Set(CATALOG.map((t) => t.id));
    const missing = (oldIds as string[]).filter((id) => !now.has(id));
    expect(missing).toEqual([]);
  });

  it("no catalog id can be mistaken for a work-chapter row", () => {
    expect(CATALOG.filter((t) => t.id.startsWith("w:"))).toEqual([]);
  });
});

describe("normalizeText", () => {
  it("normalises an old-format row exactly as before (no new keys appear)", () => {
    const row = oldRow({ id: "novel-lamp-1", readAt: 5, bookmark: { tokenIndex: 30, scrollY: 900 }, seriesId: "old-lamp", chapter: 1 });
    const out = normalizeText(row);
    expect("openedAt" in out).toBe(false);
    expect(out).toMatchObject({ id: "novel-lamp-1", readAt: 5, bookmark: { tokenIndex: 30, scrollY: 900 }, seriesId: "old-lamp" });
  });

  it("keeps openedAt when present and drops junk values", () => {
    expect(normalizeText(oldRow({ id: "a", openedAt: 42 })).openedAt).toBe(42);
    expect("openedAt" in normalizeText({ ...oldRow({ id: "b" }), openedAt: "x" as unknown as number })).toBe(false);
    expect("openedAt" in normalizeText(oldRow({ id: "c", openedAt: 0 }))).toBe(false);
  });
});

describe("sync", () => {
  const snap = (texts: LibraryText[], updatedAt: number, words: WordRecord[] = []): SyncSnapshot => ({
    v: 1,
    updatedAt,
    words,
    texts,
    sessions: [],
    settings,
  });

  it("an old client's snapshot (no openedAt) does not erase it", () => {
    const local = snap([oldRow({ id: workRowId("bible-cuv", "GEN.1"), body: "", openedAt: 500, bookmark: { tokenIndex: 3, scrollY: 60 } })], 10);
    const remote = snap([oldRow({ id: workRowId("bible-cuv", "GEN.1"), body: "", readAt: 700 })], 20, [word("神", 1)]);
    const merged = mergeSnapshots(local, remote);
    const row = merged.texts.find((t) => t.id === "w:bible-cuv:GEN.1")!;
    expect(row.openedAt).toBe(500);
    expect(row.readAt).toBe(700);
    expect(row.bookmark).toEqual({ tokenIndex: 3, scrollY: 60 });
  });

  it("keeps the newest openedAt from either side", () => {
    const a = snap([oldRow({ id: "sample-home", openedAt: 100 })], 1);
    const b = snap([oldRow({ id: "sample-home", openedAt: 300 })], 2);
    expect(mergeSnapshots(a, b).texts[0].openedAt).toBe(300);
    expect(mergeSnapshots(b, a).texts[0].openedAt).toBe(300);
  });

  it("merging two old snapshots produces no openedAt", () => {
    const a = snap([oldRow({ id: "sample-home", readAt: 9 })], 1);
    const b = snap([oldRow({ id: "sample-home" })], 2);
    expect("openedAt" in mergeSnapshots(a, b).texts[0]).toBe(false);
  });

  it("work rows go up without bodies and come back intact", () => {
    const packed = packSnapshot({
      words: [word("神", 5)],
      texts: [{ ...oldRow({ id: workRowId("nahan", "03"), body: "should never be here", openedAt: 9 }) }],
      sessions: [],
      settings,
    });
    expect(packed.texts[0].body).toBe("");
    const parsed = parseSnapshot(JSON.parse(JSON.stringify(packed)))!;
    expect(parsed.texts[0]).toMatchObject({ id: "w:nahan:03", openedAt: 9, body: "" });
  });
});

describe("shelves", () => {
  const base = [
    oldRow({ id: "s1", readAt: 1 }),
    oldRow({ id: "s2", bookmark: { tokenIndex: 10, scrollY: 200 } }),
    oldRow({ id: "n1", seriesId: "lamp", chapter: 1, title: "旧灯 · 一" }),
    oldRow({ id: "n2", seriesId: "lamp", chapter: 2, title: "旧灯 · 二" }),
  ];
  const work = workChapterRow(
    { id: "bible-cuv", title: "圣经", author: "x", category: "history", source: "s", sourceUrl: "u" },
    { key: "GEN.1", title: "创世记 1" },
    undefined,
    50,
  );

  it("work rows never appear as cards", () => {
    expect(collapseTexts([...base, work]).map((i) => (i.type === "text" ? i.text.id : i.book.id))).toEqual(["s1", "s2", "lamp"]);
  });

  it("existing shelves are identical with or without work rows present", () => {
    const filters = { level: "all" as const, read: "all" as const, category: "all" as const, query: "" };
    const scores = new Map();
    const before = buildShelves(base, scores, [], filters);
    const after = buildShelves([...base, { ...work, readAt: 60 }], scores, [], filters);
    expect(after).toEqual(before);
  });
});

describe("backups", () => {
  it("old backups (v1/v2) still import", () => {
    for (const version of [1, 2]) {
      const parsed = parseBackup({
        app: "duki",
        version,
        exportedAt: "2025-01-01T00:00:00.000Z",
        words: [word("猫", 1)],
        texts: [oldRow({ id: "p1", kind: "paste", category: "paste", body: "我的文章" })],
        sessions: [{ id: "s", textId: "p1", finishedAt: 1, uniqueUnknown: 0, uniqueShaky: 0, durationMs: 1 }],
      });
      expect(parsed.texts.map((t) => t.id)).toEqual(["p1"]);
      expect(parsed.words[0].hanzi).toBe("猫");
    }
  });

  it("chapter progress rows (no body) survive a backup round trip; other empty rows are still skipped", () => {
    const parsed = parseBackup({
      app: "duki",
      version: 2,
      exportedAt: "2026-10-07T00:00:00.000Z",
      words: [],
      texts: [
        oldRow({ id: workRowId("bible-cuv", "JHN.3"), body: "", readAt: 77, openedAt: 70 }),
        oldRow({ id: "wiki:猫", kind: "wiki", category: "wiki", body: "" }),
      ],
      sessions: [],
    });
    expect(parsed.texts.map((t) => t.id)).toEqual(["w:bible-cuv:JHN.3"]);
    expect(parsed.texts[0]).toMatchObject({ readAt: 77, openedAt: 70, body: "" });
  });
});
