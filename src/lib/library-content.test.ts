import { describe, expect, it } from "vitest";
import { PACKS } from "../data/library/index";
import { TOPICS } from "../data/topics";
import { entryToText, validateEntries, type LibraryEntry } from "./library-entry";
import catalogIds from "./__fixtures__/catalog-ids-c6dfe46.json";

const topicIds = new Set(TOPICS.map((t) => t.id));

describe("library packs (src/data/library)", () => {
  it("every pack entry is valid and ids are new", () => {
    const entries = PACKS.flatMap((p) => p.texts);
    expect(validateEntries(entries, topicIds, new Set(catalogIds as string[]))).toEqual([]);
  });

  it("pack ids are unique", () => {
    const ids = PACKS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("validateEntries / entryToText", () => {
  const good: LibraryEntry = {
    id: "lib-l1-tea",
    title: "喝茶",
    blurb: "Tea.",
    topics: ["food"],
    level: 1,
    body: "我喝茶。",
    aiGenerated: true,
  };

  it("accepts a good entry and flags bad ones", () => {
    expect(validateEntries([good], topicIds)).toEqual([]);
    const bad = { ...good, id: "Tea 1", topics: ["nope"], level: 11, body: "hello", aiGenerated: undefined } as unknown as LibraryEntry;
    expect(validateEntries([bad], topicIds).length).toBeGreaterThanOrEqual(5);
    expect(validateEntries([good, good], topicIds)).toContain("lib-l1-tea: duplicate id");
    expect(validateEntries([good], topicIds, new Set(["lib-l1-tea"]))).toContain("lib-l1-tea: id already used by the catalog");
  });

  it("converts to a catalog row", () => {
    const row = entryToText({ ...good, series: { id: "s", title: "S", part: 2 } }, 3);
    expect(row).toMatchObject({ id: "lib-l1-tea", kind: "sample", category: "story", readAt: null, bookmark: null, seriesId: "s", chapter: 2 });
    expect(row.createdAt).toBe(100_003);
  });
});
