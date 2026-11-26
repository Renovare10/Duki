import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  atScrollEnd,
  initialSheetScroll,
  shouldDismissAtEnd,
  rebaseSheetScroll,
  revealSheetScroll,
  sheetHideDistance,
  stepSheetScroll,
  type SheetScrollState,
} from "../lib/scroll-hide";

const REVEAL_MS = 200;
const DISMISS_MS = 200;

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window.matchMedia === "function" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

function maxScrollY(): number {
  return document.documentElement.scrollHeight - window.innerHeight;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** The sheet is centred with translateX(-50%); add the scroll-driven drop. */
function writeOffset(el: HTMLElement, offset: number) {
  el.style.transform = `translate3d(-50%, ${offset}px, 0)`;
}

/**
 * Scroll-linked sheet: coalesces scroll events into one transform write per
 * animation frame (no React render per scroll event, no CSS transition while
 * tracking). React only hears about it when the sheet latches fully hidden.
 * `resetKey` re-anchors and shows it again (e.g. a new text whose bookmark
 * restore just scrolled the page).
 */
export function useScrollHide({
  media,
  resetKey,
  sheetRef,
}: {
  media: string;
  resetKey: unknown;
  sheetRef: RefObject<HTMLElement | null>;
}): { hidden: boolean; reveal: () => void } {
  const enabled = useMediaQuery(media);
  const [latched, setLatched] = useState(false);
  const stateRef = useRef<SheetScrollState>(initialSheetScroll(0));
  const revealTimer = useRef(0);
  const frameRef = useRef(0);
  /** performance.now() of the last reveal (word tap); gestures that began before it are ignored. */
  const revealedAtRef = useRef(0);
  const dismissTimer = useRef(0);

  useEffect(() => {
    const el = sheetRef.current;
    setLatched(false);
    if (el) {
      el.style.transition = "";
      writeOffset(el, 0);
    }
    if (!enabled || !el) return;

    let distance = sheetHideDistance(el.offsetHeight);
    let maxY = maxScrollY();
    stateRef.current = initialSheetScroll(window.scrollY, maxY);

    const apply = (next: SheetScrollState) => {
      const prev = stateRef.current;
      stateRef.current = next;
      if (next.offset !== prev.offset || next.latched !== prev.latched) {
        if (el.style.transition) el.style.transition = ""; // tracking overrides a reveal in flight
        writeOffset(el, next.offset);
      }
      if (next.latched !== prev.latched) setLatched(next.latched);
    };

    // Re-anchor after any pending programmatic scroll (bookmark restore) has
    // dispatched, so it isn't read as the reader scrolling.
    let settle = window.requestAnimationFrame(() => {
      settle = 0;
      stateRef.current = rebaseSheetScroll(stateRef.current, window.scrollY, maxY);
    });

    const onScroll = () => {
      if (settle || frameRef.current) return;
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = 0;
        apply(stepSheetScroll(stateRef.current, window.scrollY, maxY, distance));
      });
    };
    // iOS address bar show/hide resizes the viewport; never treat that as scrolling.
    const onResize = () => {
      maxY = maxScrollY();
      stateRef.current = rebaseSheetScroll(stateRef.current, window.scrollY, maxY);
    };
    // Sheet height changes (hint vs. word, font, rotation) change the hide distance.
    const ro =
      typeof ResizeObserver === "function"
        ? new ResizeObserver((entries) => {
            // Geometry is read on size changes, never in the scroll hot path.
            maxY = maxScrollY();
            if (!entries.some((entry) => entry.target === el)) return;
            distance = sheetHideDistance(el.offsetHeight);
            const s = stateRef.current;
            if (s.latched) apply({ ...s, offset: distance });
            else if (s.offset > distance) apply({ ...s, offset: distance, latched: true });
          })
        : null;
    ro?.observe(el);
    ro?.observe(document.body);

    // End of story: nothing left to scroll, so slide the sheet away on a downward swipe/wheel.
    const dismissAtEnd = () => {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      window.clearTimeout(revealTimer.current);
      const prev = stateRef.current;
      stateRef.current = { lastY: Math.min(Math.max(0, window.scrollY), Math.max(0, maxY)), offset: distance, latched: true };
      const motion = !prefersReducedMotion();
      el.style.transition = motion ? `transform ${DISMISS_MS}ms cubic-bezier(0.4, 0, 1, 1)` : "";
      if (prev.offset !== distance) writeOffset(el, distance);
      // Latch (visibility: hidden) only once the slide has played, so it is seen leaving.
      window.clearTimeout(dismissTimer.current);
      dismissTimer.current = window.setTimeout(() => {
        el.style.transition = "";
        if (stateRef.current.latched) setLatched(true);
      }, motion ? DISMISS_MS : 0);
    };
    let touch: { y: number; at: number; atEnd: boolean } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touch = e.touches.length === 1
        ? { y: e.touches[0].clientY, at: performance.now(), atEnd: atScrollEnd(window.scrollY, maxY) }
        : null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!touch || e.touches.length !== 1) return;
      if (shouldDismissAtEnd({
        latched: stateRef.current.latched,
        startedAtEnd: touch.atEnd,
        atEndNow: atScrollEnd(window.scrollY, maxY),
        startedAt: touch.at,
        revealedAt: revealedAtRef.current,
        travel: touch.y - e.touches[0].clientY,
        kind: "touch",
      })) {
        touch = null;
        dismissAtEnd();
      }
    };
    const onTouchEnd = () => {
      touch = null;
    };
    const onWheel = (e: WheelEvent) => {
      const atEnd = atScrollEnd(window.scrollY, maxY);
      if (shouldDismissAtEnd({
        latched: stateRef.current.latched,
        startedAtEnd: atEnd,
        atEndNow: atEnd,
        startedAt: performance.now(),
        revealedAt: revealedAtRef.current,
        travel: e.deltaY,
        kind: "wheel",
      })) dismissAtEnd();
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });

    const vv = window.visualViewport;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    vv?.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("wheel", onWheel);
      window.clearTimeout(dismissTimer.current);
      window.removeEventListener("resize", onResize);
      vv?.removeEventListener("resize", onResize);
      ro?.disconnect();
      if (settle) window.cancelAnimationFrame(settle);
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      window.clearTimeout(revealTimer.current);
      el.style.transition = "";
      writeOffset(el, 0);
    };
  }, [enabled, resetKey, sheetRef]);

  const reveal = useCallback(() => {
    window.cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
    const el = sheetRef.current;
    revealedAtRef.current = performance.now();
    window.clearTimeout(dismissTimer.current);
    const wasDown = stateRef.current.offset > 0;
    stateRef.current = revealSheetScroll(window.scrollY, maxScrollY());
    setLatched(false);
    if (!el) return;
    window.clearTimeout(revealTimer.current);
    if (wasDown && !prefersReducedMotion()) {
      el.style.transition = `transform ${REVEAL_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1)`;
      revealTimer.current = window.setTimeout(() => {
        el.style.transition = "";
      }, REVEAL_MS + 50);
    } else {
      el.style.transition = "";
    }
    writeOffset(el, 0);
  }, [sheetRef]);

  return { hidden: enabled && latched, reveal };
}
