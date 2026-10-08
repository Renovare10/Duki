import { useEffect, useMemo, useState } from "react";
import type { LibraryText, ReadingSession, TextScore, WordEvent, WordRecord } from "../types";
import { getGloss } from "../lib/glossary";
import type { DemoData } from "../lib/demo";
import { NEW_CARDS_PER_DAY } from "../lib/review";
import {
  activityByDay,
  activityStreaks,
  cardStateCounts,
  countUnknownBuckets,
  firstActivityAt,
  hardestWords,
  intervalDistribution,
  lexiconCounts,
  progressSeries,
  RANGE_OPTIONS,
  rangeStart,
  reviewDays,
  reviewForecast,
  summarizePeriod,
  textProgress,
  textsByProgress,
  wordsByStatus,
  type Granularity,
  type ProgressBucket,
  type RangeKey,
} from "../lib/stats";
import { BarChart, ChartCard, compact, Heatmap, LineChart, StackBar } from "./Charts";
import { TitleCard } from "./Home";

const C = {
  learned: "var(--ok)",
  relearned: "var(--new-line)",
  forgotten: "var(--unknown-line)",
  known: "var(--ok)",
  shaky: "var(--shaky-line)",
  unknown: "var(--unknown-line)",
  ink: "var(--ink)",
  muted: "var(--ink-soft)",
  fresh: "var(--rule-hover)",
};

function pct(v: number | null): string {
  return v == null ? "—" : `${Math.round(v * 100)}%`;
}

function minutesLabel(m: number): string {
  if (m < 60) return `${Math.round(m)}m`;
  const h = m / 60;
  return h < 10 ? `${h.toFixed(1).replace(/\.0$/, "")}h` : `${Math.round(h)}h`;
}

function bucketLabels(buckets: ProgressBucket[], granularity: Granularity) {
  const multiYear =
    buckets.length > 0 &&
    new Date(buckets[0].start).getFullYear() !== new Date(buckets[buckets.length - 1].start).getFullYear();
  const full = buckets.map((b) =>
    granularity === "day"
      ? new Date(b.start).toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : new Date(b.start).toLocaleDateString(undefined, { month: "long", year: "numeric" }),
  );
  const ticks = buckets.map((b) => {
    const d = new Date(b.start);
    if (granularity === "month") {
      return multiYear
        ? `${d.toLocaleDateString(undefined, { month: "short" })} ’${String(d.getFullYear()).slice(2)}`
        : d.toLocaleDateString(undefined, { month: "short" });
    }
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  });
  return { full, ticks };
}

/** Ratio of trailing sums over `window` buckets; null where there is no denominator. */
function rollingRatio(
  buckets: ProgressBucket[],
  num: (b: ProgressBucket) => number,
  den: (b: ProgressBucket) => number,
  window: number,
): (number | null)[] {
  return buckets.map((_, i) => {
    let n = 0;
    let d = 0;
    for (let k = Math.max(0, i - window + 1); k <= i; k += 1) {
      n += num(buckets[k]);
      d += den(buckets[k]);
    }
    return d > 0 ? n / d : null;
  });
}

function stripDemoParam() {
  const url = new URL(window.location.href);
  let changed = false;
  if (url.searchParams.has("demo")) {
    url.searchParams.delete("demo");
    changed = true;
  }
  const hash = url.hash;
  const qi = hash.indexOf("?");
  if (qi >= 0) {
    const params = new URLSearchParams(hash.slice(qi + 1));
    if (params.has("demo")) {
      params.delete("demo");
      const rest = params.toString();
      url.hash = hash.slice(0, qi) + (rest ? `?${rest}` : "");
      changed = true;
    }
  }
  if (changed) window.history.replaceState(window.history.state, "", url.toString());
}

