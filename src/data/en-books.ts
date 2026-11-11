import type { LibraryText } from "../types";

/** Six original graded novels. Each chapter is a permanent, independently readable row. */
export const EN_BOOK_TEXTS: LibraryText[] = [
  {
    id: "en-book-blue-table-1", lang: "en", level: 2,
    seriesId: "en-book-blue-table", seriesTitle: "Room for a Table", chapter: 1,
    title: "Chapter 1: The Table by the Door",
    blurb: "Mei buys a blue table, but getting it into her new home takes help.",
    kind: "sample", category: "novel", featured: false,
    createdAt: 210_000, readAt: null, bookmark: null,
    source: "Original (Duki) · AI-drafted",
    body: `Mei has a new home. It is one small room above a shop. There is a bed by the window. There is a chair by the wall. There is no table.

On Saturday, Mei goes to a shop with old things. She sees a blue table by the door. It has four long legs. There is a little white mark on the top.

"How much is this?" she asks.

"Twelve pounds," says the woman in the shop.

Mei looks at the mark. Then she puts her bag on the table. There is room for a bag, a plate, and a cup. There is even room for a book.

"I'll take it," she says.

The woman puts a SOLD sign on it. Mei can come back for it before five.

Outside, Mei calls her brother. He has a car, but he is at work.

"I can help you on Monday," he says.

"The shop closes at five today. It is not open on Sunday or Monday."

"Ask the woman to keep it until Tuesday."

Mei goes back inside. The woman shakes her head. "I'm sorry. A van is coming tomorrow. I need this space."

Mei stands by her table. She can carry one end. She cannot carry both ends. Her room is only two streets away. It feels very far away now.

A man comes in with a little girl. The girl points at the table.

"That's a nice blue."

"It is," says Mei. "But I can't get it home."

The man looks at the table. "I have no car," he says. "But I have two hands."

Mei smiles. "So do I."

They carry it through the door. The girl carries Mei's bag. They stop outside to put the table down.

"I'm Tom," says the man. "This is my daughter, Ava."

Mei tells them her name. Then she looks up the street. Her new home is at the top of a hill.`,
  },
];

/** Topic ids are shared with the Mandarin library; every chapter has its own entry. */
export const EN_BOOK_TOPICS: Record<string, string[]> = {
  "en-book-blue-table-1": ["daily-life", "shopping"],
  "en-book-blue-table-2": ["daily-life", "humor"],
  "en-book-blue-table-3": ["daily-life", "food"],
  "en-book-saturday-team-1": ["sports", "feelings"],
  "en-book-saturday-team-2": ["sports", "family"],
  "en-book-saturday-team-3": ["sports", "feelings"],
  "en-book-alder-station-1": ["travel", "family"],
  "en-book-alder-station-2": ["travel", "weather"],
  "en-book-alder-station-3": ["travel", "family"],
  "en-book-borrowed-camera-1": ["arts", "school"],
  "en-book-borrowed-camera-2": ["arts", "feelings"],
  "en-book-borrowed-camera-3": ["arts", "school"],
  "en-book-repair-list-1": ["work", "family"],
  "en-book-repair-list-2": ["work", "daily-life"],
  "en-book-repair-list-3": ["work", "family"],
  "en-book-second-voice-1": ["history", "work"],
  "en-book-second-voice-2": ["history", "letters"],
  "en-book-second-voice-3": ["history", "culture"],
};
