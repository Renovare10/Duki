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
 * Word card fold (Chad, Nov 25): any deliberate downward scroll, swipe or wheel while the card is
 * up slides it all the way off (never stuck half way), anywhere in the story, including at the
 * end where there is nothing left to scroll. Never from the gesture that opened it: a touch must
 * start after the reveal; scroll and wheel wait out a short grace period after it.
 */
/** Downward travel (px) that counts as deliberate; tap jitter stays below it. */
export const DOWN_DISMISS_PX = 8;
export const REVEAL_GRACE_MS = 350;

export function shouldDismissOnDown(g: {
  latched: boolean;
  /** performance.now() of the gesture start (touch) or of this event (scroll/wheel), and of the last reveal. */
  startedAt: number;
  revealedAt: number;
  /** Content-direction travel: + = scrolling further down. */
  travel: number;
  kind: "touch" | "scroll" | "wheel";
}): boolean {
  if (g.latched) return false;
  if (g.kind === "touch") return g.startedAt > g.revealedAt && g.travel > DOWN_DISMISS_PX;
  if (g.startedAt - g.revealedAt <= REVEAL_GRACE_MS) return false;
  return g.kind === "wheel" ? g.travel > 0 : g.travel > DOWN_DISMISS_PX;
}
