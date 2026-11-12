import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchWikiPage,
  parseWikiQuery,
  parseWikiSearch,
  wikiApiUrl,
  wikiSearchUrl,
  wikiStub,
  wikiStubs,
  wikiTextId,
} from "./wiki";

describe("wiki catalog", () => {
  it("seeds hundreds of zh titles", () => {
    expect(wikiStubs().length).toBeGreaterThanOrEqual(100);
    expect(wikiStubs()[0].id).toBe(wikiTextId(wikiStubs()[0].title));
    expect(wikiStubs()[0].body).toBe("");
    expect(wikiStubs()[0].category).toBe("wiki");
  });
});

describe("parseWikiQuery", () => {
  it("reads a MediaWiki extracts payload", () => {
    const page = parseWikiQuery({
      query: {
        pages: {
          "123": {
            title: "猫",
            extract: "猫是一种小型食肉目动物。",
            fullurl: "https://zh.wikipedia.org/wiki/%E7%8C%AB",
          },
        },
      },
    });
    expect(page.title).toBe("猫");
    expect(page.extract).toContain("食肉");
  });

  it("throws on a missing page", () => {
    expect(() =>
      parseWikiQuery({ query: { pages: { "-1": { title: "没有", missing: true } } } }),
    ).toThrow(/missing/i);
  });
});

describe("shared Wikipedia language", () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each(["en", "zh"] as const)("fetches both extracts from %s Wikipedia", async (lang) => {
    // No fullurl: the reader's fallback source link must use the same language too.
    const payload = { query: { pages: { "123": { title: "Test article", extract: "Article body." } } } };
    const fetchMock = vi.fn(async (_url: string) => ({ ok: true, json: async () => payload }));
    vi.stubGlobal("fetch", fetchMock);

    const stub = wikiStub("Test article", 123, undefined, lang);
    expect(stub.lang ?? "zh").toBe(lang);
    expect(stub.id).toBe(wikiTextId("Test article", lang));
    expect(stub.blurb).toBe(`${lang === "en" ? "English" : "Chinese"} Wikipedia · Test article`);

    const page = await fetchWikiPage(stub.wikiTitle!, { full: true, lang: stub.lang });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const urls = fetchMock.mock.calls.map(([url]) => new URL(url));
    for (const url of urls) {
      expect(url.hostname).toBe(`${lang}.wikipedia.org`);
      expect(url.searchParams.get("titles")).toBe("Test article");
      expect(url.searchParams.get("variant")).toBe(lang === "zh" ? "zh-cn" : null);
    }
    expect(urls[0].searchParams.get("exintro")).toBe("1");
    expect(urls[1].searchParams.get("exchars")).toBe("4500");
    expect(page).toEqual({
      title: "Test article", extract: "Article body.",
      url: `https://${lang}.wikipedia.org/wiki/Test%20article`,
    });
  });

  it("keeps Mandarin defaults and separates same-title articles by language", () => {
    expect(wikiTextId("DNA")).toBe("wiki-DNA");
    expect(wikiTextId("DNA", "zh")).toBe("wiki-DNA");
    expect(wikiTextId("DNA", "en")).not.toBe(wikiTextId("DNA", "zh"));
    expect(wikiStub("DNA", 123).lang ?? "zh").toBe("zh");
    expect(new URL(wikiApiUrl("DNA", true)).hostname).toBe("zh.wikipedia.org");
  });
});

describe("wiki search", () => {
  it("uses origin=* and parses search hits into stubs", () => {
    expect(wikiSearchUrl("猫")).toContain("origin=*");
    expect(wikiApiUrl("猫", true)).toContain("zh.wikipedia.org/w/api.php");
    const cards = parseWikiSearch({
      query: { search: [{ title: "猫科", snippet: "一种动物" }] },
    });
    expect(cards[0].wikiTitle).toBe("猫科");
    expect(cards[0].body).toBe("");
  });
});
