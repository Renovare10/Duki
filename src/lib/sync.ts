import type { LibraryText, ReaderSettings, ReadingSession, WordRecord } from "../types";
import { dukiApiBase } from "./gutenberg";
import { normalizeText } from "./text";
import { normalizeWord } from "./word";

export const SYNC_MAX_BYTES = 8 * 1024 * 1024;

export type SyncSnapshot = {
  v: 1;
  updatedAt: number;
  words: WordRecord[];
  texts: LibraryText[];
  sessions: ReadingSession[];
  settings: ReaderSettings | null;
};

export function packSnapshot(input: {
  words: WordRecord[];
  texts: LibraryText[];
  sessions: ReadingSession[];
  settings: ReaderSettings;
  now?: number;
}): SyncSnapshot {
  const sessions = [...input.sessions]
    .sort((a, b) => b.finishedAt - a.finishedAt)
    .slice(0, 200);
  return {
    v: 1,
    updatedAt: input.now ?? Date.now(),
    words: input.words,
    texts: input.texts.map(stripCatalogBody),
    sessions,
    settings: input.settings,
  };
}

function stripCatalogBody(text: LibraryText): LibraryText {
  if (text.kind === "paste") return text;
  return { ...text, body: "" };
}

export function knownWordCount(snapshot: SyncSnapshot): number {
  let n = 0;
  for (const word of snapshot.words) {
    if (word?.status === "known") n += 1;
  }
  return n;
}

/** Richer lexicon wins; if tied, the more recently updated snapshot is the default. */
export function preferSnapshot(a: SyncSnapshot, b: SyncSnapshot): SyncSnapshot {
  const ka = knownWordCount(a);
  const kb = knownWordCount(b);
  if (ka !== kb) return ka > kb ? a : b;
  return a.updatedAt >= b.updatedAt ? a : b;
}

export function mergeSnapshots(local: SyncSnapshot, remote: SyncSnapshot): SyncSnapshot {
  const preferred = preferSnapshot(local, remote);
  const other = preferred === local ? remote : local;

  const words = new Map<string, WordRecord>();
  for (const word of preferred.words) {
    if (word?.hanzi) words.set(word.hanzi, normalizeWord(word));
  }
  for (const word of other.words) {
    if (!word?.hanzi) continue;
    const have = words.get(word.hanzi);
    if (!have || word.updatedAt > have.updatedAt) words.set(word.hanzi, normalizeWord(word));
  }

  const texts = new Map<string, LibraryText>();
  for (const text of preferred.texts) {
    if (text?.id) texts.set(text.id, mergeText(undefined, text));
  }
  for (const text of other.texts) {
    if (!text?.id) continue;
    texts.set(text.id, mergeText(texts.get(text.id), text));
  }

  const sessions = new Map<string, ReadingSession>();
  for (const session of [...preferred.sessions, ...other.sessions]) {
    if (session?.id && session.textId) sessions.set(session.id, session);
  }

  const settings = preferred.settings || other.settings;

  return {
    v: 1,
    updatedAt: Math.max(local.updatedAt, remote.updatedAt, Date.now()),
    words: [...words.values()],
    texts: [...texts.values()],
    sessions: [...sessions.values()].sort((a, b) => b.finishedAt - a.finishedAt).slice(0, 200),
    settings,
  };
}

function mergeText(a: LibraryText | undefined, b: LibraryText): LibraryText {
  const nb = normalizeText({ ...b, body: b.body ?? "" });
  if (!a) return nb;
  const na = normalizeText({ ...a, body: a.body ?? "" });
  const readAt = pickReadAt(na.readAt, nb.readAt);
  const bookmark = pickBookmark(na.bookmark, nb.bookmark);
  const body = na.body.trim().length >= nb.body.trim().length ? na.body : nb.body;
  return {
    ...nb,
    ...na,
    title: na.title && na.title !== "Untitled" ? na.title : nb.title,
    body,
    readAt,
    bookmark,
    wikiTitle: na.wikiTitle || nb.wikiTitle,
    wsTitle: na.wsTitle || nb.wsTitle,
    gutenbergId: na.gutenbergId ?? nb.gutenbergId,
    sourceUrl: na.sourceUrl || nb.sourceUrl,
  };
}

function pickReadAt(a: number | null, b: number | null): number | null {
  if (a && b) return Math.min(a, b);
  return a ?? b;
}

function pickBookmark(
  a: LibraryText["bookmark"],
  b: LibraryText["bookmark"],
): LibraryText["bookmark"] {
  if (!a) return b;
  if (!b) return a;
  return a.tokenIndex >= b.tokenIndex ? a : b;
}

export function snapshotBytes(snapshot: SyncSnapshot): number {
  return new TextEncoder().encode(JSON.stringify(snapshot)).length;
}

export function parseSnapshot(raw: unknown): SyncSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Partial<SyncSnapshot>;
  if (data.v !== 1) return null;
  const words = Array.isArray(data.words) ? data.words.filter((w) => w?.hanzi).map((w) => normalizeWord(w)) : [];
  const texts = Array.isArray(data.texts)
    ? data.texts.filter((t) => t?.id).map((t) => normalizeText({ ...t, body: t.body ?? "" }))
    : [];
  const sessions = Array.isArray(data.sessions)
    ? data.sessions.filter((s) => s?.id && s.textId)
    : [];
  return {
    v: 1,
    updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : 0,
    words,
    texts,
    sessions,
    settings: data.settings ?? null,
  };
}

export async function pullSnapshot(idToken: string, fetchImpl: typeof fetch = fetch): Promise<SyncSnapshot | null> {
  const base = dukiApiBase();
  if (!base) return null;
  const res = await fetchImpl(`${base}/me`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (res.status === 401 || res.status === 403) throw new Error("Sign in expired.");
  if (!res.ok) throw new Error("Could not load account library.");
  return parseSnapshot(await res.json());
}

export async function pushSnapshot(
  idToken: string,
  snapshot: SyncSnapshot,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const base = dukiApiBase();
  if (!base) return;
  const body = JSON.stringify(snapshot);
  if (body.length > SYNC_MAX_BYTES) throw new Error("Library is over the 8 MB account limit.");
  const res = await fetchImpl(`${base}/me`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body,
  });
  if (res.status === 413) throw new Error("Library is over the 8 MB account limit.");
  if (res.status === 401 || res.status === 403) throw new Error("Sign in expired.");
  if (!res.ok && res.status !== 204) throw new Error("Could not save account library.");
}
