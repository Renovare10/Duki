import type { LibraryText, TextScore, WordStatus } from "../types";
import type { VocabProfile } from "./difficulty";

/** Progress/metadata updates must not re-segment the entire library while scrolling. */
export function createScoreCache() {
  const entries = new Map<string, {
    body: string; statuses: Map<string, WordStatus>; profile: VocabProfile | undefined; score: TextScore;
  }>();
  return {
    get(text: LibraryText, statuses: Map<string, WordStatus>, profile: VocabProfile | undefined, calculate: () => TextScore): TextScore {
      const previous = entries.get(text.id);
      if (previous && previous.body === text.body && previous.statuses === statuses && previous.profile === profile) return previous.score;
      const score = calculate();
      entries.set(text.id, { body: text.body, statuses, profile, score });
      return score;
    },
    retain(ids: Set<string>) {
      for (const id of entries.keys()) if (!ids.has(id)) entries.delete(id);
    },
  };
}
