import { describe, expect, it } from "vitest";
import { EN_GLOSSES, EN_SAMPLES } from "../data/en-samples";
import { EN_STORIES } from "../data/en-stories";
import type { LibraryText } from "../types";
import { getGloss } from "./glossary";
import { describeText, lengthLabel } from "./library";
import { segment } from "./segment";

const words = (body: string) => segment(body, () => false, 8, "en").filter((t) => t.isWord);

describe("English stories", () => {
  it("ships exactly two stories for each level 1–10, all English and uniquely ided", () => {
    for (let level = 1; level <= 10; level++) {
      expect(EN_SAMPLES.filter((t) => t.level === level)).toHaveLength(2);
    }
    expect(EN_SAMPLES).toHaveLength(20);
    expect(new Set(EN_SAMPLES.map((t) => t.id)).size).toBe(20);
    for (const t of EN_SAMPLES) {
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

  it("has a Chinese gloss for every word a reader can tap", () => {
    for (const t of EN_SAMPLES) {
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
});
