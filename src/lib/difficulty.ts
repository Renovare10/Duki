/**
 * Text difficulty: an absolute level (same for everyone, precomputed offline)
 * and a personal estimate (how much of a text this reader already knows).
 *
 * Duki Level (L1–L10) is defined by how much of a text's running words fall
 * inside the cumulative HSK 2.0 word lists (compounds count when their parts
 * do — see makeHskLookup):
 *
 *   L1–L6  ≥ 95% of tokens are HSK 1…L words (L6 = all of HSK 1–6)
 *   L7     HSK 1–6 still covers ≥ 90%
 *   L8     ≥ 85%    L9  ≥ 80%    L10  < 80% (native / literary / classical)
 *
 * 95% coverage is the usual "comfortable with help" threshold for reading;
 * each step on the ladder should add only a few percent new tokens for a
 * reader who finished the step below.
 */

export const LEVEL_COVERAGE = 0.95;
export const MAX_LEVEL = 10;

export type LevelInfo = {
  level: number;
  /** Continuous position for ordering within a level (level ≤ score < level + 1). */
  score: number;
};

export const LEVEL_NAMES: Record<number, string> = {
  1: "Starter",
  2: "Beginner",
  3: "Elementary",
  4: "Pre-intermediate",
  5: "Intermediate",
  6: "Upper-intermediate",
  7: "Advanced",
  8: "Advanced+",
  9: "Near-native",
  10: "Native",
};

/** Short band used for filters: groups of levels a learner recognises. */
export type LevelBand = "beginner" | "elementary" | "intermediate" | "advanced" | "native";

export const LEVEL_BANDS: { id: LevelBand; label: string; min: number; max: number }[] = [
  { id: "beginner", label: "Beginner (L1–2)", min: 1, max: 2 },
  { id: "elementary", label: "Elementary (L3–4)", min: 3, max: 4 },
  { id: "intermediate", label: "Intermediate (L5–6)", min: 5, max: 6 },
  { id: "advanced", label: "Advanced (L7–8)", min: 7, max: 8 },
  { id: "native", label: "Native (L9–10)", min: 9, max: 10 },
];

export function levelBand(level: number): LevelBand {
  for (const band of LEVEL_BANDS) if (level >= band.min && level <= band.max) return band.id;
  return level < 1 ? "beginner" : "native";
}

/**
 * Cumulative coverage: cov[k-1] = share of word tokens whose word is in HSK 1…k.
 * `hskLevel(word)` returns 1–6, or undefined for words outside the lists.
 */
export function hskCoverage(
  words: Iterable<string>,
  hskLevel: (word: string) => number | undefined,
): { tokens: number; coverage: number[] } {
  const perLevel = [0, 0, 0, 0, 0, 0];
  let tokens = 0;
  for (const word of words) {
    tokens += 1;
    const lv = hskLevel(word);
    if (lv && lv >= 1 && lv <= 6) perLevel[lv - 1] += 1;
  }
  const coverage: number[] = [];
  let running = 0;
  for (let i = 0; i < 6; i++) {
    running += perLevel[i];
    coverage.push(tokens === 0 ? 1 : running / tokens);
  }
  return { tokens, coverage };
}

/** Level from cumulative HSK coverage (6 numbers, non-decreasing). */
export function levelFromCoverage(coverage: number[]): LevelInfo {
  const cov = coverage.length === 6 ? coverage : [...coverage, 1, 1, 1, 1, 1, 1].slice(0, 6);
  for (let k = 0; k < 6; k++) {
    if (cov[k] >= LEVEL_COVERAGE) {
      // Position inside the level: how far below the threshold the previous list was.
      const prev = k === 0 ? LEVEL_COVERAGE : cov[k - 1];
      const span = cov[k] - (k === 0 ? 0 : prev);
      const frac = k === 0 ? 1 - Math.min(1, cov[0]) : span <= 0 ? 0 : (LEVEL_COVERAGE - prev) / span;
      return { level: k + 1, score: k + 1 + clamp01(frac) * 0.99 };
    }
  }
  const c6 = cov[5];
  const steps: [number, number][] = [
    [7, 0.9],
    [8, 0.85],
    [9, 0.8],
  ];
  let upper = LEVEL_COVERAGE;
  for (const [level, floor] of steps) {
    if (c6 >= floor) return { level, score: level + clamp01((upper - c6) / (upper - floor)) * 0.99 };
    upper = floor;
  }
  return { level: 10, score: 10 + clamp01((0.8 - c6) / 0.8) * 0.99 };
}

