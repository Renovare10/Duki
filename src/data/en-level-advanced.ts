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
  {
    id: "en-l7-a-loaf-full-of-holes", level: 7,
    title: "A Loaf Full of Holes",
    blurb: "The bubbles inside bread reveal the work of living organisms and heat.",
    topics: ["food", "science"],
    body: `A slice of bread is mostly a network of walls around empty spaces. Some holes are tiny and neat; others are large enough to let jam fall through. These spaces did not appear when someone cut the loaf. They began as bubbles in the dough, long before the bread went into the oven. To understand them, it helps to follow the life of an ordinary yeast loaf.

The ingredients may look unpromising: flour, water, yeast, and salt. Wheat flour contains starch and proteins. When water is added and the dough is mixed, two groups of proteins help form gluten, a flexible network. A useful comparison is a stretchy bag, although the actual structure is much more complicated. It can hold gas while allowing the dough to expand.

Yeast is a living organism, a kind of fungus. Baker's yeast uses sugars and can produce carbon dioxide and alcohol through fermentation. Enzymes in the flour help break some starch into smaller sugars that yeast can use. As carbon dioxide collects in bubbles within the dough, the dough rises. The yeast does not build the walls of those bubbles; the structure of the dough helps keep the gas from escaping immediately.

Time and temperature affect this work. Dough usually rises faster in a moderately warm place than in a cool one. That does not mean the hottest possible place is best. Excessive heat can damage or kill yeast. A slow rise in the refrigerator can develop flavor while making the schedule more convenient for a baker. The exact result depends on the recipe, the temperature, and how long the dough is left.

Salt does more than make bread taste pleasant. It also affects the dough's structure and the activity of yeast. Leaving it out can change both flavor and the way the dough behaves. Likewise, adding large amounts of sugar or fat creates a different environment from a basic flour-and-water dough. A method that works well for one loaf may need adjustments for another.

Bakers often let dough rise, shape it, and then allow another rise before baking. Shaping redistributes gas and creates tension at the surface. It is not simply an attempt to squeeze out every bubble. Handle dough roughly at the wrong stage and a loaf may lose the open texture the baker wanted. Leave it rising too long and its structure may become unable to hold the gas effectively.

Inside the oven, several changes happen close together. Gases expand as they warm, and some water becomes vapor. For a short time, yeast activity may increase before the rising temperature stops it. The dough grows quickly during this early stage, a change bakers call oven spring. Eventually the proteins and starch change in ways that set the loaf's structure, so it can no longer stretch as freely.

The crust follows a different path from the moist interior. Its surface dries and becomes hot enough for browning reactions to create new colors and flavors. Inside, moisture keeps temperatures lower during ordinary baking. This is why a loaf can have a dark, crisp exterior around a pale, soft center. The whole loaf is in the same oven, but its parts are not experiencing identical conditions.

Freshly baked bread is tempting to cut at once. Waiting allows the crumb, the soft inner part, to settle as heat and moisture move through it. Cutting too early can leave a gummy impression even when the outside looks finished. Cooling is therefore part of making bread, not merely the delay between baking and eating.

The holes in a finished slice record many decisions. Flour choice, mixing, fermentation, shaping, and oven conditions all leave traces. A large hole is not automatically proof of a superior loaf; a tight, even crumb may be exactly right for a sandwich. Next time you spread something on bread, look at the surface first. Its ordinary pattern is the result of biology meeting a material that can stretch, hold, and finally become firm.`
  },
  {
    id: "en-l7-the-name-below-the-photograph", level: 7,
    title: "The Name Below the Photograph",
    blurb: "A museum volunteer notices that a familiar face has the wrong name.",
    topics: ["history", "family", "arts"],
    body: `My grandmother found the mistake before she had taken off her coat. We were visiting the town museum, where I had spent six Saturdays helping prepare an exhibition about local factories. Beside a photograph of women assembling radios, a label identified the woman nearest the camera as a supervisor named Margaret Bell. My grandmother leaned forward and said, "That's your Aunt June. Margaret was much taller."

I looked at the photograph. The woman had dark eyebrows and a serious mouth, but so did half the women in our old family albums. I asked how she could be certain. Grandmother pointed to the woman's left hand. There was a pale mark beside her thumb. June had burned herself on a stove as a child. I could see something in the photograph, although it might have been a scratch on the print.

The exhibition opened in four days. We had printed labels, painted walls, and persuaded a retired engineer to lend us a heavy radio from his sitting room. I wanted my work to be finished. When I told the curator what Grandmother had said, I hoped he would smile and explain why the museum was right. Instead, he asked whether she could come back with any photographs of June.

At home we emptied two boxes onto the dining table. Most pictures had nothing written on the back. Relatives stood beside cars no one could identify, or smiled in gardens that had since become shops. Grandmother named people confidently until she came to a wedding group. Then she called the groom by two different names and became cross when I asked which was correct.

I began to feel uncomfortable about the museum photograph. Remembering one detail clearly did not make every memory reliable. When I said this, Grandmother pushed back her chair. She had worked with June. She had watched her leave for the factory each morning. Why, she asked, was a label written last week more trustworthy than a person who had actually been there?

I had no good answer. I did have a photograph from June's retirement party. On the back, in June's own handwriting, was a date and a list of names. Near the center stood the same narrow-faced woman as in the museum picture. Beside her was someone taller, identified as Margaret Bell. Grandmother tapped the table once, satisfied, and went to put the kettle on.

The curator welcomed the evidence but did not immediately order a new label. He showed us the file for the exhibition photograph. Its identification had come from a newspaper cutting, written decades after the picture was taken. It might be wrong. He wanted to compare staff records and contact the family that had donated the print before deciding how to describe it.

Grandmother thought this was unnecessary. I was beginning to enjoy it. We were looking at the same photograph but asking different questions: who was there, who had named them, and when the naming had happened. A clear picture could still carry uncertain information. I had spent weeks straightening labels without thinking much about the words on them.

By opening day, the museum had located a staff newsletter containing another copy of the photograph. It named June in the front row. The replacement label included the corrected identification and the newsletter's date. The curator also placed a small notice near the exit inviting visitors to share information about other photographs. He warned me that not every suggested correction would be right.

Grandmother came wearing the same coat. She read the new label in silence, then walked through the rest of the exhibition. At the radio display she stopped and described a test the factory workers used to check each finished set. None of us had known about it. This time I fetched a notebook. Before writing down her account, I asked if I could record her name and the years she had worked there. She gave me the dates slowly and made me read them back.`
  },
  {
    id: "en-l7-the-box-that-changed-the-port", level: 7,
    title: "The Box That Changed the Port",
    blurb: "Standard shipping containers changed ports, jobs, and the journey of everyday goods.",
    topics: ["history", "work", "travel"],
    body: `At a modern container port, a crane can lift an entire metal box from a ship and place it on a waiting vehicle. Inside might be shoes, machine parts, or flat boxes containing furniture. The crane operator need not examine any of these products. The outside of the container gives the equipment what it needs: a known shape, strong corners, and places where lifting devices can connect.

For much of shipping history, loading a vessel involved many separate objects. Workers carried or lifted sacks, barrels, wooden cases, and other packages into the hold. They arranged the cargo to use space efficiently and keep it secure. Each shape presented a different problem. At the destination, people had to reverse the process. A ship could spend a considerable part of its working life beside a dock.

Putting goods in boxes was not a new idea. The important development was a transport system built around containers that different businesses could handle. If a box fitted a ship but could not travel conveniently by rail or road, someone still had to unpack it. The benefits grew when ports, shipping lines, railways, and road carriers could transfer the same loaded container between them.

Standard dimensions and common fittings made that cooperation easier. A manufacturer did not need to design a unique crane for every customer's box. A shipping company could plan how containers would fit aboard a vessel before they arrived. A sealed container could move between several forms of transport without workers handling its contents at each stage. This is often called intermodal transport.

The savings involved more than lifting speed. Less handling could reduce damage and opportunities for theft, although it could not eliminate either. More predictable loading times helped companies schedule journeys. Businesses could organize production and sales over longer distances when transport became cheaper and more reliable. Containers were part of this change, alongside developments in roads, communication, trade rules, and manufacturing.

The change was disruptive for workers. Traditional dock work depended on experience with many kinds of cargo and on teams working together around it. Container ports needed different equipment and often fewer people to move a given amount of freight. Some workers learned new skills; others lost jobs. Arguments about wages, safety, and job security were part of containerization, not a small detail beside a story of mechanical progress.

Older city docks were not always suitable for the new system. Large vessels needed deep water, while cranes and container storage required extensive space. Nearby roads had to cope with heavy vehicles. In many places, activity shifted toward larger terminals away from historic waterfronts. Former warehouses later became homes, museums, or offices. Visitors enjoying those districts today may be walking where a very different economy once operated.

Standardization also creates dependence. A container is useful because so much equipment accepts it, but moving millions of them requires coordination. Empty boxes must return to places where exporters need them. If goods flow mostly in one direction, containers accumulate at the other end. A port full of empty boxes can coexist with a shortage somewhere else. The metal itself is available, but it is in the wrong location.

There are costs beyond the port fence. Ships burn fuel, trucks contribute to traffic and air pollution, and very large terminals can disturb surrounding environments. A low transport price paid by a customer does not necessarily include every cost experienced by nearby residents. Assessing the system means looking at these effects as well as the price of an imported shirt.

The container's strength is its ordinary appearance. Goods can travel far because people have agreed on the outside of the box, even when they know little about what is inside. Look at the different company names on containers passing a railway station. Their shared fittings record years of negotiation and investment. The box works because a large number of people, many of whom will never meet, have arranged to handle it in compatible ways.`
  },
  {
    id: "en-l7-the-midnight-gardener", level: 7,
    title: "The Midnight Gardener",
    blurb: "Missing water turns a peaceful vegetable garden into a small investigation.",
    topics: ["nature", "humor", "adventure"],
    body: `By the end of June, everyone in the community garden had accused someone else of stealing water. The rain barrel beside the shed was full on Monday evening and nearly empty by Tuesday morning. There had been no rain for a week. Under the new watering agreement, each plot could receive two cans a day. Someone, Priya announced, was taking considerably more.

She called a meeting beside her beans. Twelve gardeners stood in the heat while she explained the evidence. Mr. Cole, whose tomatoes were unusually large, looked offended before anyone mentioned his name. Elena pointed out that she grew flowers, which several members seemed to consider less deserving of water than vegetables. Ben, who had joined in April, asked whether someone had checked the barrel for a leak.

Priya said she had. Beneath the tap was a dry paving stone. The barrel stood upright on bricks, and no water was running down its sides. Besides, she had heard someone in the garden late the previous night. She lived in a flat overlooking the gate. There had been a scraping noise and then a bang. Nobody admitted to a midnight visit.

Ben disliked suspicion more than he disliked losing sleep. He volunteered to watch the garden that evening. Priya offered to join him, partly because she owned a flask and partly because she did not entirely trust a new member with the investigation. They settled behind the shed at ten. By eleven, the tea was gone and Priya had explained every disagreement the garden had experienced in fifteen years.

At half past eleven, a light appeared by the gate. Ben sat up so sharply that his folding chair collapsed. The light vanished. They heard hurried steps outside the fence, followed by a quiet voice asking whether someone needed help. It was Mr. Cole. He had come to put fleece over his young plants because the night was cooler than expected. He shone his torch on the broken chair and tried not to smile.

They let him finish his work and leave. Priya whispered that visiting one's tomatoes in darkness was not proof of innocence. Ben suggested that nobody could remove a barrel of water in a pocket. They waited another hour. A fox passed along the far fence. Somewhere beyond the railway line, a machine hummed. Then came a hollow knock from the shed.

The barrel was still beside it. Ben checked the level with his torch: lower than before. Priya examined the dry stone beneath the tap and folded her arms. He walked around the back instead. In the narrow space between barrel and wall, his shoe sank into wet soil. A thin stream was coming from a split near the bottom, almost hidden behind a supporting brick.

He put his hand against the plastic. The crack widened slightly when he pressed. They had filled the barrel in the evening, and the weight of the water had pushed against the damaged section. From the front, neither the crack nor the damp ground was visible. Water had been soaking into the earth behind the shed, where nobody usually walked.

At the next meeting, Priya brought a photograph of the split. She apologized without naming anyone, which Elena said was not quite sufficient. Eventually Priya apologized to Mr. Cole in particular. He accepted, then admitted that he had sometimes taken a third can before the restrictions began. This confession produced another argument, shorter but louder than the first.

Replacing the barrel cost more than expected. Ben suggested moving it away from the wall so everyone could inspect it. The others agreed. They also put a measuring stick beside it and wrote down the level each evening. For several weeks the garden was almost painfully polite.

Then somebody began leaving the shared tools in the wrong cupboard. Priya proposed a sign-out book. Ben said he would help paint labels but would not, under any circumstances, spend another night behind the shed. His repaired chair was now reserved for sitting beside his own small, slightly disappointing potatoes.`
  },
  {
    id: "en-l7-what-a-menu-translates", level: 7,
    title: "What a Menu Translates",
    blurb: "A restaurant menu has to carry ingredients, expectations, and a little history.",
    topics: ["culture", "food", "travel"],
    body: `An unfamiliar menu can make a confident adult feel helpless. You may recognize every translated word and still have no clear idea what will arrive. A dish called "family happiness" sounds welcoming, but it does not tell you whether lunch contains pork, seafood, or vegetables. A phrase that works perfectly for regular customers may fail a visitor who lacks the same background knowledge.

Translating a menu therefore requires decisions about the reader. A local name can be part of a dish's appeal, especially when it connects the food with a place or tradition. Replacing every name with a list of ingredients may make the menu easier to understand but less distinctive. Keeping every original name can have the opposite effect. The translator has to decide what to preserve and what to explain.

One practical solution is a name followed by a short description. The name introduces the dish as people actually call it. The description explains the main ingredient, the cooking method, or the texture. A visitor can then connect a cultural name with something they can imagine eating. This approach takes more space, which becomes a real problem on a small printed card.

Literal translation is not always the most accurate choice. Food names may contain jokes, references to appearance, or memories of people and places. An English reader might interpret a translated animal name as an ingredient when it actually describes a shape. Accuracy means conveying what the expression does in context, not merely matching each word with a dictionary entry.

Texture can be especially difficult. Languages divide tastes and physical sensations in different ways, and ordinary food words carry different associations. "Chewy" may sound pleasant for one food and disappointing for another. "Soft" can suggest tenderness or a lack of freshness. A useful description sometimes needs a familiar comparison, but comparisons can mislead too. Calling something a cake may lead a diner to expect sweetness that is not there.

Ingredients also change from kitchen to kitchen. The same dish name does not guarantee the same recipe. A translation copied from another restaurant may be grammatically excellent and factually wrong. The translator needs to ask the cooks what they actually use. This is particularly important when diners have allergies or other dietary needs. A poetic title should never replace a reliable conversation about ingredients and preparation.

There is a difference between explaining a dish and making claims about an entire culture. A menu does not need to announce that everyone in a country loves a particular food, or that one recipe has remained unchanged for centuries. Those statements are often too broad to defend. A precise description of this restaurant's version is usually more useful, and it leaves room for regional and family differences.

Price and service expectations can also require translation. Is the dish intended for one person or for sharing? Does a bowl of rice come with it? Can the kitchen reduce the heat of the seasoning, or is the sauce prepared in advance? These questions are not failures of language learning. They concern restaurant habits that an experienced local diner may take for granted.

Pictures can help, provided they show the food customers will receive. A photograph cannot reliably communicate temperature, texture, or every hidden ingredient. It can also create an expectation about quantity that the actual serving does not meet. Like a short written description, an image selects some information and leaves the rest outside the frame.

The best test of a translated menu is an ordinary order. Give it to someone unfamiliar with the dishes, ask what they expect, and listen for surprises. If their imagined meal is very different from the one the kitchen serves, the wording needs work. A menu has succeeded when the customer can choose with reasonable confidence and still discover something new on the plate. Perfect word matching is less important than a lunch that makes sense when it arrives.`
  },
  {
    id: "en-l7-the-silent-request", level: 7,
    title: "The Silent Request",
    blurb: "A late-night radio host receives a request for something she cannot play.",
    topics: ["arts", "work", "feelings"],
    body: `Mara's radio program began at midnight, when the advertising office was dark and the building's automatic lights kept switching off around her. She played music for taxi drivers, people finishing late shifts, and anyone who could not sleep. Between songs she read messages. Most requested familiar recordings. Some described a rainy motorway or a kitchen table covered in unpaid bills. She read those more slowly.

The unusual message arrived on a Thursday. A listener named Daniel asked her to play a recording of the sea. He did not mean a song about it. He wanted the sound of waves on a beach, preferably without music, birds, or someone explaining how peaceful it was. Mara checked the station's sound library. There was a storm, a ship's horn, and a short splash labeled "water, general."

She apologized on air and played the next scheduled track. Ten minutes later Daniel wrote again. His mother had moved into a care home inland. She had lived by the coast for most of her life and missed the sea at night. He had tried recordings on his phone, but she disliked the little speaker. The radio beside her bed sounded familiar. She trusted it in a way she did not trust his phone.

Mara knew she should continue with the program. The producer had already complained that she read too many long messages. Still, she asked whether anyone listening had a clear recording of waves. She said they needed permission to broadcast it, not a clip taken from a film or another person's channel. Then she waited, feeling slightly foolish.

The first offering included a dog barking directly into a microphone. The second had a family arguing about sandwiches. A fisherman sent a recording made from his boat, but its engine covered almost everything else. Mara listened through headphones while a song played. She could see why Daniel had been so specific. The sea apparently came with many unwanted companions.

Near one o'clock, a message arrived from Ruth, a night receptionist at a small coastal hotel. She had recorded waves earlier that week using a portable recorder. She used the recording when editing her own holiday videos. The beach had been empty, and the hotel had no music playing outside. She attached the file and confirmed that she had made it herself and was happy for the station to use it.

Mara downloaded it, checked the sound, and called the duty editor. Broadcasting several minutes without speech or music was not part of the schedule. The editor listened, asked about permission, and approved a short section. He warned her that listeners might think the station had broken. She promised to explain before it began.

At one fifteen, Mara announced the recording. She resisted the urge to describe an imaginary moonlit beach. Ruth's waves were enough. A low rush approached, broke softly, and withdrew over stones. Mara watched the seconds pass on the screen. For once she had nothing to prepare, nothing to say, and no reason to fill the room with her voice.

Messages appeared almost immediately. One driver said he had checked his radio twice. A nurse on her break asked where the beach was. Someone complained that the sound made an unpleasant night feel longer. Mara read none of these aloud. When the recording ended, she identified Ruth, thanked her, and returned to the music.

Daniel's final message came just before the program finished. His mother had been asleep when the waves played. He had listened alone in the chair beside her bed. He thanked Mara anyway and asked whether Ruth might allow them a copy for another evening.

Mara forwarded the request with Daniel's permission. She was disappointed at first, though she could not have said exactly what result she had expected. On her way home, the city buses were starting their routes. She left her headphones in her bag and listened to the uneven noise of the waking street.`
  },
  {
    id: "en-l7-the-plant-by-the-window", level: 7,
    title: "The Plant by the Window",
    blurb: "Two pots of basil show why a fair experiment needs more than a plausible result.",
    topics: ["science", "school", "nature"],
    body: `Suppose you want to know whether a liquid plant food helps basil grow. You put one plant by the kitchen window and another on a shelf. You feed the first plant and give the second only water. Three weeks later, the plant by the window is taller. You have a result that agrees with your prediction. You do not yet have a good reason to credit the plant food.

The plants received different amounts of light. They may also have started at different sizes, occupied different pots, or grown in different soil. Any of these differences could affect growth. The difficulty is not that your observation is false. One plant really is taller. The difficulty is deciding what caused the difference, which is a separate question from what you saw.

A controlled experiment tries to make comparisons that answer a specific question. In this example, you would aim to keep light, soil, pot size, and watering similar while changing the use of plant food. The plants receiving no added food form a comparison group, often called a control group. This does not mean they receive no care. It means they do not receive the particular treatment being tested.

Even then, using only one plant in each group is risky. Living things vary. One seedling might have damaged roots before the experiment starts. Another might grow quickly for reasons you do not notice. Several plants in each group give you a better picture of that variation. A larger sample does not fix every mistake, but it can reduce the influence of one unusual individual.

Assigning plants to groups at random can help too. If you choose all the strongest-looking plants for the food treatment, you have given that group an advantage before feeding begins. A random assignment gives each eligible plant a chance of receiving either treatment. With a small number of plants, the groups can still differ by chance. Randomization improves the method; it does not promise perfectly matched groups.

You also need to decide what "helps grow" means. A taller stem is easy to measure, but it is not the only useful outcome. You might care about leaf number, leaf mass, or the plant's survival. Choosing your main measure before seeing the results makes it harder to select whichever number makes the treatment look best. You can still examine other measures, provided you explain what you did.

Measurements introduce their own problems. A ruler placed at a different angle can change the recorded height. Measuring one group in the morning and the other in the evening might introduce a regular difference unrelated to the treatment. Clear instructions, consistent timing, and written records help other people understand the procedure. They also protect you from relying on memory when an unexpected result appears.

Imagine that the treated plants grow only slightly taller on average, while individual heights vary widely in both groups. It would be unwise to announce that the food definitely works. It would also be too strong to declare that it has no effect. The experiment may be unable to distinguish a small effect from ordinary variation. An honest conclusion describes both the observed difference and the limits of the evidence.

Repeating an experiment can test whether a pattern is dependable. A result that appears under one set of conditions may disappear under another. Perhaps the original soil lacked a nutrient that the food supplied, while richer soil already contained enough. That would make the first result useful but limited. It would not justify a claim about every plant in every garden.

These habits apply far beyond pots of basil. Whenever someone says a change caused an improvement, ask what comparison supports the claim. Notice what else changed, how the outcome was measured, and how much variation there was. You need not turn every household decision into a formal study. But you can learn to separate a promising observation from a conclusion it has not yet earned.`
  },
  {
    id: "en-l8-the-missing-signature", level: 8,
    title: "The Missing Signature",
    blurb: "An archivist finds that the document she needs is also the one she damaged.",
    topics: ["history", "work", "feelings"],
    body: `The envelope had been filed under drainage, which was why nobody looking for a petition had found it. Leila discovered it while preparing an exhibition about the reservoir that had submerged the old valley. Inside lay six pages of signatures and a letter opposing the project. The letter was polite, persistent, and entirely unlike the angry fragments quoted in the council's published history.

She recognized one surname immediately. Her grandfather had grown up in the valley, although he rarely mentioned it. In the official photographs, former residents appeared smiling beside new houses on higher ground. At home, he kept a photograph of an orchard in a drawer with his passport. Leila had never asked why it was stored among documents rather than displayed with the family pictures.

The petition could anchor the exhibition's final section, which until then consisted mainly of engineering diagrams. She photographed the envelope and noted its position in the box. Then, reaching across her desk for a weight to hold the curling pages flat, she struck her mug. Tea spread beneath the last sheet before she managed to lift it. A brown tide crossed the signatures.

For a few seconds she did nothing. The room was silent except for the printer beyond the door. The archive's rules about food and drink were posted above her desk; she had helped revise them. She imagined reporting the accident, then imagined quietly allowing the paper to dry and mentioning only the older stains visible on its upper edge. Nobody else had seen it that morning.

She called the conservation officer. Following his instructions, she left the wet sheet supported and avoided rubbing or separating any fibers. He arrived with suitable materials, took charge of the damaged document, and asked her to write down exactly what had happened. His matter-of-fact questions were worse than anger. She answered them while staring at the handle of the mug.

The exhibition deadline did not move. Her manager reassigned the original document for assessment and told Leila to work from the photographs she had already taken. Unfortunately, she had photographed only the first five pages before the accident. The sixth contained names that now had to be examined through a stain she herself had created. She could no longer pretend to be a neutral observer of the document's history.

That weekend she visited her grandfather with a copy of the letter. He read it twice. His own father had circulated the petition, he said, going from house to house after work. Some neighbors had refused to sign because they welcomed the reservoir; others feared that opposition would affect their compensation. The village had not spoken with one voice, whatever later accounts suggested.

Leila asked about the orchard. Her grandfather shrugged. The trees had belonged to his uncle, who had supported the project and used the compensation to open a garage. The photograph was no simple symbol of resistance. It showed the place where Leila's grandfather had spent his happiest summers, taken by a man who had been willing to leave it.

She told him about the tea. He listened without offering the comfort she had hoped for. Then he asked whether the other documents in the box were safe. They were. He said he would lend the orchard photograph if she wanted it, provided the label did not make his uncle into a person he had never been.

When the exhibition opened, the petition appeared as a reproduction of its first page. The original remained with the conservator. A note explained its provenance, and the archive's internal record included the accidental damage and subsequent treatment. Leila stood nearby during the first visiting hour, prepared for questions about the reservoir and afraid of questions about the paper.

An older visitor studied the reproduction, then pointed to a signature halfway down. Her mother had signed, she said, but had changed her mind before construction began. Could that be included somewhere? Leila fetched the visitor feedback form, then put it aside and asked whether they could arrange a recorded interview. She wanted time to hear the whole account before deciding what a label could honestly say.`
  },
  {
    id: "en-l8-when-noon-became-an-agreement", level: 8,
    title: "When Noon Became an Agreement",
    blurb: "Railway schedules helped turn local solar time into a problem of coordination.",
    topics: ["history", "science", "travel"],
    body: `Before a clock became a device we expected to agree with every other clock, noon was closely connected with a place. Local solar noon occurred when the sun crossed that location's meridian and reached its highest point in its daily path. Travel east or west and the moment changed. For people whose journeys were slow and mostly local, the difference rarely required an elaborate solution.

Clocks did not remove the geographical problem. They allowed people to divide the day more regularly, but a town could still set its clocks according to its own local time. There was also a distinction between apparent solar time, which follows the actual sun, and mean solar time, which smooths out variations over the year. Even the seemingly natural instruction to follow the sun required a choice about how to do so.

Railways made differences between local times inconvenient on a much larger scale. A passenger traveling between towns needed to know which clock a timetable referred to. Railway companies operating connected routes needed schedules that could be compared. As networks expanded, a collection of local answers became an operational burden. Telegraph communication helped distribute time signals, making wider coordination technically possible.

In North America, railroads adopted a standard time system on November 18, 1883. This was an industry-led arrangement, not the moment at which every household clock changed or every legal question was settled. In the United States, federal legislation establishing standard time zones followed in 1918. The distinction matters: common practice can spread before governments give it a formal legal structure.

A time zone replaces many slightly different local times with one shared reference. In an idealized diagram, zones might appear as equal strips around the globe. Real boundaries are less tidy. They reflect political borders, transport connections, and decisions about which communities should share working hours. The clock on a wall therefore records an agreement about social organization as well as a method of measurement.

Standard time brought obvious advantages. A timetable could be printed without a separate conversion for every station. Businesses in distant cities could arrange calls and deliveries more easily. Yet accepting a common time meant surrendering one familiar relationship between the clock and the sun. In a wide zone, solar noon arrives at different clock times in its eastern and western parts.

Daylight saving time introduces another kind of decision. Moving clocks seasonally changes the relationship between numbered hours and daylight; it does not create additional sunlight. The policy aims to rearrange activity relative to the available light. Its effects depend on climate, location, working patterns, and many other conditions. Arguments about it are therefore partly arguments about whose daily routine should receive priority.

Modern timekeeping adds layers that railway passengers never encountered. Atomic clocks provide extremely stable measurements, while coordinated systems allow computers and communication networks to compare events. A timestamp that seems precise can still be ambiguous if it lacks a date, a time zone, or information about how local clock changes were handled. More digits do not automatically supply the missing context.

This ambiguity becomes visible in ordinary life when people arrange a remote meeting. "Nine on Tuesday" may refer to different dates or working hours for the participants. Seasonal clock changes can shift the difference between their locations, sometimes only for a few weeks. Writing an explicit zone and checking the relevant date is less elegant than saying "the usual time," but considerably more dependable.

It is tempting to describe standardization as a clean victory of scientific accuracy over local confusion. That misses the practical negotiation involved. The sun was not wrong before standard time, nor did local communities misunderstand their own afternoons. Their system addressed a different set of needs. Railways and later communication networks changed the scale at which people had to cooperate. The clocks became more useful when enough people agreed what their readings would mean, even where those readings no longer matched local noon.`
  },
  {
    id: "en-l8-the-sentence-between-them", level: 8,
    title: "The Sentence Between Them",
    blurb: "At a factory negotiation, an interpreter is asked to make disagreement sound polite.",
    topics: ["work", "culture", "literature"],
    body: `By the second hour of the negotiation, Nina could predict which sentences would cause trouble before their speakers had finished them. The factory director softened every refusal with a long account of his company's difficulties. The visiting buyer responded with cheerful statements that sounded like compliments until Nina reached the condition attached at the end. Between them sat a sample jacket, folded so precisely that nobody dared touch it.

She had been hired by the buyer for two days, with the possibility of regular work if the visit succeeded. Her fee was modest; the possibility was not. Since leaving her agency, she had learned to treat expressions of future interest as both encouragement and a danger. People could ask a great deal of someone they had not quite promised to employ.

The dispute concerned a delivery date. The buyer wanted the first shipment before a holiday sales period. The director said his production line was already committed. Nina interpreted both positions in the first person, as she had been trained to do, watching each speaker rather than the disappointed assistant who kept refreshing a spreadsheet on her laptop.

During a break, the buyer drew Nina aside. "You understand what I'm trying to achieve," he said. "Make it sound a little less final when he says no. These things are always negotiable."

Nina said she could preserve the director's tone but could not change his answer. The buyer smiled as if she had made an unnecessary distinction. He was not asking her to change anything, he explained, only to help the conversation move forward. Across the room, the director was pouring tea into paper cups, giving each one the same amount.

When the meeting resumed, he offered a smaller shipment by the requested date and the remainder three weeks later. The buyer asked whether the factory could increase overtime. The director's reply was brief: his workers had already been promised days off. Nina interpreted it without adding an apology. She felt the buyer's attention shift toward her, although he continued looking at the director.

Then the assistant spoke. Until that moment, she had contributed only figures. She explained that the buyer's warehouse would actually close for part of the holiday period. A full shipment arriving on the original date would have to sit outside the normal receiving schedule. A partial shipment might be easier to handle, provided the product mix matched the stores' needs.

The buyer interrupted her. Nina began interpreting the interruption, then stopped because the director was speaking too. All three waited for her. It was the first silence that afternoon in which nobody seemed to know whose words belonged next. She asked them to speak one at a time, beginning with the assistant, whose explanation had not yet been completed.

The eventual agreement was narrower than either opening proposal. There would be a limited first shipment, with written confirmation of which jacket sizes it would contain. Nina read the terms back in both languages. The director unfolded the sample jacket and pointed out a stitching detail near the pocket. Everyone examined it with relief, grateful for a subject that could be settled by looking.

Afterwards, the buyer told Nina she was very accurate. He made accuracy sound like a personality defect. There was no further mention of regular work. She sent her invoice that evening and spent too long checking whether its wording appeared unfriendly. At home, a friend said she should be proud of having stood her ground. Nina wished pride would pay the rent.

Three weeks later, the assistant emailed to ask if Nina was available for another assignment. She now worked for a different importer. Nina was pleased, then irritated by her own relief, as if the earlier decision required a reward to justify it. She replied with her availability and a higher fee. Before sending, she removed a sentence offering to negotiate the rate. There would be time for that conversation if the client wanted one.`
  },
  {
    id: "en-l8-the-useful-distortions-of-a-map", level: 8,
    title: "The Useful Distortions of a Map",
    blurb: "A map must leave things out; its purpose determines which omissions make sense.",
    topics: ["science", "travel", "culture"],
    body: `A railway map can guide you successfully across a city while giving you a remarkably poor idea of the city's shape. Stations appear evenly spaced, lines turn at tidy angles, and a short walk may look like a long journey. These distortions are not necessarily mistakes. The map has sacrificed geographical resemblance so that a passenger can see connections without first studying the entire street network.

Every map makes selections. Even a detailed street map omits objects that would overwhelm its surface: individual benches, temporary roadworks, the precise shape of each tree. The familiar phrase "to scale" does not mean that everything has been included. It means that specified distances have a consistent relationship to distances in the world, within the limits of the map's design and projection.

A flat world map faces a further problem. The curved surface of Earth cannot be spread onto a plane without distortion. Different projections preserve different properties, such as local angles or relative areas, while altering others. A projection useful for one task may be misleading for another. Asking which world map is simply correct avoids the more useful question of what a particular projection preserves.

Consider size. On some widely used maps, regions closer to the poles appear much larger relative to equatorial regions than they really are. A reader who mistakes visible area on the page for actual area may develop a distorted sense of the world's proportions. A different projection can correct that relationship while making familiar coastlines appear stretched or compressed. Changing the compromise does not abolish compromise.

Orientation is another convention that can feel like a natural law once we are accustomed to it. A map need not place north at the top. For a walker trying to match a sign with the street ahead, an orientation aligned with the direction of travel may be more helpful. The surprise of seeing a familiar region rotated reveals how much of map reading depends on learned habits.

Labels require choices too. A place may have multiple names used by different communities or at different historical moments. A mapmaker must decide which to print, in what language, and at what size. These decisions can acknowledge a community or make it harder to see. Even without a deliberate political message, a map can carry assumptions about whose knowledge its readers are expected to share.

Digital maps do not escape these problems. They can update quickly and offer different layers, but they still depend on incomplete records and design decisions. A route suggested for driving may be unsuitable for walking. A path marked as accessible might include a temporary obstruction that the database has not recorded. The polished appearance of a screen does not guarantee that its information is current.

Missing information can matter more than a visible error. A traveler may notice a wrongly named street and correct course. Someone planning a journey with limited mobility may not discover the absence of a working lift until reaching the station. A map that records tracks but not barriers serves different users unequally, even if every line it does draw is accurate.

Good map reading therefore involves checking the legend, scale, date, and intended use. A beautiful historical map can be evidence of what its makers believed without being dependable for modern navigation. A simple evacuation diagram may be excellent at showing an exit and useless for estimating travel time across the rest of a building. Its limits are part of understanding it.

The demand that a map include everything would make it impossible to use. What we need is enough information about the selection to judge whether it suits our purpose. Before trusting a map, imagine a decision you will make with it and identify the details that decision requires. The railway diagram may get you across town perfectly. To discover whether the station is actually closer on foot, you may need to put it down and consult another map.`
  },
  {
    id: "en-l8-the-last-climb", level: 8,
    title: "The Last Climb",
    blurb: "A cyclist returns to her old club expecting to recognize her place in the team.",
    topics: ["sports", "feelings", "literature"],
    body: `The first person to drop behind on the hill was the man who had spent breakfast describing his training plan. Helen noticed this with an uncharitable satisfaction that lasted until the gradient increased and she had to concentrate on breathing. Ahead, the younger riders climbed without apparent effort, their bright jackets moving between the hedges. She remembered being one of the people who waited at the top.

She had rejoined the cycling club after four years away. During that absence she had cared for her father, changed jobs, and acquired a bicycle that spent most of its life leaning against a bedroom wall. On the club's website, the Sunday route was described as a social ride. Helen had taken this to mean that her old fitness would be sufficient. Nobody had promised that it would remain hers indefinitely.

At the top, everyone was waiting. A young woman named Tess offered her a piece of flapjack without saying anything encouraging. Helen appreciated the silence. Breathless reassurance would have made the situation unbearable. She drank, looked across the valley, and asked how many climbs remained. Tess held up two fingers, then hesitated and added a third. The website, it seemed, had simplified the geography.

Their leader, Rob, asked whether the pace was comfortable. Helen said yes before she had considered the question. He had led the club when she first joined, and she disliked the idea of becoming someone he needed to manage. As they set off, she moved closer to the front, where she could prove that the opening climb had been an exception rather than a warning.

For twenty minutes she managed it. Then the road turned into the wind. Helen took a turn at the front for too long, determined not to appear protected by the others. By the time she moved aside, her legs felt heavy and oddly distant. The rider behind asked if she was all right. She nodded, saving the breath a spoken answer would cost.

The second climb separated her from the group almost immediately. She could still see their jackets when the man from breakfast drew level. His name was Martin. He said he had misunderstood "social" too. They rode together for a while, exchanging occasional complaints in the gaps between breaths. When he suggested telling Rob they needed a slower pace, she said she preferred not to hold everyone up.

"They're already waiting," Martin said. "They just don't know for how long."

At the junction, Helen finally admitted she was struggling. Rob looked more relieved than concerned. He had been trying to decide whether she wanted space or assistance. There was a shorter road to the cafe, he explained, without the final climb. Two other riders chose it immediately. One had an afternoon shift; the other had been hoping someone would suggest it since breakfast.

Tess joined them. Helen assumed she was being kind until the younger woman said she disliked the descent on the longer route. She was a strong climber but still nervous on steep downhill roads. Helen had been admiring a complete athlete who did not exist. In return, Tess had mistaken Helen's silence for the concentration of someone comfortably managing her effort.

They reached the cafe before the faster group. Martin ordered two cakes and said that next week he intended to train specifically for sitting down. Helen laughed so hard she spilled coffee into the saucer. When Rob arrived, she asked whether the club still ran the shorter Saturday rides. He said they had never stopped, although the website made them surprisingly difficult to find.

At home she entered the ride in her old training notebook. The distance looked disappointingly small beside entries from four years earlier. She considered adding an explanation, as if the notebook might accuse her of laziness. Instead, she wrote the names of the people she had ridden with and the time of next Saturday's meeting. Her legs were already stiffening. She moved the bicycle away from the bedroom wall and left it near the front door.`
  },
  {
    id: "en-l8-the-darkness-between-the-stars", level: 8,
    title: "The Darkness Between the Stars",
    blurb: "A dark night sky tells us something surprising about the history of the universe.",
    topics: ["science", "nature"],
    body: `On a clear night far from streetlights, the sky contains bright points separated by enormous patches of darkness. This seems so ordinary that it hardly demands an explanation. The sun has set, and the other stars are far away. Yet distance alone does not fully explain why the whole sky is not bright. Under certain assumptions about the universe, even very distant stars would collectively fill our view with light.

Imagine a universe that has existed forever, is not expanding, and contains stars distributed roughly evenly throughout unlimited space. Now imagine dividing that space into shells centered on Earth. More distant shells contain more stars because their volumes are larger. Although each individual star looks dimmer with distance, the increasing number of stars compensates for that fading. Each shell of equal thickness would contribute roughly the same amount of light, until intervening stars blocked the ones behind them.

Another way to picture the problem is to imagine standing in an enormous forest. Nearby trunks occupy only part of your view, but farther trunks fill many of the gaps. In a sufficiently extensive forest, almost every horizontal line of sight eventually meets a trunk. Similarly, in the imagined eternal universe, almost every direction should eventually lead to a stellar surface. The sky should resemble an overlapping wall of stars rather than bright pinpricks against blackness.

This argument is commonly called Olbers' paradox, after the astronomer Heinrich Wilhelm Olbers, although earlier thinkers had discussed related questions. The paradox does not show that observations are wrong. It shows that the assumptions behind the imaginary universe cannot all describe the real one. A dark sky is evidence against a particular model, not a failure of the stars to behave as expected.

Dust initially seems like an attractive solution. Perhaps clouds between the stars absorb enough light to leave the sky dark. But in a universe that had been shining forever, absorbing dust would heat up. It would then emit radiation of its own. Dust can change the wavelengths at which energy emerges, but it cannot serve indefinitely as a cold hiding place for an endless supply of stellar energy.

The actual universe has a finite history. Light travels at a finite speed, so light from sufficiently distant regions has not had time to reach us. Looking outward also means looking backward: we see distant objects as they were when their light began its journey. We cannot simply keep adding shells filled with stars identical to nearby ones. Far enough back, we reach periods before ordinary stars existed.

Cosmic expansion changes the picture as well. As the universe expands, the wavelengths of freely traveling light stretch. Radiation arriving from distant sources therefore has lower photon energies than when it was emitted, and its arrival pattern is altered too. The detailed calculation requires more than the shell argument, but the conclusion is clear: a static universe shining forever is a poor model of what we observe.

Darkness to human eyes does not mean an absence of radiation. Space contains a faint background left from the early universe, now observed mainly at microwave wavelengths. Our eyes cannot detect it. Instruments can measure it across the sky, revealing information about conditions long before the formation of the stars we recognize. The apparently empty background is therefore not empty in every useful sense.

There are also more immediate reasons why a particular sky looks dark or bright. Moonlight, clouds, atmospheric scattering, and artificial lighting affect what an observer sees from the ground. These local effects should not be confused with the larger cosmological question. Moving away from a city reveals more stars, but it does not turn the sky into a continuous shining surface. The darkness that remains is part of the evidence that the universe has changed over time.`
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
