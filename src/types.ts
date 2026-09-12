export type WordStatus = "unknown" | "shaky" | "known";

export type ReviewGrade = "again" | "hard" | "good" | "easy";

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

export type ReaderSettings = {
  fontFamily: "serif" | "sans" | "system";
  fontSize: number;
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
