import type { WordRecord } from "../types";
import { MINUTE_MS, startOfDay } from "./dates";

/** New cards introduced per local day (Anki’s default). */
export const NEW_CARDS_PER_DAY = 20;
/** When nothing else is due, learning cards up to this far ahead can be shown (Anki’s default). */
export const LEARN_AHEAD_MS = 20 * MINUTE_MS;

/** A word marked Don't know / Barely that hasn't entered Review yet. */
export function isNewCard(word: WordRecord): boolean {
  return word.phase === "new" && word.status !== "known";
}

export function isLearning(word: WordRecord): boolean {
  return word.phase === "learning" || word.phase === "relearning";
}

/** Scheduled card whose due time has arrived (new cards are never "due"; they're introduced). */
export function isDue(word: WordRecord, now: number): boolean {
  if (word.phase === "new") return false;
  return word.dueAt == null || word.dueAt <= now;
}

export function newCardsIntroducedToday(words: Iterable<WordRecord>, now: number): number {
  const today = startOfDay(now);
  let n = 0;
  for (const w of words) if (w.introducedAt != null && w.introducedAt >= today) n += 1;
  return n;
}

export type QueueOptions = {
  newPerDay?: number;
};

/**
 * Today’s session: due learning/relearning cards, then due review cards (most overdue
 * first), then new cards up to what’s left of the daily new-card limit. A focused word
 * (opened from Stats) goes first even if it isn’t due.
 */
export function buildReviewQueue(
  words: Iterable<WordRecord>,
  now = Date.now(),
  focus?: string,
  options: QueueOptions = {},
): WordRecord[] {
  const all = [...words];
  const learning: WordRecord[] = [];
  const review: WordRecord[] = [];
  const fresh: WordRecord[] = [];
  for (const w of all) {
    if (isLearning(w)) {
      if (w.dueAt == null || w.dueAt <= now + LEARN_AHEAD_MS) learning.push(w);
    } else if (w.phase === "review") {
      if (isDue(w, now)) review.push(w);
    } else if (isNewCard(w)) {
      fresh.push(w);
    }
  }
  const byDue = (a: WordRecord, b: WordRecord) =>
    (a.dueAt ?? 0) - (b.dueAt ?? 0) || a.hanzi.localeCompare(b.hanzi, "zh");
  learning.sort(byDue);
  review.sort(byDue);
  // Most-missed words first, then the ones you met earliest.
  fresh.sort(
    (a, b) =>
      b.dontKnowCount + b.barelyCount - (a.dontKnowCount + a.barelyCount) ||
      a.updatedAt - b.updatedAt ||
      a.hanzi.localeCompare(b.hanzi, "zh"),
  );
  const limit = options.newPerDay ?? NEW_CARDS_PER_DAY;
  const room = Math.max(0, limit - newCardsIntroducedToday(all, now));
  const queue = [...learning, ...review, ...fresh.slice(0, room)];
  if (focus) {
    const i = queue.findIndex((w) => w.hanzi === focus);
    if (i > 0) queue.unshift(...queue.splice(i, 1));
    else if (i < 0) {
      const hit = all.find((w) => w.hanzi === focus);
      if (hit) queue.unshift(hit);
    }
  }
  return queue;
}

/**
 * Next card to show in a running session. `order` holds the session’s cards (graded cards
 * are moved to the back). Priority: a forced/focused card, then learning cards whose step
 * has elapsed (soonest first), then due review / new cards in queue order, then — when
 * nothing else is left — the soonest learning card within LEARN_AHEAD_MS. Null = done.
 */
export function pickNext(
  order: readonly string[],
  words: ReadonlyMap<string, WordRecord>,
  now: number,
  forced?: string | null,
): string | null {
  if (forced && order.includes(forced) && words.has(forced)) return forced;
  let dueLearning: WordRecord | null = null;
  let ahead: WordRecord | null = null;
  let first: string | null = null;
  for (const hanzi of order) {
    const w = words.get(hanzi);
    if (!w) continue;
    if (isLearning(w)) {
      const due = w.dueAt ?? 0;
      if (due <= now) {
        if (!dueLearning || (dueLearning.dueAt ?? 0) > due) dueLearning = w;
      } else if (due <= now + LEARN_AHEAD_MS) {
        if (!ahead || (ahead.dueAt ?? 0) > due) ahead = w;
      }
      continue;
    }
    if (first) continue;
    if (w.phase === "new" ? isNewCard(w) : isDue(w, now)) first = hanzi;
  }
  if (dueLearning) return dueLearning.hanzi;
  if (first) return first;
  return ahead ? ahead.hanzi : null;
}

/** Remaining work in a session, for the New · Learning · Review counter. */
export function sessionCounts(
  order: readonly string[],
  words: ReadonlyMap<string, WordRecord>,
  now: number,
): { fresh: number; learning: number; review: number } {
  let fresh = 0;
  let learning = 0;
  let review = 0;
  for (const hanzi of order) {
    const w = words.get(hanzi);
    if (!w) continue;
    if (w.phase === "new") {
      if (isNewCard(w)) fresh += 1;
    } else if (isLearning(w)) {
      if (w.dueAt == null || w.dueAt <= now + LEARN_AHEAD_MS) learning += 1;
    } else if (isDue(w, now)) review += 1;
  }
  return { fresh, learning, review };
}

/** Earliest upcoming scheduled card (for "next review" hints when the session is done). */
export function nextDueAt(words: Iterable<WordRecord>, now: number): number | null {
  let next: number | null = null;
  for (const w of words) {
    if (w.phase === "new" || w.dueAt == null || w.dueAt <= now) continue;
    if (next == null || w.dueAt < next) next = w.dueAt;
  }
  return next;
}
