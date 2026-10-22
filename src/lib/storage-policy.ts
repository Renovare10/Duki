import type { LibraryText } from "../types";

// Decimal MB, matching the user-facing label. No limit on story count.
// The 1 MB allowance counts ONLY uploaded/pasted story records (`kind: "paste"`), not
// saved words, progress, library listings, sessions or settings.
export const ACCOUNT_STORAGE_BYTES = 1_000_000;
export const LOCAL_STORAGE_BYTES = 1_000_000;
export const STORY_STORAGE_BYTES = 512_000;
// Whole-sync safety net (compact UTF-8 JSON of the full snapshot). Only saves that add or
// change an uploaded story are refused above it; ordinary users never get close
// (~0.12 MB listings + ~0.03 MB sessions + ~240 B per word + ≤1 MB uploads).
export const SYNC_SAFETY_BYTES = 6_000_000;
// The server's existing raw-body ceiling (8 MiB). Nothing larger can be saved at all.
export const SYNC_HARD_MAX_BYTES = 8 * 1024 * 1024;
// Backups include cached public-domain/catalog bodies and pretty-printing.
export const IMPORT_FILE_BYTES = 25_000_000;
export const TEXT_ONLY_MESSAGE = "Text only: use a UTF-8 .txt story, pasted text, or a Duki text-only .json backup. Images, PDFs, documents, audio and embedded binary/base64 are not accepted.";

export function jsonBytes(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}

/** Bytes of uploaded stories: each pasted story's compact UTF-8 JSON record, summed. */
export function uploadedStoryBytes(texts: readonly LibraryText[]): number {
  let total = 0;
  for (const text of texts) if (text.kind === "paste") total += jsonBytes(text);
  return total;
}

export function storageLabel(bytes: number, cap: number): string {
  let used = (bytes / 1_000_000).toFixed(1);
  // Never round a non-empty library to "0.0" or an under-cap one up to the cap.
  if (bytes > 0 && used === "0.0") used = "<0.1";
  else if (bytes < cap && Number(used) * 1_000_000 >= cap) used = (Math.floor(bytes / 10_000) / 100).toFixed(2);
  return `${used} MB of ${cap / 1_000_000} MB`;
}

/** Conservative text-only boundary; a file extension alone is never trusted. */
export function assertPlainText(value: string): void {
  // Undo only line wrapping (base64 is wrapped at 64/76 columns); spaces still separate
  // ordinary English words, so prose is not mistaken for an encoded blob.
  const compact = value.replace(/[\r\n]+[ \t]*/g, "");
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\ufffd]/u.test(value) ||
      /(?:\bdata\s*:\s*[\w.+-]+\/[\w.+-]+\s*[;,]|\bblob\s*:\s*(?:https?|null)|base64\s*[:,;]|<\s*\/?\s*(?:html|img|svg|script|iframe|object|embed|audio|video)\b)/iu.test(value) ||
      /^(?:%PDF-|PK\u0003\u0004|GIF8[79]a|RIFF|\u0089PNG)/u.test(value) ||
      /(?:JVBERi0|iVBORw0KGgo|R0lGOD[lh]|UEsDB|0M8R4KGxGuE|UklGR|SUQz)/u.test(compact) ||
      /[A-Za-z0-9+/_-]{256,}={0,2}/u.test(compact)) {
    throw new Error(TEXT_ONLY_MESSAGE);
  }
}

const TEXT_KEYS = new Set("id title blurb body kind category featured createdAt readAt bookmark source sourceUrl wikiTitle wsTitle gutenbergId author coverUrl seriesId seriesTitle chapter preview openedAt".split(" "));
const WORD_KEYS = new Set("hanzi status updatedAt dontKnowCount barelyCount okayCount ease intervalDays repetitions dueAt phase step lapses introducedAt".split(" "));
const SESSION_KEYS = new Set("id textId finishedAt uniqueUnknown uniqueShaky durationMs".split(" "));
const SETTINGS_KEYS = new Set("fontFamily fontSize theme themeSetAt highlightStyle textWidth readerSetAt".split(" "));

function plainRow(raw: unknown, keys: Set<string>, bookmark = false): void {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error(TEXT_ONLY_MESSAGE);
  for (const [key, value] of Object.entries(raw)) {
    if (!keys.has(key)) throw new Error(TEXT_ONLY_MESSAGE);
    if (bookmark && key === "bookmark" && value !== null) {
      plainRow(value, new Set(["tokenIndex", "scrollY"]));
    } else if (typeof value === "string") {
      assertPlainText(value);
    } else if (value !== null && value !== undefined && typeof value !== "boolean" &&
               !(typeof value === "number" && Number.isFinite(value))) {
      throw new Error(TEXT_ONLY_MESSAGE);
    }
  }
}

