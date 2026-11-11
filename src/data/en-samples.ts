import type { LibraryText } from "../types";
import { EN_GLOSSES_GENERATED } from "./en-glosses.generated";
import { EN_STORY_TEXTS, EN_TOPICS } from "./en-stories";
import { EN_ELEMENTARY_TEXTS, EN_ELEMENTARY_TOPICS } from "./en-level-elementary";

// Register section topics in the existing map read by topicTags, without changing its consumer.
Object.assign(EN_TOPICS, EN_ELEMENTARY_TOPICS);

/** English shelf rows: the starter stories and the Elementary section. */
export const EN_SAMPLES: LibraryText[] = [...EN_STORY_TEXTS, ...EN_ELEMENTARY_TEXTS];

/** Generated Chinese glosses for the starter stories (ECDICT, MIT). Unknown words get a dash. */
export const EN_GLOSSES: Record<string, string> = EN_GLOSSES_GENERATED;
