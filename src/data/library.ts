import { CATALOG as BASE_CATALOG, SAMPLES as BASE_SAMPLES } from "./catalog";
import { BAND_LADDER } from "./band-ladder";
import { WIKI_REWRITES } from "./wiki-rewrites";
import { PACKS } from "./library/index";
import { entryToText } from "../lib/library-entry";

/** Texts from src/data/library/ packs (see README there), in manifest order. */
export const LIBRARY_TEXTS = PACKS.flatMap((p) => p.texts).map((e, i) => entryToText(e, i));

/** Full built-in library: owned catalog, mid-band ladder, wiki-inspired rewrites, library packs. */
export const CATALOG = [...BASE_CATALOG, ...BAND_LADDER, ...WIKI_REWRITES, ...LIBRARY_TEXTS];
export const SAMPLES = BASE_SAMPLES;
