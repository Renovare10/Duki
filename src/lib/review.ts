import type { WordRecord } from "../types";

export function isDue(word: WordRecord, now: number): boolean {
  return word.dueAt != null && word.dueAt <= now;
}

/** Unknown/shaky words, plus any known card whose SM-2 due date has arrived. */
export function buildReviewQueue(
  words: Iterable<WordRecord>,
  now = Date.now(),
  focus?: string,
): WordRecord[] {
  const queue: WordRecord[] = [];
  for (const word of words) {
    if (word.status === "unknown" || word.status === "shaky" || isDue(word, now)) {
      queue.push(word);
    }
  }
  queue.sort((a, b) => {
    if (focus) {
      if (a.hanzi === focus && b.hanzi !== focus) return -1;
      if (b.hanzi === focus && a.hanzi !== focus) return 1;
    }
    const dueA = isDue(a, now) ? 0 : 1;
    const dueB = isDue(b, now) ? 0 : 1;
    if (dueA !== dueB) return dueA - dueB;
    if (a.status !== b.status) {
      const rank = { unknown: 0, shaky: 1, known: 2 };
      return rank[a.status] - rank[b.status];
    }
    return b.dontKnowCount + b.barelyCount - (a.dontKnowCount + a.barelyCount);
  });
  return queue;
}
