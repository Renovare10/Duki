import { describe, expect, it } from "vitest";
import { buildShelves, pickHero, pickRecommendedTrio, type Shelf } from "./shelves";
import { pickSuggestion } from "./score";
import type { LibraryText, TextScore } from "../types";

function ids(shelf: Shelf | undefined): string[] {
  return (shelf?.items ?? []).map((item) => (item.type === "text" ? item.text.id : item.book.id));
}

function text(
  partial: Partial<LibraryText> & Pick<LibraryText, "id" | "title" | "category">,
): LibraryText {
  return {
    blurb: "",
    body: "你好世界今天天气很好我们一起学习",
    kind: "sample",
    createdAt: 1,
    readAt: null,
    bookmark: null,
    ...partial,
  };
}

function sc(load: number, extra: Partial<TextScore> = {}): TextScore {
  return {
    total: 20,
    known: Math.round((1 - load) * 20),
    shaky: 0,
    unknown: Math.round(load * 20),
    knownPct: 1 - load,
    unknownLoad: load,
    unique: 12,
    uniqueUnknown: load === 0 ? 0 : 4,
    uniqueShaky: 0,
    ...extra,
  };
}

const filters = {
  level: "all" as const,
  read: "all" as const,
  category: "all" as const,
  query: "",
};

describe("buildShelves", () => {
  it("puts unfinished bookmarks in Continue", () => {
    const texts = [
      text({
        id: "a",
        title: "Paused",
        category: "story",
        bookmark: { tokenIndex: 8, scrollY: 120 },
      }),
      text({ id: "b", title: "Fresh", category: "story" }),
    ];
    const scores = new Map([
      ["a", sc(0.4)],
      ["b", sc(0.4)],
    ]);
    const shelves = buildShelves(texts, scores, [], filters);
    const cont = shelves.find((s) => s.id === "continue");
    expect(ids(cont)).toEqual(["a"]);
  });

  it("has Unread and Read rows", () => {
    const texts = [
      text({ id: "u", title: "U", category: "story" }),
      text({ id: "r", title: "R", category: "story", readAt: 1 }),
    ];
    const scores = new Map([
      ["u", sc(0.4)],
      ["r", sc(0.4)],
    ]);
    const shelves = buildShelves(texts, scores, [], filters);
    expect(ids(shelves.find((s) => s.id === "unread"))).toEqual(["u"]);
    expect(ids(shelves.find((s) => s.id === "read"))).toEqual(["r"]);
  });

  it("keeps Wikipedia stubs on the category shelf when Just right is on", () => {
    const texts = [
      text({
        id: "wiki-猫",
        title: "猫",
        category: "wiki",
        kind: "wiki",
        wikiTitle: "猫",
        body: "",
      }),
    ];
    const scores = new Map([["wiki-猫", sc(0, { total: 0, uniqueUnknown: 0 })]]);
    const jr = buildShelves(texts, scores, [], { ...filters, level: "just-right" });
    expect(ids(jr.find((s) => s.id === "wiki"))).toEqual(["wiki-猫"]);
    const all = buildShelves(texts, scores, [], filters);
    expect(ids(all.find((s) => s.id === "wiki"))[0]).toBe("wiki-猫");
  });

  it("does not drop Stories when Just right is on; matching cards come first", () => {
    const texts = [
      text({ id: "hard", title: "Hard", category: "story" }),
      text({ id: "jr", title: "JR", category: "story" }),
    ];
    const scores = new Map([
      ["hard", sc(0.43)],
      ["jr", sc(0.08)],
    ]);
    const shelves = buildShelves(texts, scores, [], { ...filters, level: "just-right" });
    const unread = ids(shelves.find((s) => s.id === "unread"));
    const stories = ids(shelves.find((s) => s.id === "story"));
    expect(unread).toEqual(["jr", "hard"]);
    expect(stories).toEqual(["jr", "hard"]);
    expect(shelves.find((s) => s.id === "story")).toBeTruthy();
  });

  it("lets the Harder chip put 43% unknown texts first on Stories", () => {
    const texts = [
      text({ id: "hard", title: "Hard", category: "story" }),
      text({ id: "jr", title: "JR", category: "story" }),
    ];
    const scores = new Map([
      ["hard", sc(0.43)],
      ["jr", sc(0.08)],
    ]);
    const shelves = buildShelves(texts, scores, [], { ...filters, level: "hard" });
    const unread = ids(shelves.find((s) => s.id === "unread"));
    const stories = ids(shelves.find((s) => s.id === "story"));
    expect(unread).toEqual(["hard", "jr"]);
    expect(stories).toEqual(["hard", "jr"]);
  });

  it("shows one Novels card for a series, not each chapter", () => {
    const texts = [
      text({
        id: "a",
        title: "南风镇 · 一",
        category: "novel",
        seriesId: "south-wind",
        seriesTitle: "南风镇",
        chapter: 1,
      }),
      text({
        id: "b",
        title: "南风镇 · 二",
        category: "novel",
        seriesId: "south-wind",
        seriesTitle: "南风镇",
        chapter: 2,
      }),
    ];
    const scores = new Map([
      ["a", sc(0.4)],
      ["b", sc(0.4)],
    ]);
    const shelves = buildShelves(texts, scores, [], filters);
    expect(ids(shelves.find((s) => s.id === "novel"))).toEqual(["south-wind"]);
    const item = shelves.find((s) => s.id === "novel")?.items[0];
    expect(item?.type).toBe("book");
  });

  it("always emits editorial category rows that have cards", () => {
    const texts = [
      text({ id: "s", title: "S", category: "story" }),
      text({
        id: "wiki-猫",
        title: "猫",
        category: "wiki",
        kind: "wiki",
        wikiTitle: "猫",
        body: "",
      }),
    ];
    const scores = new Map([
      ["s", sc(0.43)],
      ["wiki-猫", sc(0, { total: 0, uniqueUnknown: 0 })],
    ]);
    const shelves = buildShelves(texts, scores, [], { ...filters, level: "just-right" });
    expect(shelves.map((s) => s.id)).toContain("story");
    expect(shelves.map((s) => s.id)).toContain("wiki");
    expect(shelves.find((s) => s.id === "recommended")).toBeUndefined();
    expect(shelves.find((s) => s.id === "gutenberg")).toBeUndefined();
  });
});

