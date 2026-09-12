import type { LibraryText } from "../types";

export type WsSeed = {
  title: string;
  wsTitle: string;
  author: string;
  blurb: string;
  category: "novel" | "history" | "article";
};

/** Public-domain Chinese works on zh.wikisource.org. Fetched on demand. */
export const WIKISOURCE_SEED: WsSeed[] = [
  { title: "论语 · 学而", wsTitle: "论语/学而", author: "孔子", blurb: "The opening of the Analects.", category: "history" },
  { title: "论语 · 为政", wsTitle: "论语/为政", author: "孔子", blurb: "Governing, and learning that does not fade.", category: "history" },
  { title: "道德经 · 上篇", wsTitle: "道德经", author: "老子", blurb: "The classic of the way, as Wikisource has it.", category: "history" },
  { title: "孟子 · 梁惠王上", wsTitle: "孟子/梁惠王上", author: "孟子", blurb: "Kings, people, and a stubborn teacher.", category: "history" },
  { title: "史记 · 项羽本纪", wsTitle: "史记/卷007", author: "司马迁", blurb: "Xiang Yu, in Sima Qian’s record.", category: "history" },
  { title: "史记 · 高祖本纪", wsTitle: "史记/卷008", author: "司马迁", blurb: "The founding of Han.", category: "history" },
  { title: "西游记 · 第一回", wsTitle: "西游记/第001回", author: "吴承恩", blurb: "Stone monkey, Flower-Fruit Mountain.", category: "novel" },
  { title: "西游记 · 第二回", wsTitle: "西游记/第002回", author: "吴承恩", blurb: "The monkey seeks a teacher.", category: "novel" },
  { title: "西游记 · 第三回", wsTitle: "西游记/第003回", author: "吴承恩", blurb: "A name in the ledgers of death.", category: "novel" },
  { title: "三国演义 · 第一回", wsTitle: "三国演义/第001回", author: "罗贯中", blurb: "Oath in the peach garden.", category: "novel" },
  { title: "三国演义 · 第二回", wsTitle: "三国演义/第002回", author: "罗贯中", blurb: "Zhang Fei among the yellow turbans.", category: "novel" },
  { title: "水浒传 · 第一回", wsTitle: "水浒传/第001回", author: "施耐庵", blurb: "Demons released, heroes to come.", category: "novel" },
  { title: "水浒传 · 第二回", wsTitle: "水浒传/第002回", author: "施耐庵", blurb: "Wang Jin leaves the capital.", category: "novel" },
  { title: "红楼梦 · 第一回", wsTitle: "红楼梦/第一回", author: "曹雪芹", blurb: "A stone, a dream, a beginning.", category: "novel" },
  { title: "红楼梦 · 第二回", wsTitle: "红楼梦/第二回", author: "曹雪芹", blurb: "Cold talk in a warm house.", category: "novel" },
  { title: "呐喊 · 自序", wsTitle: "呐喊/自序", author: "鲁迅", blurb: "Why Lu Xun began to shout.", category: "article" },
  { title: "狂人日记", wsTitle: "呐喊/狂人日记", author: "鲁迅", blurb: "The diary that asked what people eat.", category: "article" },
  { title: "阿Q正传", wsTitle: "呐喊/阿Q正传", author: "鲁迅", blurb: "Ah Q, and a village that laughs.", category: "article" },
  { title: "孔乙己", wsTitle: "呐喊/孔乙己", author: "鲁迅", blurb: "A scholar at the wine counter.", category: "article" },
  { title: "故乡", wsTitle: "呐喊/故乡", author: "鲁迅", blurb: "Going home, and finding it smaller.", category: "article" },
  { title: "诗经 · 关雎", wsTitle: "诗经/国风/周南/关雎", author: "诗经", blurb: "Ospreys on the river island.", category: "article" },
  { title: "桃花源记", wsTitle: "桃花源记", author: "陶渊明", blurb: "A fisherman, a grove, a hidden people.", category: "article" },
  { title: "出师表", wsTitle: "出师表", author: "诸葛亮", blurb: "Zhuge Liang before the campaign.", category: "history" },
  { title: "岳阳楼记", wsTitle: "岳阳楼记", author: "范仲淹", blurb: "Worry first, joy later.", category: "article" },
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
    exchars: "12000",
    inprop: "url",
    redirects: "1",
    titles: title,
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

export function parseWsExtract(raw: unknown): { title: string; extract: string; url: string } {
  const pages = (raw as { query?: { pages?: Record<string, { title?: string; extract?: string; fullurl?: string; missing?: unknown }> } }).query?.pages;
  if (!pages) throw new Error("Could not read Wikisource.");
  const page = Object.values(pages)[0];
  if (!page || "missing" in page) throw new Error("That Wikisource page is missing.");
  const extract = (page.extract || "").trim();
  if (!extract) throw new Error("That Wikisource page has no text.");
  return {
    title: page.title || "Wikisource",
    extract: splitChapters(extract),
    url: page.fullurl || `https://zh.wikisource.org/wiki/${encodeURIComponent(page.title || "")}`,
  };
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

function splitChapters(extract: string): string {
  if (extract.length <= 14000) return extract;
  return extract.slice(0, 14000).trim() + "\n\n……";
}

export async function fetchWikisourcePage(wsTitle: string): Promise<{ title: string; extract: string; url: string }> {
  const res = await fetch(wikisourceApiUrl(wsTitle));
  if (!res.ok) throw new Error("Wikisource request failed.");
  return parseWsExtract(await res.json());
}

export async function searchWikisource(query: string): Promise<LibraryText[]> {
  const res = await fetch(wikisourceSearchUrl(query));
  if (!res.ok) return [];
  return parseWsSearch(await res.json());
}
