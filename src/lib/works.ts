/**
 * Long public-domain works (the Bible, Lu Xun, …) live as static JSON under
 * public/works/<id>/ and load chapter by chapter, so they never touch the JS
 * bundle or the glossary boot path.
 *
 * Reading progress for a chapter is an ordinary LibraryText row with the id
 * `w:<workId>:<chapterKey>` and an empty body (the body is fetched on demand
 * and never written to IndexedDB or sync). That reuses the existing bookmark /
 * read / session machinery without any database schema change.
 */
import type { LibraryText, TextCategory } from "../types";
import type { VocabProfile } from "./difficulty";

export type WorkStats = {
  id: string;
  chapters: number;
  sections: number;
  chars: number;
  level: number;
  score: number;
  levelMin: number;
  levelMax: number;
  /** Middle half of chapters sits between these levels (25th–75th percentile). */
  levelLow: number;
  levelHigh: number;
  firstKey: string;
};

export type WorkMeta = {
  id: string;
  title: string;
  /** Short English title for cards and the page title. */
  english: string;
  author: string;
  year: string;
  blurb: string;
  category: TextCategory;
  topics: string[];
  /** What a "section" is called: "Book" for the Bible, "Story" for collections. */
  sectionNoun: string;
  source: string;
  sourceUrl: string;
  license: string;
  notes?: string;
};

export type TocChapter = { key: string; title: string; label: string; chars: number; level: number };
export type TocSection = {
  key: string;
  title: string;
  part?: string;
  sourceUrl?: string;
  chars: number;
  level: number;
  chapters: TocChapter[];
};
export type WorkToc = { id: string; sections: TocSection[] };
export type WorkChapter = { key: string; title: string; body: string };

export const WORK_ROW_PREFIX = "w:";

export function workRowId(workId: string, key: string): string {
  return `${WORK_ROW_PREFIX}${workId}:${key}`;
}

export function isWorkRowId(id: string): boolean {
  return id.startsWith(WORK_ROW_PREFIX);
}

export function parseWorkRowId(id: string): { workId: string; key: string } | null {
  if (!isWorkRowId(id)) return null;
  const rest = id.slice(WORK_ROW_PREFIX.length);
  const at = rest.indexOf(":");
  if (at <= 0 || at === rest.length - 1) return null;
  const workId = rest.slice(0, at);
  const key = rest.slice(at + 1);
  if (!/^[a-z0-9-]+$/.test(workId) || !/^[A-Z0-9.]+$/.test(key)) return null;
  return { workId, key };
}

// ------------------------------------------------------------------ loading

type FetchLike = (url: string) => Promise<Pick<Response, "ok" | "status" | "headers" | "text">>;

const cache = new Map<string, Promise<unknown>>();

function worksBase(): string {
  const base = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? "/";
  return `${base.endsWith("/") ? base : `${base}/`}works/`;
}

/**
 * Fetch one JSON file once per session. A failed load is forgotten so the next
 * attempt retries; an HTML answer (the SPA fallback for a missing file) is an
 * error rather than a parse crash.
 */
export function fetchWorkJson<T>(path: string, fetchImpl: FetchLike = fetch): Promise<T> {
  const url = `${worksBase()}${path}`;
  const hit = cache.get(url);
  if (hit) return hit as Promise<T>;
  const p = (async () => {
    const res = await fetchImpl(url);
    if (!res.ok) throw new Error(`Could not load this chapter (${res.status}).`);
    const raw = await res.text();
    if (/^\s*</.test(raw)) throw new Error("Could not load this chapter.");
    return JSON.parse(raw) as T;
  })();
  cache.set(url, p);
  p.catch(() => cache.delete(url));
  return p;
}

export function clearWorkCache(): void {
  cache.clear();
}

export const loadToc = (workId: string, f?: FetchLike) => fetchWorkJson<WorkToc>(`${workId}/toc.json`, f);
export const loadChapter = (workId: string, key: string, f?: FetchLike) =>
  fetchWorkJson<WorkChapter>(`${workId}/${key}.json`, f);
export const loadWorkProfile = (workId: string, f?: FetchLike) =>
  fetchWorkJson<VocabProfile>(`${workId}/profile.json`, f);

// ------------------------------------------------------------------ navigation

export type FlatChapter = TocChapter & { section: TocSection; index: number };

export function flatChapters(toc: WorkToc): FlatChapter[] {
  const out: FlatChapter[] = [];
  for (const section of toc.sections) {
    for (const ch of section.chapters) out.push({ ...ch, section, index: out.length });
  }
  return out;
}

