import { describe, expect, it } from "vitest";
import type { LibraryText, TextScore } from "../types";
import { CATALOG } from "../data/library";
import { TEXT_META } from "../data/text-meta";
import { LIBRARY_TOPICS } from "../data/library/index";
import { isTopic, TEXT_TOPICS } from "../data/topics";
import { WORKS } from "../data/works";
import { WORK_STATS } from "../data/works.generated";
import { hanCount } from "./difficulty";
import {
  describeText,
  describeWork,
  filterEntries,
  formatDuration,
  formatKnown,
  lengthBucket,
  lengthLabel,
  NO_FILTERS,
  personalReady,
  sortByLevel,
  textEntry,
  workEntry,
  workKnownShare,
} from "./library";

function t(partial: Partial<LibraryText> & { id: string }): LibraryText {
  return {
    title: partial.id,
    blurb: "",
    body: "",
    kind: "sample",
    category: "story",
    createdAt: 1,
    readAt: null,
    bookmark: null,
    ...partial,
  };
}

function score(knownPct: number, total = 100): TextScore {
  const known = Math.round(knownPct * total);
  return {
    total,
    known,
    shaky: 0,
    unknown: total - known,
    knownPct,
    unknownLoad: 1 - knownPct,
    unique: total,
    uniqueUnknown: total - known,
    uniqueShaky: 0,
  };
}

describe("precomputed catalog metadata", () => {
  const owned = CATALOG.filter((x) => x.body.trim());

  it("every built-in text has a level and its character count is current", () => {
    for (const text of owned) {
      const meta = TEXT_META[text.id];
      expect(meta, `${text.id}: run node scripts/build-text-meta.mjs`).toBeTruthy();
      expect(meta[2], `${text.id} changed: run node scripts/build-text-meta.mjs`).toBe(hanCount(text.body));
      expect(meta[0]).toBeGreaterThanOrEqual(1);
      expect(meta[0]).toBeLessThanOrEqual(10);
    }
  });

  it("every built-in text has 1–3 valid topics", () => {
    for (const text of owned) {
      const topics = TEXT_TOPICS[text.id] ?? LIBRARY_TOPICS[text.id];
      expect(topics?.length, text.id).toBeGreaterThan(0);
      expect(topics.length).toBeLessThanOrEqual(3);
      for (const topic of topics) expect(isTopic(topic), `${text.id}: ${topic}`).toBe(true);
    }
    for (const work of WORKS) for (const topic of work.topics) expect(isTopic(topic)).toBe(true);
  });
});

describe("describeText", () => {
  it("uses precomputed level, length and topics for catalog texts", () => {
    const info = describeText(t({ id: "x", body: "我" }), { x: [3, 345, 120] }, { x: ["food"] });
    expect(info).toMatchObject({ level: 3, badge: "L3", band: "elementary", chars: 120, topics: ["food"] });
    expect(info.sortScore).toBeCloseTo(3.45);
    expect(info.minutes).toBe(1);
  });

  it("labels Wikipedia and Wikisource as native without a number", () => {
    expect(describeText(t({ id: "wiki:猫", kind: "wiki", category: "wiki" }), {}, {})).toMatchObject({
      level: null,
      badge: "Native",
      band: "native",
      topics: ["encyclopedia"],
      chars: null,
    });
    expect(describeText(t({ id: "ws:x", kind: "wikisource", category: "wikisource" }), {}, {}).badge).toBe("Classical");
  });

  it("uses precomputed scores for Wikipedia and Wikisource", () => {
    const cat = describeText(t({ id: "wiki-猫", kind: "wiki", category: "wiki", title: "猫" }));
    expect(cat.level).toBeGreaterThanOrEqual(6);
    expect(cat.badge).toMatch(/^L\d+$/);
    expect(cat.chars).toBeGreaterThan(100);
    expect(cat.topics).toContain("encyclopedia");
    const dao = describeText(t({ id: "ws-道德經", kind: "wikisource", category: "wikisource", title: "道德经" }));
    expect(dao.level).toBeGreaterThanOrEqual(7);
    expect(dao.topics).toContain("classics");
    expect(dao.minutes).toBeGreaterThan(0);
  });

  it("measures length of the reader's own texts but claims no level", () => {
    const info = describeText(t({ id: "p", kind: "paste", category: "paste", body: "今天天气很好。" }), {}, {});
    expect(info.level).toBeNull();
    expect(info.badge).toBe("");
    expect(info.chars).toBe(6);
  });
});

describe("works", () => {
  it("show the range most chapters sit in", () => {
    const bible = WORKS.find((w) => w.id === "bible-cuv")!;
    const info = describeWork(bible, WORK_STATS["bible-cuv"]);
    expect(info.badge).toMatch(/^L\d+(–\d+)?$/);
    expect(info.chars).toBe(WORK_STATS["bible-cuv"].chars);
    expect(lengthLabel(info)).toMatch(/k 字 · \d+ h$/);
  });

  it("estimates personal known-% from the profile", () => {
    const statuses = new Map([["的", "known"]]);
    expect(workKnownShare({ tokens: 10, words: ["的", "神"], counts: [5, 3] }, statuses)).toBeCloseTo(0.5);
    expect(workKnownShare(undefined, statuses)).toBeNull();
  });
});

