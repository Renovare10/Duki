import type { WordRecord } from "../types";

/**
 * Last write wins, per word. `base` is the starting map (e.g. what a sync just loaded);
 * a record from `others` replaces it only when it is strictly newer (e.g. a status tap made
 * while that sync was in flight). Returns a new map; neither input is changed.
 */
export function keepNewerWords(
  base: Map<string, WordRecord>,
  others: Iterable<WordRecord>,
): Map<string, WordRecord> {
  const out = new Map(base);
  for (const word of others) {
    if (!word?.hanzi) continue;
    const have = out.get(word.hanzi);
    if (!have || (word.updatedAt || 0) > (have.updatedAt || 0)) out.set(word.hanzi, word);
  }
  return out;
}

/**
 * Timestamp for a new tap on a word: never older than (or equal to) the word's last change,
 * so two taps in the same millisecond, or a clock that stepped back, still order correctly.
 */
export function tapTime(prev: WordRecord | undefined, now = Date.now()): number {
  return Math.max(now, (prev?.updatedAt || 0) + 1);
}

/** Should an incoming (synced) word overwrite the stored one? Only when it is strictly newer. */
export function incomingWins(existing: WordRecord | undefined, incoming: WordRecord): boolean {
  return !existing || (incoming.updatedAt || 0) > (existing.updatedAt || 0);
}
