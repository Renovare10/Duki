import { useEffect, useMemo, useState } from "react";
import type { LibraryText, ReadingSession, TextCategory, TextScore } from "../types";
import { coveragePercents, fitLabel } from "../lib/score";
import {
  buildShelves,
  type CategoryFilter,
  type HomeFilters,
  type LevelFilter,
  type ReadFilter,
  type Shelf,
} from "../lib/shelves";
import { bookProgress, itemId, type Book, type ShelfItem } from "../lib/books";
import { cardHitAction } from "../lib/card-hit";
import { bookmarkProgress } from "../lib/text";

type Props = {
  texts: LibraryText[];
  scores: Map<string, TextScore>;
  sessions: ReadingSession[];
  openShelf: string | null;
  onOpenShelf: (id: string | null) => void;
  onOpen: (id: string) => void;
  onOpenBook: (seriesId: string) => void;
  onScore?: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkRead: (id: string, read: boolean) => void;
  onAddText: () => void;
  onRemoteSearch?: (query: string) => void;
  wikiErrors?: Record<string, string>;
  wikiLoading?: string | null;
};

const LEVELS: { id: LevelFilter; label: string }[] = [
  { id: "just-right", label: "Just right" },
  { id: "easy", label: "Easy" },
  { id: "hard", label: "Harder" },
  { id: "all", label: "All levels" },
  { id: "known", label: "Already known" },
];

const READS: { id: ReadFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
];

const CATS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "story", label: "Stories" },
  { id: "children", label: "Children" },
  { id: "science", label: "Science" },
  { id: "history", label: "History" },
  { id: "graded", label: "Graded" },
  { id: "article", label: "Articles" },
  { id: "novel", label: "Novels" },
  { id: "wiki", label: "Wikipedia" },
  { id: "wikisource", label: "Wikisource" },
  { id: "paste", label: "Yours" },
];

const DIFFICULTY = {
  "just-right": "Just right",
  easy: "Easy",
  hard: "Harder",
} as const;

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

