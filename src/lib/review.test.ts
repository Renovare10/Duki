import { describe, expect, it } from "vitest";
import { buildReviewQueue, NEW_CARDS_PER_DAY, nextDueAt, pickNext, sessionCounts } from "./review";
import { addDays, startOfDay } from "./dates";
import { applyReviewGrade, normalizeWord } from "./word";
import type { WordRecord } from "../types";

const NOW = new Date(2026, 9, 7, 9, 0, 0).getTime();
const MIN = 60_000;
const today = startOfDay(NOW);

const card = (hanzi: string, extra: Partial<WordRecord>) => normalizeWord({ hanzi, status: "known", ...extra });

describe("buildReviewQueue", () => {
  it("shows review cards only when due, learning first, new last", () => {
    const words = [
      card("早", { phase: "review", intervalDays: 3, dueAt: addDays(today, -2) }),
      card("晚", { phase: "review", intervalDays: 9, dueAt: addDays(today, 4) }),
      card("学", { phase: "learning", step: 1, dueAt: NOW - MIN, status: "unknown" }),
      card("新", { status: "unknown", dontKnowCount: 2 }),
      card("读", { status: "known" }), // Okay in the reader, never studied
      card("忘", { phase: "relearning", dueAt: NOW + 2 * 3600_000, status: "unknown" }),
    ];
    expect(buildReviewQueue(words, NOW).map((w) => w.hanzi)).toEqual(["学", "早", "新"]);
  });

  it("does not keep Don't know / Barely review cards in the queue every day", () => {
    const words = [
      card("难", { status: "unknown", phase: "review", intervalDays: 1, dueAt: addDays(today, 1) }),
      card("慢", { status: "shaky", phase: "review", intervalDays: 30, dueAt: addDays(today, 20) }),
    ];
    expect(buildReviewQueue(words, NOW)).toEqual([]);
  });

  it("caps new cards per day, counting cards already introduced today", () => {
    const fresh = Array.from({ length: 30 }, (_, i) =>
      card(`n${String(i).padStart(2, "0")}`, { status: "unknown", updatedAt: i }),
    );
    expect(buildReviewQueue(fresh, NOW)).toHaveLength(NEW_CARDS_PER_DAY);
    const introduced = Array.from({ length: 15 }, (_, i) =>
      card(`i${i}`, { phase: "learning", introducedAt: NOW - 3600_000, dueAt: NOW + 3600_000 }),
    );
    expect(buildReviewQueue([...fresh, ...introduced], NOW)).toHaveLength(5);
    expect(buildReviewQueue(fresh, NOW, undefined, { newPerDay: 3 })).toHaveLength(3);
  });

  it("orders new cards by most missed, then oldest", () => {
    const words = [
      card("甲", { status: "unknown", dontKnowCount: 1, updatedAt: 5 }),
      card("乙", { status: "shaky", barelyCount: 4, updatedAt: 9 }),
      card("丙", { status: "unknown", dontKnowCount: 1, updatedAt: 1 }),
    ];
    expect(buildReviewQueue(words, NOW).map((w) => w.hanzi)).toEqual(["乙", "丙", "甲"]);
  });

  it("puts a focused word first even when it isn't due", () => {
    const words = [
      card("红", { status: "unknown" }),
      card("黄", { phase: "review", intervalDays: 10, dueAt: addDays(today, 5) }),
    ];
    expect(buildReviewQueue(words, NOW, "黄").map((w) => w.hanzi)).toEqual(["黄", "红"]);
  });
});

describe("pickNext (a running session)", () => {
  it("re-shows a failed new card after its 1-minute step, and finishes once it graduates", () => {
    const words = new Map<string, WordRecord>();
    words.set("猫", card("猫", { status: "unknown" }));
    words.set("狗", card("狗", { phase: "review", intervalDays: 4, dueAt: today }));
    const order = buildReviewQueue(words.values(), NOW).map((w) => w.hanzi);
    expect(order).toEqual(["狗", "猫"]);
    let t = NOW;
    const grade = (h: string, g: Parameters<typeof applyReviewGrade>[1]) => {
      words.set(h, applyReviewGrade(words.get(h)!, g, t));
      order.splice(order.indexOf(h), 1);
      order.push(h);
    };
    expect(pickNext(order, words, t)).toBe("狗");
    grade("狗", "good"); // → 10 days, leaves the session
    expect(pickNext(order, words, t)).toBe("猫");
    grade("猫", "again"); // 1m step
    // Nothing else due: the learning card is shown early (learn-ahead).
    expect(pickNext(order, words, t)).toBe("猫");
    t += MIN;
    grade("猫", "good"); // 10m step
    t += 10 * MIN;
    expect(pickNext(order, words, t)).toBe("猫");
    grade("猫", "good"); // graduates to 1 day
    expect(words.get("猫")).toMatchObject({ phase: "review", intervalDays: 1 });
    expect(pickNext(order, words, t)).toBeNull();
    expect(sessionCounts(order, words, t)).toEqual({ fresh: 0, learning: 0, review: 0 });
    expect(nextDueAt(words.values(), t)).toBe(addDays(today, 1));
  });

  it("prioritises a learning card whose step has elapsed over remaining reviews", () => {
    const words = new Map<string, WordRecord>([
      ["一", card("一", { phase: "review", intervalDays: 3, dueAt: today })],
      ["二", card("二", { phase: "learning", step: 0, dueAt: NOW - 1, status: "unknown" })],
    ]);
    expect(pickNext(["一", "二"], words, NOW)).toBe("二");
  });
});
