import { describe, expect, it } from "vitest";
import {
  estimateKnown,
  hanCount,
  hskCoverage,
  levelBand,
  levelFromCoverage,
  makeHskLookup,
  readingMinutes,
} from "./difficulty";

const HSK = new Map<string, number>([
  ["我", 1],
  ["喝", 1],
  ["茶", 1],
  ["家", 1],
  ["里", 1],
  ["说话", 1],
  ["刮风", 3],
  ["窃取", 6],
  ["经济", 4],
]);

describe("makeHskLookup", () => {
  const look = makeHskLookup(HSK);
  it("returns listed words directly", () => {
    expect(look("茶")).toBe(1);
    expect(look("经济")).toBe(4);
  });
  it("covers compounds made of listed words at their hardest part", () => {
    expect(look("喝茶")).toBe(1);
    expect(look("家里")).toBe(1);
    expect(look("我家")).toBe(1);
  });
  it("counts a character known only inside a word one level later", () => {
    expect(look("说")).toBe(2); // from 说话 (HSK 1)
    expect(look("风")).toBe(4); // from 刮风 (HSK 3)
  });
  it("leaves characters only seen in HSK 6 words uncovered", () => {
    expect(look("窃")).toBeUndefined();
  });
  it("leaves unknown characters uncovered", () => {
    expect(look("茴香豆")).toBeUndefined();
  });
});

describe("hskCoverage / levelFromCoverage", () => {
  it("computes cumulative coverage per HSK level", () => {
    const { tokens, coverage } = hskCoverage(["我", "喝", "茶", "经济"], (w) => HSK.get(w));
    expect(tokens).toBe(4);
    expect(coverage[0]).toBeCloseTo(0.75);
    expect(coverage[3]).toBeCloseTo(1);
    expect(coverage[5]).toBeCloseTo(1);
  });

  it("maps 95% coverage at HSK k to level k", () => {
    expect(levelFromCoverage([0.96, 1, 1, 1, 1, 1]).level).toBe(1);
    expect(levelFromCoverage([0.5, 0.8, 0.95, 1, 1, 1]).level).toBe(3);
    expect(levelFromCoverage([0.3, 0.4, 0.5, 0.6, 0.7, 0.951]).level).toBe(6);
  });

  it("splits text beyond HSK 6 into L7–L10", () => {
    expect(levelFromCoverage([0, 0, 0, 0, 0, 0.92]).level).toBe(7);
    expect(levelFromCoverage([0, 0, 0, 0, 0, 0.87]).level).toBe(8);
    expect(levelFromCoverage([0, 0, 0, 0, 0, 0.82]).level).toBe(9);
    expect(levelFromCoverage([0, 0, 0, 0, 0, 0.5]).level).toBe(10);
  });

  it("orders texts within a level with a fractional score", () => {
    const a = levelFromCoverage([0.5, 0.94, 0.99, 1, 1, 1]);
    const b = levelFromCoverage([0.5, 0.7, 0.951, 1, 1, 1]);
    expect(a.level).toBe(3);
    expect(b.level).toBe(3);
    expect(a.score).toBeLessThan(b.score);
    expect(a.score).toBeGreaterThanOrEqual(3);
    expect(b.score).toBeLessThan(4);
  });

  it("an empty text is level 1", () => {
    expect(levelFromCoverage(hskCoverage([], () => undefined).coverage).level).toBe(1);
  });
});

describe("estimateKnown", () => {
  const profile = { tokens: 100, words: ["的", "我", "神"], counts: [40, 20, 10] };
  it("weights known words by frequency", () => {
    expect(estimateKnown(profile, (w) => w === "的")).toBeCloseTo(0.4);
    expect(estimateKnown(profile, (w) => w !== "神")).toBeCloseTo(0.6);
  });
  it("treats the unlisted tail as unknown (never overestimates)", () => {
    expect(estimateKnown(profile, () => true)).toBeCloseTo(0.7);
  });
  it("handles an empty profile", () => {
    expect(estimateKnown({ tokens: 0, words: [], counts: [] }, () => true)).toBe(0);
  });
});

describe("helpers", () => {
  it("counts Han characters only", () => {
    expect(hanCount("¹起初，神创造天地。abc")).toBe(7);
  });
  it("gives at least a minute and reads faster at higher levels", () => {
    expect(readingMinutes(10, 1)).toBe(1);
    expect(readingMinutes(1800, 1)).toBeGreaterThan(readingMinutes(1800, 8));
  });
  it("groups levels into bands", () => {
    expect(levelBand(1)).toBe("beginner");
    expect(levelBand(4)).toBe("elementary");
    expect(levelBand(6)).toBe("intermediate");
    expect(levelBand(8)).toBe("advanced");
    expect(levelBand(10)).toBe("native");
  });
});
