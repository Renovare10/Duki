import { describe, expect, it } from "vitest";
import { CATALOG, SAMPLES } from "./catalog";

const NEED = ["children", "story", "science", "history", "article", "graded"] as const;

describe("catalog", () => {
  it("is a real starter library with blurbs and mixed shelves", () => {
    expect(CATALOG.length).toBeGreaterThanOrEqual(40);
    expect(SAMPLES.length).toBe(5);
    expect(CATALOG.every((t) => t.blurb.length > 0)).toBe(true);
    expect(CATALOG.some((t) => t.featured)).toBe(true);
    expect(CATALOG.filter((t) => t.category === "wiki").length).toBeGreaterThanOrEqual(100);
    expect(CATALOG.filter((t) => t.category === "wikisource").length).toBeGreaterThanOrEqual(10);
    expect(CATALOG.filter((t) => t.seriesId && (t.chapter ?? 0) >= 2).length).toBeGreaterThanOrEqual(3);
    for (const cat of NEED) {
      expect(CATALOG.filter((t) => t.category === cat).length).toBeGreaterThanOrEqual(4);
    }
  });

  it("adds a band of original unread-length shorts", () => {
    const band = CATALOG.filter((t) => t.id.startsWith("band-"));
    expect(band.length).toBeGreaterThanOrEqual(18);
    expect(band.every((t) => t.kind === "sample")).toBe(true);
    expect(band.every((t) => ["children", "graded", "story"].includes(t.category))).toBe(true);
    expect(band.every((t) => t.body.trim().length > 0 && t.blurb.length > 0)).toBe(true);
    const titles = new Set(["坐火车", "河边的灯", "一只袜子"]);
    expect(band.some((t) => titles.has(t.title))).toBe(false);
    for (const text of band) {
      const han = (text.body.match(/[\u3400-\u9fff]/g) || []).length;
      expect(han).toBeGreaterThanOrEqual(80);
      expect(han).toBeLessThanOrEqual(220);
    }
  });

  it("uses unique ids and cites PD only when a source is set", () => {
    const ids = CATALOG.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    const cited = CATALOG.filter((t) => t.source && t.category !== "wiki");
    expect(cited.length).toBeGreaterThan(0);
    expect(
      cited.every(
        (t) =>
          /public domain/i.test(t.source || "") || /CC BY-SA/i.test(t.source || ""),
      ),
    ).toBe(true);
    expect(CATALOG.filter((t) => t.category === "wiki").every((t) => t.source?.includes("CC BY-SA"))).toBe(
      true,
    );
  });
});
