import type { LibraryText } from "../types";

/**
 * English Wikipedia adaptations for learners, written as complete inline articles.
 * Each sourceUrl credits the source article and its contributors via page history.
 * Adaptations are shared under CC BY-SA: https://creativecommons.org/licenses/by-sa/4.0/
 * IDs and createdAt values are permanent; append new articles without renumbering.
 */
type EnglishWikiArticle = {
  id: string;
  level: number;
  title: string;
  blurb: string;
  wikiTitle: string;
  sourceUrl: string;
  createdAt: number;
  topics: string[];
  body: string;
};

const EN_WIKI_ARTICLES: EnglishWikiArticle[] = [
  {
    id: "en-wiki-giant-panda", level: 4, title: "Giant Panda",
    blurb: "A bear with a bamboo diet and a useful extra thumb.",
    wikiTitle: "Giant panda", sourceUrl: "https://en.wikipedia.org/wiki/Giant_panda",
    createdAt: 220_000, topics: ["encyclopedia", "nature"],
    body: `The giant panda is a bear that lives in China. It has white fur with black patches around its eyes, ears, legs, and shoulders. Wild pandas live in mountain forests, where they find the bamboo they eat.

Bamboo makes up almost all of a panda's diet. Its strong teeth help it break the hard stems. A panda also has a special wrist bone that works a little like a thumb. This helps it hold bamboo while it eats.

Pandas usually live alone. They leave smells on trees and rocks to send messages to other pandas. They can climb trees, and they do not sleep through the whole winter as some bears do.

A baby panda is very small when it is born. It has no teeth and cannot see. Its mother cares for it as it grows. Protecting forests gives these bears space to feed and raise their young.`,
  },
  {
    id: "en-wiki-penguin", level: 4, title: "Penguin",
    blurb: "A bird whose wings are better for swimming than flying.",
    wikiTitle: "Penguin", sourceUrl: "https://en.wikipedia.org/wiki/Penguin",
    createdAt: 220_001, topics: ["encyclopedia", "nature"],
    body: `Penguins are birds, but they cannot fly. Their wings work like flippers. They use them to move through the sea, where they catch fish, squid, and other small animals.

A penguin's back is dark, and its front is light. These colors help hide it in the water. From above, the dark back is hard to see against the deep sea. From below, the light front looks more like the bright surface.

Not all penguins live among ice and snow. Some live in warmer places. The Galapagos penguin even lives near the equator. Almost all penguins live in the southern half of the world.

Penguins come onto land or ice to have their young. Most kinds lay two eggs, but emperor penguins lay just one. A male emperor penguin keeps the egg warm on his feet while the female goes to sea to feed.`,
  },
  {
    id: "en-wiki-moon", level: 4, title: "The Moon",
    blurb: "Why the Moon seems to change shape during the month.",
    wikiTitle: "Moon", sourceUrl: "https://en.wikipedia.org/wiki/Moon",
    createdAt: 220_002, topics: ["encyclopedia", "science"],
    body: `The Moon is Earth's natural companion in space. It travels around Earth, and we often see it in the night sky. Sometimes we can see it during the day too.

The Moon does not make its own light like the Sun. We see sunlight that comes back from its surface. As the Moon moves around Earth, we see different amounts of its sunlit half. That is why it seems to change shape. It takes about a month to go through these changes.

The Moon also turns as it travels. It turns at just the right speed to keep nearly the same side facing Earth. The other side is not always dark. It gets sunlight too.

The Moon's surface has many round holes called craters. Rocks from space made many of them when they hit the ground. In 1969, people first walked on this surface during the Apollo 11 mission.`,
  },
  {
    id: "en-wiki-bread", level: 4, title: "Bread",
    blurb: "Flour, water, and the tiny living things that make dough rise.",
    wikiTitle: "Bread", sourceUrl: "https://en.wikipedia.org/wiki/Bread",
    createdAt: 220_003, topics: ["encyclopedia", "food", "culture"],
    body: `People have made bread for thousands of years. The basic ingredients are simple: flour and water. Mix them together, and they form dough. Baking changes this soft mixture into food that people can carry, share, and eat with many meals.

Some bread is flat. Other bread rises before or during baking. Many bakers add yeast to make this happen. Yeast is a tiny living thing that uses sugars in the dough. It makes gas, which forms bubbles. These bubbles help make the bread light.

Sourdough bread uses a mixture of flour and water that contains living yeast and bacteria. Bakers keep some of this mixture to help make the next loaf. It can also give the bread a sour taste.

Bread looks different around the world. A loaf may have a hard outside and a soft middle. Flatbread may be thin enough to wrap around other food. The grain and the way people make it change the result.`,
  },
  {
    id: "en-wiki-bicycle", level: 4, title: "Bicycle",
    blurb: "How a machine with two wheels became everyday transport.",
    wikiTitle: "Bicycle", sourceUrl: "https://en.wikipedia.org/wiki/Bicycle",
    createdAt: 220_004, topics: ["encyclopedia", "science", "travel"],
    body: `A bicycle usually has two wheels, one behind the other. The rider sits on a seat, holds the handlebars, and pushes the pedals. On most bicycles, a chain carries this movement to the back wheel.

The bicycle did not appear in its modern form all at once. In 1817, Karl von Drais showed a two-wheeled machine without pedals. The rider moved it by pushing against the ground with their feet.

Later bicycles had pedals on a large front wheel. Some had a very big front wheel and a small back wheel. Their high seats made them difficult to get on and off. A fall could be dangerous.

By the late nineteenth century, the safety bicycle had become a better choice. Its wheels were closer in size, and a chain drove the back wheel. Modern bicycles still often have this shape. People use them to get to work, carry shopping, exercise, and race.`,
  },
  {
    id: "en-wiki-octopus", level: 5, title: "Octopus",
    blurb: "Eight arms, three hearts, and several ways to escape.",
    wikiTitle: "Octopus", sourceUrl: "https://en.wikipedia.org/wiki/Octopus",
    createdAt: 220_005, topics: ["encyclopedia", "nature", "science"],
    body: `An octopus has eight arms and a soft body. It belongs to the same animal group as squid and cuttlefish. It has no hard outer shell, so it can squeeze through surprisingly small openings. Its hard beak, at the center of its arms, limits how narrow an opening it can pass through.

The arms have suckers that help the animal hold objects and move across the sea floor. An octopus can also move by forcing water out through a tube in its body. This pushes it in the opposite direction and helps it escape quickly.

Many octopuses can change their skin color to match their surroundings. Some can change its texture too. A hungry animal may swim past without noticing them. If hiding fails, an octopus may release a cloud of ink and swim away.

Inside its body are three hearts. Two move blood through the gills, where it takes in oxygen. The third sends blood around the rest of the body.

Octopuses can learn and solve problems. Their arms contain many nerve cells, so the control of movement is spread through the body rather than handled entirely by the brain.`,
  },
  {
    id: "en-wiki-honey-bee", level: 5, title: "Honey Bee",
    blurb: "Inside a colony that stores flowers' sugar for later.",
    wikiTitle: "Honey bee", sourceUrl: "https://en.wikipedia.org/wiki/Honey_bee",
    createdAt: 220_006, topics: ["encyclopedia", "nature", "food"],
    body: `A jar of honey begins with bees visiting flowers. They collect nectar, a sweet liquid, and bring it back to their colony. They process the nectar and reduce its water content to make honey. The colony stores this food in wax cells, ready for times when flowers are hard to find.

A honey bee colony contains different kinds of bees. The queen lays eggs. Most of the other females are workers, which collect food, care for young bees, and do other jobs. The males are called drones, and their main role is to mate with queens.

Workers build the comb from wax they produce themselves. Its cells have six sides. Some cells hold food; others are used for raising young bees.

In cold weather, bees can gather closely together inside their nest. The workers use their muscles to make heat and eat stored honey for energy. They move between the warmer center and the cooler outside of the group.

Honey bees also carry pollen between flowers. This helps many plants produce seeds and fruit. Honey is useful to people, but the bees' work in fields and orchards matters too.`,
  },
  {
    id: "en-wiki-iceland", level: 5, title: "Iceland",
    blurb: "An island where glaciers sit above a restless underground world.",
    wikiTitle: "Iceland", sourceUrl: "https://en.wikipedia.org/wiki/Iceland",
    createdAt: 220_007, topics: ["encyclopedia", "travel", "nature"],
    body: `Iceland is an island country in the North Atlantic Ocean, close to the Arctic Circle. Its capital is Reykjavik. Many people live in or near the capital, while large parts of the island's interior have few residents.

The name suggests a country covered only in ice, but Iceland has volcanoes, hot springs, and broad areas of old lava. It lies on a boundary where two huge sections of Earth's outer layer move apart. Heat from below the ground warms water, and Icelanders use this energy to heat buildings and produce electricity.

Glaciers cover parts of the island. Rivers carry water from the ice toward the coast. There are also mountains and waterfalls, and some volcanoes lie beneath glaciers.

The surrounding ocean affects the climate. Winters are milder than the island's northern position might suggest, although summers remain cool.

Iceland's history includes settlement by Norse people more than a thousand years ago. The country later came under Norwegian and then Danish rule. It became a republic in 1944. Today its parliament is called the Althing, a name with roots in the island's early history.`,
  },
  {
    id: "en-wiki-tea", level: 5, title: "Tea",
    blurb: "How one plant produces green tea, black tea, and oolong.",
    wikiTitle: "Tea", sourceUrl: "https://en.wikipedia.org/wiki/Tea",
    createdAt: 220_008, topics: ["encyclopedia", "food", "culture"],
    body: `Green tea and black tea look and taste different, yet both come from the same plant species, Camellia sinensis. Oolong comes from this plant too. The way the leaves are treated after picking helps decide what kind of tea they become.

When picked leaves are damaged, substances inside them react with oxygen. This process, called oxidation, changes their color and flavor. Makers of green tea heat the leaves early to stop much of this change. Black tea is allowed to oxidize much further. Oolong is partly oxidized before the process is stopped.

People have been drinking tea in China for many centuries. During the Tang dynasty, it became an important social drink. Tea drinking spread to other parts of Asia and later became common in Europe and elsewhere.

People prepare it in different ways. Some drink it plain, while others add milk, sugar, or spices. It can be served hot or cold.

The word tea is also used for drinks made from other plants, such as mint. These are often called herbal teas. They do not come from the tea plant, even though people prepare them in a similar way.`,
  },
  {
    id: "en-wiki-braille", level: 5, title: "Braille",
    blurb: "A writing system that readers feel with their fingertips.",
    wikiTitle: "Braille", sourceUrl: "https://en.wikipedia.org/wiki/Braille",
    createdAt: 220_009, topics: ["encyclopedia", "science", "culture"],
    body: `A braille page carries patterns of raised dots. Readers move their fingers over these patterns to read by touch. Braille gives blind and partially sighted people a way to read and write without depending on printed letters.

The system takes its name from Louis Braille, who grew up in France and lost his sight after a childhood accident. In 1824, when he was fifteen, he developed an early version of his system. He improved an existing method that used larger groups of dots.

A standard braille cell has six possible dot positions, arranged in two columns of three. Different combinations can represent letters, punctuation, or other signs. Some combinations stand for whole words or parts of words. The meanings depend on the language and the braille system being used.

Braille is therefore not a separate spoken language. People use it to write many languages. There are also braille systems for music and mathematics.

Readers can use paper or an electronic display with dots that rise and fall. Such a display can connect to a computer or phone. Although speech software can read text aloud, braille allows direct contact with spelling and punctuation, just as print does for sighted readers.`,
  },
  {
    id: "en-wiki-coral-reef", level: 6, title: "Coral Reef",
    blurb: "Tiny animals build structures that shelter a crowded sea community.",
    wikiTitle: "Coral reef", sourceUrl: "https://en.wikipedia.org/wiki/Coral_reef",
    createdAt: 220_010, topics: ["encyclopedia", "nature", "science"],
    body: `A coral reef may look like an underwater garden, but the animals that build it are not plants. They are small creatures called polyps. Many reef-building polyps live together in colonies and produce hard skeletons made of calcium carbonate. Over time, these skeletons help form the reef's structure.

Many shallow-water corals have a close relationship with microscopic algae living inside their tissues. The algae use sunlight to make food and pass some of it to the coral. The coral provides shelter and substances the algae need. This partnership helps explain why many reefs grow best in clear, shallow water where sunlight can reach them.

The reef's uneven surface creates many hiding places. Fish can shelter in gaps, and other animals live on or within the structure. Reefs also support fishing and tourism, while their physical shape can reduce the force of waves reaching a shore.

When the water becomes unusually warm, stressed corals may lose their algae. Their pale skeletons then show through the tissues, making them look white. This is called coral bleaching. A bleached coral is not necessarily dead, but it has lost an important source of food. It may recover if conditions improve; prolonged stress can kill it.

Pollution, destructive fishing, and changes in ocean conditions threaten reefs. Their survival depends on both the living polyps and the conditions that allow the whole community to function.`,
  },
  {
    id: "en-wiki-water-cycle", level: 6, title: "The Water Cycle",
    blurb: "Water takes many routes between the ocean, air, ice, and ground.",
    wikiTitle: "Water cycle", sourceUrl: "https://en.wikipedia.org/wiki/Water_cycle",
    createdAt: 220_011, topics: ["encyclopedia", "science", "weather"],
    body: `Rain falling on a mountain may eventually reach the sea, but its journey need not be direct. Some water runs into streams. Some enters the soil, and some becomes part of a glacier. The water cycle describes the movement of water between these different places and forms.

Energy from the Sun helps liquid water evaporate from oceans, lakes, and land. Evaporation turns it into water vapor, an invisible gas. Plants also release water vapor through their leaves. Together, these processes send large amounts of water into the atmosphere.

As moist air cools, some vapor can condense into tiny liquid droplets. Clouds contain these droplets, ice crystals, or both. When particles grow large enough, water falls as precipitation, including rain or snow.

Water reaching the ground may flow over the surface or soak into it. Below the surface, it can move through spaces in soil and rock. This groundwater can later feed springs and rivers. Other water remains stored as ice for a very long time.

A diagram often draws the cycle as a simple circle. Real water follows many paths, and different parts of the journey take very different amounts of time. Human activities can alter these paths. Pumping groundwater removes stored water, while paving land changes how much rain soaks into the soil and how much runs away over the surface.`,
  },
];

export const EN_WIKI_TOPICS: Record<string, string[]> = Object.fromEntries(
  EN_WIKI_ARTICLES.map(({ id, topics }) => [id, topics]),
);

export const EN_WIKI_TEXTS: LibraryText[] = EN_WIKI_ARTICLES.map(({ topics: _topics, ...article }) => ({
  ...article,
  lang: "en",
  kind: "wiki",
  category: "wiki",
  featured: false,
  readAt: null,
  bookmark: null,
  source: "Adapted from English Wikipedia, CC BY-SA",
}));
