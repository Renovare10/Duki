import type { LibraryText } from "../types";

/** Original adult fiction and essays; English levels are editorial targets. */
export const EN_NATIVE_TOPICS: Record<string, string[]> = {
  "en-l9-the-estimate": ["literature", "work", "family"],
  "en-l9-in-praise-of-the-spare-room": ["daily-life", "culture"],
  "en-l9-the-away-supporters": ["sports", "literature", "family"],
  "en-l9-the-quiet-carriage": ["travel", "literature", "humor"],
  "en-l9-against-the-perfect-recipe": ["food", "culture"],
  "en-l9-the-last-slide": ["work", "literature", "science"],
  "en-l9-a-garden-without-an-audience": ["nature", "daily-life"],
  "en-l9-the-understudy": ["arts", "literature", "feelings"],
  "en-l10-the-minutes": ["literature", "news", "nature"],
  "en-l10-the-right-to-be-unremarkable": ["culture", "science"],
  "en-l10-a-small-correction": ["literature", "history", "family"],
  "en-l10-what-the-translation-leaves-open": ["culture", "literature"],
  "en-l10-the-viewing": ["literature", "arts", "work"],
  "en-l10-the-price-of-an-empty-chair": ["work", "daily-life"],
  "en-l10-in-the-interests-of-clarity": ["literature", "letters", "humor"],
};

