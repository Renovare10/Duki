import { describe, expect, it } from "vitest";
import { wordTint } from "./tint";
import { applyReadingTap, normalizeWord } from "./word";

describe("wordTint", () => {
  it("is new (blue) when the word has never been graded", () => {
    expect(wordTint(undefined)).toBe("new");
    expect(wordTint(normalizeWord({ hanzi: "我", status: "unknown" }))).toBe("new");
  });

  it("turns unknown (red) as soon as Don’t know is tapped", () => {
    const next = applyReadingTap(undefined, "喜欢", "unknown", 1);
    expect(next.dontKnowCount).toBe(1);
    expect(wordTint(next)).toBe("unknown");
  });

  it("maps Barely to shaky and Okay to known", () => {
    expect(wordTint(applyReadingTap(undefined, "茶", "shaky", 1))).toBe("shaky");
    expect(wordTint(applyReadingTap(undefined, "好", "known", 1))).toBe("known");
  });
});
