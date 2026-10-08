import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { LibraryText } from "../types";
import { WORKS } from "../data/works";
import { WORK_STATS } from "../data/works.generated";
import {
  chapterState,
  clearWorkCache,
  fetchWorkJson,
  flatChapters,
  isWorkRowId,
  loadChapter,
  neighbors,
  parseWorkRowId,
  workChapterRow,
  workProgress,
  workRowId,
  workRows,
  type WorkToc,
} from "./works";

const TOC: WorkToc = {
  id: "demo",
  sections: [
    {
      key: "GEN",
      title: "创世记",
      chars: 300,
      level: 7,
      chapters: [
        { key: "GEN.1", title: "创世记 1", label: "1", chars: 100, level: 7 },
        { key: "GEN.2", title: "创世记 2", label: "2", chars: 100, level: 7 },
      ],
    },
    {
      key: "EXO",
      title: "出埃及记",
      chars: 100,
      level: 8,
      chapters: [{ key: "EXO.1", title: "出埃及记 1", label: "1", chars: 100, level: 8 }],
    },
  ],
};

function row(key: string, patch: Partial<LibraryText>): LibraryText {
  return {
    id: workRowId("demo", key),
    title: key,
    blurb: "",
    body: "",
    kind: "sample",
    category: "history",
    createdAt: 1,
    readAt: null,
    bookmark: null,
    ...patch,
  };
}

describe("work row ids", () => {
  it("round-trips", () => {
    const id = workRowId("bible-cuv", "GEN.1");
    expect(id).toBe("w:bible-cuv:GEN.1");
    expect(isWorkRowId(id)).toBe(true);
    expect(parseWorkRowId(id)).toEqual({ workId: "bible-cuv", key: "GEN.1" });
    expect(parseWorkRowId("w:nahan:10.4")).toEqual({ workId: "nahan", key: "10.4" });
  });
  it("never matches existing text ids", () => {
    for (const id of ["sample-home", "wiki:猫", "ws:第一回", "3f2a-uuid", "novel-lamp-1"]) {
      expect(isWorkRowId(id)).toBe(false);
      expect(parseWorkRowId(id)).toBeNull();
    }
  });
  it("rejects malformed or path-like keys", () => {
    expect(parseWorkRowId("w:bible-cuv:")).toBeNull();
    expect(parseWorkRowId("w::GEN.1")).toBeNull();
    expect(parseWorkRowId("w:bible-cuv:../x")).toBeNull();
    expect(parseWorkRowId("w:Bible:GEN.1")).toBeNull();
  });
});

describe("chapter loading", () => {
  afterEach(() => clearWorkCache());

  const okJson = (data: unknown) => ({
    ok: true,
    status: 200,
    headers: new Headers({ "content-type": "application/json" }),
    text: async () => JSON.stringify(data),
  });

  it("fetches a chapter once and serves repeats from memory", async () => {
    const f = vi.fn(async () => okJson({ key: "GEN.1", title: "创世记 1", body: "¹起初" }));
    const a = await loadChapter("bible-cuv", "GEN.1", f);
    const b = await loadChapter("bible-cuv", "GEN.1", f);
    expect(a.body).toBe("¹起初");
    expect(b).toBe(a);
    expect(f).toHaveBeenCalledTimes(1);
    expect(f.mock.calls[0][0]).toBe("/works/bible-cuv/GEN.1.json");
  });

  it("turns an HTML fallback page into an error and retries next time", async () => {
    const html = { ok: true, status: 200, headers: new Headers(), text: async () => "<!doctype html><html>" };
    const f = vi
      .fn()
      .mockResolvedValueOnce(html)
      .mockResolvedValueOnce(okJson({ key: "GEN.2", title: "创世记 2", body: "x" }));
    await expect(fetchWorkJson("bible-cuv/GEN.2.json", f)).rejects.toThrow(/Could not load/);
    await expect(fetchWorkJson("bible-cuv/GEN.2.json", f)).resolves.toMatchObject({ key: "GEN.2" });
    expect(f).toHaveBeenCalledTimes(2);
  });

  it("reports HTTP errors", async () => {
    const f = vi.fn(async () => ({ ok: false, status: 404, headers: new Headers(), text: async () => "" }));
    await expect(fetchWorkJson("nope/toc.json", f)).rejects.toThrow(/404/);
  });
});

