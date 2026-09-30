/**
 * Original Mandarin shorts inspired by Wikipedia animal/science topics.
 * Rights-clean: Duki-owned text; `source` cites Wikipedia CC BY-SA article URLs.
 * Offline batch only — not generated at runtime (no LLM in frontend/lambdas).
 */
import type { LibraryText } from "../types";

function entry(
  partial: Omit<LibraryText, "kind" | "readAt" | "bookmark" | "blurb" | "featured"> & {
    blurb: string;
    featured?: boolean;
    source: string;
    sourceUrl: string;
  },
): LibraryText {
  return {
    kind: "sample",
    readAt: null,
    bookmark: null,
    featured: false,
    ...partial,
  };
}

function wikiUrl(title: string): string {
  return `https://zh.wikipedia.org/wiki/${encodeURIComponent(title)}`;
}

function cite(title: string): string {
  return `Duki original · topic from Wikipedia「${title}」CC BY-SA`;
}

export const WIKI_REWRITES: LibraryText[] = [
  entry({
    id: "wr-animal-cat",
    category: "science",
    createdAt: 900,
    title: "家里的猫",
    blurb: "A quiet cat, warm sun, and slow mornings at home.",
    wikiTitle: "猫",
    source: cite("猫"),
    sourceUrl: wikiUrl("猫"),
    body: `我家里有一只猫。它很喜欢睡觉。

早上我给它吃饭。它吃得很慢。吃完饭，它去找太阳。

猫的眼睛很大。晚上它也能看见东西。走路的时候很安静。

妹妹想跟它玩。猫有的时候来，有的时候走。

有猫在家，我觉得很高兴。
`,
  }),
];
