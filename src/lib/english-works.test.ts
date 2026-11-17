import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { findWork, worksForLanguage, workStats, WORKS } from "../data/works";
import { flatChapters, type WorkToc } from "./works";
import { segment } from "./segment";

describe("English long-work edition", () => {
  it("registers a complete public-domain English counterpart without changing the Mandarin registry", () => {
    const work = findWork("en-bible-web", "en");
    expect(worksForLanguage("en").map((w) => w.id)).toEqual(["en-bible-web"]);
    expect(work).toMatchObject({ id: "en-bible-web", lang: "en", title: "The Bible (World English Bible)" });
    expect(work!.source).toContain("engwebp");
    expect(work!.license).toContain("Public domain");
    expect(WORKS.map((w) => w.id)).toEqual(["bible-cuv", "nahan", "zhaohua-xishi", "zhu-ziqing-essays"]);
    expect(findWork("en-bible-web", "zh")).toBeUndefined();
    expect(findWork("bible-cuv", "en")).toBeUndefined();
    expect(findWork("bible-cuv")).toBe(WORKS[0]);
    const root = path.resolve(__dirname, "../../public/works/en-bible-web");
    const toc = JSON.parse(fs.readFileSync(path.join(root, "toc.json"), "utf8")) as WorkToc;
    const flat = flatChapters(toc);
    expect(toc.sections).toHaveLength(66);
    expect(toc.sections.filter((s) => s.part === "Old Testament")).toHaveLength(39);
    expect(toc.sections.filter((s) => s.part === "New Testament")).toHaveLength(27);
    expect(flat).toHaveLength(1189);
    expect(new Set(flat.map((c) => c.key)).size).toBe(1189);
    let total = 0;
    for (const section of toc.sections) {
      let sectionWords = 0;
      for (const ch of section.chapters) {
        const data = JSON.parse(fs.readFileSync(path.join(root, `${ch.key}.json`), "utf8"));
        expect(data).toMatchObject({ key: ch.key, title: ch.title });
        expect(data.body).not.toMatch(/[\\|]|strong=|Not body text/);
        const words = segment(data.body, () => false, 8, "en").filter((t) => t.isWord).length;
        expect(words).toBeGreaterThan(0);
        expect(ch.words, ch.key).toBe(words);
        sectionWords += words;
      }
      expect(section.words).toBe(sectionWords);
      total += sectionWords;
    }
    expect(workStats(work!.id)).toMatchObject({ chapters: 1189, sections: 66, chars: 0, words: total, firstKey: "GEN.1" });
    const genesis = JSON.parse(fs.readFileSync(path.join(root, "GEN.1.json"), "utf8"));
    expect(genesis.body).toMatch(/^¹ In the beginning, God created the heavens and the earth\./);
    const psalm = JSON.parse(fs.readFileSync(path.join(root, "PSA.119.json"), "utf8"));
    expect(psalm.body).toContain("¹⁷⁶ ");
    const last = JSON.parse(fs.readFileSync(path.join(root, "REV.22.json"), "utf8"));
    expect(last.body).toContain("²¹ ");
    const profile = JSON.parse(fs.readFileSync(path.join(root, "profile.json"), "utf8"));
    expect(profile.tokens).toBe(total);
    expect(profile.words).toHaveLength(profile.counts.length);
    expect(profile.words).toContain("the");
  });
});

describe("English long-work tap glosses", () => {
  it("glosses (nearly) every word of every chapter through the bundled map plus the work's glosses.json", async () => {
    const { EN_GLOSSES } = await import("../data/en-samples");
    const root = path.resolve(__dirname, "../../public/works/en-bible-web");
    const extra = JSON.parse(fs.readFileSync(path.join(root, "glosses.json"), "utf8")) as Record<string, string>;
    for (const key of Object.keys(extra)) expect(EN_GLOSSES[key], key).toBeUndefined();
    let total = 0;
    const missing = new Set<string>();
    for (const f of fs.readdirSync(root).filter((f) => /\.\d+\.json$/.test(f))) {
      const { body } = JSON.parse(fs.readFileSync(path.join(root, f), "utf8")) as { body: string };
      for (const tok of segment(body, () => false, 8, "en")) {
        if (!tok.key) continue;
        total++;
        if (!EN_GLOSSES[tok.key] && !extra[tok.key]) missing.add(tok.key);
      }
    }
    expect(total).toBeGreaterThan(700_000);
    expect(missing.size).toBeLessThan(100);
  });

  it("registers a work's glosses for getGloss once its file loads", async () => {
    const { getGloss } = await import("./glossary");
    const { loadEnWorkGlosses, clearWorkCache } = await import("./works");
    expect(getGloss("dukiworkfixtureword", "en").english).toBe("—");
    const f = async () => new Response(JSON.stringify({ dukiworkfixtureword: "n. 测试" }), { status: 200 });
    await loadEnWorkGlosses("en-fixture-work", f);
    expect(getGloss("DukiWorkFixtureWord", "en").english).toBe("n. 测试");
    expect(getGloss("dukiworkfixtureword", "zh").english).not.toBe("n. 测试");
    clearWorkCache();
  });
});
