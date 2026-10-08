/**
 * Library v2: what a card says up front (level, length, reading time, topic,
 * personal known-%) and how browsing filters and orders entries. Pure — the
 * Home screen renders whatever these return.
 */
import type { LibraryText, TextScore } from "../types";
import { TEXT_META } from "../data/text-meta";
import { TEXT_TOPICS } from "../data/topics";
import type { Book } from "./books";
import { scoreSource } from "./books";
import {
  estimateKnown,
  hanCount,
  LEVEL_NAMES,
  levelBand,
  PERSONAL_MIN_KNOWN,
  readingMinutes,
  type LevelBand,
  type VocabProfile,
} from "./difficulty";
import { BAND_HI, BAND_LO, isFullyKnown, type LevelFilter } from "./score";
import type { WorkMeta, WorkStats } from "./works";

export type LengthBucket = "short" | "medium" | "long";

export const LENGTHS: { id: LengthBucket; label: string; hint: string }[] = [
  { id: "short", label: "Short", hint: "under 300 字" },
  { id: "medium", label: "Medium", hint: "300–1,500 字" },
  { id: "long", label: "Long", hint: "books and long reads" },
];

export function lengthBucket(chars: number): LengthBucket {
  if (chars < 300) return "short";
  if (chars <= 1500) return "medium";
  return "long";
}

export type EntryInfo = {
  /** 1–10, or null when not measured (your own texts, live Wikipedia). */
  level: number | null;
  /** Upper level for ranges (works): "L7–8". */
  levelMax: number | null;
  /** Badge text: "L3", "L7–8", "Native", "Classical", or "" (nothing to show). */
  badge: string;
  /** Tooltip / long form: "Elementary", "Native Chinese (Wikipedia)". */
  badgeTitle: string;
  band: LevelBand | null;
  /** Ordering key: easier first; unmeasured last. */
  sortScore: number;
  chars: number | null;
  minutes: number | null;
  topics: string[];
};

const UNMEASURED = 99;

function measured(level: number, levelMax: number | null, score: number, chars: number, topics: string[]): EntryInfo {
  const badge = levelMax && levelMax !== level ? `L${level}–${levelMax}` : `L${level}`;
  return {
    level,
    levelMax,
    badge,
    badgeTitle: levelMax && levelMax !== level ? `${LEVEL_NAMES[level]} to ${LEVEL_NAMES[levelMax]}` : LEVEL_NAMES[level],
    band: levelBand(level),
    sortScore: score,
    chars,
    minutes: readingMinutes(chars, level),
    topics,
  };
}

export function describeText(
  text: LibraryText,
  meta: Record<string, readonly [number, number, number]> = TEXT_META,
  topics: Record<string, string[]> = TEXT_TOPICS,
): EntryInfo {
  const m = meta[text.id];
  const tags = topics[text.id] ?? [];
  if (m) return measured(m[0], null, m[1] / 100, m[2], tags);
  const chars = text.body.trim() ? hanCount(text.body) : null;
  const unmeasured = (badge: string, badgeTitle: string, band: LevelBand | null, t: string[]): EntryInfo => ({
    level: null,
    levelMax: null,
    badge,
    badgeTitle,
    band,
    sortScore: UNMEASURED,
    chars,
    minutes: chars ? readingMinutes(chars, 9) : null,
    topics: t,
  });
  if (text.kind === "wiki" || text.category === "wiki") {
    return unmeasured("Native", "Native Chinese — Wikipedia, written for adults", "native", ["encyclopedia"]);
  }
  if (text.kind === "wikisource" || text.category === "wikisource") {
    return unmeasured("Classical", "Classical or early modern Chinese from Wikisource", "native", ["classics"]);
  }
  return unmeasured("", "", null, tags);
}