describe("navigation and progress", () => {
  it("flattens and finds neighbours across sections", () => {
    expect(flatChapters(TOC).map((c) => c.key)).toEqual(["GEN.1", "GEN.2", "EXO.1"]);
    const n = neighbors(TOC, "GEN.2");
    expect(n.prev?.key).toBe("GEN.1");
    expect(n.next?.key).toBe("EXO.1");
    expect(neighbors(TOC, "EXO.1").next).toBeNull();
    expect(neighbors(TOC, "MISSING").here).toBeNull();
  });

  it("starts at the first chapter", () => {
    const p = workProgress(TOC, new Map());
    expect(p.next.key).toBe("GEN.1");
    expect(p.started).toBe(false);
    expect(p.read).toBe(0);
    expect(p.total).toBe(3);
  });

  it("resumes the most recently opened unfinished chapter", () => {
    const rows = new Map([
      ["GEN.1", row("GEN.1", { readAt: 100, openedAt: 90 })],
      ["EXO.1", row("EXO.1", { openedAt: 200, bookmark: { tokenIndex: 40, scrollY: 300 } })],
    ]);
    const p = workProgress(TOC, rows);
    expect(p.next.key).toBe("EXO.1");
    expect(p.resuming).toBe(true);
    expect(p.read).toBe(1);
  });

  it("moves on to the next unread chapter after finishing one", () => {
    const rows = new Map([["GEN.1", row("GEN.1", { readAt: 100, openedAt: 50 })]]);
    const p = workProgress(TOC, rows);
    expect(p.next.key).toBe("GEN.2");
    expect(p.resuming).toBe(false);
  });

  it("skips chapters that are already read, wrapping around", () => {
    const rows = new Map([
      ["GEN.1", row("GEN.1", { readAt: 10 })],
      ["GEN.2", row("GEN.2", { readAt: 20 })],
      ["EXO.1", row("EXO.1", { readAt: 5 })],
    ]);
    // Everything read: points back at the last touched chapter, nothing to resume.
    const p = workProgress(TOC, rows);
    expect(p.read).toBe(3);
    expect(p.next.key).toBe("GEN.2");
    const partial = new Map([
      ["GEN.2", row("GEN.2", { readAt: 20 })],
      ["EXO.1", row("EXO.1", { readAt: 30 })],
    ]);
    expect(workProgress(TOC, partial).next.key).toBe("GEN.1");
  });

  it("works with rows written by older versions (no openedAt)", () => {
    const rows = new Map([["GEN.1", row("GEN.1", { bookmark: { tokenIndex: 5, scrollY: 80 } })]]);
    expect(chapterState(rows.get("GEN.1"))).toBe("started");
    expect(workProgress(TOC, rows).next.key).toBe("GEN.1");
  });

  it("collects only this work's rows", () => {
    const texts = [
      row("GEN.1", {}),
      { ...row("GEN.1", {}), id: "w:demo2:GEN.1" },
      { ...row("GEN.1", {}), id: "sample-home" },
    ];
    expect([...workRows(texts, "demo").keys()]).toEqual(["GEN.1"]);
  });
});

describe("workChapterRow", () => {
  const work = { id: "demo", title: "示例", author: "某人", category: "history" as const, source: "src", sourceUrl: "https://x" };

  it("creates a body-less row stamped with openedAt", () => {
    const r = workChapterRow(work, { key: "GEN.1", title: "创世记 1" }, undefined, 123);
    expect(r).toMatchObject({ id: "w:demo:GEN.1", body: "", openedAt: 123, readAt: null, bookmark: null, kind: "sample" });
  });

  it("keeps read state and bookmark when reopening, and never stores a body", () => {
    const existing = row("GEN.1", { readAt: 50, bookmark: { tokenIndex: 9, scrollY: 400 }, body: "leaked" });
    const r = workChapterRow(work, { key: "GEN.1", title: "创世记 1" }, existing, 999);
    expect(r.readAt).toBe(50);
    expect(r.bookmark).toEqual({ tokenIndex: 9, scrollY: 400 });
    expect(r.body).toBe("");
    expect(r.openedAt).toBe(999);
  });
});

describe("built works on disk", () => {
  const root = path.resolve(__dirname, "../../public/works");

  for (const work of WORKS) {
    it(`${work.id}: every chapter in the contents has a file, and stats match`, () => {
      const toc = JSON.parse(fs.readFileSync(path.join(root, work.id, "toc.json"), "utf8")) as WorkToc;
      const flat = flatChapters(toc);
      expect(flat.length).toBe(WORK_STATS[work.id].chapters);
      expect(toc.sections.length).toBe(WORK_STATS[work.id].sections);
      expect(new Set(flat.map((c) => c.key)).size).toBe(flat.length);
      for (const ch of flat) {
        expect(ch.key).toMatch(/^[A-Z0-9.]+$/);
        const file = path.join(root, work.id, `${ch.key}.json`);
        expect(fs.existsSync(file), file).toBe(true);
      }
      const first = JSON.parse(fs.readFileSync(path.join(root, work.id, `${flat[0].key}.json`), "utf8"));
      expect(first.body.length).toBeGreaterThan(100);
      expect(first.body).not.toMatch(/<|Template:|\\[a-z]+\d?\s/);
      const profile = JSON.parse(fs.readFileSync(path.join(root, work.id, "profile.json"), "utf8"));
      expect(profile.words.length).toBe(profile.counts.length);
      expect(profile.tokens).toBeGreaterThan(0);
    });
  }

  it("the Bible is complete: 66 books, 1,189 chapters", () => {
    const toc = JSON.parse(fs.readFileSync(path.join(root, "bible-cuv", "toc.json"), "utf8")) as WorkToc;
    expect(toc.sections.length).toBe(66);
    expect(toc.sections.filter((s) => s.part === "旧约").length).toBe(39);
    expect(toc.sections.filter((s) => s.part === "新约").length).toBe(27);
    expect(flatChapters(toc).length).toBe(1189);
    expect(toc.sections[0].title).toBe("创世记");
    expect(toc.sections[65].title).toBe("启示录");
    const gen1 = JSON.parse(fs.readFileSync(path.join(root, "bible-cuv", "GEN.1.json"), "utf8"));
    expect(gen1.body.startsWith("¹起初，神创造天地。")).toBe(true);
    const psa119 = JSON.parse(fs.readFileSync(path.join(root, "bible-cuv", "PSA.119.json"), "utf8"));
    expect(psa119.body).toContain("¹⁷⁶");
  });
});

describe("card wording", () => {
  it("pluralizes section nouns", async () => {
    const { countNoun } = await import("./works");
    expect(countNoun(15, "Story")).toBe("15 stories");
    expect(countNoun(66, "Book")).toBe("66 books");
    expect(countNoun(1, "Essay")).toBe("1 essay");
    expect(countNoun(1189, "Chapter")).toBe("1,189 chapters");
  });
  it("drops edition notes from cover titles", async () => {
    const { coverTitle } = await import("./works");
    expect(coverTitle("圣经（和合本）")).toBe("圣经");
    expect(coverTitle("吶喊")).toBe("吶喊");
  });
});
