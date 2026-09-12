import { describe, expect, it } from "vitest";
import { bookmarkProgress, normalizeText } from "./text";

describe("normalizeText", () => {
  it("treats v1 samples as unread graded texts", () => {
    const text = normalizeText({
      id: "sample-home",
      title: "我的家",
      body: "我是学生。",
      kind: "sample",
      createdAt: 1,
    });
    expect(text.readAt).toBeNull();
    expect(text.category).toBe("graded");
    expect(text.bookmark).toBeNull();
    expect(text.blurb).toBe("");
    expect(text.featured).toBe(false);
  });
});

describe("bookmarkProgress", () => {
  it("hides a crumb at the start of a text", () => {
    expect(bookmarkProgress({ tokenIndex: 0, scrollY: 0 }, 40)).toBeNull();
  });

  it("reports percent for an unfinished pause", () => {
    expect(bookmarkProgress({ tokenIndex: 10, scrollY: 200 }, 40)).toBe(25);
  });
});