export function describeBook(book: Book, meta = TEXT_META, topics = TEXT_TOPICS): EntryInfo {
  const infos = book.chapters.map((c) => describeText(c, meta, topics));
  const levels = infos.map((i) => i.level).filter((l): l is number => l !== null);
  const chars = infos.reduce((s, i) => s + (i.chars ?? 0), 0);
  const tags = [...new Set(infos.flatMap((i) => i.topics))];
  if (!levels.length) return { ...describeText(book.chapters[0], meta, topics), chars: chars || null, topics: tags };
  const lo = Math.min(...levels);
  const hi = Math.max(...levels);
  const score = infos.reduce((s, i) => Math.min(s, i.sortScore), UNMEASURED);
  return measured(lo, hi, score, chars, tags);
}

export function describeWork(work: WorkMeta, stats: WorkStats | undefined): EntryInfo {
  if (!stats) {
    return { level: null, levelMax: null, badge: "", badgeTitle: "", band: null, sortScore: UNMEASURED, chars: null, minutes: null, topics: work.topics };
  }
  // The range most chapters sit in (25th–75th percentile), not the outliers.
  return measured(stats.levelLow, stats.levelHigh, stats.score, stats.chars, work.topics);
}

// ------------------------------------------------------------------ personal

/** Number of words marked known — personal estimates need a minimum. */
export function knownCount(statuses: Map<string, string>): number {
  let n = 0;
  for (const s of statuses.values()) if (s === "known") n += 1;
  return n;
}

export function personalReady(statuses: Map<string, string>): boolean {
  return knownCount(statuses) >= PERSONAL_MIN_KNOWN;
}

/** Share of running words the reader already knows (0–1), or null if unknown. */
export function textKnownShare(score: TextScore | undefined): number | null {
  if (!score || score.total === 0) return null;
  return score.knownPct;
}

export function workKnownShare(profile: VocabProfile | undefined, statuses: Map<string, string>): number | null {
  if (!profile) return null;
  return estimateKnown(profile, (w) => statuses.get(w) === "known");
}

/** "~94% known" — rounded down so it never overpromises; "<1%" for tiny shares. */
export function formatKnown(share: number): string {
  const pct = Math.floor(share * 100);
  if (pct <= 0) return "<1% known";
  return `~${pct}% known`;
}

export type Fit = "easy" | "just-right" | "hard" | "known";

export function fitOfShare(share: number): Fit {
  const load = 1 - share;
  if (load <= 0) return "known";
  if (load < BAND_LO) return "easy";
  if (load <= BAND_HI) return "just-right";
  return "hard";
}

export function fitMatches(fit: Fit | null, filter: LevelFilter): boolean {
  if (filter === "all") return true;
  if (!fit) return false;
  return fit === filter;
}

export function scoreFit(score: TextScore | undefined): Fit | null {
  if (!score || score.total === 0) return null;
  if (isFullyKnown(score)) return "known";
  return fitOfShare(score.knownPct);
}

// ------------------------------------------------------------------ browsing

export type StatusFilter = "all" | "unread" | "started" | "read";

export type BrowseFilters = {
  query: string;
  topic: string;
  band: LevelBand | "all";
  length: LengthBucket | "all";
  fit: LevelFilter;
  status: StatusFilter;
};

export const NO_FILTERS: BrowseFilters = { query: "", topic: "all", band: "all", length: "all", fit: "all", status: "all" };

export function filtersActive(f: BrowseFilters): boolean {
  return Boolean(f.query.trim()) || f.topic !== "all" || f.band !== "all" || f.length !== "all" || f.fit !== "all" || f.status !== "all";
}

export type EntryStatus = "unread" | "started" | "read";

export type Entry =
  | { type: "text"; id: string; text: LibraryText; info: EntryInfo; fit: Fit | null; status: EntryStatus; searchText: string }
  | { type: "book"; id: string; book: Book; info: EntryInfo; fit: Fit | null; status: EntryStatus; searchText: string }
  | {
      type: "work";
      id: string;
      work: WorkMeta;
      info: EntryInfo;
      fit: Fit | null;
      status: EntryStatus;
      searchText: string;
      /** Personal known share from the work's vocabulary profile. */
      known: number | null;
    };

export function textStatus(text: LibraryText): EntryStatus {
  if (text.readAt) return "read";
  const b = text.bookmark;
  if (b && (b.tokenIndex > 0 || b.scrollY >= 40)) return "started";
  return "unread";
}

