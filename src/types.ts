export type WordStatus = "unknown" | "shaky" | "known";

export type ReviewGrade = "again" | "hard" | "good" | "easy";

/**
 * Spaced-repetition phase (Anki-style SM-2):
 * new → learning (minute steps) → review (day intervals) ⇄ relearning (after a lapse).
 */
export type CardPhase = "new" | "learning" | "review" | "relearning";

export type WordRecord = {
  hanzi: string;
  status: WordStatus;
  updatedAt: number;
  dontKnowCount: number;
  barelyCount: number;
  okayCount: number;
  ease: number;
  intervalDays: number;
  repetitions: number;
  dueAt: number | null;
  phase: CardPhase;
  /** Index into the learning / relearning steps while in those phases. */
  step: number;
  /** Times a review card was forgotten (Again in the review phase). */
  lapses: number;
  /** First time the card was graded in Review (for the new-cards-per-day limit). */
  introducedAt: number | null;
};

/**
 * One graded interaction with a word, appended for Stats history (local IndexedDB only;
 * not part of cloud sync or JSON backups). `source: "review"` is an SM-2 grade;
 * `source: "read"` is a reader tap (1/2/3). `prevStatus: null` means the word was new.
 */
export type WordEvent = {
  id: string;
  hanzi: string;
  at: number;
  source: "review" | "read";
  grade?: ReviewGrade;
  prevStatus: WordStatus | null;
  status: WordStatus;
  prevIntervalDays: number;
  intervalDays: number;
};

export type TextKind = "sample" | "paste" | "wiki" | "wikisource" | "gutenberg";

export type TextCategory =
  | "children"
  | "graded"
  | "story"
  | "science"
  | "history"
  | "article"
  | "novel"
  | "wiki"
  | "wikisource"
  | "gutenberg"
  | "paste";

export type Bookmark = {
  tokenIndex: number;
  scrollY: number;
};

export type LibraryText = {
  id: string;
  title: string;
  blurb: string;
  body: string;
  kind: TextKind;
  category: TextCategory;
  featured?: boolean;
  createdAt: number;
  readAt: number | null;
  bookmark: Bookmark | null;
  source?: string;
  sourceUrl?: string;
  wikiTitle?: string;
  wsTitle?: string;
  gutenbergId?: number;
  author?: string;
  coverUrl?: string;
  seriesId?: string;
  seriesTitle?: string;
  chapter?: number;
  preview?: boolean;
};

export type Token = {
  text: string;
  isWord: boolean;
  index: number;
};

export type TextScore = {
  total: number;
  known: number;
  shaky: number;
  unknown: number;
  knownPct: number;
  unknownLoad: number;
  unique: number;
  uniqueUnknown: number;
  uniqueShaky: number;
};

export type ReadingSession = {
  id: string;
  textId: string;
  finishedAt: number;
  uniqueUnknown: number;
  uniqueShaky: number;
  durationMs: number | null;
};

export type ReaderTheme = "paper" | "night";

export type ReaderSettings = {
  fontFamily: "serif" | "sans" | "system";
  fontSize: number;
  theme: ReaderTheme;
};

export type BackupFile = {
  app: "duki";
  version: 1 | 2;
  exportedAt: string;
  words: WordRecord[];
  texts: LibraryText[];
  sessions?: ReadingSession[];
  settings?: ReaderSettings;
};

export type Gloss = {
  pinyin: string;
  english: string;
};
