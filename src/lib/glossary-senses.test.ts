import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { keepSenses } from "../../scripts/gloss-senses.mjs";

describe("黄 gloss", () => {
  it("drops the pornographic sense and keeps yellow", () => {
    expect(keepSenses("黄", ["yellow", "pornographic", "sallow"])).toEqual(["yellow", "sallow"]);
    expect(keepSenses("黄", ["yellow; pornographic", "sallow"])).toEqual(["yellow", "sallow"]);
    expect(keepSenses("黄色", ["yellow", "pornographic"])).toEqual(["yellow"]);
    expect(keepSenses("黄片", ["pornographic movie"])).toEqual(["pornographic movie"]);
  });

  it("is already gone from the built glossary", () => {
    const gloss = JSON.parse(readFileSync("public/glossary.json", "utf8")) as {
      entries: Record<string, [string, string]>;
    };
    for (const word of ["黄", "黄色"]) {
      const english = gloss.entries[word][1];
      expect(english).toMatch(/yellow/i);
      expect(english).not.toMatch(/porn|obscen|lewd|vulgar/i);
    }
  });
});