describe("formatting", () => {
  it("rounds known share down", () => {
    expect(formatKnown(0.949)).toBe("~94% known");
    expect(formatKnown(0.004)).toBe("<1% known");
  });
  it("formats durations", () => {
    expect(formatDuration(0.5)).toBe("<1 min");
    expect(formatDuration(14)).toBe("14 min");
    expect(formatDuration(90)).toBe("1.5 h");
    expect(formatDuration(5000)).toBe("83 h");
  });
  it("buckets length", () => {
    expect(lengthBucket(299)).toBe("short");
    expect(lengthBucket(300)).toBe("medium");
    expect(lengthBucket(1501)).toBe("long");
  });
  it("needs some known words before showing personal numbers", () => {
    const few = new Map(Array.from({ length: 19 }, (_, i) => [`w${i}`, "known"]));
    expect(personalReady(few)).toBe(false);
    few.set("w19", "known");
    expect(personalReady(few)).toBe(true);
  });
});

describe("browse filters", () => {
  const meta = TEXT_META;
  const easy = textEntry(t({ id: "sample-home", body: "x", category: "graded", readAt: 5 }), score(0.97));
  const mid = textEntry(t({ id: "hist-silk", body: "x", category: "history" }), score(0.92));
  const wiki = textEntry(t({ id: "wiki:猫", kind: "wiki", category: "wiki" }), undefined);
  const started = textEntry(t({ id: "novel-lamp-1", body: "x", bookmark: { tokenIndex: 50, scrollY: 400 } }), score(0.7));
  const bible = workEntry(WORKS[0], WORK_STATS[WORKS[0].id], 0.8, { read: 2, started: true, total: 1189 });
  const all = [mid, wiki, bible, started, easy];

  it("with no filters, sorts easiest first", () => {
    const sorted = sortByLevel(all).map((e) => e.id);
    expect(sorted[0]).toBe("sample-home");
    expect(sorted.at(-1)).toBe("wiki:猫");
    expect(meta["sample-home"][0]).toBeLessThan(meta["hist-silk"][0]);
  });

  it("filters by topic", () => {
    expect(filterEntries(all, { ...NO_FILTERS, topic: "faith" }).map((e) => e.id)).toEqual(["work:bible-cuv"]);
    expect(filterEntries(all, { ...NO_FILTERS, topic: "encyclopedia" }).map((e) => e.id)).toEqual(["wiki:猫"]);
  });

  it("filters by level band", () => {
    const band = describeText(easy.type === "text" ? easy.text : t({ id: "" })).band!;
    expect(filterEntries(all, { ...NO_FILTERS, band }).map((e) => e.id)).toContain("sample-home");
    expect(filterEntries(all, { ...NO_FILTERS, band: "native" }).map((e) => e.id)).toContain("wiki:猫");
  });

  it("filters by length; works count as long", () => {
    expect(filterEntries(all, { ...NO_FILTERS, length: "long" }).map((e) => e.id)).toContain("work:bible-cuv");
    expect(filterEntries(all, { ...NO_FILTERS, length: "short" }).map((e) => e.id)).toContain("sample-home");
  });

  it("filters by personal fit", () => {
    expect(filterEntries(all, { ...NO_FILTERS, fit: "easy" }).map((e) => e.id)).toEqual(["sample-home"]);
    expect(filterEntries(all, { ...NO_FILTERS, fit: "just-right" }).map((e) => e.id)).toEqual(["hist-silk"]);
  });

  it("filters and sorts by unknown percent", () => {
    const low = textEntry(t({ id: "low" }), score(0.95));
    const mid = textEntry(t({ id: "mid" }), score(0.89));
    const high = textEntry(t({ id: "high" }), score(0.7));
    const rows = [high, low, mid];
    expect(filterEntries(rows, { ...NO_FILTERS, sort: "unknown" }).map((e) => e.id)).toEqual(["low", "mid", "high"]);
    expect(filterEntries(rows, { ...NO_FILTERS, unknownMin: 8, unknownMax: 14 }).map((e) => e.id)).toEqual(["mid"]);
    expect(filterEntries(rows, { ...NO_FILTERS, unknownMin: 20 }).map((e) => e.id)).toEqual(["high"]);
  });

  it("filters by status and search", () => {
    expect(filterEntries(all, { ...NO_FILTERS, status: "read" }).map((e) => e.id)).toEqual(["sample-home"]);
    expect(filterEntries(all, { ...NO_FILTERS, status: "started" }).map((e) => e.id).sort()).toEqual(["novel-lamp-1", "work:bible-cuv"]);
    expect(filterEntries(all, { ...NO_FILTERS, query: "union version" }).map((e) => e.id)).toEqual(["work:bible-cuv"]);
  });
});
