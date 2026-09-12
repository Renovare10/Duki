import { describe, expect, it } from "vitest";
import { parseWsExtract, parseWsSearch, wikisourceApiUrl, wikisourceStubs } from "./wikisource";

describe("wikisource", () => {
  it("seeds chapter stubs with ws titles", () => {
    expect(wikisourceStubs().length).toBeGreaterThanOrEqual(10);
    expect(wikisourceStubs()[0].kind).toBe("wikisource");
    expect(wikisourceStubs()[0].wsTitle).toBeTruthy();
    expect(wikisourceStubs()[0].body).toBe("");
  });

  it("uses origin=* and parses extracts", () => {
    expect(wikisourceApiUrl("论语/学而")).toContain("zh.wikisource.org");
    expect(wikisourceApiUrl("论语/学而")).toContain("origin=*");
    const page = parseWsExtract({
      query: {
        pages: {
          "1": {
            title: "论语/学而",
            extract: "子曰：学而时习之。",
            fullurl: "https://zh.wikisource.org/wiki/论语/学而",
          },
        },
      },
    });
    expect(page.extract).toContain("学而时习之");
  });

  it("parses search hits", () => {
    const cards = parseWsSearch({
      query: { search: [{ title: "呐喊/自序", snippet: "鲁迅" }] },
    });
    expect(cards[0].wsTitle).toBe("呐喊/自序");
    expect(cards[0].category).toBe("wikisource");
  });
});
