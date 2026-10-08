/**
 * Manifest of library packs (see README.md in this folder).
 * Add one import per pack file and list it in PACKS. Nothing else goes here.
 */
import type { LibraryPack } from "../../lib/library-entry";

export const PACKS: LibraryPack[] = [];

/** Topic tags for pack texts, keyed by text id. First topic is the main one. */
export const LIBRARY_TOPICS: Record<string, string[]> = Object.fromEntries(
  PACKS.flatMap((pack) => pack.texts.map((entry) => [entry.id, entry.topics])),
);
