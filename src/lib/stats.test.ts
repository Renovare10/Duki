import { describe, expect, it } from "vitest";
import {
  countUnknownBuckets,
  isMidBandLoad,
  lexiconCounts,
  midBandEmpty,
  textProgress,
  textsByProgress,
  topMisses,
  unknownLoadBucketKey,
  wordsByStatus,
} from "./stats";
import type { TextScore } from "../types";
import { normalizeText } from "./text";
import { normalizeWord } from "./word";

describe("lexiconCounts", () => {
  it("counts unique words by status", () => {
    const words = [
      normalizeWord({ hanzi: "\u6211", status: "known" }),
      normalizeWord({ hanzi: "\u4f60", status: "known" }),
      normalizeWord({ hanzi: "\u4ed6", status: "shaky" }),
      normalizeWord({ hanzi: "\u5979", status: "unknown" }),
    ];
    expect(lexiconCounts(words)).toEqual({ known: 2, shaky: 1, unknown: 1 });
  });
});

describe("topMisses", () => {
  it("orders by the requested count", () => {
    const words = [
      normalizeWord({ hanzi: "\u96be", status: "unknown", dontKnowCount: 5 }),
      normalizeWord({ hanzi: "\u6613", status: "shaky", dontKnowCount: 1, barelyCount: 8 }),
      normalizeWord({ hanzi: "\u597d", status: "known", okayCount: 4 }),
    ];
    expect(topMisses(words, "dontKnowCount", 2).map((w) => w.hanzi)).toEqual(["\u96be", "\u6613"]);
    expect(topMisses(words, "barelyCount", 2).map((w) => w.hanzi)).toEqual(["\u6613"]);
  });
});

describe("textProgress", () => {
  it("separates read, in-progress, and untouched", () => {
    const texts = [
      normalizeText({ id: "a", body: "\u4e00", readAt: 1, createdAt: 1 }),
      normalizeText({
        id: "b",
        body: "\u4e8c",
        readAt: null,
        bookmark: { tokenIndex: 4, scrollY: 200 },
        createdAt: 2,
      }),
      normalizeText({ id: "c", body: "\u4e09", createdAt: 3 }),
    ];
    expect(textProgress(texts)).toEqual({ finished: 1, inProgress: 1, untouched: 1 });
    expect(textsByProgress(texts, "finished").map((t) => t.id)).toEqual(["a"]);
    expect(textsByProgress(texts, "inProgress").map((t) => t.id)).toEqual(["b"]);
    expect(textsByProgress(texts, "untouched").map((t) => t.id)).toEqual(["c"]);
  });
});

describe("wordsByStatus", () => {
  it("lists lexicon words of one status", () => {
    const words = [
      normalizeWord({ hanzi: "\u6211", status: "known", okayCount: 1 }),
      normalizeWord({ hanzi: "\u96be", status: "unknown", dontKnowCount: 2 }),
    ];
    expect(wordsByStatus(words, "known").map((w) => w.hanzi)).toEqual(["\u6211"]);
    expect(wordsByStatus(words, "unknown").map((w) => w.hanzi)).toEqual(["\u96be"]);
  });
});

function sc(load: number, total = 20): TextScore {
  return {
    total,
    known: Math.round((1 - load) * total),
    shaky: 0,
    unknown: Math.round(load * total),
    knownPct: 1 - load,
    unknownLoad: load,
    unique: 10,
    uniqueUnknown: load === 0 ? 0 : 3,
    uniqueShaky: 0,
  };
}

describe("unknownLoadBucketKey", () => {
  it("places loads into inventory buckets", () => {
    expect(unknownLoadBucketKey(0)).toBe("0-5%");
    expect(unknownLoadBucketKey(0.049)).toBe("0-5%");
    expect(unknownLoadBucketKey(0.05)).toBe("5-10%");
    expect(unknownLoadBucketKey(0.1)).toBe("10-15%");
    expect(unknownLoadBucketKey(0.149)).toBe("10-15%");
    expect(unknownLoadBucketKey(0.15)).toBe("15-20%");
    expect(unknownLoadBucketKey(0.2)).toBe("20%+");
  });
});

describe("isMidBandLoad / midBandEmpty", () => {
  it("treats 5\u201315% as the mid-band", () => {
    expect(isMidBandLoad(0.05)).toBe(true);
    expect(isMidBandLoad(0.149)).toBe(true);
    expect(isMidBandLoad(0.03)).toBe(false);
    expect(isMidBandLoad(0.15)).toBe(false);
  });

  it("is empty only when scored texts exist but none sit mid-band", () => {
    expect(midBandEmpty([])).toBe(false);
    expect(midBandEmpty([sc(0, 0)])).toBe(false);
    expect(midBandEmpty([sc(0.03), sc(0.22)])).toBe(true);
    expect(midBandEmpty([sc(0.03), sc(0.08)])).toBe(false);
  });
});

describe("countUnknownBuckets", () => {
  it("tallies scored inventory and mid-band count", () => {
    const result = countUnknownBuckets([
      sc(0.03),
      sc(0.08),
      sc(0.12),
      sc(0.18),
      sc(0.4),
      sc(0, 0),
    ]);
    expect(result.scored).toBe(5);
    expect(result.unscored).toBe(1);
    expect(result.midBand).toBe(2);
    expect(result.buckets.map((b) => [b.key, b.count])).toEqual([
      ["0-5%", 1],
      ["5-10%", 1],
      ["10-15%", 1],
      ["15-20%", 1],
      ["20%+", 1],
    ]);
  });
});
