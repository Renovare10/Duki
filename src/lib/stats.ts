import type {
  LibraryText,
  ReadingSession,
  TextScore,
  WordEvent,
  WordRecord,
  WordStatus,
} from "../types";
import { isScored } from "./score";

export function wordsByStatus(
  words: Iterable<WordRecord>,
  status: "known" | "shaky" | "unknown",
): WordRecord[] {
  return [...words]
    .filter((w) => w.status === status)
    .sort((a, b) => a.hanzi.localeCompare(b.hanzi, "zh"));
}

export function textsByProgress(
  texts: LibraryText[],
  kind: "finished" | "inProgress" | "untouched",
): LibraryText[] {
  return texts.filter((text) => {
    if (kind === "finished") return Boolean(text.readAt);
    const inProgress =
      !text.readAt &&
      Boolean(text.bookmark && (text.bookmark.tokenIndex > 0 || text.bookmark.scrollY >= 40));
    if (kind === "inProgress") return inProgress;
    return !text.readAt && !inProgress;
  });
}

export function lexiconCounts(words: Iterable<WordRecord>): {
  known: number;
  shaky: number;
  unknown: number;
} {
  let known = 0;
  let shaky = 0;
  let unknown = 0;
  for (const word of words) {
    if (word.status === "known") known += 1;
    else if (word.status === "shaky") shaky += 1;
    else unknown += 1;
  }
  return { known, shaky, unknown };
}

export function topMisses(
  words: Iterable<WordRecord>,
  field: "dontKnowCount" | "barelyCount",
  limit = 8,
): WordRecord[] {
  return [...words]
    .filter((w) => w[field] > 0)
    .sort((a, b) => b[field] - a[field] || a.hanzi.localeCompare(b.hanzi, "zh"))
    .slice(0, limit);
}

export function textProgress(texts: LibraryText[]): {
  finished: number;
  inProgress: number;
  untouched: number;
} {
  let finished = 0;
  let inProgress = 0;
  let untouched = 0;
  for (const text of texts) {
    if (text.readAt) finished += 1;
    else if (text.bookmark && (text.bookmark.tokenIndex > 0 || text.bookmark.scrollY >= 40)) {
      inProgress += 1;
    } else untouched += 1;
  }
  return { finished, inProgress, untouched };
}

export function recentSessionLoads(
  sessions: ReadingSession[],
  texts: LibraryText[],
  limit = 12,
): { id: string; title: string; remaining: number; finishedAt: number }[] {
  const titles = new Map(texts.map((t) => [t.id, t.title]));
  return [...sessions]
    .sort((a, b) => b.finishedAt - a.finishedAt)
    .slice(0, limit)
    .map((s) => ({
      id: s.id,
      title: titles.get(s.textId) || "Text",
      remaining: s.uniqueUnknown + s.uniqueShaky,
      finishedAt: s.finishedAt,
    }));
}

/** Learner mid-band (~Just right through soft Harder): empty-state watches this. */
export const MID_BAND_LO = 0.05;
export const MID_BAND_HI = 0.15;

export type UnknownBucket = {
  key: string;
  label: string;
  lo: number;
  hi: number;
};

/** Inventory buckets for Stats: how scored texts sit vs the learner's unknown-%. */
export const UNKNOWN_BUCKETS: UnknownBucket[] = [
  { key: "0-5%", label: "0–5% · easy", lo: 0, hi: 0.05 },
  { key: "5-10%", label: "5–10% · just right", lo: 0.05, hi: 0.1 },
  { key: "10-15%", label: "10–15%", lo: 0.1, hi: 0.15 },
  { key: "15-20%", label: "15–20% · harder", lo: 0.15, hi: 0.2 },
  { key: "20%+", label: "20%+ · steep", lo: 0.2, hi: Number.POSITIVE_INFINITY },
];

export function unknownLoadBucketKey(load: number): string {
  for (const b of UNKNOWN_BUCKETS) {
    if (load >= b.lo && load < b.hi) return b.key;
  }
  return "20%+";
}

export function isMidBandLoad(load: number): boolean {
  return load >= MID_BAND_LO && load < MID_BAND_HI;
}

export type UnknownBucketCount = {
  key: string;
  label: string;
  count: number;
};