describe("pickRecommendedTrio", () => {
  it("picks one Easy, one Just right, and one Harder, never 100% known", () => {
    const texts = [
      text({ id: "e", title: "E", category: "graded" }),
      text({ id: "j", title: "J", category: "story" }),
      text({ id: "h", title: "H", category: "science" }),
      text({ id: "k", title: "K", category: "graded" }),
    ];
    const scores = new Map([
      ["e", sc(0.03)],
      ["j", sc(0.08)],
      ["h", sc(0.15)],
      ["k", sc(0, { uniqueUnknown: 0, uniqueShaky: 0 })],
    ]);
    const trio = pickRecommendedTrio(texts, scores);
    expect(trio.easy?.id).toBe("e");
    expect(trio.justRight?.id).toBe("j");
    expect(trio.hard?.id).toBe("h");
  });

  it("does not recommend a 43% unknown text as Harder", () => {
    const texts = [
      text({ id: "too-hard", title: "Too hard", category: "science" }),
      text({ id: "cap", title: "Cap", category: "story" }),
    ];
    const scores = new Map([
      ["too-hard", sc(0.43)],
      ["cap", sc(0.16)],
    ]);
    const trio = pickRecommendedTrio(texts, scores);
    expect(trio.hard?.id).toBe("cap");
    expect(trio.easy).toBeNull();
    expect(trio.justRight).toBeNull();
  });

  it("omits Harder rather than filling with a 43% text", () => {
    const texts = [text({ id: "too-hard", title: "Too hard", category: "science" })];
    const scores = new Map([["too-hard", sc(0.43)]]);
    const trio = pickRecommendedTrio(texts, scores);
    expect(trio.easy).toBeNull();
    expect(trio.justRight).toBeNull();
    expect(trio.hard).toBeNull();
  });

  it("omits Easy rather than filling with a hard text", () => {
    const texts = [text({ id: "h", title: "H", category: "story" })];
    const scores = new Map([["h", sc(0.15)]]);
    const trio = pickRecommendedTrio(texts, scores);
    expect(trio.easy).toBeNull();
    expect(trio.justRight).toBeNull();
    expect(trio.hard?.id).toBe("h");
  });

  it("omits a slot rather than recommending an already-read story", () => {
    const texts = [text({ id: "e", title: "E", category: "graded", readAt: 1 })];
    const scores = new Map([["e", sc(0.03)]]);
    const trio = pickRecommendedTrio(texts, scores);
    expect(trio.easy).toBeNull();
    expect(trio.justRight).toBeNull();
    expect(trio.hard).toBeNull();
  });

  it("does not recommend an unscored stub", () => {
    const texts = [
      text({
        id: "stub",
        title: "Stub",
        category: "wiki",
        kind: "wiki",
        body: "",
      }),
    ];
    const scores = new Map([["stub", sc(0, { total: 0, uniqueUnknown: 0 })]]);
    const trio = pickRecommendedTrio(texts, scores);
    expect(trio.easy).toBeNull();
    expect(trio.justRight).toBeNull();
    expect(trio.hard).toBeNull();
  });
});

describe("pickHero", () => {
  it("refuses a fully known sample", () => {
    const texts = [text({ id: "a", title: "A", category: "graded" })];
    const scores = new Map([["a", sc(0, { uniqueUnknown: 0, uniqueShaky: 0 })]]);
    expect(pickHero(texts, scores, pickSuggestion)).toBeNull();
  });

  it("does not hero a fully-known re-read when unread harder texts exist", () => {
    const texts = [
      text({ id: "reread", title: "Old", category: "graded", readAt: 9 }),
      text({ id: "fresh", title: "New", category: "story" }),
    ];
    const scores = new Map([
      ["reread", sc(0, { uniqueUnknown: 0, uniqueShaky: 0 })],
      ["fresh", sc(0.2)],
    ]);
    expect(pickHero(texts, scores, pickSuggestion)?.id).toBe("fresh");
  });
});
