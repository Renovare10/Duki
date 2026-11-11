/**
 * Original English graded stories for the English side of Duki. Drafted by Duki's AI assistant
 * (like the Mandarin packs marked aiGenerated), no third-party or copyrighted text, no paid
 * services. Two per level, L1–L10, pitched like the Mandarin ladder:
 * short, high-frequency, present-tense at L1; longer sentences, idiom and abstraction by L9–10.
 * Format matches the Mandarin library packs: paragraphs separated by a blank line.
 */
import type { LibraryText } from "../types";

export type EnglishStory = {
  /** Permanent id: "en-" + level + slug. Never rename (progress is keyed to it). */
  id: string;
  level: number;
  title: string;
  blurb: string;
  topics: string[];
  body: string;
};

export const EN_STORIES: EnglishStory[] = [
  {
    id: "en-l1-the-red-cup", level: 1, title: "The Red Cup",
    blurb: "A girl looks for her cup before breakfast.",
    topics: ["daily-life", "family"],
    body: `I have a red cup. I like my cup. It is big.

Today I do not see my cup. It is not on the table. It is not in the box.

Mom has my cup. She puts milk in it. "Here you go," she says. I am happy.`,
  },
  {
    id: "en-l1-my-dog-max", level: 1, title: "My Dog Max",
    blurb: "Max wants to play, and it is raining.",
    topics: ["daily-life", "nature"],
    body: `I have a dog. His name is Max. Max is small and brown.

Max likes to run. He likes to play with a ball. Today it is raining. We cannot go out.

I sit on the floor. Max sits with me. I give him the ball. He is happy, and I am happy too.`,
  },
  {
    id: "en-l2-the-bus-is-late", level: 2, title: "The Bus Is Late",
    blurb: "Waiting in the cold, Ben meets someone new.",
    topics: ["daily-life", "travel"],
    body: `Every morning Ben takes the bus to school. The bus comes at eight o'clock. Today it is eight fifteen, and the bus is not here.

It is cold. Ben puts his hands in his pockets. An old man stands next to him. "The bus is late again," the man says. He smiles.

They talk about the weather and about Ben's school. The man was a teacher many years ago. He taught math.

At eight thirty the bus comes. Ben gets on. He waves to the man. Now the late bus does not feel so bad.`,
  },
  {
    id: "en-l2-soup-for-grandma", level: 2, title: "Soup for Grandma",
    blurb: "Lily makes soup for the first time.",
    topics: ["food", "family"],
    body: `Grandma is sick. She stays in bed all day. Lily wants to help her.

"I can make soup," Lily says. Her dad laughs. "Can you cook?" he asks. "Not yet," Lily says. "But I can learn."

Dad helps her. They cut carrots, onions and potatoes. They put them in a pot with water and a little salt. The kitchen smells good.

After one hour the soup is ready. Lily carries a bowl to Grandma. Grandma eats it slowly. "This is the best soup in the world," she says. Lily knows it is not true, but she is very happy.`,
  },
  {
    id: "en-l3-the-wrong-train", level: 3, title: "The Wrong Train",
    blurb: "A small mistake turns into a free day by the sea.",
    topics: ["travel", "feelings"],
    body: `Anna was in a hurry. She ran into the station, saw a train on platform two and jumped on. The doors closed behind her.

Ten minutes later she looked out of the window. Where were the tall buildings? Where was the river? She only saw fields and cows. She was on the wrong train.

Anna felt silly. She asked a woman next to her, "Where does this train go?" The woman smiled. "To the sea. It's the last stop."

Anna thought about her plans. A meeting, a lot of emails, a sandwich at her desk. Then she thought about the sea. She had not seen it for two years.

She called her office and said she was sick. It was not completely true. That afternoon she walked on the beach, ate fish and chips and watched the waves. It was the best mistake she ever made.`,
  },
  {
    id: "en-l3-a-new-neighbor", level: 3, title: "A New Neighbor",
    blurb: "Loud music next door leads to an unexpected friend.",
    topics: ["daily-life", "feelings"],
    body: `A new family moved into the house next to ours in June. On the first night, we heard loud music until midnight. My father was angry. "I will talk to them tomorrow," he said.

The next morning he knocked on their door. A young man opened it. He was holding a guitar. "I'm sorry," he said before my father could speak. "Was it too loud? I'm a music student, and I have a big exam next week."

My father did not know what to say. He played the guitar too when he was young, but he stopped many years ago.

Now they practice together every Saturday afternoon, in our garage, with the door closed. My mother says the music is still too loud. But she always brings them lemonade.`,
  },
  {
    id: "en-l4-the-lost-wallet", level: 4, title: "The Lost Wallet",
    blurb: "A wallet on the sidewalk, and the choice that follows.",
    topics: ["daily-life", "feelings"],
    body: `On his way home from work, Sam noticed a brown wallet lying on the sidewalk. He picked it up and looked around, but the street was empty.

Inside there were three hundred dollars, a driver's license and a photo of two small children. The license belonged to a woman called Maria Lopez. Her address was on the other side of the city.

Sam stood there for a long time. His rent was due on Friday, and he did not have enough money. Nobody had seen him. It would be easy to keep the cash and drop the wallet in a mailbox.

Then he looked at the photo again. The children were wearing paper crowns, as if it were a birthday party.

He took the bus across the city and found the apartment. When Maria opened the door and saw the wallet, she started to cry. She had been saving that money for her son's birthday.

She tried to give Sam fifty dollars, but he refused. On the bus home he felt strangely light, even though his pockets were just as empty as before.`,
  },
  {
    id: "en-l4-learning-to-swim", level: 4, title: "Learning to Swim at Forty",
    blurb: "A grown man finally faces the deep end.",
    topics: ["sports", "health"],
    body: `David had always been afraid of water. As a child he had nearly drowned in a lake, and since then he had avoided swimming pools, beaches and even boats.

When his daughter joined a swimming club, he sat on the bench and watched. Every week she asked him the same question: "Dad, why don't you ever come in?" He always had an excuse.

On his fortieth birthday, he decided that he was tired of excuses. He signed up for lessons for adults. The first class was terrible. He stood in the shallow end, holding the wall, while his heart beat wildly.

The teacher was patient. "We are not in a hurry," she said. "Today, just put your face in the water."

It took him six weeks to float and three months to swim one length of the pool. It was not fast, and it was not pretty.

On the day he finally swam the whole length, his daughter was watching from the bench. She clapped louder than anyone.`,
  },
  {
    id: "en-l5-the-night-shift", level: 5, title: "The Night Shift",
    blurb: "A nurse and an old patient who cannot sleep.",
    topics: ["health", "work"],
    body: `By three in the morning, the hospital ward was quiet except for the soft beeping of machines. Grace had been working night shifts for almost a year, and she had come to enjoy these hours, when the corridors were empty and the patients were finally asleep.

All except Mr. Harris in room twelve. He was eighty-seven, recovering from a broken hip, and every night he pressed his call button at exactly the same time.

"I can't sleep," he would say. "Would you sit with me for a minute?"

At first Grace found it frustrating. There were charts to update and medicine to prepare. But gradually she began to look forward to their conversations. Mr. Harris had been a sailor, then a baker, then a bus driver, and he had a story about everything.

One night she found his bed empty. Her stomach dropped, until a colleague explained that his son had taken him home that evening.

On the table by the window he had left a note in shaky handwriting: "Thank you for the minutes. They added up to something."`,
  },
  {
    id: "en-l5-the-garden-plot", level: 5, title: "The Garden Plot",
    blurb: "Two strangers, one shared garden, and a summer of tomatoes.",
    topics: ["nature", "food"],
    body: `When the city opened a community garden on an empty lot behind the library, Mei applied immediately. She had grown up on a farm, and after five years in a small apartment, she missed the feeling of soil under her fingernails.

There were more applicants than plots, so the organizers made people share. Mei was paired with Frank, a retired electrician who admitted he had never grown anything in his life.

They disagreed about almost everything. Mei wanted neat rows; Frank preferred to plant wherever there was space. She watered in the morning; he insisted evening was better. For the first few weeks they communicated mostly through notes left under a stone.

Then, in July, a storm flattened half the garden. They arrived at the same time the next morning and, without discussing it, started repairing the damage together.

By August their plot was producing more tomatoes than either of them could eat. They set up a small table by the gate with a sign that said "Free. Take some." Every evening the table was empty, and every evening they agreed, more or less, on what to plant next.`,
  },
  {
    id: "en-l6-the-interview", level: 6, title: "The Interview",
    blurb: "A perfectly prepared candidate meets an unexpected question.",
    topics: ["work", "feelings"],
    body: `Nadia had prepared for the interview as if it were an exam. She had researched the company's history, memorized its annual figures and rehearsed answers to every question she could imagine, from her greatest weakness to where she saw herself in five years.

The interviewer, a tired-looking man in his fifties, glanced at her CV for a few seconds and then put it aside.

"Tell me about something you failed at," he said, "and didn't learn anything from."

Nadia hesitated. Her prepared answer about failure ended, as these answers always do, with a valuable lesson. This question seemed designed to make that impossible.

After a long pause, she told him about the year she had tried to learn the violin. She had practiced every day, hired a teacher and bought an expensive instrument, and at the end of it she still sounded like a door that needed oil. She had not discovered hidden talent, or patience, or anything else. She had simply stopped.

The interviewer laughed for the first time. "Finally," he said. "An honest answer. Most people turn every disaster into a motivational poster."

She got the job. Years later, when she was the one conducting interviews, she asked the same question, and she was always surprised by how few people could answer it.`,
  },
  {
    id: "en-l6-the-last-bookshop", level: 6, title: "The Last Bookshop on Mill Street",
    blurb: "An old shop, a rent increase, and a neighborhood that notices.",
    topics: ["culture", "work"],
    body: `For thirty-one years, Walter Brooks had run the small secondhand bookshop on Mill Street. Over that time, the neighborhood had changed almost beyond recognition: the hardware store had become a coffee chain, the bakery a phone repair shop, and the old cinema a block of expensive apartments.

So when a letter arrived announcing that his rent would double in January, Walter was disappointed but not exactly surprised. He calculated that he could survive perhaps four more months.

He put a modest sign in the window: "Closing at the end of the year. Thank you for everything." He expected a few sympathetic customers. He did not expect what happened next.

A teenager who had spent her childhood reading in the back corner posted a photo of the sign online. Within a week, the shop was busier than it had been in a decade. Former customers came back from other cities. A retired lawyer offered to negotiate with the landlord for free. A group of students organized a reading marathon that raised enough money to cover six months of rent.

The landlord, faced with a crowd of reporters and a surprisingly well-informed lawyer, eventually agreed to a smaller increase. Walter took down the sign and replaced it with another one: "Still here. Thanks to you."`,
  },
  {
    id: "en-l7-the-translator", level: 7, title: "The Translator",
    blurb: "Between two languages, a word that refuses to cross over.",
    topics: ["culture", "work", "literature"],
    body: `Elena had spent eleven months translating the novel, and only one word remained unresolved. It appeared on the final page, in the last line of dialogue, spoken by a grandmother to the grandson who is leaving their village forever. In the original language it meant, roughly, "the feeling of a place continuing without you."

There was no equivalent in English. Elena had filled a notebook with alternatives. "Absence" was too cold. "Longing" pointed in the wrong direction, from the person to the place rather than the reverse. A footnote would interrupt the most delicate moment in the book, and inventing a new word felt like cheating.

Her editor, sympathetic but pressed by a deadline, suggested she simply cut the line. "Readers won't miss what they never saw," he wrote.

Elena found that argument unbearable precisely because it was correct. Translation, she had come to believe, was largely the art of deciding which losses were acceptable. But this loss would change the ending: without the line, the grandmother's farewell became a simple goodbye instead of a quiet acknowledgment that life would go on, indifferent and generous, after the boy was gone.

In the end she rewrote the whole sentence rather than the word. The grandmother says: "The river will keep your place warm." It was not what the author had written. When Elena sent it to her, nervous, the author replied with a single line: "That is what I meant."`,
  },
  {
    id: "en-l7-weather-station", level: 7, title: "The Weather Station",
    blurb: "Six months on a remote island, measuring wind and silence.",
    topics: ["nature", "science", "adventure"],
    body: `The job advertisement had been unusually honest: six months on a remote island in the North Atlantic, recording temperature, wind speed and rainfall four times a day. No internet. A supply boat every three weeks, weather permitting. "Suitable for someone comfortable with their own company."

Tom had assumed he was such a person. He was an introvert, after all, and he liked long walks and longer books. Yet by the end of the first month, the silence had become something almost physical, pressing against his ears at night.

He began to talk to the instruments. He named the anemometer Harold and complained to it when the wind made his readings tedious. He kept a diary, which slowly turned from a record of events into an argument with himself.

What rescued him, unexpectedly, was the data. Somewhere in the second month he started to notice patterns: the way the pressure fell a few hours before the seabirds disappeared from the cliffs, the way certain clouds always arrived from the southwest a day before rain. The numbers stopped being a chore and became a conversation with the island.

When the boat came to collect him in autumn, the captain asked whether he had been lonely. Tom considered the question carefully. "At first," he said. "Then I realized I was outnumbered."`,
  },
  {
    id: "en-l8-the-apology", level: 8, title: "The Apology",
    blurb: "Twenty years late, a letter that is harder to write than to send.",
    topics: ["letters", "feelings", "family"],
    body: `It took Robert three weeks and fourteen drafts to write a letter of fewer than two hundred words. The difficulty was not that he lacked something to say; it was that every version seemed either to excuse what he had done or to dramatize his regret until the apology became, somehow, about him.

Twenty years earlier, at his brother's wedding, he had given a speech that was intended to be funny and turned out to be cruel. He had been drinking, he had been jealous, and he had revealed, in front of two hundred guests, a secret his brother had told him in confidence. The marriage survived. The brothers' relationship, for all practical purposes, did not.

Over the years Robert had constructed a version of events in which the damage was mutual, in which his brother's coldness afterward was an overreaction that cancelled out the original offense. It was a comfortable story, and like most comfortable stories, it required him not to examine it too closely.

What changed his mind was not a dramatic event but a minor one: his own son, at fourteen, repeating a friend's secret at the dinner table to get a laugh. Robert recognized the expression on the boy's face, that brief flash of power, and felt something close to nausea.

The letter he finally sent contained no explanations. It named what he had done, acknowledged that he could not undo it and asked for nothing in return. His brother's reply arrived a month later. It was a single page, cautious and unsentimental, and it ended with a suggestion that they meet for coffee. It was, Robert thought, considerably more than he deserved.`,
  },
  {
    id: "en-l8-the-algorithm", level: 8, title: "The Algorithm",
    blurb: "A data scientist discovers what her model learned when no one was watching.",
    topics: ["science", "work"],
    body: `The model had performed brilliantly in every test. Trained on ten years of loan applications, it predicted which borrowers would repay with an accuracy that left the bank's executives visibly delighted. Priya, who had led the project, should have been delighted too.

Instead, she found herself unable to stop examining a pattern that appeared only when she sorted the results by postal code. Applicants from certain neighborhoods were rejected at noticeably higher rates, even when their incomes and credit histories were identical to those of approved applicants elsewhere.

The model had never been given any information about race or ethnicity. It had not needed to. Postal codes, shopping habits and even the type of phone used to submit the application had allowed it to reconstruct, with uncomfortable precision, the very distinctions the law prohibited. It had learned the bank's history faithfully, including the parts of that history the bank would rather forget.

Her manager listened politely and then pointed out that the model was simply reflecting reality: those neighborhoods did, statistically, have higher default rates. Priya replied that the defaults themselves might be partly the consequence of decades of worse loan terms, a loop the model would now automate and accelerate.

The meeting ended without a decision. That night she wrote a detailed report, attached the evidence and sent it not only to her manager but to the bank's compliance office. She was aware that this might be the end of her career at the bank. She was also aware that once the model went live, its decisions would be described, by everyone, as objective.`,
  },
  {
    id: "en-l9-the-cartographer", level: 9, title: "The Cartographer's Error",
    blurb: "An invented island survives on maps for a century.",
    topics: ["history", "science", "culture"],
    body: `In 1874, an exhausted survey ship returning from the South Pacific recorded a small island at a position where, as later expeditions would establish, there was nothing but several thousand meters of open ocean. Whether the sighting was a bank of low cloud, a mass of floating pumice or simply the product of a navigator's fatigue, no one has ever determined.

What is remarkable is not the error itself, which was common enough in an era of sextants and dead reckoning, but its extraordinary persistence. The island was copied from chart to chart for over a century, acquiring along the way a name, an estimated area and, in one particularly imaginative atlas, a brief description of its vegetation. Mapmakers, reluctant to remove a feature that might endanger shipping if it did exist, preferred the cautious inclusion of a phantom to the risk of an omission.

Several vessels in the twentieth century reported searching for it without success, yet each failure was interpreted as a problem of inadequate searching rather than evidence of absence. The burden of proof, in effect, had been inverted: the island did not need to demonstrate its existence; its critics needed to demonstrate a negative, which is notoriously difficult to do at sea.

It was finally removed in 1983, after a dedicated satellite survey. Even then, one publisher retained it for two further editions, apparently on the grounds that customers had come to expect it.

Historians of science sometimes cite the episode as a parable about institutional inertia, and it certainly is one. But it also reveals something more sympathetic: the instinct to preserve, rather than discard, the uncertain testimony of people who had risked a great deal to bring it home.`,
  },
  {
    id: "en-l9-the-understudy", level: 9, title: "The Understudy",
    blurb: "Eight months of waiting in the wings, and one unforgiving night.",
    topics: ["arts", "work", "feelings"],
    body: `For eight months, Claire had attended every performance of the play without once setting foot on stage. As the understudy for the lead role, she had memorized every line, every pause and every change of costume, rehearsing alone in an empty studio on Tuesday afternoons while the principal cast enjoyed their day off.

The job demanded an unusual kind of discipline: to prepare exhaustively for an opportunity that, in all likelihood, would never arrive, and to do so without wishing misfortune on a colleague whose health was the only obstacle between her and the role. Claire had become adept at suppressing the thought, though she could not entirely prevent it from surfacing in the half-second before the stage manager's daily phone call.

The call that mattered came at half past five on a Saturday, ninety minutes before curtain. The lead actress had lost her voice entirely. Claire would go on.

What surprised her afterward was how little she remembered. There were fragments: the unfamiliar heat of the lights, a cough from the third row during the long silence in the second act, the moment she realized she had skipped a line and the actor opposite her smoothly improvised a bridge. The rest had dissolved, as if her mind had been too occupied to keep records.

The reviews, published two days later, did not mention her; the critics had attended the previous week. The lead actress returned on Tuesday, fully recovered, and thanked her warmly in the dressing room. Claire went back to her Tuesday rehearsals in the empty studio, a little more convinced than before that the work had been worth doing, and considerably less certain how to explain why.`,
  },
  {
    id: "en-l10-on-boredom", level: 10, title: "In Defense of Boredom",
    blurb: "An essay on the empty hours we have learned to fear.",
    topics: ["culture", "feelings"],
    body: `It has become almost a reflex to treat boredom as a technical problem, a gap in the schedule awaiting the appropriate application, podcast or notification. We fill the minutes at bus stops, in elevators and in the queues of supermarkets with a reliability that would have astonished earlier generations, for whom such intervals were simply part of the texture of ordinary life.

Yet there is a respectable tradition of thought, stretching from the moral philosophers of antiquity to contemporary psychologists, that regards boredom not as a defect to be eliminated but as a signal worth heeding. On this view, the restless discomfort of an unoccupied mind is less an absence than an invitation: a prompt to notice what we actually want, as opposed to what we have merely become accustomed to consuming.

Several studies have suggested, with the caution such findings deserve, that people who have endured a deliberately tedious task subsequently perform better on tests of creative thinking. The proposed mechanism is intuitive enough. Deprived of external stimulation, the mind begins to wander, assembling unexpected associations from the materials it already possesses.

None of this is an argument for nostalgia. Previous eras were not more contemplative by virtue; they were merely short of alternatives, and plenty of people filled their empty hours with gossip, worry or drink. The point is rather that we have, for the first time, the means to abolish boredom almost entirely, and we have done so largely without asking whether it was performing any useful function.

The experiment, if one wished to conduct it, is inexpensive. Leave the phone in a pocket for the duration of a single train journey and observe, without judgment, what the mind does with the time. The results may be uncomfortable. They are unlikely to be uninteresting.`,
  },
  {
    id: "en-l10-the-inheritance", level: 10, title: "The Inheritance",
    blurb: "Three siblings, one house, and the arithmetic of memory.",
    topics: ["family", "literature"],
    body: `The will was unambiguous, which, as the lawyer observed with professional melancholy, rarely prevents a dispute and occasionally provokes one. The house on Alder Lane was to be divided equally among the three children, who were by now in their fifties and had not occupied the same room, voluntarily, in over a decade.

Margaret, the eldest, wanted to sell. She had nursed their mother through her final illness, commuting three hours each weekend, and regarded the house less as a repository of memories than as the scene of an exhausting and largely unacknowledged obligation. James, the middle child, wanted to keep it as a holiday home, a proposal his sisters suspected was inseparable from his recent and rather public financial difficulties. Ruth, the youngest, who lived abroad, claimed to want nothing but agreement, a position her siblings found both admirable and infuriating, since it allowed her to occupy the moral high ground without contributing anything to the negotiation.

The arguments followed familiar channels, worn smooth by decades of use. Each sibling possessed a private ledger of grievances, meticulously maintained and never fully disclosed, in which every past kindness had been entered as a debt and every slight as an unpaid account.

What finally broke the impasse was not reconciliation but archaeology. Clearing the attic before the valuation, they discovered a box of letters their mother had written to each of them and never sent, spanning forty years. The letters were not sentimental. They were frank, occasionally critical and frequently funny, and each revealed that the grievance its recipient had nursed for longest had been, from their mother's perspective, either a misunderstanding or an event she had entirely forgotten.

They sold the house in the spring. The proceeds were divided equally, as instructed. The letters, by unanimous and slightly embarrassed agreement, were not.`,
  },
];

/** Topics for the shared library filters (Home topic strip). */
export const EN_TOPICS: Record<string, string[]> = Object.fromEntries(EN_STORIES.map((s) => [s.id, s.topics]));

/** Rows for the app catalog. `level` drives the English level picker and card badge. */
export const EN_STORY_TEXTS: LibraryText[] = EN_STORIES.map((s, i) => ({
  id: s.id,
  lang: "en",
  level: s.level,
  title: s.title,
  blurb: s.blurb,
  body: s.body.trim(),
  kind: "sample",
  category: "graded",
  featured: false,
  createdAt: 200_000 + i,
  readAt: null,
  bookmark: null,
  source: "Original (Duki) · AI-drafted",
}));
