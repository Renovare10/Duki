import type { LibraryText } from "../types";
import { EN_GLOSSES_GENERATED } from "./en-glosses.generated";
import { EN_STORY_TEXTS } from "./en-stories";
import { EN_BEGINNER_TEXTS } from "./en-level-beginner";

/** English shelf rows: the starter stories and the Beginner section. */
export const EN_SAMPLES: LibraryText[] = [...EN_STORY_TEXTS, ...EN_BEGINNER_TEXTS];

/** Chinese glosses for the seed stories (ECDICT, MIT). New section words await the release rebuild; unknowns get a dash. */
export const EN_GLOSSES: Record<string, string> = EN_GLOSSES_GENERATED;
