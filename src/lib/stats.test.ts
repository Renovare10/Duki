import { describe, expect, it } from "vitest";
import {
  activityByDay,
  activityStreaks,
  addDays,
  cardStateCounts,
  countUnknownBuckets,
  dayKey,
  firstActivityAt,
  hardestWords,
  intervalDistribution,
  learningTransitions,
  progressSeries,
  rangeStart,
  reviewDays,
  reviewForecast,
  startOfDay,
  summarizePeriod,
  isMidBandLoad,
  lexiconCounts,
  midBandEmpty,
  textProgress,
  textsByProgress,
  unknownLoadBucketKey,
  wordsByStatus,
} from "./stats";
import type { ReadingSession, TextScore, WordEvent, WordStatus } from "../types";
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
  it("treats 5–15% as the mid-band", () => {
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

// ---- Progress over time ----

const NOW = new Date(2026, 9, 7, 15, 0, 0).getTime(); // Oct 7 2026, 3pm local
const day = (offset: number, hour = 10) => addDays(startOfDay(NOW), offset) + hour * 3600_000;
let seq = 0;
function ev(
  hanzi: string,
  at: number,
  prevStatus: WordStatus | null,
  status: WordStatus,
  source: WordEvent["source"] = "read",
  grade?: WordEvent["grade"],
): WordEvent {
  return {
    id: `e${seq++}`,
    hanzi,
    at,
    source,
    grade,
    prevStatus,
    status,
    prevIntervalDays: 0,
    intervalDays: 0,
  };
}

describe("learningTransitions", () => {
  it("marks seen, first learned, forgotten, and relearned", () => {
    const events = [
      ev("猫", day(-5), null, "unknown"),
      ev("猫", day(-4), "unknown", "shaky", "review", "hard"),
      ev("猫", day(-3), "shaky", "known", "review", "good"),
      ev("猫", day(-2), "known", "shaky", "review", "hard"),
      ev("猫", day(-1), "shaky", "unknown", "review", "again"),
      ev("猫", day(0), "unknown", "known", "review", "good"),
    ];
    expect(learningTransitions(events).map((t) => t.kind)).toEqual([
      "seen",
      "learned",
      "forgotten",
      "relearned",
    ]);
  });

  it("treats words already known before history as baseline, not learned", () => {
    const events = [
      ev("狗", day(-2), "known", "known"),
      ev("狗", day(-1), "known", "unknown", "review", "again"),
      ev("狗", day(0), "unknown", "known", "review", "good"),
    ];
    expect(learningTransitions(events).map((t) => t.kind)).toEqual(["forgotten", "relearned"]);
  });

  it("does not double count repeated Okay taps", () => {
    const events = [
      ev("好", day(-2), null, "known"),
      ev("好", day(-1), "known", "known"),
      ev("好", day(0), "known", "known"),
    ];
    expect(learningTransitions(events).map((t) => t.kind)).toEqual(["seen", "learned"]);
  });
});

describe("progressSeries", () => {
  const events = [
    ev("一", day(-40), null, "known"), // learned before the 1-month window
    ev("二", day(-2), null, "unknown"),
    ev("二", day(-2, 11), "unknown", "known", "review", "good"),
    ev("三", day(-1), null, "shaky"),
    ev("一", day(0), "known", "unknown", "review", "again"),
    ev("三", day(0), "shaky", "known", "review", "easy"),
  ];
  const words = [
    normalizeWord({ hanzi: "一", status: "unknown" }),
    normalizeWord({ hanzi: "二", status: "known" }),
    normalizeWord({ hanzi: "三", status: "known" }),
    normalizeWord({ hanzi: "四", status: "known" }), // no history: constant baseline
  ];
  const sessions: ReadingSession[] = [
    { id: "s", textId: "t", finishedAt: day(-1), uniqueUnknown: 0, uniqueShaky: 0, durationMs: 600000 },
  ];

  it("buckets per day with all-time cumulative totals", () => {
    const series = progressSeries({
      words,
      events,
      sessions,
      now: NOW,
      from: rangeStart("1m", NOW, null),
      granularity: "day",
    });
    expect(series).toHaveLength(30);
    expect(series[29].key).toBe(dayKey(NOW));
    const byKey = new Map(series.map((b) => [b.key, b]));
    const d2 = byKey.get(dayKey(day(-2)))!;
    expect(d2.seen).toBe(1);
    expect(d2.learned).toBe(1);
    expect(d2.reviews).toBe(1);
    expect(d2.cumLearned).toBe(2); // 一 (before range) + 二
    const d1 = byKey.get(dayKey(day(-1)))!;
    expect(d1.finished).toBe(1);
    expect(d1.minutes).toBe(10);
    expect(d1.taps).toBe(1);
    const today = series[29];
    expect(today.forgotten).toBe(1);
    expect(today.learned).toBe(1);
    expect(today.reviews).toBe(2);
    expect(today.again).toBe(1);
    expect(today.retentionReviews).toBe(1);
    expect(today.retained).toBe(0);
    expect(today.cumLearned).toBe(3);
    expect(today.cumForgotten).toBe(1);
    // Lexicon over time: day -3 has 一 (known) + 四 (no history).
    const d3 = byKey.get(dayKey(day(-3)))!;
    expect([d3.known, d3.shaky, d3.unknown]).toEqual([2, 0, 0]);
    expect(series[0].knownBefore).toBe(2);
    expect(today.knownBefore).toBe(3);
    expect([d1.known, d1.shaky, d1.unknown]).toEqual([3, 1, 0]);
    expect([today.known, today.shaky, today.unknown, today.total]).toEqual([3, 0, 1, 4]);
  });

  it("groups by month", () => {
    const series = progressSeries({
      words,
      events,
      sessions,
      now: NOW,
      from: rangeStart("3m", NOW, null),
      granularity: "month",
    });
    expect(series.map((b) => b.key)).toEqual(["2026-07", "2026-08", "2026-09", "2026-10"]);
    const aug = series[1];
    expect(aug.learned).toBe(1); // 一 on Aug 28
    const oct = series[3];
    expect(oct.learned).toBe(2);
    expect(oct.forgotten).toBe(1);
    const sum = summarizePeriod(series);
    expect(sum.learned).toBe(3);
    expect(sum.forgotten).toBe(1);
    expect(sum.reviews).toBe(3);
    expect(sum.accuracy).toBeCloseTo(2 / 3);
    expect(sum.retention).toBe(0);
    expect(reviewDays(events, series[0].start, series[series.length - 1].end)).toBe(2);
  });

  it("covers all history for the All range", () => {
    const first = firstActivityAt(events, sessions)!;
    expect(first).toBe(day(-40));
    expect(rangeStart("all", NOW, first)).toBe(startOfDay(day(-40)));
    expect(rangeStart("all", NOW, null)).toBe(rangeStart("1m", NOW, null));
  });
});

describe("activityStreaks", () => {
  it("counts the current run through yesterday and the longest run", () => {
    const events = [-10, -9, -8, -7, -3, -2, -1].map((d) => ev("x", day(d), "known", "known"));
    const activity = activityByDay(events, []);
    expect(activityStreaks(activity, NOW)).toEqual({ current: 3, longest: 4, activeDays: 7 });
  });

  it("drops to zero after a missed day", () => {
    const activity = activityByDay([ev("x", day(-2), "known", "known")], []);
    expect(activityStreaks(activity, NOW).current).toBe(0);
  });
});

describe("snapshot stats", () => {
  const DAY = 86_400_000;
  const words = [
    normalizeWord({ hanzi: "新", status: "unknown" }),
    normalizeWord({ hanzi: "读", status: "known" }),
    normalizeWord({ hanzi: "学", status: "shaky", phase: "learning", step: 1, dueAt: NOW + 10 * 60_000 }),
    normalizeWord({ hanzi: "忘", status: "unknown", phase: "relearning", intervalDays: 1, dueAt: NOW + 60_000 }),
    normalizeWord({ hanzi: "幼", status: "known", phase: "review", intervalDays: 6, dueAt: NOW + 3 * DAY }),
    normalizeWord({ hanzi: "熟", status: "shaky", phase: "review", intervalDays: 40, dueAt: NOW - DAY }),
  ];

  it("splits card states by phase", () => {
    expect(cardStateCounts(words)).toEqual({ fresh: 1, readKnown: 1, learning: 2, young: 1, mature: 1 });
  });

  it("forecasts scheduled cards (overdue and learning in today) and counts new cards waiting", () => {
    const f = reviewForecast(words, NOW, 7);
    expect(f.days.map((d) => d.count)).toEqual([3, 0, 0, 1, 0, 0, 0]);
    expect(f.newWaiting).toBe(1);
  });

  it("buckets intervals for review and relearning cards only", () => {
    const dist = intervalDistribution(words);
    expect(dist.find((b) => b.label === "1d")!.count).toBe(1);
    expect(dist.find((b) => b.label === "2–6d")!.count).toBe(1);
    expect(dist.find((b) => b.label === "3w–2m")!.count).toBe(1);
    expect(dist.reduce((n, b) => n + b.count, 0)).toBe(3);
  });

  it("ranks hardest words by lapses then misses", () => {
    const hard = hardestWords(
      [
        normalizeWord({ hanzi: "甲", status: "unknown", dontKnowCount: 6 }),
        normalizeWord({ hanzi: "乙", status: "known", dontKnowCount: 2 }),
        normalizeWord({ hanzi: "丙", status: "known" }),
      ],
      [
        ev("乙", day(-3), null, "known"),
        ev("乙", day(-2), "known", "unknown", "review", "again"),
        ev("乙", day(-1), "unknown", "known", "review", "good"),
        ev("乙", day(0), "known", "unknown", "review", "again"),
      ],
    );
    expect(hard.map((h) => [h.hanzi, h.lapses])).toEqual([
      ["乙", 2],
      ["甲", 0],
    ]);
  });
});
