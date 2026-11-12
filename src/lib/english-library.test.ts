import { describe, expect, it } from "vitest";
import { EN_GLOSSES, EN_SAMPLES } from "../data/en-samples";
import { EN_STORIES, EN_STORY_TEXTS, EN_TOPICS } from "../data/en-stories";
import { EN_ELEMENTARY_TEXTS, EN_ELEMENTARY_TOPICS } from "../data/en-level-elementary";
import { EN_INTERMEDIATE_TEXTS, EN_INTERMEDIATE_TOPICS } from "../data/en-level-intermediate";
import { EN_ADVANCED_TEXTS, EN_ADVANCED_TOPICS } from "../data/en-level-advanced";
import { EN_NATIVE_TEXTS, EN_NATIVE_TOPICS } from "../data/en-level-native";
import { EN_WIKI_TEXTS, EN_WIKI_TOPICS } from "../data/en-wiki";
import { isTopic } from "../data/topics";
import type { LibraryText } from "../types";
import { getGloss } from "./glossary";
import { describeText, lengthBucket, lengthLabel, matchesFilters, textEntry, NO_FILTERS } from "./library";
import { segment } from "./segment";

const words = (body: string) => segment(body, () => false, 8, "en").filter((t) => t.isWord);

describe("English stories", () => {
  it("ships exactly two stories for each level 1–10, all English and uniquely ided", () => {
    for (let level = 1; level <= 10; level++) {
      expect(EN_STORY_TEXTS.filter((t) => t.level === level)).toHaveLength(2);
    }
    expect(EN_STORY_TEXTS).toHaveLength(20);
    expect(new Set(EN_STORY_TEXTS.map((t) => t.id)).size).toBe(20);
    for (const t of EN_STORY_TEXTS) {
      expect(t.lang).toBe("en");
      expect(t.id).toMatch(/^en-l\d+-[a-z0-9-]+$/);
      expect(t.body).toMatch(/\n\n/); // paragraphs, like the Mandarin packs
    }
  });

  it("gets longer as the level rises", () => {
    const avg = (level: number) => {
      const rows = EN_STORIES.filter((s) => s.level === level);
      return rows.reduce((n, s) => n + words(s.body).length, 0) / rows.length;
    };
    for (let level = 2; level <= 10; level++) expect(avg(level)).toBeGreaterThan(avg(level - 1));
  });

  it("has a Chinese gloss for every word a reader can tap, in every English story (starter + Elementary + Intermediate + Advanced + Native + Wikipedia)", () => {
    expect(EN_SAMPLES.length).toBe(EN_STORY_TEXTS.length + EN_ELEMENTARY_TEXTS.length + EN_INTERMEDIATE_TEXTS.length + EN_ADVANCED_TEXTS.length + EN_NATIVE_TEXTS.length + EN_WIKI_TEXTS.length);
    for (const t of EN_SAMPLES) {
      for (const tok of [...words(t.title), ...words(t.body)]) {
        expect(EN_GLOSSES[tok.key!], `${t.id}: ${tok.text}`).toBeTruthy();
        expect(getGloss(tok.key!, "en").english).not.toBe("—");
      }
    }
    expect(getGloss("cat", "en").pinyin).toBe("");
  });

  it("keeps every English section in order without duplicating ids or timestamps", () => {
    expect(EN_SAMPLES).toEqual([...EN_STORY_TEXTS, ...EN_ELEMENTARY_TEXTS, ...EN_INTERMEDIATE_TEXTS, ...EN_ADVANCED_TEXTS, ...EN_NATIVE_TEXTS, ...EN_WIKI_TEXTS]);
    expect(EN_SAMPLES).toHaveLength(125);
    expect(new Set(EN_SAMPLES.map((t) => t.id)).size).toBe(EN_SAMPLES.length);
    expect(new Set(EN_SAMPLES.map((t) => t.createdAt)).size).toBe(EN_SAMPLES.length);
  });

  it("adds ten Elementary stories per level on top of the two seed stories", () => {
    expect(EN_ELEMENTARY_TEXTS).toHaveLength(20);
    for (const level of [3, 4]) {
      expect(EN_ELEMENTARY_TEXTS.filter((t) => t.level === level)).toHaveLength(10);
      expect(EN_SAMPLES.filter((t) => t.level === level && t.kind !== "wiki")).toHaveLength(12);
      expect(EN_SAMPLES.filter((t) => t.level === level)).toHaveLength(level === 3 ? 12 : 17); // + five Wikipedia adaptations at L4–L9
    }
  });

  it("gives every Elementary text complete metadata and 200–400 readable words", () => {
    for (const [index, t] of EN_ELEMENTARY_TEXTS.entries()) {
      expect(t.id).toMatch(/^en-l[34]-[a-z0-9-]+$/);
      expect(t.lang).toBe("en");
      expect(Number.isInteger(t.level)).toBe(true);
      expect([3, 4]).toContain(t.level);
      expect(t.title.trim()).not.toBe("");
      expect(t.blurb.trim()).not.toBe("");
      expect(t.body).toMatch(/\n\n/);
      expect(words(t.body).length, t.id).toBeGreaterThanOrEqual(200);
      expect(words(t.body).length, t.id).toBeLessThanOrEqual(400);
      expect(t.kind).toBe("sample");
      expect(t.category).toBe("graded");
      expect(t.source).toBe("Original (Duki) · AI-drafted");
      expect(t.featured).toBe(false);
      expect(t.createdAt).toBe(250_000 + index);
      expect(t.readAt).toBeNull();
      expect(t.bookmark).toBeNull();
    }
  });

  it("exposes each Elementary text's valid topics through the shared filters", () => {
    expect(Object.keys(EN_ELEMENTARY_TOPICS).sort()).toEqual(EN_ELEMENTARY_TEXTS.map((t) => t.id).sort());
    for (const t of EN_ELEMENTARY_TEXTS) {
      const topics = EN_ELEMENTARY_TOPICS[t.id];
      expect(topics.length).toBeGreaterThan(0);
      expect(topics.length).toBeLessThanOrEqual(3);
      expect(topics.every(isTopic)).toBe(true);
      const entry = textEntry(t, undefined);
      expect(entry.info.topics).toEqual(topics);
      expect(entry.info.badge).toBe(`L${t.level}`);
      expect(entry.info.words).toBe(words(t.body).length);
      expect(matchesFilters(entry, { ...NO_FILTERS, band: "elementary" })).toBe(true);
      expect(matchesFilters(entry, { ...NO_FILTERS, band: "beginner" })).toBe(false);
      for (const topic of topics) {
        expect(matchesFilters(entry, { ...NO_FILTERS, topic })).toBe(true);
      }
    }
  });

  it("adds ten Intermediate texts per level on top of the two seed stories", () => {
    expect(EN_INTERMEDIATE_TEXTS).toHaveLength(20);
    for (const level of [5, 6]) {
      expect(EN_INTERMEDIATE_TEXTS.filter((t) => t.level === level)).toHaveLength(10);
      expect(EN_SAMPLES.filter((t) => t.level === level && t.kind !== "wiki")).toHaveLength(12);
      expect(EN_SAMPLES.filter((t) => t.level === level)).toHaveLength(level === 3 ? 12 : 17); // + five Wikipedia adaptations at L4–L9
    }
  });

  it("gives every Intermediate text complete metadata and 400–700 readable words", () => {
    for (const [index, t] of EN_INTERMEDIATE_TEXTS.entries()) {
      expect(t.id).toMatch(/^en-l[56]-[a-z0-9-]+$/);
      expect(t.lang).toBe("en");
      expect(Number.isInteger(t.level)).toBe(true);
      expect([5, 6]).toContain(t.level);
      expect(t.title.trim()).not.toBe("");
      expect(t.blurb.trim()).not.toBe("");
      expect(t.body).toMatch(/\n\n/);
      expect(words(t.body).length, t.id).toBeGreaterThanOrEqual(400);
      expect(words(t.body).length, t.id).toBeLessThanOrEqual(700);
      expect(t.kind).toBe("sample");
      expect(t.category).toBe("graded");
      expect(t.source).toBe("Original (Duki) · AI-drafted");
      expect(t.featured).toBe(false);
      expect(t.createdAt).toBe(260_000 + index);
      expect(t.readAt).toBeNull();
      expect(t.bookmark).toBeNull();
    }
  });

  it("exposes each Intermediate text's valid topics through the shared filters", () => {
    expect(Object.keys(EN_INTERMEDIATE_TOPICS).sort()).toEqual(EN_INTERMEDIATE_TEXTS.map((t) => t.id).sort());
    for (const t of EN_INTERMEDIATE_TEXTS) {
      const topics = EN_INTERMEDIATE_TOPICS[t.id];
      expect(topics.length).toBeGreaterThan(0);
      expect(topics.length).toBeLessThanOrEqual(3);
      expect(topics.every(isTopic)).toBe(true);
      const entry = textEntry(t, undefined);
      expect(entry.info.topics).toEqual(topics);
      expect(entry.info.badge).toBe(`L${t.level}`);
      expect(entry.info.words).toBe(words(t.body).length);
      expect(matchesFilters(entry, { ...NO_FILTERS, band: "intermediate" })).toBe(true);
      expect(matchesFilters(entry, { ...NO_FILTERS, band: "elementary" })).toBe(false);
      for (const topic of topics) {
        expect(matchesFilters(entry, { ...NO_FILTERS, topic })).toBe(true);
      }
    }
  });

  it("adds ten Advanced readings per level on top of the two seed stories", () => {
    expect(EN_ADVANCED_TEXTS).toHaveLength(20);
    for (const level of [7, 8]) {
      expect(EN_ADVANCED_TEXTS.filter((t) => t.level === level)).toHaveLength(10);
      expect(EN_SAMPLES.filter((t) => t.level === level && t.kind !== "wiki")).toHaveLength(12);
      expect(EN_SAMPLES.filter((t) => t.level === level)).toHaveLength(level === 3 ? 12 : 17); // + five Wikipedia adaptations at L4–L9
    }
  });

  it("gives every Advanced text complete metadata and 600–1000 readable words", () => {
    for (const [index, t] of EN_ADVANCED_TEXTS.entries()) {
      expect(t.id).toMatch(/^en-l[78]-[a-z0-9-]+$/);
      expect(t.lang).toBe("en");
      expect(Number.isInteger(t.level)).toBe(true);
      expect([7, 8]).toContain(t.level);
      expect(t.title.trim()).not.toBe("");
      expect(t.blurb.trim()).not.toBe("");
      expect(t.body).toMatch(/\n\n/);
      expect(words(t.body).length, t.id).toBeGreaterThanOrEqual(600);
      expect(words(t.body).length, t.id).toBeLessThanOrEqual(1000);
      expect(t.kind).toBe("sample");
      expect(t.category).toBe("graded");
      expect(t.source).toBe("Original (Duki) · AI-drafted");
      expect(t.featured).toBe(false);
      expect(t.createdAt).toBe(270_000 + index);
      expect(t.readAt).toBeNull();
      expect(t.bookmark).toBeNull();
    }
  });

  it("exposes each Advanced text's valid topics through the shared filters", () => {
    expect(Object.keys(EN_ADVANCED_TOPICS).sort()).toEqual(EN_ADVANCED_TEXTS.map((t) => t.id).sort());
    for (const t of EN_ADVANCED_TEXTS) {
      const topics = EN_ADVANCED_TOPICS[t.id];
      expect(topics.length).toBeGreaterThan(0);
      expect(topics.length).toBeLessThanOrEqual(3);
      expect(topics.every(isTopic)).toBe(true);
      const entry = textEntry(t, undefined);
      expect(entry.info.topics).toEqual(topics);
      expect(entry.info.badge).toBe(`L${t.level}`);
      expect(entry.info.words).toBe(words(t.body).length);
      expect(matchesFilters(entry, { ...NO_FILTERS, band: "advanced" })).toBe(true);
      expect(matchesFilters(entry, { ...NO_FILTERS, band: "native" })).toBe(false);
      for (const topic of topics) {
        expect(matchesFilters(entry, { ...NO_FILTERS, topic })).toBe(true);
      }
    }
  });

  it("adds eight L9 and seven L10 readings without duplicate library rows", () => {
    expect(EN_NATIVE_TEXTS).toHaveLength(15);
    expect(EN_NATIVE_TEXTS.filter((t) => t.level === 9)).toHaveLength(8);
    expect(EN_NATIVE_TEXTS.filter((t) => t.level === 10)).toHaveLength(7);
    for (const t of [...EN_STORY_TEXTS, ...EN_NATIVE_TEXTS]) {
      expect(EN_SAMPLES.filter((sample) => sample.id === t.id)).toEqual([t]);
    }
    expect(new Set(EN_SAMPLES.map((t) => t.id)).size).toBe(EN_SAMPLES.length);
    expect(new Set(EN_SAMPLES.map((t) => t.createdAt)).size).toBe(EN_SAMPLES.length);
  });

  it("gives every Native reading complete metadata and 800–1500 readable words", () => {
    for (const [index, t] of EN_NATIVE_TEXTS.entries()) {
      expect(t.id).toMatch(/^en-l(?:9|10)-[a-z0-9-]+$/);
      expect(t.lang).toBe("en");
      expect(Number.isInteger(t.level)).toBe(true);
      expect([9, 10]).toContain(t.level);
      expect(t.title.trim()).not.toBe("");
      expect(t.blurb.trim()).not.toBe("");
      expect(t.blurb.length).toBeLessThanOrEqual(90);
      expect(t.body).toMatch(/\n\n/);
      expect(words(t.body).length, t.id).toBeGreaterThanOrEqual(800);
      expect(words(t.body).length, t.id).toBeLessThanOrEqual(1500);
      expect(t.kind).toBe("sample");
      expect(t.category).toBe("graded");
      expect(t.source).toBe("Original (Duki) · AI-drafted");
      expect(t.featured).toBe(false);
      expect(t.createdAt).toBe(280_000 + index);
      expect(t.readAt).toBeNull();
      expect(t.bookmark).toBeNull();
    }
  });

  it("resolves Native topics without mutating seed topics or leaking to Mandarin", () => {
    expect(Object.keys(EN_NATIVE_TOPICS).sort()).toEqual(EN_NATIVE_TEXTS.map((t) => t.id).sort());
    for (const t of EN_NATIVE_TEXTS) {
      expect(EN_TOPICS[t.id]).toBeUndefined();
      const topics = EN_NATIVE_TOPICS[t.id];
      expect(topics.length).toBeGreaterThan(0);
      expect(topics.length).toBeLessThanOrEqual(3);
      expect(new Set(topics).size).toBe(topics.length);
      expect(topics.every(isTopic)).toBe(true);
      const entry = textEntry(t, undefined);
      expect(entry.info.topics).toEqual(topics);
      expect(entry.info.badge).toBe(`L${t.level}`);
      expect(entry.info.words).toBe(words(t.body).length);
      expect(matchesFilters(entry, { ...NO_FILTERS, band: "native" })).toBe(true);
      expect(matchesFilters(entry, { ...NO_FILTERS, band: "advanced" })).toBe(false);
      for (const topic of topics) {
        expect(matchesFilters(entry, { ...NO_FILTERS, topic })).toBe(true);
      }
      expect(matchesFilters(entry, { ...NO_FILTERS, topic: "classics" })).toBe(false);
      expect(describeText({ ...t, lang: "zh" }).topics).toEqual([]);
    }
  });

  it("seeds all thirty Wikipedia adaptations once, five per level from L4 to L9", () => {
    expect(EN_WIKI_TEXTS).toHaveLength(30);
    for (const level of [4, 5, 6, 7, 8, 9]) {
      expect(EN_WIKI_TEXTS.filter((t) => t.level === level)).toHaveLength(5);
    }
    expect(new Set(EN_SAMPLES.map((t) => t.id)).size).toBe(EN_SAMPLES.length);
    expect(new Set(EN_SAMPLES.map((t) => t.createdAt)).size).toBe(EN_SAMPLES.length);
    expect(new Set(EN_WIKI_TEXTS.map((t) => t.body)).size).toBe(30);
  });

  it("gives every Wikipedia item an inline body, permanent metadata, and source credit", () => {
    for (const [index, t] of EN_WIKI_TEXTS.entries()) {
      expect(t.id).toMatch(/^en-wiki-[a-z0-9-]+$/);
      expect(t.lang).toBe("en");
      expect(Number.isInteger(t.level)).toBe(true);
      expect(t.level).toBeGreaterThanOrEqual(4);
      expect(t.level).toBeLessThanOrEqual(9);
      expect(t.title.trim()).not.toBe("");
      expect(t.blurb.trim()).not.toBe("");
      expect(t.blurb.length).toBeLessThanOrEqual(90);
      expect(t.wikiTitle?.trim()).toBeTruthy();
      expect(t.body).toMatch(/\n\n/);
      expect(words(t.body).length, t.id).toBeGreaterThanOrEqual(140);
      expect(t.kind).toBe("wiki");
      expect(t.category).toBe("wiki");
      expect(t.source).toBe("Adapted from English Wikipedia, CC BY-SA");
      const url = new URL(t.sourceUrl!);
      expect(url.origin).toBe("https://en.wikipedia.org");
      expect(url.pathname).toBe(`/wiki/${encodeURIComponent(t.wikiTitle!.replaceAll(" ", "_"))}`);
      expect(t.createdAt).toBe(220_000 + index);
      expect(t.featured).toBe(false);
      expect(t.readAt).toBeNull();
      expect(t.bookmark).toBeNull();
    }
  });

  it("exposes Wikipedia topics, levels, and English word counts through the shared filters", () => {
    expect(Object.keys(EN_WIKI_TOPICS).sort()).toEqual(EN_WIKI_TEXTS.map((t) => t.id).sort());
    for (const t of EN_WIKI_TEXTS) {
      const topics = EN_WIKI_TOPICS[t.id];
      expect(topics).toContain("encyclopedia");
      expect(topics.length).toBeGreaterThanOrEqual(2);
      expect(topics.every(isTopic)).toBe(true);
      const entry = textEntry(t, undefined);
      expect(entry.info.topics).toEqual(topics);
      expect(entry.info.badge).toBe(`L${t.level}`);
      expect(entry.info.words).toBe(words(t.body).length);
      expect(entry.info.chars).toBeNull();
      expect(entry.info.minutes).toBeGreaterThan(0);
      for (const topic of topics) {
        expect(matchesFilters(entry, { ...NO_FILTERS, topic })).toBe(true);
      }
      expect(matchesFilters(entry, { ...NO_FILTERS, topic: "letters" })).toBe(false);
      // English topic lookups must not leak into Mandarin rows.
      expect(describeText({ ...t, lang: "zh" }).topics).toEqual(["encyclopedia"]);
    }
  });

  it("glosses character names as names, not dictionary senses", () => {
    for (const name of ["nina", "leo", "maya", "jack", "pip", "sophie", "eva", "mara", "leah", "frances", "olbers", "bell", "vale", "graham", "reeves", "celia"]) expect(EN_GLOSSES[name]).toBe("（人名）");
  });

  it("keeps a safe fallback for English words awaiting the gloss rebuild", () => {
    expect(getGloss("dukiunglossedfixture", "en").english).toBe("—");
  });

  it("labels a level badge and word length on English cards", () => {
    const info = describeText(EN_SAMPLES.find((t) => t.level === 3)!);
    expect(info.badge).toBe("L3");
    expect(info.band).toBe("elementary");
    const fixture = { id: "en-fixture", lang: "en", title: "t", blurb: "", body: "one two three", createdAt: 1, readAt: null, bookmark: null } as LibraryText;
    expect(lengthLabel(describeText(fixture))).toBe("3 words · 1 min");
  });

  it("exposes story topics and word-count length buckets to the shared filters", () => {
    const cup = EN_SAMPLES.find((t) => t.id === "en-l1-the-red-cup")!;
    const info = describeText(cup);
    expect(info.topics).toEqual(expect.arrayContaining(["daily-life", "family"]));
    expect(info.words).toBeGreaterThan(0);
    expect(lengthBucket(info.words!)).toBe("short");
    const entry = textEntry(cup, undefined);
    expect(matchesFilters(entry, { ...NO_FILTERS, topic: "daily-life" })).toBe(true);
    expect(matchesFilters(entry, { ...NO_FILTERS, topic: "school" })).toBe(false);
    expect(matchesFilters(entry, { ...NO_FILTERS, band: "beginner" })).toBe(true);
    expect(matchesFilters(entry, { ...NO_FILTERS, band: "native" })).toBe(false);
    expect(matchesFilters(entry, { ...NO_FILTERS, length: "short" })).toBe(true);
    expect(matchesFilters(entry, { ...NO_FILTERS, length: "long" })).toBe(false);
    const inherit = textEntry(EN_SAMPLES.find((t) => t.id === "en-l10-the-inheritance")!, undefined);
    expect(inherit.info.words).toBeGreaterThanOrEqual(300);
    expect(matchesFilters(inherit, { ...NO_FILTERS, length: "medium" })).toBe(true);
    expect(matchesFilters(entry, { ...NO_FILTERS, query: "red cup" })).toBe(true);
    expect(matchesFilters(entry, { ...NO_FILTERS, query: "boredom" })).toBe(false);
  });
});
