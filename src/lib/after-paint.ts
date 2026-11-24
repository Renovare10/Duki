/**
 * Run `fn` after the browser has painted the current frame: the next animation frame, then a
 * macrotask (so it's after that frame's paint). Falls back to a timer when frames are paused
 * (hidden tab). Runs exactly once.
 */
export function afterPaint(fn: () => void, fallbackMs = 120): void {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    fn();
  };
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(() => setTimeout(run, 0));
  }
  setTimeout(run, fallbackMs);
}
