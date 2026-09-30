import { CATALOG as BASE_CATALOG, SAMPLES as BASE_SAMPLES } from "./catalog";
import { BAND_LADDER } from "./band-ladder";

/** Full built-in library: owned catalog plus mid-band ladder pack. */
export const CATALOG = [...BASE_CATALOG, ...BAND_LADDER];
export const SAMPLES = BASE_SAMPLES;
