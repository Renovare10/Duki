import { useState } from "react";
import { LEVEL_NAMES } from "../lib/difficulty";
import type { LibraryText, TextScore } from "../types";
import { TitleCard } from "./Home";

type Props = {
  texts: LibraryText[];
  scores: Map<string, TextScore>;
  onOpen: (id: string) => void;
  onMarkRead: (id: string, read: boolean) => void;
};

const LEVEL_KEY = "duki.en.level";

function readLevel(): number | null {
  try {
    const n = Number(window.localStorage.getItem(LEVEL_KEY));
    return Number.isInteger(n) && n >= 1 && n <= 10 ? n : null;
  } catch {
    return null;
  }
}

/** English library: pick a level, then open a story in the shared reader. */
export function EnglishHome({ texts, scores, onOpen, onMarkRead }: Props) {
  const [level, setLevelState] = useState<number | null>(readLevel);
  const setLevel = (next: number | null) => {
    setLevelState(next);
    try {
      if (next === null) window.localStorage.removeItem(LEVEL_KEY);
      else window.localStorage.setItem(LEVEL_KEY, String(next));
    } catch { /* session only */ }
  };
  const levels = [...new Set(texts.map((t) => t.level).filter((l): l is number => typeof l === "number"))].sort((a, b) => a - b);
  const unlevelled = texts.filter((t) => typeof t.level !== "number");
  const shown = level === null ? levels : levels.filter((l) => l === level);

  return (
    <div className="home" lang="en">
      <div className="home-hero-copy">
        <h1>Read real English at your level.</h1>
        <p>Pick a level, open a story, and tap any word for its Chinese meaning.</p>
      </div>
      {texts.length === 0 ? (
        <section className="shelf" aria-label="English stories">
          <div className="en-empty" role="status">
            <p className="en-empty-title">No English stories yet</p>
            <p className="en-empty-copy">When stories are added they'll show up here, ready to read.</p>
          </div>
        </section>
      ) : (
        <>
          <div className="en-levels" role="group" aria-label="English level">
            <button type="button" className="chip" aria-pressed={level === null} onClick={() => setLevel(null)}>All levels</button>
            {levels.map((l) => (
              <button type="button" key={l} className="chip" aria-pressed={level === l} onClick={() => setLevel(l)}
                title={LEVEL_NAMES[l]}>L{l}</button>
            ))}
          </div>
          {shown.map((l) => (
            <section className="shelf" key={l} aria-label={`Level ${l}`}>
              <h2 className="shelf-title">L{l} · {LEVEL_NAMES[l]}</h2>
              <div className="shelf-track">
                {texts.filter((t) => t.level === l).map((text) => (
                  <TitleCard key={text.id} text={text} score={scores.get(text.id)} onOpen={onOpen} onMarkRead={onMarkRead} />
                ))}
              </div>
            </section>
          ))}
          {level === null && unlevelled.length ? (
            <section className="shelf" aria-label="Other English texts">
              <h2 className="shelf-title">More</h2>
              <div className="shelf-track">
                {unlevelled.map((text) => (
                  <TitleCard key={text.id} text={text} score={scores.get(text.id)} onOpen={onOpen} onMarkRead={onMarkRead} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
      <p className="fine-print">Review, stats and adding your own text are Mandarin-only for now. Original stories; glosses from ECDICT (MIT).</p>
    </div>
  );
}
