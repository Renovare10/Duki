import { describe, expect, it } from "vitest";
import {
  parseWikiQuery,
  parseWikiSearch,
  wikiApiUrl,
  wikiSearchUrl,
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
