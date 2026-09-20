import type {
  BackupFile,
  LibraryText,
  ReaderSettings,
  ReadingSession,
  WordRecord,
} from "../types";
import { normalizeText } from "./text";
import { normalizeWord } from "./word";

const DB_NAME = "duki";
export const DB_VERSION = 5;

const STORES = ["words", "texts", "sessions", "settings"] as const;

export const DEFAULT_SETTINGS: ReaderSettings = {
  fontFamily: "serif",
  fontSize: 28,
  theme: "paper",
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (event) => {
      const db = req.result;
      const tx = req.transaction;
      if (!tx) return;
      if (!db.objectStoreNames.contains("words")) {
        db.createObjectStore("words", { keyPath: "hanzi" });
      }
      if (!db.objectStoreNames.contains("texts")) {
        db.createObjectStore("texts", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("sessions")) {
        db.createObjectStore("sessions", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
      if (event.oldVersion < 2) {
        migrateStore(tx.objectStore("words"), (value) => {
          if (!value || typeof value !== "object" || !("hanzi" in value)) return null;
          return normalizeWord(value as WordRecord);
        });
      }
      if (event.oldVersion < 5) {
        migrateStore(tx.objectStore("texts"), (value) => {
          if (!value || typeof value !== "object" || !("id" in value) || !("body" in value)) {
            return null;
          }
          return normalizeText(value as LibraryText);
        });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function migrateStore(
  store: IDBObjectStore,
  map: (value: unknown) => unknown,
): void {
  const cursorReq = store.openCursor();
  cursorReq.onsuccess = () => {
    const cursor = cursorReq.result;
    if (!cursor) return;
    const next = map(cursor.value);
    if (next) cursor.update(next);
    cursor.continue();
  };
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function loadAll(): Promise<{
  words: WordRecord[];
  texts: LibraryText[];
  sessions: ReadingSession[];
  settings: ReaderSettings;
}> {
  const db = await openDb();
  const tx = db.transaction([...STORES], "readonly");
  const wordsRaw = await reqToPromise(
    tx.objectStore("words").getAll() as IDBRequest<WordRecord[]>,
  );
  const textsRaw = await reqToPromise(
    tx.objectStore("texts").getAll() as IDBRequest<LibraryText[]>,
  );
  const sessionsRaw = await reqToPromise(
    tx.objectStore("sessions").getAll() as IDBRequest<ReadingSession[]>,
  );
  const settingsRow = await reqToPromise(
    tx.objectStore("settings").get("reader") as IDBRequest<{ key: string } & ReaderSettings | undefined>,
  );
  await txDone(tx);
  db.close();
  return {
    words: wordsRaw.map((w) => normalizeWord(w)),
    texts: textsRaw.map((t) => normalizeText(t)),
    sessions: (sessionsRaw || []).filter((s) => s?.id && s.textId),
    settings: normalizeSettings(settingsRow),
  };
}

export function normalizeSettings(raw: Partial<ReaderSettings> | undefined): ReaderSettings {
  const fontFamily =
    raw?.fontFamily === "sans" || raw?.fontFamily === "system" || raw?.fontFamily === "serif"
      ? raw.fontFamily
      : DEFAULT_SETTINGS.fontFamily;
  const fontSize =
    typeof raw?.fontSize === "number"
      ? Math.min(42, Math.max(18, Math.round(raw.fontSize)))
      : DEFAULT_SETTINGS.fontSize;
  const theme = raw?.theme === "night" || raw?.theme === "paper" ? raw.theme : DEFAULT_SETTINGS.theme;
  return { fontFamily, fontSize, theme };
}

export async function putWord(record: WordRecord): Promise<void> {
  const db = await openDb();
  const tx = db.transaction("words", "readwrite");
  tx.objectStore("words").put(normalizeWord(record));
  await txDone(tx);
  db.close();
}

export async function putText(text: LibraryText): Promise<void> {
  const db = await openDb();
  const tx = db.transaction("texts", "readwrite");
  tx.objectStore("texts").put(normalizeText(text));
  await txDone(tx);
  db.close();
}

export async function deleteText(id: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction("texts", "readwrite");
  tx.objectStore("texts").delete(id);
  await txDone(tx);
  db.close();
}

export async function putSession(session: ReadingSession): Promise<void> {
  const db = await openDb();
  const tx = db.transaction("sessions", "readwrite");
  tx.objectStore("sessions").put(session);
  await txDone(tx);
  db.close();
}

export async function putSettings(settings: ReaderSettings): Promise<void> {
  const db = await openDb();
  const tx = db.transaction("settings", "readwrite");
  tx.objectStore("settings").put({ key: "reader", ...normalizeSettings(settings) });
  await txDone(tx);
  db.close();
}

/** Write a merged account snapshot without deleting catalog rows that aren't in it. */
export async function applySyncState(input: {
  words: WordRecord[];
  texts: LibraryText[];
  sessions: ReadingSession[];
  settings: ReaderSettings | null;
}): Promise<void> {
  const db = await openDb();
  const tx = db.transaction([...STORES], "readwrite");
  const wordStore = tx.objectStore("words");
  const textStore = tx.objectStore("texts");
  const sessionStore = tx.objectStore("sessions");
  const settingsStore = tx.objectStore("settings");
  for (const word of input.words) {
    if (word?.hanzi) wordStore.put(normalizeWord(word));
  }
  for (const incoming of input.texts) {
    if (!incoming?.id) continue;
    const existing = await reqToPromise(
      textStore.get(incoming.id) as IDBRequest<LibraryText | undefined>,
    );
    const body = incoming.body?.trim() ? incoming.body : existing?.body || "";
    textStore.put(
      normalizeText({
        ...(existing || incoming),
        ...incoming,
        body,
        readAt: incoming.readAt ?? existing?.readAt ?? null,
        bookmark: incoming.bookmark ?? existing?.bookmark ?? null,
      }),
    );
  }
  for (const session of input.sessions) {
    if (session?.id && session.textId) sessionStore.put(session);
  }
  if (input.settings) {
    settingsStore.put({ key: "reader", ...normalizeSettings(input.settings) });
  }
  await txDone(tx);
  db.close();
}

export async function importBackup(
  backup: BackupFile,
  catalog: LibraryText[],
): Promise<{
  words: WordRecord[];
  texts: LibraryText[];
  sessions: ReadingSession[];
  settings: ReaderSettings;
}> {
  const db = await openDb();
  const tx = db.transaction([...STORES], "readwrite");
  const wordStore = tx.objectStore("words");
  const textStore = tx.objectStore("texts");
  const sessionStore = tx.objectStore("sessions");
  const settingsStore = tx.objectStore("settings");

  for (const word of backup.words) {
    if (!word?.hanzi) continue;
    if (word.status !== "unknown" && word.status !== "shaky" && word.status !== "known") {
      continue;
    }
    wordStore.put(normalizeWord(word));
  }

  const incoming = new Map<string, LibraryText>();
  for (const text of backup.texts || []) {
    if (!text?.id || !text.body) continue;
    incoming.set(text.id, normalizeText(text));
  }
  for (const sample of catalog) {
    const existing = incoming.get(sample.id);
    if (!existing) incoming.set(sample.id, sample);
    else {
      incoming.set(sample.id, {
        ...sample,
        readAt: existing.readAt,
        bookmark: existing.bookmark,
      });
    }
  }
  for (const text of incoming.values()) textStore.put(text);

  for (const session of backup.sessions || []) {
    if (!session?.id || !session.textId) continue;
    sessionStore.put(session);
  }
  if (backup.settings) {
    settingsStore.put({ key: "reader", ...normalizeSettings(backup.settings) });
  }

  await txDone(tx);
  db.close();
  return loadAll();
}

export function parseBackup(raw: unknown): BackupFile {
  if (!raw || typeof raw !== "object") throw new Error("Not a Duki backup file.");
  const data = raw as Partial<BackupFile>;
  if (data.app !== "duki") throw new Error("Not a Duki backup file.");
  if (data.version !== 1 && data.version !== 2) {
    throw new Error("Unsupported backup version.");
  }
  if (!Array.isArray(data.words) || !Array.isArray(data.texts)) {
    throw new Error("Backup is missing words or texts.");
  }
  return {
    app: "duki",
    version: data.version,
    exportedAt: typeof data.exportedAt === "string" ? data.exportedAt : new Date().toISOString(),
    words: data.words.map((w) => normalizeWord(w)),
    texts: data.texts
      .filter((t) => t?.id && t.body)
      .map((t) => normalizeText(t)),
    sessions: Array.isArray(data.sessions) ? data.sessions : [],
    settings: data.settings ? normalizeSettings(data.settings) : undefined,
  };
}
