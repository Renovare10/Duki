/**
 * Science-process wiki-rewrite shorts (ROI #5 static catalog).
 */
import type { LibraryText } from "../types";
import { entry, wikiUrl, cite } from "./wiki-rewrite-helpers";

export const WIKI_REWRITE_SCIENCE: LibraryText[] = [
  entry({
    id: "wr-sci-rain",
    category: "science",
    createdAt: 910,
    title: "雨是怎么来的",
    blurb: "Water rises, cools into clouds, then falls back as rain.",
    wikiTitle: "雨",
    source: cite("雨"),
    sourceUrl: wikiUrl("雨"),
    body: `太阳很热。河里的水也会变热。水往高处去，我们看不见。

高处冷了，水又变成很小。很多小的在一起，就是云。

云太重了，水会下来。这就是下雨。

水落到河里，也落到地里。花和树需要这些。人也用。

下雨以后，天气常常很好。认识下雨，也是认识天气。
`,
  }),  entry({
    id: "wr-sci-seed",
    category: "science",
    createdAt: 911,
    title: "种子怎样长",
    blurb: "Water and time — then a green tip shows on wet paper.",
    wikiTitle: "种子",
    source: cite("种子"),
    sourceUrl: wikiUrl("种子"),
    body: `老师让我们看一粒东西怎么长。那是种子。我把它放在杯子里。

要有水，但是不能太多。杯子放在亮的地方。

三天以后，绿色的东西出来了。同学都很高兴。

老师告诉我们：花和树需要水、时间和亮的地方。这节课很有意思。

我每天都去看。它长得不快，但是一直在变化。
`,
  }),  entry({
    id: "wr-sci-light",
    category: "science",
    createdAt: 912,
    title: "有光才能看",
    blurb: "Sunlight and lamps help our eyes; shadows appear when light is blocked.",
    wikiTitle: "光",
    source: cite("光"),
    sourceUrl: wikiUrl("光"),
    body: `如果地方太黑，眼睛很难看东西。白天太阳帮助我们看。

太阳的东西走得很快。碰到别的东西，有的回来。回来的进到眼睛，我们才看见。

晚上没有太阳，我们就开灯。灯也帮助我们看。

有的东西挡着，后面就有黑的地方。在灯下动，黑的地方也会动。

认识这些，能帮助我们明白白天和晚上为什么不一样。
`,
  }),  entry({
    id: "wr-sci-sound",
    category: "science",
    createdAt: 913,
    title: "我们怎么听见",
    blurb: "Moving air reaches the ear — near is loud, far is soft.",
    wikiTitle: "声音",
    source: cite("声音"),
    sourceUrl: wikiUrl("声音"),
    body: `有人说话，旁边的空气会动。动到耳朵里，我们就听见声音。

声音在空气里走。在水里也能走。

离得近，声音大。离得远，声音小。很大的声音会让人不高兴。

音乐也是声音。有的高，有的低。我们用耳朵认识声音。

眼睛闭着，你还能听见很多。声音告诉我们旁边有什么。
`,
  }),
];