/** Validate the unnormalized input so hidden attachments cannot be discarded silently. */
export function assertTextOnlyPayload(raw: unknown, snapshot = false): void {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error(TEXT_ONLY_MESSAGE);
  const root = raw as Record<string, unknown>;
  const keys = new Set(snapshot
    ? ["v", "updatedAt", "words", "texts", "sessions", "settings"]
    : ["app", "version", "exportedAt", "words", "texts", "sessions", "settings"]);
  for (const [key, value] of Object.entries(root)) {
    if (!keys.has(key)) throw new Error(TEXT_ONLY_MESSAGE);
    if (key === "words" || key === "texts" || key === "sessions") {
      if (!Array.isArray(value)) throw new Error(TEXT_ONLY_MESSAGE);
      for (const row of value) plainRow(row, key === "words" ? WORD_KEYS : key === "texts" ? TEXT_KEYS : SESSION_KEYS, key === "texts");
    } else if (key === "settings" && value != null) {
      plainRow(value, SETTINGS_KEYS);
    } else if (typeof value === "string") {
      assertPlainText(value);
    } else if (value != null && !(typeof value === "number" && Number.isFinite(value))) {
      throw new Error(TEXT_ONLY_MESSAGE);
    }
  }
  for (const row of (root.texts ?? []) as Record<string, unknown>[]) {
    if (typeof row.id !== "string" || (row.body !== undefined && typeof row.body !== "string") ||
        (row.title !== undefined && typeof row.title !== "string") ||
        (row.blurb !== undefined && typeof row.blurb !== "string")) throw new Error(TEXT_ONLY_MESSAGE);
  }
}

function sameStory(a: LibraryText | undefined, b: LibraryText): boolean {
  return Boolean(a && a.body === b.body && a.title === b.title && a.blurb === b.blurb);
}

/** User-pasted stories that are new or whose text changed versus `existing`. */
export function changedStories(texts: LibraryText[], existing: LibraryText[] = []): LibraryText[] {
  const old = new Map(existing.map((text) => [text.id, text]));
  return texts.filter((text) => text.kind === "paste" && !sameStory(old.get(text.id), text));
}

/** Rows whose text is unchanged from data the user already had are grandfathered. */
export function withoutUnchangedStories<T extends { texts: LibraryText[] }>(payload: T, existing: LibraryText[]): T {
  const old = new Map(existing.map((text) => [text.id, text]));
  return { ...payload, texts: payload.texts.filter((text) => !sameStory(old.get(text.id), text)) };
}

/** Only new/changed uploads are subject to the per-story limit. Never alter old rows. */
export function assertNewStories(texts: LibraryText[], existing: LibraryText[] = []): void {
  const old = new Map(existing.map((text) => [text.id, text]));
  for (const text of texts) {
    const previous = old.get(text.id);
    if (sameStory(previous, text)) continue;
    if (text.kind !== "paste") continue;
    for (const field of [text.title, text.body, text.blurb]) assertPlainText(field);
    if (jsonBytes(text) > STORY_STORAGE_BYTES) throw new Error("Each new story must be at most 0.512 MB of plain text, including its metadata. Split this story into smaller parts.");
  }
}

/**
 * Over a limit, only NEW uploads are blocked. Data the user already has keeps working:
 * with `addsStories: false` (no new/changed pasted story; progress, words and settings
 * only) an over-cap legacy library still saves, restores and syncs.
 * - `cap`: uploaded-story allowance (1 MB), counted over pasted story records only;
 * - SYNC_SAFETY_BYTES: whole-snapshot safety net for saves that add/change a story.
 */
export function assertStorageLimit(
  payload: { texts: readonly LibraryText[] },
  cap: number,
  opts: { addsStories?: boolean } = {},
): void {
  if (opts.addsStories === false) return;
  const used = uploadedStoryBytes(payload.texts);
  if (used > cap) {
    throw new Error(`Storage limit reached (uploaded stories: ${storageLabel(used, cap)}). Existing stories are safe. New uploads are paused until storage is under the limit. Export a backup to keep a copy.`);
  }
  const total = jsonBytes(payload);
  if (total > SYNC_SAFETY_BYTES) {
    throw new Error(`Your synced library is over the ${SYNC_SAFETY_BYTES / 1_000_000} MB safety limit, so new uploads are paused. Existing stories, words and progress are safe and still sync. Export a backup to keep a copy.`);
  }
}

export function importFileKind(file: Pick<File, "name" | "type" | "size">): "txt" | "json" {
  const ext = file.name.toLowerCase().split(".").pop();
  const mime = file.type.toLowerCase().split(";")[0];
  if ((ext !== "txt" && ext !== "json") ||
      (mime && mime !== "application/octet-stream" && mime !== (ext === "txt" ? "text/plain" : "application/json"))) {
    throw new Error(TEXT_ONLY_MESSAGE);
  }
  if (file.size > IMPORT_FILE_BYTES) throw new Error("This text backup is too large to import (25 MB file limit). Your existing library has not changed.");
  return ext;
}

export async function readTextImport(file: File): Promise<{ kind: "txt" | "json"; content: string }> {
  const kind = importFileKind(file);
  let content: string;
  try {
    content = new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer());
  } catch {
    throw new Error(TEXT_ONLY_MESSAGE);
  }
  if (kind === "txt") assertPlainText(content);
  else if (!content.trimStart().startsWith("{")) throw new Error(TEXT_ONLY_MESSAGE);
  return { kind, content };
}
