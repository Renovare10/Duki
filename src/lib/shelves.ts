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

export function pickRecommendedItems(
  items: ShelfItem[],
  scores: Map<string, TextScore>,
): { easy: ShelfItem | null; justRight: ShelfItem | null; hard: ShelfItem | null } {
  const unread = items.filter((item) => {
    if (!itemTeaches(item, scores)) return false;
    const src = scoreSource(item);
    if (!src) return false;
    const load = scores.get(src.id)?.unknownLoad ?? -1;
    if (load <= 0 || load > REC_HARD_MAX) return false;
    if (item.type === "text") return !item.text.readAt;
    return bookProgress(item.book.chapters) !== "read";
  });

  if (unread.length === 0) {
    return { easy: null, justRight: null, hard: null };
  }

  const byLoad = [...unread].sort((a, b) => {
    return (scores.get(scoreSource(a)!.id)!.unknownLoad - scores.get(scoreSource(b)!.id)!.unknownLoad);
  });

  const easy = byLoad[0];
  const rest = byLoad.slice(1);
  if (rest.length === 0) return { easy, justRight: null, hard: null };

  const justRight = [...rest].sort((a, b) => {
    const da = Math.abs(scores.get(scoreSource(a)!.id)!.unknownLoad - TARGET);
    const db = Math.abs(scores.get(scoreSource(b)!.id)!.unknownLoad - TARGET);
    return da - db;
  })[0];
  const after = rest.filter((item) => itemId(item) !== itemId(justRight));
  const hard = after.length ? after[after.length - 1] : null;

  return { easy, justRight, hard };
}

export function pickRecommendedTrio(
  texts: LibraryText[],
  scores: Map<string, TextScore>,
): { easy: LibraryText | null; justRight: LibraryText | null; hard: LibraryText | null } {
  const trio = pickRecommendedItems(collapseTexts(texts), scores);
  return {
    easy: trio.easy ? scoreSource(trio.easy) : null,
    justRight: trio.justRight ? scoreSource(trio.justRight) : null,
    hard: trio.hard ? scoreSource(trio.hard) : null,
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

  const trio = pickRecommendedItems(collapsed, scores);
  const recItems = [trio.easy, trio.justRight, trio.hard].filter(Boolean) as ShelfItem[];
  if (recItems.length) {
    const tags: Record<string, string> = {};
    if (trio.easy) tags[itemId(trio.easy)] = "Easy";
    if (trio.justRight) tags[itemId(trio.justRight)] = "Just right";
    if (trio.hard) tags[itemId(trio.hard)] = "Harder";
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
