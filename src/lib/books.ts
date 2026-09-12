import type { LibraryText, TextCategory, TextKind, TextScore } from "../types";
import { isContinue } from "./text";
import { isScored, stillTeaches } from "./score";

export type BookProgress = "read" | "in-progress" | "unread";

export type Book = {
  id: string;
  title: string;
  author?: string;
  blurb: string;
  category: TextCategory;
  kind: TextKind;
  chapters: LibraryText[];
  createdAt: number;
  coverUrl?: string;
};

export type ShelfItem =
  | { type: "text"; text: LibraryText }
  | { type: "book"; book: Book };

export function isGutenberg(text: LibraryText): boolean {
  return text.kind === "gutenberg" || text.category === "gutenberg";
}

export function chapterLabel(text: LibraryText): string {
  const parts = text.title.split(" · ");
  if (parts.length > 1) return parts.slice(1).join(" · ").trim();
  return text.title;
}

export function bookTitleOf(text: LibraryText): string {
  if (text.seriesTitle?.trim()) return text.seriesTitle.trim();
  const parts = text.title.split(" · ");
  if (parts.length > 1) return parts[0].trim();
  return text.title;
}

export function bookProgress(chapters: LibraryText[]): BookProgress {
  if (chapters.length === 0) return "unread";
  if (chapters.every((c) => Boolean(c.readAt))) return "read";
  const started = chapters.some(
    (c) =>
      Boolean(c.readAt) ||
      Boolean(c.bookmark && (c.bookmark.tokenIndex > 0 || c.bookmark.scrollY >= 40)),
  );
  return started ? "in-progress" : "unread";
}

export function continueChapter(chapters: LibraryText[]): LibraryText | null {
  const paused = chapters.find((c) => isContinue(c));
  if (paused) return paused;
  const unread = chapters.find((c) => !c.readAt);
  return unread ?? chapters[0] ?? null;
}

export function scoreSource(item: ShelfItem): LibraryText | null {
  if (item.type === "text") return item.text;
  const withBody = item.book.chapters.filter((c) => c.body.trim());
  const unread = withBody.find((c) => !c.readAt) ?? withBody[0];
  return unread ?? null;
}

export function itemId(item: ShelfItem): string {
  if (item.type === "book") return `book:${item.book.id}`;
  return item.text.id;
}

export function itemTeaches(item: ShelfItem, scores: Map<string, TextScore>): boolean {
  const src = scoreSource(item);
  if (!src?.body.trim()) return false;
  const score = scores.get(src.id);
  return Boolean(score && isScored(score) && stillTeaches(score));
}

export function collapseTexts(texts: LibraryText[]): ShelfItem[] {
  const visible = texts.filter((t) => !isGutenberg(t));
  const groups = new Map<string, LibraryText[]>();
  const singles: LibraryText[] = [];
  for (const text of visible) {
    if (!text.seriesId) {
      singles.push(text);
      continue;
    }
    const list = groups.get(text.seriesId) ?? [];
    list.push(text);
    groups.set(text.seriesId, list);
  }

  const items: ShelfItem[] = singles.map((text) => ({ type: "text", text }));
  for (const [id, chapters] of groups) {
    chapters.sort((a, b) => (a.chapter ?? 0) - (b.chapter ?? 0) || a.createdAt - b.createdAt);
    if (chapters.length < 2) {
      items.push({ type: "text", text: chapters[0] });
      continue;
    }
    const first = chapters[0];
    items.push({
      type: "book",
      book: {
        id,
        title: bookTitleOf(first),
        author: first.author,
        blurb: first.blurb,
        category: first.category,
        kind: first.kind,
        chapters,
        createdAt: first.createdAt,
        coverUrl: first.coverUrl,
      },
    });
  }
  items.sort((a, b) => {
    const ac = a.type === "text" ? a.text.createdAt : a.book.createdAt;
    const bc = b.type === "text" ? b.text.createdAt : b.book.createdAt;
    return ac - bc;
  });
  return items;
}

export function findBook(texts: LibraryText[], seriesId: string): Book | null {
  const collapsed = collapseTexts(texts);
  const hit = collapsed.find((item) => item.type === "book" && item.book.id === seriesId);
  return hit && hit.type === "book" ? hit.book : null;
}
