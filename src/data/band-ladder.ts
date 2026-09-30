/**
 * Mid-band original shorts for post-beginner Recommended shelves.
 * Written for Duki (own content). Scored ~5–25% unknown under HSK 1–3 proxy.
 */
import type { LibraryText } from "../types";

function entry(
  partial: Omit<LibraryText, "kind" | "readAt" | "bookmark" | "blurb" | "featured"> & {
    blurb: string;
    featured?: boolean;
  },
): LibraryText {
  return {
    kind: "sample",
    readAt: null,
    bookmark: null,
    featured: false,
    ...partial,
  };
}

export const BAND_LADDER: LibraryText[] = [
  entry({
    id: "band-morning-milk",
    category: "children",
    createdAt: 73,
    title: "早上的牛奶",
    blurb: "Warm milk, a quiet table, and a cat who still prefers fish.",
    body: `早上我起床以后，妈妈给我牛奶。牛奶不冷，也不太热。

我坐在桌子旁边喝。猫也来了。它看我，想喝牛奶。

我不给它牛奶。我给它鱼。它吃了鱼，然后离开了。

今天天气很好。我准备去学校。房间很安静。时间过得真快。

出门以前，作业已经准备好了。我觉得今天会顺利。`,
  }),
  entry({
    id: "band-park-bench",
    category: "children",
    createdAt: 74,
    title: "公园的椅子",
    blurb: "Shade on a bench, kids running past, and a slow walk back.",
    body: `今天天气很好。我和爸爸去公园。公园里有树，也有椅子。

我们坐着休息。爸爸看报纸。我看旁边的花和草。

有孩子在跑步。他们很快乐。狗也在旁边玩。

太阳比较热。我们喝了水，然后准备离开。公园让人休息。

路上风很舒服。爸爸问我明天还来不来。我告诉他还来。`,
  }),
  entry({
    id: "band-class-helper",
    category: "children",
    createdAt: 75,
    title: "帮忙的一天",
    blurb: "Chairs moved, desks cleared, and thanks that feel warm.",
    body: `今天下午，老师请我帮忙。教室里有椅子要搬。

我和同学一起搬。我们搬得慢，但是很认真。桌子也很干净。

老师看了看，告诉我们谢谢。你们做得很好。

离开教室以前，地方已经很干净。帮忙让人高兴。

后来我也帮妈妈拿东西。今天我很累，但是高兴。`,
  }),
  entry({
    id: "band-quiet-night",
    category: "graded",
    createdAt: 76,
    title: "安静的晚上",
    blurb: "Homework done, a short story, and sleep that arrives kindly.",
    body: `晚上九点，房间很安静。爸爸在看报纸。妈妈在旁边休息。

我做完作业，然后看一本短故事。故事不长，但是很有意思。

妹妹已经睡觉了。灯还开着。我把灯关了。

我准备睡觉。明天还要上课。今天过得不错。

窗外有声音。很快我也不听了。明天早上见。`,
  }),
  entry({
    id: "band-doctor-day",
    category: "graded",
    createdAt: 77,
    title: "看医生",
    blurb: "A careful check, medicine that is not sweet, and feeling better.",
    body: `昨天我不太舒服。妈妈带我去医院。

医生问我哪里疼。我告诉他头比较疼。他检查得很认真。

他给我药。药不甜。妈妈让我按时喝。

今天我已经好很多了。我可以去学校。健康真重要。

老师看见我，问我休息得怎么样。我告诉她已经好了。`,
  }),
  entry({
    id: "band-orange-share",
    category: "story",
    createdAt: 78,
    title: "分橘子",
    blurb: "Two oranges, three friends, and a fair split that still tastes sweet.",
    body: `中午我和两个朋友一起吃饭。我带了两个橘子。

朋友看了看。我把橘子分开。每个人都有。我们都吃得很高兴。

同学问我自己够不够。我告诉他够。水果可以一起吃。

下午上课的时候，我觉得橘子不贵，但是一起吃更甜。

晚上我告诉妈妈：今天的水果分完了。她笑了。`,
  }),
  entry({
    id: "band-rabbit-garden",
    category: "children",
    createdAt: 79,
    title: "花园里的兔子",
    blurb: "A soft visitor in the grass, a carrot offered, then empty quiet.",
    body: `昨天我在花园里看见一只兔子。它很小，耳朵很长。

它在草里找东西吃。我站得比较远。不想让它害怕。

妈妈给我胡萝卜。我放在地上。兔子看了看，然后吃了一点。

过了一会儿，它走了。花园又安静了。

今天我又去看。兔子没有来。也许它去了别的地方。`,
  }),
  entry({
    id: "band-bike-learn",
    category: "children",
    createdAt: 80,
    title: "学骑自行车",
    blurb: "Wobbly first tries, eyes forward, and balance that finally stays.",
    body: `周末爸爸教我骑自行车。开始我总是害怕。车左右动。

爸爸在后面帮忙。他告诉我眼睛看前面。不要看脚。

我试了好几次。忽然我可以自己骑一会儿了。风在脸上，很快。

停下来以后，我很累，也很高兴。明天我还想再骑。

妈妈看见了，告诉我进步很快。练习真有用。`,
  }),
  entry({
    id: "band-fruit-shop",
    category: "graded",
    createdAt: 81,
    title: "去买水果",
    blurb: "Apples and bananas, a heavy bag, and a classmate on the road.",
    body: `下午妈妈让我去商店买水果。我买了苹果和香蕉。

东西比较重。我走得很慢。路上遇见同学。他问我去哪里。

我告诉他我买水果。他也要去商店。我们一起走了一会儿。

到了家，妈妈很满意。水果很新鲜。今天的作业我还没有写完。

吃完水果以后，我开始写作业。晚上可以休息了。`,
  }),
  entry({
    id: "band-late-bus",
    category: "graded",
    createdAt: 82,
    title: "晚到的公共汽车",
    blurb: "A delayed bus, cold air at the stop, and class not yet begun.",
    body: `今天早上公共汽车来得很晚。旁边已经站了很多人。风比较冷。

我看了看表。担心会迟到。别人也在等。

车终于来了。上车以后，我找到地方站着。车开得很快。

到学校的时候，课还没有开始。老师看见我，让我坐下。今天运气不错。

下午我告诉同学：早上真着急。他们都笑了。`,
  }),
  entry({
    id: "band-seed-watch",
    category: "science",
    createdAt: 83,
    title: "看种子长大",
    blurb: "Wet paper in a cup, three quiet days, then the first green tip.",
    body: `老师让我们看种子怎么长。我把一粒种子放在杯子里。

要有水，但是不能太多。杯子放在有光的地方。

三天以后，绿色的东西出来了。同学都很高兴。

老师告诉我们：植物需要水、光和时间。这节课很有意思。

我每天都去看。它长得不快，但是一直在变化。`,
  }),
  entry({
    id: "band-bee-help",
    category: "science",
    createdAt: 84,
    title: "蜜蜂来了",
    blurb: "Busy bees on flowers, yellow dust on their legs, fruit waiting ahead.",
    body: `花园里有很多花。蜜蜂在花上飞。它们在找甜的东西。

腿上会带一点黄色的。那是花的部分。老师告诉我们蜜蜂帮助花。

没有它们，有的水果会长得慢。我站得比较远看。

蜜蜂很忙，也不怕人。小动物也有工作。

后来我把今天看见的写在本子上。老师会看。`,
  }),
  entry({
    id: "band-hot-soup",
    category: "graded",
    createdAt: 85,
    title: "一碗热汤",
    blurb: "Steam in the kitchen, a careful sip, and warmth after a long day.",
    body: `晚上比较冷。妈妈在厨房做了热的汤。味道很好。

我帮她拿碗。汤很热。我等了一下，才敢喝。

爸爸下班回来，也喝了一碗。他今天太累了。汤让人舒服。

吃完以后，房间暖起来了。简单的晚饭也可以很好。

睡觉以前，我还想再喝一点。妈妈告诉我明天还有。`,
  }),
  entry({
    id: "band-snow-day",
    category: "story",
    createdAt: 86,
    title: "下雪的早上",
    blurb: "White steps, cold hands, and school that still opens its doors.",
    body: `早上我出门，看见路上都是雪。树也白了。天气很冷。

我穿好衣服。妈妈让我小心走。学校没有关门。

同学在外面玩雪。大家都很高兴。老师进来以后，让我们先休息一下手。

然后开始上课。下午雪还在。路上人很多。

我觉得冬天也可以很有意思。明天也许还有雪。`,
  }),
  entry({
    id: "band-tea-guest",
    category: "graded",
    createdAt: 87,
    title: "客人来喝茶",
    blurb: "Cups ready, polite welcome, and a visit that is not too long.",
    body: `今天下午有客人来。妈妈准备了茶和水果。桌子很干净。

客人进门以后，我们欢迎他们。大家都坐下。茶不太热。

他们谈工作，也谈天气。我在旁边听。有的话我听不太懂。

客人离开以前，谢谢我们。妈妈告诉他们没关系，下次再来。

门关了以后，房间又安静了。待客其实也不简单。`,
  }),
  entry({
    id: "band-moon-change",
    category: "science",
    createdAt: 88,
    title: "月亮在变",
    blurb: "Same moon, different nights — round, then thin, still familiar.",
    body: `这个星期我常在晚上看月亮。有一天它又圆又亮。

两天以后，月亮看起来小了。妹妹觉得奇怪。我告诉她月亮总是在变化。

我们看的时候，有时看见多，有时看见少。月亮自己没有真的变小。

风很轻。灯也亮着。认识月亮，也是一种学习。

明天我还要再看。也许它又会不一样。`,
  }),
  entry({
    id: "band-library-rain",
    category: "graded",
    createdAt: 89,
    title: "雨天去图书馆",
    blurb: "An umbrella, quiet shelves, and a book that stays dry going home.",
    body: `今天下雨了。我带着伞去图书馆。路上有水，但是衣服没有湿。

图书馆里很安静。我找到一本故事书，坐下来看。时间过得很快。

离开以前，我借了那本书。阿姨看了看我的卡，告诉我可以。

雨还没有停。我在灯下看书。外面冷，房间里很舒服。

这本书不长。我想明天就看完。`,
  })
];
