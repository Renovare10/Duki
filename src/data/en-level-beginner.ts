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

My bag is on the chair next to me. I put it on the floor.

"Yes," I say. "This seat is for you."

He opens his box. I have an apple. He has two small oranges.

"Do you like oranges?" he asks.

I do. We put the fruit in the middle of the table. We share the apple and the oranges.`,
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
  {
    ...original,
    id: "en-l2-the-shirt-with-a-name", level: 2, title: "The Shirt with a Name",
    blurb: "Nina wears her brother's old school shirt, with his name still inside.",
    createdAt: 240_010,
    body: `Nina needs a white shirt for school. Her brother's old shirt fits her now. Mom washes it and puts it on Nina's bed.

Inside the shirt, Nina finds a name: Alex. Mom wrote it there two years ago.

"It still has his name," Nina says.

"I can put your name under it," Mom says.

Nina is quiet. She wants something new, with only her name on it.

Alex comes to the door. "Is that my old shirt? I wore it for the school show."

Nina remembers. He was a very bad tree. He fell over, and everyone laughed.

She puts on the shirt. It looks different on her.

"You can write my name now," she tells Mom. "But leave his name too. I want to show my friends the tree's shirt."`,
  },
  {
    ...original,
    id: "en-l2-the-first-pay", level: 2, title: "The First Pay",
    blurb: "Leo has his first pay and a long walk home.",
    createdAt: 240_011,
    body: `Leo works in a small food shop. At the end of his first week, he gets his pay. He checks the money in his bank account twice.

All week, he has walked to work. His bike has a broken wheel. The walk takes forty minutes.

He wants to buy a good dinner. But he also wants to sleep a little later on Monday.

He takes his bike to the bike shop. A new wheel costs less than he thought. There is still some money left.

On his way home, he buys a hot potato from a man by the road. He sits on a wall to eat it. His bike stands beside him, ready for Monday.

It is a good dinner after all.`,
  },
  {
    ...original,
    id: "en-l2-the-quiet-table", level: 2, title: "The Quiet Table",
    blurb: "Sara chooses a busy place for lunch, but her friend cannot hear her.",
    createdAt: 240_012,
    body: `Sara meets her friend Jo for lunch. She chooses a place with good noodles. The room is full of people, and music comes from a speaker above their table.

Sara starts a story about her new job. Jo leans across the table.

"Sorry. What did you say?"

Sara speaks again, louder this time. Jo still cannot hear every word. They eat for a while without talking.

Then Sara sees a small table outside. No one is sitting there.

"Can we move?" she asks the waiter.

Outside, they can hear birds and cars, but there is no music. Jo puts her bowl down.

"Now," she says, "tell me about that job. Start at the beginning."

Sara does. Soon their noodles are cold, but they keep talking.`,
  },
  {
    ...original,
    id: "en-l2-a-photo-for-grandpa", level: 2, title: "A Photo for Grandpa",
    blurb: "A family photo is almost ready. The baby has other plans.",
    createdAt: 240_013,
    body: `Grandpa lives far away. Today is his birthday, so we want to send him a new family photo.

Dad puts his phone on a shelf. We all stand in front of it. The phone will take the picture in ten seconds.

Mom holds my baby sister. My brother stands beside me.

"Look at the phone," Dad says.

My sister looks at Dad instead. She takes his glasses off his face.

We all laugh. The phone takes the photo.

"Let's do it again," my brother says.

We take another picture. This time, we stand still and smile.

We send both photos to Grandpa. A message comes back: "Please send the first one on paper. I want that one on my wall."`,
  },
  {
    ...original,
    id: "en-l2-shoes-for-the-play", level: 2, title: "Shoes for the Play",
    blurb: "Eli knows his words for the school play. Walking is the hard part.",
    createdAt: 240_014,
    body: `Eli is the king in the school play. He knows all his words. He has a long coat and a gold hat made of paper.

For the last practice, he wears black shoes from the school's clothes box. They are a little too big.

He walks across the stage. One shoe comes off. He stops and goes back for it. Then he forgets his words.

After practice, Eli sits on the floor. "I can't walk in these," he tells the teacher.

"What shoes do you usually wear?" she asks.

He shows her his red sports shoes.

"Wear those. Your coat covers your feet."

On the night of the play, Eli walks slowly onto the stage. Both shoes stay on. He looks at the people and remembers his first words.

"Welcome to my home!"`,
  },
  {
    ...original,
    id: "en-l2-three-soft-tomatoes", level: 2, title: "Three Soft Tomatoes",
    blurb: "Rose wants tomatoes for tonight, not for next week.",
    createdAt: 240_015,
    body: `At the market, Rose sees two boxes of tomatoes. One box has large, firm tomatoes. The other has small, soft ones. The soft ones cost less.

