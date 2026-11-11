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
