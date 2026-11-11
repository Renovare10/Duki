import type { LibraryText } from "../types";
import { EN_GLOSSES_GENERATED } from "./en-glosses.generated";
import { EN_STORY_TEXTS, EN_TOPICS } from "./en-stories";
import { EN_NATIVE_TEXTS, EN_NATIVE_TOPICS } from "./en-level-native";

// topicTags reads this shared map; register the section without changing existing stories.
Object.assign(EN_TOPICS, EN_NATIVE_TOPICS);

/** English shelf rows: the built-in graded stories and native-level section. */
export const EN_SAMPLES: LibraryText[] = [...EN_STORY_TEXTS, ...EN_NATIVE_TEXTS];

/** Tap-a-word Chinese glosses for every word in the English stories (ECDICT, MIT). Unknown words get a dash. */
export const EN_GLOSSES: Record<string, string> = EN_GLOSSES_GENERATED;
