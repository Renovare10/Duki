import type { LibraryText } from "../types";
import { EN_GLOSSES_GENERATED } from "./en-glosses.generated";
import { EN_STORY_TEXTS } from "./en-stories";

/** English shelf rows: the built-in graded stories (two per level). */
export const EN_SAMPLES: LibraryText[] = EN_STORY_TEXTS;

/** Tap-a-word Chinese glosses for every word in the English stories (ECDICT, MIT). Unknown words get a dash. */
export const EN_GLOSSES: Record<string, string> = EN_GLOSSES_GENERATED;
