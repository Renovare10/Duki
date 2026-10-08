import { useEffect, useMemo, useState } from "react";
import type { LibraryText, WordStatus } from "../types";
import { workStats } from "../data/works";
import { LEVEL_NAMES, levelBand, readingMinutes } from "../lib/difficulty";
import { describeWork, fitOfShare, formatDuration, workKnownShare } from "../lib/library";
import {
  chapterState,
  loadToc,
  workProgress,
  workRows,
  type TocChapter,
  type TocSection,
  type WorkMeta,
  type WorkToc,
} from "../lib/works";
import { Cover, DifficultyStrip } from "./Home";
import { useWorkProfiles } from "./useWorks";

type Props = {
  work: WorkMeta;
  texts: LibraryText[];
  statuses: Map<string, WordStatus>;
  personal: boolean;
  onBack: () => void;
  onOpenChapter: (key: string) => void;
};

export function WorkScreen({ work, texts, statuses, personal, onBack, onOpenChapter }: Props) {
  const [toc, setToc] = useState<WorkToc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stats = workStats(work.id);
  const profiles = useWorkProfiles([work.id], personal);
  const known = personal ? workKnownShare(profiles.get(work.id), statuses) : null;
  const info = describeWork(work, stats);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    loadToc(work.id)
      .then((t) => !cancelled && setToc(t))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Could not load the contents."));
    return () => {
      cancelled = true;
    };
  }, [work.id]);

  const rows = useMemo(() => workRows(texts, work.id), [texts, work.id]);
  const progress = useMemo(() => (toc ? workProgress(toc, rows) : null), [toc, rows]);
  const parts = useMemo(() => groupParts(toc), [toc]);
  const pct = progress && progress.total ? Math.round((progress.read / progress.total) * 100) : 0;

  return (
    <div className="home work-page">
      <button type="button" className="ghost shelf-back" onClick={onBack}>
        ← Library
      </button>
      <header className="work-head">
        <Cover category={work.category} title={work.title} />
        <div className="work-head-copy">
          <h1 lang="zh-CN">{work.title}</h1>
          <p className="work-sub">
            {work.english} · {work.author} · {work.year}
          </p>
          <DifficultyStrip info={info} known={known} fit={known === null ? null : fitOfShare(known)} />
          <p className="title-blurb">{work.blurb}</p>
          {progress ? (
            <div className="work-actions">
              <button type="button" className="primary" onClick={() => onOpenChapter(progress.next.key)}>
                {progress.started
                  ? `${progress.resuming ? "Continue" : "Next"} · ${progress.next.title}`
                  : `Start reading · ${progress.next.title}`}
              </button>
              <div className="work-progress" aria-label={`${progress.read} of ${progress.total} chapters read`}>
                <div className="work-progress-bar">
                  <span style={{ width: `${pct}%` }} />
                </div>
                <span>
                  {progress.read.toLocaleString("en-US")} / {progress.total.toLocaleString("en-US")} chapters read
                </span>
              </div>
            </div>
          ) : null}
          <details className="about-text">
            <summary>About this text</summary>
            <p>
              <strong>Source:</strong>{" "}
              <a href={work.sourceUrl} target="_blank" rel="noreferrer">
                {work.source}
              </a>
            </p>
            <p>
              <strong>Copyright:</strong> {work.license}
            </p>
            {work.notes ? <p>{work.notes}</p> : null}
            {stats ? (
              <p>
                {stats.chars.toLocaleString("en-US")} characters · most chapters at {LEVEL_NAMES[stats.levelLow]}
                {stats.levelHigh !== stats.levelLow ? `–${LEVEL_NAMES[stats.levelHigh]}` : ""} level (easiest L
                {stats.levelMin}, hardest L{stats.levelMax}).
              </p>
            ) : null}
          </details>
        </div>
      </header>

      {error ? <p className="wiki-error">{error}</p> : null}
      {!toc && !error ? <p className="fine-print">Loading contents…</p> : null}

      {parts.map((part) => (
        <section key={part.title || "all"} className="work-part">
          {part.title ? <h2 className="shelf-title">{part.title}</h2> : <h2 className="shelf-title">Contents</h2>}
          <div className="toc-list">
            {part.sections.map((section) => (
              <SectionRow
                key={section.key}
                section={section}
                rows={rows}
                nextKey={progress?.next.key ?? null}
                onOpen={onOpenChapter}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function groupParts(toc: WorkToc | null): { title: string; sections: TocSection[] }[] {
  if (!toc) return [];
  const out: { title: string; sections: TocSection[] }[] = [];
  for (const s of toc.sections) {
    const title = s.part ?? "";
    const last = out[out.length - 1];
    if (last && last.title === title) last.sections.push(s);
    else out.push({ title, sections: [s] });
  }
  return out;
}

function LevelTag({ level }: { level: number }) {
  return (
    <span className={`lvl lvl-${levelBand(level)}`} title={LEVEL_NAMES[level]}>
      L{level}
    </span>
  );
}

function SectionRow({
  section,
  rows,
  nextKey,
  onOpen,
}: {
  section: TocSection;
  rows: Map<string, LibraryText>;
  nextKey: string | null;
  onOpen: (key: string) => void;
}) {
  if (section.chapters.length === 1) {
    const ch = section.chapters[0];
    const state = chapterState(rows.get(ch.key));
    return (
      <button
        type="button"
        className={`toc-row state-${state}${ch.key === nextKey ? " is-next" : ""}`}
        onClick={() => onOpen(ch.key)}
      >
        <span className="toc-dot" aria-hidden="true" />
        <span className="toc-title" lang="zh-CN">
          {section.title}
        </span>
        <span className="toc-meta">
          <LevelTag level={ch.level} />
          <span>
            {ch.chars.toLocaleString("en-US")} 字 · {formatDuration(readingMinutes(ch.chars, ch.level))}
          </span>
          {state === "read" ? <span className="toc-state">Read</span> : state === "started" ? <span className="toc-state">Started</span> : null}
        </span>
      </button>
    );
  }
  const read = section.chapters.filter((c) => rows.get(c.key)?.readAt).length;
  const holdsNext = section.chapters.some((c) => c.key === nextKey);
  const numeric = section.chapters.every((c) => /^\d+$/.test(c.label));
  return (
    <details className={`toc-section${read === section.chapters.length ? " all-read" : ""}`} open={holdsNext}>
      <summary>
        <span className="toc-title" lang="zh-CN">
          {section.title}
        </span>
        <span className="toc-meta">
          <LevelTag level={section.level} />
          <span>
            {section.chapters.length} ch · {formatDuration(readingMinutes(section.chars, section.level))}
          </span>
          {read ? (
            <span className="toc-state">
              {read}/{section.chapters.length} read
            </span>
          ) : null}
        </span>
      </summary>
      <div className={numeric ? "ch-grid" : "toc-sublist"}>
        {section.chapters.map((ch) => (
          <ChapterChip key={ch.key} ch={ch} numeric={numeric} row={rows.get(ch.key)} next={ch.key === nextKey} onOpen={onOpen} />
        ))}
      </div>
    </details>
  );
}

function ChapterChip({
  ch,
  numeric,
  row,
  next,
  onOpen,
}: {
  ch: TocChapter;
  numeric: boolean;
  row: LibraryText | undefined;
  next: boolean;
  onOpen: (key: string) => void;
}) {
  const state = chapterState(row);
  const label = `${ch.title} · L${ch.level} · ${ch.chars} 字${state === "read" ? " · read" : state === "started" ? " · started" : ""}`;
  if (numeric) {
    return (
      <button
        type="button"
        className={`ch-chip state-${state}${next ? " is-next" : ""}`}
        title={label}
        aria-label={label}
        onClick={() => onOpen(ch.key)}
      >
        {ch.label}
      </button>
    );
  }
  return (
    <button type="button" className={`toc-row sub state-${state}${next ? " is-next" : ""}`} onClick={() => onOpen(ch.key)}>
      <span className="toc-dot" aria-hidden="true" />
      <span className="toc-title" lang="zh-CN">
        {ch.label}
      </span>
      <span className="toc-meta">
        <LevelTag level={ch.level} />
        <span>{ch.chars.toLocaleString("en-US")} 字</span>
      </span>
    </button>
  );
}
