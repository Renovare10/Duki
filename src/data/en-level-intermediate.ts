import type { LibraryText } from "../types";

const DEFAULTS = {
  lang: "en", kind: "sample", category: "graded", featured: false,
  readAt: null, bookmark: null, source: "Original (Duki) · AI-drafted",
} as const;

const INTERMEDIATE_DRAFTS: (LibraryText & { topics: string[] })[] = [
  {
    ...DEFAULTS,
    id: "en-l5-the-coat-in-the-window", level: 5, createdAt: 260_000,
    title: "The Coat in the Window",
    blurb: "A secondhand coat comes with a problem in its pocket.",
    topics: ["shopping", "daily-life"],
    body: `The blue coat had been in the shop window for three weeks. Every evening, Eva passed it on her way home. The price was too high for a secondhand coat, even a beautiful one. On Friday, however, a new sign appeared: Half price. Eva went inside before she could change her mind.

At home, she put her hands into the pockets. There was a bus ticket in one and a small envelope in the other. Inside the envelope were two fifty-pound notes. Across the front, someone had written, "For the roof."

Eva laid the money on her kitchen table. The coat had cost thirty pounds. She could certainly use another hundred. Her own roof was fine, but her washing machine had stopped working that morning. For a few minutes, she imagined paying someone to repair it.

Then she called the shop. The assistant said they bought clothes from several different people each week. She would ask her manager about the coat and call back. Eva gave her number, put the money away, and washed her work shirts in the bathroom sink.

Nobody called on Saturday. By Sunday evening, Eva was annoyed. She had expected to feel good about returning the money. Instead, she had a wet floor, sore hands, and a hundred pounds she did not feel free to spend.

On Monday, the manager finally called. An elderly man had brought in the coat after his wife died. The manager still had his telephone number. "Could you leave the envelope with us?" she asked.

Eva hesitated. She wanted to know that the money reached the right person. In the end, the manager arranged for them both to visit the shop on Tuesday.

The man arrived carrying a shopping bag full of old photographs. He showed Eva a picture of his wife wearing the coat beside a seaside hotel. Then he looked at the envelope and laughed, although his eyes were wet.

"She hated that leaking roof," he said. "I told her we couldn't afford the repairs. I suppose she started saving without telling me."

He offered Eva twenty pounds for her trouble. She refused at first, but he pushed it across the counter. "Please. Otherwise I'll have to carry this home as well."

Eva accepted. It paid for a week at the laundry, not a washing machine repair. When she collected her clean shirts, she was still wearing the blue coat. It fitted well, although she now checked both pockets before leaving the house.`,
  },
  {
    ...DEFAULTS,
    id: "en-l5-before-you-take-my-room", level: 5, createdAt: 260_001,
    title: "Before You Take My Room",
    blurb: "Maya leaves her cousin a letter about their shared flat.",
    topics: ["letters", "family", "daily-life"],
    body: `Dear Leo,

Mum says you've decided to take my room when I leave for college. She also says you think living with my two flatmates will be easy because you already know them. You know them at birthday parties. That's different from knowing them at seven in the morning when somebody has used the last of the milk.

First, the room itself. The window sticks when the weather is wet. Don't pull the handle hard. Push the bottom corner of the frame, then try again. The desk looks small, but there's another section underneath that you can pull out. I didn't discover it until I'd lived here for six months.

You can keep the curtains and the bookcase. I'm taking the lamp because it was a present from Dad. Please don't agree to keep anything else until I've packed. Last time you visited, you offered my green chair to your friend, and I was actually sitting in it.

Ben works early shifts at the hospital. He's usually asleep by ten, so use headphones if you're watching anything late. He won't complain about noise. He'll just look tired and say he's fine until you feel terrible. Ask him directly whether he can hear your music through the wall.

Rosa is different. If she has a problem, you'll know immediately. Don't mistake that for anger. We argued about cleaning during our first week together. I thought she disliked me. She thought I hadn't noticed the dirty kitchen. Once we agreed on a cleaning day, we got along much better.

The money needs a proper conversation before you move in. Check the rent, bills, and deposit with everyone. My share has changed since last winter, so don't use the number I mentioned at Grandma's. Get the arrangement in writing. It feels formal when you're friends, but forgetting who paid a bill feels worse.

There's one thing I hope you'll keep doing. On Sundays, we sometimes cook a big meal together. Nobody has to join, and the food isn't always good. Ben once forgot the rice and served us curry with toast. We still stayed at the table for two hours.

I sound as if I'm leaving you instructions for a difficult job. Most days, it's just home. You'll find your own ways of doing things. I only wanted to warn you about the window before you broke it.

I'll be back next Thursday for the last boxes. Please leave the green chair where it is until then.

Love,
Maya`,
  },
  {
    ...DEFAULTS,
    id: "en-l5-your-first-repair-cafe", level: 5, createdAt: 260_002,
    title: "Your First Repair Cafe",
    blurb: "How to prepare for a visit to a repair cafe run by volunteers.",
    topics: ["how-to", "daily-life"],
    body: `A repair cafe is an event where volunteers help people examine broken things. Some events accept clothes and small household objects; others have people who understand bicycles or particular machines. The service may be free, although you might be asked to pay for parts or leave a donation. A repair is never certain.

Before carrying your broken object across town, read the event's information. Check what the volunteers accept, whether you need an appointment, and when they stop taking new jobs. A volunteer who can mend a jacket may not be able to examine a printer. Ask first if the information is unclear.

Write down what went wrong. "It doesn't work" is a start, but a short history is more useful. Did your bag's zip stop closing after something caught in it? Does your radio fail every time, or only sometimes? Say what you noticed without pretending you know the cause. You don't need technical language.

Bring the parts that belong with the object, such as its instructions or a loose button. Ask the organisers what else they need. If it is an electronic device, protect your private information before handing it over. Don't share passwords simply because someone is helping you. For anything involving electricity, heat, or a damaged battery, ask for specific safety advice before transporting or using it.

Clean ordinary dirt from the object where it is safe to do so. Empty the pockets of a coat and remove food from a lunch bag. Volunteers are giving their time, and a clean item is easier to handle. However, don't open a case or try a risky repair just to prepare for the visit.

At the event, explain the problem and then listen. The volunteer might ask to see how you usually use the item. If the event allows you to watch, ask questions without touching tools or parts unexpectedly. You may discover how to look after the object, even if it cannot be repaired that day.

Agree on costs before anyone orders a part. Also ask what happens if the repair fails. A volunteer may explain that an item needs a professional repair, or that replacing it makes more sense. That answer can be disappointing, especially if the object means a lot to you.

Before leaving, ask whether the item is ready to use and whether any work remains. Don't assume that being examined means it is safe. Take your belongings and any loose pieces with you. If the repair succeeds, you can thank the volunteer by explaining how you use the object. A mended backpack that goes to school every day has a more interesting future than one that stays in a cupboard.`,
  },
  {
    ...DEFAULTS,
    id: "en-l5-the-recipe-with-no-numbers", level: 5, createdAt: 260_003,
    title: "The Recipe with No Numbers",
    blurb: "A family recipe becomes harder to write down than to cook.",
    topics: ["food", "family", "culture"],
    body: `My mother's recipe for tomato soup begins with "Take some tomatoes." It continues with "Add enough water" and ends with "Cook until it's ready." When I moved away, she wrote these instructions on a card. I thanked her, packed it carefully, and discovered a week later that I couldn't use it.

I called to ask how many tomatoes I needed. "How many people are eating?" she asked. I said two. "Then enough for two people." We were both trying to be helpful, but we weren't having the same conversation. I wanted a number. She wanted me to picture a pot of soup.

When I visited her next, I brought a notebook and a small kitchen scale. She thought this was very funny. While she cooked, I weighed the tomatoes and measured the water. I wrote down the size of the pot and the time she started. At last, I would have a recipe that meant something outside our kitchen.

Then she tasted the soup and added more water. A few minutes later, she added another tomato. I crossed out my numbers. The first tomatoes had been sweeter than she expected, she explained, and there wasn't quite enough soup. She was following the food, while I was following the notebook.

That afternoon, I understood why her card was so short. It wasn't a complete set of instructions. It was a reminder for somebody who already knew what the soup should look and taste like. The missing information was in her hands and her memory. I had eaten the soup for years without paying attention to either.

We tried again the following day. This time, I cooked and she watched. She told me to notice how thick the soup was when I lifted the spoon. I wrote that down beside the amount of water. We also measured the extra water I added, so I could understand how much the soup had changed.

I still use numbers when I cook it at home. They help me begin, and they help me explain the recipe to friends. However, my card now includes other details: the pot I use, the number of bowls it makes, and what to do if it looks too thick. There are food safety instructions in the kitchen books too; family memory isn't a substitute for those.

My mother has a copy of my longer recipe. She keeps it in a drawer and has never cooked from it. Once, I caught her showing it to a neighbour. "All this," she said, turning over the page, "for one pot of soup."`,
  },
  {
    ...DEFAULTS,
    id: "en-l5-six-minutes-at-the-piano", level: 5, createdAt: 260_004,
    title: "Six Minutes at the Piano",
    blurb: "Waiting for a train, Daniel finds an audience he did not ask for.",
    topics: ["arts", "travel", "feelings"],
    body: `Daniel had forty minutes before his train. He bought a coffee, checked the departure board, and noticed a piano near the station cafe. A card above the keys said anyone could play. He had seen public pianos before, but there was usually somebody better sitting at them.

That morning, the seat was empty. Daniel put his bag under it and opened the keyboard cover. He hadn't played regularly since leaving school. Still, he remembered one piece well enough to start without thinking. His left hand found the first few notes, and his right hand followed.

Halfway through, he forgot what came next. He stopped, tried the last part again, and stopped a second time. Someone behind him said, "Take your time." That made him more nervous. He hadn't realised anyone was listening.

He turned and saw a woman with a yellow suitcase. She was holding her phone towards him. "My sister plays," she said. "I thought she'd enjoy this."

"Are you recording me?" Daniel asked.

"Just a little bit."

He took his hands off the keys. The woman lowered the phone, surprised. She explained that she only planned to send the video to her sister. Daniel understood that she meant to be friendly, but he didn't want a recording of his mistakes travelling to someone he had never met.

"I'd rather you didn't," he said. His voice came out sharper than he intended.

The woman looked embarrassed. She deleted the video while he watched, then walked towards the cafe. Daniel closed the keyboard cover. Now he felt embarrassed too. He had wanted ten quiet minutes with a piano, and somehow he had made a stranger feel bad.

An announcement told passengers that his train was delayed. He still had time to sit somewhere else. Instead, he went to the cafe and found the woman waiting for tea. He thanked her for deleting the recording. "I wasn't angry with you," he added. "I just get nervous."

She nodded. "I should have asked first. My sister always says that when I film her. Apparently I don't listen."

When Daniel returned to the piano, he chose a shorter piece. The woman sat nearby with her tea, her phone inside her coat pocket. He made two mistakes but reached the end. This time he didn't turn around until the final note had faded.

She clapped softly, then checked the board. They were taking the same train. On the platform, she asked how long he had studied music. He asked about her sister. There was no video to remember the morning by, but he could still hear the last few notes as the train pulled out.`,
  },
  {
    ...DEFAULTS,
    id: "en-l5-a-room-above-the-kitchen", level: 5, createdAt: 260_005,
    title: "A Room Above the Kitchen",
    blurb: "A hotel guest explains what went wrong and asks for a specific response.",
    topics: ["letters", "travel"],
    body: `Dear Hotel Manager,

I stayed at the Willow Hotel last weekend, from Friday to Sunday, in room twelve. My booking was under the name Alice Wong. I am writing about the noise from the kitchen below my room and about the way my complaint was handled on Saturday morning.

I booked through your website because it described the hotel as a quiet place for a weekend break. I understand that a hotel kitchen cannot be silent. People need to prepare breakfast, and some noise during the day is reasonable. However, on both mornings, loud voices and the sound of heavy equipment woke me before five thirty.

On Friday night, I thought it might be a single delivery. After breakfast on Saturday, I asked the person at reception whether I could move. She checked the room list and said the hotel was full. I accepted that answer. I did not expect you to ask another guest to leave so that I could have their room.

I then asked whether the kitchen could keep the noise down early the next morning. The receptionist said she would speak to the kitchen manager. Unfortunately, the noise began at the same time on Sunday. When I mentioned it while checking out, a different receptionist said she knew nothing about my earlier complaint.

That second conversation was more upsetting than the noise itself. I had explained the problem calmly and thought someone was dealing with it. Being asked to explain it again, while a taxi waited outside, made me feel that the first conversation had been forgotten.

Several parts of my stay were good. The room was clean, and the evening receptionist helped me find a bus to the coast. Please do not read this letter as a complaint about every member of your staff. I am concerned about this room and about how information passes between shifts.

I would like a partial refund for the two nights. I paid two hundred pounds in total, and I think a refund of sixty pounds would be reasonable. If you disagree, please explain what you can offer. I would also like you to check whether future guests should be warned about early kitchen noise before booking room twelve.

I have attached my booking confirmation and receipt. Please reply by email within two weeks. I am at work during most of your reception hours, so a phone call would be difficult to answer. If you need another detail about the booking, you can ask me by email.

I hope you will discuss the complaint with both reception and kitchen staff. The problem might be difficult to remove completely, but guests should know what to expect.

Yours sincerely,
Alice Wong`,
  },
  {
    ...DEFAULTS,
    id: "en-l5-recording-a-family-interview", level: 5, createdAt: 260_006,
    title: "Recording a Family Interview",
    blurb: "How to collect a relative's memories without turning a visit into an exam.",
    topics: ["how-to", "family", "history"],
    body: `A family interview can begin with a very ordinary question: "What was your first job?" The answer may lead to a crowded bus, an unpleasant manager, or a friend whose name you have never heard. Recording that conversation lets you return to the details later. It also needs more care than simply putting a phone on the table.

Ask the person before you record. Explain why you want the interview and who might hear it. A recording for your own family is different from one for a school website. If your plans change, ask again. Being related does not give you permission to publish someone's voice or private memories.

Choose a quiet place where both of you can sit comfortably. Test the recorder with a short conversation, then play it back. You need to hear both voices clearly. Check the battery and storage space too. These small checks are easier to do before somebody tells a story they may not feel like repeating.

Prepare a few questions, but leave room to follow the answers. "Did you enjoy school?" may get a simple yes or no. "What happened on a normal school morning?" gives the person more to describe. Ask one question at a time, and allow pauses. Someone searching for a memory may need silence rather than another question.

Listen for details you don't understand. If your aunt mentions "the old place," ask where that was. If your grandfather uses the name of a tool, ask what it did. Future listeners may know even less than you do. You can ask for explanations without making the conversation feel like a test.

Memories are not always certain. Two people can remember the same event differently. Don't force a choice during the interview just because you want a clear answer. You can note the disagreement and compare dates or documents afterwards. A phrase such as "I think it was winter" should not become "It was winter" when you write up the conversation.

Agree that the speaker can skip a question or stop. If a subject becomes uncomfortable, offer to take a break or move on. A dramatic story isn't worth making a relative feel trapped at their own kitchen table.

Afterwards, save a clearly named copy and keep another copy somewhere safe. Write down the date, the speakers' names, and any limits on sharing. Let the person listen or read what you plan to use. Correct mistakes, respect anything they ask you to remove, and thank them for their time. You may finish with fewer stories than you expected, but the ones you keep will have been shared willingly.`,
  },
  {
    ...DEFAULTS,
    id: "en-l5-the-last-runner", level: 5, createdAt: 260_007,
    title: "The Last Runner",
    blurb: "Nina finishes her first race and has to explain why she is disappointed.",
    topics: ["sports", "feelings"],
    body: `By the final turn, Nina could no longer see another runner. The road behind her was open, and the road ahead ended at a banner that two volunteers were beginning to untie. She lifted one hand. A volunteer saw her and quickly tied his end back to the fence.

Nina crossed the line to a loud cheer from her brother, Mark. He took a photograph, handed her a bottle of water, and said she had done brilliantly. She bent forward with her hands on her knees. It was her first five-kilometre race, and she had come last.

"You finished," Mark said. "That's all that matters."

Nina knew he was trying to help. She also knew she had wanted to finish in under forty minutes. Her watch showed forty-four. She had trained for two months and told nearly everyone in her office about the race. Finishing was not all that had mattered to her that morning.

At a nearby cafe, Mark ordered two breakfasts and started choosing photographs to send to their parents. "Don't send that one," Nina said. In the picture, the banner was hanging loose at one end. She didn't want to explain it every time someone looked at her phone.

Mark put his own phone away. "Do you want to talk about it?"

She told him about the number on her watch. She had started too fast because she was afraid of falling behind. After the first hill, she had needed to walk. Seeing everyone pass her had made her panic, and she had run too fast again.

"That sounds awful," Mark said.

It was the first thing he had said that made her laugh. They ate for a while without discussing the race. Then Nina asked whether he still had the video from her first practice run. He found it. In that video, she was walking after less than a minute and arguing that his chosen route was too steep.

She watched it twice. She had improved. She had also run a poor race. Both things could be true, although she preferred one of them.

On the way home, they passed a poster for another race in six weeks. Mark waited while she read it. He didn't suggest entering, which made it easier for her to think about. She took a picture of the date and asked him to help her practise a slower start.

That evening, Nina sent her parents a photograph from the cafe. In the message, she wrote her time and said she was disappointed. Her mother replied that she wanted to hear about it on Sunday. Nina was glad she hadn't written that everything was wonderful.`,
  },
  {
    ...DEFAULTS,
    id: "en-l5-the-city-under-the-map", level: 5, createdAt: 260_008,
    title: "The City Under the Map",
    blurb: "A visitor discovers why two useful maps can describe the same city differently.",
    topics: ["travel", "daily-life"],
    body: `On my first visit to a large city, I used the underground railway map to decide where to walk. Two stations looked far apart, so I bought a ticket and changed trains twice. When I came out, I could see the street where I had started. The journey had taken twenty minutes. The walk would have taken five.

Nothing was wrong with the railway map. It showed which stations were connected and where I could change lines. That was the information a passenger needed. To make those connections easy to read, the designer had changed distances and straightened routes. I had asked the map a question it wasn't designed to answer.

Every map leaves things out. A map that included every bench, doorstep, and tree would be difficult to carry and almost impossible to read at a useful size. The choices depend on the purpose. A walking map may show paths that a road map ignores. A map of bus services may make an important hospital clear while leaving nearby streets unnamed.

Colour and symbols also guide our attention. A wide coloured line may look like the most important road, but importance can mean different things. For a driver, it might mean a fast route across town. For someone walking with a child, a smaller road with good crossings may be a much better choice.

Digital maps can make these decisions feel automatic. We enter a destination and receive a route, sometimes with a very exact arrival time. Yet the route still depends on choices. Is it for walking or driving? Does it avoid stairs? Does it assume a speed that feels comfortable to us? A confident instruction can still be unsuitable.

I now compare the route with a wider view before leaving. I check the travel mode and look for rivers, railway lines, and other barriers. If accessibility matters, I seek specific information rather than trusting a general route. I also check current notices, because a bridge or station entrance can close after a map was made.

There is pleasure in looking beyond the suggested line. On that first city visit, I eventually walked between the two stations. I found a public garden, a quiet square, and a bakery with a queue outside. None of them had been visible on the railway map.

I still keep that map folded in an old travel notebook. It was excellent for finding trains. The street map I bought later was excellent for getting lost slowly on purpose. I needed both, but I needed to understand what each one could tell me before asking it where to go.`,
  },
  {
    ...DEFAULTS,
    id: "en-l5-the-wrong-dragon", level: 5, createdAt: 260_009,
    title: "The Wrong Dragon",
    blurb: "A theatre assistant collects a costume without asking one useful question.",
    topics: ["humor", "arts", "work"],
    body: `The costume shop had three green dragons ready for collection. Oliver didn't know that. His director had sent him a message saying, "Collect the dragon before four," and he had arrived at the shop at three fifty with a small car and very little patience.

"The green dragon?" the assistant asked.

"That's right," Oliver said. He was already looking at the traffic on his phone. The assistant brought out a large bag, checked the theatre company's name, and gave him a receipt. There were two orders under that name, but Oliver pointed at the first one before she finished explaining.

At the theatre, the actor playing the dragon was waiting on stage. Oliver opened the bag and pulled out a bright green head with friendly eyes. Next came a round body, short wings, and enormous soft feet. The actor stared at them.

"Am I supposed to frighten the village," he asked, "or invite it to my birthday party?"

Their play needed a terrible dragon that lived in a mountain cave. This dragon had a yellow bow tie. When Oliver pressed one of its paws by accident, it made a cheerful squeaking sound.

The director closed her eyes. Oliver checked his receipt. The costume belonged to the same company's children's show, which was opening the following week. He had collected the right animal for the wrong production.

By then, the shop was closed. Their final rehearsal was due to start in ten minutes. The director said they would have to rehearse in the friendly costume and exchange it the next morning. She told Oliver to stop apologising and help with the feet.

The first scene went badly. The dragon could not enter the narrow cave door without turning sideways. Its soft tail knocked over a wooden tree. When the hero raised his sword, the dragon tried to step back and squeaked. Nobody on stage could speak for nearly a minute.

Then the actor changed his voice. Instead of roaring, he asked the hero politely to stop waving the sword near his nose. The hero replied that he had spent three days climbing the mountain and expected at least a small fight. The director started writing in her notebook.

They still exchanged the costume. Their new dragon had long teeth and proper wings, and it fitted through the door. However, the actor kept the polite voice for one short scene. The unexpected request made the hero seem less certain of himself, which the director liked.

On opening night, Oliver stood backstage holding the spare sword. Before every scene, he checked exactly who needed it. His colleagues found this very funny. Oliver let them laugh. Asking twice took less time than driving back to a costume shop.`,
  },
  {
    ...DEFAULTS,
    id: "en-l6-the-bridge-on-page-nine", level: 6, createdAt: 260_010,
    title: "The Bridge on Page Nine",
    blurb: "A walking guide goes to print just as its most useful route disappears.",
    topics: ["work", "travel", "nature"],
    body: `The first boxes of walking guides arrived on a Wednesday, six months after Ruth had started drawing the maps. She cut one open and turned straight to page nine. Her favourite route followed a stream through the woods, crossed a narrow footbridge, and returned through an orchard. In the photograph, the bridge looked new.

On Thursday, a storm brought a tree down across it. By Friday morning, the park office had closed the crossing. Ruth read the notice on her phone while standing beside three hundred copies of a guide that now directed people towards a bridge they could not use.

The publisher, Martin, suggested putting an update on their website. "We have a corrections page for exactly this kind of thing," he said. "The books aren't wrong about everything else."

Ruth agreed about the other routes. She was less convinced that someone holding a printed guide in the woods would check a website first. The cover described all twelve walks as suitable for families. She asked Martin to delay sending the boxes to shops.

He reminded her what storage cost and asked how long the bridge would be closed. She didn't know. The park office had no repair date, and inventing one would not improve the book. When she asked whether he would take his daughter on that route tomorrow, he said this was becoming personal.

They ended the call without an agreement. Ruth sat at her desk, angry with Martin and increasingly annoyed with herself. She had argued about responsibility without offering a practical way to handle three hundred books.

That afternoon, she spoke to the park officer. There was an alternative route along a public lane, but it was longer and had a steep section. It could not simply replace the family walk. Ruth asked permission to quote the closure notice and confirmed where readers could obtain current information.

She drafted a short warning for page nine: the route was closed at the bridge, readers should not attempt the crossing, and reopening information was available from the park office. She also proposed a clearly visible notice inside the front cover. Martin could approve the wording, and she would help add the notices before any copies left the store room.

This time, their conversation lasted fifteen minutes. Martin disliked the extra work, but agreed that the notices were better than hoping everyone visited the corrections page. They cancelled the route's place in an upcoming advertisement too.

For two days, Ruth and a student assistant opened books and fixed notices into place. It was slow, dull work. In the final box, she found a copy with a small tear across page nine and put it aside for herself.

The bridge reopened months later. Ruth updated the website, but left the warning in her own copy. Whenever someone praised the photograph, she opened the book far enough to show them the rest of the page.`,
  },
  {
    ...DEFAULTS,
    id: "en-l6-the-letters-in-the-biscuit-tin", level: 6, createdAt: 260_011,
    title: "The Letters in the Biscuit Tin",
    blurb: "Two sisters disagree about giving their grandmother's letters to an archive.",
    topics: ["letters", "family", "history"],
    body: `Dear Ellen,

I've been thinking about our argument on Sunday. I should not have called you secretive. You have spent months sorting Grandma's papers while I've mostly sent messages asking how it was going. I understand why my sudden enthusiasm for donating the letters sounded like another job for you.

I still think the local archive might be interested. Grandma's descriptions of her factory work include things I never heard her discuss: the changing shifts, the women who shared the bus, the jokes about the supervisor. Those details could matter to someone studying working life. A biscuit tin in my spare room is not an especially reliable plan for keeping them.

However, you're right that the letters contain much more than factory memories. They name people whose families still live here. Some describe arguments, debts, and relationships that were never meant to become public. We cannot assume that because Grandma is gone, everyone mentioned in her letters has lost an interest in their privacy.

I called the archive yesterday, but I did not offer the papers or send photographs. I only asked about their general process. The archivist said they would first need to assess the material and discuss any proposed conditions. They could not promise to accept it, or promise particular restrictions without reviewing what those restrictions would involve.

That seems a more useful starting point than our argument about keeping everything private or publishing everything online. Those are not the only possible choices. We need to ask what the archive can actually do, and then decide whether that arrangement is one we can accept. We should also confirm who has authority to make the decision rather than assuming it belongs to whichever sister currently has the tin.

Would you be willing to make a basic list with me next month? We could record dates and broad subjects without copying private passages into a shared document. If a letter raises a concern, we can note that concern separately. I will do the typing and bring lunch. You have done enough unpaid organising already.

I would also like us to read a few letters without turning the afternoon into a project. I keep thinking about the one where Grandma complains that the seaside was full of sand. I'd forgotten how funny she could be when she wasn't trying to entertain children.

Please don't feel you have to decide before I visit. If you would rather wait, say so. I wanted to explain what I learned and apologise for the way I spoke. We can disagree about the archive without making the letters into a new family quarrel.

Love,
Helen`,
  },
  {
    ...DEFAULTS,
    id: "en-l6-a-fair-test-for-paper-towels", level: 6, createdAt: 260_012,
    title: "A Fair Test for Paper Towels",
    blurb: "A simple household comparison shows why the question matters as much as the result.",
    topics: ["how-to", "science", "shopping"],
    body: `Two brands of paper towel are on sale. One roll costs less, but its advertisement claims that each sheet absorbs more water. You could accept the claim, choose the prettier packet, or design a small comparison. Before reaching for a jug, decide what you want to find out. The best towel per sheet may not be the best towel for the money.

Start with a narrow question, such as how much water equal areas of the two towels can hold under the same conditions. Equal areas matter because the brands may sell different sheet sizes. Comparing one large sheet with one small sheet would mix up the effect of the material with the amount of material being tested.

Write down a method before starting. For a simple classroom demonstration, you might weigh each dry sample, wet it thoroughly in a shallow tray, let it drip for a fixed time, and weigh it again. The increase in mass gives a way to compare retained water. Use the same water, handling method, and waiting time for both brands. Work on a stable surface away from electrical equipment.

The method will still have weaknesses. Holding one sample more tightly could squeeze water out. A kitchen scale may be too rough to detect small differences. A towel might tear while wet, making the result difficult to compare. Record these problems instead of quietly removing an inconvenient trial.

Repeat the comparison with fresh samples. One result can reflect a mistake or an unusual piece of paper. Several trials let you see whether the differences are reasonably consistent. Alternate which brand you test first, and label the samples clearly. If possible, use simple codes so the person measuring does not know which brand they expected to win.

Keep the original measurements, including units, and calculate the results in the same way for each brand. An average can summarise the trials, but also look at how widely the results vary. If the difference between brands is smaller than the uncertainty in your measurements, the sensible conclusion may be that your test cannot distinguish them.

Finally, return to the shopping question. Holding more water per equal area does not tell you how easily a towel tears, how well it removes grease, or how much you need for a real spill. Price per roll is also incomplete if rolls contain different amounts of paper.

A useful report explains what was tested, how it was measured, and what remains unknown. You do not need to announce a universal winner. You might conclude that one brand held more water in your particular test, while the cheaper brand still met your household's needs. That is a less exciting claim than an advertisement, but a much easier one to defend.`,
  },
  {
    ...DEFAULTS,
    id: "en-l6-the-joke-that-needed-a-note", level: 6, createdAt: 260_013,
    title: "The Joke That Needed a Note",
    blurb: "Translating a small joke raises a larger question about what to preserve.",
    topics: ["culture", "humor", "literature"],
    body: `Suppose a cartoon shows a fish working alone in an office. Underneath, the artist has written, "Our sole employee." In English, sole can mean only, but it is also the name of a kind of fish. The sentence describes both the lonely worker and the creature sitting at the desk. A reader who knows both meanings can understand the joke almost immediately.

Now imagine translating that caption into a language whose word for the fish has no connection with the word for only. A completely accurate translation of the sentence may describe the picture and lose the joke. Nothing has been translated incorrectly at the level of separate facts, yet an important part of the cartoon has disappeared.

A translator has several choices. One is to explain the double meaning in a note. That works in a book about language, where the explanation may be more interesting than the original joke. It works less well beneath a cartoon on a greeting card. By the time the reader finishes the note, the moment for a quick laugh has passed.

Another choice is to create a different joke that suits the picture. The wording may move further from the original while giving readers a similar experience. This requires judgment. The translator should not quietly introduce an insult or a reference that changes the artist's attitude towards the character. A funny sentence can still be the wrong sentence for that cartoon.

The difficulty becomes greater when humour depends on shared experience rather than on a single word. A joke about a school examination may be obvious to people who took it and confusing to everyone else. Replacing it with a familiar examination could help the new audience, but it could also make the story seem to happen in a different country.

Readers sometimes treat any departure from the original wording as a failure. That is understandable when details matter: a contract and a medicine label should not be treated like a comedy script. In literature, however, rhythm, surprise, and the speaker's personality also carry meaning. Preserving every word order may damage those parts.

There is no method that protects everything at once. The purpose and setting of the translation affect the choice. A student edition may benefit from notes. A performance needs lines that actors can speak and an audience can follow in real time. A bilingual cartoon might simply keep both captions and let the picture help.

When a translated joke fails, the reader is not necessarily missing something obvious. The joke may depend on a connection the new language does not provide. Recognising that possibility makes reading less frustrating. It can also send a curious reader back to the original, where an ordinary little word suddenly has two jobs.`,
  },
  {
    ...DEFAULTS,
    id: "en-l6-the-woman-outside-the-frame", level: 6, createdAt: 260_014,
    title: "The Woman Outside the Frame",
    blurb: "A familiar photograph unsettles a small museum's account of a local photographer.",
    topics: ["history", "arts", "family"],
    body: `At the centre of the exhibition was a photograph of Market Street under snow. A horse stood outside the bakery, and a woman leaned from an upstairs window. The label credited Arthur Bell, a local photographer whose grandson had donated a box of glass negatives to the museum.

Jo had written that label herself. She was pleased with its short account of Bell's career until a visitor in a purple coat asked why the museum was certain he had taken the picture.

"It was in his collection," Jo explained.

"That doesn't mean he was behind the camera," the visitor said. She introduced herself as Bell's great-granddaughter, Frances. According to Frances's mother, Bell's sister Rose had worked in the studio for years. The family called her an assistant, although nobody seemed able to explain what she assisted with.

Jo had twenty minutes before a school group arrived. She suggested that Frances leave an email address. Frances did, but her expression made the suggestion feel like a polite way of ending the conversation.

That evening, Jo checked the donation records. They described the negatives as coming from Bell's studio, not as photographs taken personally by Bell. Jo had turned one statement into the other while shortening the label. She had no evidence that Rose took the street photograph. She also had less evidence for Arthur than she had assumed.

Frances sent copies of two family letters. One mentioned Rose taking pictures while her brother was away. Neither identified the snowy street. A newspaper advertisement listed only Arthur's name, but that proved who advertised the business, not who operated the camera on every occasion.

Jo told the museum director they needed to change the label. The director agreed to correct the unsupported claim, but questioned Jo's first replacement: "Photograph by Arthur or Rose Bell." What about another employee? What about a negative bought from elsewhere? Naming two possibilities could make them sound like the only ones.

They settled on "Market Street under snow. From the Bell studio collection; individual photographer unknown." A longer note explained the evidence about Rose's work without claiming this particular image as hers.

Frances was disappointed. She had hoped to see her great-great-aunt's name directly beneath the photograph. Jo understood the wish, but explained why uncertainty could not be repaired with a more appealing guess. She invited Frances to help examine the remaining family papers, if she wanted to.

A month later, Frances returned with a small notebook and a very large envelope. They booked a table in the study room. Before sitting down, she stopped beside the photograph and read the new label.

"At least," she said, "you've made room for the question."

Jo fetched two pencils. They still had several hundred photographs to look through, and the handwriting on the envelopes was difficult.`,
  },
  {
    ...DEFAULTS,
    id: "en-l6-after-my-last-night-shift", level: 6, createdAt: 260_015,
    title: "After My Last Night Shift",
    blurb: "A bakery worker writes to the colleague who will miss her least convenient habits.",
    topics: ["letters", "work", "food"],
    body: `Dear Sal,

I woke at two this morning and reached for my work trousers before remembering that I don't need them anymore. After twelve years of night shifts, my body hasn't read the retirement card. The trousers are still on the chair, and I suspect they'll stay there for a while.

Thank you for the party. I know you were responsible for the cake because nobody else would put "Enjoy your lie-ins" across something shaped like an alarm clock. I took the clock face home. My grandson ate the number seven and then asked why a bakery worker needed a cake from another bakery. I told him I deserved a night off.

What I remember most about our shifts is the hour before the delivery drivers arrive. Outside, the streets are quiet, but inside we're trying to finish everything at once. You always say you like that hour. I used to think you were pretending. Then I noticed you humming whenever the first trays went out, and realised you probably meant it.

I'll miss the journeys home more than the journeys in. At six, the city seems to belong to people who are about to do something. Shop shutters go up, buses fill, and the newspaper seller has an opinion about the weather before anyone asks. I'd be passing through all of it with a whole working day already behind me.

I won't miss explaining that an afternoon phone call can wake someone who has worked all night. My sister never quite accepted this. She used to say, "But it's three o'clock!" as if I had forgotten to look outside. Now I'll have to find another reason for not answering her calls immediately.

There are a few things I meant to tell you before leaving. The notebook of customer requests is in the office drawer, not the cupboard where we used to keep it. I moved it last week and forgot to update the note. Also, the radio behind the flour shelf is mine. You can keep it if you want it. It only receives one station clearly, which has saved us years of arguments.

Please don't agree to cover every extra shift just because I'm gone. The manager needs a proper replacement, and you need the days off you've already booked. I enjoyed working with you, but I don't want my retirement to mean you never get to see your garden.

Come for lunch next month when your rota allows it. Bring no bread. I intend to buy some from a shop, complain about the price, and eat it without checking the shape of every loaf.

Love,
Jean`,
  },
  {
    ...DEFAULTS,
    id: "en-l6-a-meeting-with-an-ending", level: 6, createdAt: 260_016,
    title: "A Meeting with an Ending",
    blurb: "How a small neighbourhood group can discuss a proposal and reach a clear decision.",
    topics: ["how-to", "news", "daily-life"],
    body: `Your neighbourhood group has an hour to decide how to use a small shared garden. One person wants vegetable beds, another wants benches, and several people simply want the discussion to end. A useful meeting begins before anyone takes a seat. People need to know what can be decided, who has the authority to decide it, and which limits already exist.

Send a short agenda in advance. State the actual question rather than a broad subject such as "The garden." For example, the group might be choosing between two plans within an agreed budget. Include the plans and explain any voting rules. If the group has formal rules, follow them rather than inventing a new procedure on the night.

Think about access as well as attendance. Can people enter the room, hear the discussion, and read the documents? Provide a way to raise needs beforehand. Where practical, accept written comments from people who cannot attend, and explain how those comments will be considered. Do not imply that a written comment automatically counts as a vote if the rules say otherwise.

At the start, confirm the finishing time and the purpose. Choose someone to guide the discussion and someone to record decisions. These jobs are easier when separate people do them. The person taking notes does not need to write every sentence, but should record the proposal accurately before the group decides.

Allow a short period for questions about facts before debating preferences. The cost of a bench is a factual question; whether a bench is a better use of space is a judgment. If an essential fact is unknown, identify who will check it. Confidence and volume are not evidence that a price or permission has been confirmed.

During discussion, invite people who have not spoken to contribute without forcing them. Give each speaker a reasonable opportunity, and stop repeated interruptions. Summarise disagreements fairly. Saying "Everyone wants benches" because the three loudest people want them can make quieter members feel that the result has already been chosen.

Before any vote, read the exact proposal aloud. Include conditions, costs, and responsibilities that form part of it. Record the outcome using the group's agreed method. If a decision must be postponed, record what information is missing and when the group will return to it. Postponement should have a next step, not an indefinite promise.

Finish by confirming who will do what and by when. Share a brief record afterwards and provide a way to correct factual errors. A clear result may still disappoint someone who preferred vegetables to benches. They should nevertheless be able to understand how the decision was reached, what was approved, and whether they volunteered to buy anything.`,
  },
  {
    ...DEFAULTS,
    id: "en-l6-why-the-street-stays-warm", level: 6, createdAt: 260_017,
    title: "Why the Street Stays Warm",
    blurb: "What buildings, trees, and night-time temperatures reveal about urban heat.",
    topics: ["science", "weather", "nature"],
    body: `After a hot afternoon, a walk from a busy street into a shaded park can feel like a change in the weather. The sun is the same, and the places may be only a few minutes apart. Yet the materials under our feet, the shade above us, and the movement of air can make the experience very different.

Sunlight warms surfaces. Dark road materials often absorb much of the sunlight reaching them, while a tree's shade reduces the sunlight falling directly on the ground below. Buildings and paved surfaces can also store heat during the day and release it later. This helps explain why a street may remain warm after the sun has gone down.

Plants affect heat in another way. Water moves from soil through plants and eventually enters the air as water vapour. Evaporation uses energy and can cool the surrounding environment. The amount of cooling depends on conditions, including available water and the kind of vegetation. A dry patch of grass does not behave like a healthy, well-watered tree.

Cities also produce heat through human activity. Vehicles, machinery, and cooling systems release heat. Air conditioning can make a room comfortable while sending heat outdoors. The effect on a particular street depends on the number and arrangement of buildings and machines, as well as the weather.

The tendency for an urban area to be warmer than nearby less built-up surroundings is often called the urban heat island effect. It is not a promise that every part of every city is always hotter. Wind, cloud, local geography, and the time of day all matter. A shaded city garden and an exposed field can produce a different comparison from a dense shopping district and nearby woodland.

Measuring the difference requires care. A thermometer left in direct sunlight may become warmer than the air you intended to measure. An instrument aimed at a road measures a surface temperature, which is not the same as air temperature. Comparisons are more useful when the instruments and methods are suitable and consistent.

There are ways to reduce urban heat, but each needs planning. Trees can provide shade, yet they need space for roots and suitable care. Reflective roofs may absorb less solar energy, while poorly chosen bright surfaces can create uncomfortable glare. Opening a path for wind can help in some settings, but the arrangement of nearby buildings affects the result.

These details matter because heat is experienced locally. A citywide forecast cannot describe every bus stop or upstairs bedroom. Knowing why one place stays warm helps planners ask better questions about shade, housing, and public space. It also explains why an evening weather report can sound comfortable while the pavement outside your front door is still giving back the afternoon's heat.`,
  },
  {
    ...DEFAULTS,
    id: "en-l6-the-away-supporter", level: 6, createdAt: 260_018,
    title: "The Away Supporter",
    blurb: "A football fan recognises the voice complaining beside her in the stands.",
    topics: ["sports", "family", "humor"],
    body: `Leah had promised not to talk about work on Saturday. She put her office phone in a drawer, found her blue scarf, and took the early train to watch Riverside play North Town. It was the first match she had attended alone, and she intended to shout as much as she liked.

Her seat was beside an older man who had folded a red scarf into his coat pocket. North Town's colour. When she glanced at it, he put a finger to his lips. "My daughter's idea," he said. "She bought the tickets before asking which end I wanted."

Leah smiled politely and opened her programme. Then the man complained about the small print, and she recognised his voice. He was Mr Harris, the customer who had spent forty minutes on the phone with her on Friday disputing a delivery charge. She worked for the company that supplied his restaurant.

He hadn't recognised her. To him, she was simply a stranger in a blue scarf. Leah considered telling him, but the teams were coming onto the pitch and she had promised herself a day without work. She folded the programme and faced the field.

For twenty minutes, they discussed the game without difficulty. Harris knew the players on both sides and remembered matches from before Leah was born. He said Riverside's young goalkeeper looked nervous. Leah defended him, then watched him drop a simple ball. Harris was kind enough not to comment.

At half-time, a woman arrived carrying tea and two pies. "Dad, did you get the delivery sorted?" she asked. "You've been talking about nothing else all week."

Leah stared at the far end of the pitch. Harris said somebody at the office had finally agreed to investigate. "Probably a computer error," he added. "The woman was quite patient, actually. I wasn't in a pleasant mood."

"That was me," Leah said before she could decide whether it was wise.

For a moment, neither of them moved. His daughter looked from one face to the other, then held out a pie. "I think you've earned his."

Harris apologised for interrupting her afternoon. Leah said she couldn't give him an update at a football match, especially with her phone at home. He looked relieved. He didn't want another update; he wanted to know whether he had been rude. She said he had been frustrated, and left it there.

In the second half, North Town scored twice. Harris made an obvious effort not to celebrate too loudly, which irritated Leah more than cheering would have. She told him so. He laughed and stopped pretending.

On Monday, Leah found the delivery problem: their company had entered the wrong order size. She called to explain the refund. Harris thanked her, then asked whether she thought the goalkeeper would recover his confidence. She said she hoped so, but declined to investigate that as well.`,
  },
  {
    ...DEFAULTS,
    id: "en-l6-what-the-free-chair-cost", level: 6, createdAt: 260_019,
    title: "What the Free Chair Cost",
    blurb: "A free piece of furniture prompts an argument about money, time, and value.",
    topics: ["shopping", "daily-life", "feelings"],
    body: `The chair in my living room was free. I mention this whenever somebody admires it, although my brother says the claim needs a footnote. I borrowed his van to collect it, bought him lunch, and spent a Saturday cleaning it. According to him, a free chair that requires a van and a Saturday is simply a chair with a confusing price.

He has a point. The number on a label tells us how much money changes hands for an object. It doesn't describe every cost involved in obtaining and using it. A cheap table may need expensive transport. A printer may be affordable until it needs more ink. A free cupboard can become a problem if there is nowhere to put it.

Time matters too, although it is harder to compare with money. Collecting the chair meant giving up a walk I had planned with a friend. That doesn't mean I should multiply every hour by my working wage. I wasn't choosing between collecting furniture and earning extra pay. I was choosing between two ways of spending a day, and one of them involved carrying something heavy downstairs.

My brother's calculation also leaves out what I enjoyed. I liked meeting the woman who gave away the chair. She was moving into a smaller flat and wanted it to be used. I enjoyed cleaning the wooden arms and finding that the marks came off more easily than expected. Those hours were work, but they weren't all a loss.

The awkward part is separating pleasure from the desire to defend a decision. Once I had carried the chair home, I wanted it to have been a sensible choice. I became unusually interested in the price of similar chairs in shops. A high price made me feel clever, even though I had no intention of buying another one.

There is a practical way to think about the next free offer before accepting it. I can ask where it will go, how it will get there, what condition it is in, and whether I would want it without the word free attached. These questions do not produce a perfect answer. They do make an overflowing hallway less likely.

I still like the chair. It fits beside the window, and I sit there most evenings. My brother has stopped correcting me when I describe it as free, partly because I now tell the rest of the story without being asked.

Last week, he sent me a photograph of a free dining table advertised nearby. I asked whether he wanted to borrow anything. "Just your opinion," he replied. We discussed the staircase before discussing the table.`,
  },
];

export const EN_INTERMEDIATE_TEXTS: LibraryText[] = INTERMEDIATE_DRAFTS.map(({ topics: _topics, ...text }) => text);
export const EN_INTERMEDIATE_TOPICS: Record<string, string[]> = Object.fromEntries(
  INTERMEDIATE_DRAFTS.map((text) => [text.id, text.topics]),
);
