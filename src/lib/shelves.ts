import type { LibraryText, ReadingSession, TextCategory, TextScore } from "../types";
import {
  BAND_HI,
  BAND_LO,
  HARD_CAP,
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

export type Shelf = {
  id: string;
  title: string;
  items: LibraryText[];
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
  { id: "gutenberg", title: "Gutenberg" },
  { id: "paste", title: "Yours" },
];

export function matchesSearch(text: LibraryText, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    text.title.toLowerCase().includes(q) ||
    (text.blurb || "").toLowerCase().includes(q) ||
    (text.author || "").toLowerCase().includes(q)
  );
}

export function matchesRead(text: LibraryText, read: ReadFilter): boolean {
  if (read === "unread") return !text.readAt;
  if (read === "read") return Boolean(text.readAt);
  return true;
}

function inBase(
  text: LibraryText,
  filters: HomeFilters,
  scores: Map<string, TextScore>,
  opts?: { ignoreLevel?: boolean },
): boolean {
  if (!matchesSearch(text, filters.query)) return false;
  if (!matchesRead(text, filters.read)) return false;
  if (filters.category !== "all" && text.category !== filters.category) return false;
  if (opts?.ignoreLevel) return true;
  const score = scores.get(text.id);
  if (!text.body.trim() || !score || !isScored(score)) return filters.level === "all";
  return matchesLevel(score, filters.level);
}

export function orderByLevel(
  items: LibraryText[],
  scores: Map<string, TextScore>,
  level: LevelFilter,
): LibraryText[] {
  if (level === "all") return items;
  const hit: LibraryText[] = [];
  const rest: LibraryText[] = [];
  for (const item of items) {
    const score = scores.get(item.id);
    const matches =
      Boolean(item.body.trim()) &&
      Boolean(score && isScored(score) && matchesLevel(score, level));
    (matches ? hit : rest).push(item);
  }
  return hit.concat(rest);
}

function teaches(text: LibraryText, scores: Map<string, TextScore>): boolean {
  if (!text.body.trim()) return false;
  const score = scores.get(text.id);
  return Boolean(score && stillTeaches(score));
}

export function pickRecommendedTrio(
  texts: LibraryText[],
  scores: Map<string, TextScore>,
): { easy: LibraryText | null; justRight: LibraryText | null; hard: LibraryText | null } {
  const pool = texts.filter((t) => teaches(t, scores));
  const used = new Set<string>();

  function pickIn(
    pred: (load: number) => boolean,
    prefer: "low" | "target",
  ): LibraryText | null {
    const matches = pool.filter(
      (t) => !used.has(t.id) && pred(scores.get(t.id)?.unknownLoad ?? -1),
    );
    if (matches.length === 0) return null;
    const unread = matches.filter((t) => !t.readAt);
    const use = unread.length > 0 ? unread : matches;
    use.sort((a, b) => {
      const sa = scores.get(a.id)!;
      const sb = scores.get(b.id)!;
      if (prefer === "target") {
        return Math.abs(sa.unknownLoad - TARGET) - Math.abs(sb.unknownLoad - TARGET);
      }
      return sa.unknownLoad - sb.unknownLoad;
    });
    const pick = use[0];
    used.add(pick.id);
    return pick;
  }

  return {
    easy: pickIn((load) => load > 0 && load < BAND_LO, "low"),
    justRight: pickIn((load) => load >= BAND_LO && load <= BAND_HI, "target"),
    hard: pickIn((load) => load > BAND_HI && load <= HARD_CAP, "low"),
  };
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
  const visible = texts.filter((t) => inBase(t, filters, scores, { ignoreLevel: true }));
  const leveled = texts.filter((t) => inBase(t, filters, scores));

  if (q) {
    if (visible.length) {
      shelves.push({
        id: "results",
        title: "Results",
        items: orderByLevel(visible, scores, filters.level),
      });
    }
    return shelves;
  }

  const trioPool = texts.filter(
    (t) =>
      matchesSearch(t, filters.query) &&
      matchesRead(t, filters.read) &&
      (filters.category === "all" || t.category === filters.category),
  );
  const trio = pickRecommendedTrio(trioPool, scores);
  const recItems = [trio.easy, trio.justRight, trio.hard].filter(Boolean) as LibraryText[];
  if (recItems.length) {
    const tags: Record<string, string> = {};
    if (trio.easy) tags[trio.easy.id] = "Easy";
    if (trio.justRight) tags[trio.justRight.id] = "Just right";
    if (trio.hard) tags[trio.hard.id] = "Harder";
    shelves.push({ id: "recommended", title: "Recommended", items: recItems, tags });
  }

  const continuing = orderByLevel(
    leveled.filter((t) => {
      if (!isContinue(t)) return false;
      const score = scores.get(t.id);
      return score ? stillTeaches(score) : Boolean(t.body.trim());
    }),
    scores,
    filters.level,
  );
  if (continuing.length) shelves.push({ id: "continue", title: "Continue", items: continuing });

  const unread = orderByLevel(
    leveled.filter((t) => !t.readAt),
    scores,
    filters.level,
  );
  if (unread.length) shelves.push({ id: "unread", title: "Unread", items: unread });

  const read = orderByLevel(
    leveled.filter((t) => Boolean(t.readAt)),
    scores,
    filters.level,
  );
  if (read.length) shelves.push({ id: "read", title: "Read", items: read });

  for (const row of EDITORIAL) {
    if (filters.category !== "all" && filters.category !== row.id) continue;
    const items = orderByLevel(
      visible.filter((t) => t.category === row.id),
      scores,
      filters.level,
    );
    if (items.length) shelves.push({ id: row.id, title: row.title, items });
  }

  return shelves;
}
