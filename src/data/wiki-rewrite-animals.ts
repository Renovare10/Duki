/**
 * Animal wiki-rewrite shorts (ROI #5 static catalog).
 */
import type { LibraryText } from "../types";
import { entry, wikiUrl, cite } from "./wiki-rewrite-helpers";

export const WIKI_REWRITE_ANIMALS: LibraryText[] = [
  entry({
    id: "wr-animal-cat",
    category: "science",
    createdAt: 900,
    title: "家里的猫",
    blurb: "A quiet cat, warm sun, and slow mornings at home.",
    wikiTitle: "猫",
    source: cite("猫"),
    sourceUrl: wikiUrl("猫"),
    body: `我家里有一只猫。它很喜欢睡觉。

早上我给它吃饭。它吃得很慢。吃完饭，它去找太阳。

猫的眼睛很大。晚上它也能看见东西。走路的时候很安静。

妹妹想跟它玩。猫有的时候来，有的时候走。

有猫在家，我觉得很高兴。
`,
  }),  entry({
    id: "wr-animal-dog",
    category: "science",
    createdAt: 901,
    title: "门口的狗",
    blurb: "A careful dog by the door that loves walking with people.",
    wikiTitle: "狗",
    source: cite("狗"),
    sourceUrl: wikiUrl("狗"),
    body: `邻居家有一只狗。它小，但是很认真。

有同学来的时候，它会叫。爸爸回了，它就很高兴。

狗喜欢和人一起走。它看左边，也看右边。

下雨了，它还想出去玩。没有伞。它不太高兴。

狗帮助看门。人也要好好地关心它。
`,
  }),  entry({
    id: "wr-animal-panda",
    category: "science",
    createdAt: 902,
    title: "爱吃竹子的熊猫",
    blurb: "Black-and-white pandas, lots of bamboo, and careful moms.",
    wikiTitle: "大熊猫",
    source: cite("大熊猫"),
    sourceUrl: wikiUrl("大熊猫"),
    body: `熊猫是黑的，也是白的。它慢，但是会上树。

它最喜欢吃竹子。一天要吃很多。吃的时候坐得很安静。

熊猫的孩子很小。妈妈很小心。

很多人去看熊猫。我们站得远一些更好。

熊猫是中国很有名的动物。我们要关心熊猫。
`,
  }),  entry({
    id: "wr-animal-bird",
    category: "science",
    createdAt: 903,
    title: "早上的鸟",
    blurb: "Early calls from the trees, then a quick leave when people come.",
    wikiTitle: "鸟",
    source: cite("鸟"),
    sourceUrl: wikiUrl("鸟"),
    body: `早上门外有鸟叫。声音不大，但是很清楚。

鸟在树上找东西吃。小鸟走得很快。

我在门边看。不想让鸟害怕。鸟看见人，会离开。

妈妈说，鸟也要回家。鸟的家在树上，或者在高的地方。

听鸟叫，我觉得一天开始了。
`,
  }),  entry({
    id: "wr-animal-fish",
    category: "science",
    createdAt: 904,
    title: "水里的鱼",
    blurb: "Fish swim in clean water and need that water to stay clean.",
    wikiTitle: "鱼",
    source: cite("鱼"),
    sourceUrl: wikiUrl("鱼"),
    body: `鱼在水里。鱼没有脚，但是游泳很快。

鱼用身体往前。水从口里进，再从旁边出去。

有的鱼很小，有的很大。颜色也不一样。

我在公园看过鱼。水很干净。鱼在草旁边游泳。

鱼需要干净的水。水不好，鱼也就不高兴。
`,
  }),
];
