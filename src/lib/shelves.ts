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
  isScored,
  stillTeaches,
  matchesLevel,
  type LevelFilter,
} from "./score";
import { isContinue } from "./text";

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
  return score.unknownLoad;
}

function recommendable(item: ShelfItem, scores: Map<string, TextScore>): boolean {
  if (isPasteItem(item) || !itemTeaches(item, scores)) return false;
  const load = loadOf(item, scores);
  return load !== null && load > 0 && load <= REC_HARD_MAX;
}

function inRecBand(load: number, band: "easy" | "just-right" | "hard"): boolean {
  if (band === "easy") return load < BAND_LO;
  if (band === "just-right") return load >= BAND_LO && load <= BAND_HI;
  return load > BAND_HI && load <= REC_HARD_MAX;
}

function pickInBand(
  pool: ShelfItem[],
  scores: Map<string, TextScore>,
  band: "easy" | "just-right" | "hard",
): ShelfItem | null {
  const hits = pool.filter((item) => {
    const load = loadOf(item, scores);
    return load !== null && inRecBand(load, band);
  });
  hits.sort((a, b) => {
    const read = Number(finished(b)) - Number(finished(a));
    if (read !== 0) return read;
    const la = loadOf(a, scores)!;
    const lb = loadOf(b, scores)!;
    const fit = band === "just-right" ? Math.abs(la - TARGET) - Math.abs(lb - TARGET) : la - lb;
    if (fit !== 0) return fit;
    return itemId(a).localeCompare(itemId(b));
  });
  return hits[0] ?? null;
}

/** A good unread story, or the easiest unread one when every unread story is a wall. */
function pickFresh(
  items: ShelfItem[],
  scores: Map<string, TextScore>,
  used: Set<string>,
): ShelfItem | null {
  const rows = items
    .filter((item) => !isPasteItem(item) && neverRead(item) && !used.has(itemId(item)))
    .map((item) => ({ item, load: loadOf(item, scores) }))
    .filter((row): row is { item: ShelfItem; load: number } => row.load !== null && row.load > 0);
  const good = rows.filter((row) => row.load <= REC_HARD_MAX);
  const pool = good.length ? good : rows;
  pool.sort((a, b) => {
    const fit = good.length
      ? Math.abs(a.load - TARGET) - Math.abs(b.load - TARGET)
      : a.load - b.load;
    if (fit !== 0) return fit;
    return itemId(a.item).localeCompare(itemId(b.item));
  });
  return pool[0]?.item ?? null;
}

export function pickRecommendedItems(
  items: ShelfItem[],
  scores: Map<string, TextScore>,
): RecommendedPicks {
  const pool = items.filter((item) => recommendable(item, scores));
  const easy = pickInBand(pool, scores, "easy");
  const justRight = pickInBand(pool, scores, "just-right");
  const hard = pickInBand(pool, scores, "hard");
  const used = new Set(
    [easy, justRight, hard].filter((item): item is ShelfItem => item !== null).map((item) => itemId(item)),
  );
  return { easy, justRight, hard, fresh: pickFresh(items, scores, used) };
}

export function pickRecommendedTrio(
  texts: LibraryText[],
  scores: Map<string, TextScore>,
): { easy: LibraryText | null; justRight: LibraryText | null; hard: LibraryText | null; fresh: LibraryText | null } {
  const picks = pickRecommendedItems(collapseTexts(texts), scores);
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
    if (picks.fresh) tags[itemId(picks.fresh)] = "Unread";
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
