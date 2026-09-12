import { useEffect, useMemo, useState } from "react";
import type { ReviewGrade, WordRecord } from "../types";
import { getGloss } from "../lib/glossary";
import { buildReviewQueue } from "../lib/review";

type Props = {
  words: Map<string, WordRecord>;
  focus?: string;
  onGrade: (hanzi: string, grade: ReviewGrade) => void;
};

export function Review({ words, focus, onGrade }: Props) {
  const [order, setOrder] = useState<string[]>([]);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const queue = buildReviewQueue(words.values(), Date.now(), focus);
    setOrder(queue.map((w) => w.hanzi));
    setFlipped(false);
    // Rebuild only when this view is mounted (parent keys by focus).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = order[0] ? words.get(order[0]) : undefined;
  const gloss = current ? getGloss(current.hanzi) : null;
  const remaining = order.length;

  const dueNote = useMemo(() => {
    if (!current) return "";
    if (current.status === "known") return "Due again";
    if (current.status === "shaky") return "Shaky";
    return "Don’t know";
  }, [current]);

  function grade(next: ReviewGrade) {
    if (!current) return;
    onGrade(current.hanzi, next);
    setOrder((prev) => {
      const rest = prev.slice(1);
      if (next === "again" || next === "hard") return [...rest, current.hanzi];
      return rest;
    });
    setFlipped(false);
  }

  return (
    <div className="shell review-shell">
      <section className="hero">
        <h1>Review</h1>
        <p>
          Cards for words you marked Don’t know or Barely, plus any due SM-2
          reviews. Reading taps do not count as reviews.
        </p>
      </section>

      {!current ? (
        <div className="empty-card">
          <p>Nothing due. Mark words while reading, then come back.</p>
        </div>
      ) : (
        <>
          <p className="review-meta">
            {remaining} in queue · {dueNote}
          </p>
          <button
            type="button"
            className={`review-card${flipped ? " flipped" : ""}`}
            onClick={() => setFlipped(true)}
          >
            <div className="review-hanzi">{current.hanzi}</div>
            {flipped && gloss ? (
              <div className="review-back">
                <div className="review-pinyin">{gloss.pinyin}</div>
                <div className="review-en">{gloss.english}</div>
              </div>
            ) : (
              <div className="review-prompt">Show pinyin and English</div>
            )}
          </button>
          {flipped ? (
            <div className="grade-row">
              <button type="button" className="grade again" onClick={() => grade("again")}>
                Again
              </button>
              <button type="button" className="grade hard" onClick={() => grade("hard")}>
                Hard
              </button>
              <button type="button" className="grade good" onClick={() => grade("good")}>
                Good
              </button>
              <button type="button" className="grade easy" onClick={() => grade("easy")}>
                Easy
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