export function countUnknownBuckets(
  scores: Iterable<TextScore>,
): { buckets: UnknownBucketCount[]; scored: number; unscored: number; midBand: number } {
  const tallies = new Map<string, number>(UNKNOWN_BUCKETS.map((b) => [b.key, 0]));
  let scored = 0;
  let unscored = 0;
  let midBand = 0;
  for (const score of scores) {
    if (!isScored(score)) {
      unscored += 1;
      continue;
    }
    scored += 1;
    const key = unknownLoadBucketKey(score.unknownLoad);
    tallies.set(key, (tallies.get(key) ?? 0) + 1);
    if (isMidBandLoad(score.unknownLoad)) midBand += 1;
  }
  return {
    buckets: UNKNOWN_BUCKETS.map((b) => ({
      key: b.key,
      label: b.label,
      count: tallies.get(b.key) ?? 0,
    })),
    scored,
    unscored,
    midBand,
  };
}

/** True when the learner has scored texts but none in the ~5–15% unknown band. */
export function midBandEmpty(scores: Iterable<TextScore>): boolean {
  const { scored, midBand } = countUnknownBuckets(scores);
  return scored > 0 && midBand === 0;
}

/* ------------------------------------------------------------------------------------------
 * Progress over time (Anki-style charts)
 *
 * History comes from WordEvent rows (one per reader tap or review grade). Definitions:
 *  - learned:   the first time a word reaches `known` — an Okay tap in the reader or Good/Easy
 *               in review. Words already known when history starts are baseline, not "learned".
 *  - forgotten: a lapse — a learned word drops back to `unknown` (Again in review, or Don’t know
 *               in the reader). Shaky (Barely / Hard) is a wobble, not a lapse.
 *  - relearned: a forgotten word reaching `known` again.
 *  - retention: share of reviews of learned (`known`) cards not graded Again.
 * ---------------------------------------------------------------------------------------- */

export const DAY_MS = 24 * 60 * 60 * 1000;
/** Anki’s threshold: a card with an interval of 21+ days is mature. */
export const MATURE_DAYS = 21;

export type Granularity = "day" | "month";
export type RangeKey = "1m" | "3m" | "1y" | "all";

export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "1m", label: "1 month" },
  { key: "3m", label: "3 months" },
  { key: "1y", label: "1 year" },
  { key: "all", label: "All" },
];

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function startOfMonth(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d.getTime();
}

/** Calendar-day arithmetic (DST-safe). */
export function addDays(ts: number, n: number): number {
  const d = new Date(ts);
  d.setDate(d.getDate() + n);
  return d.getTime();
}

export function addMonths(ts: number, n: number): number {
  const d = new Date(ts);
  d.setMonth(d.getMonth() + n);
  return d.getTime();
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Local calendar day, e.g. 2026-10-07. */
export function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function monthKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

/** Whole calendar days from a to b (b later → positive). */
export function dayDiff(a: number, b: number): number {
  return Math.round((startOfDay(b) - startOfDay(a)) / DAY_MS);
}

export type TransitionKind = "seen" | "learned" | "relearned" | "forgotten";
export type Transition = { at: number; hanzi: string; kind: TransitionKind };

/** Walk history once and emit seen / learned / relearned / forgotten moments (see definitions above). */
export function learningTransitions(events: readonly WordEvent[]): Transition[] {
  const sorted = [...events].sort((a, b) => a.at - b.at);
  const state = new Map<string, { learned: boolean; ever: boolean }>();
  const out: Transition[] = [];
  for (const ev of sorted) {
    let st = state.get(ev.hanzi);
    if (!st) {
      if (ev.prevStatus === null) out.push({ at: ev.at, hanzi: ev.hanzi, kind: "seen" });
      const baselineKnown = ev.prevStatus === "known";
      st = { learned: baselineKnown, ever: baselineKnown };
      state.set(ev.hanzi, st);
    }
    if (ev.status === "known" && !st.learned) {
      out.push({ at: ev.at, hanzi: ev.hanzi, kind: st.ever ? "relearned" : "learned" });
      st.learned = true;
      st.ever = true;
    } else if (ev.status === "unknown" && st.learned) {
      out.push({ at: ev.at, hanzi: ev.hanzi, kind: "forgotten" });
      st.learned = false;
    }
  }
  return out;
}

/** Earliest timestamp of any recorded activity, or null when there is none. */
export function firstActivityAt(
  events: readonly WordEvent[],
  sessions: readonly ReadingSession[],
): number | null {
  let first = Number.POSITIVE_INFINITY;
  for (const e of events) if (e.at < first) first = e.at;
  for (const s of sessions) if (s.finishedAt < first) first = s.finishedAt;
  return Number.isFinite(first) ? first : null;
}

/** First instant included by a range selector. */
export function rangeStart(range: RangeKey, now: number, firstActivity: number | null): number {
  const today = startOfDay(now);
  if (range === "1m") return addDays(today, -29);
  if (range === "3m") return addDays(today, -90);
  if (range === "1y") return addDays(today, -364);
  if (firstActivity == null) return addDays(today, -29);
  return Math.min(startOfDay(firstActivity), addDays(today, -29));
}

export type ProgressBucket = {
  key: string;
  start: number;
  end: number;
  /** Activity inside the bucket. */
  seen: number;
  learned: number;
  relearned: number;
  forgotten: number;
  reviews: number;
  passed: number;
  again: number;
  retentionReviews: number;
  retained: number;
  taps: number;
  finished: number;
  minutes: number;
  /** Known words at the start of the bucket. */
  knownBefore: number;
  /** Totals at the end of the bucket (all-time, not just this range). */
  cumLearned: number;
  cumForgotten: number;
  known: number;
  shaky: number;
  unknown: number;
  total: number;
};

function emptyBucket(key: string, start: number, end: number): ProgressBucket {
  return {
    key,
    start,
    end,
    seen: 0,
    learned: 0,
    relearned: 0,
    forgotten: 0,
    reviews: 0,
    passed: 0,
    again: 0,
    retentionReviews: 0,
    retained: 0,
    taps: 0,
    finished: 0,
    minutes: 0,
    knownBefore: 0,
    cumLearned: 0,
    cumForgotten: 0,
    known: 0,
    shaky: 0,
    unknown: 0,
    total: 0,
  };
}

export function makeBuckets(from: number, now: number, granularity: Granularity): ProgressBucket[] {
  const out: ProgressBucket[] = [];
  const step = granularity === "day" ? (t: number) => addDays(t, 1) : (t: number) => addMonths(t, 1);
  let start = granularity === "day" ? startOfDay(from) : startOfMonth(from);
  const key = granularity === "day" ? dayKey : monthKey;
  while (start <= now) {
    const end = step(start);
    out.push(emptyBucket(key(start), start, end));
    start = end;
  }
  return out;
}

function findBucket(buckets: ProgressBucket[], ts: number): number {
  let lo = 0;
  let hi = buckets.length - 1;
  if (hi < 0 || ts < buckets[0].start || ts >= buckets[hi].end) return -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (ts < buckets[mid].start) hi = mid - 1;
    else if (ts >= buckets[mid].end) lo = mid + 1;
    else return mid;
  }
  return -1;
}

