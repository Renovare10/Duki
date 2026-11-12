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
  {
    id: "en-classic-grimm-star-money", level: 5,
    title: "The Star-Money",
    blurb: "Brothers Grimm · a girl gives away the last things she owns. An abridged retelling.",
    author: "Jacob and Wilhelm Grimm",
    source: "Public domain (Brothers Grimm; Margaret Hunt translation), retold for Duki · AI-drafted",
    sourceUrl: "https://www.gutenberg.org/ebooks/5314",
    topics: ["classics", "folk-tales", "faith"],
    body: `A little girl had lost both her parents. She had no house to return to and no bed in which to sleep. All she owned were the clothes she wore and a piece of bread that someone had given her.

With the bread in her hand, she set off across the open country. She did not know where she would spend the night, but she trusted that God would look after her.

Before she had gone far, she met a hungry man. He asked whether she had anything to eat. The girl looked at her bread. It was the only food she had, and she had not eaten it yet. Still, she put the whole piece into his hand.

"May God bless it for you," she said, and walked on.

Soon she met a child who was shivering. His head was bare, and he had nothing to keep it warm. The girl took off her hood and gave it to him.

Farther along the road, another child needed a jacket. She gave away her own. Then she met a child who needed a dress, and she gave that away too.

By the time she reached a forest, it was dark. She had only her thin shirt left. One more child came towards her and asked for something to wear.

The girl stood among the trees. No one could see her in the darkness, she thought. She took off her shirt and handed it over.

Now she had nothing at all.

As she stood there, the stars began to fall. But what landed around her was not light or fire. Smooth silver coins dropped through the branches and lay shining on the ground.

At the same moment, the girl found that she was wearing a new shirt of the finest linen. She lifted its hem and gathered the coins into it. There were enough to support her for the rest of her life.`,
  },
  {
    id: "en-classic-andersen-real-princess", level: 5,
    title: "The Real Princess",
    blurb: "Hans Christian Andersen · a royal test with three peas, as in this early English edition. Retold.",
    author: "Hans Christian Andersen",
    source: "Public domain (Hans Christian Andersen), retold from the cited English edition for Duki · AI-drafted",
    sourceUrl: "https://www.gutenberg.org/ebooks/1597",
    topics: ["classics", "folk-tales", "humor"],
    body: `A prince wanted to marry a princess, but she had to be a real one. He traveled from country to country, meeting princesses wherever he went. There were plenty of them. The difficulty was deciding whether they were genuine.

Whenever he met someone, something did not seem quite right. At last he returned home without a wife, very disappointed.

One evening a terrible storm broke over the palace. Thunder shook the windows, and rain poured down in the dark. Someone knocked at the gate. The old king went to open it himself.

A young woman stood outside. Water ran from her hair, and her wet clothes stuck to her body. She hardly looked ready for a royal visit. Nevertheless, she said she was a real princess.

The queen decided to find out. Without explaining her plan, she went into a bedroom and stripped the bed. On the bare bedstead she placed three little peas. Over them she piled twenty mattresses, followed by twenty thick feather beds.

The visitor was shown to this enormous bed and left to spend the night.

In the morning, the queen asked how she had slept.

"Very badly," the young woman answered. "There was something hard under me. I hardly closed my eyes, and now I'm covered in bruises."

That settled the question for the royal family. Only a real princess, they decided, could have felt three peas through so many layers of bedding. The prince had finally found the wife he wanted, and they were married.

The peas were placed in a collection of rare objects, where, according to the story, you may still see them today. Unless, of course, somebody has lost them.`,
  },
  {
    id: "en-classic-andersen-emperor-clothes", level: 6,
    title: "The Emperor's New Clothes",
    blurb: "Hans Christian Andersen · nobody wants to admit what they cannot see. An abridged retelling.",
    author: "Hans Christian Andersen",
    source: "Public domain (Hans Christian Andersen), retold for Duki · AI-drafted",
    sourceUrl: "https://www.gutenberg.org/ebooks/1597",
    topics: ["classics", "folk-tales", "humor"],
    body: `There was once an emperor who cared more about clothes than about governing his country. He had an outfit for every hour of the day. When people wanted to know where he was, the answer was usually that he was changing.

One day two strangers arrived in the capital. They claimed to be weavers who could produce a remarkable cloth. Its colors and patterns were beautiful, they said, but its greatest advantage was stranger still: anyone who was foolish, or unfit for their position, would be unable to see it.

The emperor immediately ordered a suit. With clothes like these, he thought, he could discover which of his officials deserved their jobs.

The strangers asked for silk, gold thread, and a large payment. They put the money and materials away, then sat at empty looms, moving their hands as though they were working.

After a while, the emperor sent a trusted minister to inspect their progress. The minister entered the room and stared. He could see the looms perfectly well, but there was nothing on them.

He felt cold with fear. Was he a fool? Had he been given a position he did not deserve? He must not let anyone find out.

"What beautiful colors!" he said.

The weavers described an elaborate pattern. The minister listened carefully so that he could repeat their description to the emperor. A second official visited and did exactly the same thing.

At last the emperor went to see the cloth himself. He could not see it either. But since everyone around him was praising it, he smiled and praised it too.

The weavers worked through the night before a grand procession. They cut the air with scissors and sewed with needles that carried no thread. In the morning they announced that the clothes were ready.

The emperor took off his real clothes. The strangers pretended to dress him, lifting invisible sleeves and arranging an invisible train. His attendants admired the fit. No one dared to mention that there was nothing to fit.

Then the emperor stepped out beneath a fine canopy and began his walk through the city. Behind him, servants held their hands above the ground, carrying the train they could not see.

People lined the streets. They had all heard about the special cloth. Each person feared that everyone else could see something they could not, so they praised the emperor's magnificent new suit.

A child looked up from the crowd.

"But he hasn't got anything on!"

The child's father tried to explain away the remark, but nearby people had heard it. They whispered the words to one another. Soon the whisper had spread through the whole crowd, and people were saying aloud that the emperor wore nothing at all.

The emperor heard them. He suspected they were right, yet he could not bring himself to stop the procession. He straightened his back and walked on with greater dignity than ever. Behind him, the servants continued to carry the train.`,
  },
  {
    id: "en-classic-grimm-six-swans", level: 6,
    title: "The Six Swans",
    blurb: "Brothers Grimm · six shirts and six years of silence. An abridged retelling; includes threatened execution.",
    author: "Jacob and Wilhelm Grimm",
    source: "Public domain (Brothers Grimm; Margaret Hunt translation), retold for Duki · AI-drafted",
    sourceUrl: "https://www.gutenberg.org/ebooks/5314",
    topics: ["classics", "folk-tales", "family"],
    body: `A king had six sons and a daughter. After he married again, he feared that his new wife might hurt the children, so he hid them in a castle deep in the forest. To find it, he followed a magic ball of thread that unwound before him.

The queen discovered his secret. She stole the ball and used it to reach the castle while the king was away. The six boys ran out, expecting their father. She threw enchanted shirts over them, and they changed into swans. Their sister, who had remained inside, escaped the spell.

That night the girl left the castle to search for her brothers. After a long journey, she found a hut with six beds. At sunset six swans flew through its window. Their feathers fell away, and for a quarter of an hour they became her brothers again.

They told her how to break the spell. For six years she must neither speak nor laugh. During that time she must make six shirts from a plant called starwort. One word would undo all her work.

The girl gathered the plants and began to sew. She worked alone in the forest until hunters discovered her sitting in a tree. They took her to the king who ruled that country, a different king from her father. He questioned her, but she could not answer.

The king fell in love with her and made her his queen. She lived in his palace, still sewing, still silent.

His mother hated the marriage. When the young queen had a baby, the old woman secretly took it away and accused her of killing it. The king refused to believe the accusation. But the same thing happened after the births of two more children, and the queen would not say a word in her defense.

At last she was condemned to be burned. The day of the execution was also the final day of the six years. Five shirts were finished. The sixth still lacked its left sleeve.

She carried the shirts with her to the place where the fire had been prepared. Before it could be lit, six swans appeared overhead. They flew down, and she threw a shirt over each one.

Her brothers stood before her again. Only the youngest was not completely restored: where his left arm should have been, he still had a swan's wing.

Now the six years were over. The queen could finally speak. She told her husband about the spell, her work, and his mother's crimes. Her children had not been killed; the old woman had hidden them. They were found and brought back to her.

The king's mother was punished, and the family lived in peace. The sister had recovered her voice and her children. Her youngest brother kept the wing left by the unfinished shirt.`,
  },
  {
    id: "en-classic-kipling-elephants-child", level: 7,
    title: "The Elephant's Child",
    blurb: "Rudyard Kipling · an inconvenient question leads to a very useful nose. An abridged retelling.",
    author: "Rudyard Kipling",
    source: "Public domain (Rudyard Kipling), retold for Duki · AI-drafted",
    sourceUrl: "https://www.gutenberg.org/ebooks/2781",
    topics: ["classics", "folk-tales", "adventure"],
    body: `Long ago, according to this story, elephants had short noses. They could wriggle them, but they could not pick anything up with them. Among these elephants was one young child whose curiosity caused considerable trouble in the family.

He wanted to know why the ostrich's tail looked as it did, what had given the giraffe his spots, and why melons tasted so good. His aunts and uncles answered his questions by smacking him. This did nothing to reduce the number of questions.

One morning he asked what a crocodile ate for dinner. Every relative told him to be quiet. After they had all punished him, he went to the Kolokolo Bird, who advised him to visit the Limpopo River and discover the answer for himself.

So the Elephant's Child packed bananas, sugar cane, and melons, and set out across Africa. As he ate the melons, he left the rinds behind. With his short nose, he could not pick them up.

At the river he met a python curled around a rock. The snake was no more helpful than the family had been, and struck him with its tail. The Elephant's Child continued along the bank until he stepped on what appeared to be a log.

The log opened an eye. It was a crocodile, though the young elephant had never seen one and did not recognize it.

He politely asked whether it knew where he could find a crocodile. The creature admitted that it was one. Delighted, the Elephant's Child knelt on the bank and asked his question about dinner.

"Come closer," said the Crocodile. "I'll whisper."

The Elephant's Child lowered his head. The Crocodile seized his nose between its jaws and announced that today's dinner would begin with him.

He pulled backwards. The Crocodile pulled towards the water. Between them, the little nose began to stretch.

The python, hearing the struggle, came down from its rock. Whatever its earlier manners, it now offered sensible advice: unless the elephant pulled much harder, he would shortly disappear into the river.

He spread all four legs and pulled. His nose grew longer. The Crocodile thrashed its tail and dragged him forward. Just as the elephant's feet began to slip, the python wrapped itself around his hind legs and added its strength to his.

At last the Crocodile lost its grip. The Elephant's Child landed heavily on the bank with a nose several feet longer than the one he had brought there.

He thanked the python, wrapped the painful nose in cool leaves, and waited for it to shrink. He waited three days. It did not shrink at all.

Then a fly bit his shoulder. Without thinking, he lifted his new nose and struck the fly. A little later he reached out, gathered grass, and put it into his mouth. When the sun grew hot, he scooped up mud and spread it on his head.

The python pointed out that a short nose could have done none of these things. The stretched nose had become a trunk.

On his way home, the Elephant's Child used it to pull fruit from trees and to pick up his discarded melon rinds. Once home, he also discovered that it gave him an advantage when his relatives wanted to smack him. He could now reach them before they reached him, and he made enthusiastic use of this discovery.

Before long, his family hurried off to the Limpopo to obtain trunks of their own. When they returned, the smacking finally stopped. And that, the story says, is why elephants have trunks today.`,
  },
  {
    id: "en-classic-wilde-selfish-giant", level: 7,
    title: "The Selfish Giant",
    blurb: "Oscar Wilde · a locked garden stays in winter. An abridged retelling with the original religious ending.",
    author: "Oscar Wilde",
    source: "Public domain (Oscar Wilde), retold for Duki · AI-drafted",
    sourceUrl: "https://www.gutenberg.org/ebooks/902",
    topics: ["classics", "literature", "faith"],
    body: `Every afternoon after school, the children played in the Giant's garden. The grass was soft, the peach trees flowered in spring, and the birds sang so beautifully that the children sometimes interrupted their games to listen.

The Giant had been away for seven years. When he returned and found strangers in his garden, he shouted at them until they fled. Then he built a high wall and put up a notice threatening anyone who entered without permission.

Outside the wall, the children tried playing on the road, but it was dusty and covered with hard stones. Inside, the Giant had the garden entirely to himself.

Spring arrived everywhere except behind his wall. There, snow covered the grass and frost silvered the branches. The birds would not sing where there were no children, and the trees would not blossom. The North Wind came to stay, bringing Hail as a guest. Together they battered the castle and raced around the empty garden.

Summer passed, then autumn, but the Giant's winter continued. He sat at his window, puzzled by the weather.

One morning he heard music. After so many months without birdsong, an ordinary little bird outside his window sounded like a whole company of musicians. He jumped out of bed and looked into the garden.

The children had crept through a hole in the wall. They were sitting among the branches, and every tree they occupied was covered in flowers. Only one corner remained frozen. There a very small boy was crying because he could not reach a branch. The tree bent towards him, but he was still too small to climb.

Watching from the window, the Giant understood what he had done. He went downstairs and into the garden.

The children saw him and scattered. Winter returned immediately. Only the little boy remained; his tears prevented him from seeing the Giant approach. The Giant lifted him gently and set him in the tree. Blossoms opened overhead. The child threw his arms around the Giant's neck and kissed him.

When the other children saw this, they returned, and spring came with them. The Giant knocked down the wall. From then on, the children could play in his garden whenever they wished.

But that evening the smallest boy disappeared. None of the others knew where he lived. The Giant asked about him day after day, without success.

Years passed. The Giant grew too old to join the games. Instead he sat in an enormous chair and watched the children playing. He was fond of them all, yet he never forgot the first child he had helped.

One winter morning, he looked out and saw a tree covered in white blossoms. Its branches were gold, and silver fruit hung from them. Beneath it stood the little boy.

The Giant hurried outside. Then his happiness changed to anger: there were marks of nails on the child's hands and feet. He demanded to know who had wounded him, so that he could punish them.

The boy told him that these were the wounds of love. A strange awe came over the Giant, and he knelt.

"You let me play once in your garden," the child said. "Today you shall come with me to my garden, which is Paradise."

That afternoon, when the children ran in after school, they found the Giant dead beneath the tree. White blossoms covered his body.`,
  },
  {
    id: "en-classic-frost-road-not-taken", level: 8,
    title: "The Road Not Taken",
    blurb: "Robert Frost · a choice remembered, and perhaps changed in the telling. Original poem, 1916.",
    author: "Robert Frost", source: "Public domain (Robert Frost), original poem from Mountain Interval (1916)",
    sourceUrl: "https://www.gutenberg.org/ebooks/29345",
    topics: ["classics", "poetry", "feelings"],
    body: `Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;

Then took the other, as just as fair,
And having perhaps the better claim,
Because it was grassy and wanted wear;
Though as for that the passing there
Had worn them really about the same,

And both that morning equally lay
In leaves no step had trodden black.
Oh, I kept the first for another day!
Yet knowing how way leads on to way,
I doubted if I should ever come back.

I shall be telling this with a sigh
Somewhere ages and ages hence:
Two roads diverged in a wood, and I--
I took the one less traveled by,
And that has made all the difference.`,
  },
  {
    id: "en-classic-dickinson-chariot", level: 8,
    title: "The Chariot",
    blurb: "Emily Dickinson · a quiet carriage ride with Death. The five-stanza, edited 1890 text, not the later manuscript version.",
    author: "Emily Dickinson",
    source: "Public domain (Emily Dickinson), Poems, Series One (1890), edited by Mabel Loomis Todd and T. W. Higginson",
    sourceUrl: "https://www.gutenberg.org/ebooks/2678",
    topics: ["classics", "poetry", "literature"],
    body: `Because I could not stop for Death,
He kindly stopped for me;
The carriage held but just ourselves
And Immortality.

We slowly drove, he knew no haste,
And I had put away
My labor, and my leisure too,
For his civility.

We passed the school where children played,
Their lessons scarcely done;
We passed the fields of gazing grain,
We passed the setting sun.

We paused before a house that seemed
A swelling of the ground;
The roof was scarcely visible,
The cornice but a mound.

Since then 't is centuries; but each
Feels shorter than the day
I first surmised the horses' heads
Were toward eternity.`,
  },
  {
    id: "en-classic-shelley-ozymandias", level: 9,
    title: "Ozymandias",
    blurb: "Percy Bysshe Shelley · a ruler's boast survives among the ruins. Original sonnet, 1818.",
    author: "Percy Bysshe Shelley",
    source: "Public domain (Percy Bysshe Shelley), original poem in The Complete Poetical Works",
    sourceUrl: "https://www.gutenberg.org/ebooks/4800",
    topics: ["classics", "poetry", "history"],
    body: `I met a traveller from an antique land
Who said: Two vast and trunkless legs of stone
Stand in the desert...Near them, on the sand,
Half sunk, a shattered visage lies, whose frown,
And wrinkled lip, and sneer of cold command,
Tell that its sculptor well those passions read
Which yet survive, stamped on these lifeless things,
The hand that mocked them, and the heart that fed:
And on the pedestal these words appear:
‘My name is Ozymandias, king of kings:
Look on my works, ye Mighty, and despair!’
Nothing beside remains. Round the decay
Of that colossal wreck, boundless and bare
The lone and level sands stretch far away.`,
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
