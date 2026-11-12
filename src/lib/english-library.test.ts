import { describe, expect, it } from "vitest";
import { EN_GLOSSES, EN_SAMPLES } from "../data/en-samples";
import { EN_STORIES, EN_STORY_TEXTS } from "../data/en-stories";
import { EN_BEGINNER_TEXTS, EN_BEGINNER_TOPICS } from "../data/en-level-beginner";
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

  it("adds ten new Beginner stories per level to the English shelf", () => {
    const added = EN_SAMPLES.filter((t) => !EN_STORIES.some((s) => s.id === t.id));
    expect(added).toHaveLength(20);
    for (const level of [1, 2]) {
      expect(added.filter((t) => t.level === level)).toHaveLength(10);
    }
    expect(EN_SAMPLES).toEqual([...EN_STORY_TEXTS, ...EN_BEGINNER_TEXTS]);
    expect(new Set(EN_SAMPLES.map((t) => t.id)).size).toBe(EN_SAMPLES.length);
    expect(new Set(EN_SAMPLES.map((t) => t.createdAt)).size).toBe(EN_SAMPLES.length);
  });

  it("gets longer as the level rises", () => {
    const avg = (level: number) => {
      const rows = EN_STORIES.filter((s) => s.level === level);
      return rows.reduce((n, s) => n + words(s.body).length, 0) / rows.length;
    };
    for (let level = 2; level <= 10; level++) expect(avg(level)).toBeGreaterThan(avg(level - 1));
  });

  it("has a Chinese gloss for every tappable word in the original seed stories", () => {
    for (const t of EN_STORY_TEXTS) {
      for (const tok of [...words(t.title), ...words(t.body)]) {
        expect(EN_GLOSSES[tok.key!], `${t.id}: ${tok.text}`).toBeTruthy();
        expect(getGloss(tok.key!, "en").english).not.toBe("—");
      }
    }
    expect(getGloss("cat", "en").pinyin).toBe("");
  });

  it("gives each Beginner reading complete metadata and 80–200 readable words", () => {
    expect(EN_BEGINNER_TEXTS).toHaveLength(20);
    for (const [index, t] of EN_BEGINNER_TEXTS.entries()) {
      expect(t.id).toMatch(/^en-l[12]-[a-z0-9-]+$/);
      expect(t.lang).toBe("en");
      expect(Number.isInteger(t.level)).toBe(true);
      expect([1, 2]).toContain(t.level);
      expect(t.title.trim()).not.toBe("");
      expect(t.blurb.trim()).not.toBe("");
      expect(t.body.trim()).not.toBe("");
      expect(t.body).toMatch(/\n\n/);
      expect(words(t.body).length, t.id).toBeGreaterThanOrEqual(80);
      expect(words(t.body).length, t.id).toBeLessThanOrEqual(200);
      expect(t.kind).toBe("sample");
      expect(t.category).toBe("graded");
      expect(t.source).toBe("Original (Duki) · AI-drafted");
      expect(t.featured).toBe(false);
      expect(t.createdAt).toBe(240_000 + index);
      expect(t.readAt).toBeNull();
      expect(t.bookmark).toBeNull();
    }
  });

  it("exposes valid Beginner topics and level bands through shared filters without Mandarin leakage", () => {
    expect(Object.keys(EN_BEGINNER_TOPICS).sort()).toEqual(EN_BEGINNER_TEXTS.map((t) => t.id).sort());
    for (const t of EN_BEGINNER_TEXTS) {
      const topics = EN_BEGINNER_TOPICS[t.id];
      expect(topics.length).toBeGreaterThan(0);
      expect(topics.length).toBeLessThanOrEqual(3);
      expect(new Set(topics).size).toBe(topics.length);
      expect(topics.every(isTopic)).toBe(true);
      const entry = textEntry(t, undefined);
      expect(entry.info.topics, t.id).toEqual(topics);
      expect(entry.info.badge).toBe(`L${t.level}`);
      expect(entry.info.words).toBe(words(t.body).length);
      expect(matchesFilters(entry, { ...NO_FILTERS, band: "beginner" })).toBe(true);
      expect(matchesFilters(entry, { ...NO_FILTERS, band: "elementary" })).toBe(false);
      expect(matchesFilters(entry, { ...NO_FILTERS, length: "short" })).toBe(true);
      for (const topic of topics) {
        expect(matchesFilters(entry, { ...NO_FILTERS, topic })).toBe(true);
      }
      expect(matchesFilters(entry, { ...NO_FILTERS, topic: "classics" })).toBe(false);
      expect(describeText({ ...t, lang: "zh" }).topics).toEqual([]);
    }
  });

  it("keeps a safe fallback for new English words awaiting the release gloss rebuild", () => {
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
