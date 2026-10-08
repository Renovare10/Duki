import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { LibraryText, ReadingSession, TextCategory, TextScore, WordStatus } from "../types";
import { WORKS, workStats } from "../data/works";
import { TOPICS, topicLabel } from "../data/topics";
import { LEVEL_BANDS, type LevelBand } from "../lib/difficulty";
import { buildShelves, pickRecommendedItems, type LevelFilter } from "../lib/shelves";
import { bookProgress, collapseTexts, itemId, type Book, type ShelfItem } from "../lib/books";
import { cardHitAction } from "../lib/card-hit";
import { stillTeaches } from "../lib/score";
import { bookmarkProgress, isContinue } from "../lib/text";
import {
  bookEntry,
  describeText,
  filterEntries,
  filtersActive,
  formatKnown,
  LENGTHS,
  lengthLabel,
  NO_FILTERS,
  personalReady,
  scoreFit,
  sortByLevel,
  textEntry,
  textKnownShare,
  topicCounts,
  workEntry,
  workKnownShare,
  type BrowseFilters,
  type Entry,
  type EntryInfo,
  type Fit,
  type LengthBucket,
  type StatusFilter,
} from "../lib/library";
import { countNoun, coverTitle, isWorkRowId, workProgress, workRowId, workRows, workRowSummary, type WorkMeta } from "../lib/works";
import { useWorkProfiles, useWorkTocs } from "./useWorks";

type Props = {
  texts: LibraryText[];
  scores: Map<string, TextScore>;
  statuses: Map<string, WordStatus>;
  sessions: ReadingSession[];
  openShelf: string | null;
  onOpenShelf: (id: string | null) => void;
  onOpen: (id: string) => void;
  onOpenBook: (seriesId: string) => void;
  onOpenWork: (workId: string) => void;
  onScore?: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkRead: (id: string, read: boolean) => void;
  onAddText: () => void;
  onRemoteSearch?: (query: string) => void;
  wikiErrors?: Record<string, string>;
  wikiLoading?: string | null;
};

const FITS: { id: LevelFilter; label: string }[] = [
  { id: "all", label: "Any fit" },
  { id: "just-right", label: "Just right for me" },
  { id: "easy", label: "Easy for me" },
  { id: "hard", label: "A stretch" },
  { id: "known", label: "Already known" },
];

const STATUSES: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Any status" },
  { id: "unread", label: "Unread" },
  { id: "started", label: "In progress" },
  { id: "read", label: "Read" },
];

const FIT_LABEL: Record<Fit, string> = {
  easy: "Easy",
  "just-right": "Just right",
  hard: "Harder",
  known: "Known",
};

const LEVEL_KEY = "duki.level";

function loadLevel(): LevelFilter {
  try {
    const raw = window.localStorage.getItem(LEVEL_KEY);
    if (raw === "just-right" || raw === "easy" || raw === "hard" || raw === "all" || raw === "known") {
      return raw;
    }
  } catch {
    /* private mode */
  }
  return "all";
}

function saveLevel(level: LevelFilter) {
  try {
    window.localStorage.setItem(LEVEL_KEY, level);
  } catch {
    /* private mode */
  }
}

type Row = { id: string; title: string; hint?: string; entries: Entry[]; tags?: Record<string, string>; grid?: boolean };

type ContinueTarget = { title: string; open: () => void; progress?: string };

