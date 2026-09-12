import type { TextScore, Token, WordStatus } from "../types";

export function scoreTokens(
  tokens: Token[],
  statuses: Map<string, WordStatus>,
): TextScore {
  const words = tokens.filter((t) => t.isWord);
  let known = 0;
  let shaky = 0;
  let unknown = 0;
  const unique = new Set<string>();
  const uniqueUnknown = new Set<string>();
  const uniqueShaky = new Set<string>();

  for (const token of words) {
    unique.add(token.text);
    const status = statuses.get(token.text);
    if (status === "known") known += 1;
    else if (status === "shaky") {
      shaky += 1;
      uniqueShaky.add(token.text);
    } else {
      unknown += 1;
      uniqueUnknown.add(token.text);
    }
  }

  const total = words.length;
  const knownPct = total === 0 ? 0 : known / total;
  return {
    total,
    known,
    shaky,
    unknown,
    knownPct,
    unknownLoad: total === 0 ? 0 : 1 - knownPct,
    unique: unique.size,
    uniqueUnknown: uniqueUnknown.size,
    uniqueShaky: uniqueShaky.size,
  };
}

export const TARGET = 0.075;
export const BAND_LO = 0.05;
export const BAND_HI = 0.1;

export function isFullyKnown(score: TextScore): boolean {
  if (score.total === 0) return false;
  return score.unknownLoad === 0;
}

export function stillTeaches(score: TextScore): boolean {
  return !isFullyKnown(score) && score.unknownLoad > 0;
}

export type LevelFilter = "just-right" | "easy" | "hard" | "known" | "all";

export function matchesLevel(score: TextScore, level: LevelFilter): boolean {
  if (score.total === 0) return level === "all";
  if (isFullyKnown(score)) return level === "known" || level === "all";
  if (level === "all") return true;
  if (level === "known") return false;
  return fitLabel(score) === level;
}

export function pickSuggestion<T extends { id: string }>(
  items: T[],
  scores: Map<string, TextScore>,
): string | null {
  if (items.length === 0) return null;

  const ranked = items
    .map((item) => {
      const score = scores.get(item.id);
      return {
        id: item.id,
        load: score?.unknownLoad ?? 1,
        unique: score?.unique ?? Number.MAX_SAFE_INTEGER,
        total: score?.total ?? Number.MAX_SAFE_INTEGER,
        known: score ? isFullyKnown(score) : false,
      };
    })
    .filter((r) => !r.known && r.load > 0);

  if (ranked.length === 0) return null;

  const inBand = ranked.filter((r) => r.load >= BAND_LO && r.load <= BAND_HI);
  if (inBand.length > 0) {
    inBand.sort(
      (a, b) =>
        Math.abs(a.load - TARGET) - Math.abs(b.load - TARGET) ||
        a.total - b.total,
    );
    return inBand[0].id;
  }

  const above = ranked.filter((r) => r.load > BAND_HI);
  if (above.length > 0) {
    above.sort((a, b) => a.load - b.load || a.unique - b.unique || a.total - b.total);
    return above[0].id;
  }

  ranked.sort((a, b) => b.load - a.load || a.total - b.total);
  return ranked[0].id;
}

export function remainingUniques(
  tokens: Token[],
  statuses: Map<string, WordStatus>,
): { uniqueUnknown: number; uniqueShaky: number } {
  const uniqueUnknown = new Set<string>();
  const uniqueShaky = new Set<string>();
  for (const token of tokens) {
    if (!token.isWord) continue;
    const status = statuses.get(token.text);
    if (status === "known") continue;
    if (status === "shaky") uniqueShaky.add(token.text);
    else uniqueUnknown.add(token.text);
  }
  return { uniqueUnknown: uniqueUnknown.size, uniqueShaky: uniqueShaky.size };
}

export function coveragePercents(score: TextScore): { known: number; unknown: number } {
  const known = score.total === 0 ? 0 : Math.round(score.knownPct * 100);
  return { known, unknown: 100 - known };
}

/** Recommended may stretch to ~35% unknown. 43% stays out. */
export const REC_HARD_MAX = 0.38;

export function isScored(score: TextScore): boolean {
  return score.total > 0;
}

export function fitLabel(score: TextScore): "just-right" | "easy" | "hard" | "unscored" {
  if (score.total === 0) return "unscored";
  if (score.unknownLoad < BAND_LO) return "easy";
  if (score.unknownLoad <= BAND_HI) return "just-right";
  return "hard";
}
