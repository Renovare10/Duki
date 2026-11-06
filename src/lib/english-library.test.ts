import { expect, it } from "vitest";
import { EN_SAMPLES } from "../data/en-samples";
import { describeText, lengthLabel } from "./library";
import { segment } from "./segment";

it("labels English sample length in words instead of zero Han characters", () => {
  for (const sample of EN_SAMPLES) {
    const count = segment(sample.body, () => false, 8, "en").filter((t) => t.isWord).length;
    expect(count).toBeGreaterThan(0);
    expect(lengthLabel(describeText(sample))).toBe(`${count} words`);
  }
});
