import type { CardPhase, ReviewGrade } from "../types";
import { addDays, dayDiff, MINUTE_MS, startOfDay } from "./dates";

/**
 * SM-2 as Anki runs it:
 * - New cards go through short learning steps (1 min, 10 min) and graduate to a 1-day interval
 *   (Easy skips straight to 4 days).
 * - Review cards grow by their ease factor on Good (×1.2 on Hard, ×ease×1.3 on Easy), with a
 *   bonus for days overdue. Ease moves −0.20 / −0.15 / 0 / +0.15 for Again / Hard / Good / Easy
 *   and never drops below 1.3. Ease only changes on review-phase grades, not learning steps.
 * - Again on a review card is a lapse: interval resets (LAPSE_INTERVAL_FACTOR, min 1 day) and
 *   the card relearns through a 10-minute step before returning to day intervals.
 * - Review intervals land on local calendar days (due from midnight).
 * Reading taps never call this.
 */

export type Sm2State = {
  ease: number;
  intervalDays: number;
  repetitions: number;
  dueAt: number | null;
  phase: CardPhase;
  step: number;
  lapses: number;
};

export const DEFAULT_EASE = 2.5;
export const MIN_EASE = 1.3;
export const LEARNING_STEPS_MIN = [1, 10];
export const RELEARNING_STEPS_MIN = [10];
export const GRADUATING_INTERVAL_DAYS = 1;
export const EASY_INTERVAL_DAYS = 4;
export const HARD_FACTOR = 1.2;
export const EASY_BONUS = 1.3;
/** Fraction of the old interval kept after a lapse (0 = SM-2/Anki default reset to 1 day). */
export const LAPSE_INTERVAL_FACTOR = 0;
export const MAX_INTERVAL_DAYS = 36500;

const EASE_DELTA: Record<ReviewGrade, number> = {
  again: -0.2,
  hard: -0.15,
  good: 0,
  easy: 0.15,
};

export function defaultSm2(): Sm2State {
  return {
    ease: DEFAULT_EASE,
    intervalDays: 0,
    repetitions: 0,
    dueAt: null,
    phase: "new",
    step: 0,
    lapses: 0,
  };
}

function clampEase(ease: number): number {
  return Math.max(MIN_EASE, Math.round(ease * 1000) / 1000);
}

function clampInterval(days: number): number {
  return Math.min(MAX_INTERVAL_DAYS, Math.max(1, Math.round(days)));
}

/** Review cards are due from the start of the local day `days` after today. */
export function dueOnDay(now: number, days: number): number {
  return addDays(startOfDay(now), days);
}

function stepDelay(steps: number[], step: number, grade: "again" | "hard"): number {
  if (grade === "again") return steps[0];
  const i = Math.min(step, steps.length - 1);
  // Anki: Hard on the first step waits halfway between the first two steps.
  if (i === 0 && steps.length > 1) return (steps[0] + steps[1]) / 2;
  return steps[i] * (steps.length === 1 ? 1.5 : 1);
}

/** Next state after a review grade. */
export function scheduleReview(prev: Sm2State, grade: ReviewGrade, now = Date.now()): Sm2State {
  const ease = prev.ease > 0 ? prev.ease : DEFAULT_EASE;
  const intervalDays = Math.max(0, prev.intervalDays || 0);
  const repetitions = Math.max(0, prev.repetitions || 0);
  const lapses = Math.max(0, prev.lapses || 0);
  const phase: CardPhase = prev.phase || "new";
  const base = { ease, intervalDays, repetitions, lapses };

  if (phase === "new" || phase === "learning") {
    const steps = LEARNING_STEPS_MIN;
    const step = phase === "new" ? 0 : Math.max(0, prev.step || 0);
    if (grade === "again" || grade === "hard") {
      return {
        ...base,
        phase: "learning",
        step: grade === "again" ? 0 : step,
        dueAt: now + stepDelay(steps, step, grade) * MINUTE_MS,
      };
    }
    const nextStep = step + 1;
    if (grade === "good" && nextStep < steps.length) {
      return { ...base, phase: "learning", step: nextStep, dueAt: now + steps[nextStep] * MINUTE_MS };
    }
    const days = grade === "easy" ? EASY_INTERVAL_DAYS : GRADUATING_INTERVAL_DAYS;
    return { ...base, phase: "review", step: 0, intervalDays: days, repetitions: 1, dueAt: dueOnDay(now, days) };
  }

  if (phase === "relearning") {
    const steps = RELEARNING_STEPS_MIN;
    const step = Math.max(0, prev.step || 0);
    const days = clampInterval(intervalDays);
    if (grade === "again" || grade === "hard") {
      return {
        ...base,
        intervalDays: days,
        phase: "relearning",
        step: grade === "again" ? 0 : step,
        dueAt: now + stepDelay(steps, step, grade) * MINUTE_MS,
      };
    }
    const nextStep = step + 1;
    if (grade === "good" && nextStep < steps.length) {
      return { ...base, intervalDays: days, phase: "relearning", step: nextStep, dueAt: now + steps[nextStep] * MINUTE_MS };
    }
    const back = grade === "easy" ? days + 1 : days;
    return { ...base, phase: "review", step: 0, intervalDays: back, repetitions: 1, dueAt: dueOnDay(now, back) };
  }

  // Review phase.
  const current = clampInterval(intervalDays || 1);
  const dueAt = prev.dueAt ?? now;
  if (grade === "again") {
    return {
      ease: clampEase(ease + EASE_DELTA.again),
      intervalDays: clampInterval(current * LAPSE_INTERVAL_FACTOR),
      repetitions: 0,
      lapses: lapses + 1,
      phase: "relearning",
      step: 0,
      dueAt: now + RELEARNING_STEPS_MIN[0] * MINUTE_MS,
    };
  }
  if (dueAt > now) {
    // Reviewed early (e.g. opened from Stats): no schedule credit for a pass.
    return { ...base, phase: "review", step: 0, intervalDays: current, dueAt };
  }
  const late = Math.max(0, dayDiff(dueAt, now));
  const hard = clampInterval(Math.max(current + 1, current * HARD_FACTOR));
  const good = clampInterval(Math.max(hard + 1, (current + late / 2) * ease));
  const easy = clampInterval(Math.max(good + 1, (current + late) * ease * EASY_BONUS));
  const next = grade === "hard" ? hard : grade === "good" ? good : easy;
  return {
    ease: clampEase(ease + EASE_DELTA[grade]),
    intervalDays: next,
    repetitions: repetitions + 1,
    lapses,
    phase: "review",
    step: 0,
    dueAt: dueOnDay(now, next),
  };
}

/** Short label for when a card would come back, e.g. "1m", "10m", "1d", "3.2mo". */
export function formatDelay(fromNow: number, dueAt: number | null, intervalDays: number, phase: CardPhase): string {
  if (dueAt == null) return "";
  if (phase === "learning" || phase === "relearning") {
    const min = Math.max(1, Math.round((dueAt - fromNow) / MINUTE_MS));
    return min < 60 ? `${min}m` : `${Math.round(min / 60)}h`;
  }
  const d = intervalDays;
  if (d < 30) return `${d}d`;
  if (d < 365) return `${(d / 30).toFixed(1).replace(/\.0$/, "")}mo`;
  return `${(d / 365).toFixed(1).replace(/\.0$/, "")}y`;
}