/** Per-day or per-month series for every time chart on the Stats page. */
export function progressSeries(input: {
  words: Iterable<WordRecord>;
  events: readonly WordEvent[];
  sessions: readonly ReadingSession[];
  now: number;
  from: number;
  granularity: Granularity;
}): ProgressBucket[] {
  const { now, granularity } = input;
  const buckets = makeBuckets(input.from, now, granularity);
  if (buckets.length === 0) return buckets;
  const rangeFrom = buckets[0].start;
  const events = [...input.events].sort((a, b) => a.at - b.at);

  // Activity counts.
  let cumLearned = 0;
  let cumForgotten = 0;
  const cumDelta = buckets.map(() => ({ learned: 0, forgotten: 0 }));
  for (const t of learningTransitions(events)) {
    const i = findBucket(buckets, t.at);
    if (t.at < rangeFrom) {
      if (t.kind === "learned") cumLearned += 1;
      else if (t.kind === "forgotten") cumForgotten += 1;
      continue;
    }
    if (i < 0) continue;
    const b = buckets[i];
    if (t.kind === "seen") b.seen += 1;
    else if (t.kind === "learned") {
      b.learned += 1;
      cumDelta[i].learned += 1;
    } else if (t.kind === "relearned") b.relearned += 1;
    else {
      b.forgotten += 1;
      cumDelta[i].forgotten += 1;
    }
  }
  for (const ev of events) {
    const i = findBucket(buckets, ev.at);
    if (i < 0) continue;
    const b = buckets[i];
    if (ev.source === "read") {
      b.taps += 1;
      continue;
    }
    b.reviews += 1;
    const pass = ev.grade !== "again";
    if (pass) b.passed += 1;
    else b.again += 1;
    if (ev.prevStatus === "known") {
      b.retentionReviews += 1;
      if (pass) b.retained += 1;
    }
  }
  for (const s of input.sessions) {
    const i = findBucket(buckets, s.finishedAt);
    if (i < 0) continue;
    buckets[i].finished += 1;
    if (typeof s.durationMs === "number" && s.durationMs > 0) {
      buckets[i].minutes += s.durationMs / 60000;
    }
  }

  // Lexicon status at the end of each bucket, rebuilt per word from history. Words with no
  // history keep their current status throughout; the last bucket is reconciled to `words`.
  const status = new Map<string, WordStatus | null>();
  const byWord = new Map<string, WordEvent[]>();
  for (const ev of events) {
    const list = byWord.get(ev.hanzi);
    if (list) list.push(ev);
    else byWord.set(ev.hanzi, [ev]);
  }
  const current = new Map<string, WordStatus>();
  for (const w of input.words) current.set(w.hanzi, w.status);
  for (const [hanzi, list] of byWord) {
    let s: WordStatus | null = list[0].prevStatus;
    for (const ev of list) {
      if (ev.at >= rangeFrom) break;
      s = ev.status;
    }
    status.set(hanzi, s);
  }
  for (const [hanzi, s] of current) if (!byWord.has(hanzi)) status.set(hanzi, s);
  const counts = { known: 0, shaky: 0, unknown: 0 };
  for (const s of status.values()) if (s) counts[s] += 1;
  const move = (hanzi: string, next: WordStatus | null) => {
    const prev = status.get(hanzi) ?? null;
    if (prev === next) return;
    if (prev) counts[prev] -= 1;
    if (next) counts[next] += 1;
    status.set(hanzi, next);
  };

  let ei = 0;
  while (ei < events.length && events[ei].at < rangeFrom) ei += 1;
  buckets.forEach((b, i) => {
    b.knownBefore = counts.known;
    while (ei < events.length && events[ei].at < b.end) {
      move(events[ei].hanzi, events[ei].status);
      ei += 1;
    }
    if (i === buckets.length - 1) {
      for (const [hanzi, s] of current) move(hanzi, s);
    }
    cumLearned += cumDelta[i].learned;
    cumForgotten += cumDelta[i].forgotten;
    b.cumLearned = cumLearned;
    b.cumForgotten = cumForgotten;
    b.known = counts.known;
    b.shaky = counts.shaky;
    b.unknown = counts.unknown;
    b.total = counts.known + counts.shaky + counts.unknown;
  });
  return buckets;
}

