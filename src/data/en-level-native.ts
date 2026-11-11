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
  {
    id: "en-l9-the-away-supporters", lang: "en", level: 9,
    title: "The Away Supporters",
    blurb: "A father and daughter travel to a match neither expects to enjoy.",
    kind: "sample", category: "graded", featured: false,
    createdAt: 280_002, readAt: null, bookmark: null,
    source: "Original (Duki) · AI-drafted",
    body: `Her father had bought the tickets before the operation. He told Nina this twice, as though the date of purchase established that he had not deliberately arranged a test of her loyalty. They were away to Westbridge, three hours by train, and the forecast was rain. Nina hadn't watched a match in seven years. She had been very happy with that arrangement.

At the station he wore his old blue scarf over a coat she had never seen. The coat was too large. Either he had bought it in the wrong size or he had become smaller since the last time she had paid attention. When she offered to carry his bag, he said it contained nothing heavy, which was not quite the answer to her question.

They found their seats opposite a boy eating crisps with the concentration of someone handling dangerous chemicals. Her father consulted the team sheet on his phone. He enlarged it, shrank it, enlarged it again.

"They'll play Reeves on the left," he said.

"Is that bad?"

He looked at her with pleasure. Here was a question on which he could be fully authoritative. By the time they reached the first stop, she knew about Reeves's knee, his contract, and the inexplicable optimism of the manager. She had missed this, she realised, though she had not missed football. In recent months her father had spoken chiefly about medication, and she about whether he was taking it.

When her parents separated, Nina had stopped going to matches. She was seventeen and suspected every invitation of concealing an appeal to take sides. Her father had wanted their Saturday routine to survive unchanged. Her mother had said it was entirely up to her, in a voice which made freedom sound like a trap. Nina chose a Saturday job at a bakery and acquired a defensible reason to disappoint everyone.

Now she worked in an office where people said they had no bandwidth when they meant they were tired. She had taken Friday off and was carrying a folder of papers she intended to read on the journey back. Her father noticed the folder but said nothing. She noticed him noticing it.

At Westbridge they walked with the visiting supporters towards the ground. The streets narrowed, and the crowd moved in uneven bursts. Her father stopped outside a hardware shop and pretended to inspect a display of padlocks. Nina stood beside him. A little farther on, a steward directed them to a quieter entrance, where nobody made a ceremony of the extra time he needed.

Their seats were high enough to command an excellent view of the wind. Nina had forgotten the peculiar discomfort of watching winter sport: the cold feet, the hot face, the impossibility of choosing the right moment to remove a glove. Beside her, a woman in a knitted hat was arguing with a radio held to one ear. Everyone seemed to know something the manager did not.

The home side scored after eleven minutes. Her father delivered a detailed account of the defensive error, then fell silent. Nina looked at him. He was leaning forward, elbows on his knees, watching with such attention that she couldn't tell whether he was miserable or perfectly content.

At half-time she went for tea. When she returned, the woman with the radio had moved one seat closer and was showing him a photograph. Nina paused at the end of the row, balancing the cups.

"Her granddaughter," he explained. "Goalkeeper."

"Terrible position," the woman said proudly. "Everyone remembers your mistakes."

They conceded again. The rain arrived sideways, reaching them despite the roof, and a man behind Nina began a lengthy comparison between the current squad and a collection of household appliances. She laughed. Her father turned, surprised, and then laughed too, an abrupt wheeze that frightened her until he waved away her concern.

With fifteen minutes left, their striker missed an open goal. Nina stood involuntarily and made a noise she would later deny making. Her father put a hand on her sleeve to steady her as people rose around them. For the rest of the match she stayed forward in her seat. She could see the pass before it was made now; she remembered how to wait for a player to arrive in the space.

They lost two-nil. On the way out, the woman with the radio said, "See you next time," with the calm certainty of someone who had survived worse Saturdays. Nina's father answered that she probably would. He didn't glance towards Nina to include her in the promise.

Their train home was delayed. In the station café he admitted that the walk had been harder than he expected. She moved his tea within reach and asked whether he wanted her to find a taxi for the other end. He said yes. Neither of them apologised.

"You can read your papers," he said, once they were on the train.

"I know."

For a while they watched the black window reflecting the carriage. Then he asked about her work, and she told him about a colleague who kept replying to messages meant for someone else. It was a long, inconsequential story. He asked enough questions to make it longer.

At their stop she took his bag before he could object. He let her. Outside, while they waited for the taxi, he folded the blue scarf and put it carefully in his pocket. She could smell hot bread from the station bakery.`,
  },
  {
    id: "en-l9-the-quiet-carriage", lang: "en", level: 9,
    title: "The Quiet Carriage",
    blurb: "A passenger appoints himself guardian of the train's silence.",
    kind: "sample", category: "graded", featured: false,
    createdAt: 280_003, readAt: null, bookmark: null,
    source: "Original (Duki) · AI-drafted",
    body: `I had chosen the quiet carriage because I needed to rehearse a difficult conversation in my head. My partner called this worrying. I called it preparation, although I concede that preparation usually ends when the event begins, whereas I have been known to revise an argument several years after losing it.

The conversation concerned my retirement. My department wanted a date. I had offered a season, which my manager said was not sufficiently precise for payroll. Now I was on my way to see my daughter, who had opinions on the subject, and who would ask whether I had brought the papers she had emailed. I had brought them. They were underneath my newspaper, where I could avoid seeing them without technically having forgotten them.

At the first stop, a young man sat across the aisle. He had a laptop, two phones, and the alarming confidence of someone who expects a table socket to work. Before we had left the platform he was on a call, explaining that he was literally on the train. This was undeniable, but I resented being made part of the evidence.

I waited until he said, "Can you hear me?" for the third time. Then I pointed to the sign above the window.

"Quiet carriage," I said.

He glanced up, covered the phone, and apologised. Then he went into the vestibule. I felt a brief, clean satisfaction. A rule had been broken, a rule had been enforced, and nobody had needed a committee.

A woman two rows ahead opened a packet of something crisp. Each item required an excavation of the wrapper. I looked towards her, but there were limits to my jurisdiction. Across from her, a child drew on a tablet whose pen made a tiny click against the screen. A pair of headphones leaked a rhythm like a distant machine developing a fault. Silence, once you begin defending it, turns out to have a great many enemies.

The young man returned and worked without speaking. I attempted my retirement papers. They used the word flexibility several times, usually to describe an obligation on my part. After a paragraph about optional transitions, I found myself reading the same line for the fourth time. The train entered a tunnel. My own phone rang.

It was my daughter. I silenced it at once, fumbling so badly that the device fell between my seat and the wall. The young man pretended not to notice. By the time I had retrieved it, she had called again. There was also a message: Please answer. Nothing awful. Need to change plans.

I got up and went into the vestibule, carrying my phone in front of me like a permit. The automatic door refused to close until I moved my heel. Behind it, the carriage was bright and orderly. Out here there was a draught and a smell of warm metal.

"The plumber's here," my daughter said. "He was meant to come yesterday. Can you stay on to the next station? I'll meet you there."

I explained that I had a ticket to her station, not the next one. She said I could buy another. I explained that the train might not stop. She said she had checked. I heard, with some irritation, the tone I used myself when offering a solution to somebody determined to preserve a problem.

"Dad, are you still there?"

The signal broke. I moved towards the door and said, rather loudly, "Can you hear me?"

Through the glass I saw the young man look up. His expression did not change, which was worse than a smile.

When I returned, he pointed at the papers protruding from my newspaper. "Sorry, I think that's your name on the floor."

A page had slipped under the table. He reached it before I could. It contained an estimate of my income after work, printed in large type at my daughter's insistence. I took it from him with the embarrassment of having had a private number spoken aloud, although he hadn't said a word.

"Forms," he said sympathetically.

"Retirement."

"My mum's just done hers."

We spoke quietly, leaning across the aisle. His mother had worked in a dental surgery for thirty-two years and had immediately taken another job, part-time, at a garden centre. She liked knowing where she had to be on Tuesdays. I said that I understood this. He said he was a sound engineer travelling to a job interview, which explained the two phones but made his original offence seem professionally inexcusable.

The child ahead of us looked around. A finger went to her lips. We both stopped talking.

At the next station I helped the young man free his bag from a strap caught under the seat. He wished me luck with the forms. I wished him luck with the interview. He left, and for the remainder of the journey his empty seat seemed to make more room than it occupied.

My daughter was waiting on the platform beyond her usual stop, wearing slippers inside her boots. I showed her the additional ticket before she asked. Then, because I wanted to say it before we reached the car, I told her I was thinking of leaving work in April.

"This April?"

"Yes. A date in April. I'll work out which one."

She took my bag, and we went to find somewhere to have lunch while the plumber finished. I left the papers folded in my coat.`,
  },
];
