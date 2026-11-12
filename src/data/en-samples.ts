import type { LibraryText } from "../types";
import { EN_GLOSSES_GENERATED } from "./en-glosses.generated";
import { EN_STORY_TEXTS } from "./en-stories";
import { EN_ELEMENTARY_TEXTS } from "./en-level-elementary";
import { EN_INTERMEDIATE_TEXTS } from "./en-level-intermediate";
import { EN_ADVANCED_TEXTS } from "./en-level-advanced";
import { EN_NATIVE_TEXTS } from "./en-level-native";

/** English shelf rows: the starter stories, then each section (Elementary, Intermediate, Advanced, Native). */
export const EN_SAMPLES: LibraryText[] = [...EN_STORY_TEXTS, ...EN_ELEMENTARY_TEXTS, ...EN_INTERMEDIATE_TEXTS, ...EN_ADVANCED_TEXTS, ...EN_NATIVE_TEXTS];

/** Generated Chinese glosses for every English story (ECDICT, MIT). Unknown words get a dash. */
export const EN_GLOSSES: Record<string, string> = EN_GLOSSES_GENERATED;
