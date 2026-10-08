import { describe, expect, it } from "vitest";
import { markKey, surfaceFor } from "./script";

describe("classic script", () => {
  it("keeps an existing traditional record and stores new marks in simplified", () => {
    const hasTrad = (key: string) => key === "學";
    expect(markKey("学", "學", hasTrad)).toBe("學");
    expect(markKey("学", "學", () => false)).toBe("学");
    expect(markKey("学", "学", (key) => key === "学")).toBe("学");
  });

  it("shows the traditional glyphs on the same spans", () => {
    expect(surfaceFor("学而", 0, "學而時習", "traditional")).toBe("學而");
    expect(surfaceFor("学而", 0, "學而時習", "simplified")).toBe("学而");
    expect(surfaceFor("时习", 2, "學而時習", "traditional")).toBe("時習");
  });
});
