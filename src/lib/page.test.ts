import { describe, expect, it } from "vitest";
import { documentTitle, themeColor } from "./page";

describe("documentTitle", () => {
  it("keeps the library name when no story is open", () => {
    expect(documentTitle(null)).toBe("Duki — Mandarin reading");
    expect(documentTitle("  ")).toBe("Duki — Mandarin reading");
  });

  it("puts the open story first", () => {
    expect(documentTitle("南风镇")).toBe("南风镇 — Duki");
  });
});

describe("themeColor", () => {
  it("matches the paper and night page colors", () => {
    expect(themeColor("paper")).toBe("#f4eadc");
    expect(themeColor("night")).toBe("#16120e");
    expect(themeColor(undefined)).toBe("#f4eadc");
  });
});
