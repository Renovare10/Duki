import type { LibraryText } from "../types";

/**
 * English Wikipedia adaptations for learners, written as complete inline articles.
 * Each sourceUrl credits the source article and its contributors via page history.
 * Adaptations are shared under CC BY-SA: https://creativecommons.org/licenses/by-sa/4.0/
 * IDs and createdAt values are permanent; append new articles without renumbering.
 */
type EnglishWikiArticle = {
  id: string;
  level: number;
  title: string;
  blurb: string;
  wikiTitle: string;
  sourceUrl: string;
  createdAt: number;
  topics: string[];
  body: string;
};

const EN_WIKI_ARTICLES: EnglishWikiArticle[] = [
  {
    id: "en-wiki-giant-panda", level: 4, title: "Giant Panda",
    blurb: "A bear with a bamboo diet and a useful extra thumb.",
    wikiTitle: "Giant panda", sourceUrl: "https://en.wikipedia.org/wiki/Giant_panda",
    createdAt: 220_000, topics: ["encyclopedia", "nature"],
    body: `The giant panda is a bear that lives in China. It has white fur with black patches around its eyes, ears, legs, and shoulders. Wild pandas live in mountain forests, where they find the bamboo they eat.

Bamboo makes up almost all of a panda's diet. Its strong teeth help it break the hard stems. A panda also has a special wrist bone that works a little like a thumb. This helps it hold bamboo while it eats.

Pandas usually live alone. They leave smells on trees and rocks to send messages to other pandas. They can climb trees, and they do not sleep through the whole winter as some bears do.

A baby panda is very small when it is born. It has no teeth and cannot see. Its mother cares for it as it grows. Protecting forests gives these bears space to feed and raise their young.`,
  },
  {
    id: "en-wiki-penguin", level: 4, title: "Penguin",
    blurb: "A bird whose wings are better for swimming than flying.",
    wikiTitle: "Penguin", sourceUrl: "https://en.wikipedia.org/wiki/Penguin",
    createdAt: 220_001, topics: ["encyclopedia", "nature"],
    body: `Penguins are birds, but they cannot fly. Their wings work like flippers. They use them to move through the sea, where they catch fish, squid, and other small animals.

A penguin's back is dark, and its front is light. These colors help hide it in the water. From above, the dark back is hard to see against the deep sea. From below, the light front looks more like the bright surface.

Not all penguins live among ice and snow. Some live in warmer places. The Galapagos penguin even lives near the equator. Almost all penguins live in the southern half of the world.

Penguins come onto land or ice to have their young. Most kinds lay two eggs, but emperor penguins lay just one. A male emperor penguin keeps the egg warm on his feet while the female goes to sea to feed.`,
  },
  {
    id: "en-wiki-moon", level: 4, title: "The Moon",
    blurb: "Why the Moon seems to change shape during the month.",
    wikiTitle: "Moon", sourceUrl: "https://en.wikipedia.org/wiki/Moon",
    createdAt: 220_002, topics: ["encyclopedia", "science"],
    body: `The Moon is Earth's natural companion in space. It travels around Earth, and we often see it in the night sky. Sometimes we can see it during the day too.

The Moon does not make its own light like the Sun. We see sunlight that comes back from its surface. As the Moon moves around Earth, we see different amounts of its sunlit half. That is why it seems to change shape. It takes about a month to go through these changes.

The Moon also turns as it travels. It turns at just the right speed to keep nearly the same side facing Earth. The other side is not always dark. It gets sunlight too.

The Moon's surface has many round holes called craters. Rocks from space made many of them when they hit the ground. In 1969, people first walked on this surface during the Apollo 11 mission.`,
  },
];

export const EN_WIKI_TOPICS: Record<string, string[]> = Object.fromEntries(
  EN_WIKI_ARTICLES.map(({ id, topics }) => [id, topics]),
);

export const EN_WIKI_TEXTS: LibraryText[] = EN_WIKI_ARTICLES.map(({ topics: _topics, ...article }) => ({
  ...article,
  lang: "en",
  kind: "wiki",
  category: "wiki",
  featured: false,
  readAt: null,
  bookmark: null,
  source: "Adapted from English Wikipedia, CC BY-SA",
}));
