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
    expect(word.phase).toBe("new");
    expect(word.lapses).toBe(0);
    expect(word.introducedAt).toBeNull();
  });

  it("migrates a legacy SM-2 card to the review phase, keeping its schedule", () => {
    const due = new Date(2026, 9, 20).getTime();
    const word = normalizeWord({
      hanzi: "茶",
      status: "shaky",
      intervalDays: 14,
      repetitions: 3,
      dueAt: due,
      updatedAt: 5,
    });
    expect(word).toMatchObject({ phase: "review", intervalDays: 14, dueAt: due, step: 0 });
  });

  it("migrates legacy never-reviewed misses to new cards with no due date", () => {
    const word = normalizeWord({ hanzi: "难", status: "unknown", dontKnowCount: 4 });
    expect(word).toMatchObject({ phase: "new", dueAt: null });
  });

  it("keeps an existing phase", () => {
    const word = normalizeWord({ hanzi: "学", status: "unknown", phase: "relearning", step: 0, dueAt: 9, intervalDays: 1 });
    expect(word.phase).toBe("relearning");
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

describe("applyReadingTap and scheduling", () => {
  const scheduled = normalizeWord({
    hanzi: "书",
    status: "known",
    phase: "review",
    intervalDays: 20,
    repetitions: 4,
    ease: 2.4,
    dueAt: 10_000_000,
  });

  it("Okay and Barely taps never change the schedule", () => {
    for (const status of ["known", "shaky"] as const) {
      const next = applyReadingTap(scheduled, "书", status, 500);
      expect(next).toMatchObject({ phase: "review", intervalDays: 20, ease: 2.4, dueAt: 10_000_000 });
    }
  });

  it("Don't know pulls a scheduled card forward without resetting interval or ease", () => {
    const next = applyReadingTap(scheduled, "书", "unknown", 500);
    expect(next).toMatchObject({ phase: "review", intervalDays: 20, ease: 2.4, repetitions: 4, dueAt: 500 });
  });

  it("Don't know on a word not yet in Review just makes it a new card", () => {
    const next = applyReadingTap(undefined, "词", "unknown", 500);
    expect(next).toMatchObject({ phase: "new", dueAt: null });
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

  it("good on a new card marks known and moves it to the 10-minute learning step", () => {
    const prev = normalizeWord({ hanzi: "茶", status: "unknown", dontKnowCount: 4 });
    const next = applyReviewGrade(prev, "good", 100);
    expect(next.status).toBe("known");
    expect(next.okayCount).toBe(1);
    expect(next).toMatchObject({ phase: "learning", step: 1, dueAt: 100 + 10 * 60_000, introducedAt: 100 });
  });

  it("records when a card was first introduced, only once", () => {
    const first = applyReviewGrade(normalizeWord({ hanzi: "茶", status: "unknown" }), "again", 100);
    const second = applyReviewGrade(first, "good", 200);
    expect(second.introducedAt).toBe(100);
  });

  it("easy stays known", () => {
    const prev = normalizeWord({ hanzi: "好", status: "known", okayCount: 2 });
    const next = applyReviewGrade(prev, "easy", 100);
    expect(next.status).toBe("known");
    expect(next.okayCount).toBe(3);
  });
});
