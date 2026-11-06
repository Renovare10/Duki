import type { Language, Token } from "../types";

const HAN = /[\u3400-\u9fff\uf900-\ufaff]/;

export function isHan(ch: string): boolean {
  return HAN.test(ch);
}

export function segment(
  text: string,
  hasWord: (word: string) => boolean,
  maxLen: number,
  lang: Language = "zh",
): Token[] {
  if (lang === "en") {
    const parts = text.match(/[A-Za-z]+(?:['’][A-Za-z]+)*|[^A-Za-z]+/g) ?? [];
    return parts.map((part, index) => {
      const isWord = /^[A-Za-z]/.test(part);
      return { text: part, isWord, index,
        ...(isWord ? { key: part.toLowerCase().replaceAll("’", "'") } : {}) };
    });
  }
  const tokens: Token[] = [];
  let i = 0;
  let index = 0;
  const n = text.length;

  while (i < n) {
    const ch = text[i];
    if (!HAN.test(ch)) {
      let j = i + 1;
      while (j < n && !HAN.test(text[j])) j++;
      tokens.push({ text: text.slice(i, j), isWord: false, index: index++ });
      i = j;
      continue;
    }

    const limit = Math.min(maxLen, n - i);
    let found = ch;
    for (let len = limit; len >= 2; len--) {
      const slice = text.slice(i, i + len);
      if (hasWord(slice)) {
        found = slice;
        break;
      }
    }
    tokens.push({ text: found, isWord: true, index: index++ });
    i += found.length;
  }

  return tokens;
}
