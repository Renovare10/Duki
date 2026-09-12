import type { Gloss } from "../types";

type GlossaryFile = {
  maxLen: number;
  count: number;
  entries: Record<string, [string, string]>;
};

let entries: Record<string, [string, string]> = {};
const dict = new Set<string>();

export let MAX_WORD_LEN = 8;
export let GLOSSARY_SIZE = 0;

export async function loadGlossary(): Promise<void> {
  const res = await fetch("/glossary.json");
  if (!res.ok) throw new Error("Could not load the dictionary.");
  const data = (await res.json()) as GlossaryFile;
  entries = data.entries;
  dict.clear();
  for (const key of Object.keys(entries)) dict.add(key);
  MAX_WORD_LEN = data.maxLen;
  GLOSSARY_SIZE = data.count;
}

export function hasWord(word: string): boolean {
  return dict.has(word);
}

export function getGloss(word: string): Gloss {
  const hit = entries[word];
  if (hit) {
    return { pinyin: hit[0], english: hit[1] || "—" };
  }

  const chars = Array.from(word);
  const parts = chars.map((ch) => entries[ch]);
  if (parts.every(Boolean)) {
    return {
      pinyin: parts.map((p) => p[0]).join(" "),
      english: parts.every((p) => p[1]) ? parts.map((p) => p[1]).join(" · ") : "—",
    };
  }

  return { pinyin: "—", english: "Not in dictionary" };
}
