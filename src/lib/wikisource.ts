import type { LibraryText } from "../types";

export type WsSeed = {
  title: string;
  wsTitle: string;
  author: string;
  blurb: string;
  category: "novel" | "history" | "article";
};

const WS_CAP = 20000;

/**
 * Canonical zh.wikisource titles (Traditional, chapter pages that exist).
 * Display titles stay simplified for the library.
 */
export const WIKISOURCE_SEED: WsSeed[] = [
  { title: "论语 · 学而", wsTitle: "論語/學而第一", author: "孔子", blurb: "The opening of the Analects.", category: "history" },
  { title: "论语 · 为政", wsTitle: "論語/爲政第二", author: "孔子", blurb: "Governing, and learning that does not fade.", category: "history" },
  { title: "道德经 · 上篇", wsTitle: "道德經", author: "老子", blurb: "The classic of the way, as Wikisource has it.", category: "history" },
  { title: "孟子 · 梁惠王上", wsTitle: "孟子/梁惠王上", author: "孟子", blurb: "Kings, people, and a stubborn teacher.", category: "history" },
  { title: "史记 · 项羽本纪", wsTitle: "史記/卷007", author: "司马迁", blurb: "Xiang Yu, in Sima Qian’s record.", category: "history" },
  { title: "史记 · 高祖本纪", wsTitle: "史記/卷008", author: "司马迁", blurb: "The founding of Han.", category: "history" },
  { title: "西游记 · 第一回", wsTitle: "西遊記/第001回", author: "吴承恩", blurb: "Stone monkey, Flower-Fruit Mountain.", category: "novel" },
  { title: "西游记 · 第二回", wsTitle: "西遊記/第002回", author: "吴承恩", blurb: "The monkey seeks a teacher.", category: "novel" },
  { title: "西游记 · 第三回", wsTitle: "西遊記/第003回", author: "吴承恩", blurb: "A name in the ledgers of death.", category: "novel" },
  { title: "三国演义 · 第一回", wsTitle: "三國演義/第001回", author: "罗贯中", blurb: "Oath in the peach garden.", category: "novel" },
  { title: "三国演义 · 第二回", wsTitle: "三國演義/第002回", author: "罗贯中", blurb: "Zhang Fei among the yellow turbans.", category: "novel" },
  { title: "水浒传 · 第一回", wsTitle: "水滸傳 (120回本)/第001回", author: "施耐庵", blurb: "Demons released, heroes to come.", category: "novel" },
  { title: "水浒传 · 第二回", wsTitle: "水滸傳 (120回本)/第002回", author: "施耐庵", blurb: "Wang Jin leaves the capital.", category: "novel" },
  { title: "红楼梦 · 第一回", wsTitle: "紅樓夢/第001回", author: "曹雪芹", blurb: "A stone, a dream, a beginning.", category: "novel" },
  { title: "红楼梦 · 第二回", wsTitle: "紅樓夢/第002回", author: "曹雪芹", blurb: "Cold talk in a warm house.", category: "novel" },
  { title: "呐喊 · 自序", wsTitle: "吶喊/自序", author: "鲁迅", blurb: "Why Lu Xun began to shout.", category: "article" },
  { title: "狂人日记", wsTitle: "狂人日記", author: "鲁迅", blurb: "The diary that asked what people eat.", category: "article" },
  { title: "阿Q正传", wsTitle: "阿Q正傳", author: "鲁迅", blurb: "Ah Q, and a village that laughs.", category: "article" },
  { title: "孔乙己", wsTitle: "孔乙己", author: "鲁迅", blurb: "A scholar at the wine counter.", category: "article" },
  { title: "故乡", wsTitle: "故鄉 (魯迅)", author: "鲁迅", blurb: "Going home, and finding it smaller.", category: "article" },
  { title: "诗经 · 关雎", wsTitle: "詩經/關雎", author: "诗经", blurb: "Ospreys on the river island.", category: "article" },
  { title: "桃花源记", wsTitle: "桃花源記", author: "陶渊明", blurb: "A fisherman, a grove, a hidden people.", category: "article" },
  { title: "出师表", wsTitle: "出師表", author: "诸葛亮", blurb: "Zhuge Liang before the campaign.", category: "history" },
  { title: "岳阳楼记", wsTitle: "岳陽樓記", author: "范仲淹", blurb: "Worry first, joy later.", category: "article" },
];

