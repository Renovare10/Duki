import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SAMPLES } from "../data/samples";
import { segment } from "./segment";

const glossary = JSON.parse(
  readFileSync(path.join(process.cwd(), "public", "glossary.json"), "utf8"),
) as { maxLen: number; entries: Record<string, [string, string]> };

const hasWord = (word: string) =>
  Object.prototype.hasOwnProperty.call(glossary.entries, word);

describe("sample texts", () => {
  it("segment into dictionary words, not isolated characters", () => {
    const home = SAMPLES.find((s) => s.id === "sample-home")!;
    const words = segment(home.body, hasWord, glossary.maxLen)
      .filter((t) => t.isWord)
      .map((t) => t.text);
    expect(words).toContain("喜欢");
    expect(words).toContain("学生");
    expect(words).toContain("北京");
    expect(words).not.toContain("喜");
  });

  it("keeps 不客气 as one token", () => {
    const tea = SAMPLES.find((s) => s.id === "sample-tea")!;
    const words = segment(tea.body, hasWord, glossary.maxLen)
      .filter((t) => t.isWord)
      .map((t) => t.text);
    expect(words).toContain("不客气");
  });
});
