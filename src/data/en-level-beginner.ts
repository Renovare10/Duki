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
  {
    ...original,
    id: "en-l1-a-seat-for-two", level: 1, title: "A Seat for Two",
    blurb: "There is a new boy at school. Where can he sit?",
    createdAt: 240_002,
    body: `It is time for lunch at school. I sit with my friends. We talk and eat.

A new boy stands by our table. He has a blue lunch box.

"Can I sit here?" he asks.

My bag is on the chair next to me. I put it under my feet.

"Yes," I say. "This seat is for you."

He opens his box. I have an apple. He has two small oranges.

"Do you like oranges?" he asks.

I do. We put the fruit in the middle of the table. Now we both have apples and oranges.`,
  },
  {
    ...original,
    id: "en-l1-the-small-bag", level: 1, title: "The Small Bag",
    blurb: "Tom buys a small bag, but his books will not fit.",
    createdAt: 240_003,
    body: `Tom needs a bag for his books. He goes to a shop.

He sees a small green bag. It looks good. He buys it and takes it home.

He puts one book in. He puts two books in. There is no room for his big book.

"Oh," he says. "The bag is too small."

His sister comes into the room. She has a big bag and one little book.

"I like green," she says.

Tom looks at her bag. She looks at his.

"Do you want this one?" he asks.

She does. They change bags.`,
  },
  {
    ...original,
    id: "en-l1-the-blue-sock", level: 1, title: "The Blue Sock",
    blurb: "One blue sock is missing. May hears it before she sees it.",
    createdAt: 240_004,
    body: `May has one blue sock on her foot. Where is the other one?

She looks under the bed. She looks in her shoes. No sock.

"Mom, do you have my blue sock?"

"No. Look in your room."

May goes back to her room. She hears a little laugh. It comes from behind the door.

Her baby brother is there. He has a blue sock on his hand.

"Hello!" he says. He opens and closes his hand. The sock has a mouth now.

May laughs too. "Hello, Sock. Can you come and sit on my foot?"`,
  },
];

export const EN_BEGINNER_TOPICS: Record<string, string[]> = {
  "en-l1-dads-egg": ["food", "family"],
  "en-l1-the-wet-chair": ["daily-life", "nature", "humor"],
  "en-l1-a-seat-for-two": ["school", "feelings", "food"],
  "en-l1-the-small-bag": ["shopping", "family"],
  "en-l1-the-blue-sock": ["daily-life", "family", "humor"],
};
