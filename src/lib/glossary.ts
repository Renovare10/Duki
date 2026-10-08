import type { Gloss } from "../types";

type GlossaryFile = {
  maxLen: number;
  count: number;
  /** Traditional→simplified pairs packed as "學学發发". */
  t2s?: string;
  entries: Record<string, [string, string]>;
};

let entries: Record<string, [string, string]> = {};
const dict = new Set<string>();
const tradToSimp = new Map<string, string>();

export let MAX_WORD_LEN = 8;
export let GLOSSARY_SIZE = 0;

export async function loadGlossary(): Promise<void> {
  const res = await fetch("/glossary.json");
  if (!res.ok) throw new Error("Could not load the dictionary.");
  const data = (await res.json()) as GlossaryFile;
  entries = data.entries;
  dict.clear();
  for (const key of Object.keys(entries)) dict.add(key);
  tradToSimp.clear();
  const pairs = data.t2s || "";
  for (let i = 0; i + 1 < pairs.length; i += 2) tradToSimp.set(pairs[i], pairs[i + 1]);
  MAX_WORD_LEN = data.maxLen;
  GLOSSARY_SIZE = data.count;
}

/** Map traditional characters to simplified. Simplified characters pass through. */
export function toSimplified(text: string): string {
  if (tradToSimp.size === 0) return text;
  let out = "";
  for (const ch of text) out += tradToSimp.get(ch) ?? ch;
  return out;
}

export function hasWord(word: string): boolean {
  return dict.has(word);
}

export function getGloss(word: string): Gloss {
  const key = entries[word] ? word : toSimplified(word);
  const hit = entries[key];
  if (hit) {
    return { pinyin: hit[0], english: hit[1] || "—" };
  }

  const chars = Array.from(key);
  const parts = chars.map((ch) => entries[ch]);
  if (parts.every(Boolean)) {
    return {
      pinyin: parts.map((p) => p[0]).join(" "),
      english: parts.every((p) => p[1]) ? parts.map((p) => p[1]).join(" · ") : "—",
    };
  }

  return { pinyin: "—", english: "Not in dictionary" };
}
