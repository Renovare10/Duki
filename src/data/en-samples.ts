import type { LibraryText } from "../types";
import { EN_GLOSSES_GENERATED } from "./en-glosses.generated";
import { EN_STORY_TEXTS } from "./en-stories";
import { EN_CLASSICS_TEXTS } from "./en-classics";

/** English shelf rows: seed graded stories plus public-domain classics. */
export const EN_SAMPLES: LibraryText[] = [...EN_STORY_TEXTS, ...EN_CLASSICS_TEXTS];

/** Tap-a-word Chinese glosses for every word in the English stories (ECDICT, MIT). Unknown words get a dash. */
export const EN_GLOSSES: Record<string, string> = EN_GLOSSES_GENERATED;
