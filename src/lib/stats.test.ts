import { describe, expect, it } from "vitest";
import { lexiconCounts, textProgress, textsByProgress, topMisses, wordsByStatus } from "./stats";
import { normalizeText } from "./text";
import { normalizeWord } from "./word";

describe("lexiconCounts", () => {
  it("counts unique words by status", () => {
    const words = [
      normalizeWord({ hanzi: "我", status: "known" }),
      normalizeWord({ hanzi: "你", status: "known" }),
      normalizeWord({ hanzi: "他", status: "shaky" }),
      normalizeWord({ hanzi: "她", status: "unknown" }),
    ];
    expect(lexiconCounts(words)).toEqual({ known: 2, shaky: 1, unknown: 1 });
  });
});

describe("topMisses", () => {
  it("orders by the requested count", () => {
    const words = [
      normalizeWord({ hanzi: "难", status: "unknown", dontKnowCount: 5 }),
      normalizeWord({ hanzi: "易", status: "shaky", dontKnowCount: 1, barelyCount: 8 }),
      normalizeWord({ hanzi: "好", status: "known", okayCount: 4 }),
    ];
    expect(topMisses(words, "dontKnowCount", 2).map((w) => w.hanzi)).toEqual(["难", "易"]);
    expect(topMisses(words, "barelyCount", 2).map((w) => w.hanzi)).toEqual(["易"]);
  });
});

describe("textProgress", () => {
  it("separates read, in-progress, and untouched", () => {
    const texts = [
      normalizeText({ id: "a", body: "一", readAt: 1, createdAt: 1 }),
      normalizeText({
        id: "b",
        body: "二",
        readAt: null,
        bookmark: { tokenIndex: 4, scrollY: 200 },
        createdAt: 2,
      }),
      normalizeText({ id: "c", body: "三", createdAt: 3 }),
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
      normalizeWord({ hanzi: "我", status: "known", okayCount: 1 }),
      normalizeWord({ hanzi: "难", status: "unknown", dontKnowCount: 2 }),
    ];
    expect(wordsByStatus(words, "known").map((w) => w.hanzi)).toEqual(["我"]);
    expect(wordsByStatus(words, "unknown").map((w) => w.hanzi)).toEqual(["难"]);
  });
});
