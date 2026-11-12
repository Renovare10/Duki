import type { LibraryText } from "../types";

type ClassicReading = {
  id: string;
  level: number;
  title: string;
  blurb: string;
  author: string;
  source: string;
  sourceUrl: string;
  topics: string[];
  body: string;
};

// Append only: array order fixes the permanent 230_000–230_019 timestamps.
// Retellings are new, abridged Duki prose; poems retain the cited edition's text.
const READINGS: ClassicReading[] = [
  {
    id: "en-classic-aesop-fox-grapes", level: 1,
    title: "The Fox and the Grapes",
    blurb: "Aesop · a hungry fox wants some fruit. A very simple retelling.",
    author: "Aesop", source: "Public domain (Aesop), retold for Duki · AI-drafted",
    sourceUrl: "https://www.gutenberg.org/ebooks/19994",
    topics: ["classics", "folk-tales", "nature"],
    body: `A fox is hungry. He sees some grapes. They are high up in a tree.

"I want those grapes," he says.

He jumps. He cannot get them. He jumps again. The grapes are still too high.

The fox sits down. He looks at the grapes. Then he gets up to go.

"Those grapes are not good," he says. "They are sour. I do not want them."

But he does not know that. He has not had one grape. He walks away with no food.`,
  },
  {
    id: "en-classic-aesop-dog-reflection", level: 1,
    title: "The Dog and the Water",
    blurb: "Aesop · a dog sees another dog. Or does he? A very simple retelling.",
    author: "Aesop", source: "Public domain (Aesop), retold for Duki · AI-drafted",
    sourceUrl: "https://www.gutenberg.org/ebooks/19994",
    topics: ["classics", "folk-tales", "nature"],
    body: `A dog has a bone. He takes it home.

On the way, he looks down at the water. He sees a dog with a bone.

"That dog has a big bone," he thinks. "I want it."

He opens his mouth. His own bone falls into the water. He jumps in to get the other bone.

But there is no other dog. There is no other bone. He sees only water.

The dog gets out. He is wet. Now he has no bone at all.`,
  },
];

export const EN_CLASSICS_TEXTS: LibraryText[] = READINGS.map(({ topics: _topics, ...reading }, index) => ({
  ...reading,
  lang: "en",
  kind: "sample",
  category: "story",
  featured: false,
  createdAt: 230_000 + index,
  readAt: null,
  bookmark: null,
}));

export const EN_CLASSICS_TOPICS: Record<string, string[]> = Object.fromEntries(
  READINGS.map((reading) => [reading.id, reading.topics]),
);
