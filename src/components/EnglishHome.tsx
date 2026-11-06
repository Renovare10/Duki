import type { LibraryText, TextScore } from "../types";
import { TitleCard } from "./Home";

type Props = {
  texts: LibraryText[];
  scores: Map<string, TextScore>;
  onOpen: (id: string) => void;
  onMarkRead: (id: string, read: boolean) => void;
};

/** Same cover cards and reader as Mandarin; no remote catalog or grading claims. */
export function EnglishHome({ texts, scores, onOpen, onMarkRead }: Props) {
  return (
    <div className="home" lang="en">
      <div className="home-hero-copy">
        <h1>English samples</h1>
        <p>Three short stubs to try the reader. Real story packs and a full dictionary come later.</p>
      </div>
      {[{ title: "Starter", items: texts.slice(0, 2) }, { title: "Next step", items: texts.slice(2) }].map((shelf) => (
        <section className="shelf" key={shelf.title}>
          <h2 className="shelf-title">{shelf.title}</h2>
          <div className="shelf-track">
            {shelf.items.map((text) => (
              <TitleCard key={text.id} text={text} score={scores.get(text.id)}
                onOpen={onOpen} onMarkRead={onMarkRead} />
            ))}
          </div>
        </section>
      ))}
      <p className="fine-print">Other English shelves, uploads, review and stats are deferred in this draft.</p>
    </div>
  );
}
