import { useEffect, useMemo, useState } from "react";
import type { ReviewGrade, WordRecord } from "../types";
import { getGloss } from "../lib/glossary";
import {
  buildReviewQueue,
  isLearning,
  isNewCard,
  LEARN_AHEAD_MS,
  NEW_CARDS_PER_DAY,
  newCardsIntroducedToday,
  nextDueAt,
  pickNext,
  sessionCounts,
} from "../lib/review";
import { formatDelay } from "../lib/sm2";
import { applyReviewGrade } from "../lib/word";

type Props = {
  words: Map<string, WordRecord>;
  focus?: string;
  onGrade: (hanzi: string, grade: ReviewGrade) => void;
};

const GRADES: { grade: ReviewGrade; label: string }[] = [
  { grade: "again", label: "Again" },
  { grade: "hard", label: "Hard" },
  { grade: "good", label: "Good" },
  { grade: "easy", label: "Easy" },
];

function whenLabel(dueAt: number, now: number): string {
  const min = Math.round((dueAt - now) / 60000);
  if (min < 60) return `in ${Math.max(1, min)} min`;
  const due = new Date(dueAt);
  const today = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(today.getDate() + 1);
  if (due.toDateString() === today.toDateString()) {
    return `later today (${due.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })})`;
  }
  if (due.toDateString() === tomorrow.toDateString()) return "tomorrow";
  return due.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function Review({ words, focus, onGrade }: Props) {
  const [order, setOrder] = useState<string[]>([]);
  const [forced, setForced] = useState<string | null>(focus ?? null);
  const [flipped, setFlipped] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const queue = buildReviewQueue(words.values(), Date.now(), focus);
    setOrder(queue.map((w) => w.hanzi));
    setFlipped(false);
    // Build the session once when this view mounts (parent keys by focus).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentId = pickNext(order, words, now, forced);
  const current = currentId ? words.get(currentId) : undefined;
  const gloss = current ? getGloss(current.hanzi) : null;
  const counts = sessionCounts(order, words, now);

  // Learning steps are minutes long: re-check while a step is pending.
  const pendingLearning = useMemo(
    () => order.some((h) => {
      const w = words.get(h);
      return w && isLearning(w) && (w.dueAt ?? 0) > now;
    }),
    [order, words, now],
  );
  useEffect(() => {
    if (!pendingLearning || current) return;
    const id = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(id);
  }, [pendingLearning, current]);

  const previews = useMemo(() => {
    if (!current) return null;
    const out: Partial<Record<ReviewGrade, string>> = {};
    for (const { grade } of GRADES) {
      const next = applyReviewGrade(current, grade, now);
      out[grade] = formatDelay(now, next.dueAt, next.intervalDays, next.phase);
    }
    return out;
  }, [current, now]);

  const cardNote = useMemo(() => {
    if (!current) return "";
    if (current.phase === "new") return "New card";
    if (current.phase === "learning") return "Learning";
    if (current.phase === "relearning") return "Relearning";
    if (current.dueAt != null && current.dueAt > now) return "Not due yet · practice";
    return `Review · every ${formatDelay(now, current.dueAt, current.intervalDays, "review")}`;
  }, [current, now]);

  function grade(next: ReviewGrade) {
    if (!current) return;
    onGrade(current.hanzi, next);
    setOrder((prev) => [...prev.filter((h) => h !== current.hanzi), current.hanzi]);
    if (forced === current.hanzi) setForced(null);
    setFlipped(false);
    setNow(Date.now());
  }

  const doneInfo = useMemo(() => {
    if (current) return null;
    const all = [...words.values()];
    const next = nextDueAt(all, now);
    const waiting = all.filter(isNewCard).length;
    const introduced = newCardsIntroducedToday(all, now);
    const soonLearning = all
      .filter((w) => isLearning(w) && w.dueAt != null && w.dueAt > now)
      .reduce<number | null>((m, w) => (m == null || (w.dueAt as number) < m ? (w.dueAt as number) : m), null);
    return { next, waiting, introduced, soonLearning };
  }, [current, words, now]);

  return (
    <div className="shell review-shell">
      <section className="hero">
        <h1>Review</h1>
        <p>
          Spaced repetition for words you marked Don’t know or Barely. Cards come back only when
          they’re due: new and missed cards repeat within minutes, then the gaps grow to days,
          weeks, and months as you keep remembering them.
        </p>
      </section>

      {!current ? (
        <div className="empty-card review-done">
          <p className="review-done-title">
            {order.length ? "Done for now." : "Nothing due right now."}
          </p>
          {doneInfo?.soonLearning != null && doneInfo.soonLearning - now <= LEARN_AHEAD_MS * 3 ? (
            <p>A learning card comes back {whenLabel(doneInfo.soonLearning, now)} — this page will show it.</p>
          ) : null}
          {doneInfo?.next != null ? (
            <p>Next scheduled review: {whenLabel(doneInfo.next, now)}.</p>
          ) : null}
          {doneInfo && doneInfo.waiting > 0 ? (
            <p>
              {doneInfo.waiting} new word{doneInfo.waiting === 1 ? "" : "s"} waiting
              {doneInfo.introduced >= NEW_CARDS_PER_DAY
                ? ` — today’s ${NEW_CARDS_PER_DAY} new cards are done, more tomorrow.`
                : "."}
            </p>
          ) : (
            <p>Mark words Don’t know or Barely while reading to add cards.</p>
          )}
        </div>
      ) : (
        <>
          <p className="review-meta">
            <span className="review-count new">{counts.fresh} new</span>
            <span className="review-count learning">{counts.learning} learning</span>
            <span className="review-count due">{counts.review} to review</span>
            <span className="review-note">{cardNote}</span>
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
              {GRADES.map(({ grade: g, label }) => (
                <button key={g} type="button" className={`grade ${g}`} onClick={() => grade(g)}>
                  <span className="grade-label">{label}</span>
                  {previews?.[g] ? <span className="grade-when">{previews[g]}</span> : null}
                </button>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
