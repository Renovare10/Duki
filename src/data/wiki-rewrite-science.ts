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
  }),  entry({
    id: "wr-sci-moon",
    category: "science",
    createdAt: 914,
    title: "月亮为什么会变",
    blurb: "The Moon stays the same; sunlight shows us more or less of it.",
    wikiTitle: "月球",
    source: cite("月球"),
    sourceUrl: wikiUrl("月球"),
    body: `我们看见的月亮，其实是太阳照到它。月亮自己不亮。

月亮绕着我们走。有的时候我们看见很多亮的地方，它就很圆。

有的时候只看见很少，它看起来细。它没有真的变小。

这个星期我常看。昨天和今天可以不一样。

以前的人也看。现在我们知道为什么，觉得更有意思。
`,
  }),  entry({
    id: "wr-sci-water",
    category: "science",
    createdAt: 915,
    title: "水一直在路上",
    blurb: "Water changes place and form — river, cloud, rain — again and again.",
    wikiTitle: "水循环",
    source: cite("水循环"),
    sourceUrl: wikiUrl("水循环"),
    body: `水不会真的没有。水只是换地方，也换样子。

太阳很热。河里的水往高处去。高处冷了，水又下来，成为下雨或者雪。

落到地里的，有的进河。花和树也会用。

人用完以后，很多还可以再回来。

认识水的路，我们就更知道为什么要爱护干净的水。
`,
  }),  entry({
    id: "wr-sci-cloud",
    category: "science",
    createdAt: 916,
    title: "天上的云",
    blurb: "Tiny water in the sky that gathers, drifts, and sometimes falls.",
    wikiTitle: "云",
    source: cite("云"),
    sourceUrl: wikiUrl("云"),
    body: `抬头看，天上常有云。云有白的，也有灰的。

云是很小的水在一起。风来了，云会走。

云很重的时候，可能会下雨。云不高的时候，也可能有雾。

我喜欢看云。有的像动物，有的像船。

认识云，能帮助我们知道天气可能怎么样。
`,
  }),  entry({
    id: "wr-sci-earthquake",
    category: "science",
    createdAt: 917,
    title: "地为什么会动",
    blurb: "The ground can shake; stay calm, protect your head, move to safety.",
    wikiTitle: "地震",
    source: cite("地震"),
    sourceUrl: wikiUrl("地震"),
    body: `有的时候，地会突然动。桌子上的东西也可能动。人叫这地震。

地动的时候，人要安静，先保护头。能离开房间就离开。

老师告诉我们：不要用电梯。要听大人的话。

过后，大家互相帮助。关心邻居也很重要。

认识这些，不是为了害怕，是为了更安全。
`,
  }),
];
