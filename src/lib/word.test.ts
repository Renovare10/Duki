import { describe, expect, it } from "vitest";
import { applyReadingTap, applyReviewGrade, normalizeWord } from "./word";

describe("normalizeWord", () => {
  it("fills v1 records with zero counts and SM-2 defaults", () => {
    const word = normalizeWord({ hanzi: "我", status: "known", updatedAt: 9 });
    expect(word.dontKnowCount).toBe(0);
    expect(word.barelyCount).toBe(0);
    expect(word.okayCount).toBe(0);
    expect(word.ease).toBe(2.5);
    expect(word.dueAt).toBeNull();
  });
});

describe("applyReadingTap", () => {
  it("increments the matching count even when status stays the same", () => {
    const first = applyReadingTap(undefined, "喜欢", "unknown", 10);
    const second = applyReadingTap(first, "喜欢", "unknown", 20);
    const third = applyReadingTap(second, "喜欢", "unknown", 30);
    expect(third.status).toBe("unknown");
    expect(third.dontKnowCount).toBe(3);
    expect(third.barelyCount).toBe(0);
    expect(third.okayCount).toBe(0);
    expect(third.dueAt).toBeNull();
    expect(third.repetitions).toBe(0);
  });

  it("does not run SM-2 when marking Okay in the reader", () => {
    const word = applyReadingTap(undefined, "学生", "known", 11);
    expect(word.status).toBe("known");
    expect(word.okayCount).toBe(1);
    expect(word.intervalDays).toBe(0);
    expect(word.dueAt).toBeNull();
  });
});

describe("applyReviewGrade", () => {
  it("again marks unknown and bumps dontKnowCount", () => {
    const prev = normalizeWord({ hanzi: "茶", status: "shaky", barelyCount: 2 });
    const next = applyReviewGrade(prev, "again", 100);
    expect(next.status).toBe("unknown");
    expect(next.dontKnowCount).toBe(1);
    expect(next.barelyCount).toBe(2);
    expect(next.dueAt).toBeGreaterThan(100);
  });

  it("good marks known and schedules the next review", () => {
    const prev = normalizeWord({ hanzi: "茶", status: "unknown", dontKnowCount: 4 });
    const next = applyReviewGrade(prev, "good", 100);
    expect(next.status).toBe("known");
    expect(next.okayCount).toBe(1);
    expect(next.repetitions).toBe(1);
    expect(next.intervalDays).toBe(1);
  });

  it("easy stays known", () => {
    const prev = normalizeWord({ hanzi: "好", status: "known", okayCount: 2 });
    const next = applyReviewGrade(prev, "easy", 100);
    expect(next.status).toBe("known");
    expect(next.okayCount).toBe(3);
  });
});
