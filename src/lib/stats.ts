import type { LibraryText, ReadingSession, WordRecord } from "../types";

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
