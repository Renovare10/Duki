import type { LibraryText, TextScore } from "../types";
import { TitleCard } from "./Home";

type Props = {
  texts: LibraryText[];
  scores: Map<string, TextScore>;
  onOpen: (id: string) => void;
  onMarkRead: (id: string, read: boolean) => void;
};

/** English side skeleton: same cover cards and reader as Mandarin once stories exist. */
export function EnglishHome({ texts, scores, onOpen, onMarkRead }: Props) {
  return (
    <div className="home" lang="en">
      <div className="home-hero-copy">
        <h1>English</h1>
        <p>Your English library will live here. Stories are coming soon.</p>
      </div>
      <section className="shelf" aria-label="English stories">
        <h2 className="shelf-title">Stories</h2>
        {texts.length === 0 ? (
          <div className="en-empty" role="status">
            <p className="en-empty-title">No English stories yet</p>
            <p className="en-empty-copy">When stories are added they'll show up here, ready to read.</p>
          </div>
        ) : (
          <div className="shelf-track">
            {texts.map((text) => (
              <TitleCard key={text.id} text={text} score={scores.get(text.id)}
                onOpen={onOpen} onMarkRead={onMarkRead} />
            ))}
          </div>
        )}
      </section>
      <p className="fine-print">Review, stats and adding your own text are Mandarin-only for now.</p>
    </div>
  );
}
