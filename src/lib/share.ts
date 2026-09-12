import type { LibraryText } from "../types";

export type ShareKind = "wiki" | "gutenberg" | "wikisource" | "local";

export function shareHash(
  text: Pick<LibraryText, "id" | "kind" | "wikiTitle" | "wsTitle" | "gutenbergId">,
): string {
  if (text.kind === "wiki" && text.wikiTitle) {
    return `#/r/wiki/${encodeURIComponent(text.wikiTitle)}`;
  }
  if (text.kind === "gutenberg" && text.gutenbergId != null) {
    return `#/r/gutenberg/${text.gutenbergId}`;
  }
  if (text.kind === "wikisource" && text.wsTitle) {
    return `#/r/wikisource/${encodeURIComponent(text.wsTitle)}`;
  }
  return `#/r/local/${encodeURIComponent(text.id)}`;
}

export function shareUrl(
  origin: string,
  text: Pick<LibraryText, "id" | "kind" | "wikiTitle" | "wsTitle" | "gutenbergId">,
): string {
  const root = origin.replace(/\/$/, "");
  return `${root}/${shareHash(text)}`;
}

export function parseShareHash(hash: string): { kind: ShareKind; key: string } | null {
  const raw = hash.replace(/^#/, "") || "/";
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  const match = path.match(/^\/r\/(wiki|gutenberg|wikisource|local)\/(.+)$/);
  if (!match) return null;
  try {
    return { kind: match[1] as ShareKind, key: decodeURIComponent(match[2]) };
  } catch {
    return { kind: match[1] as ShareKind, key: match[2] };
  }
}