export function bookStatus(book: Book): EntryStatus {
  const s = book.chapters.map(textStatus);
  if (s.length && s.every((x) => x === "read")) return "read";
  if (s.some((x) => x !== "unread")) return "started";
  return "unread";
}

export function textEntry(text: LibraryText, score: TextScore | undefined): Entry {
  return {
    type: "text",
    id: text.id,
    text,
    info: describeText(text),
    fit: scoreFit(score),
    status: textStatus(text),
    searchText: [text.title, text.blurb, text.author, text.seriesTitle].filter(Boolean).join(" ").toLowerCase(),
  };
}

export function bookEntry(book: Book, scores: Map<string, TextScore>): Entry {
  const src = scoreSource({ type: "book", book });
  return {
    type: "book",
    id: `book:${book.id}`,
    book,
    info: describeBook(book),
    fit: src ? scoreFit(scores.get(src.id)) : null,
    status: bookStatus(book),
    searchText: [book.title, book.blurb, book.author, ...book.chapters.map((c) => c.title)].filter(Boolean).join(" ").toLowerCase(),
  };
}

export function workEntry(
  work: WorkMeta,
  stats: WorkStats | undefined,
  known: number | null,
  progress: { read: number; started: boolean; total: number },
): Entry {
  const status: EntryStatus =
    progress.total > 0 && progress.read >= progress.total ? "read" : progress.started ? "started" : "unread";
  return {
    type: "work",
    id: `work:${work.id}`,
    work,
    info: describeWork(work, stats),
    fit: known === null ? null : fitOfShare(known),
    known,
    status,
    searchText: [work.title, work.english, work.author, work.blurb, work.year].join(" ").toLowerCase(),
  };
}

export function matchesFilters(entry: Entry, f: BrowseFilters): boolean {
  const q = f.query.trim().toLowerCase();
  if (q && !entry.searchText.includes(q)) return false;
  if (f.topic !== "all" && !entry.info.topics.includes(f.topic)) return false;
  if (f.band !== "all") {
    const lo = entry.info.level;
    const hi = entry.info.levelMax ?? lo;
    if (lo === null) {
      if (entry.info.band !== f.band) return false;
    } else if (!(levelBand(lo) === f.band || (hi !== null && levelBand(hi) === f.band))) {
      return false;
    }
  }
  if (f.length !== "all") {
    if (entry.info.chars === null) return f.length === "long" && entry.info.band === "native";
    const bucket = entry.type === "work" ? "long" : lengthBucket(entry.info.chars);
    if (bucket !== f.length) return false;
  }
  if (!fitMatches(entry.fit, f.fit)) return false;
  if (f.status !== "all" && entry.status !== f.status) return false;
  return true;
}

/** Easier first, then shorter, then title — a ladder you can walk down. */
export function sortByLevel(entries: Entry[]): Entry[] {
  return [...entries].sort(
    (a, b) =>
      a.info.sortScore - b.info.sortScore ||
      (a.info.chars ?? 1e9) - (b.info.chars ?? 1e9) ||
      a.id.localeCompare(b.id),
  );
}

export function filterEntries(entries: Entry[], f: BrowseFilters): Entry[] {
  return sortByLevel(entries.filter((e) => matchesFilters(e, f)));
}

/** Topics that actually have entries, in taxonomy order, with counts. */
export function topicCounts(entries: Entry[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const e of entries) for (const t of e.info.topics) counts.set(t, (counts.get(t) ?? 0) + 1);
  return counts;
}

/** "96 字 · 1 min" / "922,250 字 · ~85 h". */
export function lengthLabel(info: EntryInfo): string | null {
  if (info.chars === null) return null;
  const chars = info.chars >= 10000 ? `${Math.round(info.chars / 1000).toLocaleString("en-US")}k 字` : `${info.chars.toLocaleString("en-US")} 字`;
  if (info.minutes === null) return chars;
  return `${chars} · ${formatDuration(info.minutes)}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 1) return "<1 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = minutes / 60;
  return h < 10 ? `${h.toFixed(1).replace(/\.0$/, "")} h` : `${Math.round(h)} h`;
}
