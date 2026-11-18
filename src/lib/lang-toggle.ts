import type { Language } from "../types";

/**
 * The reading-language switch inside the account menu. Three looks are on trial
 * (preview: ?toggle=a|b|c, default a); all share the same markup contract and the
 * same choose() callback, so the language is still saved exactly as before.
 */
export type ToggleLook = "a" | "b" | "c";

export function toggleLook(search: string = typeof location === "undefined" ? "" : location.search): ToggleLook {
  const v = new URLSearchParams(search).get("toggle")?.toLowerCase();
  return v === "b" || v === "c" ? v : "a";
}

function reducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** How long the slide plays before the app switches language (the menu re-renders then). */
export const SLIDE_MS = 220;

export function buildLangToggle(look: ToggleLook, lang: Language, choose: (next: Language) => void): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = `lang-toggle-item lt-${look}`;
  const caption = document.createElement("span");
  caption.className = "lt-caption";
  caption.textContent = "Reading language";
  wrap.append(caption);

  let current = lang;
  let busy = false;
  const set = (next: Language) => {
    if (busy || next === current) return;
    busy = true;
    current = next;
    sync();
    window.setTimeout(() => choose(next), reducedMotion() ? 0 : SLIDE_MS);
  };

  let sync: () => void;
  if (look === "a") {
    // iOS-style switch: EN on the left, 中文 on the right; the knob sits on the active side.
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lt-switch";
    btn.setAttribute("role", "switch");
    btn.setAttribute("aria-label", "Read in Mandarin (中文)");
    btn.innerHTML = `<span class="lt-side lt-en" lang="en">EN</span><span class="lt-track" aria-hidden="true"><span class="lt-knob"></span></span><span class="lt-side lt-zh" lang="zh">中文</span>`;
    btn.addEventListener("click", () => set(current === "zh" ? "en" : "zh"));
    wrap.append(btn);
    sync = () => {
      btn.setAttribute("aria-checked", String(current === "zh"));
      wrap.dataset.lang = current;
    };
  } else {
    // B: segmented control with a sliding highlight. C: track with both labels and a round
    // knob that slides across carrying the active glyph (中 / EN).
    const group = document.createElement("div");
    group.className = look === "b" ? "lt-seg" : "lt-glide";
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", "Reading language");
    const thumb = document.createElement("span");
    thumb.className = "lt-thumb";
    thumb.setAttribute("aria-hidden", "true");
    if (look === "c") thumb.innerHTML = `<span class="lt-glyph lt-glyph-zh" lang="zh">中</span><span class="lt-glyph lt-glyph-en" lang="en">EN</span>`;
    group.append(thumb);
    const options: [Language, string, string][] = look === "b"
      ? [["en", "English", "en"], ["zh", "中文", "zh"]]
      : [["zh", "中文 Mandarin", "zh"], ["en", "English", "en"]];
    const buttons = options.map(([value, label, htmlLang]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "lt-opt";
      b.setAttribute("role", "radio");
      b.lang = htmlLang;
      b.dataset.value = value;
      b.textContent = label;
      b.addEventListener("click", () => set(value));
      group.append(b);
      return b;
    });
    group.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const next = current === "zh" ? "en" : "zh";
      set(next);
      buttons.find((b) => b.dataset.value === next)?.focus();
    });
    wrap.append(group);
    sync = () => {
      wrap.dataset.lang = current;
      for (const b of buttons) {
        const on = b.dataset.value === current;
        b.setAttribute("aria-checked", String(on));
        b.tabIndex = on ? 0 : -1;
      }
    };
  }
  sync();
  return wrap;
}
