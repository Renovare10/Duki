import { useEffect, useMemo, useRef, useState } from "react";
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
import { getGloss, hasWord, MAX_WORD_LEN } from "../lib/glossary";
import { shareUrl } from "../lib/share";
import { segment } from "../lib/segment";
import { tokensInRange } from "../lib/speech";
import { throttle } from "../lib/throttle";
import { wordTint, type WordTint } from "../lib/tint";
import { VoicePlayer } from "./VoicePlayer";

type Props = {
  text: LibraryText;
  words: Map<string, WordRecord>;
  settings: ReaderSettings;
  onSetStatus: (hanzi: string, status: WordStatus) => void;
  onBookmark: (bookmark: Bookmark) => void;
  onDone: (durationMs: number) => void;
  onSettings: (settings: ReaderSettings) => void;
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
  const selectedGloss = selectedToken?.isWord ? getGloss(selectedToken.text) : null;
  const selectedWord = selectedToken?.isWord ? words.get(selectedToken.text) : undefined;
  const selectedTint = selectedToken?.isWord
    ? tintOf(words, selectedToken.text)
    : null;

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
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      try {
        const el = document.createElement("textarea");
        el.value = url;
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

      if (!selectedToken?.isWord) return;
      if (event.key === "1") onSetStatus(selectedToken.text, "unknown");
      if (event.key === "2") onSetStatus(selectedToken.text, "shaky");
      if (event.key === "3") onSetStatus(selectedToken.text, "known");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSetStatus, selected, selectedToken, titleWords, bodyWords]);

  return (
    <div className="reader-page">
      <div className="reader-chrome">
        <header className="reader-head">
          <div>
            <h1
              className="reader-title"
              onMouseLeave={() => setHover(null)}
              style={{ fontFamily: FONT_STACKS[settings.fontFamily] }}
            >
              {titleTokens.map((token) =>
                renderToken(token, "title", {
                  words,
                  selected,
                  resumeIndex: null,
                  setSelected,
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
                max={42}
                value={settings.fontSize}
                onChange={(e) =>
                  onSettings({ ...settings, fontSize: Number(e.target.value) })
                }
                aria-label="Reader font size"
              />
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
          <span>
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
          <span>Okay is plain text</span>
        </div>
        <VoicePlayer body={text.body} onSpeaking={setSpeaking} />
      </div>

      <article
        className="article"
        onMouseLeave={() => setHover(null)}
        style={{
          fontFamily: FONT_STACKS[settings.fontFamily],
          fontSize: `${settings.fontSize}px`,
        }}
      >
        {bodyTokens.map((token) =>
          renderToken(token, "body", {
            words,
            selected,
            resumeIndex,
            setSelected,
            setHover,
            speaking: speakingTokens,
          }),
        )}
      </article>

      <div className="dock" role="region" aria-label="Word status">
        {selectedToken?.isWord && selectedGloss && selectedTint ? (
          <>
            <div className="dock-word">{selectedToken.text}</div>
            <div className="status-btns">
              <StatusButton
                label="Don’t know"
                shortcut="1"
                status="unknown"
                active={selectedTint === "unknown"}
                onClick={() => onSetStatus(selectedToken.text, "unknown")}
              />
              <StatusButton
                label="Barely"
                shortcut="2"
                status="shaky"
                active={selectedTint === "shaky"}
                onClick={() => onSetStatus(selectedToken.text, "shaky")}
              />
              <StatusButton
                label="Okay"
                shortcut="3"
                status="known"
                active={selectedTint === "known"}
                onClick={() => onSetStatus(selectedToken.text, "known")}
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
        {token.text}
      </span>
    );
  }
  const status = tintOf(opts.words, token.text);
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
        if (tintOf(opts.words, token.text) === "known") {
          opts.setHover(null);
          return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        opts.setHover({
          token,
          zone,
          gloss: getGloss(token.text),
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
      }}
      onMouseLeave={() => opts.setHover(null)}
    >
      {isResume ? <span className="resume-flag">resume here</span> : null}
      {token.text}
    </span>
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
