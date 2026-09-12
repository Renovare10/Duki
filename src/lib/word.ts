import type { ReviewGrade, WordRecord, WordStatus } from "../types";
import { defaultSm2, sm2Next } from "./sm2";

export function normalizeWord(raw: Partial<WordRecord> & { hanzi: string }): WordRecord {
  const sm = defaultSm2();
  const status: WordStatus =
    raw.status === "shaky" || raw.status === "known" || raw.status === "unknown"
      ? raw.status
      : "unknown";
  return {
    hanzi: raw.hanzi,
    status,
    updatedAt: raw.updatedAt || 0,
    dontKnowCount: num(raw.dontKnowCount),
    barelyCount: num(raw.barelyCount),
    okayCount: num(raw.okayCount),
    ease: typeof raw.ease === "number" && raw.ease > 0 ? raw.ease : sm.ease,
    intervalDays: num(raw.intervalDays),
    repetitions: num(raw.repetitions),
    dueAt: typeof raw.dueAt === "number" ? raw.dueAt : null,
  };
}

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}

/** Reader taps: bump status + the matching count. Never runs SM-2. */
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
  return next;
}

/** Review grades: SM-2 plus Duki status/counts. */
export function applyReviewGrade(
  prev: WordRecord,
  grade: ReviewGrade,
  now = Date.now(),
): WordRecord {
  const base = normalizeWord(prev);
  const sm = sm2Next(base, grade, now);
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
    updatedAt: now,
  };
}
