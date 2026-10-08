import { describe, expect, it } from "vitest";
import { demoRequested, generateDemoData } from "./demo";
import { learningTransitions, progressSeries, rangeStart, summarizePeriod } from "./stats";

const NOW = new Date(2026, 9, 7, 15, 0, 0).getTime();

describe("generateDemoData", () => {
  it("is deterministic and stays in the past", () => {
    const a = generateDemoData({ now: NOW, days: 120 });
    const b = generateDemoData({ now: NOW, days: 120 });
    expect(a.events.length).toBe(b.events.length);
    expect(a.events.length).toBeGreaterThan(500);
    expect(a.events.every((e) => e.at <= NOW)).toBe(true);
    expect(a.sessions.every((s) => s.finishedAt <= NOW)).toBe(true);
    expect([...a.words.values()].every((w) => w.hanzi)).toBe(true);
  });

  it("produces believable learned, forgotten, and retention numbers", () => {
    const demo = generateDemoData({ now: NOW });
    const kinds = learningTransitions(demo.events).map((t) => t.kind);
    expect(kinds.filter((k) => k === "learned").length).toBeGreaterThan(300);
    expect(kinds.filter((k) => k === "forgotten").length).toBeGreaterThan(20);
    const series = progressSeries({
      words: demo.words.values(),
      events: demo.events,
      sessions: demo.sessions,
      now: NOW,
      from: rangeStart("all", NOW, demo.events[0].at),
      granularity: "month",
    });
    const sum = summarizePeriod(series);
    expect(sum.retention).toBeGreaterThan(0.7);
    expect(sum.retention).toBeLessThan(0.98);
    // The end-of-range lexicon matches the generated words exactly.
    expect(series[series.length - 1].total).toBe(demo.words.size);
  });
});

describe("demoRequested", () => {
  it("reads ?demo=1 from the query or the hash route", () => {
    expect(demoRequested("?demo=1", "#/stats")).toBe(true);
    expect(demoRequested("", "#/stats?demo=1")).toBe(true);
    expect(demoRequested("", "#/stats")).toBe(false);
    expect(demoRequested("?demo=0", "")).toBe(false);
  });
});
