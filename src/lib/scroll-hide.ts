/**
 * Hide-on-scroll for the reader's bottom word sheet.
 *
 * Reading forward (scrolling down) past a small threshold hides the sheet;
 * scrolling back up past the same threshold brings it back. Travel only counts
 * in one direction at a time, so jitter and tiny corrections never flip it.
 *
 * Positions are clamped to the real scroll range, so iOS rubber-banding
 * (negative scrollY at the top, overshoot at the bottom) and momentum bounce
 * never register as a direction change.
 */

export const SCROLL_HIDE_THRESHOLD = 32;

/** Mobile widths or touch-first devices (phones, tablets). Not mouse desktops. */
export const SCROLL_HIDE_MEDIA = "(max-width: 720px), (hover: none) and (pointer: coarse)";

export type ScrollHideState = {
  /** Last clamped scroll position. */
  lastY: number;
  /** Signed distance travelled in the current direction (+ down, − up). */
  travel: number;
  hidden: boolean;
};

export type ScrollHideOptions = {
  threshold?: number;
  /** Bring the sheet back after scrolling up past the threshold. */
  revealOnUp?: boolean;
};

function clampY(y: number, maxY: number): number {
  if (!Number.isFinite(y)) return 0;
  return Math.min(Math.max(0, y), Math.max(0, maxY));
}

export function initialScrollHide(y: number, maxY = Number.POSITIVE_INFINITY): ScrollHideState {
  return { lastY: clampY(y, maxY), travel: 0, hidden: false };
}

/**
 * Re-anchor without changing visibility: after a programmatic scroll (bookmark
 * restore), a viewport resize (iOS address bar), or a word tap.
 */
export function rebaseScrollHide(
  state: ScrollHideState,
  y: number,
  maxY = Number.POSITIVE_INFINITY,
): ScrollHideState {
  return { ...state, lastY: clampY(y, maxY), travel: 0 };
}

export function stepScrollHide(
  state: ScrollHideState,
  rawY: number,
  maxY: number,
  options: ScrollHideOptions = {},
): ScrollHideState {
  const threshold = options.threshold ?? SCROLL_HIDE_THRESHOLD;
  const revealOnUp = options.revealOnUp ?? true;
  const y = clampY(rawY, maxY);
  const delta = y - state.lastY;
  if (delta === 0) return state;
  const sameDirection = state.travel === 0 || delta > 0 === state.travel > 0;
  const travel = sameDirection ? state.travel + delta : delta;
  let hidden = state.hidden;
  if (travel >= threshold) hidden = true;
  else if (revealOnUp && travel <= -threshold) hidden = false;
  return { lastY: y, travel, hidden };
}
