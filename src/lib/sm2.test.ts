import { describe, expect, it } from "vitest";
import { DEFAULT_EASE, MIN_EASE, sm2Next } from "./sm2";

const NOW = 1_700_000_000_000;
const DAY = 24 * 60 * 60 * 1000;

describe("sm2Next", () => {
  it("again resets repetitions and schedules tomorrow", () => {
    const next = sm2Next(
      { ease: 2.8, intervalDays: 12, repetitions: 4 },
      "again",
      NOW,
    );
    expect(next.repetitions).toBe(0);
    expect(next.intervalDays).toBe(1);
    expect(next.dueAt).toBe(NOW + DAY);
    expect(next.ease).toBeGreaterThanOrEqual(MIN_EASE);
    expect(next.ease).toBeLessThan(2.8);
  });

  it("good on a new card is due in one day", () => {
    const next = sm2Next(
      { ease: DEFAULT_EASE, intervalDays: 0, repetitions: 0 },
      "good",
      NOW,
    );
    expect(next.repetitions).toBe(1);
    expect(next.intervalDays).toBe(1);
    expect(next.dueAt).toBe(NOW + DAY);
  });

  it("good on the second pass jumps to six days", () => {
    const next = sm2Next(
      { ease: DEFAULT_EASE, intervalDays: 1, repetitions: 1 },
      "good",
      NOW,
    );
    expect(next.repetitions).toBe(2);
    expect(next.intervalDays).toBe(6);
  });

  it("easy grows the interval faster than good", () => {
    const prev = { ease: DEFAULT_EASE, intervalDays: 6, repetitions: 2 };
    const good = sm2Next(prev, "good", NOW);
    const easy = sm2Next(prev, "easy", NOW);
    expect(easy.intervalDays).toBeGreaterThan(good.intervalDays);
    expect(easy.ease).toBeGreaterThan(good.ease);
  });

  it("hard never drops ease below the floor", () => {
    const next = sm2Next({ ease: 1.31, intervalDays: 3, repetitions: 2 }, "again", NOW);
    expect(next.ease).toBe(MIN_EASE);
  });
});
