import type { LibraryText } from "../types";

type AdvancedReading = Pick<LibraryText, "id" | "level" | "title" | "blurb" | "body"> & {
  topics: string[];
};

/** Original readings for the L7–8 shelf; order fixes their permanent createdAt values. */
const READINGS: AdvancedReading[] = [
  {
    id: "en-l7-the-second-violin", level: 7,
    title: "The Second Violin",
    blurb: "A repairer's daughter must decide what an old instrument is worth.",
    topics: ["arts", "family", "work"],
    body: `The violin arrived in a supermarket bag, wrapped in a towel that smelled of oranges. Its owner, a thin man in a delivery uniform, placed it on my father's workbench as carefully as if it were asleep. He wanted to know whether we could repair the crack beside the bridge. My father adjusted his glasses and asked how soon he needed it.

"Friday," the man said. "My daughter has an audition. She borrowed this from her school, and I dropped it."

It was Wednesday afternoon. My father had three customers waiting for repairs, and his right hand had been troubling him all week. I watched him move his fingers beneath the bench before he answered. He could mend the crack, he said, but the glue would need time. The instrument might not be ready by Friday morning.

The man nodded without looking up. Then he asked about the price. When my father told him, he took out his phone, opened something on the screen, and closed it again. He would think about it. He left the violin with us because carrying it around on his remaining deliveries seemed worse than leaving it anywhere else.

After he went, I said we should do the job free. I had recently returned from university and was helping in the shop until I found other work. My father asked whether I had also decided to pay the electricity bill. I told him he was being unkind. He said nothing, which was more annoying than an argument.

On a shelf above his desk stood a black case I knew well. Inside was my old violin, the one I had stopped playing at sixteen. It was a plain student instrument, worth less than the cracked one on the bench, but its sound was warm and even. I suggested lending it to the girl for Friday. My father looked at me for a moment, then asked me to check the strings.

That evening I played for the first time in nearly five years. The notes were ugly at first. My fingers remembered where to go but arrived too late, like people running for a train. Slowly, a tune came back. My father continued working in the next room. When I finished, he called out that the A string was slightly flat. I laughed, though he was right.

The delivery driver returned on Thursday with his daughter. She was perhaps fourteen, with wet hair and a serious expression. We explained the arrangement. Her father began thanking us, but she asked if she could try the instrument before accepting it. I liked her immediately. She played a short passage, stopped, adjusted the bow, and tried again. Then she said it would do very well.

While her father filled in the loan form, she asked why I had given up playing. I started to explain about exams and being busy. These were the answers I usually gave. She waited, looking directly at me. Eventually I admitted that I had disliked being average at something I loved. She considered this and said her teacher's orchestra needed second violins. Apparently they were always short of them.

They brought the instrument back on Saturday. She had not won a place, but the panel had invited her to try again the following year. Her father paid a deposit for the repair and arranged to pay the rest in smaller amounts. My father had already discussed this with him by phone. Neither of them seemed interested in making a speech about it.

After closing time, I took the black case from its shelf. Inside, the girl had left a folded rehearsal schedule with an address circled in blue. I asked my father if he could manage the shop alone on Tuesday evenings. He flexed his sore hand, considered the question, and said he supposed he had managed for the previous five years. This time, before I began to play, I checked the A string.`
  },
  {
    id: "en-l7-why-the-street-stays-hot", level: 7,
    title: "Why the Street Stays Hot",
    blurb: "Two neighboring streets can feel very different on the same summer evening.",
    topics: ["science", "weather", "news"],
    body: `Walk through a city after sunset on a hot day. A narrow street lined with brick buildings may still feel like an oven, while a nearby park is already comfortable. Both places received sunlight during the afternoon. Yet they are releasing that heat in different ways, and at different speeds. The difference can affect how well people sleep, how much electricity they use, and whether it is safe to stay outside.

Many city surfaces absorb energy from sunlight and store it as heat. Roads, walls, and roofs can continue releasing this stored energy after the sun has gone down. In a district with closely packed buildings, less of the open sky is visible from street level. That arrangement can reduce the rate at which surfaces lose heat by radiation at night. Buildings can also block the wind that would otherwise carry warmer air away.

A park has a different collection of surfaces. Tree leaves provide shade, so less sunlight reaches the ground beneath them. Water also moves from soil through plants and into the air. This process, called transpiration, uses energy and can help cool the surrounding environment. Water evaporating directly from damp soil has a similar effect. Grass growing in very dry ground, however, cannot cool a place as effectively as healthy plants with enough water.

People add heat as well. Vehicle engines, factory equipment, and air conditioners release it outdoors. An air conditioner cools a room by moving heat outside, using electricity in the process. It makes the room more comfortable, but the outdoor unit does not produce a patch of cool air for the street. In crowded districts, many such units can contribute to the warmth around buildings.

These effects help create an urban heat island: a city area that is warmer than nearby areas with more vegetation or different development. The size of the difference changes with the weather, season, and time of day. It also varies within a city. A temperature reported at one weather station cannot describe every courtyard, bus stop, and apartment. Even two flats in the same building may have very different indoor conditions.

This matters when a city tries to protect people during extreme heat. A person waiting for a bus in direct sunlight receives energy from the sun as well as heat from surrounding surfaces. A shaded stop may feel much safer even when the measured air temperature is nearly the same. For this reason, air temperature alone is not a complete measure of the heat a human body experiences.

Planting trees can help, but putting a young tree in a small hole is only the beginning. Roots need room, the species must suit the climate, and someone must care for the tree as it grows. A large tree that dies during a drought provides less protection than a smaller tree that survives. Cities also have to consider water supplies and avoid damaging pipes or making pavements difficult to use.

Other changes include lighter roofs that reflect more sunlight, shading over walking routes, and building designs that reduce unwanted heat indoors. No single change works equally well everywhere. A surface that reflects sunlight away from a roof might direct some of it toward neighboring windows. A useful plan checks these effects rather than assuming that every bright surface will make every person cooler.

Residents can contribute observations that official maps miss. They know which bedrooms remain hot all night, which public fountains stop working, and where older neighbors have to wait outside. Temperature measurements become more useful when planners connect them with such details. A map can show a hot district; a conversation can identify the broken shade that people need repaired first.

On the next summer evening, notice where the pavement is still warm beneath your shoes. Look up at the sky between the buildings, then compare that view with the one from an open field. The evening air has a history. Much of the heat you feel arrived hours earlier, when the sun was still high.`
  },
  {
    id: "en-l7-the-wrong-end-of-the-route", level: 7,
    title: "The Wrong End of the Route",
    blurb: "A trainee bus driver discovers why one passenger refuses to get off.",
    topics: ["travel", "work", "feelings"],
    body: `On my third morning as a bus driver, I reached the final stop with one passenger still aboard. She was sitting behind the empty space for wheelchairs, holding a paper bag against her knees. I switched off the engine and told her we had arrived. She looked through the window, then back at me. This was not where she wanted to be.

I had spent the whole route worrying about small mistakes. At the market I had stopped too far from the pavement. Outside the hospital I had shut the doors before a man with a walking stick reached them, then opened them again in embarrassment. Now I wondered whether I had missed a turn. I checked the route number on the dashboard. It was correct.

The woman showed me an appointment letter. She needed the eye clinic on West Road. We were at the sports center on East Road, several kilometers away. She said the number 18 had always taken her to the clinic. Until the previous month, that was true. A route change had sent it through the new housing district instead. The replacement service was the number 31.

I explained this twice, each time less successfully. She became quiet. I recognized the expression because my mother wore it when a machine at the railway station rejected her payment. It was the look of someone trying not to cause trouble while realizing that everyone nearby was waiting for her to disappear.

My break was twelve minutes long. The clinic appointment was in twenty. I thought about driving her there. The road was wide enough, and there were no other passengers. For a moment it seemed obvious. Then I remembered the controller's warning: a bus was not a private car, and we could not invent routes. I used the radio to explain the situation.

The controller asked whether the passenger was safe and whether she needed medical assistance. I said she seemed well, just worried. He told me to stay at the stop while he checked the connecting services. Through the open front door came the sounds of a swimming lesson. Children were shouting behind the sports center wall. The woman folded her letter until the clinic address disappeared inside it.

"My son offered to come," she said. "I told him I could manage a bus."

I admitted that I had been driving one for only three days and was not sure I could manage it either. She gave a short laugh. Then the radio sounded. The 31 would leave from the next street in eight minutes, but its journey to the clinic would take half an hour. There was no way to reach her appointment on time by bus.

I asked if she wanted help calling the clinic. She handed me the letter, then changed her mind and took out her own phone. I pointed to the number. While she spoke to the receptionist, I drew a small map on the back of an old duty sheet. I marked our stop, the crossing with traffic lights, and the shelter for the 31.

The receptionist said she could still be seen, though she might have to wait. Relief made the woman suddenly talkative. She told me about the trouble with her left eye, her son's new baby, and the mistake in the bus company's printed leaflet. The controller asked over the radio whether I was ready to begin the return service. My break had ended.

At the door, the woman studied my map. "You draw like my grandson," she said. I apologized. "He's six," she added, and smiled before stepping down.

I watched until she reached the crossing, then started the engine. That afternoon I reported the outdated leaflet to my supervisor. I wanted the story to end with a corrected notice appearing the next morning, but it took two weeks. In the meantime, I learned to ask passengers for destinations when they seemed uncertain. I also learned where the connecting services stopped. These were not questions on the driving test, although I needed the answers almost every day.`
  },
  // NEXT_READING
];

export const EN_ADVANCED_TEXTS: LibraryText[] = READINGS.map(({ topics: _topics, ...text }, index) => ({
  ...text,
  lang: "en",
  kind: "sample",
  category: "graded",
  featured: false,
  createdAt: 270_000 + index,
  readAt: null,
  bookmark: null,
  source: "Original (Duki) · AI-drafted",
}));

export const EN_ADVANCED_TOPICS: Record<string, string[]> = Object.fromEntries(
  READINGS.map(({ id, topics }) => [id, topics]),
);
