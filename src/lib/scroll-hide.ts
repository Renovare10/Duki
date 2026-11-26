/**
 * Scroll-linked hide for the reader's bottom word sheet (mobile/touch).
 *
 * The sheet is pushed down 1:1 with downward scrolling, so it rides off the
 * bottom with the content. While it's only partly down it follows the scroll
 * back up (still finger-driven). Once it's fully off screen it latches hidden:
 * no amount of scrolling brings it back, only a word tap (reveal).
 *
 * Positions are clamped to the real scroll range so iOS rubber-banding
 * (negative scrollY at the top, overshoot at the bottom) is never movement.
 */

/** Mobile widths or touch-first devices (phones, tablets). Not mouse desktops. */
export const SCROLL_HIDE_MEDIA = "(max-width: 720px), (hover: none) and (pointer: coarse)";

/** Extra travel past the sheet's height so its drop shadow clears the screen too. */
export const SHEET_SHADOW_ALLOWANCE = 24;
const MIN_SHEET_HEIGHT = 48;

export type SheetScrollState = {
  /** Last clamped scroll position. */
  lastY: number;
  /** How far the sheet is pushed down, 0 (in place) … distance (gone). */
  offset: number;
  /** Fully hidden; stays hidden until reveal(). */
  latched: boolean;
};

function clampY(y: number, maxY: number): number {
  if (!Number.isFinite(y)) return 0;
  return Math.min(Math.max(0, y), Math.max(0, maxY));
}

/** Scroll distance that takes the sheet fully off screen: its own height (+ shadow). */
export function sheetHideDistance(sheetHeight: number): number {
  const h = Number.isFinite(sheetHeight) ? sheetHeight : 0;
  return Math.round(Math.max(MIN_SHEET_HEIGHT, h)) + SHEET_SHADOW_ALLOWANCE;
}

export function initialSheetScroll(y: number, maxY = Number.POSITIVE_INFINITY): SheetScrollState {
  return { lastY: clampY(y, maxY), offset: 0, latched: false };
}

/**
 * Re-anchor without moving the sheet: after a programmatic scroll (bookmark
 * restore) or a viewport resize (iOS address bar).
 */
export function rebaseSheetScroll(
  state: SheetScrollState,
  y: number,
  maxY = Number.POSITIVE_INFINITY,
): SheetScrollState {
  return { ...state, lastY: clampY(y, maxY) };
}

/** Word tap: back in place, unlatched, anchored at the current position. */
export function revealSheetScroll(y: number, maxY = Number.POSITIVE_INFINITY): SheetScrollState {
  return initialSheetScroll(y, maxY);
}

export function stepSheetScroll(
  state: SheetScrollState,
  rawY: number,
  maxY: number,
  distance: number,
): SheetScrollState {
  const y = clampY(rawY, maxY);
  if (state.latched) {
    return y === state.lastY && state.offset === distance
      ? state
      : { lastY: y, offset: distance, latched: true };
  }
  const delta = y - state.lastY;
  if (delta === 0 && state.offset <= distance) return state;
  const offset = Math.min(distance, Math.max(0, state.offset + delta));
  return { lastY: y, offset, latched: offset >= distance };
}

/**
 * At the end of a story there is no scroll left, so the 1:1 push-down above never moves the
 * sheet. A downward swipe (finger moving up), wheel or overscroll attempt there dismisses it
 * instead. Never from the gesture that opened it: the touch must start after the reveal (a
 * wheel waits out a short grace period), and it must start at the end, so mid-story is unchanged.
 */
export const END_SWIPE_PX = 24;
export const END_WHEEL_GRACE_MS = 350;
/** Within this many px of the bottom counts as "at the end" (subpixel scroll positions). */
export const AT_END_SLACK_PX = 2;

export function atScrollEnd(y: number, maxY: number): boolean {
  return y >= Math.max(0, maxY) - AT_END_SLACK_PX;
}

export function shouldDismissAtEnd(g: {
  latched: boolean;
  /** At the end when the gesture started, and still at the end now. */
  startedAtEnd: boolean;
  atEndNow: boolean;
  /** performance.now() of the gesture start and of the last reveal (word tap). */
  startedAt: number;
  revealedAt: number;
  /** Content-direction travel: + = trying to scroll further down. */
  travel: number;
  kind: "touch" | "wheel";
}): boolean {
  if (g.latched || !g.startedAtEnd || !g.atEndNow) return false;
  if (g.kind === "touch") return g.startedAt > g.revealedAt && g.travel > END_SWIPE_PX;
  return g.travel > 0 && g.startedAt - g.revealedAt > END_WHEEL_GRACE_MS;
}
