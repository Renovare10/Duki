import { describe, expect, it } from "vitest";
import { CATALOG } from "../data/catalog";
import { bookProgress, bookTitleOf, collapseTexts, continueChapter, itemId } from "./books";
import type { LibraryText } from "../types";

function text(
  partial: Partial<LibraryText> & Pick<LibraryText, "id" | "title">,
): LibraryText {
  return {
    blurb: "",
    body: "你好",
    kind: "sample",
    category: "novel",
    createdAt: 1,
    readAt: null,
    bookmark: null,
    ...partial,
  };
}

describe("collapseTexts", () => {
  it("turns a series into one book card", () => {
    const items = collapseTexts([
      text({
        id: "a",
        title: "西游记 · 第一回",
        seriesId: "xiyouji",
        seriesTitle: "西游记",
        chapter: 1,
      }),
      text({
        id: "b",
        title: "西游记 · 第二回",
        seriesId: "xiyouji",
        seriesTitle: "西游记",
        chapter: 2,
      }),
      text({ id: "c", title: "孔乙己", category: "article" }),
    ]);
    const book = items.find((i) => i.type === "book");
    const single = items.find((i) => i.type === "text");
    expect(book?.type === "book" && book.book.title).toBe("西游记");
    expect(book?.type === "book" && book.book.chapters).toHaveLength(2);
    expect(single?.type === "text" && single.text.title).toBe("孔乙己");
  });

  it("collapses the real catalog without duplicate keys or missing bodies", () => {
    const items = collapseTexts(CATALOG);
    const keys = items.map(itemId);
    expect(new Set(keys).size).toBe(keys.length);
    expect(items.some((item) => item.type === "book" && item.book.title === "西游记")).toBe(true);
    for (const item of items) {
      if (item.type === "text") expect(item.text.body).toBeDefined();
      else expect(item.book.chapters.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("hides Gutenberg cards", () => {
    const items = collapseTexts([
      text({
        id: "gb-1",
        title: "呐喊",
        kind: "gutenberg",
        category: "gutenberg",
        gutenbergId: 1,
      }),
      text({ id: "s", title: "我的家", category: "graded" }),
    ]);
    expect(items.map((i) => (i.type === "text" ? i.text.id : i.book.id))).toEqual(["s"]);
  });
});

describe("bookProgress", () => {
  it("is read only when every chapter is finished", () => {
    const chapters = [
      text({ id: "a", title: "一", readAt: 1 }),
      text({ id: "b", title: "二", readAt: null }),
    ];
    expect(bookProgress(chapters)).toBe("in-progress");
    expect(bookProgress(chapters.map((c) => ({ ...c, readAt: 1 })))).toBe("read");
  });

  it("treats a bookmark as in progress", () => {
    expect(
      bookProgress([
        text({ id: "a", title: "一", bookmark: { tokenIndex: 8, scrollY: 80 } }),
        text({ id: "b", title: "二" }),
      ]),
    ).toBe("in-progress");
  });
});

describe("bookTitleOf", () => {
  it("uses the series title, not the chapter heading", () => {
    expect(bookTitleOf(text({ id: "a", title: "南风镇 · 一", seriesTitle: "南风镇" }))).toBe(
      "南风镇",
    );
  });
});

describe("continueChapter", () => {
  it("resumes the bookmarked chapter", () => {
    const paused = text({
      id: "b",
      title: "二",
      bookmark: { tokenIndex: 4, scrollY: 90 },
    });
    expect(
      continueChapter([text({ id: "a", title: "一" }), paused])?.id,
    ).toBe("b");
  });
});
