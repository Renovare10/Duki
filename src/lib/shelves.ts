import type { LibraryText, ReadingSession, TextCategory, TextScore } from "../types";
import {
  bookProgress,
  collapseTexts,
  itemId,
  itemTeaches,
  scoreSource,
  type ShelfItem,
} from "./books";
import {
  BAND_HI,
  BAND_LO,
  REC_HARD_MAX,
  TARGET,
  roundLoad,
  isScored,
  stillTeaches,
  matchesLevel,
  type LevelFilter,
} from "./score";
import { isContinue } from "./text";
import { LIBRARY_TOPICS } from "../data/library/index";
import { TEXT_TOPICS } from "../data/topics";

export type { LevelFilter };

export type ReadFilter = "all" | "unread" | "read";
export type CategoryFilter = "all" | TextCategory;

export type HomeFilters = {
  level: LevelFilter;
  read: ReadFilter;
  category: CategoryFilter;
  query: string;
};

export type { ShelfItem };

export type Shelf = {
  id: string;
  title: string;
  items: ShelfItem[];
  tags?: Record<string, string>;
};

const EDITORIAL: { id: TextCategory; title: string }[] = [
  { id: "story", title: "Stories" },
  { id: "children", title: "Children’s" },
  { id: "science", title: "Science" },
  { id: "history", title: "History" },
  { id: "graded", title: "Graded" },
  { id: "article", title: "Articles" },
  { id: "novel", title: "Novels" },
  { id: "wiki", title: "Wikipedia" },
  { id: "wikisource", title: "Wikisource" },
  { id: "paste", title: "Yours" },
];

export function matchesSearch(text: LibraryText, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    text.title.toLowerCase().includes(q) ||
    (text.blurb || "").toLowerCase().includes(q) ||
    (text.author || "").toLowerCase().includes(q) ||
    (text.seriesTitle || "").toLowerCase().includes(q)
  );
}

function itemSearch(item: ShelfItem, query: string): boolean {
  if (item.type === "text") return matchesSearch(item.text, query);
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (
    item.book.title.toLowerCase().includes(q) ||
    item.book.blurb.toLowerCase().includes(q) ||
    (item.book.author || "").toLowerCase().includes(q)
  ) {
    return true;
  }
  return item.book.chapters.some((c) => matchesSearch(c, query));
}

function itemRead(item: ShelfItem, read: ReadFilter): boolean {
  if (item.type === "text") return matchesRead(item.text, read);
  const progress = bookProgress(item.book.chapters);
  if (read === "unread") return progress !== "read";
  if (read === "read") return progress === "read";
  return true;
}

function itemCategory(item: ShelfItem): TextCategory {
  return item.type === "text" ? item.text.category : item.book.category;
}

export function matchesRead(text: LibraryText, read: ReadFilter): boolean {
  if (read === "unread") return !text.readAt;
  if (read === "read") return Boolean(text.readAt);
  return true;
}

function itemMatchesLevel(
  item: ShelfItem,
  scores: Map<string, TextScore>,
  level: LevelFilter,
): boolean {
  if (level === "all") return true;
  const src = scoreSource(item);
  if (!src?.body.trim()) return false;
  const score = scores.get(src.id);
  return Boolean(score && isScored(score) && matchesLevel(score, level));
}

export function orderByLevel(
  items: ShelfItem[],
  scores: Map<string, TextScore>,
  level: LevelFilter,
): ShelfItem[] {
  if (level === "all") return items;
  const hit: ShelfItem[] = [];
  const rest: ShelfItem[] = [];
  for (const item of items) {
    (itemMatchesLevel(item, scores, level) ? hit : rest).push(item);
  }
  return hit.concat(rest);
}

function inFilter(item: ShelfItem, filters: HomeFilters): boolean {
  if (!itemSearch(item, filters.query)) return false;
  if (!itemRead(item, filters.read)) return false;
  if (filters.category !== "all" && itemCategory(item) !== filters.category) return false;
  return true;
}

export type RecommendedPicks = {
  easy: ShelfItem | null;
  justRight: ShelfItem | null;
  hard: ShelfItem | null;
  fresh: ShelfItem | null;
};

function isPasteItem(item: ShelfItem): boolean {
  if (item.type === "text") return item.text.kind === "paste" || item.text.category === "paste";
  return item.book.kind === "paste" || item.book.category === "paste";
}

function finished(item: ShelfItem): boolean {
  if (item.type === "text") return Boolean(item.text.readAt);
  return bookProgress(item.book.chapters) === "read";
}