function clamp01(n: number): number {
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;
}

/** Han characters in a string (what "字" counts and reading time use). */
export function hanCount(text: string): number {
  let n = 0;
  for (const ch of text) if (/[\u3400-\u9fff\uf900-\ufaff]/.test(ch)) n += 1;
  return n;
}

/** Learner reading pace, characters per minute, by level (slower when harder). */
export function readingMinutes(chars: number, level = 3): number {
  const cpm = level <= 2 ? 90 : level <= 4 ? 120 : level <= 6 ? 150 : 180;
  return Math.max(1, Math.round(chars / cpm));
}

/**
 * Vocabulary profile of a text or work: words (most frequent first) with their
 * token counts, plus tokens not listed (the long tail, assumed unknown).
 */
export type VocabProfile = {
  tokens: number;
  words: string[];
  counts: number[];
};

/**
 * Share of running words this reader knows (0–1), from a precomputed profile.
 * Unlisted tail tokens count as unknown, so this errs low.
 */
export function estimateKnown(profile: VocabProfile, isKnown: (word: string) => boolean): number {
  if (!profile.tokens) return 0;
  let known = 0;
  const n = Math.min(profile.words.length, profile.counts.length);
  for (let i = 0; i < n; i++) if (isKnown(profile.words[i])) known += profile.counts[i];
  return Math.min(1, known / profile.tokens);
}

/** A personal % is only meaningful once the reader has marked some words. */
export const PERSONAL_MIN_KNOWN = 20;

/**
 * HSK level lookup that also handles compounds and names the lists don't
 * contain verbatim (喝茶, 家里, 小明): a word counts at level L when it splits
 * into HSK words of level ≤ L. A character that is not an HSK word on its own
 * but occurs inside one (说 in 说话, 风 in 刮风) counts one level later than
 * that word, so rare characters known only from HSK 6 words stay uncovered.
 * Returns the lowest such L, or undefined when no split stays within HSK 1–6.
 */
export function makeHskLookup(levels: Map<string, number>): (word: string) => number | undefined {
  const charLevel = new Map<string, number>();
  let maxLen = 1;
  for (const [word, level] of levels) {
    maxLen = Math.max(maxLen, word.length);
    for (const ch of word) {
      const have = charLevel.get(ch);
      if (have === undefined || level + 1 < have) charLevel.set(ch, level + 1);
    }
  }
  const cache = new Map<string, number | undefined>();
  return (word: string) => {
    const direct = levels.get(word);
    if (direct !== undefined) return direct;
    if (cache.has(word)) return cache.get(word);
    const chars = [...word];
    // best[i] = lowest possible "max level" covering chars[0..i)
    const best: number[] = new Array(chars.length + 1).fill(Infinity);
    best[0] = 0;
    for (let i = 0; i < chars.length; i++) {
      if (best[i] === Infinity) continue;
      for (let len = 1; len <= Math.min(maxLen, chars.length - i); len++) {
        const piece = chars.slice(i, i + len).join("");
        const lv = len === 1 ? (levels.get(piece) ?? charLevel.get(piece)) : levels.get(piece);
        if (lv === undefined || lv > 6) continue;
        const next = Math.max(best[i], lv);
        if (next < best[i + len]) best[i + len] = next;
      }
    }
    const result = best[chars.length] === Infinity ? undefined : best[chars.length];
    cache.set(word, result);
    return result;
  };
}
