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
  {
    id: "en-wiki-pompeii", level: 6, title: "Pompeii",
    blurb: "A buried Roman city preserves evidence of ordinary life.",
    wikiTitle: "Pompeii", sourceUrl: "https://en.wikipedia.org/wiki/Pompeii",
    createdAt: 220_012, topics: ["encyclopedia", "history", "travel"],
    body: `Pompeii was a city near Naples in what is now Italy. In AD 79, Mount Vesuvius erupted and buried it under volcanic material. The disaster killed many people and ended the city's life as a Roman community. It also preserved evidence that would normally have disappeared.

Archaeologists have uncovered houses, streets, shops, and public buildings. Wall paintings show how some residents decorated their rooms. Writing scratched or painted on walls records everyday messages as well as political life. These traces help historians look beyond the rulers and battles described in ancient books.

The city was not made up only of wealthy households. Its buildings and businesses reveal differences in work, living conditions, and social position. Studying a bakery or a small home can answer different questions from studying a grand house.

Some of the most familiar objects from Pompeii are casts of people who died there. As buried bodies decayed, they left spaces in the surrounding material. Excavators filled some of these spaces to record the shapes. The casts are not stone bodies created by lava.

Uncovering the city has also exposed it to damage from weather and visitors. Earlier excavation sometimes destroyed evidence through careless digging. Modern work therefore includes conserving what has already been found. At Pompeii, finding more of the past and keeping it safe are separate tasks that must be considered together.`,
  },
  {
    id: "en-wiki-wangari-maathai", level: 6, title: "Wangari Maathai",
    blurb: "The Kenyan scientist who linked tree planting with women's rights.",
    wikiTitle: "Wangari Maathai", sourceUrl: "https://en.wikipedia.org/wiki/Wangari_Maathai",
    createdAt: 220_013, topics: ["encyclopedia", "biography", "nature"],
    body: `Wangari Maathai was a Kenyan scientist and environmental campaigner. Born in 1940, she studied biology in the United States before returning to Kenya. She earned a doctorate at the University of Nairobi and later taught there. At the university, she also argued for equal benefits for women on the staff.

Her best-known project began in 1977. The Green Belt Movement encouraged women to grow and plant trees. Participants collected seeds of local trees and raised seedlings in nurseries. Women could receive a small payment for seedlings that were later planted elsewhere.

Tree planting addressed practical problems caused by environmental damage. Trees could provide useful materials and help protect the land. The movement also gave women a way to organize, earn money, and take part in decisions affecting their communities.

Maathai's campaigning brought her into conflict with political leaders. She opposed the destruction of public green spaces and supported democratic rights. Her public work involved protests and arrests as well as planting trees. She later served in Kenya's parliament and as an assistant minister responsible for environmental issues.

In 2004, she became the first African woman to receive the Nobel Peace Prize. The award recognized connections between environmental protection, democracy, and peace. Maathai died in 2011, leaving a movement that had made local tree planting part of a much larger public effort.`,
  },
  {
    id: "en-wiki-refrigeration", level: 6, title: "Refrigeration",
    blurb: "Keeping food cold means moving heat somewhere else.",
    wikiTitle: "Refrigeration", sourceUrl: "https://en.wikipedia.org/wiki/Refrigeration",
    createdAt: 220_014, topics: ["encyclopedia", "science", "food"],
    body: `A refrigerator keeps its inside cooler than the surrounding room. It does this by moving heat from the inside to the outside. The machine needs energy because heat does not normally flow in that direction by itself.

In a common refrigerator, a substance called a refrigerant travels around a closed system. In one part, it absorbs heat as it changes from liquid to gas. A compressor raises the pressure of the gas. Elsewhere, the refrigerant releases heat to the room and becomes liquid again. The cycle repeats, carrying more heat away from the food compartment.

People kept food and drinks cool long before household refrigerators existed. They stored snow and ice in insulated places or used naturally cool spaces. During the nineteenth century, businesses transported natural ice over long distances. Mechanical cooling gradually reduced the need to collect fresh supplies of ice.

Refrigeration changed more than kitchens. Cooled railway cars, ships, and trucks allowed food to travel farther. Shops could stock products that would otherwise spoil before reaching customers. Farms and fishing businesses gained access to more distant markets.

Cold storage slows many of the processes that spoil food, but it does not make food last forever. Modern food distribution depends on maintaining suitable temperatures throughout transport and storage. A working refrigerator at the final destination cannot undo every problem that occurred earlier in the journey.`,
  },
  {
    id: "en-wiki-silk-road", level: 7, title: "The Silk Road",
    blurb: "A network of exchanges, not a single road from China to Rome.",
    wikiTitle: "Silk Road", sourceUrl: "https://en.wikipedia.org/wiki/Silk_Road",
    createdAt: 220_015, topics: ["encyclopedia", "history", "travel"],
    body: `The Silk Road was not one continuous highway with a clear beginning and end. The name describes a changing network of trade routes linking communities across Asia and connecting them with regions farther west. Historians sometimes prefer the plural term Silk Routes because it better reflects this arrangement.

Chinese silk gave the network its modern name, but merchants carried many other goods. Horses, precious metals, and manufactured products moved through different sections. Traders commonly bought and sold goods along only part of a route. An object could therefore cross a continent through a series of exchanges without a single merchant accompanying it all the way.

The Han dynasty's expansion and diplomatic missions into Central Asia helped develop long-distance connections. Later empires influenced the security of travel and the places where commerce flourished. Mountains and deserts made journeys difficult, while settlements with water and supplies offered essential stopping points.

Trade also depended on people whose importance can disappear in a simple story about China and Rome. Central Asian merchants and local communities organized transport, linked markets, and helped travelers communicate. The network had many active centers rather than merely two ends.

Ideas traveled with people. Buddhism spread through parts of Asia along these connections, and scientific knowledge circulated between societies. Disease could travel too; the movement of people and goods helped infections spread across long distances.

The term Silk Road became popular long after the routes' ancient history. It is a useful label, but it can make a diverse and uneven system look more unified than it was. The actual exchanges changed as political power, commercial opportunities, and available routes changed.`,
  },
  {
    id: "en-wiki-galapagos-islands", level: 7, title: "The Galapagos Islands",
    blurb: "Volcanic islands whose isolation helped produce unusual wildlife.",
    wikiTitle: "Galápagos Islands", sourceUrl: "https://en.wikipedia.org/wiki/Gal%C3%A1pagos_Islands",
    createdAt: 220_016, topics: ["encyclopedia", "nature", "travel"],
    body: `The Galapagos Islands lie in the eastern Pacific Ocean, roughly nine hundred kilometers west of mainland South America. They belong to Ecuador and straddle the equator. Although distant from the continent, they support communities of people as well as wildlife found nowhere else.

The islands formed through volcanic activity. They sit above a region where hot material rises from deep within Earth. As the oceanic plate moves, the locations of volcanic activity and the growing islands change relative to one another. Some islands still have active volcanoes.

Reaching an isolated island is difficult for many organisms. Those that arrive may encounter environments and competitors unlike those on the mainland. Over many generations, separated populations can develop different characteristics. The Galapagos became famous for this process and for animals such as giant tortoises and marine iguanas.

Charles Darwin visited during the voyage of HMS Beagle in 1835. His observations of island wildlife later contributed to his thinking about evolution. The theory did not arrive as a complete explanation the moment he stepped ashore; he continued examining evidence after the voyage.

Human arrivals have also changed the islands. Introduced animals, including goats and rats, damaged habitats and threatened native species. An animal that causes little difficulty in one place can have severe effects in a community without defenses against it.

Much of the archipelago is protected through a national park and marine reserve. Conservation work includes controlling introduced species and managing tourism. The islands' isolation helped shape their wildlife, but it cannot by itself protect that wildlife from changes brought by visitors, settlers, and ships.`,
  },
  {
    id: "en-wiki-fermentation", level: 7, title: "Fermentation",
    blurb: "How cells obtain energy while changing the foods around them.",
    wikiTitle: "Fermentation", sourceUrl: "https://en.wikipedia.org/wiki/Fermentation",
    createdAt: 220_017, topics: ["encyclopedia", "science", "food"],
    body: `Fermentation helps explain why bread dough rises and why yogurt tastes sour. In each case, living cells break down substances in their surroundings and release products that change the food. People used these processes long before they understood the microorganisms responsible.

In biology, fermentation is a way for cells to obtain energy from organic compounds without relying on oxygen as the final receiver of electrons. This distinguishes it from the familiar form of cellular respiration that uses oxygen. The detailed chemistry varies between organisms, so fermentation does not always produce the same substances.

Yeast can turn sugars into ethanol and carbon dioxide. In bread dough, the gas creates bubbles that help the dough expand. In beer and wine production, the alcohol is a desired product. Different conditions and ingredients lead to different results even when related organisms are involved.

Bacteria used in yogurt production convert milk sugar into lactic acid. The increasing acidity helps change the milk's texture and gives yogurt its characteristic sourness. Other fermented foods depend on different combinations of microbes and raw materials.

Fermentation is not restricted to food factories or kitchens. Microbes carry it out in natural environments, including animal digestive systems. Human muscle cells can also use a fermentation pathway when energy demand exceeds what oxygen-dependent processes can supply.

Everyday use of the word is broader than its strict biochemical meaning. An industrial fermentation process may refer generally to growing microorganisms to manufacture a useful product, even when oxygen is supplied. Understanding the context matters: the name on a food process and the name of a cellular energy pathway do not always describe exactly the same thing.`,
  },
  {
    id: "en-wiki-ada-lovelace", level: 7, title: "Ada Lovelace",
    blurb: "Notes on an unbuilt machine imagined more than arithmetic.",
    wikiTitle: "Ada Lovelace", sourceUrl: "https://en.wikipedia.org/wiki/Ada_Lovelace",
    createdAt: 220_018, topics: ["encyclopedia", "biography", "science"],
    body: `In the nineteenth century, a computer could be imagined as a machine of wheels and mechanical parts rather than electronic circuits. Ada Lovelace studied one such design: Charles Babbage's Analytical Engine. Her writing explored both how it might calculate and what calculation could represent.

Born in England in 1815, Lovelace was the daughter of the poet Lord Byron and Anne Isabella Milbanke. She studied mathematics and met Babbage in 1833. Their long friendship gave her opportunities to discuss his proposed machines and their possibilities.

In 1843, she published an English translation of an article about the Analytical Engine by the Italian engineer Luigi Menabrea. She added extensive notes of her own. One described a sequence of operations for calculating Bernoulli numbers, a particular family of numbers used in mathematics.

This sequence is often called the first published computer program, and Lovelace is frequently described as the first computer programmer. Historians debate how these descriptions should account for Babbage's earlier work and their collaboration. The significance of her notes does not depend entirely on assigning a single person the title of first.

Lovelace recognized that a machine manipulating symbols might work with more than quantities. If musical relationships could be expressed in suitable terms, she suggested, such a machine might work with music. This was an unusually broad view of a device commonly discussed as a calculating engine.

The Analytical Engine was not completed in her lifetime, so her procedure was not run on the intended machine. Lovelace died in 1852. The programming language Ada was later named in her honor.`,
  },
  {
    id: "en-wiki-printing-press", level: 7, title: "The Printing Press",
    blurb: "Reusable type and a press changed the economics of making books.",
    wikiTitle: "Printing press", sourceUrl: "https://en.wikipedia.org/wiki/Printing_press",
    createdAt: 220_019, topics: ["encyclopedia", "history", "science"],
    body: `A printing press applies pressure to transfer ink from a prepared surface onto paper or another material. In Europe, Johannes Gutenberg developed a successful system using movable metal type around 1440. His achievement combined several technologies into a practical method of producing many copies of a text.

Printing itself was much older. East Asian printers had long used carved wooden blocks. In eleventh-century China, Bi Sheng developed movable type made from baked clay. Korea later used metal movable type; the surviving book Jikji was printed with it in 1377. Gutenberg did not invent the general idea of arranging reusable characters to form a page.

His system brought together a press, cast metal letters, suitable ink, and a reliable way to make more type. A printer arranged the individual characters, inked them, and pressed paper against them. Once a print run was finished, the letters could be rearranged for another text.

Preparing a page still required skilled labor. The advantage became clear when producing many copies: workers did not need to write each copy by hand. The relatively small number of letters in the Latin alphabet also made a complete set of type easier to supply than a set covering thousands of Chinese characters.

As presses spread, books became more widely available, and religious and scientific arguments could reach larger audiences. This change did not make every book cheap immediately or give everyone the ability to read. It altered the costs and speed of reproduction, creating conditions in which written ideas could circulate much more extensively.

Later presses used iron construction, steam power, and rotating cylinders to increase output further.`,
  },
  {
    id: "en-wiki-plate-tectonics", level: 8, title: "Plate Tectonics",
    blurb: "A moving outer shell explains patterns in mountains and earthquakes.",
    wikiTitle: "Plate tectonics", sourceUrl: "https://en.wikipedia.org/wiki/Plate_tectonics",
    createdAt: 220_020, topics: ["encyclopedia", "science", "nature"],
    body: `Earth's surface appears stable on the scale of an ordinary walk, yet its rigid outer shell is divided into moving plates. These plates include the crust and the uppermost mantle, a combination called the lithosphere. A plate may carry ocean floor, continental land, or both; its boundaries do not simply follow the edges of continents.

Plate motion is generally measured in centimeters per year. Over millions of years, such small annual movements can open oceans or bring continents together. The behavior of neighboring plates also explains why earthquakes and volcanoes are concentrated in particular belts rather than scattered evenly across the globe.

At a divergent boundary, plates separate. Beneath an ocean, material rising between them can form new crust along a spreading ridge. At a convergent boundary, plates approach one another. Dense oceanic lithosphere may bend downward into the mantle in a process called subduction. Continental collisions can instead thicken and deform the crust, producing mountain ranges. Where plates slide past each other, the boundary is called transform.

These movements do not require plates to float on a worldwide ocean of liquid rock. Much of the mantle is solid, but under high temperatures and pressure it can deform and flow over geological time. Forces associated with sinking slabs and differences in density contribute to plate motion. Their relative importance varies with the setting.

The modern theory developed from earlier ideas about continental drift. Matching fossils and geological formations on separated continents suggested that those continents had once been joined. Evidence from the ocean floor, including patterns associated with spreading, helped establish plate tectonics during the twentieth century.

The theory links observations that previously seemed separate: the creation of oceanic crust, the destruction of old lithosphere, and the changing arrangement of continents. It also explains why a quiet-looking landscape can have a history of major movement.`,
  },
  {
    id: "en-wiki-mangrove", level: 8, title: "Mangroves",
    blurb: "Coastal trees cope with salt, shifting tides, and oxygen-poor mud.",
    wikiTitle: "Mangrove", sourceUrl: "https://en.wikipedia.org/wiki/Mangrove",
    createdAt: 220_021, topics: ["encyclopedia", "nature", "science"],
    body: `A tree growing at the edge of a tropical sea faces problems that an inland tree may never encounter. Its roots can stand in salty water and waterlogged mud, while the tide repeatedly changes its surroundings. Mangroves are trees and shrubs adapted to these conditions. The word also describes the coastal vegetation they form.

Mangroves are not all members of one closely related group. Different plant families have independently evolved ways to occupy this environment. Their similarities are examples of convergent evolution: comparable pressures have produced comparable solutions in distinct lineages.

Salt and oxygen pose separate difficulties. Depending on the species, mangroves can limit the salt entering through their roots or remove some salt through their leaves. Some have specialized roots that project above the mud and allow gases to move between the atmosphere and submerged tissues. A conspicuous root system may also help anchor a tree in unstable sediment.

These adaptations affect other organisms. The roots create shelter for young fish and invertebrates, while trapped sediment contributes to the development of the coastal habitat. Mangrove forests can reduce wave energy and help protect shorelines, though their effectiveness depends on the width and condition of the forest and the force of the event. They do not provide unlimited protection against every storm.

Mangrove soils can also store substantial amounts of carbon. Damage to these forests therefore affects both local habitats and carbon storage. Clearing for coastal development and other uses has reduced mangrove cover in many places.

Restoration requires more than placing seedlings wherever a coastline is bare. Tidal flow, elevation, sediment, and the choice of species influence whether trees survive. Working with local communities also matters because fishing, land use, and conservation take place in the same inhabited landscape.`,
  },
  {
    id: "en-wiki-rosetta-stone", level: 8, title: "The Rosetta Stone",
    blurb: "Three scripts on one decree helped scholars read ancient Egyptian.",
    wikiTitle: "Rosetta Stone", sourceUrl: "https://en.wikipedia.org/wiki/Rosetta_Stone",
    createdAt: 220_022, topics: ["encyclopedia", "history", "culture"],
    body: `The Rosetta Stone records a decree issued in Egypt in 196 BC on behalf of King Ptolemy V. Its historical value comes partly from repetition: substantially the same message appears in three scripts. Two versions use the Egyptian language, written in hieroglyphic and Demotic scripts; the third is in Ancient Greek.

Calling these three different languages is therefore misleading. A script is a system for representing language in writing. The stone gave scholars several written forms to compare, including Greek, which they could already read. This supplied clues to Egyptian writing whose meaning had been lost.

The object is a broken slab of granodiorite, originally part of a larger monument. It was eventually reused as building material near the town of Rashid, known in European languages as Rosetta. A French officer found it in 1799 during France's invasion of Egypt. After the British defeated the French, it passed into British possession under the terms of the military surrender and was taken to London. It has been displayed at the British Museum since 1802.

Decipherment required more than matching a few pictures to Greek words. Scholars had to determine how Egyptian signs represented language. Thomas Young made important advances, and Jean-François Champollion announced a major breakthrough in 1822. Recognizing that signs could represent sounds, including in native Egyptian words, helped move interpretation beyond the assumption that hieroglyphs were purely symbolic pictures.

The work continued after that announcement. Reading inscriptions confidently required further comparison and study, not simply one successful translation. Other copies of related decrees later provided additional evidence.

The stone's surviving text concerns royal authority and the relationship between the ruler and priests. Its fame now rests less on that decree's particular instructions than on the evidence its parallel versions supplied for understanding a much larger body of writing.`,
  },
  {
    id: "en-wiki-tu-youyou", level: 8, title: "Tu Youyou",
    blurb: "An old medical text supplied a clue for modern malaria research.",
    wikiTitle: "Tu Youyou", sourceUrl: "https://en.wikipedia.org/wiki/Tu_Youyou",
    createdAt: 220_023, topics: ["encyclopedia", "biography", "science"],
    body: `Tu Youyou is a Chinese pharmaceutical researcher whose work led to the discovery of artemisinin, a substance used in malaria treatment. Born in Ningbo in 1930, she studied pharmacy in Beijing and later received training in traditional Chinese medicine. Her research brought those two bodies of knowledge into contact through laboratory investigation.

In 1969, Tu became head of a research group within Project 523, a Chinese effort to find antimalarial drugs. Resistance to existing medicines had made the search urgent. Her team examined traditional prescriptions and tested extracts from numerous plants rather than assuming that a historical remedy was effective simply because it had been recorded.

Sweet wormwood, Artemisia annua, was a promising candidate, but early extracts did not produce consistent results. Tu reconsidered the preparation after reading a description attributed to the fourth-century scholar Ge Hong. The account suggested using the plant without the high temperatures common in other extraction methods.

She developed a lower-temperature method using ether to extract the active material. This produced much better results in animal tests. Further work isolated and investigated artemisinin and related compounds, contributing to a new class of antimalarial medicines.

The discovery is sometimes reduced to the story of an ancient recipe being rediscovered. That misses the experimental work separating a clue from a dependable drug. Researchers had to change the extraction process, test the material, and establish which substance produced the effect. The medicinal compound and a casually prepared herbal drink are not interchangeable.

Tu received the Lasker Award in 2011 and shared the 2015 Nobel Prize in Physiology or Medicine with William C. Campbell and Satoshi Omura, whose work concerned other treatments for parasitic disease. Her contribution was recognized for its role in a treatment that reached patients far beyond the country where the research took place.`,
  },
  {
    id: "en-wiki-containerization", level: 8, title: "Containerization",
    blurb: "Standard boxes changed how cargo moved between ships, trains, and trucks.",
    wikiTitle: "Containerization", sourceUrl: "https://en.wikipedia.org/wiki/Containerization",
    createdAt: 220_024, topics: ["encyclopedia", "science", "work"],
    body: `Before standardized shipping containers became common, moving cargo through a port involved handling separate crates, sacks, and barrels. Goods could be unloaded into a warehouse, stored, and then moved again before reaching a ship. Every transfer required labor and time, and each created opportunities for damage or theft.

Containerization reorganized this work around a large reusable box. Goods packed into a container could travel by truck, ship, and train without being unpacked at every change of vehicle. This is intermodal transport: different modes carry the same loading unit.

The box alone was not enough. Containers needed compatible dimensions and fittings so that cranes, vehicles, and storage areas could handle them efficiently. Standardization allowed equipment at one end of a journey to work with a container arriving from the other side of the world. Identification systems made individual containers easier to track.

Earlier forms of transferable containers existed in mining and railway transport. The modern system expanded rapidly after the Second World War, supported by specialized ships and purpose-built terminals. The commercial advantage came largely from reducing the expensive and slow work at the points where cargo changed hands.

Faster handling lowered transport costs and helped make long-distance supply chains practical for more products. Manufacturers could organize production and distribution across greater distances. Shipping containers became part of the infrastructure supporting international trade rather than simply a different way to package goods.

The transition also displaced workers and changed port cities. Traditional dockside jobs declined as cranes and specialized machinery took over much of the handling. Large terminals required space and connections to roads and railways, shifting activity away from some older waterfronts.

Efficiency did not eliminate coordination problems. The system depends on the availability of compatible equipment and on keeping containers moving through connected transport networks. Its success came from redesigning those connections along with the cargo unit itself.`,
  },
  {
    id: "en-wiki-natural-selection", level: 9, title: "Natural Selection",
    blurb: "Inherited variation changes populations without a predetermined goal.",
    wikiTitle: "Natural selection", sourceUrl: "https://en.wikipedia.org/wiki/Natural_selection",
    createdAt: 220_025, topics: ["encyclopedia", "science", "nature"],
    body: `Natural selection occurs when heritable differences affect organisms' chances of leaving descendants. Individuals within a population vary, and some of that variation passes from parents to offspring. If a particular inherited characteristic consistently contributes to reproductive success in a given environment, it can become more common over successive generations.

The emphasis on reproduction is important. An organism's evolutionary fitness is not simply its strength, longevity, or ability to win a fight. A characteristic matters to selection insofar as it influences the contribution of inherited traits to later generations. Cooperation, camouflage, or a particular flowering time can be advantageous under appropriate conditions.

Consider a hypothetical population of insects whose colors vary. If predators more easily notice one color against the background, insects of another color may survive to reproduce more often. Provided the relevant differences are inherited, the population's composition may change. Individual insects do not need to alter their color deliberately, and predators need not intend to reshape the population.

Selection therefore has no foresight. A useful trait in one environment can become disadvantageous when conditions change, and an adaptation is not evidence that evolution was aiming toward a perfect final form. Existing anatomy and developmental processes also constrain the variations available. Selection operates on differences that arise, rather than manufacturing whatever an organism needs on demand.

Charles Darwin and Alfred Russel Wallace presented the principle jointly in 1858. Darwin developed the argument at length in On the Origin of Species the following year. Neither had access to the modern understanding of genes and inheritance. Later work connected evolutionary explanations with genetics and supplied mechanisms that their original accounts lacked.

Natural selection is one mechanism of evolution, not a synonym for every evolutionary change. Chance fluctuations, known as genetic drift, can also alter the frequency of inherited variants. Distinguishing these processes allows biologists to ask whether a particular pattern reflects an adaptive advantage, a historical accident, or several causes acting together. The explanation must be investigated in the population concerned rather than inferred solely from the apparent usefulness of a trait.`,
  },
  {
    id: "en-wiki-antimicrobial-resistance", level: 9, title: "Antimicrobial Resistance",
    blurb: "Why microbes can survive medicines that once controlled them.",
    wikiTitle: "Antimicrobial resistance", sourceUrl: "https://en.wikipedia.org/wiki/Antimicrobial_resistance",
    createdAt: 220_026, topics: ["encyclopedia", "science", "health"],
    body: `Antimicrobial resistance occurs when microorganisms can withstand medicines intended to control them. The category includes bacteria resistant to antibiotics, but also resistant viruses, fungi, and parasites. The organism causing an infection becomes resistant; the patient's body does not become immune to the medicine.

Resistance can arise through genetic changes. Bacteria may acquire mutations or obtain resistance genes from other bacteria, including through processes that transfer genetic material between cells. A resistant variant need not first encounter a drug in order to exist. Exposure can then change which variants survive and multiply.

When a medicine removes susceptible microbes more effectively than resistant ones, it changes the competitive environment. The survivors can reproduce, and resistance may become more prevalent. This is natural selection operating in a setting shaped by medical treatment. Certain resistance mechanisms destroy or modify a drug, while others alter its target or reduce the amount reaching that target.

Antimicrobial use is not confined to human medicine. Veterinary treatment and agricultural practices also influence the environments in which resistance develops and spreads. Resistant organisms and genes can move between people, animals, and their surroundings, making the problem difficult to contain within a single institution or country.

Resistance does not necessarily mean that every available treatment has failed. A microbe may resist one medicine yet remain susceptible to another. Nevertheless, alternatives can be more expensive, less accessible, or associated with greater adverse effects. Infections that are difficult to treat also complicate procedures that depend on reliable infection control.

The response involves prevention as well as drug development. Better sanitation, hygiene, and appropriate infection-control measures reduce opportunities for transmission. Careful prescribing can limit unnecessary antimicrobial exposure while preserving access for patients who need treatment. These aims must be pursued together: withholding effective treatment indiscriminately is not a solution to resistance.

New medicines can extend treatment options, but they enter the same evolutionary setting as older ones. Surveillance and responsible use remain necessary after a drug is introduced. The challenge is to sustain effective treatment while reducing the conditions that repeatedly undermine it.`,
  },
  {
    id: "en-wiki-angkor", level: 9, title: "Angkor",
    blurb: "Temples and waterworks reveal the scale of a Khmer urban landscape.",
    wikiTitle: "Angkor", sourceUrl: "https://en.wikipedia.org/wiki/Angkor",
    createdAt: 220_027, topics: ["encyclopedia", "history", "travel"],
    body: `Angkor was a major center of the Khmer Empire in present-day Cambodia. Its surviving temples attract much of the attention, but they occupied a far larger inhabited landscape. Roads, reservoirs, canals, and agricultural areas connected monumental buildings with the everyday work of supporting a substantial population.

The Angkorian period is conventionally associated with the centuries between the ninth and fifteenth centuries. Successive rulers built religious monuments expressing political authority and devotion. Angkor Wat is the best-known temple complex in the region, but it is neither a name for the whole city nor the only important site. Other monuments record changing forms of Hindu and Buddhist worship.

The stone structures are unusually visible because they endured. Many houses and other buildings were constructed from materials less likely to survive in the same way. Judging the city only by its standing monuments would therefore leave much of its population out of the picture.

Modern surveys have helped reconstruct that missing landscape. Satellite images and archaeological mapping revealed extensive settlement and an elaborate water-management network. Researchers have described Angkor as a low-density urban complex rather than a compact city bounded neatly by a single wall. Estimates of its population vary because different methods and geographical boundaries produce different answers.

Water management was essential in a region with strong seasonal changes in rainfall. Reservoirs and channels helped collect, store, and distribute water, supporting agriculture and settlement. Maintaining such a connected system also created dependencies: damage or altered flow in one section could affect conditions elsewhere.

Angkor's decline has no universally accepted single explanation. Warfare, political changes, and environmental pressures have all been investigated. Evidence of prolonged droughts and episodes of intense rainfall suggests that climatic instability strained the water infrastructure. These findings complicate any account in which one invasion abruptly ended an otherwise untroubled city.

Decline also did not mean that every religious site ceased to function. Angkor Wat remained a place of Buddhist worship. The landscape preserved both major disruptions and continuities, which is why the familiar image of a completely forgotten city reclaimed by forest provides only a partial account of its history.`,
  },
  {
    id: "en-wiki-al-khwarizmi", level: 9, title: "Al-Khwarizmi",
    blurb: "A scholar's books helped give English the words algebra and algorithm.",
    wikiTitle: "Al-Khwarizmi", sourceUrl: "https://en.wikipedia.org/wiki/Al-Khwarizmi",
    createdAt: 220_028, topics: ["encyclopedia", "biography", "science"],
    body: `The English words algebra and algorithm preserve traces of a scholar who worked in ninth-century Baghdad. Muhammad ibn Musa al-Khwarizmi wrote in Arabic about mathematics, astronomy, and geography. Few details of his personal life are certain, but his books helped mathematical ideas travel across languages and remain useful centuries after his death.

His book on algebra presented systematic methods for solving linear and quadratic equations. These are equations involving an unknown quantity, sometimes multiplied by itself. Rather than merely collecting unrelated puzzles, he organized equations into standard forms and explained procedures for solving them. He also supplied geometrical arguments that showed why particular procedures worked.

A modern student might express such a problem with letters and mathematical signs. Al-Khwarizmi described it in words. Reading his work therefore requires attention to the difference between the mathematical relationships being discussed and the notation used to record them. Familiar symbols were not a prerequisite for reasoning systematically about unknown quantities.

The book connected its methods to practical questions, including trade, land measurement, and inheritance. Its title referred to operations often translated as completion and balancing. The word algebra developed from the Arabic term al-jabr. A Latin translation made by Robert of Chester in 1145 helped bring the work to European readers, where it remained influential in mathematical teaching.

Another work explained calculation using the numeral system developed in India. Its original Arabic text has been lost, but versions of its methods survive in Latin. This positional system allows a digit's value to depend on its place within a number. Translating and explaining such methods helped spread ways of calculating that European readers could adopt and teach. Latin forms of the author's name eventually gave rise to the word algorithm, now commonly used for a sequence of computational instructions.

Al-Khwarizmi also compiled astronomical tables and revised geographical information inherited from Ptolemy. His work drew on earlier traditions rather than emerging in isolation. Indian calculation, Greek mathematics, and other bodies of knowledge circulated through the scholarly world in which he worked.

Calling him an inventor of all algebra would erase that longer history. His particular contribution was to organize and explain methods in works that other scholars could study, translate, and extend. The surviving vocabulary records part of that transmission, while the books reveal the mathematical teaching behind the names.`,
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
