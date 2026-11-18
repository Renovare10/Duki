import { describe, expect, it } from "vitest";
import { toggleLook } from "./lang-toggle";

// The toggle's DOM behaviour (all three looks) is exercised in a real browser by App.test.ts.
describe("reading-language toggle looks", () => {
  it("reads ?toggle=a|b|c and defaults to a", () => {
    expect(toggleLook("")).toBe("a");
    expect(toggleLook("?toggle=b")).toBe("b");
    expect(toggleLook("?toggle=C")).toBe("c");
    expect(toggleLook("?toggle=z")).toBe("a");
  });
});
