import { CATALOG as BASE_CATALOG, SAMPLES as BASE_SAMPLES } from "./catalog";
import { BAND_LADDER } from "./band-ladder";
import { WIKI_REWRITES } from "./wiki-rewrites";

/** Full built-in library: owned catalog, mid-band ladder, wiki-inspired rewrites. */
export const CATALOG = [...BASE_CATALOG, ...BAND_LADDER, ...WIKI_REWRITES];
export const SAMPLES = BASE_SAMPLES;