type Props = {
  words: Map<string, WordRecord>;
  texts: LibraryText[];
  sessions: ReadingSession[];
  /** Word history (reader taps + review grades) for the time charts. */
  events: WordEvent[];
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
  words: realWords,
  texts,
  sessions: realSessions,
  events: realEvents,
  scores,
  onReviewWord: realOnReviewWord,
  onOpen,
  onScore,
  onMarkRead,
}: Props) {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [range, setRange] = useState<RangeKey>("3m");
  const [granularity, setGranularity] = useState<Granularity>("day");
  // Demo data lives only in this component's state: never written to IndexedDB or synced.
  const [demo, setDemo] = useState<DemoData | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [now] = useState(() => Date.now());

  async function loadDemo() {
    setDemoLoading(true);
    try {
      const { generateDemoData } = await import("../lib/demo");
      const textIds = texts
        .filter((t) => t.body.trim() && t.kind === "sample")
        .slice(0, 40)
        .map((t) => t.id);
      setDemo(generateDemoData({ now, textIds }));
      setPanel(null);
    } finally {
      setDemoLoading(false);
    }
  }

  function exitDemo() {
    setDemo(null);
    setPanel(null);
    stripDemoParam();
  }

  useEffect(() => {
    // Honour ?demo=1 or #/stats?demo=1 on mount and on in-page hash changes.
    let cancelled = false;
    function check() {
      void import("../lib/demo").then(({ demoRequested }) => {
        if (!cancelled && demoRequested(window.location.search, window.location.hash)) void loadDemo();
      });
    }
    check();
    window.addEventListener("hashchange", check);
    return () => {
      cancelled = true;
      window.removeEventListener("hashchange", check);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const words = demo ? demo.words : realWords;
  const sessions = demo ? demo.sessions : realSessions;
  const events = demo ? demo.events : realEvents;
  // Demo words aren't in the real store, so they can't be opened in Review.
  const onReviewWord = demo ? undefined : realOnReviewWord;

  const lexicon = lexiconCounts(words.values());
  const progress = textProgress(texts);
  const unknownHist = countUnknownBuckets(scores.values());

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
                  <button
                    type="button"
                    className="miss-btn"
                    disabled={!onReviewWord}
                    onClick={() => onReviewWord?.(word.hanzi)}
                  >
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
    <div className="shell stats-shell">
      <section className="hero">
        <h1>Stats</h1>
        <p>Progress over time: what you’ve learned and forgotten, how reviews are going, and what’s coming up.</p>
      </section>

      {demo ? (
        <div className="demo-banner" role="status">
          <span className="demo-tag">Example data</span>
          <span className="demo-copy">
            You’re looking at a made-up learner’s history so you can explore the charts. Nothing is
            saved or synced, and your own progress is untouched.
          </span>
          <button type="button" className="text-btn" onClick={exitDemo}>
            Exit demo
          </button>
        </div>
      ) : null}

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

      <ProgressDashboard
        words={words}
        events={events}
        sessions={sessions}
        now={now}
        range={range}
        granularity={granularity}
        onRange={setRange}
        onGranularity={setGranularity}
        demo={Boolean(demo)}
        demoLoading={demoLoading}
        onLoadDemo={() => void loadDemo()}
        onReviewWord={onReviewWord}
      />

      {demo ? null : (
        <>
          <h2 className="section-label">Library</h2>
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
        </>
      )}

      {demo ? null : (
        <>
          <h2 className="section-label">Unknown load · library</h2>
          <p className="fine-print">
            How scored texts sit relative to your lexicon (unknown %). Mid-band learning is ~5–15%.
            {unknownHist.unscored > 0 ? ` · ${unknownHist.unscored} unscored` : ""}
            {unknownHist.midBand === 0 && unknownHist.scored > 0
              ? " · none in ~5–15% right now"
              : ""}
          </p>
          {unknownHist.scored === 0 ? (
            <p className="fine-print">Score a text to see where the library sits for you.</p>
          ) : (
            <ul className="session-list">
              {unknownHist.buckets.map((row) => (
                <li key={row.key}>
                  <div className="session-row">
                    <span className="session-title">{row.label}</span>
                    <span className="session-n">{row.count}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function ProgressDashboard({
  words,
  events,
  sessions,
  now,
  range,
  granularity,
  onRange,
  onGranularity,
  demo,
  demoLoading,
  onLoadDemo,
  onReviewWord,
}: {
  words: Map<string, WordRecord>;
  events: WordEvent[];
  sessions: ReadingSession[];
  now: number;
  range: RangeKey;
  granularity: Granularity;
  onRange: (range: RangeKey) => void;
  onGranularity: (granularity: Granularity) => void;
  demo: boolean;
  demoLoading: boolean;
  onLoadDemo: () => void;
  onReviewWord?: (hanzi: string) => void;
}) {
  const first = useMemo(() => firstActivityAt(events, sessions), [events, sessions]);
  const buckets = useMemo(
    () =>
      progressSeries({
        words: words.values(),
        events,
        sessions,
        now,
        from: rangeStart(range, now, first),
        granularity,
      }),
    [words, events, sessions, now, range, granularity, first],
  );
  const period = useMemo(() => summarizePeriod(buckets), [buckets]);
  const daysReviewed = useMemo(
    () => (buckets.length ? reviewDays(events, buckets[0].start, buckets[buckets.length - 1].end) : 0),
    [events, buckets],
  );
  const activity = useMemo(() => activityByDay(events, sessions), [events, sessions]);
  const streak = useMemo(() => activityStreaks(activity, now), [activity, now]);
  const states = useMemo(() => cardStateCounts(words.values()), [words]);
  const { days: forecast, newWaiting } = useMemo(() => reviewForecast(words.values(), now, 30), [words, now]);
  const intervals = useMemo(() => intervalDistribution(words.values()), [words]);
  const hardest = useMemo(() => hardestWords(words.values(), events, 8), [words, events]);
  const { full, ticks } = useMemo(() => bucketLabels(buckets, granularity), [buckets, granularity]);
  const last = buckets[buckets.length - 1];
  const hasHistory = events.length > 0;
  // Event-based time charts would all be blank without history; snapshot charts still render.
  const showHistory = hasHistory || demo;
  const per = granularity === "day" ? "day" : "month";
  const knownStart = buckets[0]?.knownBefore ?? 0;
  const knownGain = (last?.known ?? 0) - knownStart;
  const dueWeek = forecast.slice(0, 7).reduce((n, d) => n + d.count, 0);
  const historySince = events.length ? new Date(events[0].at).toLocaleDateString() : null;

  const values = (f: (b: ProgressBucket) => number | null) => buckets.map(f);
  const rollWindow = granularity === "day" ? 7 : 1;

  const forecastLabels = forecast.map((d, i) =>
    i === 0
      ? "Today"
      : i === 1
        ? "Tomorrow"
        : new Date(d.start).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
  );
  const forecastTicks = forecast.map((d, i) =>
    i === 0 ? "Today" : new Date(d.start).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  );

  return (
    <>
      <div className="stats-toolbar">
        <h2 className="section-label">Progress over time</h2>
        <div className="stats-controls">
          <div className="filter-row" role="group" aria-label="Time range">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={`chip${range === opt.key ? " on" : ""}`}
                aria-pressed={range === opt.key}
                onClick={() => onRange(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="filter-row" role="group" aria-label="Group by">
            {(["day", "month"] as const).map((g) => (
              <button
                key={g}
                type="button"
                className={`chip${granularity === g ? " on" : ""}`}
                aria-pressed={granularity === g}
                onClick={() => onGranularity(g)}
              >
                {g === "day" ? "By day" : "By month"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!hasHistory && !demo ? (
        <div className="empty-card stats-empty">
          <p>
            <strong>Charts fill in as you read and review.</strong> Duki now records each tap and
            review grade on this device, so learned / forgotten history starts today. Snapshot
            charts below (card states, forecast, intervals) already use your current words.
          </p>
          <button type="button" className="primary" onClick={onLoadDemo} disabled={demoLoading}>
            {demoLoading ? "Loading…" : "Load demo data"}
          </button>
          <p className="fine-print">Example data stays in this tab — it’s never saved or synced.</p>
        </div>
      ) : null}

      <div className="kpi-grid">
        <Kpi
          value={`${knownGain > 0 ? "+" : ""}${compact(knownGain)}`}
          label="Net known"
          sub={`${compact(knownStart)} → ${compact(last?.known ?? 0)} known`}
        />
        <Kpi
          value={`${period.learned > 0 ? "+" : ""}${compact(period.learned)}`}
          label="Learned"
          sub={period.relearned ? `+${compact(period.relearned)} relearned` : "first time known"}
          tone="good"
        />
        <Kpi
          value={compact(period.forgotten)}
          label="Forgotten"
          sub={period.forgotten ? "Again / Don’t know" : "no lapses"}
          tone="bad"
        />
        <Kpi
          value={compact(period.reviews)}
          label="Reviews"
          sub={daysReviewed ? `${compact(Math.round(period.reviews / daysReviewed))} per review day` : "none yet"}
        />
        <Kpi value={pct(period.retention)} label="Retention" sub={`accuracy ${pct(period.accuracy)}`} />
        <Kpi
          value={`${streak.current}d`}
          label="Current streak"
          sub={`longest ${streak.longest}d · ${streak.activeDays} active day${streak.activeDays === 1 ? "" : "s"}`}
        />
        <Kpi
          value={compact(forecast[0]?.count ?? 0)}
          label="Due today"
          sub={`${compact(dueWeek)} this week · ${compact(newWaiting)} new waiting`}
        />
        <Kpi
          value={minutesLabel(period.minutes)}
          label="Reading time"
          sub={`${period.finished} text${period.finished === 1 ? "" : "s"} finished`}
        />
      </div>
      <p className="kpi-note">
        {RANGE_OPTIONS.find((o) => o.key === range)?.label} totals, except streaks and Due today.
      </p>

      <div className="chart-grid">
        {showHistory ? (
          <>
            <ChartCard
              wide
              title={`Learned & forgotten per ${per}`}
              note="Learned: first time a word reaches Known. Forgotten: a learned word drops back to Don’t know (shown below the line)."
            >
              <BarChart
                labels={full}
                tickLabels={ticks}
                up={[
                  { key: "learned", label: "Learned", color: C.learned, values: values((b) => b.learned) },
                  { key: "relearned", label: "Relearned", color: C.relearned, values: values((b) => b.relearned) },
                ]}
                down={[{ key: "forgotten", label: "Forgotten", color: C.forgotten, values: values((b) => b.forgotten) }]}
                ariaLabel={`Words learned and forgotten per ${per}`}
              />
            </ChartCard>

            <ChartCard title="Cumulative learned & forgotten" note="All-time running totals.">
              <LineChart
                labels={full}
                tickLabels={ticks}
                series={[
                  { key: "cl", label: "Learned", color: C.learned, values: values((b) => b.cumLearned) },
                  { key: "cf", label: "Forgotten", color: C.forgotten, values: values((b) => b.cumForgotten) },
                  { key: "net", label: "Net", color: C.ink, values: values((b) => b.cumLearned - b.cumForgotten) },
                ]}
                ariaLabel="Cumulative words learned and forgotten"
              />
            </ChartCard>

            <ChartCard title="Words over time" note="Your lexicon by status at the end of each period.">
              <LineChart
                stacked
                labels={full}
                tickLabels={ticks}
                series={[
                  { key: "known", label: "Known", color: C.known, values: values((b) => b.known) },
                  { key: "shaky", label: "Shaky", color: C.shaky, values: values((b) => b.shaky) },
                  { key: "unknown", label: "Unknown", color: C.unknown, values: values((b) => b.unknown) },
                ]}
                ariaLabel="Words by status over time"
              />
            </ChartCard>

            <ChartCard title={`Reviews per ${per}`} note="SM-2 grades. Again counts as a miss; Hard, Good, Easy pass.">
              <BarChart
                labels={full}
                tickLabels={ticks}
                up={[
                  { key: "passed", label: "Passed", color: C.relearned, values: values((b) => b.passed) },
                  { key: "again", label: "Again", color: C.forgotten, values: values((b) => b.again) },
                ]}
                ariaLabel={`Reviews per ${per}`}
              />
            </ChartCard>

            <ChartCard
              title="Retention"
              note={
                granularity === "day"
                  ? "7-day rolling. Retention: reviews of Known cards not graded Again. Accuracy: all reviews."
                  : "Retention: reviews of Known cards not graded Again. Accuracy: all reviews."
              }
            >
              <LineChart
                labels={full}
                tickLabels={ticks}
                yMax={1}
                yMin="auto"
                format={(v) => `${Math.round(v * 100)}%`}
                idleTitle={`Range · ${pct(period.retention)} retention`}
                series={[
                  {
                    key: "ret",
                    label: "Retention",
                    color: C.learned,
                    values: rollingRatio(buckets, (b) => b.retained, (b) => b.retentionReviews, rollWindow),
                  },
                  {
                    key: "acc",
                    label: "Accuracy",
                    color: C.relearned,
                    values: rollingRatio(buckets, (b) => b.passed, (b) => b.reviews, rollWindow),
                  },
                ]}
                ariaLabel="Retention and accuracy over time"
              />
            </ChartCard>

            <ChartCard title={`New words met per ${per}`} note="Words you met for the first time (first tap or review).">
              <BarChart
                labels={full}
                tickLabels={ticks}
                up={[{ key: "seen", label: "New words", color: C.shaky, values: values((b) => b.seen) }]}
                ariaLabel={`New words met per ${per}`}
              />
            </ChartCard>
          </>
        ) : null}

        {showHistory || sessions.length > 0 ? (
          <ChartCard title={`Reading time per ${per}`} note="Minutes from finished texts (I’m done).">
            <BarChart
              labels={full}
              tickLabels={ticks}
              up={[{ key: "min", label: "Minutes", color: C.muted, values: values((b) => Math.round(b.minutes)) }]}
              ariaLabel={`Reading minutes per ${per}`}
            />
          </ChartCard>
        ) : null}

        <ChartCard wide title="Daily activity" note="Reader taps, review grades, and finished texts per day.">
          <Heatmap counts={activity} now={now} />
        </ChartCard>

        <ChartCard title="Card states" note="Mature = review cards with an interval of 21+ days. Young = under 21 days.">
          <StackBar
            parts={[
              { key: "mature", label: "Mature", hint: "21d+", color: C.known, value: states.mature },
              { key: "young", label: "Young", hint: "<21d", color: "var(--chart-young)", value: states.young },
              { key: "learning", label: "Learning", hint: "minute steps", color: C.shaky, value: states.learning },
              { key: "readKnown", label: "Known from reading", hint: "never reviewed", color: C.relearned, value: states.readKnown },
              { key: "fresh", label: "New", hint: `waiting, ${NEW_CARDS_PER_DAY}/day`, color: C.fresh, value: states.fresh },
            ]}
          />
        </ChartCard>

        <ChartCard title="Upcoming reviews" note={`Scheduled cards for the next 30 days (overdue counts as today).${
            newWaiting ? ` Plus ${compact(newWaiting)} new Don’t know / Barely words waiting, introduced up to ${NEW_CARDS_PER_DAY} a day.` : ""
          }`}>
          <BarChart
            labels={forecastLabels}
            tickLabels={forecastTicks}
            summaryTitle="Next 30 days"
            emptyText="No reviews scheduled yet"
            up={[{ key: "due", label: "Due", color: C.relearned, values: forecast.map((d) => d.count) }]}
            ariaLabel="Reviews due over the next 30 days"
          />
        </ChartCard>

        <ChartCard title="Review intervals" note="How far apart SM-2 is spacing your reviewed cards.">
          <BarChart
            height={290}
            emptyText="No reviewed cards yet"
            labels={intervals.map((b) => b.label)}
            tickLabels={intervals.map((b) => b.label)}
            summaryTitle="Reviewed cards"
            up={[{ key: "n", label: "Cards", color: C.learned, values: intervals.map((b) => b.count) }]}
            ariaLabel="Distribution of review intervals"
          />
        </ChartCard>

        <ChartCard title="Hardest words" note="Most lapses, then Don’t know and Barely taps, then lowest ease.">
          {hardest.length === 0 ? (
            <p className="fine-print">No misses yet.</p>
          ) : (
            <ol className="hard-list">
              {hardest.map((h) => {
                const gloss = getGloss(h.hanzi);
                return (
                  <li key={h.hanzi}>
                    <button
                      type="button"
                      className="hard-btn"
                      disabled={!onReviewWord}
                      onClick={() => onReviewWord?.(h.hanzi)}
                    >
                      <span className="hard-word">
                        <span className="miss-hanzi">{h.hanzi}</span>
                        <span className="miss-gloss">
                          {gloss.pinyin}
                          {gloss.english && gloss.english !== "—" ? ` · ${gloss.english}` : ""}
                        </span>
                      </span>
                      <span className="hard-meta">
                        {h.lapses ? <span>{h.lapses} lapse{h.lapses === 1 ? "" : "s"}</span> : null}
                        <span>{h.misses}× don’t know</span>
                        <span>ease {h.ease.toFixed(2)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </ChartCard>
      </div>

      <p className="fine-print stats-definitions">
        <strong>How these are counted.</strong> Learned = the first time a word reaches Known (Okay
        while reading, or Good/Easy in review). Forgotten = a learned word falling back to Don’t
        know (Again in review, or Don’t know while reading); Barely/Hard is a wobble, not a lapse.
        Relearned = a forgotten word reaching Known again. Words already known before history
        began count as known but not as learned.
        {demo
          ? " This page is showing example data."
          : historySince
            ? ` History on this device since ${historySince}; it isn’t included in sync or Export yet.`
            : " History is kept on this device only; it isn’t included in sync or Export yet."}
      </p>
      {!demo && hasHistory ? (
        <p className="fine-print stats-demo-link">
          Curious what a year looks like?{" "}
          <button type="button" className="text-link" onClick={onLoadDemo} disabled={demoLoading}>
            {demoLoading ? "Loading…" : "Load demo data"}
          </button>
        </p>
      ) : null}
    </>
  );
}

function Kpi({
  value,
  label,
  sub,
  tone,
}: {
  value: string;
  label: string;
  sub?: string;
  tone?: "good" | "bad";
}) {
  return (
    <div className={`kpi${tone ? ` kpi-${tone}` : ""}`}>
      <div className="kpi-num">{value}</div>
      <div className="kpi-label">{label}</div>
      {sub ? <div className="kpi-sub">{sub}</div> : null}
    </div>
  );
}
