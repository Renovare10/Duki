import { describe, expect, it } from "vitest";
import { EN_GLOSSES, EN_SAMPLES } from "../data/en-samples";
import { EN_STORIES, EN_STORY_TEXTS } from "../data/en-stories";
import { EN_CLASSICS_TEXTS, EN_CLASSICS_TOPICS } from "../data/en-classics";
import { isTopic } from "../data/topics";
import type { LibraryText } from "../types";
import { getGloss } from "./glossary";
import { describeText, isClassicText, isClassicEntry, lengthBucket, lengthLabel, matchesFilters, textEntry, NO_FILTERS } from "./library";
import { segment } from "./segment";

const words = (body: string) => segment(body, () => false, 8, "en").filter((t) => t.isWord);

describe("English stories", () => {
  it("ships exactly two seed stories for each level 1–10, all English and uniquely ided", () => {
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

  it("has a Chinese gloss for every seed word a reader can tap", () => {
    for (const t of EN_STORY_TEXTS) {
      for (const tok of [...words(t.title), ...words(t.body)]) {
        expect(EN_GLOSSES[tok.key!], `${t.id}: ${tok.text}`).toBeTruthy();
        expect(getGloss(tok.key!, "en").english).not.toBe("—");
      }
    }
    expect(getGloss("cat", "en").pinyin).toBe("");
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

describe("English classics", () => {
  it("adds twenty classics, two per level, without replacing seed stories or colliding in the catalog", () => {
    expect(EN_CLASSICS_TEXTS).toHaveLength(20);
    for (let level = 1; level <= 10; level++) {
      expect(EN_CLASSICS_TEXTS.filter((t) => t.level === level)).toHaveLength(2);
    }
    for (const t of [...EN_STORY_TEXTS, ...EN_CLASSICS_TEXTS]) expect(EN_SAMPLES).toContain(t);
    expect(new Set(EN_SAMPLES.map((t) => t.id)).size).toBe(EN_SAMPLES.length);
    expect(new Set(EN_SAMPLES.map((t) => t.createdAt)).size).toBe(EN_SAMPLES.length);
  });

  it("supplies complete inline metadata and an attributed public-domain source for every classic", () => {
    for (const [index, t] of EN_CLASSICS_TEXTS.entries()) {
      expect(t.id).toMatch(/^en-classic-[a-z0-9-]+$/);
      expect(t.lang).toBe("en");
      expect(Number.isInteger(t.level)).toBe(true);
      expect(t.level).toBeGreaterThanOrEqual(1);
      expect(t.level).toBeLessThanOrEqual(10);
      expect(t.title.trim()).not.toBe("");
      expect(t.blurb.trim()).not.toBe("");
      expect(t.author?.trim()).toBeTruthy();
      expect(t.body.trim()).not.toBe("");
      expect(words(t.body).length).toBeGreaterThanOrEqual(60);
      expect(words(t.body).length).toBeLessThanOrEqual(900);
      if (t.level! <= 2) expect(words(t.body).length).toBeLessThanOrEqual(180);
      expect(t.kind).toBe("sample");
      expect(t.category).toBe("story");
      expect(t.source).toMatch(/^Public domain \(/);
      expect(t.sourceUrl).toMatch(/^https:\/\/www\.gutenberg\.org\/ebooks\/\d+$/);
      expect(t.featured).toBe(false);
      expect(t.createdAt).toBe(230_000 + index);
      expect(t.readAt).toBeNull();
      expect(t.bookmark).toBeNull();
      expect(t.seriesId).toBeUndefined(); // twenty singles, hence twenty Classics cards
    }
  });

  it("distinguishes fourteen AI-drafted retellings from six original poems with intact verse lines", () => {
    const retellings = EN_CLASSICS_TEXTS.filter((t) => t.level! <= 7);
    expect(retellings).toHaveLength(14);
    for (const t of retellings) {
      expect(t.source).toContain("retold");
      expect(t.source).toContain("AI-drafted");
      expect(t.body).toContain("\n\n");
    }
    const poems = EN_CLASSICS_TEXTS.filter((t) => t.level! >= 8);
    expect(poems).toHaveLength(6);
    const lineCounts = [20, 20, 14, 33, 14, 14];
    const stanzaCounts = [4, 5, 1, 3, 1, 1];
    poems.forEach((t, i) => {
      expect(t.source).not.toContain("AI-drafted");
      expect(EN_CLASSICS_TOPICS[t.id]).toContain("poetry");
      expect(t.body.split("\n").filter((line) => line.trim()), t.id).toHaveLength(lineCounts[i]);
      expect(t.body.split("\n\n"), t.id).toHaveLength(stanzaCounts[i]);
    });
    const princess = EN_CLASSICS_TEXTS.find((t) => t.id === "en-classic-andersen-real-princess")!;
    expect(princess.body).toContain("three little peas");
    expect(poems[1].blurb).toContain("1890"); // deliberately the edited five-stanza Chariot
  });

  it("exposes valid classics topics, level badges, and word lengths to shared filters", () => {
    expect(Object.keys(EN_CLASSICS_TOPICS).sort()).toEqual(EN_CLASSICS_TEXTS.map((t) => t.id).sort());
    for (const t of EN_CLASSICS_TEXTS) {
      const topics = EN_CLASSICS_TOPICS[t.id];
      expect(topics.length).toBeGreaterThan(0);
      expect(topics.length).toBeLessThanOrEqual(3);
      expect(topics.every(isTopic)).toBe(true);
      expect(topics).toContain("classics");
      const entry = textEntry(t, undefined);
      expect(entry.info.topics).toEqual(topics);
      expect(entry.info.badge).toBe(`L${t.level}`);
      expect(entry.info.words).toBe(words(t.body).length);
      for (const topic of topics) expect(matchesFilters(entry, { ...NO_FILTERS, topic })).toBe(true);
      expect(matchesFilters(entry, { ...NO_FILTERS, band: entry.info.band! })).toBe(true);
      expect(describeText({ ...t, lang: "zh" }).topics).toEqual([]);
    }
  });

  it("fills the Classics shelf and excludes classics from Home's graded shelves", () => {
    const entries = EN_SAMPLES.map((t) => textEntry(t, undefined));
    const classics = entries.filter(isClassicEntry);
    expect(classics.map((e) => e.id)).toEqual(EN_CLASSICS_TEXTS.map((t) => t.id));
    const graded = entries.filter((e) => e.info.level !== null && !isClassicEntry(e));
    for (const t of EN_CLASSICS_TEXTS) {
      expect(isClassicText(t)).toBe(true);
      expect(graded.some((e) => e.id === t.id)).toBe(false);
      expect(isClassicText({ ...t, lang: "zh" })).toBe(false);
    }
    for (const t of EN_STORY_TEXTS) expect(isClassicText(t)).toBe(false);
  });

  it("keeps a safe fallback for words awaiting the separate release gloss rebuild", () => {
    expect(getGloss("dukiunglossedfixture", "en").english).toBe("—");
  });
});
