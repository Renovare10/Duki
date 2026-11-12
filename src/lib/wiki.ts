import { WIKI_TITLES } from "../data/wiki-titles";
import type { Language, LibraryText } from "../types";

export function wikiTextId(title: string, lang: Language = "zh"): string {
  return `${lang === "en" ? "en-wiki" : "wiki"}-${title}`;
}

export function wikiStub(title: string, createdAt: number, blurb?: string, lang: Language = "zh"): LibraryText {
  return {
    id: wikiTextId(title, lang),
    title,
    blurb: blurb || `${lang === "en" ? "English" : "Chinese"} Wikipedia · ${title}`,
    lang,
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

export function parseWikiQuery(raw: unknown, lang: Language = "zh"): WikiPage {
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
    `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(page.title || "")}`;
  return { title: page.title || "Wikipedia", extract, url };
}

type WikiPageRaw = {
  title?: string;
  extract?: string;
  fullurl?: string;
  missing?: boolean | "";
  invalid?: boolean | "";
};

export function wikiApiUrl(title: string, introOnly: boolean, lang: Language = "zh"): string {
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
  // Keep Mandarin extracts simplified; English has no script variant.
  if (lang === "zh") params.set("variant", "zh-cn");
  if (introOnly) params.set("exintro", "1");
  else params.set("exchars", "4500");
  return `https://${lang}.wikipedia.org/w/api.php?${params.toString()}`;
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
  opts?: { full?: boolean; lang?: Language },
): Promise<WikiPage> {
  const lang = opts?.lang ?? "zh";
  const intro = await fetchJson(wikiApiUrl(title, true, lang));
  let page = parseWikiQuery(intro, lang);
  if (opts?.full || page.extract.length < 180) {
    const longer = await fetchJson(wikiApiUrl(title, false, lang));
    page = parseWikiQuery(longer, lang);
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
