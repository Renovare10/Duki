import { describe, expect, it } from "vitest";
import { buildReviewQueue } from "./review";
import { normalizeWord } from "./word";

const NOW = 1_000;

describe("buildReviewQueue", () => {
  it("includes unknown and shaky, plus due known cards", () => {
    const words = [
      normalizeWord({ hanzi: "红", status: "unknown", dontKnowCount: 3 }),
      normalizeWord({ hanzi: "黄", status: "shaky", barelyCount: 1 }),
      normalizeWord({ hanzi: "绿", status: "known", okayCount: 2 }),
      normalizeWord({
        hanzi: "蓝",
        status: "known",
        okayCount: 1,
        dueAt: NOW - 1,
        intervalDays: 1,
        repetitions: 1,
      }),
    ];
    const queue = buildReviewQueue(words, NOW);
    expect(queue.map((w) => w.hanzi)).toEqual(["蓝", "红", "黄"]);
  });

  it("puts a focused miss first", () => {
    const words = [
      normalizeWord({ hanzi: "红", status: "unknown" }),
      normalizeWord({ hanzi: "黄", status: "unknown" }),
    ];
    expect(buildReviewQueue(words, NOW, "黄")[0].hanzi).toBe("黄");
  });
});