export function wsTextId(wsTitle: string): string {
  return `ws-${wsTitle}`;
}

export function wikisourceStubs(startAt = 800): LibraryText[] {
  return WIKISOURCE_SEED.map((item, i) => ({
    id: wsTextId(item.wsTitle),
    title: item.title,
    blurb: `${item.author} · ${item.blurb}`,
    body: "",
    kind: "wikisource" as const,
    category: "wikisource" as const,
    createdAt: startAt + i,
    readAt: null,
    bookmark: null,
    author: item.author,
    wsTitle: item.wsTitle,
    source: "From Wikisource (public domain / CC BY-SA)",
    sourceUrl: `https://zh.wikisource.org/wiki/${encodeURIComponent(item.wsTitle)}`,
    seriesId: item.wsTitle.split("/")[0],
    chapter: i + 1,
  }));
}

export function wikisourceApiUrl(title: string): string {
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
  return `https://zh.wikisource.org/w/api.php?${params.toString()}`;
}

export function wikisourceParseUrl(title: string, prop: "wikitext" | "text"): string {
  const params = new URLSearchParams({
    action: "parse",
    format: "json",
    origin: "*",
    redirects: "1",
    prop,
    page: title,
  });
  return `https://zh.wikisource.org/w/api.php?${params.toString()}`;
}

export function wikisourceSearchUrl(query: string, limit = 8): string {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    list: "search",
    srsearch: query,
    srnamespace: "0",
    srlimit: String(limit),
  });
  return `https://zh.wikisource.org/w/api.php?${params.toString()}`;
}

export type WsExtractResult =
  | { status: "ok"; title: string; extract: string; url: string }
  | { status: "empty"; title: string; url: string }
  | { status: "missing" };

export function parseWsExtract(raw: unknown): WsExtractResult {
  const pages = (
    raw as {
      query?: {
        pages?: Record<
          string,
          { title?: string; extract?: string; fullurl?: string; missing?: unknown }
        >;
      };
    }
  ).query?.pages;
  if (!pages) throw new Error("Could not read Wikisource.");
  const page = Object.values(pages)[0];
  if (!page || "missing" in page) return { status: "missing" };
  const title = page.title || "Wikisource";
  const url =
    page.fullurl || `https://zh.wikisource.org/wiki/${encodeURIComponent(title)}`;
  const extract = (page.extract || "").trim();
  if (!hasEnoughText(extract)) return { status: "empty", title, url };
  return { status: "ok", title, extract: capExtract(extract), url };
}

export function parseWsParse(raw: unknown): { title: string; wikitext: string; html: string } {
  const parsed = (raw as { parse?: { title?: string; wikitext?: unknown; text?: unknown } }).parse;
  if (!parsed) throw new Error("Could not read Wikisource.");
  return {
    title: parsed.title || "Wikisource",
    wikitext: wikiStar(parsed.wikitext),
    html: wikiStar(parsed.text),
  };
}

function wikiStar(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "*" in value && typeof (value as { "*": unknown })["*"] === "string") {
    return (value as { "*": string })["*"];
  }
  return "";
}

export function hasEnoughText(value: string): boolean {
  const han = value.match(/[\u3400-\u9fff]/g);
  return (han?.length ?? 0) >= 40;
}

export function capExtract(extract: string, max = WS_CAP): string {
  const trimmed = extract.trim();
  if (trimmed.length <= max) return trimmed;
  const cut = trimmed.slice(0, max);
  const breakAt = cut.lastIndexOf("\n\n");
  return (breakAt > max * 0.6 ? cut.slice(0, breakAt) : cut).trim() + "\n\n……";
}

