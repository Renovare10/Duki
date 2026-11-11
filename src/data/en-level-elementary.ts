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
  {
    id: "en-l3-lunch-on-the-roof", lang: "en", level: 3,
    title: "Lunch on the Roof",
    blurb: "On his first day at work, Daniel cannot find a quiet place to eat.",
    body: `Daniel started his new job on a Monday. By lunchtime, he knew where to find paper and how to use the coffee machine. He did not know anyone's name.

The office kitchen was full. People stood around the table with their plates. Daniel held his lunch box and waited by the door.

"You can come upstairs," a woman said. "There's a garden on the roof."

Her name was Ruth. She took him up one floor and opened a heavy door. Outside, there were two benches and some large plants. Daniel could hear buses in the street below.

He sat down and opened his lunch box. Inside were cold noodles and a fork. Ruth had bread and cheese.

For a while, they ate without talking. Daniel was glad. He had answered so many questions that morning.

Then a small brown bird landed near his shoe. It looked at his noodles.

"Does it work here too?" Daniel asked.

"It comes every day," Ruth said. "But it never answers the phone."

Daniel laughed. They talked about the birds they saw near their homes. Ruth lived by a lake. Daniel lived above a busy shop.

After lunch, Ruth put her empty box in her bag.

"Same time tomorrow?" she asked.

"Yes," Daniel said. "I'll bring a warmer coat."

Back at his desk, he still had to check the paper to remember his new password. Ruth's name was easier to remember.`,
    kind: "sample", category: "graded", featured: false,
    createdAt: 250_001, readAt: null, bookmark: null,
    source: "Original (Duki) · AI-drafted",
  },
];

export const EN_ELEMENTARY_TOPICS: Record<string, string[]> = {
  "en-l3-the-last-peaches": ["shopping", "food", "family"],
  "en-l3-lunch-on-the-roof": ["work", "feelings", "daily-life"],
};
