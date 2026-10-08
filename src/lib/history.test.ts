import { describe, expect, it } from "vitest";
import { makeWordEvent, normalizeEvent } from "./history";
import { applyReadingTap, applyReviewGrade } from "./word";

describe("makeWordEvent", () => {
  it("records a first tap with no previous status", () => {
    const next = applyReadingTap(undefined, "猫", "unknown", 1000);
    const ev = makeWordEvent(undefined, next, "read", undefined, "a");
    expect(ev).toEqual({
      id: "a",
      hanzi: "猫",
      at: 1000,
      source: "read",
      prevStatus: null,
      status: "unknown",
      prevIntervalDays: 0,
      intervalDays: 0,
    });
  });

  it("records review grades with status and interval change", () => {
    const prev = applyReadingTap(undefined, "猫", "shaky", 1000);
    const next = applyReviewGrade(prev, "good", 2000);
    const ev = makeWordEvent(prev, next, "review", "good", "b");
    expect(ev.grade).toBe("good");
    expect(ev.prevStatus).toBe("shaky");
    expect(ev.status).toBe("known");
    expect(ev.intervalDays).toBe(1);
    expect(ev.at).toBe(2000);
  });
});

describe("normalizeEvent", () => {
  it("drops malformed rows and keeps valid ones", () => {
    expect(normalizeEvent(null)).toBeNull();
    expect(normalizeEvent({ id: "x", hanzi: "猫", at: "soon" })).toBeNull();
    expect(normalizeEvent({ id: "x", hanzi: "猫", at: 1, source: "read", status: "weird" })).toBeNull();
    const ok = normalizeEvent({ id: "x", hanzi: "猫", at: 1, source: "review", status: "known", grade: "easy" });
    expect(ok).toMatchObject({ prevStatus: null, grade: "easy", intervalDays: 0 });
  });
});