"Are these still good?" she asks the seller.

"Yes, but eat them soon. What are you making?"

"Something for dinner. I don't know what yet."

"They are good for a sauce," he says.

Rose buys three soft tomatoes and an onion. At home, she cuts them up. She cooks the onion in a little oil, then adds the tomatoes. Soon the kitchen smells sweet.

She puts the sauce on some rice and tastes it.

Next week, her sister is coming for dinner. Rose writes a shopping list. At the top, she puts "soft tomatoes."`,
  },
  {
    ...original,
    id: "en-l2-the-last-ten-minutes", level: 2, title: "The Last Ten Minutes",
    blurb: "Mia is ready to stop playing. Her friend suggests a different game.",
    createdAt: 240_016,
    body: `Mia is learning to play tennis. Her friend has played for years.

They have the court for one hour. After fifty minutes, Mia is tired of running after balls. Most of her shots go into the net or over the line.

"I'm not very good at this," she says. She puts down her racket.

"We have ten minutes left," her friend says. "Let's try something else. No points. Just get the ball back to me."

They stand closer to the net. Her friend hits the ball softly. Mia hits it back. They do it again.

This time, Mia counts the shots, not the points. They reach eight before the ball falls.

Their hour is over. Mia picks up the ball.

"Next time," she says, "let's try for ten."`,
  },
  {
    ...original,
    id: "en-l2-the-library-bookmark", level: 2, title: "The Library Bookmark",
    blurb: "A date on a piece of paper interrupts a very good story.",
    createdAt: 240_017,
    body: `Last night, I was reading a library book in bed. A girl in the story was opening a strange door. I wanted to know what was behind it.

Then my bookmark fell out. It was the little piece of paper from the library. I picked it up and read the date. I had to take the book back today.

I still had half the book to read. I looked at the clock. It was almost midnight.

This morning, I took the book to the library. I asked if I could keep it for another week. No one else was waiting for it, so the woman at the desk said yes.

Tonight, I can find out about that door. First, I am putting the new date on my phone.`,
  },
  {
    ...original,
    id: "en-l2-snow-on-the-phone", level: 2, title: "Snow on the Phone",
    blurb: "Ken's phone says snow. The view from his new room says something else.",
    createdAt: 240_018,
    body: `Ken moves to a new city for work. On his first morning, he looks at the weather on his phone. There is a picture of snow. The temperature is below zero.

He takes his warmest coat out of a box. He puts on a hat too.

Downstairs, he opens the front door. Warm air comes in. A man walks past in a T-shirt.

Ken looks at his phone again. Above the picture of snow is the name of his old city.

He goes back upstairs and changes his clothes. Then he calls his sister at home.

"Is it snowing there?" he asks.

"Yes. Can you see it on your phone?"

"Yes," he says. "I got dressed for your weather this morning."`,
  },
  {
    ...original,
    id: "en-l2-the-new-key", level: 2, title: "The New Key",
    blurb: "Ruth has her own home now. She is not used to opening the door.",
    createdAt: 240_019,
    body: `For six months, Ruth has lived with her sister. Today, she gets the key to a small apartment of her own.

She carries her first box up the stairs. At the door, she knocks. Then she laughs at herself. There is no one inside. The key is in her pocket.

The apartment has a bed but no table yet. Ruth puts down her box and sits on the floor. The room is very quiet. At her sister's home, someone is always talking or watching TV.

Her phone rings. It is her sister.

"Can I come over tomorrow?"

"Yes," Ruth says. "Bring a chair. I haven't got any."

The next afternoon, there is a knock at the door. This time, Ruth is on the other side. She gets up to let her sister in.`,
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
  "en-l2-the-shirt-with-a-name": ["school", "family", "feelings"],
  "en-l2-the-first-pay": ["work", "shopping", "daily-life"],
  "en-l2-the-quiet-table": ["food", "feelings", "daily-life"],
  "en-l2-a-photo-for-grandpa": ["family", "daily-life", "humor"],
  "en-l2-shoes-for-the-play": ["school", "arts", "feelings"],
  "en-l2-three-soft-tomatoes": ["shopping", "food", "daily-life"],
  "en-l2-the-last-ten-minutes": ["sports", "feelings"],
  "en-l2-the-library-bookmark": ["daily-life", "literature"],
  "en-l2-snow-on-the-phone": ["weather", "daily-life", "humor"],
  "en-l2-the-new-key": ["daily-life", "family", "feelings"],
};
