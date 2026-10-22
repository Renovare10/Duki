import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type {
  Bookmark,
  Gloss,
  LibraryText,
  ReaderSettings,
  Token,
  WordRecord,
  WordStatus,
} from "../types";
import { FONT_LABELS, FONT_STACKS } from "../lib/fonts";
import { ThemeToggle } from "./ThemeToggle";
import { getGloss, hasWord, MAX_WORD_LEN, toSimplified } from "../lib/glossary";
import { markKey, type ScriptChoice } from "../lib/script";
import { shareClipboard, shareUrl } from "../lib/share";
import { segment } from "../lib/segment";
import { tokensInRange } from "../lib/speech";
import { throttle } from "../lib/throttle";
import { wordTint, type WordTint } from "../lib/tint";
import { VoicePlayer } from "./VoicePlayer";
import { useScrollHide } from "./useScrollHide";
import { SCROLL_HIDE_MEDIA } from "../lib/scroll-hide";

type Props = {
  text: LibraryText;
  words: Map<string, WordRecord>;
  settings: ReaderSettings;
  onSetStatus: (hanzi: string, status: WordStatus) => void;
  onBookmark: (bookmark: Bookmark) => void;
  onDone: (durationMs: number) => void;
  onSettings: (settings: ReaderSettings) => void;
  /** Optional block after the text (chapter navigation in long works); gets the time spent reading. */
  footer?: (elapsedMs: () => number) => ReactNode;
  /** Char-aligned traditional original, when this is a converted classic. */
  classic?: { original: string; simplified: string } | null;
  script?: ScriptChoice;
  onScript?: (script: ScriptChoice) => void;
};

type HoverState = {
  token: Token;
  zone: "title" | "body";
  gloss: Gloss;
  x: number;
  y: number;
};

type Sel = { zone: "title" | "body"; index: number };

function tintOf(words: Map<string, WordRecord>, hanzi: string): WordTint {
  return wordTint(words.get(hanzi));
}

