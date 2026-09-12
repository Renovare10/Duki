import type { ReviewGrade } from "../types";

export type Sm2State = {
  ease: number;
  intervalDays: number;
  repetitions: number;
  dueAt: number | null;
};

export const DEFAULT_EASE = 2.5;
export const MIN_EASE = 1.3;

const QUALITY: Record<ReviewGrade, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function defaultSm2(): Sm2State {
  return {
    ease: DEFAULT_EASE,
    intervalDays: 0,
    repetitions: 0,
    dueAt: null,
  };
}

/** SuperMemo-2. `again` resets the streak; reading taps must not call this. */
export function sm2Next(
  prev: Pick<Sm2State, "ease" | "intervalDays" | "repetitions">,
  grade: ReviewGrade,
  now = Date.now(),
): Sm2State {
  let ease = prev.ease || DEFAULT_EASE;
  let intervalDays = prev.intervalDays || 0;
  let repetitions = prev.repetitions || 0;
  const q = QUALITY[grade];

  if (q < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) intervalDays = 1;
    else if (repetitions === 1) intervalDays = grade === "easy" ? 4 : 6;
    else {
      const factor =
        grade === "hard" ? Math.max(1.2, ease - 0.15) : grade === "easy" ? ease * 1.3 : ease;
      intervalDays = Math.max(1, Math.round(intervalDays * factor));
    }
    repetitions += 1;
  }

  ease = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ease < MIN_EASE) ease = MIN_EASE;

  return {
    ease,
    intervalDays,
    repetitions,
    dueAt: now + intervalDays * DAY_MS,
  };
}
