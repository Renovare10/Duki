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
  {
    ...original,
    id: "en-l1-five-minutes", level: 1, title: "Five Minutes",
    blurb: "Mom has work to do. Dan has something to show her.",
    createdAt: 240_005,
    body: `Mom is at her desk. Dan stands next to her.

"Look at my picture," he says.

"In five minutes. I need to finish this."

Dan sits on the floor. He draws a house. He draws a tree. He draws a dog with very long legs.

Mom closes her computer. "All done. Show me."

Dan puts the picture on her desk.

"Is that our house?" she asks.

"Yes. And that is our dog."

"We do not have a dog."

"I know," says Dan. "Can we get one?"

Mom looks at the long legs. "Where can it sleep?"

Dan gets his pencil. He needs to draw a bigger house.`,
  },
  {
    ...original,
    id: "en-l1-the-paper-fish", level: 1, title: "The Paper Fish",
    blurb: "Grandma cannot come to the sea. I make something for her.",
    createdAt: 240_006,
    body: `I am at the sea with Mom. Grandma is at home. She cannot come today.

I want to take a fish home for her.

"A real fish?" Mom asks.

I look at the sea. The fish need water. Grandma has no big tank.

Back at the house, I get some paper. I draw a fish. Mom helps me cut it out.

I write, "For Grandma," on the back.

Grandma puts my fish on her wall. "This one can stay," she says. "I do not need to feed it."`,
  },
  {
    ...original,
    id: "en-l1-not-that-ball", level: 1, title: "Not That Ball",
    blurb: "Two boys want to play. Their dog wants to play too.",
    createdAt: 240_007,
    body: `Two boys are in the park. They put a ball on the grass.

Their dog runs to it. He takes it in his mouth.

"Not that ball!" one boy says. "That is for our game."

The dog runs away. The boys run after him. He stops by a tree.

One boy has a little red ball in his bag. He shows it to the dog.

The dog drops the big ball. Now he wants the red one.

One boy throws the red ball. The other boy gets their ball back. At last, everyone can play.`,
  },
  {
    ...original,
    id: "en-l1-the-open-box", level: 1, title: "The Open Box",
    blurb: "A box of snow does not stay a box of snow for long.",
    createdAt: 240_008,
    body: `There is snow in the garden. I fill a small plastic box with it.

I take the box inside. I want to show my brother. He is still in bed.

I put the open box on the kitchen table. Then I have breakfast.

My brother comes down. "What is in the box?" he asks.

I look inside. There is water at the bottom. The snow is very small now.

"It is too warm in here," I say.

We put on our coats. There is more snow outside. This time, we leave it there.`,
  },
  {
    ...original,
    id: "en-l1-a-light-next-door", level: 1, title: "A Light Next Door",
    blurb: "Dad works at night. A small light helps him find our door.",
    createdAt: 240_009,
    body: `Dad works at night. He comes home when I am in bed.

Our front light does not work. Dad cannot see the steps well. Mom puts a small light in the window.

At bedtime, I look out. The house next door has a light in the window too.

"Is that for Dad?" I ask.

"No," Mom says. "That is their kitchen light."

In the morning, Dad is home.

"Did you see our light?" I ask.

"Yes. I could see the steps."

"And the light next door?"

"Our neighbor was making tea. He made me a cup too."`,
  },
];

export const EN_BEGINNER_TOPICS: Record<string, string[]> = {
  "en-l1-dads-egg": ["food", "family"],
  "en-l1-the-wet-chair": ["daily-life", "nature", "humor"],
  "en-l1-a-seat-for-two": ["school", "feelings", "food"],
  "en-l1-the-small-bag": ["shopping", "family"],
  "en-l1-the-blue-sock": ["daily-life", "family", "humor"],
  "en-l1-five-minutes": ["family", "work", "humor"],
  "en-l1-the-paper-fish": ["arts", "family", "nature"],
  "en-l1-not-that-ball": ["sports", "nature", "humor"],
  "en-l1-the-open-box": ["weather", "science", "family"],
  "en-l1-a-light-next-door": ["family", "daily-life", "work"],
};
