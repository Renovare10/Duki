import { WIKI_TITLES } from "../data/wiki-titles";
import type { LibraryText } from "../types";

export function wikiTextId(title: string): string {
  return `wiki-${title}`;
}

export function wikiStub(title: string, createdAt: number, blurb?: string): LibraryText {
  return {
    id: wikiTextId(title),
    title,
    blurb: blurb || `Chinese Wikipedia · ${title}`,
    body: "",
    kind: "wiki",
    category: "wiki",
    createdAt,
    readAt: null,
    bookmark: null,
    wikiTitle: title,
    source: "From Wikipedia, CC BY-SA",
  };
}

export function wikiStubs(startAt = 200): LibraryText[] {
  const seen = new Set<string>();
  const out: LibraryText[] = [];
  for (const title of WIKI_TITLES) {
    if (seen.has(title)) continue;
    seen.add(title);
    out.push(wikiStub(title, startAt + out.length));
  }
  return out;
}

export type WikiPage = {
  title: string;
  extract: string;
  url: string;
};

export function parseWikiQuery(raw: unknown): WikiPage {
  if (!raw || typeof raw !== "object") throw new Error("Could not read Wikipedia.");
  const pages = (raw as { query?: { pages?: Record<string, WikiPageRaw> } }).query?.pages;
  if (!pages) throw new Error("Could not read Wikipedia.");
  const page = Object.values(pages)[0];
  if (!page || "missing" in page || "invalid" in page) {
    throw new Error("That Wikipedia page is missing.");
  }
  const extract = (page.extract || "").trim();
  if (!extract) throw new Error("That page has no text extract.");
  const url =
    page.fullurl ||
    `https://zh.wikipedia.org/wiki/${encodeURIComponent(page.title || "")}`;
  return { title: page.title || "Wikipedia", extract, url };
}

type WikiPageRaw = {
  title?: string;
  extract?: string;
  fullurl?: string;
  missing?: boolean | "";
  invalid?: boolean | "";
};

export function wikiApiUrl(title: string, introOnly: boolean): string {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    prop: "extracts|info",
    explaintext: "1",
    inprop: "url",
    redirects: "1",
    titles: title,
  });
  if (introOnly) params.set("exintro", "1");
  else params.set("exchars", "4500");
  return `https://zh.wikipedia.org/w/api.php?${params.toString()}`;
}

export function wikiSearchUrl(query: string, limit = 12): string {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    list: "search",
    srsearch: query,
    srnamespace: "0",
    srlimit: String(limit),
  });
  return `https://zh.wikipedia.org/w/api.php?${params.toString()}`;
}

export function wikiRandomUrl(limit = 8): string {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    list: "random",
    rnnamespace: "0",
    rnlimit: String(limit),
  });
  return `https://zh.wikipedia.org/w/api.php?${params.toString()}`;
}

export function parseWikiSearch(raw: unknown, createdAt = Date.now()): LibraryText[] {
  const hits = (raw as { query?: { search?: { title: string; snippet?: string }[] } }).query?.search;
  if (!Array.isArray(hits)) return [];
  return hits
    .filter((h) => h?.title)
    .map((h, i) =>
      wikiStub(h.title, createdAt + i, stripHtml(h.snippet || `Chinese Wikipedia · ${h.title}`)),
    );
}

export function parseWikiRandom(raw: unknown, createdAt = Date.now()): LibraryText[] {
  const hits = (raw as { query?: { random?: { title: string }[] } }).query?.random;
  if (!Array.isArray(hits)) return [];
  return hits.filter((h) => h?.title).map((h, i) => wikiStub(h.title, createdAt + i));
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&").trim();
}

export async function fetchWikiPage(
  title: string,
  opts?: { full?: boolean },
): Promise<WikiPage> {
  const intro = await fetchJson(wikiApiUrl(title, true));
  let page = parseWikiQuery(intro);
  if (opts?.full || page.extract.length < 180) {
    const longer = await fetchJson(wikiApiUrl(title, false));
    page = parseWikiQuery(longer);
  }
  return page;
}

export async function searchWikipedia(query: string): Promise<LibraryText[]> {
  const raw = await fetchJson(wikiSearchUrl(query));
  return parseWikiSearch(raw);
}

export async function randomWikipedia(): Promise<LibraryText[]> {
  const raw = await fetchJson(wikiRandomUrl());
  return parseWikiRandom(raw);
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Wikipedia request failed.");
  return res.json();
}
