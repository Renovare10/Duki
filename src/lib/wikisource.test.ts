import { describe, expect, it } from "vitest";
import {
  parseWsExtract,
  parseWsParse,
  parseWsSearch,
  resolveWsBody,
  stripWsHtml,
  stripWsMarkup,
  wikisourceApiUrl,
  wikisourceParseUrl,
  wikisourceStubs,
} from "./wikisource";

const ANALECTS =
  "子曰：學而時習之，不亦說乎？有朋自遠方來，不亦樂乎？人不知而不慍，不亦君子乎？曾子曰：吾日三省吾身。";

describe("wikisource", () => {
  it("seeds chapter stubs with canonical ws titles", () => {
    expect(wikisourceStubs().length).toBeGreaterThanOrEqual(10);
    expect(wikisourceStubs()[0].kind).toBe("wikisource");
    expect(wikisourceStubs()[0].wsTitle).toBe("論語/學而第一");
    expect(wikisourceStubs()[0].body).toBe("");
    const titles = wikisourceStubs().map((t) => t.wsTitle);
    expect(titles).toContain("西遊記/第001回");
    expect(titles).toContain("狂人日記");
  });

  it("uses origin=* without a tiny exchars cap", () => {
    expect(wikisourceApiUrl("論語/學而第一")).toContain("zh.wikisource.org");
    expect(wikisourceApiUrl("論語/學而第一")).toContain("origin=*");
    expect(wikisourceApiUrl("論語/學而第一")).not.toContain("exchars");
    expect(wikisourceParseUrl("西遊記/第001回", "wikitext")).toContain("action=parse");
  });

  it("parses a page with extract text", () => {
    const page = parseWsExtract({
      query: {
        pages: {
          "1": {
            title: "論語/學而第一",
            extract: ANALECTS,
            fullurl: "https://zh.wikisource.org/wiki/論語/學而第一",
          },
        },
      },
    });
    expect(page.status).toBe("ok");
    if (page.status === "ok") expect(page.extract).toContain("學而時習之");
  });

  it("marks a missing page", () => {
    expect(
      parseWsExtract({
        query: { pages: { "-1": { title: "沒有此頁", missing: true } } },
      }).status,
    ).toBe("missing");
  });

  it("marks an empty extract so the parse fallback can run", () => {
    const page = parseWsExtract({
      query: {
        pages: {
          "1": { title: "西遊記/第001回", extract: "", fullurl: "https://zh.wikisource.org/wiki/x" },
        },
      },
    });
    expect(page.status).toBe("empty");
  });

  it("falls back from empty extract to wikitext, then HTML", () => {
    const empty = parseWsExtract({
      query: {
        pages: {
          "1": { title: "西遊記/第001回", extract: "   ", fullurl: "https://zh.wikisource.org/wiki/x" },
        },
      },
    });
    const fromWiki = resolveWsBody(empty, {
      wikitext: `{{header|title=西遊記}}\n${ANALECTS}\n`,
    });
    expect(fromWiki.extract).toContain("學而時習之");
    expect(fromWiki.extract.includes("{{header")).toBe(false);

    const fromHtml = resolveWsBody(empty, {
      wikitext: "{{header}}",
      html: `<p>${ANALECTS}</p>`,
    });
    expect(fromHtml.extract).toContain("有朋自遠方來");
  });

  it("throws when missing and when fallbacks are also empty", () => {
    expect(() =>
      resolveWsBody({ status: "missing" }),
    ).toThrow(/missing/i);
    expect(() =>
      resolveWsBody(
        { status: "empty", title: "X", url: "https://zh.wikisource.org/wiki/X" },
        { wikitext: "{{x}}", html: "<div></div>" },
      ),
    ).toThrow(/no text/i);
  });

  it("strips wikitext templates and HTML tags", () => {
    expect(stripWsMarkup(`{{header|notes=}}\n'''${ANALECTS}'''`)).toContain("不亦君子乎");
    expect(stripWsHtml(`<div class="mw">${ANALECTS}</div>`)).toContain("不亦說乎");
    expect(parseWsParse({ parse: { title: "X", wikitext: { "*": "甲" }, text: { "*": "<p>乙</p>" } } })).toEqual({
      title: "X",
      wikitext: "甲",
      html: "<p>乙</p>",
    });
  });

  it("parses search hits", () => {
    const cards = parseWsSearch({
      query: { search: [{ title: "吶喊/自序", snippet: "鲁迅" }] },
    });
    expect(cards[0].wsTitle).toBe("吶喊/自序");
    expect(cards[0].category).toBe("wikisource");
  });
});
