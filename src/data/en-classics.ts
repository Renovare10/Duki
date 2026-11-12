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
  {
    id: "en-classic-aesop-lion-mouse", level: 2,
    title: "The Lion and the Mouse",
    blurb: "Aesop · a little mouse makes a big promise. Simply retold.",
    author: "Aesop", source: "Public domain (Aesop), retold for Duki · AI-drafted",
    sourceUrl: "https://www.gutenberg.org/ebooks/19994",
    topics: ["classics", "folk-tales", "feelings"],
    body: `A lion is asleep under a tree. A little mouse runs across his nose. The lion wakes up and puts his big foot on her.

"Please let me go," says the mouse. "One day I can help you."

The lion laughs. "You? Help me? You are so small!"

But he lifts his foot. The mouse runs away.

Some days later, the lion gets caught in a net. He pulls at it, but he cannot get out. He calls for help.

The mouse hears him. She runs to the net and starts to bite a rope. Her teeth are small, but they are sharp. She bites and bites. At last, the rope breaks.

The lion steps out of the net.

"You laughed at me," says the mouse. "But here you are!"

The lion looks down at his little friend. This time he does not laugh.`,
  },
  {
    id: "en-classic-aesop-wind-sun", level: 2,
    title: "The North Wind and the Sun",
    blurb: "Aesop · two rivals try to make a man take off his coat. Simply retold.",
    author: "Aesop", source: "Public domain (Aesop), retold for Duki · AI-drafted",
    sourceUrl: "https://www.gutenberg.org/ebooks/19994",
    topics: ["classics", "folk-tales", "weather"],
    body: `The North Wind and the Sun look down at a road. A man is walking along it. He has a warm coat.

"I am stronger than you," says the Wind.

"Can you make that man take off his coat?" asks the Sun. "Let us try. You can go first."

The Wind blows hard. The man feels cold. He holds his coat close to his body.

The Wind blows harder. The man holds his coat even closer. At last the Wind stops. The coat is still on the man.

Now the Sun comes out. The road grows warm. The man opens his coat and keeps walking.

The Sun shines on him. Soon he is very hot. He takes off his coat and sits under a tree.

The Wind looks at the coat beside the man. It is off at last, but the Wind did not blow it off.`,
  },
  {
    id: "en-classic-aesop-crow-pitcher", level: 3,
    title: "The Crow and the Pitcher",
    blurb: "Aesop · a thirsty bird cannot reach the water. A simple retelling.",
    author: "Aesop", source: "Public domain (Aesop), retold for Duki · AI-drafted",
    sourceUrl: "https://www.gutenberg.org/ebooks/19994",
    topics: ["classics", "folk-tales", "nature"],
    body: `It had not rained for days. A crow flew over the dry fields, looking for water. At last he saw a pitcher beside a house. A pitcher is a tall pot for holding drinks.

The crow landed on its edge and looked inside. There was water at the bottom. He bent his head and tried to drink, but his beak could not reach it. The opening was too narrow for him to get his whole head in.

He walked around the pitcher. He pushed it, but it was too heavy. He looked inside again. The water was there, just a little too far away.

Near his feet were some small stones. The crow picked one up and dropped it into the pitcher. It fell into the water with a little splash.

He dropped in another stone. Then another. The stones stayed at the bottom, and the water rose above them.

The crow went on picking up stones. He had to make many trips, but each stone brought the water a little closer.

At last he bent his head over the opening once more. This time his beak touched the water. He drank until he was no longer thirsty, then flew away.`,
  },
  {
    id: "en-classic-aesop-two-mice", level: 3,
    title: "The Town Mouse and the Country Mouse",
    blurb: "Aesop · a fine dinner comes with some unwelcome guests. A simple retelling.",
    author: "Aesop", source: "Public domain (Aesop), retold for Duki · AI-drafted",
    sourceUrl: "https://www.gutenberg.org/ebooks/19994",
    topics: ["classics", "folk-tales", "food"],
    body: `A town mouse went to visit her cousin in the country. The country mouse brought out the best food she had: some seeds, roots, and nuts. They ate together beside a quiet field.

"Thank you," said the town mouse. "But you should come to my house. We have much better things to eat."

That night the country mouse dreamed of sweet cakes. In the morning she went to town with her cousin.

They entered a large house through a small hole. The people had finished dinner, but food was still on the table. There was cheese, fruit, and a cake with a soft yellow middle.

The country mouse climbed up and took a tiny bite. She had never tasted anything so good.

Then a cat cried outside the door. Both mice ran to hide. They waited in the dark until everything was quiet.

"We can go back now," said the town mouse.

They came out, but before they could eat, the door opened. People walked in to clear the table. A large dog followed them.

The country mouse ran straight to the hole in the wall.

"Are you leaving?" her cousin called.

"Yes," she answered. "Your cake is very good. But at home I can finish my dinner."`,
  },
  {
    id: "en-classic-aesop-hare-tortoise", level: 4,
    title: "The Hare and the Tortoise",
    blurb: "Aesop · the fastest runner decides he has time for a sleep. Retold.",
    author: "Aesop", source: "Public domain (Aesop), retold for Duki · AI-drafted",
    sourceUrl: "https://www.gutenberg.org/ebooks/19994",
    topics: ["classics", "folk-tales", "sports"],
    body: `The hare liked to show everyone how fast he could run. One morning he passed a tortoise walking along the path. A tortoise carries a hard shell on its back and cannot move very quickly.

"Do you ever arrive anywhere?" the hare asked. "I've seen stones move faster than you."

The tortoise looked up. "I arrive where I'm going. I'll race you, if you like."

The hare laughed so loudly that a fox came to find out what was happening. When she heard about the race, she agreed to be the judge. She chose a starting point and marked a finish line farther down the path.

At her signal, the hare shot forward. The tortoise began to walk.

Before long, the hare could no longer see his rival. He stopped beside some grass and looked back along the empty path. Winning would be easy. Perhaps it would be more amusing to wait for the tortoise, then run past him just before the finish.

The hare lay down. The grass was comfortable, and soon he was asleep.

The tortoise kept walking. He passed the sleeping hare without stopping. His legs were short, but they kept moving.

When the hare woke, the light had changed. He jumped up and looked down the path. The tortoise was almost at the finish line.

Now the hare ran as fast as he could. His feet barely touched the ground. But just before he reached the line, the tortoise crossed it.

The fox announced the winner. The tortoise stopped to rest, and the hare stood beside him, too out of breath to say a word.`,
  },
  {
    id: "en-classic-aesop-farmer-sons", level: 4,
    title: "The Farmer's Treasure",
    blurb: "Aesop · three brothers dig for a fortune on their father's farm. Retold.",
    author: "Aesop", source: "Public domain (Aesop), retold for Duki · AI-drafted",
    sourceUrl: "https://www.gutenberg.org/ebooks/19994",
    topics: ["classics", "folk-tales", "work"],
    body: `An old farmer called his three sons to his bed. He was very ill, and he knew that he would not live much longer.

"Keep the farm after I'm gone," he told them. "Don't sell it. There is a treasure hidden in the land."

The brothers leaned closer.

"Where?" asked the oldest. "Under the big tree? Near the house?"

Their father would not name a place. "You'll have to search," he said. "Turn over the earth. Don't leave any part of the farm untouched."

After their father died, the sons brought out their tools. They began near the house, where they thought he might have buried something. They dug down into the soil and broke the hard earth apart. They found roots and stones, but no treasure.

They moved farther into the fields. Every morning they chose another place to dig. By evening their backs hurt and their hands were sore. Still they went on. None of them wanted to stop just before they found the gold.

At last they had turned over all the land, some of it more than once. There was no box of coins anywhere.

"We've done all this digging," said one brother. "We might as well plant something."

So they planted the fields and cared for the young plants. That year the crops grew better than ever. At harvest time, the brothers had more to sell than their neighbors. After paying their costs, they counted the money they had left.

Then they understood their father's words. The treasure had come from the land, though they had not dug up a single gold coin.`,
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
