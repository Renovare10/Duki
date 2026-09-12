import { describe, expect, it } from "vitest";
import { cardHitAction } from "./card-hit";

describe("cardHitAction", () => {
  it("opens the reader from cover, title, blurb, and Read", () => {
    expect(cardHitAction("cover")).toBe("open");
    expect(cardHitAction("title")).toBe("open");
    expect(cardHitAction("blurb")).toBe("open");
    expect(cardHitAction("read")).toBe("open");
  });

  it("scores from the Unscored badge and the Score button only", () => {
    expect(cardHitAction("unscored")).toBe("score");
    expect(cardHitAction("score")).toBe("score");
  });

  it("keeps mark and remove on their own buttons", () => {
    expect(cardHitAction("mark")).toBe("mark");
    expect(cardHitAction("remove")).toBe("delete");
  });
});