function neverRead(item: ShelfItem): boolean {
  if (item.type === "text") return !item.text.readAt && !isContinue(item.text);
  return bookProgress(item.book.chapters) === "unread";
}

function loadOf(item: ShelfItem, scores: Map<string, TextScore>): number | null {
  const src = scoreSource(item);
  if (!src) return null;
  const score = scores.get(src.id);
  if (!score || !isScored(score)) return null;
  return roundLoad(score.unknownLoad);
}

function topicIds(id: string): string[] {
  return TEXT_TOPICS[id] ?? LIBRARY_TOPICS[id] ?? [];
}

/** Wikisource and anything tagged classical. Never recommended. */
export function isClassicItem(item: ShelfItem): boolean {
  if (item.type === "book") return item.book.kind === "wikisource" || item.book.category === "wikisource";
  const text = item.text;
  if (text.kind === "wikisource" || text.category === "wikisource") return true;
  return topicIds(text.id).includes("classics");
}

function recommendable(item: ShelfItem, scores: Map<string, TextScore>): boolean {
  if (isPasteItem(item) || isClassicItem(item) || !itemTeaches(item, scores)) return false;
  const load = loadOf(item, scores);
  return load !== null && load > 0 && load <= REC_HARD_MAX;
}

/** 0 unread, 1 started, 2 finished. Unread wins, then in-progress. */
function readRank(item: ShelfItem): number {
  if (neverRead(item)) return 0;
  if (finished(item)) return 2;
  return 1;
}