export type PeriodSummary = {
  learned: number;
  relearned: number;
  forgotten: number;
  seen: number;
  reviews: number;
  passed: number;
  accuracy: number | null;
  retention: number | null;
  taps: number;
  finished: number;
  minutes: number;
  activeBuckets: number;
};

/** Totals across a slice of buckets (the selected range). */
export function summarizePeriod(buckets: readonly ProgressBucket[]): PeriodSummary {
  const sum = (f: (b: ProgressBucket) => number) => buckets.reduce((n, b) => n + f(b), 0);
  const reviews = sum((b) => b.reviews);
  const passed = sum((b) => b.passed);
  const retentionReviews = sum((b) => b.retentionReviews);
  const retained = sum((b) => b.retained);
  const activeBuckets = buckets.filter((b) => b.reviews + b.taps + b.finished > 0).length;
  return {
    learned: sum((b) => b.learned),
    relearned: sum((b) => b.relearned),
    forgotten: sum((b) => b.forgotten),
    seen: sum((b) => b.seen),
    reviews,
    passed,
    accuracy: reviews > 0 ? passed / reviews : null,
    retention: retentionReviews > 0 ? retained / retentionReviews : null,
    taps: sum((b) => b.taps),
    finished: sum((b) => b.finished),
    minutes: sum((b) => b.minutes),
    activeBuckets,
  };
}

/** Distinct local days with at least one review grade in [from, to). */
export function reviewDays(events: readonly WordEvent[], from: number, to: number): number {
  const days = new Set<string>();
  for (const e of events) {
    if (e.source === "review" && e.at >= from && e.at < to) days.add(dayKey(e.at));
  }
  return days.size;
}

/** Activity per local day: reader taps + review grades + finished texts. */
export function activityByDay(
  events: readonly WordEvent[],
  sessions: readonly ReadingSession[],
): Map<string, number> {
  const map = new Map<string, number>();
  const bump = (ts: number) => {
    const k = dayKey(ts);
    map.set(k, (map.get(k) ?? 0) + 1);
  };
  for (const e of events) bump(e.at);
  for (const s of sessions) bump(s.finishedAt);
  return map;
}