export function Reader({
  text,
  words,
  settings,
  onSetStatus,
  onBookmark,
  onDone,
  onSettings,
  footer,
  classic = null,
  script = "simplified",
  onScript,
}: Props) {
  const titleTokens = useMemo(
    () => segment(text.title, hasWord, MAX_WORD_LEN),
    [text.title],
  );
  const bodyTokens = useMemo(
    () => segment(text.body, hasWord, MAX_WORD_LEN),
    [text.body],
  );
  const titleWords = useMemo(() => titleTokens.filter((t) => t.isWord), [titleTokens]);
  const bodyWords = useMemo(() => bodyTokens.filter((t) => t.isWord), [bodyTokens]);
  const tradBody =
    classic && classic.original.length === classic.simplified.length && text.body === classic.simplified
      ? classic.original
      : null;
  const canToggle = Boolean(classic && classic.original && classic.simplified);
  const bodyView = useMemo(() => {
    let offset = 0;
    return bodyTokens.map((token) => {
      const glossKey = canToggle ? toSimplified(token.text) : token.text;
      let surface = token.text;
      if (canToggle && script === "traditional") {
        surface = tradBody ? tradBody.slice(offset, offset + token.text.length) : token.text;
      } else if (canToggle && script === "simplified" && !tradBody) {
        surface = glossKey;
      }
      offset += token.text.length;
      return { token, surface, glossKey };
    });
  }, [bodyTokens, canToggle, script, tradBody]);
  const spoken = useMemo(() => (canToggle ? bodyView.map((v) => v.surface).join("") : text.body), [canToggle, bodyView, text.body]);
  const [selected, setSelected] = useState<Sel | null>(null);
  const [hover, setHover] = useState<HoverState | null>(null);
  const openedAt = useRef(Date.now());
  const onBookmarkRef = useRef(onBookmark);
  onBookmarkRef.current = onBookmark;

  const selectedToken =
    selected == null
      ? null
      : selected.zone === "title"
        ? titleTokens[selected.index]
        : bodyTokens[selected.index];
  const selectedView = selected?.zone === "body" ? bodyView[selected.index] : null;
  const selectedGlossKey = selectedView?.glossKey ?? (selectedToken?.isWord ? selectedToken.text : "");
  const selectedSurface = selectedView?.surface ?? selectedToken?.text ?? "";
  const selectedRecordKey =
    selectedToken?.isWord ? markKey(selectedGlossKey, selectedSurface, (key) => words.has(key)) : "";
  const selectedGloss = selectedToken?.isWord ? getGloss(selectedGlossKey || selectedToken.text) : null;
  const selectedWord = selectedRecordKey ? words.get(selectedRecordKey) : undefined;
  const selectedTint = selectedToken?.isWord ? tintOf(words, selectedRecordKey) : null;

  const [resumeIndex, setResumeIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState<{ start: number; end: number } | null>(null);
  const speakingTokens = useMemo(() => {
    if (!speaking) return null;
    const range = tokensInRange(bodyTokens, speaking.start, speaking.end);
    return range.from < 0 ? null : range;
  }, [speaking, bodyTokens]);

  async function onShare() {
    const url = shareUrl(window.location.origin, text);
    const copied = shareClipboard(window.location.origin, text);
    try {
      await navigator.clipboard.writeText(copied);
    } catch {
      try {
        const el = document.createElement("textarea");
        el.value = copied;
        el.setAttribute("readonly", "");
        el.style.position = "fixed";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        el.remove();
      } catch {
        /* clipboard blocked */
      }
    }
    setToast("Link copied");
    window.setTimeout(() => setToast(null), 1800);
    if (typeof navigator.share === "function") {
      void navigator.share({ title: text.title, url }).catch(() => {});
    }
  }

  useEffect(() => {
    setSelected(null);
    setHover(null);
    openedAt.current = Date.now();
    const b = text.bookmark;
    setResumeIndex(b && (b.tokenIndex > 0 || b.scrollY >= 40) ? b.tokenIndex : null);
    if (b && b.scrollY > 0) window.scrollTo(0, b.scrollY);
    else window.scrollTo(0, 0);
  }, [text.id]);

  useEffect(() => {
    if (hover && tintOf(words, hover.token.text) === "known") {
      setHover(null);
    }
  }, [words, hover]);

  useEffect(() => {
    if (!speakingTokens) return;
    document.querySelector(".article .speaking")?.scrollIntoView({ block: "nearest" });
  }, [speakingTokens]);

  useEffect(() => {
    const last: Bookmark = text.bookmark
      ? { ...text.bookmark }
      : { tokenIndex: 0, scrollY: 0 };
    function currentBookmark(): Bookmark {
      const nodes = document.querySelectorAll<HTMLElement>(".article .word");
      if (nodes.length === 0) return last;
      let tokenIndex = 0;
      let found = false;
      for (const node of nodes) {
        const rect = node.getBoundingClientRect();
        if (rect.bottom > 140) {
          tokenIndex = Number(node.dataset.index || 0);
          found = true;
          break;
        }
      }
      if (!found) {
        tokenIndex = Number(nodes[nodes.length - 1].dataset.index || 0);
      }
      last.tokenIndex = tokenIndex;
      last.scrollY = window.scrollY;
      return { ...last };
    }

    const save = throttle(() => {
      onBookmarkRef.current(currentBookmark());
    }, 450);

    window.addEventListener("scroll", save, { passive: true });
    return () => {
      window.removeEventListener("scroll", save);
      onBookmarkRef.current(currentBookmark());
    };
  }, [text.id]);

  // Mobile/touch: scrolling down pushes the word sheet off 1:1 with the page;
  // once fully off it stays hidden until a word is tapped. Called after the
  // bookmark-restore effect so the restore scroll isn't counted as reading.
  const sheetRef = useRef<HTMLDivElement>(null);
  const sheet = useScrollHide({ media: SCROLL_HIDE_MEDIA, resetKey: text.id, sheetRef });
  const revealSheet = sheet.reveal;
  const selectWord = useCallback(
    (sel: Sel) => {
      setSelected(sel);
      revealSheet();
    },
    [revealSheet],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (event.key === "Escape") {
        setSelected(null);
        return;
      }
      if (selected == null) return;

      const sequence: Sel[] = [
        ...titleWords.map((t) => ({ zone: "title" as const, index: t.index })),
        ...bodyWords.map((t) => ({ zone: "body" as const, index: t.index })),
      ];
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const current = sequence.findIndex(
          (s) => s.zone === selected.zone && s.index === selected.index,
        );
        if (current < 0) return;
        const next =
          event.key === "ArrowRight"
            ? sequence[Math.min(sequence.length - 1, current + 1)]
            : sequence[Math.max(0, current - 1)];
        setSelected(next);
        return;
      }

      if (!selectedToken?.isWord || !selectedRecordKey) return;
      if (event.key === "1") onSetStatus(selectedRecordKey, "unknown");
      if (event.key === "2") onSetStatus(selectedRecordKey, "shaky");
      if (event.key === "3") onSetStatus(selectedRecordKey, "known");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSetStatus, selected, selectedToken, selectedRecordKey, titleWords, bodyWords]);

  // Bookmark updates and the sheet's latch must not rebuild a long article.
  const bodyContent = useMemo(() => bodyView.map((view) =>
    renderToken(view.token, "body", {
      words, selected, resumeIndex, setSelected: selectWord, setHover,
      speaking: speakingTokens, surface: view.surface, glossKey: view.glossKey,
    }),
  ), [bodyView, words, selected, resumeIndex, selectWord, speakingTokens]);

  return (
    <div className={`reader-page highlights-${settings.highlightStyle ?? "color-coded"} width-${settings.textWidth ?? "medium"}`}>
      <div className="reader-chrome">
        <header className="reader-head">
          <div>
            <h1
              className="reader-title"
              lang="zh-CN"
              onMouseLeave={() => setHover(null)}
              style={{ fontFamily: FONT_STACKS[settings.fontFamily] }}
            >
              {titleTokens.map((token) =>
                renderToken(token, "title", {
                  words,
                  selected,
                  resumeIndex: null,
                  setSelected: selectWord,
                  setHover,
                  speaking: null,
                }),
              )}
            </h1>
            {text.source ? (
              <p className="source-line">
                {text.sourceUrl ? (
                  <a href={text.sourceUrl} target="_blank" rel="noreferrer">
                    {text.source}
                  </a>
                ) : (
                  text.source
                )}
              </p>
            ) : null}
            {text.readAt ? <p className="read-line">Read</p> : null}
          </div>
          <div className="reader-tools">
            <label className="font-size">
              <span>Size</span>
              <input
                type="range"
                min={18}
                max={96}
                value={settings.fontSize}
                onChange={(e) =>
                  onSettings({ ...settings, fontSize: Number(e.target.value) })
                }
                aria-label="Reader font size"
              />
            </label>
            <label className="reader-option">
              <span>Highlights</span>
              <select aria-label="Highlight style" value={settings.highlightStyle ?? "color-coded"}
                onChange={(e) => onSettings({ ...settings, highlightStyle: e.target.value as ReaderSettings["highlightStyle"] })}>
                <option value="normal">Normal</option>
                <option value="color-coded">Color-coded</option>
              </select>
            </label>
            <label className="reader-option">
              <span>Text width</span>
              <select aria-label="Text width" value={settings.textWidth ?? "medium"}
                onChange={(e) => onSettings({ ...settings, textWidth: e.target.value as ReaderSettings["textWidth"] })}>
                <option value="narrow">Narrow</option>
                <option value="medium">Medium</option>
                <option value="wide">Wide</option>
                <option value="full">Full</option>
              </select>
            </label>
            <select
              aria-label="Reader font"
              value={settings.fontFamily}
              onChange={(e) =>
                onSettings({
                  ...settings,
                  fontFamily: e.target.value as ReaderSettings["fontFamily"],
                })
              }
            >
              {Object.entries(FONT_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
            {canToggle && onScript ? (
              <button
                type="button"
                className="ghost"
                aria-pressed={script === "traditional"}
                onClick={() => onScript(script === "traditional" ? "simplified" : "traditional")}
              >
                {script === "traditional" ? "Simplified" : "Traditional"}
              </button>
            ) : null}
            <ThemeToggle
              className="theme-btn"
              theme={settings.theme}
              onChange={(theme) => onSettings({ ...settings, theme })}
            />
            <button type="button" className="ghost" onClick={() => void onShare()}>
              Share
            </button>
            <button
              type="button"
              className="primary done-btn"
              onClick={() => onDone(Date.now() - openedAt.current)}
            >
              I’m done
            </button>
          </div>
        </header>
        <div className="legend" aria-hidden="true">
          {settings.highlightStyle === "normal" ? <span>Highlighted: not yet known · Okay is plain text</span> : <><span>
            <i className="swatch new" />
            First time
          </span>
          <span>
            <i className="swatch unknown" />
            Don’t know
          </span>
          <span>
            <i className="swatch shaky" />
            Barely
          </span>
          <span>Okay is plain text</span></>}
        </div>
        <VoicePlayer body={spoken} onSpeaking={setSpeaking} />
      </div>

      <article
        className={`article${footer ? " has-footer" : ""}`}
        lang="zh-CN"
        onMouseLeave={() => setHover(null)}
        style={{
          fontFamily: FONT_STACKS[settings.fontFamily],
          fontSize: `${settings.fontSize}px`,
        }}
      >
        {bodyContent}
      </article>
      {footer ? <div className="reader-footer">{footer(() => Date.now() - openedAt.current)}</div> : null}

      <div
        ref={sheetRef}
        className={`dock${sheet.hidden ? " dock-hidden" : ""}`}
        role="region"
        aria-label="Word status"
        aria-hidden={sheet.hidden || undefined}
        inert={sheet.hidden}
      >
        {selectedToken?.isWord && selectedGloss && selectedTint ? (
          <>
            <div className="dock-word">{selectedSurface}</div>
            <div className="status-btns">
              <StatusButton
                label="Don’t know"
                shortcut="1"
                status="unknown"
                active={selectedTint === "unknown"}
                onClick={() => onSetStatus(selectedRecordKey, "unknown")}
              />
              <StatusButton
                label="Barely"
                shortcut="2"
                status="shaky"
                active={selectedTint === "shaky"}
                onClick={() => onSetStatus(selectedRecordKey, "shaky")}
              />
              <StatusButton
                label="Okay"
                shortcut="3"
                status="known"
                active={selectedTint === "known"}
                onClick={() => onSetStatus(selectedRecordKey, "known")}
              />
            </div>
            <div className="dock-pinyin">{selectedGloss.pinyin}</div>
            <div className="dock-en">{selectedGloss.english}</div>
            <div className="dock-counts">
              Don’t know {selectedWord?.dontKnowCount ?? 0}
              <span aria-hidden="true"> · </span>
              Barely {selectedWord?.barelyCount ?? 0}
              <span aria-hidden="true"> · </span>
              Okay {selectedWord?.okayCount ?? 0}
            </div>
          </>
        ) : (
          <div className="dock-hint">
            Tap a word. Hover for pinyin and English. Status never changes unless
            you press a button.
          </div>
        )}
      </div>

      {hover &&
      !(selected && selected.zone === hover.zone && selected.index === hover.token.index) ? (
        <div
          className="tooltip"
          style={{
            left: hover.x,
            top: hover.y - 8,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="py">{hover.gloss.pinyin}</div>
          <div className="en">{hover.gloss.english}</div>
        </div>
      ) : null}
      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </div>
  );
}

type RenderOpts = {
  words: Map<string, WordRecord>;
  selected: Sel | null;
  resumeIndex: number | null;
  setSelected: (sel: Sel) => void;
  setHover: (hover: HoverState | null) => void;
  speaking: { from: number; to: number } | null;
  surface?: string;
  glossKey?: string;
};

function renderToken(token: Token, zone: "title" | "body", opts: RenderOpts) {
  const marked =
    zone === "body" &&
    opts.speaking != null &&
    token.index >= opts.speaking.from &&
    token.index < opts.speaking.to;
  if (!token.isWord) {
    return (
      <span key={`${zone}-${token.index}`} className={marked ? "speaking" : undefined}>
        {VERSE_NUM.test(token.text) ? withVerseNumbers(token.text) : token.text}
      </span>
    );
  }
  const surface = opts.surface ?? token.text;
  const glossKey = opts.glossKey ?? token.text;
  const record = markKey(glossKey, surface, (key) => opts.words.has(key));
  const status = tintOf(opts.words, record);
  const isSelected =
    opts.selected?.zone === zone && opts.selected.index === token.index;
  const isResume = zone === "body" && opts.resumeIndex === token.index;
  return (
    <span
      key={`${zone}-${token.index}`}
      data-index={zone === "body" ? token.index : undefined}
      className={`word ${status}${isSelected ? " selected" : ""}${isResume ? " resume" : ""}${marked ? " speaking" : ""}`}
      onClick={() => {
        opts.setSelected({ zone, index: token.index });
        opts.setHover(null);
      }}
      onMouseEnter={(event) => {
        if (tintOf(opts.words, record) === "known") {
          opts.setHover(null);
          return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        opts.setHover({
          token,
          zone,
          gloss: getGloss(glossKey),
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
      }}
      onMouseLeave={() => opts.setHover(null)}
    >
      {isResume ? <span className="resume-flag">resume here</span> : null}
      {surface}
    </span>
  );
}

/** Bible chapters carry verse numbers as superscript digits (¹²³); show them quietly. */
const VERSE_NUM = /[⁰¹²³⁴⁵⁶⁷⁸⁹]/;

function withVerseNumbers(text: string): ReactNode[] {
  return text.split(/([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="verse-num" aria-hidden="true">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function StatusButton({
  label,
  shortcut,
  status,
  active,
  onClick,
}: {
  label: string;
  shortcut: string;
  status: WordStatus;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`status-btn ${status}${active ? " active" : ""}`}
      onClick={onClick}
    >
      {label}
      <span className="kbd">{shortcut}</span>
    </button>
  );
}
