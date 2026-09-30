import type { LibraryText } from "../types";

export function entry(
  partial: Omit<LibraryText, "kind" | "readAt" | "bookmark" | "blurb" | "featured"> & {
    blurb: string;
    featured?: boolean;
    source: string;
    sourceUrl: string;
  },
): LibraryText {
  return {
    kind: "sample",
    readAt: null,
    bookmark: null,
    featured: false,
    ...partial,
  };
}

export function wikiUrl(title: string): string {
  return `https://zh.wikipedia.org/wiki/${encodeURIComponent(title)}`;
}

export function cite(title: string): string {
  return `Duki original · topic from Wikipedia「${title}」CC BY-SA`;
}
