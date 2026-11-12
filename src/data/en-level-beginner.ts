import type { LibraryText } from "../types";

const original = {
  lang: "en", kind: "sample", category: "graded", featured: false,
  readAt: null, bookmark: null, source: "Original (Duki) · AI-drafted",
} as const;

/** Original short readings for the Beginner shelf, ten each at L1 and L2. */
export const EN_BEGINNER_TEXTS: LibraryText[] = [
  {
    ...original,
    id: "en-l1-dads-egg", level: 1, title: "Dad's Egg",
    blurb: "Dad is late for work. His breakfast is still on the table.",
    createdAt: 240_000,
    body: `Dad puts an egg on my plate. He puts an egg on his plate too.

His phone rings. He looks at it. "Oh, no. I am late!"

He gets his bag. His egg is still on the table.

"Dad! Your egg!" I say.

"You can have it."

I like eggs, but I want to eat with Dad. I look at his empty chair.

Then his head comes back through the door.

"My keys," he says.

His keys are by his plate. He takes the keys and a big bite of his egg. I take a bite too.`,
  },
  {
    ...original,
    id: "en-l1-the-wet-chair", level: 1, title: "The Wet Chair",
    blurb: "Amy finds a good place to sit, but the chair is wet.",
    createdAt: 240_001,
    body: `Amy takes her book into the garden. The sun is out. She wants to read by the flowers.

There is a chair under the tree. Amy puts her hand on it. The chair is wet. There is water on the seat.

She goes inside for a towel. She comes back and looks at the chair.

Now a cat is on it.

"That is my chair," Amy says.

The cat closes its eyes.

Amy puts the towel on the grass. She sits on it and opens her book. The cat can have the wet chair.`,
  },
];

export const EN_BEGINNER_TOPICS: Record<string, string[]> = {
  "en-l1-dads-egg": ["food", "family"],
  "en-l1-the-wet-chair": ["daily-life", "nature", "humor"],
};
