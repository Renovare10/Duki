import type { CardPhase, ReviewGrade, WordRecord, WordStatus } from "../types";
import { addDays, startOfDay } from "./dates";
import { defaultSm2, scheduleReview } from "./sm2";

const PHASES: readonly CardPhase[] = ["new", "learning", "review", "relearning"];

/**
 * Fill defaults and migrate older records. Records saved before card phases existed are
 * mapped in place: anything SM-2 already scheduled becomes a review card that keeps its
 * interval and due date; never-reviewed words become new cards (introduced at most
 * NEW_CARDS_PER_DAY at a time by the review queue, so a backlog never floods one day).
 */
export function normalizeWord(raw: Partial<WordRecord> & { hanzi: string }): WordRecord {
  const sm = defaultSm2();
  const status: WordStatus =
    raw.status === "shaky" || raw.status === "known" || raw.status === "unknown"
      ? raw.status
      : "unknown";
  const updatedAt = raw.updatedAt || 0;
  const intervalDays = num(raw.intervalDays);
  const repetitions = num(raw.repetitions);
  let dueAt = typeof raw.dueAt === "number" ? raw.dueAt : null;
  let phase: CardPhase;
  let interval = intervalDays;
  if (raw.phase && PHASES.includes(raw.phase)) {
    phase = raw.phase;
  } else if (dueAt != null || repetitions > 0) {
    // Legacy SM-2 card: keep its schedule.
    phase = "review";
    interval = Math.max(1, intervalDays);
    if (dueAt == null && updatedAt > 0) dueAt = addDays(startOfDay(updatedAt), interval);
  } else {
    phase = "new";
  }
  return {
    hanzi: raw.hanzi,
    status,
    updatedAt,
    dontKnowCount: num(raw.dontKnowCount),
    barelyCount: num(raw.barelyCount),
    okayCount: num(raw.okayCount),
    ease: typeof raw.ease === "number" && raw.ease > 0 ? raw.ease : sm.ease,
    intervalDays: interval,
    repetitions,
    dueAt,
    phase,
    step: num(raw.step),
    lapses: num(raw.lapses),
    introducedAt: typeof raw.introducedAt === "number" ? raw.introducedAt : null,
  };
}

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * Reader taps: bump status + the matching count. Never runs SM-2 or touches intervals/ease.
 * One exception that respects spacing: Don't know on a card that's already scheduled pulls
 * its due date forward to now, so the next review session checks it (and a failed recall is
 * then handled as a normal lapse).
 */
export function applyReadingTap(
  prev: WordRecord | undefined,
  hanzi: string,
  status: WordStatus,
  now = Date.now(),
): WordRecord {
  const base = normalizeWord(prev ?? { hanzi, status, updatedAt: 0 });
  const next: WordRecord = { ...base, hanzi, status, updatedAt: now };
  if (status === "unknown") next.dontKnowCount += 1;
  else if (status === "shaky") next.barelyCount += 1;
  else next.okayCount += 1;
  if (status === "unknown" && base.phase !== "new" && (base.dueAt == null || base.dueAt > now)) {
    next.dueAt = now;
  }
  return next;
}

/** Review grades: SM-2 scheduling plus Duki status/counts. */
export function applyReviewGrade(
  prev: WordRecord,
  grade: ReviewGrade,
  now = Date.now(),
): WordRecord {
  const base = normalizeWord(prev);
  const sm = scheduleReview(base, grade, now);
  let status: WordStatus = base.status;
  let dontKnowCount = base.dontKnowCount;
  let barelyCount = base.barelyCount;
  let okayCount = base.okayCount;
  if (grade === "again") {
    status = "unknown";
    dontKnowCount += 1;
  } else if (grade === "hard") {
    status = "shaky";
    barelyCount += 1;
  } else {
    status = "known";
    okayCount += 1;
  }
  return {
    ...base,
    ...sm,
    status,
    dontKnowCount,
    barelyCount,
    okayCount,
    introducedAt: base.introducedAt ?? (base.phase === "new" ? now : null),
    updatedAt: now,
  };
}
