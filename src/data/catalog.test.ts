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