export const EN_NATIVE_TEXTS: LibraryText[] = [
  {
    id: "en-l9-the-estimate", lang: "en", level: 9,
    title: "The Estimate",
    blurb: "A builder prices a repair for the teacher who once wrote him off.",
    kind: "sample", category: "graded", featured: false,
    createdAt: 280_000, readAt: null, bookmark: null,
    source: "Original (Duki) · AI-drafted",
    body: `The first thing Daniel noticed was that Mr Vale had painted over the hinges. They were brass, or had been, and now wore so many coats of white that the cupboard door could open only halfway. The old man stood behind him in the kitchen, explaining that the trouble had started with the rain. People generally blamed the rain. Daniel had learned to wait until he could see the pipe.

"You were at St Martin's," Mr Vale said.

Daniel put his tool bag on a newspaper. "For a while."

"I thought I recognised you. Your brother was the runner."

His brother had been the runner, the scholarship boy, the one whose name teachers remembered without consulting a register. Daniel had spent much of his school life being introduced as a relation. He knelt and shone a torch into the cupboard. Water had darkened the back panel and raised the edges of the cheap floor covering. Behind it, a slow drop gathered on a joint.

Mr Vale had taught him English when he was fourteen. Daniel remembered the room's high windows and the smell of wet blazers steaming on radiators. He remembered, more distinctly, an essay returned with a remark in green ink: You have mistaken an anecdote for an argument. The essay had been about his father losing his job. At fourteen, Daniel had assumed that anything sufficiently painful must also be persuasive.

He had carried that sentence around for years. Eventually it became useful. Customers told him stories about previous builders, and he asked for photographs. His own son protested that everyone else was allowed a phone in bed, and Daniel asked which people, exactly. Still, usefulness was not the same as gratitude.

"Can it be saved?" Mr Vale asked.

"The cupboard? Probably. I'll need to take the back out."

"My daughter says I should replace the whole kitchen."

Daniel glanced at the worktop, the chipped handles, the little square of cork on which a kettle stood. Replacing the kitchen would cost more than his van. He could have said so. Instead he asked where the stopcock was, and Mr Vale led him into the hall with the anxious hospitality of someone who had already apologised for the house twice.

The old man walked slowly, one hand hovering near the wall. On the hall table lay a stack of library books and an envelope addressed in a large, determined hand. There were no photographs of a wife. Daniel caught himself looking for them and disliked the small investigation he had begun without permission.

After shutting off the water, he returned to the kitchen. The panel came away in soft pieces. The pipe behind it had been fitted badly, though not recently; somebody had made a short length reach a little farther than it should. He photographed the joint before touching it. When he turned, Mr Vale was examining the scraps on the floor.

"I suppose this is what happens when you leave things."

"Sometimes it happens when somebody does a bad job."

The reply came out sharper than Daniel intended. Mr Vale nodded as though accepting a correction in class.

Over tea, Daniel wrote the estimate. He could repair the pipe that afternoon, but the cupboard needed time to dry before a new back went in. He priced two visits, materials, and the awkward cutting required around the existing fittings. Then he sat looking at the labour charge. It was reasonable. He knew it was reasonable because he had calculated it rather than guessed.

"Still writing?" Mr Vale asked.

Daniel covered the figure with his hand, a ridiculous reflex. "An estimate takes a minute."

"No, I meant stories. You used to write them."

He looked up. Mr Vale stirred his tea although he had put nothing in it.

"I don't remember doing that."

"There was one about a boy collecting lost golf balls. Very funny. The headmaster objected to the language. I told him the language was the point."

Daniel remembered the golf balls now. He had sold them back to the club until a groundsman caught him. In the story, he had made the groundsman fall into a pond. He had forgotten the story's existence while preserving, in perfect green, the sentence about his father.

Mr Vale smiled. "You had an ear."

Daniel wanted to mention the essay. He could have repeated the comment exactly, supplied the date, described the bus ride home. For a moment he saw how easily the afternoon might become an opportunity to present evidence against a man who could no longer crouch to inspect his own plumbing. The evidence was real. So was the eagerness with which he had assembled it.

"Mostly I write invoices," he said.

"They can be difficult to follow too."

Daniel laughed before he could decide whether to.

He uncovered the estimate and slid it across the table. Mr Vale reached for his glasses. Daniel explained each item, including why he would not enclose damp timber behind a fresh panel. He did not offer a discount, although part of him wanted the generosity to be noticed. Mr Vale did not ask for one.

When the pipe was fixed, they stood together while Daniel turned the water back on. The joint stayed dry. He left the cupboard open and wrote the date of his return on the back of a business card. In the van, he called his son, who was waiting outside football practice.

"Five minutes," Daniel said. "And remind me to look at that thing you've been writing."

"It's not finished."

"I know. I can look at something that isn't finished."

He put the phone down, then took the estimate from the passenger seat and checked that he had included the second visit. He had. He filed his copy, started the engine, and pulled out carefully past Mr Vale's narrow gate.`,
  },
  {
    id: "en-l9-in-praise-of-the-spare-room", lang: "en", level: 9,
    title: "In Praise of the Spare Room",
    blurb: "An opinion essay on leaving a little space without an assigned purpose.",
    kind: "sample", category: "graded", featured: false,
    createdAt: 280_001, readAt: null, bookmark: null,
    source: "Original (Duki) · AI-drafted",
    body: `The room in my grandmother's house was officially a bedroom, although its bed had disappeared before I was born. During my childhood it contained a broken sewing machine, four chairs of which only two matched, and a painting nobody liked enough to hang or disliked enough to throw away. When visitors came, we made room among these objects. When nobody came, the room remained available for purposes we hadn't yet thought of.

I hesitate to praise it. A spare room is an expensive thing to be nostalgic about. People who sleep behind curtains in shared flats do not need a lecture on the spiritual benefits of unused square metres. My grandmother had her room because she had bought a modest house in a cheap town at a time when her modest income could pay for it. What looks like wisdom in a family memory may, on inspection, turn out to be favourable property prices.

Still, the room taught me something I keep forgetting: a space can be useful before we know exactly what it is for. I learned to mend a bicycle there. My cousin rehearsed an unsuccessful audition there, with the door shut and the rest of us forbidden to listen. After a quarrel, my uncle once sat in it for so long that someone quietly took him a sandwich. None of these activities would have justified a room of its own.

My current flat has no such room. It does, however, have a small table which I have repeatedly tried to improve. First I called it a reading corner and bought a lamp. Then I called it a workspace and bought a better chair. Eventually I noticed that the chair prevented anyone from reaching the window. The table had been quite good at being a table, but I kept making it audition for a career.

This is an argument for a little unallocated capacity, wherever we can afford it. A shelf need not be filled when it is put up. An evening need not become a project because it happens to be free. We are often told to make time for the unexpected, a charming contradiction: the unexpected is supposed to submit a request before it arrives. Sometimes the practical preparation consists of leaving a gap and tolerating the feeling that the gap looks wasteful.

There are respectable objections. A room without a purpose tends to fill with objects without a home, and clutter imposes work on whoever eventually clears it. My grandmother's broken sewing machine did not repair itself through patient hospitality. She died, and my mother paid two men to carry it downstairs. The spare room was both a generous possibility and an arrangement by which certain decisions were deferred to her children.

Nor is an overfull calendar always a personal failure. Some people are holding together several jobs, care responsibilities, and a bus timetable that has apparently been designed by their enemies. They cannot recover an afternoon merely by changing their attitude. Advice about leaving space becomes insulting when it treats a shortage of resources as a shortage of imagination.

The same distinction matters in public life. A local hall that stands empty on Tuesday morning can look like an obvious inefficiency. Give every hour to a paying tenant, however, and there may be nowhere for a tenants' meeting on Wednesday evening after a sudden rent increase. A school with no spare classroom has made excellent use of its rooms until a pipe bursts. Capacity held in reserve costs money; the lack of it also costs money, often at the least convenient moment.

I am not proposing that every empty building be preserved in the hope that an interesting need will wander past. Buildings require maintenance. Public money has competing claims. We should ask who gets to decide which spaces remain available and who actually feels welcome in them. A room described as belonging to everybody can still be effectively owned by the person with the loudest voice and the key.

But the calculation should include uses that cannot be listed in advance. There is a difference between waste and readiness, even if the two look similar in a photograph. An empty chair may be evidence of poor planning, or it may mean that someone arriving late will have a place to sit. We have to know something about the people around the chair before we can tell.

Last winter I moved the impressive chair away from my little table. A neighbour came upstairs one evening because her heating had failed. She brought a bag containing her laptop, a pair of socks, and a tomato she had feared would freeze, although the flat was nowhere near that cold. She sat at the table while I cooked. We had never previously had a conversation longer than a lift journey.

The table did not become a community hub. We did not start a supper club or discover that we had been waiting all our lives to meet. She answered emails; I burned the onions. Later, when her landlord called, she had somewhere warm and reasonably quiet to explain the problem. I was pleased that I hadn't put the printer there, as I had been meaning to do.

The next morning the table was empty again. I caught myself considering a bowl, a plant, something to make it look finished. For now, I have left it alone.`,
  },
];
