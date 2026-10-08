import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  initialSheetScroll,
  rebaseSheetScroll,
  revealSheetScroll,
  sheetHideDistance,
  stepSheetScroll,
  type SheetScrollState,
} from "../lib/scroll-hide";

const REVEAL_MS = 200;

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
  el.style.transform = offset > 0 ? `translate(-50%, ${offset}px)` : "";
}

/**
 * Scroll-linked sheet: writes the sheet's transform straight from the window
 * scroll handler (no React render per scroll event, no CSS transition while
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

  useEffect(() => {
    const el = sheetRef.current;
    setLatched(false);
    if (el) {
      el.style.transition = "";
      writeOffset(el, 0);
    }
    if (!enabled || !el) return;

    let distance = sheetHideDistance(el.offsetHeight);
    stateRef.current = initialSheetScroll(window.scrollY, maxScrollY());

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
      stateRef.current = rebaseSheetScroll(stateRef.current, window.scrollY, maxScrollY());
    });

    const onScroll = () => {
      if (settle) return;
      apply(stepSheetScroll(stateRef.current, window.scrollY, maxScrollY(), distance));
    };
    // iOS address bar show/hide resizes the viewport; never treat that as scrolling.
    const onResize = () => {
      stateRef.current = rebaseSheetScroll(stateRef.current, window.scrollY, maxScrollY());
    };
    // Sheet height changes (hint vs. word, font, rotation) change the hide distance.
    const ro =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(() => {
            distance = sheetHideDistance(el.offsetHeight);
            const s = stateRef.current;
            if (s.latched) apply({ ...s, offset: distance });
            else if (s.offset > distance) apply({ ...s, offset: distance, latched: true });
          })
        : null;
    ro?.observe(el);

    const vv = window.visualViewport;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    vv?.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      vv?.removeEventListener("resize", onResize);
      ro?.disconnect();
      if (settle) window.cancelAnimationFrame(settle);
      window.clearTimeout(revealTimer.current);
      el.style.transition = "";
      writeOffset(el, 0);
    };
  }, [enabled, resetKey, sheetRef]);

  const reveal = useCallback(() => {
    const el = sheetRef.current;
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
