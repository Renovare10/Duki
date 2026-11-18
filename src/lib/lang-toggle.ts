import type { Language } from "../types";

/**
 * The reading-language switch inside the account menu: a segmented control
 * (English | 中文) with a sliding highlight. choose() runs the app's existing
 * language switch, so the choice is saved exactly as before.
 */

function reducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** How long the highlight slides before the app switches language (the menu re-renders then). */
export const SLIDE_MS = 220;

const OPTIONS: [Language, string][] = [["en", "English"], ["zh", "中文"]];

export function buildLangToggle(lang: Language, choose: (next: Language) => void): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "lang-toggle-item";
  const caption = document.createElement("span");
  caption.className = "lt-caption";
  caption.textContent = "Reading language";
  wrap.append(caption);

  const group = document.createElement("div");
  group.className = "lt-seg";
  group.setAttribute("role", "radiogroup");
  group.setAttribute("aria-label", "Reading language");
  const thumb = document.createElement("span");
  thumb.className = "lt-thumb";
  thumb.setAttribute("aria-hidden", "true");
  group.append(thumb);

  let current = lang;
  let busy = false;
  const buttons = OPTIONS.map(([value, label]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "lt-opt";
    b.setAttribute("role", "radio");
    b.lang = value;
    b.dataset.value = value;
    b.textContent = label;
    b.addEventListener("click", () => set(value));
    group.append(b);
    return b;
  });
  const sync = () => {
    wrap.dataset.lang = current;
    for (const b of buttons) {
      const on = b.dataset.value === current;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;
    }
  };
  function set(next: Language) {
    if (busy || next === current) return;
    busy = true;
    current = next;
    sync();
    window.setTimeout(() => choose(next), reducedMotion() ? 0 : SLIDE_MS);
  }
  group.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = current === "zh" ? "en" : "zh";
    set(next);
    buttons.find((b) => b.dataset.value === next)?.focus();
  });
  wrap.append(group);
  sync();
  return wrap;
}
