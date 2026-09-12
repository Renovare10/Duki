import { describe, expect, it } from "vitest";
import {
  coveragePercents,
  fitLabel,
  isFullyKnown,
  matchesLevel,
  pickSuggestion,
  remainingUniques,
  scoreTokens,
  stillTeaches,
} from "./score";
import type { TextScore, Token, WordStatus } from "../types";

function score(partial: Partial<TextScore> & Pick<TextScore, "unknownLoad" | "unique" | "total">): TextScore {
  return {
    known: 0,
    shaky: 0,
    unknown: 0,
    knownPct: 0,
    uniqueUnknown: 0,
    uniqueShaky: 0,
    ...partial,
  };
}

function words(list: string[]): Token[] {
  return list.map((text, index) => ({ text, isWord: true, index }));
}

describe("scoreTokens", () => {
  it("counts token instances, not unique types", () => {
    const statuses = new Map<string, WordStatus>([["我", "known"]]);
    const score = scoreTokens(words(["我", "喜欢", "我"]), statuses);
    expect(score.total).toBe(3);
    expect(score.known).toBe(2);
    expect(score.unknown).toBe(1);
    expect(score.knownPct).toBeCloseTo(2 / 3);
  });

  it("treats unmarked and unknown as not known", () => {
    const statuses = new Map<string, WordStatus>([
      ["好", "unknown"],
      ["看", "shaky"],
    ]);
    const score = scoreTokens(words(["好", "看", "书"]), statuses);
    expect(score.known).toBe(0);
    expect(score.shaky).toBe(1);
    expect(score.unknown).toBe(2);
    expect(score.unknownLoad).toBe(1);
  });
});

describe("pickSuggestion", () => {
  it("prefers a text near 5–10% unknown", () => {
    const scores = new Map([
      ["hard", score({ unknownLoad: 0.4, unique: 40, total: 80 })],
      ["right", score({ unknownLoad: 0.08, unique: 20, total: 50 })],
      ["easy", score({ unknownLoad: 0.02, unique: 10, total: 40 })],
    ]);
    expect(
      pickSuggestion([{ id: "hard" }, { id: "right" }, { id: "easy" }], scores),
    ).toBe("right");
  });

  it("falls back to the shortest when everything is still unknown", () => {
    const scores = new Map([
      ["long", score({ unknownLoad: 1, unique: 30, total: 80 })],
      ["short", score({ unknownLoad: 1, unique: 12, total: 20 })],
    ]);
    expect(pickSuggestion([{ id: "long" }, { id: "short" }], scores)).toBe("short");
  });

  it("never suggests a 100% known text", () => {
    const scores = new Map([
      ["done", score({ unknownLoad: 0, uniqueUnknown: 0, uniqueShaky: 0, unique: 10, total: 40 })],
      ["harder", score({ unknownLoad: 0.18, uniqueUnknown: 6, unique: 20, total: 50 })],
    ]);
    expect(pickSuggestion([{ id: "done" }, { id: "harder" }], scores)).toBe("harder");
  });

  it("prefers slightly hard over fully known or tiny leftover", () => {
    const scores = new Map([
      ["known", score({ unknownLoad: 0, uniqueUnknown: 0, uniqueShaky: 0, unique: 8, total: 20 })],
      ["easy", score({ unknownLoad: 0.02, uniqueUnknown: 1, unique: 10, total: 40 })],
      ["harder", score({ unknownLoad: 0.16, uniqueUnknown: 5, unique: 18, total: 50 })],
    ]);
    expect(
      pickSuggestion([{ id: "known" }, { id: "easy" }, { id: "harder" }], scores),
    ).toBe("harder");
  });

  it("returns null when every text is already known", () => {
    const scores = new Map([
      ["a", score({ unknownLoad: 0, uniqueUnknown: 0, uniqueShaky: 0, unique: 8, total: 20 })],
    ]);
    expect(pickSuggestion([{ id: "a" }], scores)).toBeNull();
  });
});

describe("isFullyKnown / matchesLevel", () => {
  const known = score({
    unknownLoad: 0,
    uniqueUnknown: 0,
    uniqueShaky: 0,
    knownPct: 1,
    unique: 10,
    total: 40,
  });
  const easyish = score({ unknownLoad: 0.03, uniqueUnknown: 1, unique: 10, total: 40 });

  it("treats 0% unknown as fully known", () => {
    expect(isFullyKnown(known)).toBe(true);
    expect(matchesLevel(known, "easy")).toBe(false);
    expect(matchesLevel(known, "known")).toBe(true);
  });

  it("does not label an unscored stub as Harder", () => {
    expect(
      fitLabel({
        total: 0,
        known: 0,
        shaky: 0,
        unknown: 0,
        knownPct: 0,
        unknownLoad: 0,
        unique: 0,
        uniqueUnknown: 0,
        uniqueShaky: 0,
      }),
    ).toBe("unscored");
  });

  it("lets Easy include leftover unknown but not 100% known", () => {
    expect(fitLabel(easyish)).toBe("easy");
    expect(matchesLevel(easyish, "easy")).toBe(true);
    expect(isFullyKnown(easyish)).toBe(false);
    expect(stillTeaches(easyish)).toBe(true);
    expect(stillTeaches(known)).toBe(false);
  });
});

describe("remainingUniques", () => {
  it("splits leftover unknown from shaky", () => {
    const statuses = new Map<string, WordStatus>([
      ["我", "known"],
      ["茶", "shaky"],
    ]);
    expect(remainingUniques(words(["我", "茶", "书"]), statuses)).toEqual({
      uniqueUnknown: 1,
      uniqueShaky: 1,
    });
  });
});

describe("coveragePercents", () => {
  it("makes known and unknown add to 100", () => {
    expect(
      coveragePercents({
        total: 30,
        known: 1,
        shaky: 0,
        unknown: 29,
        knownPct: 1 / 30,
        unknownLoad: 29 / 30,
        unique: 20,
        uniqueUnknown: 19,
        uniqueShaky: 0,
      }),
    ).toEqual({ known: 3, unknown: 97 });
  });
});

describe("fitLabel", () => {
  it("treats a fully unknown text as harder, not unread", () => {
    expect(
      fitLabel({
        total: 10,
        known: 0,
        shaky: 0,
        unknown: 10,
        knownPct: 0,
        unknownLoad: 1,
        unique: 8,
        uniqueUnknown: 8,
        uniqueShaky: 0,
      }),
    ).toBe("hard");
  });

  it("labels a 7% unknown text as just right", () => {
    expect(
      fitLabel({
        total: 100,
        known: 93,
        shaky: 2,
        unknown: 5,
        knownPct: 0.93,
        unknownLoad: 0.07,
        unique: 40,
        uniqueUnknown: 6,
        uniqueShaky: 2,
      }),
    ).toBe("just-right");
  });

  it("does not treat a 43% unknown text as just right", () => {
    const hard = {
      total: 100,
      known: 57,
      shaky: 0,
      unknown: 43,
      knownPct: 0.57,
      unknownLoad: 0.43,
      unique: 40,
      uniqueUnknown: 30,
      uniqueShaky: 0,
    };
    expect(fitLabel(hard)).toBe("hard");
    expect(matchesLevel(hard, "just-right")).toBe(false);
    expect(matchesLevel(hard, "hard")).toBe(true);
  });
});
