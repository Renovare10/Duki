import { describe, expect, it } from "vitest";
import {
  initialSheetScroll,
  rebaseSheetScroll,
  revealSheetScroll,
  SHEET_SHADOW_ALLOWANCE,
  sheetHideDistance,
  stepSheetScroll,
  type SheetScrollState,
} from "./scroll-hide";

const MAX = 5000;
const D = 200; // hide distance used in most cases

function run(start: number, ys: number[], distance = D, maxY = MAX): SheetScrollState {
  let s = initialSheetScroll(start, maxY);
  for (const y of ys) s = stepSheetScroll(s, y, maxY, distance);
  return s;
}

describe("sheetHideDistance", () => {
  it("is the sheet's own height plus room for its shadow", () => {
    expect(sheetHideDistance(182)).toBe(182 + SHEET_SHADOW_ALLOWANCE);
    expect(sheetHideDistance(69.6)).toBe(70 + SHEET_SHADOW_ALLOWANCE);
  });

  it("never collapses to nothing", () => {
    expect(sheetHideDistance(0)).toBe(48 + SHEET_SHADOW_ALLOWANCE);
    expect(sheetHideDistance(Number.NaN)).toBe(48 + SHEET_SHADOW_ALLOWANCE);
  });
});

describe("stepSheetScroll", () => {
  it("pushes the sheet down 1:1 with downward scroll", () => {
    expect(run(100, [130]).offset).toBe(30);
    expect(run(100, [110, 125, 160]).offset).toBe(60);
    expect(run(100, [130]).latched).toBe(false);
  });

  it("follows back up while only partly hidden", () => {
    const s = run(100, [220, 170]);
    expect(s.offset).toBe(70);
    expect(s.latched).toBe(false);
    expect(run(100, [220, 50]).offset).toBe(0); // can't go above its resting place
  });

  it("scrolling up from rest does nothing", () => {
    const s = run(1000, [900, 400]);
    expect(s.offset).toBe(0);
    expect(s.latched).toBe(false);
  });

  it("latches once fully off and stays hidden through any scrolling up", () => {
    const gone = run(100, [250, 300]);
    expect(gone.offset).toBe(D);
    expect(gone.latched).toBe(true);
    const after = [250, 100, 0, 600, 0].reduce((s, y) => stepSheetScroll(s, y, MAX, D), gone);
    expect(after.latched).toBe(true);
    expect(after.offset).toBe(D);
    expect(after.lastY).toBe(0);
  });

  it("a single fling past the distance clamps and latches", () => {
    const s = run(0, [900]);
    expect(s).toEqual({ lastY: 900, offset: D, latched: true });
  });

  it("treats iOS rubber-banding at the top as no movement", () => {
    const s = run(0, [-40, -80, -20, 0]);
    expect(s.offset).toBe(0);
    expect(s.lastY).toBe(0);
  });

  it("treats overshoot past the bottom as no movement", () => {
    const partial = run(MAX - 50, [MAX]); // 50px down at the very end
    const bounced = [MAX + 60, MAX + 90, MAX + 30, MAX].reduce(
      (s, y) => stepSheetScroll(s, y, MAX, D),
      partial,
    );
    expect(bounced.offset).toBe(50);
    expect(bounced.lastY).toBe(MAX);
  });

  it("clamps to a smaller distance when the sheet shrinks", () => {
    const s = run(0, [150]); // 150 of 200
    const shrunk = stepSheetScroll(s, 160, MAX, 100);
    expect(shrunk.offset).toBe(100);
    expect(shrunk.latched).toBe(true);
  });

  it("is a no-op for an unchanged position and survives NaN", () => {
    const s = run(100, [150]);
    expect(stepSheetScroll(s, 150, MAX, D)).toBe(s);
    expect(initialSheetScroll(Number.NaN).lastY).toBe(0);
  });
});

describe("rebase and reveal", () => {
  it("rebase anchors a programmatic jump without moving the sheet", () => {
    let s = initialSheetScroll(0, MAX);
    s = rebaseSheetScroll(s, 2400, MAX); // bookmark restore / address-bar resize
    expect(stepSheetScroll(s, 2400, MAX, D).offset).toBe(0);
    expect(stepSheetScroll(s, 2410, MAX, D).offset).toBe(10);
  });

  it("rebase keeps a partial offset and the latch", () => {
    expect(rebaseSheetScroll(run(0, [60]), 900, MAX).offset).toBe(60);
    expect(rebaseSheetScroll(run(0, [900]), 100, MAX).latched).toBe(true);
  });

  it("reveal puts it back in place and tracking starts fresh from there", () => {
    const shown = revealSheetScroll(1200, MAX);
    expect(shown).toEqual({ lastY: 1200, offset: 0, latched: false });
    expect(stepSheetScroll(shown, 1230, MAX, D).offset).toBe(30);
  });
});
