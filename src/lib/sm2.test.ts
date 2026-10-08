import { describe, expect, it } from "vitest";
import {
  defaultSm2,
  dueOnDay,
  formatDelay,
  MIN_EASE,
  scheduleReview,
  type Sm2State,
} from "./sm2";
import { addDays, startOfDay } from "./dates";

const NOW = new Date(2026, 9, 7, 9, 0, 0).getTime();
const MIN = 60_000;

function review(intervalDays: number, ease = 2.5, dueAt = startOfDay(NOW)): Sm2State {
  return { ease, intervalDays, repetitions: 3, dueAt, phase: "review", step: 0, lapses: 0 };
}

describe("learning steps", () => {
  it("walks a new card through 1m → 10m → 1 day", () => {
    const a = scheduleReview(defaultSm2(), "again", NOW);
    expect(a).toMatchObject({ phase: "learning", step: 0, dueAt: NOW + 1 * MIN });
    const b = scheduleReview(a, "good", NOW + MIN);
    expect(b).toMatchObject({ phase: "learning", step: 1, dueAt: NOW + MIN + 10 * MIN });
    const c = scheduleReview(b, "good", NOW + 11 * MIN);
    expect(c).toMatchObject({ phase: "review", intervalDays: 1, repetitions: 1 });
    expect(c.dueAt).toBe(addDays(startOfDay(NOW), 1));
  });

  it("good on a brand-new card goes to the 10-minute step, not straight to days", () => {
    expect(scheduleReview(defaultSm2(), "good", NOW)).toMatchObject({
      phase: "learning",
      step: 1,
      dueAt: NOW + 10 * MIN,
    });
  });

  it("hard on the first step waits between the first two steps", () => {
    expect(scheduleReview(defaultSm2(), "hard", NOW).dueAt).toBe(NOW + 5.5 * MIN);
  });

  it("easy graduates immediately to four days", () => {
    expect(scheduleReview(defaultSm2(), "easy", NOW)).toMatchObject({ phase: "review", intervalDays: 4 });
  });

  it("does not touch ease during learning", () => {
    let s = defaultSm2();
    for (let i = 0; i < 5; i += 1) s = scheduleReview(s, "again", NOW);
    expect(s.ease).toBe(2.5);
  });
});

describe("review intervals", () => {
  it("grow by ease on Good: 1 → 3 → 8 → 20 → 50 days", () => {
    let s = scheduleReview(scheduleReview(defaultSm2(), "good", NOW), "good", NOW);
    const seen = [s.intervalDays];
    let t = NOW;
    for (let i = 0; i < 4; i += 1) {
      t = s.dueAt! + 9 * 3600_000; // review on the due day
      s = scheduleReview(s, "good", t);
      seen.push(s.intervalDays);
    }
    expect(seen).toEqual([1, 3, 8, 20, 50]);
    expect(s.ease).toBe(2.5);
  });

  it("orders Hard < Good < Easy and adjusts ease per grade", () => {
    const prev = review(10);
    const hard = scheduleReview(prev, "hard", NOW);
    const good = scheduleReview(prev, "good", NOW);
    const easy = scheduleReview(prev, "easy", NOW);
    expect(hard.intervalDays).toBe(12);
    expect(good.intervalDays).toBe(25);
    expect(easy.intervalDays).toBe(33);
    expect([hard.ease, good.ease, easy.ease]).toEqual([2.35, 2.5, 2.65]);
    expect(good.dueAt).toBe(dueOnDay(NOW, 25));
  });

  it("gives a bonus for reviewing late", () => {
    const onTime = scheduleReview(review(10), "good", NOW);
    const late = scheduleReview(review(10, 2.5, addDays(startOfDay(NOW), -6)), "good", NOW);
    expect(late.intervalDays).toBeGreaterThan(onTime.intervalDays);
  });

  it("gives no credit for passing a card before it is due", () => {
    const early = review(30, 2.5, addDays(startOfDay(NOW), 12));
    const next = scheduleReview(early, "good", NOW);
    expect(next.intervalDays).toBe(30);
    expect(next.dueAt).toBe(early.dueAt);
  });
});

describe("lapses", () => {
  it("resets the interval, drops ease, and relearns at 10 minutes", () => {
    const lapse = scheduleReview(review(40), "again", NOW);
    expect(lapse).toMatchObject({ phase: "relearning", step: 0, intervalDays: 1, lapses: 1, ease: 2.3 });
    expect(lapse.dueAt).toBe(NOW + 10 * MIN);
    const back = scheduleReview(lapse, "good", NOW + 10 * MIN);
    expect(back).toMatchObject({ phase: "review", intervalDays: 1 });
    expect(back.dueAt).toBe(dueOnDay(NOW, 1));
  });

  it("keeps relearning on Again and never drops ease below the floor", () => {
    let s = review(5, 1.35);
    s = scheduleReview(s, "again", NOW);
    expect(s.ease).toBe(MIN_EASE);
    s = scheduleReview(s, "again", NOW + 10 * MIN);
    expect(s).toMatchObject({ phase: "relearning", step: 0, ease: MIN_EASE, lapses: 1 });
  });
});

describe("formatDelay", () => {
  it("labels minutes for steps and days/months for reviews", () => {
    expect(formatDelay(NOW, NOW + 10 * MIN, 0, "learning")).toBe("10m");
    expect(formatDelay(NOW, NOW, 3, "review")).toBe("3d");
    expect(formatDelay(NOW, NOW, 75, "review")).toBe("2.5mo");
  });
});
