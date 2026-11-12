import type { LibraryText } from "../types";
import { EN_GLOSSES_GENERATED } from "./en-glosses.generated";
import { EN_STORY_TEXTS } from "./en-stories";
import { EN_WIKI_TEXTS } from "./en-wiki";

/** English shelf rows: the starter stories and inline Wikipedia adaptations. */
export const EN_SAMPLES: LibraryText[] = [...EN_STORY_TEXTS, ...EN_WIKI_TEXTS];

/** Tap-a-word Chinese glosses for every word in the English stories (ECDICT, MIT). Unknown words get a dash. */
export const EN_GLOSSES: Record<string, string> = EN_GLOSSES_GENERATED;