/** Current streak stays alive through today if yesterday was active. */
export function activityStreaks(
  activity: Map<string, number>,
  now: number,
): { current: number; longest: number; activeDays: number } {
  const days = [...activity.entries()]
    .filter(([, n]) => n > 0)
    .map(([k]) => k)
    .sort();
  let longest = 0;
  let run = 0;
  let prev: number | null = null;
  for (const k of days) {
    const [y, m, d] = k.split("-").map(Number);
    const t = new Date(y, m - 1, d).getTime();
    run = prev != null && dayDiff(prev, t) === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
    prev = t;
  }
  const active = (t: number) => (activity.get(dayKey(t)) ?? 0) > 0;
  let cursor = startOfDay(now);
  if (!active(cursor)) cursor = addDays(cursor, -1);
  let current = 0;
  while (active(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }
  return { current, longest, activeDays: days.length };
}

export type CardStates = {
  /** Unknown/shaky, never reviewed in SM-2. */
  fresh: number;
  /** Marked Okay while reading, never reviewed. */
  readKnown: number;
  /** Reviewed, currently unknown/shaky. */
  learning: number;
  /** Reviewed, known, interval < 21 days. */
  young: number;
  /** Reviewed, known, interval ≥ 21 days. */
  mature: number;
};

export function cardStateCounts(words: Iterable<WordRecord>): CardStates {
  const out: CardStates = { fresh: 0, readKnown: 0, learning: 0, young: 0, mature: 0 };
  for (const w of words) {
    const reviewed = w.dueAt != null || w.repetitions > 0;
    if (!reviewed) {
      if (w.status === "known") out.readKnown += 1;
      else out.fresh += 1;
    } else if (w.status !== "known") out.learning += 1;
    else if (w.intervalDays >= MATURE_DAYS) out.mature += 1;
    else out.young += 1;
  }
  return out;
}

/**
 * Scheduled SM-2 reviews for each of the next `days` days (index 0 = today, overdue folded in).
 * Unknown/shaky words sit in the review queue every day regardless of schedule, so they are
 * reported separately as `queued` instead of swamping today’s bar.
 */
export function reviewForecast(
  words: Iterable<WordRecord>,
  now: number,
  days = 30,
): { days: { start: number; count: number }[]; queued: number } {
  const today = startOfDay(now);
  const out = Array.from({ length: Math.max(0, days) }, (_, i) => ({ start: addDays(today, i), count: 0 }));
  let queued = 0;
  for (const w of words) {
    if (w.status !== "known") {
      queued += 1;
      continue;
    }
    if (w.dueAt == null) continue;
    const i = Math.max(0, dayDiff(today, w.dueAt));
    if (i < out.length) out[i].count += 1;
  }
  return { days: out, queued };
}

export const INTERVAL_BUCKETS: { label: string; lo: number; hi: number }[] = [
  { label: "1d", lo: 0, hi: 2 },
  { label: "2–6d", lo: 2, hi: 7 },
  { label: "1–2w", lo: 7, hi: 15 },
  { label: "2–3w", lo: 15, hi: 21 },
  { label: "3w–2m", lo: 21, hi: 61 },
  { label: "2–6m", lo: 61, hi: 181 },
  { label: "6m+", lo: 181, hi: Number.POSITIVE_INFINITY },
];

/** SM-2 interval spread across reviewed cards. */
export function intervalDistribution(words: Iterable<WordRecord>): { label: string; count: number }[] {
  const counts = INTERVAL_BUCKETS.map(() => 0);
  for (const w of words) {
    if (w.dueAt == null && w.repetitions === 0) continue;
    const i = INTERVAL_BUCKETS.findIndex((b) => w.intervalDays >= b.lo && w.intervalDays < b.hi);
    if (i >= 0) counts[i] += 1;
  }
  return INTERVAL_BUCKETS.map((b, i) => ({ label: b.label, count: counts[i] }));
}

export type HardWord = {
  hanzi: string;
  lapses: number;
  misses: number;
  barely: number;
  ease: number;
  status: WordStatus;
};

/** Words that keep slipping: lapses first, then Don’t know taps, then low SM-2 ease. */
export function hardestWords(
  words: Iterable<WordRecord>,
  events: readonly WordEvent[],
  limit = 10,
): HardWord[] {
  const lapses = new Map<string, number>();
  for (const t of learningTransitions(events)) {
    if (t.kind === "forgotten") lapses.set(t.hanzi, (lapses.get(t.hanzi) ?? 0) + 1);
  }
  const score = (h: HardWord) => h.lapses * 3 + h.misses + h.barely * 0.5;
  return [...words]
    .map((w) => ({
      hanzi: w.hanzi,
      lapses: lapses.get(w.hanzi) ?? 0,
      misses: w.dontKnowCount,
      barely: w.barelyCount,
      ease: w.ease,
      status: w.status,
    }))
    .filter((h) => h.lapses + h.misses + h.barely > 0)
    .sort(
      (a, b) =>
        score(b) - score(a) || a.ease - b.ease || a.hanzi.localeCompare(b.hanzi, "zh"),
    )
    .slice(0, limit);
}
