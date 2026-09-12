import { useState } from "react";
import type { LibraryText, ReadingSession, TextScore, WordRecord } from "../types";
import { getGloss } from "../lib/glossary";
import { lexiconCounts, recentSessionLoads, textProgress, textsByProgress, topMisses, wordsByStatus } from "../lib/stats";
import { TitleCard } from "./Home";

type Props = {
  words: Map<string, WordRecord>;
  texts: LibraryText[];
  sessions: ReadingSession[];
  scores: Map<string, TextScore>;
  onReviewWord: (hanzi: string) => void;
  onOpen: (id: string) => void;
  onScore?: (id: string) => void;
  onMarkRead: (id: string, read: boolean) => void;
};

type Panel =
  | { kind: "words"; status: "known" | "shaky" | "unknown"; title: string }
  | { kind: "texts"; progress: "finished" | "inProgress" | "untouched"; title: string };

export function Stats({
  words,
  texts,
  sessions,
  scores,
  onReviewWord,
  onOpen,
  onScore,
  onMarkRead,
}: Props) {
  const [panel, setPanel] = useState<Panel | null>(null);
  const lexicon = lexiconCounts(words.values());
  const progress = textProgress(texts);
  const dontKnow = topMisses(words.values(), "dontKnowCount");
  const barely = topMisses(words.values(), "barelyCount");
  const loads = recentSessionLoads(sessions, texts);
  const maxRemaining = Math.max(1, ...loads.map((s) => s.remaining));

  if (panel?.kind === "words") {
    const list = wordsByStatus(words.values(), panel.status);
    return (
      <div className="shell">
        <button type="button" className="ghost shelf-back" onClick={() => setPanel(null)}>
          ← Back
        </button>
        <h1>{panel.title}</h1>
        {list.length === 0 ? (
          <p className="fine-print">Nothing here yet.</p>
        ) : (
          <ul className="miss-list">
            {list.map((word) => {
              const gloss = getGloss(word.hanzi);
              return (
                <li key={word.hanzi}>
                  <button type="button" className="miss-btn" onClick={() => onReviewWord(word.hanzi)}>
                    <span>
                      <span className="miss-hanzi">{word.hanzi}</span>
                      <span className="miss-gloss">
                        {gloss.pinyin}
                        {gloss.english && gloss.english !== "—" ? ` · ${gloss.english}` : ""}
                      </span>
                    </span>
                    <span className="miss-n">{word.status}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  if (panel?.kind === "texts") {
    const list = textsByProgress(texts, panel.progress);
    return (
      <div className="shell">
        <button type="button" className="ghost shelf-back" onClick={() => setPanel(null)}>
          ← Back
        </button>
        <h1>{panel.title}</h1>
        {list.length === 0 ? (
          <p className="fine-print">Nothing here yet.</p>
        ) : (
          <div className="shelf-grid">
            {list.map((text) => (
              <TitleCard
                key={text.id}
                text={text}
                score={scores.get(text.id)}
                onOpen={onOpen}
                onScore={onScore}
                onMarkRead={onMarkRead}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="shell">
      <section className="hero">
        <h1>Stats</h1>
        <p>Your lexicon, the words you miss, and how hard recent finishes still were.</p>
      </section>

      <div className="stat-grid">
        <button
          type="button"
          className="stat-card"
          onClick={() => setPanel({ kind: "words", status: "known", title: "Known words" })}
        >
          <div className="stat-num">{lexicon.known}</div>
          <div className="stat-label">Known</div>
        </button>
        <button
          type="button"
          className="stat-card"
          onClick={() => setPanel({ kind: "words", status: "shaky", title: "Shaky words" })}
        >
          <div className="stat-num">{lexicon.shaky}</div>
          <div className="stat-label">Shaky</div>
        </button>
        <button
          type="button"
          className="stat-card"
          onClick={() => setPanel({ kind: "words", status: "unknown", title: "Unknown words" })}
        >
          <div className="stat-num">{lexicon.unknown}</div>
          <div className="stat-label">Unknown</div>
        </button>
      </div>

      <div className="stat-grid three">
        <button
          type="button"
          className="stat-card"
          onClick={() => setPanel({ kind: "texts", progress: "finished", title: "Finished" })}
        >
          <div className="stat-num">{progress.finished}</div>
          <div className="stat-label">Finished</div>
        </button>
        <button
          type="button"
          className="stat-card"
          onClick={() => setPanel({ kind: "texts", progress: "inProgress", title: "In progress" })}
        >
          <div className="stat-num">{progress.inProgress}</div>
          <div className="stat-label">In progress</div>
        </button>
        <button
          type="button"
          className="stat-card"
          onClick={() => setPanel({ kind: "texts", progress: "untouched", title: "Not started" })}
        >
          <div className="stat-num">{progress.untouched}</div>
          <div className="stat-label">Not started</div>
        </button>
      </div>

      <h2 className="section-label">Misses · Don’t know</h2>
      <MissList words={dontKnow} field="dontKnowCount" onReviewWord={onReviewWord} empty="No Don’t know taps yet." />

      <h2 className="section-label">Misses · Barely</h2>
      <MissList words={barely} field="barelyCount" onReviewWord={onReviewWord} empty="No Barely taps yet." />

      <h2 className="section-label">Unknown load after finishing</h2>
      {loads.length === 0 ? (
        <p className="fine-print">Finish a text with I’m done to record a session.</p>
      ) : (
        <ul className="session-list">
          {loads.map((row) => (
            <li key={row.id}>
              <div className="session-row">
                <span className="session-title">{row.title}</span>
                <span className="session-n">{row.remaining} still unknown or shaky</span>
              </div>
              <div className="load-bar" aria-hidden="true">
                <span style={{ width: `${Math.round((row.remaining / maxRemaining) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MissList({
  words,
  field,
  onReviewWord,
  empty,
}: {
  words: WordRecord[];
  field: "dontKnowCount" | "barelyCount";
  onReviewWord: (hanzi: string) => void;
  empty: string;
}) {
  if (words.length === 0) return <p className="fine-print">{empty}</p>;
  return (
    <ul className="miss-list">
      {words.map((word) => (
        <li key={word.hanzi}>
          <button type="button" className="miss-btn" onClick={() => onReviewWord(word.hanzi)}>
            <span className="miss-hanzi">{word.hanzi}</span>
            <span className="miss-n">{word[field]}×</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
