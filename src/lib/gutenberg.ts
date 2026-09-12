import type { LibraryText } from "../types";

const MAX_CHARS = 50000;
export const PREVIEW_CHARS = 8000;

export function gutenbergIdOf(id: number): string {
  return `gb-${id}`;
}

export function gutendexUrl(opts: { search?: string; page?: number } = {}): string {
  const params = new URLSearchParams({ languages: "zh" });
  if (opts.search) params.set("search", opts.search);
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  return `https://gutendex.com/books?${params.toString()}`;
}

type GutendexBook = {
  id: number;
  title: string;
  authors?: { name: string }[];
  formats?: Record<string, string>;
  subjects?: string[];
};

export function parseGutendex(raw: unknown, createdAt = Date.now()): LibraryText[] {
  const results = (raw as { results?: GutendexBook[] }).results;
  if (!Array.isArray(results)) return [];
  return results.filter((b) => b?.id && b.title).map((b, i) => {
    const author = b.authors?.[0]?.name || "Project Gutenberg";
    const cover = b.formats?.["image/jpeg"] || "";
    return {
      id: gutenbergIdOf(b.id),
      title: b.title,
      blurb: author,
      body: "",
      kind: "gutenberg" as const,
      category: "gutenberg" as const,
      createdAt: createdAt + i,
      readAt: null,
      bookmark: null,
      author,
      gutenbergId: b.id,
      coverUrl: cover,
      source: "From Project Gutenberg (public domain)",
      sourceUrl: `https://www.gutenberg.org/ebooks/${b.id}`,
    };
  });
}

export function pickPlainTextUrl(formats: Record<string, string> | undefined): string | null {
  if (!formats) return null;
  const keys = Object.keys(formats);
  const plain =
    keys.find((k) => k.startsWith("text/plain") && !k.includes("zip")) ||
    keys.find((k) => k.includes("text/plain"));
  return plain ? formats[plain] : null;
}

export function trimGutenbergText(raw: string, maxChars = MAX_CHARS): string {
  let text = raw.replace(/\r\n/g, "\n");
  const start = text.search(/\*\*\*\s*START OF/i);
  if (start >= 0) {
    const nl = text.indexOf("\n", start);
    text = text.slice(nl >= 0 ? nl + 1 : start);
  }
  const end = text.search(/\*\*\*\s*END OF/i);
  if (end > 0) text = text.slice(0, end);
  text = text.trim();
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastBreak = cut.lastIndexOf("\n\n");
  return (lastBreak > maxChars * 0.6 ? cut.slice(0, lastBreak) : cut).trim() + "\n\n……";
}

export async function fetchGutendexList(search?: string): Promise<LibraryText[]> {
  const res = await fetch(gutendexUrl({ search }));
  if (!res.ok) throw new Error("Gutendex request failed.");
  return parseGutendex(await res.json());
}

export function dukiApiBase(): string {
  const raw = (import.meta.env.VITE_DUKI_API as string | undefined) || "";
  return raw.replace(/\/$/, "");
}

export async function fetchGutenbergText(
  book: {
    gutenbergId?: number;
    sourceUrl?: string;
  },
  opts?: { maxChars?: number },
): Promise<{ body: string; textUrl: string }> {
  const id = book.gutenbergId;
  if (!id) throw new Error("Missing Gutenberg id.");
  const maxChars = opts?.maxChars ?? MAX_CHARS;
  const api = dukiApiBase();
  if (api) {
    const res = await fetch(`${api}/gutenberg/${id}`);
    if (!res.ok) throw new Error("Could not download Gutenberg text.");
    const json = (await res.json()) as { body?: string; textUrl?: string; error?: string };
    if (!json.body) throw new Error(json.error || "Empty Gutenberg text.");
    return {
      body: trimGutenbergText(json.body, maxChars),
      textUrl: json.textUrl || `https://www.gutenberg.org/ebooks/${id}`,
    };
  }
  const meta = await fetch(`https://gutendex.com/books/${id}`);
  if (!meta.ok) throw new Error("Could not load Gutenberg metadata.");
  const json = (await meta.json()) as GutendexBook;
  const textUrl = pickPlainTextUrl(json.formats);
  if (!textUrl) throw new Error("No plain-text file for this Gutenberg book.");
  const res = await fetch(textUrl);
  if (!res.ok) throw new Error("Could not download Gutenberg text.");
  const raw = await res.text();
  return { body: trimGutenbergText(raw, maxChars), textUrl };
}
