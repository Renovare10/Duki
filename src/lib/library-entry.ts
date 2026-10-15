/**
 * Canonical shape of a built-in library text added under `src/data/library/`
 * (see src/data/library/README.md). Pack files export a `LibraryPack`;
 * `src/data/library/index.ts` lists the packs; `entryToText` turns an entry
 * into the app's ordinary `LibraryText` catalog row.
 */
import type { LibraryText, TextCategory } from "../types";

export type LibraryEntryCategory = Extract<
  TextCategory,
  "graded" | "children" | "story" | "science" | "history" | "article" | "novel"
>;

export type LibraryEntry = {
  /** Permanent id: lowercase a–z, 0–9 and "-", starting with "lib-". Never rename. */
  id: string;
  /** Chinese title (Simplified). */
  title: string;
  /** One short English line shown on the card. */
  blurb: string;
  /** 1–3 topic ids from src/data/topics.ts TOPICS; the first is the main one. */
  topics: string[];
  /** Target level 1–10 (docs/library-v2-plan.md ladder). The app re-measures it from the body. */
  level: number;
  /** Simplified Chinese, full-width punctuation, paragraphs separated by a blank line. */
  body: string;
  /** True when the text was drafted by an AI model (even if edited afterwards). */
  aiGenerated: boolean;
  /** Card category; defaults to "story". */
  category?: LibraryEntryCategory;
  author?: string;
  source?: string;
  sourceUrl?: string;
  /** License or legal basis, e.g. "Original (Duki)", "Public domain (author d. 1936)". */
  license?: string;
  /** Multi-part serial: all parts share `series.id`/`series.title`; `part` counts from 1. */
  series?: { id: string; title: string; part: number };
};

export type LibraryPack = {
  /** Pack id, usually the file name without .ts. */
  id: string;
  texts: LibraryEntry[];
};

export const LIBRARY_ID = /^lib-[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Stable creation order for new texts: after every existing catalog row. */
const CREATED_BASE = 100_000;

export function entryToText(entry: LibraryEntry, order: number): LibraryText {
  return {
    id: entry.id,
    title: entry.title,
    blurb: entry.blurb,
    body: entry.body.trim(),
    kind: "sample",
    category: entry.category ?? "story",
    featured: false,
    createdAt: CREATED_BASE + order,
    readAt: null,
    bookmark: null,
    ...(entry.author ? { author: entry.author } : {}),
    ...(entry.source ? { source: entry.source } : {}),
    ...(entry.sourceUrl ? { sourceUrl: entry.sourceUrl } : {}),
    ...(entry.series
      ? { seriesId: entry.series.id, seriesTitle: entry.series.title, chapter: entry.series.part }
      : {}),
  };
}

/** Problems with a set of entries (empty when valid). `taken` = ids already in the catalog. */
export function validateEntries(
  entries: LibraryEntry[],
  topicIds: Set<string>,
  taken: Set<string> = new Set(),
): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const e of entries) {
    const at = `${e.id || "(no id)"}:`;
    if (!LIBRARY_ID.test(e.id)) errors.push(`${at} id must match ${LIBRARY_ID}`);
    if (seen.has(e.id)) errors.push(`${at} duplicate id`);
    if (taken.has(e.id)) errors.push(`${at} id already used by the catalog`);
    seen.add(e.id);
    if (!e.title?.trim()) errors.push(`${at} missing title`);
    if (!e.blurb?.trim()) errors.push(`${at} missing blurb`);
    if (!e.body?.trim() || !/[\u4e00-\u9fff]/.test(e.body)) errors.push(`${at} body has no Chinese`);
    if (!Array.isArray(e.topics) || e.topics.length < 1 || e.topics.length > 3)
      errors.push(`${at} needs 1–3 topics`);
    for (const t of e.topics ?? []) if (!topicIds.has(t)) errors.push(`${at} unknown topic "${t}"`);
    if (!Number.isInteger(e.level) || e.level < 1 || e.level > 10) errors.push(`${at} level must be 1–10`);
    if (typeof e.aiGenerated !== "boolean") errors.push(`${at} aiGenerated must be true/false`);
    if (e.series && (!e.series.id || !e.series.title || !(e.series.part >= 1)))
      errors.push(`${at} series needs id, title and part ≥ 1`);
  }
  return errors;
}
