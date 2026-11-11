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
  {
    id: "en-l9-against-the-perfect-recipe", lang: "en", level: 9,
    title: "Against the Perfect Recipe",
    blurb: "An essay on recipes, honest instructions, and the limits of precision.",
    kind: "sample", category: "graded", featured: false,
    createdAt: 280_004, readAt: null, bookmark: null,
    source: "Original (Duki) · AI-drafted",
    body: `A recipe on my kitchen shelf instructs me to cook onions for five minutes, until deeply caramelised. I have tried this. After five minutes, the onions are warm and beginning to suspect that something is happening. They are not deeply caramelised. I used to assume that the fault lay with my pan, my stove, or a deficiency of character. Now I suspect the writer wanted dinner to look possible within half an hour.

The promise of a perfect recipe is attractive because cooking involves so many opportunities for uncertainty. Ingredients are expensive. Guests arrive hungry. A person who has spent the day making decisions may reasonably want somebody else to specify the quantity of salt. Precision offers relief, and I am grateful for it. I own scales. When I bake, I use them. My objection is to precision that pretends the kitchen can be removed from the cooking.

An onion has a size, a water content, and a history before it reaches the chopping board. A pan has a shape. A stove has its own interpretation of medium heat. These differences do not make instructions useless. They make it necessary to tell the cook what to observe as well as what to do. "Cook for roughly this long, until it looks like this" is more honest than a time presented as a guarantee.

I learned this distinction from a handwritten recipe for my aunt's bean stew. Under onions she had written plenty. Under water she had written enough. I thought the recipe charming, then useless, then annoying. My aunt could reproduce the stew because she knew what plenty and enough looked like in that particular pot. I could not. What felt to her like a complete instruction was really a reminder to someone who already possessed the missing knowledge.

We eventually cooked it together. I measured things while she worked, which she tolerated until I tried to weigh a half-used lemon. The resulting document contained useful numbers, but the most helpful sentence was one she hadn't thought worth writing: the liquid should move lazily when you stir, not run around the spoon like soup. I had been adding too much water and then blaming the beans.

That sentence did not abolish judgement. It gave my judgement something to work on. Good instructions allow a beginner to notice a difference and respond to it. They do not require the beginner to become the author's identical twin, equipped with the same saucepan, the same appetite, and the same mysterious cupboard full of small jars.

There is also a social pressure hidden inside the perfect recipe. A dish becomes correct when it resembles the published photograph; every household variation becomes a deviation requiring permission. I have watched people apologise for replacing an expensive ingredient in a Tuesday dinner as though they were confessing to academic fraud. Sometimes the replacement changes the dish substantially. It may still make a decent dinner. The cook is allowed to prefer it.

This freedom has limits. A claim about tradition is a claim that can be wrong, and naming a dish accurately matters when the name describes somebody else's food. Food safety is not an arena for cheerful improvisation either. A cooking temperature or a tested preservation method may have a reason that isn't visible in a photograph. "Trust your instincts" is poor advice to someone whose instincts have never encountered the problem.

The useful distinction is between constraints and preferences. The writer should tell us which features affect safety or the structure of the dish, which affect flavour, and which merely reflect the writer's taste. If a substitution will prevent a dough from behaving as intended, say so. If it will produce a different but perfectly edible supper, say that instead. The explanation may take an extra sentence. It earns its place.

I wish we applied the same courtesy to ourselves after dinner. We ask whether a recipe worked as though there were a single verdict. Perhaps the sauce was thinner than expected but everyone liked it. Perhaps the cake rose beautifully and tasted of very little. Perhaps the meal was technically fine and required more washing-up than the evening could bear. These are different outcomes. They deserve different notes in the margin.

My own notes are not elegant. Beside one dish I have written: good, but start before the football. Beside another: half the chilli if Peter comes. Neither comment would improve a professional cookbook. Both improve the chances of the meal succeeding in my house. The page is gradually becoming less authoritative and more useful.

I still make my aunt's stew. I use the quantities we wrote down, then adjust the water according to what is actually in the pot. Sometimes I serve it with rice, sometimes bread. Once I scorched the bottom while looking for an email, and no philosophical defence of improvisation could rescue it. We ate eggs that evening.

The onion recipe remains on the shelf too. I have crossed out five minutes and written a longer estimate, with a question mark. If the onions are not ready when the estimate expires, I let them continue. Dinner is later than the book promised. So far, everybody has survived the delay.`,
  },
  {
    id: "en-l9-the-last-slide", lang: "en", level: 9,
    title: "The Last Slide",
    blurb: "A researcher finds a missing qualification in a presentation she helped prepare.",
    kind: "sample", category: "graded", featured: false,
    createdAt: 280_005, readAt: null, bookmark: null,
    source: "Original (Duki) · AI-drafted",
    body: `By nine that morning, the sentence had become a headline. At seven it had said that the new scheduling tool might reduce missed appointments under certain conditions. At eight it had said that it could reduce them. Now, on the screen behind the lectern, it said: Fewer Missed Appointments. Better Care. Priya stood at the back of the conference room holding a paper cup that had begun to soften along its seam.

She was not the person giving the presentation. That was Oliver, whose jacket fitted so well that even his haste looked planned. He had asked her to check the numbers on slide twelve. She had done so, late the previous evening, and sent back two corrections. The numbers were now correct. Their meaning had become less certain.

The study involved four clinics. Patients in two had received reminders using the new system; patients in the others had received the existing reminders. Attendance had improved more in the first pair, but those clinics had also extended their evening hours during the trial. Priya's report explained the difficulty of separating the effects. The presentation mentioned the evening hours in a small note. The headline didn't.

"You look worried," Oliver said, appearing beside her.

"The final claim is stronger than the report."

He looked at the screen. "It's a title, Priya. The explanation's in the talk."

"Is it?"

"It was when we practised."

She had missed the rehearsal because her daughter had a fever. He hadn't said this unkindly, but she heard it anyway. Around them, staff were arranging chairs into straighter lines. A tray of pastries went past, releasing a warm, buttery smell into the room's refrigerated air.

The audience would include the clinic managers and the foundation considering another year's funding. Nobody had asked Priya to lie. That was part of the trouble. She had encountered no moment at which she could point to a request and refuse it. The title had simply become shorter with every revision, losing qualifications as a suitcase loses spare clothing when someone discovers the baggage allowance.

She opened the slide deck on her laptop. Beneath the last chart she typed: Attendance improved; this trial cannot establish how much of the improvement came from the software. The sentence looked heavy beneath the clean blue columns. She could almost hear the audience losing interest.

Oliver watched her. "Can we not make it sound like the whole trial was pointless?"

"It wasn't pointless. It tells us what to test next."

"We need the money to test anything next."

There it was, said without menace or cynicism. Priya was paid from the same grant. The junior analyst she supervised had signed a lease on the assumption that the project would continue. An honest sentence did not suspend those facts. She hated the ease with which her private version of this argument had made her the only adult in the room.

"Put the evening-hours point back in the spoken part," she said. "And I'll take the questions about the design."

Oliver rubbed the bridge of his nose. "Fine. But don't tell them we learned nothing."

At ten, he began. He was good at this. He described the practical frustration of patients missing visits they had waited months to obtain. He showed how the tool allowed staff to move reminders without entering the same information twice. Priya recognised the interviews she had conducted, reduced to quotations that were fair, if unusually tidy. Then came the chart.

Oliver explained the comparison and mentioned the extended hours. He gave the qualification a full sentence. Priya felt relief, followed by an uncomfortable awareness that she had wanted him to fail to say it, so that her suspicion of him could remain uncomplicated.

The first question concerned cost. The next concerned whether the software could work with an older booking system. Then a clinic manager near the front raised her hand.

"At ours," she said, "people started answering because the messages finally had a number they could call back. Was that the same in the other clinics?"

Priya looked at her notes. It hadn't been. The callback number had changed in one of the trial clinics after a receptionist complained. Priya had logged the change but treated it as an implementation detail. Now it was suddenly a plausible explanation rather than an administrative footnote.

She went to the microphone. "We didn't keep that consistent. We should have. It means we have another difference to account for."

The manager nodded. She didn't look disappointed. "I'd like to know whether we need the whole system or just somebody who answers the phone."

There was a little laughter, including Oliver's. Priya answered that she would like to know too. She explained how they could compare those possibilities in a follow-up, while admitting that they couldn't retrieve the answer from the existing data simply by asking it more forcefully.

Afterwards the funding officer requested a revised proposal. There was no promise attached. Oliver shut his laptop and helped stack the chairs, his jacket folded over a table. Priya carried the discarded cups to a bin.

"The callback number," he said. "Was that in your report?"

"In the appendix. I didn't think it mattered enough."

He looked at her, then nodded. They stood for a moment among the chair stacks, both spared the burden of having been entirely right.

At her desk, Priya opened a new document. Before describing the next study, she wrote down who they needed to ask. The receptionist's name went first.`,
  },
  {
    id: "en-l9-a-garden-without-an-audience", lang: "en", level: 9,
    title: "A Garden Without an Audience",
    blurb: "A personal essay on growing things badly without turning failure into content.",
    kind: "sample", category: "graded", featured: false,
    createdAt: 280_006, readAt: null, bookmark: null,
    source: "Original (Duki) · AI-drafted",
    body: `My first gardening photograph was a fraud of composition. I had grown six radishes, four of them respectable. I placed the respectable ones on a wooden board, pushed the other two out of view, and moved a bag of compost away from the window. In the photograph I appeared to be a person who grew radishes. Outside the frame I was a person who had spent a surprising amount of money producing part of a salad.

There is nothing particularly wicked about this. Photographs select. Nobody expects a portrait to include the overflowing laundry basket behind the chair. But after I shared the picture, I found myself gardening with an imaginary visitor beside me. I considered whether the pots looked harmonious before I considered whether the plants had room. A successful afternoon was one that ended with something recognisable to show.

This was awkward because plants spend much of their time looking unpromising. Seeds are invisible after you put them in soil. A useful root system does not pose for photographs. Leaves may remain almost unchanged for days while I, who have watered them, require some acknowledgement of my effort. Then a slug arrives overnight and produces a result so definite that it feels like criticism.

I began with the cheerful idea that a garden would get me away from screens. Instead I carried a screen outside to identify insects, check advice, compare progress, and find out whether anyone else had successfully grown the variety I had just failed to grow. Much of this was useful. Some of it was a way of being absent from a place I had deliberately gone to be present in.

The advice often contradicted itself. One person watered by schedule; another said a schedule was foolish. A third had invented a test involving a finger and the soil, which sounded simple until I realised that I had no clear idea what the correct result should feel like. My pots differed from their beds. Their weather differed from mine. The confident conclusions generally arrived before the conditions under which those conclusions might apply.

What helped was keeping a notebook too dull to share. I wrote the date, what I had planted, and where. When something died, I recorded what I had done rather than what I believed it deserved. A page might say: moved to wall, leaves pale, pot still wet on Friday. It did not explain the failure, but it stopped my memory from quietly improving my performance afterwards.

The notebook also made certain successes less impressive. A tomato plant produced a bowlful of fruit after weeks in which I had congratulated myself on my patience. Looking back, I discovered that most of the waiting had been done by a neighbour while I was away. I had provided the pot and the sense of achievement. She had provided the water.

I don't want to turn this into another claim that the garden teaches us how to live. Plants do not exist to supply metaphors for a person with a notebook. Their fortunes are affected by weather, soil, insects, and a great deal I have not learned to notice. When a seedling dies, it is not necessarily a lesson about letting go. Sometimes I have left it in a dark corner and forgotten it.

Nor has gardening made me tranquil. I remain capable of unreasonable anger towards a creature smaller than my thumbnail. I have stood in a doorway at midnight wearing a coat over my pyjamas, asking the darkness what it wants from me. My family has wisely declined to answer. Gardening gives me different things to worry about, which is an improvement on some evenings and merely a change on others.

The private pleasure is more modest. I can spend time doing something at which I am neither outstanding nor paid. I can move a pot, discover that moving it was a mistake, and move it back without producing a public account of my growth. An audience, even an affectionate one, makes explanation tempting. Soon the mistake needs a comic caption or a useful conclusion. Alone, it can remain a mistake until I understand it, or until I forget.

I still take photographs. A flower opening after a long wait is worth sending to somebody who will be pleased. I try to distinguish that small pleasure from the wish to appear to have an attractive and well-managed life. The distinction is not always flattering. Occasionally I discover that I am more disappointed by bad light than by a damaged leaf, and put the phone indoors.

This year I planted radishes again, in a wider container. The packet was the same brand, but I resisted treating it as a rematch. I thinned the seedlings reluctantly, watered them, and waited. Some grew well. Some remained thin red strings with leaves attached. I ate the good ones while standing at the sink, with a little salt on a saucer.

The others went into the compost. There was no photograph, partly on principle and partly because I had dirt on my hands. Later I wrote down the date.`,
  },
  {
    id: "en-l9-the-understudy", lang: "en", level: 9,
    title: "The Understudy",
    blurb: "An actor gets her chance, but the performance refuses to become a triumph.",
    kind: "sample", category: "graded", featured: false,
    createdAt: 280_007, readAt: null, bookmark: null,
    source: "Original (Duki) · AI-drafted",
    body: `At six seventeen, Leila was promoted from person holding a sandwich to person holding up the production. The stage manager found her in the loading bay and said that Frances had lost her voice. Not a sore throat, not nerves, but an actual absence of sound. Leila put the sandwich back in its wrapper. She had imagined this announcement so often that its arrival seemed badly acted.

She knew the role. She knew it standing at her kitchen sink and sitting on the last bus home. She had performed it to a washing machine that interrupted every second speech with a spin cycle. Yet as she followed the stage manager upstairs, she couldn't recall the first line. All she could remember was that Frances's shoes were half a size smaller than hers.

The play concerned a family deciding what to do with a house. In the rehearsal room, people had called it a study of inheritance. Leila thought it was mostly about who got to finish a sentence. Her character, the eldest daughter, spoke for long stretches while other people handled glasses, opened drawers, and waited to contradict her. The pauses were difficult. Alone in her flat she could make them feel charged. Onstage she feared they would feel like forgetting.

Frances sat in the dressing room with a scarf around her neck and a notebook on her lap. She wrote good luck, underlined it, and showed it to Leila. Her expression was generous and furious. Leila understood both feelings and wished she didn't. A dresser appeared with the costume. Nobody mentioned the shoes until Leila stood and winced.

"Use your own," the dresser said. "They'll be looking at your face."

Leila had spent years hoping this was true. It sounded suddenly like a threat.

At seven twenty-five, the company gathered behind the curtain. The actor playing her brother squeezed her shoulder. "I'll keep an eye on you," he said, which was kind and also exactly what she didn't want. She wanted him to behave as though this happened every day. She wanted five contradictory forms of kindness, none of which she could explain before the lights went down.

Her first entrance went well. The door opened cleanly, and the first line returned as soon as she saw the table. There were faces beyond the light, more distinct than she expected. Someone in the second row was taking off a coat with painful deliberation. She looked at the actor playing her mother and began the scene.

For twelve minutes she was competent. She could feel this without enjoying it. She placed the glass in the right place, waited for the laugh, and resisted rushing the speech about the roof. Then her brother entered with a letter, and she took it with her right hand instead of her left. This blocked the gesture that should have followed. A small error, invisible to most of the audience, but she began watching herself correct it.

The next cue went past. Her brother repeated the last few words of his line. She knew he was helping. She also heard him helping, and for a second the whole theatre seemed to hear it with her. The line came back. She said it too loudly. Somebody coughed. The scene continued without requiring her permission to survive.

By the interval she wanted two things: to be told she was wonderful and to be left completely alone. The stage manager offered water and a note about the letter. Leila nodded. On her phone was a message from her sister: They've announced you're on! Should I come? Leila wrote No, then deleted it. She wrote Too late for tonight. Tomorrow if I'm still doing it.

The second half was better in places and worse in others. She discovered that one joke needed less effort than she had been giving it. She also stepped on another actor's final line, and the look he gave her belonged to neither the play nor their friendship. Near the end, during the speech she had practised most, she heard somebody unwrapping a sweet. The ordinary rudeness steadied her. People could be bored while she did the most important thing of her year. She had to continue anyway.

There was applause. It was neither thunderous nor reluctant. At the curtain call she bowed too early, rose, and bowed again with everyone else. Backstage, people said well done in voices softened by fatigue. Her brother said she had saved the evening. The actor whose line she'd interrupted said nothing until she apologised. Then he said, "Tomorrow, just listen for the end."

Frances had gone home. On the dressing table she'd left a note about the costume's loose fastening, which could come undone if pulled too quickly. Leila had spent the evening assuming the problem was her own clumsiness. She folded the note and put it beside her phone.

Outside, rain had gathered in the loading bay. Leila found her sandwich where she had left it and threw it away. She was hungry enough to resent the waste. The stage manager called after her that Frances would see a doctor in the morning, and they would let her know about tomorrow.

On the bus, Leila opened the script. A man across the aisle asked if she'd been in something he might have seen. She said probably not. Then she marked the letter scene in pencil and tried to hear the other actor's line all the way to its end.`,
  },
  {
    id: "en-l10-the-minutes", lang: "en", level: 10,
    title: "The Minutes",
    blurb: "A council clerk must record an agreement that nobody remembers making.",
    kind: "sample", category: "graded", featured: false,
    createdAt: 280_008, readAt: null, bookmark: null,
    source: "Original (Duki) · AI-drafted",
    body: `In the draft minutes, the pond had already been saved. Mara knew this because she had written the sentence herself: Members agreed that the existing water feature should be retained wherever practicable. It was an excellent sentence, sufficiently reassuring to survive circulation and sufficiently qualified to accommodate almost anything that might subsequently be done with a bulldozer.

She had worked for the council for nineteen years. She did not consider herself dishonest. Minutes were a record of decisions, not a transcript of everything people had managed to say before the chair regained control. If she included every repetition, interruption, and question addressed to the wrong officer, no decision would ever emerge from the paperwork. Part of her job was to make an evening's confusion available for use on a weekday morning.

The phrase water feature belonged to the consultant. Residents called it the pond, though in August it was often a shallow basin of mud, shopping trolleys, and a single indignant heron. Mara had no sentimental attachment to it. Her son had once fallen in, necessitating a tetanus discussion and the disposal of his shoes. She remembered this each time somebody described the site as an untouched haven.

The regeneration plan proposed flats, shops, and a path around a smaller area of water. Whether this counted as retaining the pond had occupied forty minutes of the meeting. The drawings showed a blue oval surrounded by trees whose mature crowns would not fit the space allotted to their roots. A resident had asked where the heron would go. The consultant had said that biodiversity would be considered at the appropriate stage.

At home that night, Mara typed until the words lost their argumentative edges. She removed an allegation about a developer's cousin because no evidence had been offered. She retained the request for a drainage assessment because it had been repeated by the chair. She recorded the vote on commissioning further work: six in favour, three against. Then she wrote the sentence about the water feature, under the heading Discussion.

The following afternoon, a woman called Mrs Dyer left a message. She had attended the meeting. She wanted to know why the minutes said everyone agreed when she had spent her allotted three minutes explaining that she did not. Mara returned the call and explained that members meant councillors, not members of the public. Mrs Dyer asked whether the councillors had agreed.

"The discussion indicated broad support," Mara said.

"Broad enough to include the people who said no?"

Mara disliked the question's shape. It had been made for someone to repeat to an ally afterwards. She explained that the minutes were a draft and would be considered at the next meeting. Mrs Dyer thanked her with excessive politeness and hung up.

Mara opened the recording. She listened through the fire-exit announcement, the apologies, the declaration of an interest. At one point her own voice could be heard asking a speaker to move closer to the microphone. It sounded patient in a manner she did not remember feeling.

The chair had indeed said, "I think we're all agreed we want to keep the pond." A councillor had replied, "Subject to the engineers." Another had said, "If we can afford it." Somebody else had said, "That's not what this vote is about." There was a scrape of chairs, then the formal motion. Mara listened again. The sentence she had written described the intention the chair had announced. It did not describe an agreement anyone had tested.

She could delete it. That would leave the recorded decision perfectly clear: commission more work. It would also remove the only apparent assurance given to the residents. By correcting an overstatement, she might make the record less useful to the people who had challenged it. She found this irritating. A mistake ought not to acquire moral protection merely because somebody might benefit from it.

She sent a revised paragraph to her manager. The chair expressed a preference for retention of the pond; members raised qualifications concerning feasibility and cost. Her manager replied that this was more precise, though perhaps unnecessarily detailed. Could they keep the existing wording? It was only a discussion note, and the chair had already approved the draft for circulation.

Mara stared at the message. Through the office window she could see a maintenance worker trying to disentangle a strip of plastic from a tree. He had a long pole with a hook, and the plastic repeatedly surrendered one end while tightening the other. She watched for longer than was reasonable.

She replied with the recording's timestamp. Then she went to make tea. She was aware of the little drama she had created for herself: a lone clerk defending accuracy against the institution. It omitted the nineteen years in which the institution had trusted her to decide what accuracy required. It omitted the fact that her manager was trying to finish a budget submission with two staff absent. None of that made the sentence correct.

At the next meeting, the chair proposed approving the minutes. Mara asked to note a correction to the discussion paragraph. Her voice came out dry; she took a sip of water. The chair read the replacement, looked up, and said, "Yes, that is what we meant." Nobody objected. The correction took less than a minute.

Afterwards Mrs Dyer waited by the door. She was carrying a plastic folder swollen with papers.

"So they can still drain it," she said.

"They haven't decided that."

"But this doesn't stop them."

"No. It doesn't."

Mrs Dyer looked past Mara into the chamber, where an officer was folding away the projector screen. "I preferred your first version," she said. Then she tucked the folder under her arm and went down the corridor.

Mara returned to her desk. In the new minutes she recorded the correction without describing the conversation at the door. Later she opened the next meeting's agenda and added the drainage assessment to her list of papers still outstanding.`,
  },
  {
    id: "en-l10-the-right-to-be-unremarkable", lang: "en", level: 10,
    title: "The Right to Be Unremarkable",
    blurb: "An opinion essay asking who benefits when ordinary activity must be recorded.",
    kind: "sample", category: "graded", featured: false,
    createdAt: 280_009, readAt: null, bookmark: null,
    source: "Original (Duki) · AI-drafted",
    body: `Imagine a café where every chair asks, before you sit down, what brought you in today. The question is friendly. The chair would like to understand your needs. You may skip the question, though the button allowing you to do so is a little smaller than the others. After your coffee, the table asks whether you would recommend the experience. On your way out, the door invites you to create a profile so that next time it can remember how you prefer to enter.

This café does not exist, as far as I know. Its manners are familiar. Ordinary activities increasingly come with a request that we account for them: rate the transaction, explain the cancellation, identify the purpose of the visit. A single request is rarely oppressive. The cumulative effect is to make participation feel faintly contractual, as though buying a sandwich has appointed you an unpaid witness to the sandwich's performance.

I want to defend a small freedom here: the freedom to do something ordinary without turning it into information about the kind of person I am. I may buy the sandwich because it is nearby. I may abandon a film because somebody knocks at the door. The abandoned film need not become evidence that I dislike its genre, its actors, or its running time. Much of life is circumstantial. Systems built to find patterns have a professional interest in forgetting this.

There are useful reasons to collect feedback. A person cannot fix a broken service merely by hoping that silence means satisfaction. A hospital needs to know whether patients can understand its letters. A transit agency needs some account of where journeys begin and end. The choice is not between measurement and a charming world governed by intuition. Intuition can be a very comfortable arrangement for people whose mistakes are paid for by somebody else.

The questions are what must be measured, who bears the work of measuring it, and what happens to the record afterwards. A count of passengers is not the same thing as a list of named passengers kept indefinitely. An anonymous complaint about a confusing letter is not the same thing as permission to combine medical correspondence with a shopping history. These distinctions are tedious to describe, which gives an advantage to anyone selling a single convenient button marked Agree.

Convenience itself is real. I like a service that remembers my address. I do not want to type it on a small screen in the rain. When I accept that convenience, however, I should not have to pretend that remembering an address and constructing a permanent account of my behaviour are inseparable technical achievements. Sometimes the connection is a business decision. It should be defended as one, rather than disguised as the inevitable price of progress.

The person who refuses may look awkward. Everybody else has downloaded the app; everybody else has accepted the terms. The queue is waiting. The assistant behind the counter did not design the process and cannot alter it. Insisting on a different route imposes an immediate, visible inconvenience, while the consequences of compliance remain distant and difficult to specify. This is a poor setting for meaningful negotiation. It converts a question about design into a disagreement between two tired people.

We often discuss privacy as the concealment of embarrassing facts. This makes the unembarrassed person appear to have nothing at stake. Yet an ordinary record can acquire a different meaning when placed beside another record, or when interpreted by someone with a different purpose. A visit, a purchase, a pause in employment: each can be innocent and still be something we would rather explain in our own words, if explanation becomes necessary.

There is also a loss that occurs before any sinister use of the information. People alter their behaviour when they expect an audience, even a hypothetical one. I do not mean that every recorded action becomes false. I mean that the possibility of interpretation joins the action itself. We begin anticipating the account we may have to give. Trying something clumsily, changing our minds, or spending an afternoon without a coherent purpose can start to feel like leaving untidy paperwork for our future selves.

A defence of privacy that depends only on spectacular abuses misses this quieter cost. We need places where an unimportant action is allowed to remain unimportant. A person should be able to read an unfashionable book without endorsing it, attend a meeting without acquiring a permanent affiliation, or ask an elementary question without having it attached to a professional reputation. Some learning requires a period of looking less capable than we hope to become.

This is not an argument that anonymity should excuse cruelty or prevent accountability. A system that protects a vulnerable speaker may also shelter someone harassing that speaker. Different settings require different safeguards. Invoking complexity, though, should begin a design discussion rather than end it. We can ask how long a record is needed, whether identification is necessary, and whether refusal actually remains possible. Those are practical questions, even when their answers are contested.

My imaginary café need not throw away its booking system. It might simply allow a walk-in customer to sit down, pay, and leave. It might ask a question once rather than repeatedly until politeness becomes exhaustion. It might make the route without a profile as legible as the route with one. None of this guarantees virtue. It distributes a little less power to the party already holding the screen.

I would probably still visit. I might even tell the owner that the coffee was good. What I want is for the compliment to remain something I chose to give, rather than the final task required to complete my breakfast.`,
  },
  {
    id: "en-l10-a-small-correction", lang: "en", level: 10,
    title: "A Small Correction",
    blurb: "An archive volunteer finds her mother's handwriting in an inconvenient place.",
    kind: "sample", category: "graded", featured: false,
    createdAt: 280_010, readAt: null, bookmark: null,
    source: "Original (Duki) · AI-drafted",
    body: `The photograph was labelled Women outside the North Mill, approximately 1948. Ellen had catalogued it herself, eleven years earlier, using information supplied by her mother. Now a researcher in a red waterproof jacket had placed it on the reading-room table and was asking why the date differed from the one on the reverse.

"The reverse?" Ellen said.

He turned it over. In her mother's handwriting, small and unexpectedly jaunty, were the words: First day, September 1951. Underneath, someone had added three names. The middle one was her mother's maiden name. Ellen recognised the capital R, with its extravagant downward stroke. Her mother had taught her to write it that way and then complained that her writing looked old-fashioned.

"We can change the date," Ellen said. "That happens quite often."

The researcher, whose name was Sami, leaned back to give her room to take the photograph. He was studying women who had arrived in the town to work after the war. The archive's catalogue had led him to this picture. He wanted to know whether there were employment records or letters from any of the women shown. Ellen said she would look.

Her mother had said she came to the town in 1947. Ellen knew the year as she knew the year of her own birth. There had been a suitcase, a missed connection, and an aunt who met the wrong train. The story was repeated whenever someone complained about the inconvenience of travel. Its details had acquired the smoothness of something handled often. Ellen had never thought to ask why no photograph accompanied it.

She took the picture into the office. Three women stood outside a brick wall, their faces narrowed against the sun. Her mother was in the middle, holding a handbag with both hands. She looked older than she should have looked in 1948 and exactly as old as she would have been in 1951. Ellen disliked herself for conducting this absurd inspection. Faces were not calendars. A person could look tired.

The archive's back room smelled of cardboard and instant coffee. Ellen had begun volunteering there after her mother died, first one morning a week, then three. She liked the particularity of the work: a box belonged on a numbered shelf, a name could be checked against a directory. Unlike clearing her mother's house, cataloguing did not require her to decide which memories she could bear to discard.

She found the old donation form. Her mother had signed it, granting the archive the photographs and some mill newsletters. In the space for additional information, Ellen had written down what her mother told her. Arrived 1947. Started at North Mill shortly afterwards. The date 1948 on the catalogue was Ellen's own approximation. Somewhere between a conversation and a database entry, an approximation had hardened into a fact.

She phoned her brother. He was in a supermarket and asked her to repeat the question over an announcement about fresh bread.

"Does it matter?" he said.

"It's wrong in the catalogue."

"Then change the catalogue."

"I mean the story. The one she told us."

He was silent for a moment. Then he said, "Maybe she came twice."

The suggestion was so simple that Ellen resented him for offering it. She had already begun constructing alternatives with the private energy of a detective: a job omitted, a relationship concealed, a first attempt at independence that had failed. Her mother might merely have returned home for a while. Or remembered badly. Or written first day to mean the first day after a holiday. The photograph could not adjudicate among these possibilities.

When Ellen returned, Sami was reading a newsletter through a sheet of clear protective material. She explained that the inscription contradicted the estimated date and that they would amend the record.

"Can I see the original note?" he asked.

She showed him the donation form. He read it twice, without the expression of discovery she had feared.

"It's possible she arrived before she started there," he said. "But I shouldn't assume. Do you have anything from those years?"

At home she had a tin containing tickets, receipts, and birthday cards that had not yet found an agreed destination. There might be something in it. She said she would check, and heard herself make the promise more confidently than the contents justified.

That evening she spread the tin's contents over the dining table. A receipt for a coat, dated 1950, placed her mother in another town. It explained nothing about how long she had been there or why. A postcard showed a seaside promenade and carried only a message about the weather. Ellen turned it in the light, trying to make ordinary words surrender an extraordinary account.

At the bottom was a photograph of her mother much later, sitting on a wall with a paper bag of chips. Ellen remembered taking it. They had argued that morning about something she could no longer retrieve. Her mother was looking away from the camera, smiling at someone outside the frame. For once Ellen wanted to know who had been standing there rather than what the smile meant.

She brought the receipt to the archive. Sami asked permission to make a copy. He did not call it proof. Together they read the date and the shop's address, establishing the few things it could establish without help from either of them.

The amended catalogue entry read: Women outside the North Mill. Inscription on reverse dated September 1951; previous catalogue estimate 1948. She retained the earlier entry in the change history. In the biographical note she wrote that the date of arrival remained uncertain.

Before saving, she put the cursor after uncertain. She wanted to add a sentence explaining that her mother had been accurate about many things, that she had kept every rent receipt, that she had never knowingly short-changed anyone. The box was intended for information about the photograph. Ellen saved the entry as it was and returned the picture to its sleeve.`,
  },
  {
    id: "en-l10-what-the-translation-leaves-open", lang: "en", level: 10,
    title: "What the Translation Leaves Open",
    blurb: "An essay about ambiguity, family language, and choices a translation cannot avoid.",
    kind: "sample", category: "graded", featured: false,
    createdAt: 280_011, readAt: null, bookmark: null,
    source: "Original (Duki) · AI-drafted",
    body: `In a letter I once tried to translate for a relative, a woman described a visit from an old friend. The original sentence did not require her to specify the friend's gender. English, as I first wrote it, did. I supplied a pronoun, read the sentence back, and realised that I had quietly invented a fact. Removing the pronoun produced an awkward repetition. Recasting the paragraph solved the immediate problem and created another: the friend's entrance now sounded deliberate and important, whereas in the original the person had almost drifted into the room.

This was a family letter, not a diplomatic agreement. Nobody's legal position depended on my choice. Yet I remember it because the difficulty resisted my favourite account of translation, which was that a patient person could eventually find the right words. Here the obstacle was an invitation issued by the receiving language. It wanted me to decide something the writer had been allowed to leave undecided.

It is tempting to describe such moments as failures. Something has been lost, and a translation is expected to return with all the luggage. But that metaphor assumes the original was a collection of detachable meanings, each of which could be packed separately and delivered intact. Often the meaning lies partly in what a sentence does not settle. Its openness may be habitual rather than artistic. The reader of the original may not notice it until another language demands a choice.

English can leave other things vague. I can say that I visited my cousin without saying whether the cousin was older or younger than I am, or which side of the family connected us. Other languages may invite or require distinctions that English lets me postpone. There is no universal scale on which one language is precise and another beautifully mysterious. A language may require precision in one relationship and permit considerable vagueness in another.

The translator's decisions also have social consequences. Suppose a character addresses an older neighbour using a respectful form that would be ordinary in the original setting. An English translation can reproduce the title, omit it, or compensate through the tone of the dialogue. Retaining it may make the relationship seem more formal than it feels to the characters. Omitting it may erase a difference that matters later. Adding courteous phrases may make the speaker sound evasive. Each solution changes the reader's expectations before the conversation has properly begun.

Explanations can help, but they have a cost. A footnote is a courteous interruption. Several footnotes can make a kitchen conversation resemble evidence presented at a hearing. The reader is continually reminded of what must be learned before the characters can simply speak. Sometimes that reminder is welcome; sometimes it preserves information at the expense of pace, humour, or intimacy. Deciding which cost to accept is part of the work rather than an embarrassing departure from it.

Readers who know both languages may disagree about the result for good reasons. One wants the translation to sound as natural as the original sounded to its first readers. Another wants to feel the pressure of a different way of arranging experience. Those aims overlap, but they do not coincide. A wholly familiar voice can conceal the fact that the characters inhabit a different social world. A persistently unfamiliar voice can make ordinary people seem as though they speak in ceremonial riddles.

I am especially suspicious of praise for a translation's beauty when beauty means that every blunt sentence has become graceful. A rude character should sometimes be rude without eloquence. A joke can be feeble in the original. A letter written in haste may repeat a word because its writer was reaching for a train, not for a subtle effect. The translator who repairs all of this may produce better prose while giving us a less accurate acquaintance with the speaker.

The opposite temptation is to preserve awkwardness as a badge of loyalty. This can be just as misleading. A phrase that is entirely routine in one language may sound strange when its parts are carried over separately. The reader then attributes significance to something that originally passed unnoticed. Literalness is a method with uses; it does not absolve the translator of responsibility for the impression the sentence creates.

My family letter offered a smaller but more personal difficulty. The woman writing it was brisk. She gave news without explaining everybody's feelings, then asked whether a parcel had arrived. My relative, reading the English version, wanted to know if she sounded lonely. I had chosen a slightly melancholy phrase for the quiet house after the visit. The original allowed that reading, but did not insist on it. My translation had leaned on the scale.

I revised the phrase and told my relative why. This did not restore some perfectly neutral version. The new sentence had a different rhythm; it sounded cooler. We compared them and talked about the writer, whom my relative knew better than I did. The conversation yielded more than a declaration that one version was correct. It also reminded me that familiarity with a person is not interchangeable with fluency in a language.

A useful translation can acknowledge its decisions without presenting an inventory of every uncertainty. A brief note may be enough. In conversation, the translator can say that a phrase admits more than one reading. In a novel, the surrounding pages may preserve an ambiguity that a single sentence cannot. The choice depends on what the translation is for and what kind of attention its reader can reasonably give.

I kept both versions of the letter. The one I sent was plain, with a short explanation of the phrase we had discussed. Months later, my relative asked about the parcel. Neither of us remembered what it had contained. We had spent an afternoon weighing the emotional temperature of the visit and forgotten the question the writer had actually wanted answered.`,
  },
];
