import type { Bookmark, LibraryText, TextCategory, TextKind } from "../types";

const CATEGORIES: TextCategory[] = [
  "children",
  "graded",
  "story",
  "science",
  "history",
  "article",
  "novel",
  "wiki",
  "wikisource",
  "gutenberg",
  "paste",
];

export function isCategory(value: unknown): value is TextCategory {
  return typeof value === "string" && (CATEGORIES as string[]).includes(value);
}

export function normalizeBookmark(raw: unknown): Bookmark | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Partial<Bookmark>;
  if (typeof b.tokenIndex !== "number" || typeof b.scrollY !== "number") return null;
  return { tokenIndex: b.tokenIndex, scrollY: b.scrollY };
}

export function normalizeText(
  raw: Partial<LibraryText> & { id: string; body: string },
): LibraryText {
  const kind: TextKind =
    raw.kind === "paste" ||
    raw.kind === "wiki" ||
    raw.kind === "wikisource" ||
    raw.kind === "gutenberg"
      ? raw.kind
      : "sample";
  const category: TextCategory = isCategory(raw.category)
    ? raw.category
    : kind === "paste"
      ? "paste"
      : "graded";
  return {
    id: raw.id,
    title: raw.title?.trim() || "Untitled",
    blurb: raw.blurb?.trim() || "",
    body: raw.body,
    kind,
    category,
    featured: Boolean(raw.featured),
    createdAt: raw.createdAt || Date.now(),
    readAt: typeof raw.readAt === "number" ? raw.readAt : null,
    bookmark: normalizeBookmark(raw.bookmark),
    source: raw.source,
    sourceUrl: raw.sourceUrl,
    wikiTitle: raw.wikiTitle,
    wsTitle: raw.wsTitle,
    gutenbergId: typeof raw.gutenbergId === "number" ? raw.gutenbergId : undefined,
    author: raw.author,
    coverUrl: raw.coverUrl,
    seriesId: raw.seriesId,
    chapter: typeof raw.chapter === "number" ? raw.chapter : undefined,
    preview: Boolean(raw.preview),
  };
}

export function isContinue(text: { readAt: number | null; bookmark: Bookmark | null }): boolean {
  if (text.readAt) return false;
  const b = text.bookmark;
  if (!b) return false;
  return b.tokenIndex > 0 || b.scrollY >= 40;
}

export function bookmarkProgress(bookmark: Bookmark | null, wordCount: number): number | null {
  if (!bookmark || wordCount <= 0) return null;
  if (bookmark.tokenIndex <= 0 && bookmark.scrollY < 40) return null;
  return Math.min(99, Math.max(1, Math.round((bookmark.tokenIndex / wordCount) * 100)));
}
