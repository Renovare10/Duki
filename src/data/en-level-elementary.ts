import type { LibraryText } from "../types";

/** Original standalone reading for the English Elementary shelf (L3–4). */
export const EN_ELEMENTARY_TEXTS: LibraryText[] = [
  {
    id: "en-l3-the-last-peaches", lang: "en", level: 3,
    title: "The Last Peaches",
    blurb: "Nina needs fruit for a cake, but the cheap peaches have a catch.",
    body: `Nina went to the market with five dollars and a picture of a cake. Her brother was coming home that evening. She wanted to make his favorite peach cake.

At the first fruit stand, peaches cost two dollars each. She needed four. Nina put her money back in her pocket and walked on.

Near the gate, a woman was putting fruit into boxes. A small sign said, "Last peaches: four for three dollars."

"Why are these so cheap?" Nina asked.

"They are very soft," the woman said. "They won't be good tomorrow. You need to eat them today."

Nina looked at the fruit. The peaches were small, and one had a dark mark. They did not look like the peaches in her picture.

"I'm making a cake tonight," she said.

"Then you don't need fruit that looks good in a bowl. You need fruit that tastes good."

Nina bought four peaches. At home, she washed them, cut them open, and removed the stones. She cut away the dark part too. The kitchen smelled sweet before the cake even went into the oven.

When her brother arrived, Nina showed him the picture.

"My cake doesn't look like this," she warned him.

He looked at the picture, then at the warm cake on the table.

"Good," he said. "I can't eat a picture."

He asked for a second piece before he finished the first.`,
    kind: "sample", category: "graded", featured: false,
    createdAt: 250_000, readAt: null, bookmark: null,
    source: "Original (Duki) · AI-drafted",
  },
];

export const EN_ELEMENTARY_TOPICS: Record<string, string[]> = {
  "en-l3-the-last-peaches": ["shopping", "food", "family"],
};