export function neighbors(toc: WorkToc, key: string): { prev: FlatChapter | null; next: FlatChapter | null; here: FlatChapter | null } {
  const flat = flatChapters(toc);
  const i = flat.findIndex((c) => c.key === key);
  if (i < 0) return { prev: null, next: null, here: null };
  return { prev: flat[i - 1] ?? null, next: flat[i + 1] ?? null, here: flat[i] };
}

// ------------------------------------------------------------------ progress

/** Every progress row for a work, keyed by chapter key. */
export function workRows(texts: LibraryText[], workId: string): Map<string, LibraryText> {
  const prefix = `${WORK_ROW_PREFIX}${workId}:`;
  const out = new Map<string, LibraryText>();
  for (const t of texts) if (t.id.startsWith(prefix)) out.set(t.id.slice(prefix.length), t);
  return out;
}

export type ChapterState = "read" | "started" | "unread";

export function chapterState(row: LibraryText | undefined): ChapterState {
  if (!row) return "unread";
  if (row.readAt) return "read";
  const b = row.bookmark;
  if (row.openedAt || (b && (b.tokenIndex > 0 || b.scrollY >= 40))) return "started";
  return "unread";
}

function touchedAt(row: LibraryText): number {
  return Math.max(row.openedAt ?? 0, row.readAt ?? 0);
}

export type WorkProgress = {
  read: number;
  total: number;
  /** Chapter to open for "Continue" / "Start". */
  next: TocChapter;
  /** True once anything in the work has been opened or read. */
  started: boolean;
  /** The resume chapter is half-read (as opposed to the next unread one). */
  resuming: boolean;
  lastTouched: number;
};

/**
 * The most recently touched chapter decides: if it is unfinished, resume it;
 * if it was finished, move on to the next chapter that isn't read yet.
 */
export function workProgress(toc: WorkToc, rows: Map<string, LibraryText>): WorkProgress {
  const flat = flatChapters(toc);
  let read = 0;
  let last: { row: LibraryText; index: number } | null = null;
  for (const [i, ch] of flat.entries()) {
    const row = rows.get(ch.key);
    if (!row) continue;
    if (row.readAt) read += 1;
    if (!last || touchedAt(row) > touchedAt(last.row)) last = { row, index: i };
  }
  if (!last) return { read, total: flat.length, next: flat[0], started: false, resuming: false, lastTouched: 0 };
  if (!last.row.readAt) {
    return { read, total: flat.length, next: flat[last.index], started: true, resuming: true, lastTouched: touchedAt(last.row) };
  }
  for (let j = 1; j <= flat.length; j++) {
    const cand = flat[(last.index + j) % flat.length];
    if (!rows.get(cand.key)?.readAt) {
      return { read, total: flat.length, next: cand, started: true, resuming: false, lastTouched: touchedAt(last.row) };
    }
  }
  return { read, total: flat.length, next: flat[last.index], started: true, resuming: false, lastTouched: touchedAt(last.row) };
}

/** Lightweight progress without the TOC (for cards before it has loaded). */
export function workRowSummary(texts: LibraryText[], workId: string): { read: number; last: LibraryText | null } {
  let read = 0;
  let last: LibraryText | null = null;
  for (const row of workRows(texts, workId).values()) {
    if (row.readAt) read += 1;
    if (!last || touchedAt(row) > touchedAt(last)) last = row;
  }
  return { read, last };
}

/** The row saved when a chapter is opened: metadata only, never the body. */
export function workChapterRow(
  work: Pick<WorkMeta, "id" | "title" | "author" | "category" | "source" | "sourceUrl">,
  chapter: Pick<TocChapter, "key" | "title">,
  existing: LibraryText | undefined,
  now: number,
): LibraryText {
  if (existing) return { ...existing, body: "", openedAt: now };
  return {
    id: workRowId(work.id, chapter.key),
    title: chapter.title,
    blurb: work.title,
    body: "",
    kind: "sample",
    category: work.category,
    createdAt: now,
    readAt: null,
    bookmark: null,
    author: work.author,
    source: work.source,
    sourceUrl: work.sourceUrl,
    openedAt: now,
  };
}

/** "Story" → "stories", "Book" → "books" (lowercase, for meta lines). */
export function countNoun(n: number, noun: string): string {
  const word = noun.toLowerCase();
  if (n === 1) return `1 ${word}`;
  const plural = /[^aeiou]y$/.test(word) ? word.slice(0, -1) + "ies" : word + "s";
  return `${n.toLocaleString("en-US")} ${plural}`;
}

/** Cover art drops a parenthetical edition note: 圣经（和合本） → 圣经. */
export function coverTitle(title: string): string {
  return title.replace(/[（(][^）)]*[）)]/g, "").trim() || title;
}
