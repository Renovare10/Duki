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
];

export const EN_INTERMEDIATE_TEXTS: LibraryText[] = INTERMEDIATE_DRAFTS.map(({ topics: _topics, ...text }) => text);
export const EN_INTERMEDIATE_TOPICS: Record<string, string[]> = Object.fromEntries(
  INTERMEDIATE_DRAFTS.map((text) => [text.id, text.topics]),
);
