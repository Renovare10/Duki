import type { LibraryText } from "../types";

// Decimal MB, matching the user-facing label. No limit on story count.
export const ACCOUNT_STORAGE_BYTES = 1_000_000;
export const LOCAL_STORAGE_BYTES = 1_000_000;
export const STORY_STORAGE_BYTES = 512_000;
// Backups include cached public-domain/catalog bodies and pretty-printing.
export const IMPORT_FILE_BYTES = 25_000_000;
export const TEXT_ONLY_MESSAGE = "Text only: use a UTF-8 .txt story, pasted text, or a Duki text-only .json backup. Images, PDFs, documents, audio and embedded binary/base64 are not accepted.";

export function jsonBytes(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}

export function storageLabel(bytes: number, cap: number): string {
  return `${(bytes / 1_000_000).toFixed(1)} MB of ${cap / 1_000_000} MB`;
}

/** Conservative text-only boundary; a file extension alone is never trusted. */
export function assertPlainText(value: string): void {
  const compact = value.replace(/\s/g, "");
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\ufffd]/u.test(value) ||
      /(?:data\s*:|blob\s*:|base64\s*[:,;]|<\s*\/?\s*(?:html|img|svg|script|iframe|object|embed|audio|video)\b)/iu.test(value) ||
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

/** Only new/changed uploads are subject to the per-story limit. Never alter old rows. */
export function assertNewStories(texts: LibraryText[], existing: LibraryText[] = []): void {
  const old = new Map(existing.map((text) => [text.id, text]));
  for (const text of texts) {
    const previous = old.get(text.id);
    if (previous && previous.body === text.body && previous.title === text.title && previous.blurb === text.blurb) continue;
    if (text.kind !== "paste") continue;
    for (const field of [text.title, text.body, text.blurb]) assertPlainText(field);
    if (jsonBytes(text) > STORY_STORAGE_BYTES) throw new Error("Each new story must be at most 0.512 MB of plain text, including its metadata. Split this story into smaller parts.");
  }
}

export function assertStorageLimit(payload: unknown, cap: number): void {
  if (jsonBytes(payload) > cap) {
    throw new Error(`Storage limit reached (${storageLabel(jsonBytes(payload), cap)}). Existing stories are safe. New uploads are paused until storage is under the limit. Export a backup to keep a copy.`);
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
