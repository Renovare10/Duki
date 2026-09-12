import type { Book } from "../lib/books";
import { bookProgress, chapterLabel, continueChapter } from "../lib/books";
import type { LibraryText, TextScore } from "../types";
import { TitleCard } from "./Home";

type Props = {
  book: Book;
  scores: Map<string, TextScore>;
  wikiErrors?: Record<string, string>;
  wikiLoading?: string | null;
  onBack: () => void;
  onOpenChapter: (id: string) => void;
  onScore?: (id: string) => void;
  onMarkRead: (id: string, read: boolean) => void;
};

export function BookScreen({
  book,
  scores,
  wikiErrors,
  wikiLoading,
  onBack,
  onOpenChapter,
  onScore,
  onMarkRead,
}: Props) {
  const progress = bookProgress(book.chapters);
  const resume = continueChapter(book.chapters);
  const resumeText =
    resume && (progress === "in-progress" || !resume.readAt) ? resume : null;

  return (
    <div className="home">
      <button type="button" className="ghost shelf-back" onClick={onBack}>
        ← Back
      </button>
      <div className="home-hero-copy">
        <h1>{book.title}</h1>
        <p>
          {book.author ? `${book.author} · ` : ""}
          {book.chapters.length} chapters
          {progress === "read" ? " · Read" : progress === "in-progress" ? " · In progress" : " · Unread"}
        </p>
        {book.blurb ? <p className="title-blurb">{book.blurb}</p> : null}
      </div>
      {resumeText ? (
        <p className="home-foot">
          <button type="button" className="primary done-btn" onClick={() => onOpenChapter(resumeText.id)}>
            Continue · {chapterLabel(resumeText)}
          </button>
        </p>
      ) : null}
      <h2 className="shelf-title">Chapters</h2>
      <div className="shelf-grid">
        {book.chapters.map((chapter) => (
          <ChapterRow
            key={chapter.id}
            text={chapter}
            score={scores.get(chapter.id)}
            error={wikiErrors?.[chapter.id]}
            loading={wikiLoading === chapter.id}
            onOpen={onOpenChapter}
            onScore={onScore}
            onMarkRead={onMarkRead}
          />
        ))}
      </div>
    </div>
  );
}

function ChapterRow({
  text,
  score,
  error,
  loading,
  onOpen,
  onScore,
  onMarkRead,
}: {
  text: LibraryText;
  score: TextScore | undefined;
  error?: string;
  loading?: boolean;
  onOpen: (id: string) => void;
  onScore?: (id: string) => void;
  onMarkRead: (id: string, read: boolean) => void;
}) {
  return (
    <TitleCard
      text={text}
      score={score}
      error={error}
      loading={loading}
      onOpen={onOpen}
      onScore={onScore}
      onMarkRead={onMarkRead}
    />
  );
}