export function Home({
  texts,
  scores,
  statuses,
  sessions,
  openShelf,
  onOpenShelf,
  onOpen,
  onOpenBook,
  onOpenWork,
  onScore,
  onDelete,
  onMarkRead,
  onAddText,
  onRemoteSearch,
  wikiErrors,
  wikiLoading,
}: Props) {
  const [filters, setFilters] = useState<BrowseFilters>(() => ({ ...NO_FILTERS, fit: loadLevel() }));
  const set = (patch: Partial<BrowseFilters>) => setFilters((f) => ({ ...f, ...patch }));

  useEffect(() => {
    if (!onRemoteSearch) return;
    const t = window.setTimeout(() => onRemoteSearch(filters.query), 400);
    return () => window.clearTimeout(t);
  }, [filters.query]);

  const personal = useMemo(() => personalReady(statuses), [statuses]);
  const workIds = useMemo(() => WORKS.map((w) => w.id), []);
  const profiles = useWorkProfiles(workIds, personal);
  const startedWorks = useMemo(
    () => WORKS.filter((w) => workRowSummary(texts, w.id).last).map((w) => w.id),
    [texts],
  );
  const tocs = useWorkTocs(startedWorks);

  const collapsed = useMemo(() => collapseTexts(texts), [texts]);

  const workInfo = useMemo(() => {
    const out = new Map<string, { entry: Entry; cont: ContinueTarget | null; lastTouched: number }>();
    for (const work of WORKS) {
      const stats = workStats(work.id);
      const toc = tocs.get(work.id);
      const rows = workRows(texts, work.id);
      const summary = workRowSummary(texts, work.id);
      let progress = { read: summary.read, started: Boolean(summary.last), total: stats?.chapters ?? 0 };
      let cont: ContinueTarget | null = null;
      let lastTouched = summary.last ? Math.max(summary.last.openedAt ?? 0, summary.last.readAt ?? 0) : 0;
      if (toc) {
        const p = workProgress(toc, rows);
        progress = { read: p.read, started: p.started, total: p.total };
        lastTouched = p.lastTouched;
        if (p.started && p.read < p.total) {
          cont = {
            title: p.next.title,
            open: () => onOpen(workRowId(work.id, p.next.key)),
            progress: `${p.read} / ${p.total.toLocaleString("en-US")} read`,
          };
        }
      } else if (summary.last && !summary.last.readAt) {
        const last = summary.last;
        cont = { title: last.title, open: () => onOpen(last.id) };
      }
      const known = personal ? workKnownShare(profiles.get(work.id), statuses) : null;
      out.set(work.id, { entry: workEntry(work, stats, known, progress), cont, lastTouched });
    }
    return out;
  }, [texts, tocs, profiles, statuses, personal]);

  const entries = useMemo(() => {
    const list: Entry[] = collapsed.map((item) =>
      item.type === "text" ? textEntry(item.text, scores.get(item.text.id)) : bookEntry(item.book, scores),
    );
    for (const w of workInfo.values()) list.push(w.entry);
    return list;
  }, [collapsed, scores, workInfo]);

  const active = filtersActive(filters);
  const results = useMemo(() => (active ? filterEntries(entries, filters) : []), [active, entries, filters]);
  const counts = useMemo(() => topicCounts(entries), [entries]);

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    // Continue reading: half-read texts and books, plus started works.
    const cont: { entry: Entry; at: number }[] = [];
    for (const e of entries) {
      if (e.type === "text" && isContinue(e.text)) {
        const score = scores.get(e.text.id);
        if (score ? stillTeaches(score) || score.total === 0 : Boolean(e.text.body.trim())) {
          cont.push({ entry: e, at: e.text.openedAt ?? 0 });
        }
      } else if (e.type === "book" && e.book.chapters.some((c) => isContinue(c))) {
        cont.push({ entry: e, at: Math.max(0, ...e.book.chapters.map((c) => c.openedAt ?? 0)) });
      } else if (e.type === "work") {
        const w = workInfo.get(e.work.id);
        if (w?.cont) cont.push({ entry: e, at: w.lastTouched });
      }
    }
    cont.sort((a, b) => b.at - a.at);
    if (cont.length) out.push({ id: "continue", title: "Continue reading", entries: cont.map((c) => c.entry) });

    const books = entries.filter((e) => e.type === "work" || e.type === "book");
    out.push({ id: "books", title: "Books", hint: "Long reads with chapters", entries: books });

    const picks = pickRecommendedItems(collapsed, scores);
    const tags: Record<string, string> = {};
    const recItems: ShelfItem[] = [];
    for (const [item, tag] of [
      [picks.easy, "Easy"],
      [picks.justRight, "Just right"],
      [picks.hard, "Harder"],
      [picks.fresh, "Unread"],
    ] as const) {
      if (!item) continue;
      recItems.push(item);
      tags[itemId(item)] = tag;
    }
    if (recItems.length) {
      const byId = new Map(entries.map((e) => [e.id, e]));
      const recEntries = recItems.map((i) => byId.get(itemId(i))).filter((e): e is Entry => Boolean(e));
      out.push({ id: "recommended", title: "Recommended for you", entries: recEntries, tags });
    }

    const graded = entries.filter(
      (e) => e.type !== "work" && e.info.level !== null,
    );
    for (const band of LEVEL_BANDS) {
      const inBand = sortByLevel(graded.filter((e) => e.info.band === band.id));
      out.push({ id: `level-${band.id}`, title: band.label, entries: inBand });
    }
    const wiki = entries.filter((e) => e.type === "text" && (e.text.kind === "wiki" || e.text.category === "wiki"));
    if (wiki.length) out.push({ id: "wiki", title: "Wikipedia · native Chinese", entries: wiki });
    const ws = entries.filter((e) => e.type === "text" && (e.text.kind === "wikisource" || e.text.category === "wikisource"));
    if (ws.length) out.push({ id: "wikisource", title: "Wikisource · classics", entries: ws });
    const yours = entries.filter((e) => e.type === "text" && e.text.kind === "paste");
    if (yours.length) out.push({ id: "yours", title: "Yours", entries: yours });
    return out;
  }, [entries, collapsed, scores, workInfo]);

  const shelfRow = openShelf ? rows.find((r) => r.id === openShelf) ?? legacyRow(openShelf) : null;

  function legacyRow(id: string): Row | null {
    const shelf = buildShelves(texts, scores, sessions, { level: "all", read: "all", category: "all", query: "" }).find(
      (s) => s.id === id,
    );
    if (!shelf) return null;
    const byId = new Map(entries.map((e) => [e.id, e]));
    return {
      id,
      title: shelf.title,
      entries: shelf.items.map((i) => byId.get(itemId(i))).filter((e): e is Entry => Boolean(e)),
      tags: shelf.tags,
    };
  }

  const card = (entry: Entry, tag?: string) => (
    <EntryCard
      key={entry.id}
      entry={entry}
      tag={tag}
      score={entry.type === "text" ? scores.get(entry.text.id) : undefined}
      personal={personal}
      cont={entry.type === "work" ? workInfo.get(entry.work.id)?.cont ?? null : null}
      wikiErrors={wikiErrors}
      wikiLoading={wikiLoading}
      onOpen={onOpen}
      onOpenBook={onOpenBook}
      onOpenWork={onOpenWork}
      onScore={onScore}
      onDelete={onDelete}
      onMarkRead={onMarkRead}
    />
  );

  return (
    <div className="home">
      <div className="home-hero-copy">
        <h1>Read real Chinese at your level.</h1>
        <p>Every card shows its level, length, and how much of it you already know.</p>
      </div>

      <div className="home-controls browse">
        <input
          type="search"
          className="home-search"
          placeholder="Search titles, authors, Wikipedia, Wikisource…"
          value={filters.query}
          onChange={(e) => set({ query: e.target.value })}
          aria-label="Search the library"
        />
        <div className="topic-strip" role="toolbar" aria-label="Topics">
          <button
            type="button"
            className={`chip${filters.topic === "all" ? " on" : ""}`}
            aria-pressed={filters.topic === "all"}
            onClick={() => set({ topic: "all" })}
          >
            All topics
          </button>
          {TOPICS.filter((t) => counts.get(t.id)).map((t) => (
            <button
              key={t.id}
              type="button"
              className={`chip${filters.topic === t.id ? " on" : ""}`}
              aria-pressed={filters.topic === t.id}
              onClick={() => set({ topic: filters.topic === t.id ? "all" : t.id })}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="pick-row">
          <Pick
            label="Level"
            value={filters.band}
            onChange={(v) => set({ band: v as LevelBand | "all" })}
            options={[{ id: "all", label: "All levels" }, ...LEVEL_BANDS.map((b) => ({ id: b.id, label: b.label }))]}
          />
          <Pick
            label="Length"
            value={filters.length}
            onChange={(v) => set({ length: v as LengthBucket | "all" })}
            options={[{ id: "all", label: "Any length" }, ...LENGTHS.map((l) => ({ id: l.id, label: `${l.label} · ${l.hint}` }))]}
          />
          <Pick
            label="For me"
            value={filters.fit}
            onChange={(v) => {
              set({ fit: v as LevelFilter });
              saveLevel(v as LevelFilter);
            }}
            options={FITS}
          />
          <Pick
            label="Status"
            value={filters.status}
            onChange={(v) => set({ status: v as StatusFilter })}
            options={STATUSES}
          />
          {active ? (
            <button
              type="button"
              className="ghost pick-clear"
              onClick={() => {
                setFilters({ ...NO_FILTERS });
                saveLevel("all");
              }}
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {shelfRow ? (
        <section>
          <button type="button" className="ghost shelf-back" onClick={() => onOpenShelf(null)}>
            ← Back
          </button>
          <h2 className="shelf-title">{shelfRow.title}</h2>
          <div className="shelf-grid">{shelfRow.entries.map((e) => card(e, shelfRow.tags?.[e.id]))}</div>
        </section>
      ) : active ? (
        <section>
          <h2 className="shelf-title">
            {results.length} {results.length === 1 ? "match" : "matches"}
            <span className="shelf-sub"> · easiest first</span>
          </h2>
          {results.length ? (
            <div className="shelf-grid">{results.map((e) => card(e))}</div>
          ) : (
            <p className="fine-print">
              Nothing matches all of these filters.{" "}
              {filters.fit !== "all" ? "Try “Any fit” — " : ""}or clear a filter.
            </p>
          )}
        </section>
      ) : (
        rows.map((row) =>
          row.entries.length ? (
            <section className="shelf" key={row.id} data-row={row.id}>
              <button type="button" className="shelf-title-btn" onClick={() => onOpenShelf(row.id)}>
                {row.title}
                <span className="shelf-count">{row.entries.length}</span>
                {row.hint ? <span className="shelf-sub">{row.hint}</span> : null}
              </button>
              <div className="shelf-track">{row.entries.slice(0, 24).map((e) => card(e, row.tags?.[e.id]))}</div>
            </section>
          ) : row.id.startsWith("level-") ? (
            <section className="shelf shelf-empty" key={row.id} data-row={row.id}>
              <div className="shelf-title-btn">{row.title}</div>
              <p className="fine-print">No texts at this level yet — more are planned.</p>
            </section>
          ) : null,
        )
      )}

      <p className="home-foot">
        <button type="button" className="ghost" onClick={onAddText}>
          Add your own
        </button>
        <span>
          Original graded stories, public-domain books, Wikipedia (CC BY-SA), and Wikisource. Paste books you own.
        </span>
      </p>
    </div>
  );
}

function Pick({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className={`pick${value !== "all" ? " on" : ""}`}>
      <span className="pick-label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function EntryCard({
  entry,
  tag,
  score,
  personal,
  cont,
  wikiErrors,
  wikiLoading,
  onOpen,
  onOpenBook,
  onOpenWork,
  onScore,
  onDelete,
  onMarkRead,
}: {
  entry: Entry;
  tag?: string;
  score?: TextScore;
  personal: boolean;
  cont: ContinueTarget | null;
  wikiErrors?: Record<string, string>;
  wikiLoading?: string | null;
  onOpen: (id: string) => void;
  onOpenBook: (seriesId: string) => void;
  onOpenWork: (workId: string) => void;
  onScore?: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkRead: (id: string, read: boolean) => void;
}) {
  if (entry.type === "work") {
    return (
      <WorkCard
        work={entry.work}
        info={entry.info}
        fit={entry.fit}
        known={entry.known}
        status={entry.status}
        cont={cont}
        tag={tag}
        onOpen={() => onOpenWork(entry.work.id)}
      />
    );
  }
  if (entry.type === "book") {
    return <BookCard book={entry.book} info={entry.info} tag={tag} onOpen={() => onOpenBook(entry.book.id)} />;
  }
  return (
    <TitleCard
      text={entry.text}
      score={score}
      personal={personal}
      tag={tag}
      error={wikiErrors?.[entry.text.id]}
      loading={wikiLoading === entry.text.id}
      onOpen={onOpen}
      onScore={onScore}
      onDelete={onDelete}
      onMarkRead={onMarkRead}
    />
  );
}

/** Level badge, personal known-%, and length — the first thing on every card. */
export function DifficultyStrip({
  info,
  known,
  fit,
}: {
  info: EntryInfo;
  known: number | null;
  fit: Fit | null;
}) {
  const length = lengthLabel(info);
  if (!info.badge && known === null && !length) return null;
  return (
    <div className="diff-strip">
      {info.badge ? (
        <span className={`lvl lvl-${info.band ?? "none"}`} title={info.badgeTitle}>
          {info.badge}
        </span>
      ) : null}
      {known !== null ? (
        <span className={`known-pct fit-${fit ?? "none"}`} title={fit ? `${FIT_LABEL[fit]} for you` : undefined}>
          {formatKnown(known)}
        </span>
      ) : null}
      {length ? <span className="len">{length}</span> : null}
    </div>
  );
}

function WorkCard({
  work,
  info,
  fit,
  known,
  status,
  cont,
  tag,
  onOpen,
}: {
  work: WorkMeta;
  info: EntryInfo;
  fit: Fit | null;
  known: number | null;
  status: Entry["status"];
  cont: ContinueTarget | null;
  tag?: string;
  onOpen: () => void;
}) {
  const stats = workStats(work.id);
  return (
    <article className="title-card work-card">
      <button type="button" className="title-hit" onClick={cont ? cont.open : onOpen}>
        <Cover category={work.category} tag={tag} title={work.title} />
        <div className="title-copy">
          <DifficultyStrip info={info} known={known} fit={fit} />
          <div className="title-card-name">{work.title}</div>
          <p className="title-blurb">{cont ? `Continue · ${cont.title}` : work.blurb}</p>
        </div>
      </button>
      <div className="title-copy title-meta">
        <div className="lib-meta">
          {status !== "unread" ? (
            <span className={`read-pill${status === "read" ? " on" : ""}`}>
              {status === "read" ? "Finished" : cont?.progress ?? "In progress"}
            </span>
          ) : null}
          <span>{work.author}</span>
          {stats ? (
            <span>
              {stats.sections > 1 && stats.sections !== stats.chapters
                ? countNoun(stats.sections, work.sectionNoun)
                : countNoun(stats.chapters, work.sectionNoun)}
            </span>
          ) : null}
        </div>
      </div>
      <div className="card-actions">
        <button type="button" className="ghost" onClick={onOpen}>
          Contents
        </button>
      </div>
    </article>
  );
}

function BookCard({ book, info, tag, onOpen }: { book: Book; info: EntryInfo; tag?: string; onOpen: () => void }) {
  const progress = bookProgress(book.chapters);
  const label = progress === "read" ? "Read" : progress === "in-progress" ? "In progress" : "Unread";
  return (
    <article className="title-card">
      <button type="button" className="title-hit" onClick={onOpen}>
        <Cover category={book.category} coverUrl={book.coverUrl} tag={tag} />
        <div className="title-copy">
          <DifficultyStrip info={info} known={null} fit={null} />
          <div className="title-card-name">{book.title}</div>
          {book.blurb ? <p className="title-blurb">{book.blurb}</p> : null}
        </div>
      </button>
      <div className="title-copy title-meta">
        <div className="lib-meta">
          <span className={`read-pill${progress === "read" ? " on" : ""}`}>{label}</span>
          {book.author ? <span>{book.author}</span> : null}
          <span>{book.chapters.length} chapters</span>
          {info.topics[0] ? <span className="cat-tag">{topicLabel(info.topics[0])}</span> : null}
        </div>
      </div>
    </article>
  );
}

export function TitleCard({
  text,
  score,
  personal = false,
  tag,
  error,
  loading,
  onOpen,
  onScore,
  onDelete,
  onMarkRead,
}: {
  text: LibraryText;
  score: TextScore | undefined;
  personal?: boolean;
  tag?: string;
  error?: string;
  loading?: boolean;
  onOpen: (id: string) => void;
  onScore?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMarkRead?: (id: string, read: boolean) => void;
}) {
  // Work chapters keep no body in storage; they are not "unscored" stubs.
  const stub = !(text.body || "").trim() && !isWorkRowId(text.id);
  const info = describeText(text);
  const known = personal ? textKnownShare(score) : null;
  function run(surface: Parameters<typeof cardHitAction>[0], event?: { stopPropagation: () => void }) {
    event?.stopPropagation();
    if (loading && cardHitAction(surface) === "score") return;
    const action = cardHitAction(surface);
    if (action === "score") onScore?.(text.id);
    else if (action === "delete") onDelete?.(text.id);
    else if (action === "mark") onMarkRead?.(text.id, !text.readAt);
    else onOpen(text.id);
  }
  return (
    <article className="title-card">
      <button type="button" className="title-hit" onClick={() => run("cover")}>
        <Cover category={text.category} coverUrl={text.coverUrl} tag={tag} />
        <div className="title-copy">
          <DifficultyStrip info={info} known={known} fit={scoreFit(score)} />
          <div className="title-card-name">{text.title}</div>
          {text.blurb ? <p className="title-blurb">{text.blurb}</p> : null}
          {loading ? <p className="title-blurb">Scoring…</p> : null}
          {error ? <p className="wiki-error">{error}</p> : null}
        </div>
      </button>
      <div className="title-copy title-meta">
        <CardMeta text={text} info={info} score={score} loading={loading} onUnscored={(e) => run("unscored", e)} />
      </div>
      <div className="card-actions" onClick={(e) => e.stopPropagation()}>
        {stub ? (
          <button type="button" className="ghost" onClick={(e) => run("score", e)} disabled={loading}>
            Score
          </button>
        ) : null}
        {text.readAt ? (
          <button type="button" className="ghost" onClick={(e) => run("mark", e)}>
            Mark unread
          </button>
        ) : (
          <button type="button" className="ghost" onClick={(e) => run("mark", e)}>
            Mark as read
          </button>
        )}
        {text.kind === "paste" && onDelete ? (
          <button type="button" className="ghost" onClick={(e) => run("remove", e)}>
            Remove
          </button>
        ) : null}
      </div>
    </article>
  );
}

function CardMeta({
  text,
  info,
  score,
  loading,
  onUnscored,
}: {
  text: LibraryText;
  info: EntryInfo;
  score?: TextScore;
  loading?: boolean;
  onUnscored?: (event: { stopPropagation: () => void }) => void;
}) {
  const fit = scoreFit(score);
  const progress = score ? bookmarkProgress(text.bookmark, score.total) : null;
  const stub = !(text.body || "").trim() && !isWorkRowId(text.id);
  const topic = info.topics[0];
  return (
    <div className="lib-meta">
      <span className={`read-pill${text.readAt ? " on" : ""}`}>
        {text.readAt ? "Read" : progress != null ? `Resume · ${progress}%` : "Unread"}
      </span>
      {fit && fit !== "known" ? (
        <span className={`badge ${fit}`}>{FIT_LABEL[fit]}</span>
      ) : loading ? (
        <span className="badge new">Scoring…</span>
      ) : stub ? (
        <button type="button" className="badge new" onClick={(e) => onUnscored?.(e)}>
          Unscored
        </button>
      ) : null}
      {score && score.total > 0 && score.uniqueUnknown > 0 ? <span>{score.uniqueUnknown} new words</span> : null}
      {topic ? <span className="cat-tag">{topicLabel(topic)}</span> : <span className="cat-tag">{categoryLabel(text.category)}</span>}
    </div>
  );
}

export function Cover({
  category,
  coverUrl,
  tag,
  title,
}: {
  category: TextCategory;
  coverUrl?: string;
  tag?: string;
  title?: string;
}): ReactNode {
  return (
    <div className={`cover-art cover-${category}${title ? " cover-titled" : ""}`} aria-hidden="true">
      {coverUrl ? <img className="cover-photo" src={coverUrl} alt="" /> : null}
      <span className="blob a" />
      <span className="blob b" />
      <span className="blob c" />
      {title ? <span className="cover-title" lang="zh-CN">{coverTitle(title)}</span> : null}
      {tag ? <span className="cover-tag">{tag}</span> : null}
    </div>
  );
}

export function categoryLabel(category: TextCategory): string {
  switch (category) {
    case "children":
      return "Children";
    case "graded":
      return "Graded";
    case "story":
      return "Story";
    case "science":
      return "Science";
    case "history":
      return "History";
    case "article":
      return "Article";
    case "novel":
      return "Novel";
    case "wiki":
      return "Wikipedia";
    case "wikisource":
      return "Wikisource";
    case "gutenberg":
      return "Gutenberg";
    case "paste":
      return "Yours";
  }
}
