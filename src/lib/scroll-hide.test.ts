import { describe, expect, it } from "vitest";
import {
  initialScrollHide,
  rebaseScrollHide,
  SCROLL_HIDE_THRESHOLD,
  stepScrollHide,
  type ScrollHideState,
} from "./scroll-hide";

const MAX = 5000;

function run(start: number, ys: number[], maxY = MAX, opts = {}): ScrollHideState {
  let s = initialScrollHide(start, maxY);
  for (const y of ys) s = stepScrollHide(s, y, maxY, opts);
  return s;
}

describe("stepScrollHide", () => {
  it("uses a ~32px threshold", () => {
    expect(SCROLL_HIDE_THRESHOLD).toBeGreaterThanOrEqual(24);
    expect(SCROLL_HIDE_THRESHOLD).toBeLessThanOrEqual(40);
  });

  it("hides after cumulative downward travel reaches the threshold", () => {
    expect(run(100, [110, 120, 130]).hidden).toBe(false); // 30px
    expect(run(100, [110, 120, 132]).hidden).toBe(true); // 32px
    expect(run(100, [200]).hidden).toBe(true); // one big fling
  });

  it("ignores jitter: direction changes restart the count", () => {
    const s = run(100, [120, 110, 130, 115, 135, 120, 140]);
    expect(s.hidden).toBe(false);
  });

  it("scrolling up never hides", () => {
    expect(run(1000, [990, 950, 900, 600, 100]).hidden).toBe(false);
  });

  it("scrolling up past the threshold reveals again; small nudges don't", () => {
    const hidden = run(100, [300]);
    expect(hidden.hidden).toBe(true);
    expect(stepScrollHide(hidden, 280, MAX).hidden).toBe(true); // 20px up
    expect(stepScrollHide(stepScrollHide(hidden, 280, MAX), 260, MAX).hidden).toBe(false); // 40px up
  });

  it("can keep it hidden on the way up when revealOnUp is off", () => {
    expect(run(100, [300, 0], MAX, { revealOnUp: false }).hidden).toBe(true);
  });

  it("treats iOS rubber-banding at the top as no movement", () => {
    // Pulled past the top (negative scrollY) and bounced back to 0.
    const s = run(0, [-40, -80, -20, 0]);
    expect(s.hidden).toBe(false);
    expect(s.lastY).toBe(0);
  });

  it("treats overshoot past the bottom as no movement, so the bounce doesn't reveal", () => {
    const atBottom = run(4800, [MAX]); // hidden reaching the end
    expect(atBottom.hidden).toBe(true);
    const bounced = [MAX + 60, MAX + 90, MAX + 30, MAX].reduce(
      (s, y) => stepScrollHide(s, y, MAX),
      atBottom,
    );
    expect(bounced.hidden).toBe(true);
    expect(bounced.lastY).toBe(MAX);
  });

  it("rebase anchors a programmatic jump without hiding", () => {
    let s = initialScrollHide(0, MAX);
    s = rebaseScrollHide(s, 2400, MAX); // bookmark restore / viewport resize
    expect(stepScrollHide(s, 2400, MAX).hidden).toBe(false);
    expect(stepScrollHide(s, 2410, MAX).hidden).toBe(false);
  });

  it("rebase keeps visibility and clears partial travel", () => {
    let s = run(100, [125]); // 25px pending
    s = rebaseScrollHide(s, 125, MAX);
    expect(s.travel).toBe(0);
    expect(stepScrollHide(s, 140, MAX).hidden).toBe(false); // only 15px since rebase
    expect(rebaseScrollHide(run(0, [500]), 500, MAX).hidden).toBe(true);
  });

  it("is a no-op for an unchanged position and survives NaN", () => {
    const s = run(100, [300]);
    expect(stepScrollHide(s, 300, MAX)).toBe(s);
    expect(initialScrollHide(Number.NaN).lastY).toBe(0);
  });
});
