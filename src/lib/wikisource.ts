import type { LibraryText } from "../types";

export type WsChapter = {
  title: string;
  wsTitle: string;
};

export type WsBookSeed = {
  id: string;
  title: string;
  author: string;
  blurb: string;
  category: "novel" | "history";
  chapters: WsChapter[];
};

export type WsWork = {
  title: string;
  wsTitle: string;
  author: string;
  blurb: string;
  category: "history" | "article";
};

const WS_CAP = 20000;

const ZH_NUM = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

export function zhChapterName(n: number): string {
  if (n <= 10) return n === 10 ? "十" : ZH_NUM[n];
  if (n < 20) return `十${ZH_NUM[n - 10]}`;
  if (n === 20) return "二十";
  if (n < 30) return `二十${ZH_NUM[n - 20]}`;
  return String(n);
}

function paddedChapters(prefix: string, count: number): WsChapter[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const pad = String(n).padStart(3, "0");
    return { title: `第${zhChapterName(n)}回`, wsTitle: `${prefix}${pad}回` };
  });
}

/** Canonical zh.wikisource chapter pages, grouped as books. */
export const WIKISOURCE_BOOKS: WsBookSeed[] = [
  {
    id: "xiyouji",
    title: "西游记",
    author: "吴承恩",
    blurb: "Stone monkey, Flower-Fruit Mountain, and the long road west.",
    category: "novel",
    chapters: paddedChapters("西遊記/第", 20),
  },
  {
    id: "sanguo",
    title: "三国演义",
    author: "罗贯中",
    blurb: "Oath in the peach garden, and the splitting of a world.",
    category: "novel",
    chapters: paddedChapters("三國演義/第", 12),
  },
  {
    id: "shuihu",
    title: "水浒传",
    author: "施耐庵",
    blurb: "Outlaws of the marsh, in the 120-chapter Wikisource text.",
    category: "novel",
    chapters: paddedChapters("水滸傳 (120回本)/第", 12),
  },
  {
    id: "honglou",
    title: "红楼梦",
    author: "曹雪芹",
    blurb: "A stone, a dream, and the house of Jia.",
    category: "novel",
    chapters: paddedChapters("紅樓夢/第", 12),
  },
  {
    id: "lunyu",
    title: "论语",
    author: "孔子",
    blurb: "The Analects, chapter by chapter.",
    category: "history",
    chapters: [
      { title: "学而", wsTitle: "論語/學而第一" },
      { title: "为政", wsTitle: "論語/爲政第二" },
      { title: "八佾", wsTitle: "論語/八佾第三" },
      { title: "里仁", wsTitle: "論語/里仁第四" },
    ],
  },
  {
    id: "mengzi",
    title: "孟子",
    author: "孟子",
    blurb: "Kings, people, and a stubborn teacher.",
    category: "history",
    chapters: [
      { title: "梁惠王上", wsTitle: "孟子/梁惠王上" },
      { title: "梁惠王下", wsTitle: "孟子/梁惠王下" },
    ],
  },
  {
    id: "shiji",
    title: "史记",
    author: "司马迁",
    blurb: "Xiang Yu and the founding of Han, from Sima Qian.",
    category: "history",
    chapters: [
      { title: "项羽本纪", wsTitle: "史記/卷007" },
      { title: "高祖本纪", wsTitle: "史記/卷008" },
    ],
  },
];

export const WIKISOURCE_WORKS: WsWork[] = [
  { title: "道德经", wsTitle: "道德經", author: "老子", blurb: "The classic of the way, as Wikisource has it.", category: "history" },
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

/** Flattened chapter/work stubs. Prefer WIKISOURCE_BOOKS for grouping. */
export const WIKISOURCE_SEED: { title: string; wsTitle: string; author: string; blurb: string; category: "novel" | "history" | "article" }[] =
  [
    ...WIKISOURCE_BOOKS.flatMap((book) =>
      book.chapters.map((ch) => ({
        title: ch.title,
        wsTitle: ch.wsTitle,
        author: book.author,
        blurb: book.blurb,
        category: book.category,
      })),
    ),
    ...WIKISOURCE_WORKS,
  ];

export function wsTextId(wsTitle: string): string {
  return `ws-${wsTitle}`;
}

export function wikisourceStubs(startAt = 800): LibraryText[] {
  const out: LibraryText[] = [];
  let n = 0;
  for (const book of WIKISOURCE_BOOKS) {
    book.chapters.forEach((ch, i) => {
      out.push({
        id: wsTextId(ch.wsTitle),
        title: ch.title,
        blurb: `${book.author} · ${book.blurb}`,
        body: "",
        kind: "wikisource",
        category: "wikisource",
        createdAt: startAt + n,
        readAt: null,
        bookmark: null,
        author: book.author,
        wsTitle: ch.wsTitle,
        source: "From Wikisource (public domain / CC BY-SA)",
        sourceUrl: `https://zh.wikisource.org/wiki/${encodeURIComponent(ch.wsTitle)}`,
        seriesId: book.id,
        seriesTitle: book.title,
        chapter: i + 1,
      });
      n += 1;
    });
  }
  for (const item of WIKISOURCE_WORKS) {
    out.push({
      id: wsTextId(item.wsTitle),
      title: item.title,
      blurb: `${item.author} · ${item.blurb}`,
      body: "",
      kind: "wikisource",
      category: "wikisource",
      createdAt: startAt + n,
      readAt: null,
      bookmark: null,
      author: item.author,
      wsTitle: item.wsTitle,
      source: "From Wikisource (public domain / CC BY-SA)",
      sourceUrl: `https://zh.wikisource.org/wiki/${encodeURIComponent(item.wsTitle)}`,
    });
    n += 1;
  }
  return out;
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
