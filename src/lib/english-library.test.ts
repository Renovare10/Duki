import { expect, it } from "vitest";
import { EN_SAMPLES } from "../data/en-samples";
import type { LibraryText } from "../types";
import { describeText, lengthLabel } from "./library";

it("ships no English story content in the toggle skeleton", () => {
  expect(EN_SAMPLES).toEqual([]);
});

it("labels English text length in words instead of zero Han characters", () => {
  const fixture = { id: "en-fixture", lang: "en", title: "t", blurb: "", body: "one two three", createdAt: 1, readAt: null, bookmark: null } as LibraryText;
  expect(lengthLabel(describeText(fixture))).toBe("3 words");
});
