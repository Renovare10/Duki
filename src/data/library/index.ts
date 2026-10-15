/**
 * Manifest of library packs (see README.md in this folder).
 * Add one import per pack file and list it in PACKS. Nothing else goes here.
 */
import type { LibraryPack } from "../../lib/library-entry";
import p01 from "./p01";
import p02 from "./p02";
import p03 from "./p03";
import p04 from "./p04";
import p05 from "./p05";
import p06 from "./p06";
import p07 from "./p07";
import p08 from "./p08";
import p09 from "./p09";
import p10 from "./p10";
import p11 from "./p11";
import p12 from "./p12";
import p13 from "./p13";
import p14 from "./p14";
import p15 from "./p15";

/** Every pack file, including drafts still waiting for a hand rewrite. Checked by scripts/validate-library.mjs. */
export const ALL_PACKS: LibraryPack[] = [p01, p02, p03, p04, p05, p06, p07, p08, p09, p10, p11, p12, p13, p14, p15];

/**
 * Packs shown in the app. Only packs that have been rewritten by hand go here
 * (append in order; never remove a pack once shipped, since progress is keyed by id).
 * p02–p15 are still template drafts and stay hidden until rewritten.
 */
export const PACKS: LibraryPack[] = [p01, p02, p03, p04, p05, p06, p07, p08, p09, p10, p11, p12];

/** Topic tags for pack texts, keyed by text id. First topic is the main one. */
export const LIBRARY_TOPICS: Record<string, string[]> = Object.fromEntries(
  PACKS.flatMap((pack) => pack.texts.map((entry) => [entry.id, entry.topics])),
);
