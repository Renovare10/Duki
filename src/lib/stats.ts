import type { LibraryText, ReadingSession, TextScore, WordRecord } from "../types";
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