/** Daily seed so the same shelf rotates once a day. */
export function daySeed(now = new Date()): number {
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

export function mixHash(seed: number, id: string): number {
  let h = (seed + 1) >>> 0;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export type RecOptions = {
  /** When set, picks rotate inside a priority tier. Omit for a stable order. */
  seed?: number;
  /** Center of Just right. Defaults to TARGET. */
  target?: number;
};

function inRecBand(load: number, band: "easy" | "just-right" | "hard"): boolean {
  if (band === "easy") return load < BAND_LO;
  if (band === "just-right") return load >= BAND_LO && load <= BAND_HI;
  return load > BAND_HI && load <= REC_HARD_MAX;
}

function byPriority(
  items: ShelfItem[],
  seed: number | undefined,
  salt: string,
  fit: (item: ShelfItem) => number,
): ShelfItem | null {
  if (!items.length) return null;
  const best = Math.min(...items.map(readRank));
  const pool = items.filter((item) => readRank(item) === best);
  pool.sort((a, b) => {
    if (seed !== undefined) {
      const h = mixHash(seed, `${salt}:${itemId(a)}`) - mixHash(seed, `${salt}:${itemId(b)}`);
      if (h !== 0) return h;
    }
    const d = fit(a) - fit(b);
    if (d !== 0) return d;
    return itemId(a).localeCompare(itemId(b));
  });
  return pool[0] ?? null;
}

function pickInBand(
  pool: ShelfItem[],
  scores: Map<string, TextScore>,
  band: "easy" | "just-right" | "hard",
  options: RecOptions,
): ShelfItem | null {
  const target = options.target ?? TARGET;
  const hits = pool.filter((item) => {
    const load = loadOf(item, scores);
    return load !== null && inRecBand(load, band);
  });
  return byPriority(hits, options.seed, band, (item) => {
    const load = loadOf(item, scores)!;
    return band === "just-right" ? Math.abs(load - target) : load;
  });
}

/**
 * Unread story in the just-right range, or the lowest-difficulty unread left.
 * Classics and unscored items are already out. Never repeats a band pick.
 */
function pickFresh(
  items: ShelfItem[],
  scores: Map<string, TextScore>,
  used: Set<string>,
  options: RecOptions,
): ShelfItem | null {
  const target = options.target ?? TARGET;
  const rows = items
    .filter((item) => !isPasteItem(item) && !isClassicItem(item) && neverRead(item) && !used.has(itemId(item)))
    .map((item) => ({ item, load: loadOf(item, scores) }))
    .filter((row): row is { item: ShelfItem; load: number } => row.load !== null && row.load > 0);
  const inBand = rows.filter((row) => row.load >= BAND_LO && row.load <= BAND_HI);
  const pool = (inBand.length ? inBand : rows).map((row) => row.item);
  return byPriority(pool, options.seed, "fresh", (item) => {
    const load = loadOf(item, scores)!;
    return inBand.length ? Math.abs(load - target) : load;
  });
}

function freshTag(item: ShelfItem, scores: Map<string, TextScore>): string {
  const load = loadOf(item, scores);
  if (load !== null && load > REC_HARD_MAX) return "Steep";
  return "Unread";
}

export function pickRecommendedItems(
  items: ShelfItem[],
  scores: Map<string, TextScore>,
  options: RecOptions = {},
): RecommendedPicks {
  const pool = items.filter((item) => recommendable(item, scores));
  const easy = pickInBand(pool, scores, "easy", options);
  const justRight = pickInBand(pool, scores, "just-right", options);
  const hard = pickInBand(pool, scores, "hard", options);
  const used = new Set(
    [easy, justRight, hard].filter((item): item is ShelfItem => item !== null).map((item) => itemId(item)),
  );
  return { easy, justRight, hard, fresh: pickFresh(items, scores, used, options) };
}

export function pickRecommendedTrio(
  texts: LibraryText[],
  scores: Map<string, TextScore>,
  options: RecOptions = {},
): { easy: LibraryText | null; justRight: LibraryText | null; hard: LibraryText | null; fresh: LibraryText | null } {
  const picks = pickRecommendedItems(collapseTexts(texts), scores, options);
  return {
    easy: picks.easy ? scoreSource(picks.easy) : null,
    justRight: picks.justRight ? scoreSource(picks.justRight) : null,
    hard: picks.hard ? scoreSource(picks.hard) : null,
    fresh: picks.fresh ? scoreSource(picks.fresh) : null,
  };
}

function teaches(text: LibraryText, scores: Map<string, TextScore>): boolean {
  if (!text.body.trim()) return false;
  const score = scores.get(text.id);
  return Boolean(score && stillTeaches(score));
}

export function pickHero(
  texts: LibraryText[],
  scores: Map<string, TextScore>,
  suggest: (items: LibraryText[], scores: Map<string, TextScore>) => string | null,
): LibraryText | null {
  const pool0 = texts.filter((t) => teaches(t, scores) && t.kind !== "paste");
  const unread = pool0.filter((t) => !t.readAt);
  const pool = unread.length > 0 ? unread : pool0;
  const id = suggest(pool, scores);
  if (!id) return null;
  const text = texts.find((t) => t.id === id);
  const score = text ? scores.get(text.id) : undefined;
  if (!text || !score || !stillTeaches(score)) return null;
  return text;
}

export function buildShelves(
  texts: LibraryText[],
  scores: Map<string, TextScore>,
  _sessions: ReadingSession[],
  filters: HomeFilters,
): Shelf[] {
  const shelves: Shelf[] = [];
  const q = filters.query.trim();
  const collapsed = collapseTexts(texts).filter((item) => inFilter(item, filters));
  const ordered = orderByLevel(collapsed, scores, filters.level);

  if (q) {
    if (ordered.length) shelves.push({ id: "results", title: "Results", items: ordered });
    return shelves;
  }

  const picks = pickRecommendedItems(collapsed, scores);
  const recItems = [picks.easy, picks.justRight, picks.hard, picks.fresh].filter(Boolean) as ShelfItem[];
  if (recItems.length) {
    const tags: Record<string, string> = {};
    if (picks.easy) tags[itemId(picks.easy)] = "Easy";
    if (picks.justRight) tags[itemId(picks.justRight)] = "Just right";
    if (picks.hard) tags[itemId(picks.hard)] = "Harder";
    if (picks.fresh) tags[itemId(picks.fresh)] = freshTag(picks.fresh, scores);
    shelves.push({ id: "recommended", title: "Recommended", items: recItems, tags });
  }

  const continuing = ordered.filter((item) => {
    if (item.type === "text") {
      if (!isContinue(item.text)) return false;
      const score = scores.get(item.text.id);
      return score ? stillTeaches(score) : Boolean(item.text.body.trim());
    }
    return item.book.chapters.some((c) => isContinue(c));
  });
  if (continuing.length) shelves.push({ id: "continue", title: "Continue", items: continuing });

  const unread = ordered.filter((item) => itemRead(item, "unread"));
  if (unread.length) shelves.push({ id: "unread", title: "Unread", items: unread });

  const read = ordered.filter((item) => itemRead(item, "read"));
  if (read.length) shelves.push({ id: "read", title: "Read", items: read });

  for (const row of EDITORIAL) {
    if (filters.category !== "all" && filters.category !== row.id) continue;
    const items = ordered.filter((item) => itemCategory(item) === row.id);
    if (items.length) shelves.push({ id: row.id, title: row.title, items });
  }

  return shelves;
}
