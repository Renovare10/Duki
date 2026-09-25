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
    expect(shelves.find((s) => s.id === "recommended")?.tags?.s).toBe("Unread");
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
    expect(trio.fresh).toBeNull();
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
    expect(trio.easy).toBeNull();
    expect(trio.justRight).toBeNull();
    expect(trio.hard?.id).toBe("cap");
    expect(trio.fresh?.id).toBe("too-hard");
  });

  it("keeps a 43% text out of the bands and still offers it as the unread slot", () => {
    const texts = [text({ id: "too-hard", title: "Too hard", category: "science" })];
    const scores = new Map([["too-hard", sc(0.43)]]);
    const trio = pickRecommendedTrio(texts, scores);
    expect(trio.easy).toBeNull();
    expect(trio.justRight).toBeNull();
    expect(trio.hard).toBeNull();
    expect(trio.fresh?.id).toBe("too-hard");
  });

  it("labels a lone 15% unread story Harder, not Easy", () => {
    const texts = [text({ id: "h", title: "H", category: "story" })];
    const scores = new Map([["h", sc(0.15)]]);
    const trio = pickRecommendedTrio(texts, scores);
    expect(trio.easy).toBeNull();
    expect(trio.justRight).toBeNull();
    expect(trio.hard?.id).toBe("h");
    expect(trio.fresh).toBeNull();
  });

  it("does not relabel 17%, 32%, and 35% as Easy / Just right / Harder", () => {
    const texts = [
      text({ id: "a", title: "A", category: "graded" }),
      text({ id: "b", title: "B", category: "story" }),
      text({ id: "c", title: "C", category: "children" }),
    ];
    const scores = new Map([
      ["a", sc(0.17)],
      ["b", sc(0.32)],
      ["c", sc(0.35)],
    ]);
    const trio = pickRecommendedTrio(texts, scores);
    expect(trio.easy).toBeNull();
    expect(trio.justRight).toBeNull();
    expect(trio.hard?.id).toBe("a");
    expect(trio.fresh?.id).toBe("b");
  });

  it("recommends a finished story that still fits Easy", () => {
    const texts = [text({ id: "e", title: "E", category: "graded", readAt: 1 })];
    const scores = new Map([["e", sc(0.03)]]);
    const trio = pickRecommendedTrio(texts, scores);
    expect(trio.easy?.id).toBe("e");
    expect(trio.justRight).toBeNull();
    expect(trio.hard).toBeNull();
    expect(trio.fresh).toBeNull();
  });

  it("keeps a finished Easy beside an unread Just right", () => {
    const texts = [
      text({ id: "e-read", title: "Finished easy", category: "graded", readAt: 9 }),
      text({ id: "j", title: "Unread JR", category: "graded" }),
    ];
    const scores = new Map([
      ["e-read", sc(0.03)],
      ["j", sc(0.08)],
    ]);
    const trio = pickRecommendedTrio(texts, scores);
    expect(trio.easy?.id).toBe("e-read");
    expect(trio.justRight?.id).toBe("j");
    expect(trio.hard).toBeNull();
    expect(trio.fresh).toBeNull();
  });

  it("puts the finished twin in Easy and the unread twin in the new slot", () => {
    const texts = [
      text({ id: "e-old", title: "Old easy", category: "graded", readAt: 2 }),
      text({ id: "e-new", title: "New easy", category: "graded" }),
    ];
    const scores = new Map([
      ["e-old", sc(0.03)],
      ["e-new", sc(0.03)],
    ]);
    const trio = pickRecommendedTrio(texts, scores);
    expect(trio.easy?.id).toBe("e-old");
    expect(trio.fresh?.id).toBe("e-new");
  });

  it("adds an unread slot when the bands are already filled with finished stories", () => {
    const texts = [
      text({ id: "e", title: "E", category: "graded", readAt: 1 }),
      text({ id: "j", title: "J", category: "story", readAt: 2 }),
      text({ id: "h", title: "H", category: "science", readAt: 3 }),
      text({ id: "new", title: "New", category: "story" }),
    ];
    const scores = new Map([
      ["e", sc(0.03)],
      ["j", sc(0.08)],
      ["h", sc(0.15)],
      ["new", sc(0.09)],
    ]);
    const trio = pickRecommendedTrio(texts, scores);
    expect(trio.easy?.id).toBe("e");
    expect(trio.justRight?.id).toBe("j");
    expect(trio.hard?.id).toBe("h");
    expect(trio.fresh?.id).toBe("new");
  });

  it("does not repeat an unread story already sitting in a band", () => {
    const texts = [
      text({ id: "e", title: "E", category: "graded", readAt: 1 }),
      text({ id: "j", title: "J", category: "story" }),
    ];
    const scores = new Map([
      ["e", sc(0.03)],
      ["j", sc(0.08)],
    ]);
    const trio = pickRecommendedTrio(texts, scores);
    expect(trio.justRight?.id).toBe("j");
    expect(trio.fresh).toBeNull();
  });

  it("does not use a paste or a started story as the unread slot", () => {
    const texts = [
      text({ id: "paste", title: "Mine", category: "paste", kind: "paste" }),
      text({
        id: "started",
        title: "Started",
        category: "story",
        bookmark: { tokenIndex: 4, scrollY: 0 },
      }),
      text({ id: "fresh", title: "Fresh", category: "story" }),
    ];
    const scores = new Map([
      ["paste", sc(0.08)],
      ["started", sc(0.08)],
      ["fresh", sc(0.09)],
    ]);
    const trio = pickRecommendedTrio(texts, scores);
    expect(trio.justRight?.id).toBe("started");
    expect(trio.fresh?.id).toBe("fresh");
    expect(trio.easy).toBeNull();
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
    expect(trio.fresh).toBeNull();
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
