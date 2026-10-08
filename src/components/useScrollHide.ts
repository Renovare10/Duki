import { useCallback, useEffect, useRef, useState } from "react";
import {
  initialScrollHide,
  rebaseScrollHide,
  SCROLL_HIDE_THRESHOLD,
  stepScrollHide,
  type ScrollHideState,
} from "../lib/scroll-hide";

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

/**
 * Window-scroll direction tracking for the reader sheet. Returns whether the
 * sheet should be tucked away, and `reveal()` for word taps.
 * `resetKey` re-anchors (e.g. a new text whose bookmark restore just scrolled).
 */
export function useScrollHide({
  media,
  resetKey,
  threshold = SCROLL_HIDE_THRESHOLD,
}: {
  media: string;
  resetKey: unknown;
  threshold?: number;
}): { hidden: boolean; reveal: () => void } {
  const enabled = useMediaQuery(media);
  const [hidden, setHidden] = useState(false);
  const stateRef = useRef<ScrollHideState>(initialScrollHide(0));

  useEffect(() => {
    setHidden(false);
    if (!enabled) return;
    stateRef.current = initialScrollHide(window.scrollY, maxScrollY());
    let frame = 0;
    // Re-anchor once more after any pending programmatic scroll (bookmark
    // restore) has dispatched; this rAF is queued before the scroll handler's.
    let settle = window.requestAnimationFrame(() => {
      settle = 0;
      stateRef.current = rebaseScrollHide(stateRef.current, window.scrollY, maxScrollY());
    });
    const onScroll = () => {
      if (frame || settle) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const next = stepScrollHide(stateRef.current, window.scrollY, maxScrollY(), { threshold });
        stateRef.current = next;
        setHidden(next.hidden);
      });
    };
    // iOS address bar show/hide resizes the viewport; never treat that as scrolling.
    const onResize = () => {
      stateRef.current = rebaseScrollHide(stateRef.current, window.scrollY, maxScrollY());
    };
    const vv = window.visualViewport;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    vv?.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      vv?.removeEventListener("resize", onResize);
      if (frame) window.cancelAnimationFrame(frame);
      if (settle) window.cancelAnimationFrame(settle);
    };
  }, [enabled, resetKey, threshold]);

  const reveal = useCallback(() => {
    stateRef.current = {
      ...rebaseScrollHide(stateRef.current, window.scrollY, maxScrollY()),
      hidden: false,
    };
    setHidden(false);
  }, []);

  return { hidden: enabled && hidden, reveal };
}
