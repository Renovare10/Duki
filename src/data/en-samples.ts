import type { LibraryText } from "../types";
import { EN_GLOSSES_GENERATED } from "./en-glosses.generated";
import { EN_STORY_TEXTS } from "./en-stories";
import { EN_ELEMENTARY_TEXTS } from "./en-level-elementary";
import { EN_INTERMEDIATE_TEXTS } from "./en-level-intermediate";
import { EN_ADVANCED_TEXTS } from "./en-level-advanced";
import { EN_NATIVE_TEXTS } from "./en-level-native";
import { EN_WIKI_TEXTS } from "./en-wiki";
import { EN_BEGINNER_TEXTS } from "./en-level-beginner";
import { EN_CLASSICS_TEXTS } from "./en-classics";

/** English shelf rows: the starter stories, then each section (Elementary, Intermediate, Advanced, Native, Wikipedia, Beginner, Classics). */
export const EN_SAMPLES: LibraryText[] = [...EN_STORY_TEXTS, ...EN_ELEMENTARY_TEXTS, ...EN_INTERMEDIATE_TEXTS, ...EN_ADVANCED_TEXTS, ...EN_NATIVE_TEXTS, ...EN_WIKI_TEXTS, ...EN_BEGINNER_TEXTS, ...EN_CLASSICS_TEXTS];

/** Generated Chinese glosses for every English story (ECDICT, MIT). Unknown words get a dash. */
export const EN_GLOSSES: Record<string, string> = EN_GLOSSES_GENERATED;