export function stripWsMarkup(raw: string): string {
  let text = raw.replace(/<!--[\s\S]*?-->/g, "");
  text = text.replace(/<ref\b[^>]*>[\s\S]*?<\/ref>/gi, "");
  text = text.replace(/<ref\b[^>]*\/>/gi, "");
  for (let i = 0; i < 10; i += 1) {
    const next = text.replace(/\{\{[^{}]*\}\}/g, " ");
    if (next === text) break;
    text = next;
  }
  text = text.replace(/\[\[(?:File|Image|文件|檔案):[^\]]*\]\]/gi, "");
  text = text.replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, "$2");
  text = text.replace(/\[\[([^\]]+)\]\]/g, "$1");
  text = text.replace(/'{2,}/g, "");
  text = text.replace(/^=+\s*(.*?)\s*=+\s*$/gm, "$1");
  text = text.replace(/^[:;#*]+\s*/gm, "");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<[^>]+>/g, "");
  text = decodeEntities(text);
  text = text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  return capExtract(text);
}

export function stripWsHtml(html: string): string {
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/div>/gi, "\n");
  text = text.replace(/<[^>]+>/g, "");
  text = decodeEntities(text);
  text = text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  return capExtract(text);
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Prefer plaintext extract; if empty, use parse wikitext then HTML. */
export function resolveWsBody(
  extract: WsExtractResult,
  fallback?: { wikitext?: string; html?: string },
): { title: string; extract: string; url: string } {
  if (extract.status === "ok") {
    return { title: extract.title, extract: extract.extract, url: extract.url };
  }
  if (extract.status === "missing") {
    throw new Error("That Wikisource page is missing.");
  }
  const fromWiki = stripWsMarkup(fallback?.wikitext || "");
  if (hasEnoughText(fromWiki)) {
    return { title: extract.title, extract: fromWiki, url: extract.url };
  }
  const fromHtml = stripWsHtml(fallback?.html || "");
  if (hasEnoughText(fromHtml)) {
    return { title: extract.title, extract: fromHtml, url: extract.url };
  }
  throw new Error("That Wikisource page has no text.");
}

export function parseWsSearch(raw: unknown, createdAt = Date.now()): LibraryText[] {
  const hits = (raw as { query?: { search?: { title: string; snippet?: string }[] } }).query?.search;
  if (!Array.isArray(hits)) return [];
  return hits.filter((h) => h?.title).map((h, i) => ({
    id: wsTextId(h.title),
    title: h.title,
    blurb: (h.snippet || "Wikisource").replace(/<[^>]+>/g, ""),
    body: "",
    kind: "wikisource" as const,
    category: "wikisource" as const,
    createdAt: createdAt + i,
    readAt: null,
    bookmark: null,
    wsTitle: h.title,
    source: "From Wikisource (public domain / CC BY-SA)",
    sourceUrl: `https://zh.wikisource.org/wiki/${encodeURIComponent(h.title)}`,
  }));
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Wikisource request failed.");
  return res.json();
}

export async function fetchWikisourcePage(
  wsTitle: string,
): Promise<{ title: string; extract: string; url: string }> {
  let title = wsTitle;
  let extracted = parseWsExtract(await fetchJson(wikisourceApiUrl(title)));
  if (extracted.status === "missing") {
    const hits = await searchWikisource(wsTitle.replace(/\//g, " "));
    const alt = hits[0]?.wsTitle;
    if (alt && alt !== title) {
      title = alt;
      extracted = parseWsExtract(await fetchJson(wikisourceApiUrl(title)));
    }
  }
  if (extracted.status === "ok") return extracted;
  if (extracted.status === "missing") {
    throw new Error("That Wikisource page is missing.");
  }

  let wikitext = "";
  let html = "";
  try {
    wikitext = parseWsParse(await fetchJson(wikisourceParseUrl(extracted.title, "wikitext"))).wikitext;
  } catch {
    /* parse wikitext optional */
  }
  try {
    if (!hasEnoughText(stripWsMarkup(wikitext))) {
      html = parseWsParse(await fetchJson(wikisourceParseUrl(extracted.title, "text"))).html;
    }
  } catch {
    /* parse html optional */
  }
  return resolveWsBody(extracted, { wikitext, html });
}

export async function searchWikisource(query: string): Promise<LibraryText[]> {
  const res = await fetch(wikisourceSearchUrl(query));
  if (!res.ok) return [];
  return parseWsSearch(await res.json());
}