export function Home({
  texts,
  scores,
  sessions,
  openShelf,
  onOpenShelf,
  onOpen,
  onOpenBook,
  onScore,
  onDelete,
  onMarkRead,
  onAddText,
  onRemoteSearch,
  wikiErrors,
  wikiLoading,
}: Props) {
  const [level, setLevel] = useState<LevelFilter>(loadLevel);
  const [read, setRead] = useState<ReadFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");

  const filters: HomeFilters = { level, read, category, query };

  useEffect(() => {
    if (!onRemoteSearch) return;
    const t = window.setTimeout(() => onRemoteSearch(query), 400);
    return () => window.clearTimeout(t);
  }, [query]);

  const shelves = useMemo(
    () => buildShelves(texts, scores, sessions, filters),
    [texts, scores, sessions, level, read, category, query],
  );

  const active = openShelf
    ? buildShelves(texts, scores, sessions, { ...filters, category: "all" }).find(
        (s) => s.id === openShelf,
      ) ?? null
    : null;

  return (
    <div className="home">
      <div className="home-hero-copy">
        <h1>Read Chinese stories at your level.</h1>
        <p>Tap a word if you need it. Keep going if you don’t.</p>
      </div>

      <div className="home-controls">
        <input
          type="search"
          className="home-search"
          placeholder="Search titles, Wikipedia, Wikisource…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search the library"
        />
        <div className="filters" role="toolbar" aria-label="Library filters">
          <div className="filter-row">
            {LEVELS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`chip${level === item.id ? " on" : ""}`}
                aria-pressed={level === item.id}
                onClick={() => {
                  setLevel(item.id);
                  saveLevel(item.id);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="filter-row">
            {READS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`chip${read === item.id ? " on" : ""}`}
                aria-pressed={read === item.id}
                onClick={() => setRead(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="filter-row">
            {CATS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`chip${category === item.id ? " on" : ""}`}
                aria-pressed={category === item.id}
                onClick={() => setCategory(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {active ? (
        <section>
          <button type="button" className="ghost shelf-back" onClick={() => onOpenShelf(null)}>
            ← Back
          </button>
          <h2 className="shelf-title">{active.title}</h2>
          <div className="shelf-grid">
            {active.items.map((item) => (
              <ShelfCard
                key={itemId(item)}
                item={item}
                scores={scores}
                tag={active.tags?.[itemId(item)]}
                wikiErrors={wikiErrors}
                wikiLoading={wikiLoading}
                onOpen={onOpen}
                onOpenBook={onOpenBook}
                onScore={onScore}
                onDelete={onDelete}
                onMarkRead={onMarkRead}
              />
            ))}
          </div>
        </section>
      ) : (
        <>
          {shelves.length === 0 ? (
            <p className="fine-print">Nothing in this filter. Try All levels, or add your own text.</p>
          ) : null}
          {shelves.map((shelf) => (
            <Carousel
              key={shelf.id}
              shelf={shelf}
              scores={scores}
              wikiErrors={wikiErrors}
              wikiLoading={wikiLoading}
              onOpenShelf={onOpenShelf}
              onOpen={onOpen}
              onOpenBook={onOpenBook}
              onScore={onScore}
              onDelete={onDelete}
              onMarkRead={onMarkRead}
            />
          ))}
        </>
      )}

      <p className="home-foot">
        <button type="button" className="ghost" onClick={onAddText}>
          Add your own
        </button>
        <span>
          Original stories, Wikipedia (CC BY-SA), and Wikisource.
          Paste books you own.
        </span>
      </p>
    </div>
  );
}

function Carousel({
  shelf,
  scores,
  wikiErrors,
  wikiLoading,
  onOpenShelf,
  onOpen,
  onOpenBook,
  onScore,
  onDelete,
  onMarkRead,
}: {
  shelf: Shelf;
  scores: Map<string, TextScore>;
  wikiErrors?: Record<string, string>;
  wikiLoading?: string | null;
  onOpenShelf: (id: string) => void;
  onOpen: (id: string) => void;
  onOpenBook: (seriesId: string) => void;
  onScore?: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkRead: (id: string, read: boolean) => void;
}) {
  return (
    <section className="shelf">
      <button type="button" className="shelf-title-btn" onClick={() => onOpenShelf(shelf.id)}>
        {shelf.title}
        <span className="shelf-count">{shelf.items.length}</span>
      </button>
      <div className="shelf-track">
        {shelf.items.map((item) => (
          <ShelfCard
            key={itemId(item)}
            item={item}
            scores={scores}
            tag={shelf.tags?.[itemId(item)]}
            wikiErrors={wikiErrors}
            wikiLoading={wikiLoading}
            onOpen={onOpen}
            onOpenBook={onOpenBook}
            onScore={onScore}
            onDelete={onDelete}
            onMarkRead={onMarkRead}
          />
        ))}
      </div>
    </section>
  );
}

function ShelfCard({
  item,
  scores,
  tag,
  wikiErrors,
  wikiLoading,
  onOpen,
  onOpenBook,
  onScore,
  onDelete,
  onMarkRead,
}: {
  item: ShelfItem;
  scores: Map<string, TextScore>;
  tag?: string;
  wikiErrors?: Record<string, string>;
  wikiLoading?: string | null;
  onOpen: (id: string) => void;
  onOpenBook: (seriesId: string) => void;
  onScore?: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkRead: (id: string, read: boolean) => void;
}) {
  if (item.type === "book") {
    return (
      <BookCard
        book={item.book}
        tag={tag}
        onOpen={() => onOpenBook(item.book.id)}
      />
    );
  }
  return (
    <TitleCard
      text={item.text}
      score={scores.get(item.text.id)}
      tag={tag}
      error={wikiErrors?.[item.text.id]}
      loading={wikiLoading === item.text.id}
      onOpen={onOpen}
      onScore={onScore}
      onDelete={onDelete}
      onMarkRead={onMarkRead}
    />
  );
}

function BookCard({
  book,
  tag,
  onOpen,
}: {
  book: Book;
  tag?: string;
  onOpen: () => void;
}) {
  const progress = bookProgress(book.chapters);
  const label = progress === "read" ? "Read" : progress === "in-progress" ? "In progress" : "Unread";
  return (
    <article className="title-card">
      <button type="button" className="title-hit" onClick={onOpen}>
        <Cover category={book.category} coverUrl={book.coverUrl} tag={tag} />
        <div className="title-copy">
          <div className="title-card-name">{book.title}</div>
          {book.blurb ? <p className="title-blurb">{book.blurb}</p> : null}
        </div>
      </button>
      <div className="title-copy title-meta">
        <div className="lib-meta">
          <span className={`read-pill${progress === "read" ? " on" : ""}`}>{label}</span>
          {book.author ? <span>{book.author}</span> : null}
          <span>{book.chapters.length} chapters</span>
          <span className="cat-tag">{categoryLabel(book.category)}</span>
        </div>
      </div>
    </article>
  );
}

export function TitleCard({
  text,
  score,
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
  tag?: string;
  error?: string;
  loading?: boolean;
  onOpen: (id: string) => void;
  onScore?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMarkRead?: (id: string, read: boolean) => void;
}) {
  const stub = !(text.body || "").trim();
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
          <div className="title-card-name">{text.title}</div>
          {text.blurb ? <p className="title-blurb">{text.blurb}</p> : null}
          {loading ? <p className="title-blurb">Scoring…</p> : null}
          {error ? <p className="wiki-error">{error}</p> : null}
        </div>
      </button>
      <div className="title-copy title-meta">
        <CardMeta
          text={text}
          score={score}
          loading={loading}
          onUnscored={(e) => run("unscored", e)}
        />
      </div>
      <div className="card-actions" onClick={(e) => e.stopPropagation()}>
        {stub ? (
          <button
            type="button"
            className="ghost"
            onClick={(e) => run("score", e)}
            disabled={loading}
          >
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
  score,
  loading,
  onUnscored,
}: {
  text: LibraryText;
  score?: TextScore;
  loading?: boolean;
  onUnscored?: (event: { stopPropagation: () => void }) => void;
}) {
  const label = score && score.total > 0 ? fitLabel(score) : "unscored";
  const pct = score ? coveragePercents(score) : null;
  const progress = score ? bookmarkProgress(text.bookmark, score.total) : null;
  const stub = !(text.body || "").trim();
  return (
    <div className="lib-meta">
      <span className={`read-pill${text.readAt ? " on" : ""}`}>{text.readAt ? "Read" : "Unread"}</span>
      {label !== "unscored" ? (
        <span className={`badge ${label}`}>{DIFFICULTY[label]}</span>
      ) : loading ? (
        <span className="badge new">Scoring…</span>
      ) : stub ? (
        <button type="button" className="badge new" onClick={(e) => onUnscored?.(e)}>
          Unscored
        </button>
      ) : null}
      <span className="cat-tag">{categoryLabel(text.category)}</span>
      {score && score.total > 0 ? <span>{score.uniqueUnknown} new</span> : null}
      {pct && score && score.total > 0 ? <span>{pct.unknown}% unknown</span> : null}
      {progress != null && !text.readAt ? <span>Resume · {progress}%</span> : null}
    </div>
  );
}

function Cover({
  category,
  coverUrl,
  tag,
}: {
  category: TextCategory;
  coverUrl?: string;
  tag?: string;
}) {
  return (
    <div className={`cover-art cover-${category}`} aria-hidden="true">
      {coverUrl ? <img className="cover-photo" src={coverUrl} alt="" /> : null}
      <span className="blob a" />
      <span className="blob b" />
      <span className="blob c" />
      {tag ? <span className="cover-tag">{tag}</span> : null}
    </div>
  );
}

function categoryLabel(category: TextCategory): string {
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
