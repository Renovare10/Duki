import { describe, expect, it } from "vitest";
import { segment } from "./segment";

const words = new Set([
  "你好",
  "中国",
  "不客气",
  "打电话",
  "对不起",
  "我们",
  "学习",
  "汉语",
  "苹果",
]);
const has = (w: string) => words.has(w);

describe("segment", () => {
  it("matches longest dictionary words, not characters", () => {
    const tokens = segment("你好中国", has, 8).filter((t) => t.isWord);
    expect(tokens.map((t) => t.text)).toEqual(["你好", "中国"]);
  });

  it("keeps multi-character HSK phrases together", () => {
    const tokens = segment("不客气，对不起", has, 8).filter((t) => t.isWord);
    expect(tokens.map((t) => t.text)).toEqual(["不客气", "对不起"]);
  });

  it("falls back to single characters when unknown", () => {
    const tokens = segment("龙", has, 8);
    expect(tokens).toEqual([{ text: "龙", isWord: true, index: 0 }]);
  });

  it("preserves punctuation and whitespace as non-words", () => {
    const tokens = segment("我们学习汉语。", has, 8);
    expect(tokens.map((t) => t.text)).toEqual(["我们", "学习", "汉语", "。"]);
    expect(tokens[3].isWord).toBe(false);
  });
});
