import type { Language, LibraryText, ReadingSession, WordRecord } from "../types";

/** Device-local reading-language preference (never synced). */
export const LANGUAGE_STORAGE_KEY = "duki.language";

export function readLanguage(storage: Pick<Storage, "getItem"> | null | undefined): Language {
  try {
    return storage?.getItem(LANGUAGE_STORAGE_KEY) === "en" ? "en" : "zh";
  } catch {
    return "zh";
  }
}

export function writeLanguage(storage: Pick<Storage, "setItem"> | null | undefined, lang: Language): void {
  try {
    storage?.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    /* session only */
  }
}

/**
 * English word records live in the shared words store under an `en:` prefix, so an English
 * "ok" can never collide with (or overwrite) a Mandarin record such as "OK" or "DNA".
 * Mandarin keys are untouched: every key without the prefix is Mandarin, exactly as today.
 */
export const EN_WORD_PREFIX = "en:";

export function isEnglishWordKey(key: string): boolean {
  return key.startsWith(EN_WORD_PREFIX);
}

export function wordStorageKey(lang: Language, key: string): string {
  return lang === "en" ? `${EN_WORD_PREFIX}${key.toLowerCase()}` : key;
}

/** Reader-facing view of the lexicon: Mandarin keys verbatim, English keys without the prefix. */
/** Strip the `en:` prefix for display and for the language-scoped word view. */
export function displayWordKey(key: string): string {
  return isEnglishWordKey(key) ? key.slice(EN_WORD_PREFIX.length) : key;
}

export function languageWordsView(words: Map<string, WordRecord>, lang: Language): Map<string, WordRecord> {
  const out = new Map<string, WordRecord>();
  for (const [key, rec] of words) {
    if (lang === "en") {
      if (isEnglishWordKey(key)) {
        const bare = displayWordKey(key);
        out.set(bare, rec.hanzi === bare ? rec : { ...rec, hanzi: bare });
      }
    } else if (!isEnglishWordKey(key)) {
      out.set(key, rec);
    }
  }
  return out;
}

export function textLanguage(text: Pick<LibraryText, "lang">): Language {
  return text.lang === "en" ? "en" : "zh";
}

/**
 * The cloud protocol this client speaks (v1) is Mandarin-only. Strip every English row before a
 * snapshot is merged or sent, so English data can neither leave the device nor be overwritten
 * by a v1 account body.
 */
export function mandarinOnly<T extends { words: WordRecord[]; texts: LibraryText[]; sessions: ReadingSession[] }>(
  snapshot: T,
): T {
  const englishTextIds = new Set(snapshot.texts.filter((t) => textLanguage(t) === "en").map((t) => t.id));
  return {
    ...snapshot,
    words: snapshot.words.filter((w) => !w?.hanzi || !isEnglishWordKey(w.hanzi)),
    texts: snapshot.texts.filter((t) => !englishTextIds.has(t.id)),
    sessions: snapshot.sessions.filter((s) => !englishTextIds.has(s.textId)),
  };
}

/**
 * Local-only build switch. Production syncs exactly as before (Mandarin only, v1). A build made
 * with VITE_DUKI_CLOUD_SYNC=off (e.g. a throwaway preview) turns off sign-in, pulls and PUTs.
 */
export function cloudSyncEnabled(env: Record<string, unknown> | undefined): boolean {
  return env?.VITE_DUKI_CLOUD_SYNC !== "off";
}

export function localOnlyBuild(): boolean {
  return !cloudSyncEnabled(import.meta.env as Record<string, unknown> | undefined);
}
