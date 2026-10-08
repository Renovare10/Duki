import type { VocabProfile } from "./difficulty";

/** Compact word→count file written by scripts/build-remote-meta.mjs. */
export type WordSetFile = {
  v: number;
  vocab: string[];
  texts: Record<string, number[]>;
};

export function profilesFrom(data: WordSetFile): Map<string, VocabProfile> {
  const map = new Map<string, VocabProfile>();
  for (const [id, flat] of Object.entries(data.texts)) {
    const words: string[] = [];
    const counts: number[] = [];
    for (let i = 0; i < flat.length; i += 2) {
      const word = data.vocab[flat[i]];
      const count = flat[i + 1];
      if (!word || !(count > 0)) continue;
      words.push(word);
      counts.push(count);
    }
    let tokens = 0;
    for (const count of counts) tokens += count;
    map.set(id, { tokens, words, counts });
  }
  return map;
}
