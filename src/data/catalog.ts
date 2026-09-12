/**
 * Built-in library. Original stories, articles, and graded paragraphs
 * were written for Duki. A handful of Tang poems / primers are public
 * domain (authors died centuries ago); those entries cite a source.
 * Do not add copyrighted graded readers or commercial books.
 */
import type { LibraryText } from "../types";
import { wikiStubs } from "../lib/wiki";
import { wikisourceStubs } from "../lib/wikisource";

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

const OWNED: LibraryText[] = [
  entry({
    id: "sample-home",
    category: "graded",
    createdAt: 1,
    title: "我的家",
    blurb: "A small family, tea, books, and a quiet Beijing evening.",
    body: `我叫小明。我是学生。我住在北京。

我家有三个人：爸爸、妈妈和我。爸爸喜欢喝茶。妈妈喜欢看书。我喜欢吃饭。

今天天气很好。家里不冷。我们都很高兴。`,
  }),
  entry({
    id: "sample-tea",
    category: "graded",
    createdAt: 2,
    title: "请喝茶",
    blurb: "Hot tea, a cup, and the first polite words you need.",
    body: `我喜欢喝茶。妈妈喝茶，爸爸也喝茶。

我们家有杯子。杯子里是茶。茶很热，不冷。

请喝茶。谢谢。不客气。`,
  }),
  entry({
    id: "sample-school",
    category: "graded",
    createdAt: 3,
    title: "我的学校",
    blurb: "Morning class, a teacher’s hello, and learning Chinese.",
    body: `我是学生。我的学校不大。学校里有老师和同学。

今天上午我去学校。老师说：“你好！”我说：“老师好！”

我喜欢学习汉语。我还要学习。我的同学也喜欢汉语。`,
  }),
  entry({
    id: "sample-shop",
    category: "graded",
    createdAt: 4,
    title: "去商店买东西",
    blurb: "Apples, prices, and not quite enough money.",
    body: `今天下午我想去商店。商店里有很多东西。

我要买水果。苹果多少钱？这个苹果五块钱。我喜欢吃苹果，也喜欢吃米饭。

我没有很多钱，所以我买两个苹果。谢谢！`,
  }),
  entry({
    id: "sample-weekend",
    category: "graded",
    createdAt: 5,
    title: "星期六",
    blurb: "A taxi, a film at seven, and a doctor for a friend.",
    body: `今天是星期六。我没有去学校。我和朋友一起去看电影。

电影是晚上七点。我们坐出租车去。朋友是医生，他在医院工作。

电影很好。我们都很高兴。明天我要学习汉语。`,
  }),
  entry({
    id: "graded-restaurant",
    category: "graded",
    createdAt: 6,
    title: "在饭馆",
    blurb: "Lunch with mum in a busy little restaurant.",
    body: `中午我和妈妈去饭馆吃饭。饭馆不大，可是人很多。

我们要米饭、菜和茶。菜很好吃。我吃了很多。

妈妈问我：“你还要什么？”我说：“我不要了。谢谢。”`,
  }),
  entry({
    id: "graded-day",
    category: "graded",
    createdAt: 7,
    title: "我的一天",
    blurb: "From seven in the morning until the house is full again.",
    body: `我每天早上七点起床。我吃饭，然后去学校。

上午我学习汉语。中午我和同学一起吃饭。下午我看书。

晚上我回家。爸爸妈妈都在家。我很高兴。`,
  }),
  entry({
    id: "graded-park",
    category: "graded",
    createdAt: 8,
    featured: true,
    title: "去公园",
    blurb: "Trees, water, and a book under the shade.",
    body: `今天天气很好。我和朋友去公园。公园里有水，也有很多树。

我们看见小孩子。他们在玩。朋友说：“我们坐一会儿吧。”

我们坐在树下看书。晚上我们回家。`,
  }),
  entry({
    id: "graded-phone",
    category: "graded",
    createdAt: 9,
    title: "打电话",
    blurb: "A short call home while mum is still at the hospital.",
    body: `晚上我想给妈妈打电话。妈妈在医院工作，她很忙。

我说：“妈妈，我在家。我已经吃饭了。”妈妈说：“很好。你先看书，我一会儿回家。”

我说：“好。再见。”`,
  }),
  entry({
    id: "graded-train",
    category: "graded",
    createdAt: 10,
    title: "坐火车",
    blurb: "Tickets, a window seat, and the city sliding away.",
    body: `明天我要坐火车去上海。火车是上午九点。

我买了票。我的座位在窗边。我可以看到树、水和很多房子。

车上有人看书，有人说话。我觉得火车很快，也很安静。`,
  }),
  entry({
    id: "child-cat",
    category: "children",
    createdAt: 11,
    title: "小猫",
    blurb: "A small white cat who likes tables more than rules.",
    body: `我有猫。猫很小。猫是白色的。

猫喜欢吃饭。猫喜欢睡觉。我喜欢我的猫。

今天猫在桌子上。我说：“下来！”猫下来了。`,
  }),
  entry({
    id: "child-rain",
    category: "children",
    createdAt: 12,
    title: "下雨了",
    blurb: "A rainy day indoors, then a walk to see classmates.",
    body: `今天下雨了。我不上学。我在家看书。

爸爸在家喝茶。妈妈在家吃饭。我们都不冷。

下午不下雨了。我去学校看同学。`,
  }),
  entry({
    id: "child-friend",
    category: "children",
    createdAt: 13,
    title: "我的朋友",
    blurb: "David likes apples. You like rice. Saturday is for the shop.",
    body: `我有一个朋友。他叫大卫。他是学生。我们一起去学校。

他喜欢苹果。我喜欢米饭。我们都喜欢汉语。

星期六我们去商店。我们买水果。我们很高兴。`,
  }),
  entry({
    id: "child-birthday",
    category: "children",
    createdAt: 14,
    title: "妈妈的生日",
    blurb: "Tea, a book, and a dinner that tastes like thanks.",
    body: `今天是妈妈的生日。我很高兴。

我给妈妈买茶。爸爸给妈妈买书。妈妈说：“谢谢。我很喜欢。”

晚上我们在家吃饭。菜很好吃。我们都爱妈妈。`,
  }),
  entry({
    id: "child-moon",
    category: "children",
    createdAt: 15,
    featured: true,
    title: "月亮船",
    blurb: "If the moon is a boat, who is sitting in it?",
    body: `晚上，我看见月亮。月亮又大又圆。

我说：“月亮像一只船。”妹妹问：“船上有谁？”

我说：“有一只猫。猫在看我们。”妹妹笑了。我们也看月亮。`,
  }),
  entry({
    id: "child-socks",
    category: "children",
    createdAt: 16,
    title: "一只袜子",
    blurb: "One sock is missing. The cat knows nothing. Obviously.",
    body: `早上我要去学校。我找到一只袜子，可是另一只袜子没有了。

我问猫：“你看见袜子了吗？”猫不说话。它只是看我。

后来我在床下找到了。袜子在猫的旁边。我说：“原来是你！”`,
  }),
  entry({
    id: "child-goose",
    category: "children",
    createdAt: 17,
    title: "咏鹅",
    blurb: "A white goose, green water, and red feet.",
    source: "Public domain · 骆宾王",
    body: `鹅，鹅，鹅，
曲项向天歌。
白毛浮绿水，
红掌拨清波。`,
  }),
  entry({
    id: "story-lantern",
    category: "story",
    createdAt: 18,
    featured: true,
    title: "河边的灯",
    blurb: "An old lamp, a night river, and a stranger who still remembers.",
    body: `村子旁边有一条河。河边有一盏旧灯。每天晚上，灯都会亮。

有一天，灯不亮了。村里的人说：“没有灯，路太黑了。”小孩子不敢走。

一个老人来了。他修好了灯。他说：“我小时候也怕黑。灯不只是灯，它是回家的路。”

从那天起，灯每天晚上都亮着。河水走，灯还在。`,
  }),
  entry({
    id: "story-well",
    category: "story",
    createdAt: 19,
    title: "井边的兔子",
    blurb: "A rabbit looks down a well and decides the sky has fallen.",
    body: `一只兔子在井边喝水。它看见水里有圆圆的东西，就大叫：“天掉下来了！”

它跑去告诉朋友。朋友也跑。很多动物一起跑。它们都很怕。

后来一只老羊来了。老羊看了看井，笑着说：“那不是天。那是月亮。你们跑什么呢？”

兔子低下头。风很轻。井水还是那么圆。`,
  }),
  entry({
    id: "story-fox",
    category: "story",
    createdAt: 20,
    title: "狐狸和葡萄",
    blurb: "The grapes are high. The story you tell yourself is higher.",
    body: `一只狐狸走了很远，肚子很饿。它看见墙上有紫葡萄。

狐狸跳了一次，没有吃到。又跳一次，还是没有。它坐在地上，看了很久。

最后它走了。它说：“那些葡萄一定是酸的。我不想吃。”

路边的鸟听见了。鸟想：葡萄甜不甜，它其实不知道。`,
  }),
  entry({
    id: "story-mountain",
    category: "story",
    createdAt: 21,
    title: "山上的风",
    blurb: "Two sisters climb for the view and come down with the wind.",
    body: `姐姐和妹妹去爬山。山不高，可是风很大。

到了山顶，她们看见河、树和很小的房子。妹妹说：“我们的家在哪里？”

姐姐指着远处：“在那儿。灯已经亮了。”

下山的时候，风从后面推她们。妹妹说：“原来风也会送人回家。”`,
  }),
  entry({
    id: "story-market-thief",
    category: "story",
    createdAt: 22,
    title: "市场里的橘子",
    blurb: "A boy takes one orange. The stall remembers his name.",
    body: `星期六，市场很热闹。小明看见橘子又圆又亮。他没有钱，可是他拿了一个。

卖橘子的奶奶看见了。她没有生气。她说：“你叫什么名字？”

“我叫小明。”

奶奶说：“小明，橘子可以吃。下次来，帮我搬箱子。我们就算清楚了。”

小明点头。他吃橘子的时候，觉得橘子很甜，也很重。`,
  }),
  entry({
    id: "story-night-bus",
    category: "story",
    createdAt: 23,
    title: "夜班车",
    blurb: "The last bus, a forgotten bag, and a driver who waits one extra stop.",
    body: `晚上十一点，最后一班车来了。车上人不多。一个女孩睡着了，包还在旁边。

到站的时候，她还没醒。司机看了看她，没有马上开车门。车又往前走了一小段。

女孩醒来，很不好意思。司机说：“没关系。夜班车最怕的不是晚，是有人把家忘在车上。”

她下了车。街上很安静。包还在她手里。`,
  }),
  entry({
    id: "story-jingyesi",
    category: "story",
    createdAt: 24,
    title: "静夜思",
    blurb: "Frost on the floor — or moonlight, and a hometown far away.",
    source: "Public domain · 李白",
    body: `床前明月光，
疑是地上霜。
举头望明月，
低头思故乡。`,
  }),
  entry({
    id: "sci-moon",
    category: "science",
    createdAt: 25,
    title: "月亮为什么会变",
    blurb: "Why the moon is a coin one week and a boat the next.",
    body: `我们晚上看见月亮。有时它又圆又亮，有时它像一只小船。

月亮自己不会变形状。它绕着地球走。太阳的光照在月亮上，我们从地球上看，有时看见全部的光，有时只看见一部分。

所以不是月亮变了，是我们看见的那一面在变。下次你看月亮，可以问：今晚我看见了多少光？`,
  }),
  entry({
    id: "sci-rain",
    category: "science",
    createdAt: 26,
    title: "雨从哪里来",
    blurb: "Water leaves the river, visits the sky, and comes home again.",
    body: `下雨的时候，地上会湿，河里的水会多。可是雨是从哪里来的？

太阳很热。河里、海里的水会变成很小的水汽，飞到天上去。天上冷，水汽又变成小水点。小水点聚在一起，就是云。云太重了，就落下来。这就是雨。

雨落到地里，又会流回河里。水一直在路上，从来没有真正离开。`,
  }),
  entry({
    id: "sci-ant",
    category: "science",
    createdAt: 27,
    title: "蚂蚁的家",
    blurb: "A city under the path, built by animals smaller than a grain of rice.",
    body: `你走路的时候，可能会踩过蚂蚁的家。蚂蚁很小，可是它们的家很大。

地下有很多路。有的地方放食物，有的地方住小蚂蚁。它们用触角说话，告诉朋友：这边有甜的东西。

一只蚂蚁搬不了多少。很多蚂蚁一起搬，就能把一片叶子运回家。所以蚂蚁不是一个人生活。它们是一个小城市。`,
  }),
  entry({
    id: "sci-space",
    category: "science",
    createdAt: 28,
    featured: true,
    title: "我们去太空",
    blurb: "Earth is a blue stone. Leaving it takes fire, food, and a very good door.",
    body: `地球在太空里。它是蓝色的，因为有很多水。人要离开地球，需要很快的速度，也需要很热的火。

火箭像一只倒过来的船。它把人送到高处。太空里没有空气，所以人要穿衣服，还要带水、食物和空气。

在太空里，东西会漂。水会变成圆球。睡觉的时候，人要固定在墙上，不然会在船里飞来飞去。

从那里看地球，没有国界，只有云和海。很多人说，那是他们见过的最安静的家。`,
  }),
  entry({
    id: "sci-magnet",
    category: "science",
    createdAt: 29,
    title: "磁铁的秘密",
    blurb: "Two invisible hands: one pulls, one pushes.",
    body: `磁铁看起来只是一块铁。可是它旁边有一只看不见的手。

这只手能拉住一些东西，比如小钉子。两块磁铁靠近的时候，有时会拉在一起，有时会推开。那是因为它们有两极：一端叫南，一端叫北。

地球也是一块很大的磁铁。所以指南针会指出方向。古人用这个办法走很远的路，过海，也不迷路。`,
  }),
  entry({
    id: "sci-seed",
    category: "science",
    createdAt: 30,
    title: "一粒种子",
    blurb: "A seed looks asleep. Underground, it is making a decision.",
    body: `一粒种子看起来什么都没有做。它又小又硬。可是把它放进土里，浇一点水，等几天，土会裂开。

种子里有一点点食物。它先向下长根，再向上长叶子。根找水，叶子找光。

没有光，叶子会发黄。没有水，根会停。植物不会走路，可是它们一直在选择：往哪儿长，才能活下去。`,
  }),
  entry({
    id: "hist-silk",
    category: "history",
    createdAt: 31,
    featured: true,
    title: "丝绸之路",
    blurb: "Not one road. A long conversation made of silk, spice, and dust.",
    body: `很久以前，中国有很漂亮的丝。西方的人很想要。于是有人赶着骆驼，走过沙漠，把丝送到很远的地方。

这条路后来被叫做丝绸之路。路上不只是丝。还有香料、玻璃、纸，还有故事。不同地方的人见面，学习彼此的字和吃的东西。

路很长，也很危险。可是人还是走。因为他们相信：远方有人等着这些东西，也等着这些话。`,
  }),
  entry({
    id: "hist-paper",
    category: "history",
    createdAt: 32,
    title: "纸的故事",
    blurb: "Before paper, words were heavy. Then they learned to fly.",
    body: `以前，中国人把字写在竹片上，或者写在很贵的丝上。竹片太重，丝太贵。书很难搬，也很难给很多人看。

后来有人做出了纸。纸又轻又便宜。字可以写在上面，也可以印在上面。书变多了，学校也更容易了。

纸从中国走到世界。今天你手里的每一页，都还记得那个办法：让字变得轻，让人变得近。`,
  }),
  entry({
    id: "hist-wall",
    category: "history",
    createdAt: 33,
    title: "长城",
    blurb: "A wall that tried to hold a country, and ended up holding a story.",
    body: `长城在山上，也在风里。它不是一天建成的。很多年前，不同的人在不同的地方修墙，后来连在一起。

墙的用处是看远方，也是让路变慢。士兵站在墙上，看有没有人来。晚上点灯，白天举旗。

现在很多人来走长城。他们走得很慢。风很大。墙还在，可是它已经不是为了打仗。它变成了一个很长的问题：人为什么要分开，又为什么要来看分开的地方？`,
  }),
  entry({
    id: "hist-compass",
    category: "history",
    createdAt: 34,
    title: "指南针",
    blurb: "A spoon of magnetite, then a needle that found south for ships.",
    body: `中国很早就发现：有的石头会指向一个方向。开始的时候，它像一把勺子，放在盘子上，勺子的柄指向南方。

后来人们做出更小的针。针放在水上，或者放在盒子里。船在海里，看不见山，可是还能知道哪边是南。

有了指南针，远行不再只靠太阳和星星。天阴的时候，针还在工作。世界因此变大了，也更连在一起了。`,
  }),
  entry({
    id: "hist-zhenghe",
    category: "history",
    createdAt: 35,
    title: "郑和出海",
    blurb: "Giant ships, a long coast, and gifts instead of an empire.",
    body: `明朝的时候，有一个人叫郑和。皇帝让他带很多船出海。船很大，人也很多。他们走得很远，到过今天的东南亚、印度，还到过非洲。

船上有礼物，有士兵，也有会说话的人。他们不是去占别人的家，更多是去见面、交换东西、告诉别人中国在哪里。

海很大。有的人再也没有回来。可是地图上多了新的线。线的一端是中国的港口，另一端是别人的港口。两边都记得那些船。`,
  }),
  entry({
    id: "hist-oracle",
    category: "history",
    createdAt: 36,
    title: "骨头上的字",
    blurb: "Questions to the sky, scratched on bone, still readable now.",
    body: `三千多年前，人想知道未来。他们把问题刻在骨头或者龟甲上，然后用火烤。骨头裂开，裂开的纹像一种回答。

这些字现在还能看见。那是很早的汉字。有的问会不会下雨，有的问战争，有的问孩子。

我们今天写的字，就是从那些裂开的线里走出来的。人一直在问。只是现在，我们把问题写在纸上，或者打在灯里。`,
  }),
  entry({
    id: "article-market",
    category: "article",
    createdAt: 37,
    title: "周末的市场",
    blurb: "Tomatoes, bargaining, and a city that still talks with its hands.",
    body: `这个城市有很多商店，可是周末的市场还是很忙。人来买菜、买花、买刚做好的包子。

卖菜的人会说：“你看，这个红。今天刚到。”买菜的人会说：“便宜一点吧。”他们不是真的生气。这是一种见面的办法。

市场里有声音，有水，有纸袋。年轻人用手机付钱，老人还是喜欢现金。两种办法排在同一条路上。太阳升高的时候，空箱子开始多起来。`,
  }),
  entry({
    id: "article-library",
    category: "article",
    createdAt: 38,
    title: "城市里的图书馆",
    blurb: "Free chairs, quiet light, and a door that does not ask what you earn.",
    body: `图书馆在路中间。门是开的。任何人都可以进去。不需要买东西。

里面有桌子、灯和很多椅子。有人写作业，有人看报，有人只是坐着。夏天的时候，这里比较凉快。冬天的时候，这里比较暖。

有人说现在都用手机，图书馆没有用了。可是每天下午，椅子还是会满。也许人需要的不只是字，还需要一个可以安静坐着的地方。`,
  }),
  entry({
    id: "article-bike",
    category: "article",
    createdAt: 39,
    title: "自行车的城市",
    blurb: "Shared bikes, short trips, and a morning that sounds like bells.",
    body: `很多城市的路边有共享单车。打开手机，就能骑走。到了地方，把它停好。

早上，路上有车，也有自行车。自行车比较慢，可是更近。你能看见店，能听见人说话。下雨的时候，骑车的人会少一些。太阳出来，又会多起来。

有人说这是新的。其实很早以前，这座城市里就有很多自行车。只是颜色换了，锁换了。人还是想用自己的腿，走完那一小段路。`,
  }),
  entry({
    id: "article-night",
    category: "article",
    createdAt: 40,
    title: "夜里的便利店",
    blurb: "The city sleeps in shifts. The store by the station does not.",
    body: `半夜十二点，大部分店都关了。车站旁边的便利店还亮着。灯很白。里面有面包、水和方便面。

来买东西的人不多。有刚下班的人，有刚下车的人，有说不出为什么还没回家的人。店员很少说话。她把东西放进袋子，说：“谢谢，慢走。”

便利店像一个很小的白天。它不解决大问题。它只是让夜里的人，还能找到热的东西。`,
  }),
  entry({
    id: "article-trees",
    category: "article",
    createdAt: 41,
    title: "公园里的新树",
    blurb: "The city planted a row of trees. Shade is a kind of news.",
    body: `这个星期，公园里多了一排小树。它们还不很高。每棵树旁边有一点水，还有一张小纸：什么时候种的，叫什么名字。

来走路的人会停一下。有人拍照。有人说：“再过几年，夏天会凉快一点。”小孩子问，树会不会搬家。大人说，树就住在这里。

城市常常修路、修房子。树看起来很慢。可是慢的东西，常常会留下来。`,
  }),
  entry({
    id: "novel-south-1",
    category: "novel",
    createdAt: 42,
    featured: true,
    seriesId: "south-wind",
    chapter: 1,
    title: "南风镇 · 一",
    blurb: "Chapter one: a town that smells like river water and fried dough.",
    body: `南风镇在两条河中间。早上，雾还没散，船上的人已经在喊。他们卖鱼，卖青菜，也卖热的豆浆。

林夏十六岁。她住在桥边的老房子里。窗户一开，就能看见水。水不高，可是一年里总有几天，会爬到台阶上。那几天，猫会坐到桌子上，好像桌子才是岸。

她妈妈在镇口开了一家很小的店，卖笔、本子和给学校用的纸。林夏放学以后来帮忙。她认得每一种本子的价格，也认得哪些孩子会在付钱的时候看别处。

有一天下午，一个外地男人走进来。他的包很旧。他要一张镇地图。林夏说：“我们没有地图。可是你要去哪里，我可以告诉你。”

男人笑了。他说他要找一条已经没有的路。林夏不知道该说什么。镇上的路她都认识。没有的路，她还没有走过。

晚上，雾又来了。桥上的灯一只一只亮起来。林夏把店门关上。河还在动。她想，也许没有的路，是从水上开始的。`,
  }),
  entry({
    id: "novel-south-2",
    category: "novel",
    createdAt: 43,
    seriesId: "south-wind",
    chapter: 2,
    title: "南风镇 · 二",
    blurb: "Chapter two: the stranger’s list, and a boat that leaves before dawn.",
    body: `第二天，那个男人又来了。这次他带了一张纸。纸上有几个地名。有的林夏知道，有的她只在老人的话里听过。

“杨树码头还在吗？”他问。

“在。可是现在很少有船。”林夏说。“要早。天没亮他们就走。”

男人点头。他买了两支笔，付钱的时候钱有点皱。林夏的妈妈从里屋出来，看了他一眼，没有多问。南风镇的人习惯外地人路过，不习惯外地人留下来。

天还黑的时候，林夏就醒了。她不是要去码头。她只是听见水声比平常大。她走到桥上，看见一盏灯在动。那是船。男人坐在船尾，包还是那么旧。

船走了。雾把它慢慢吃掉。林夏站了很久。她第一次觉得，自己认识的镇子，也有她没看见的早晨。

放学以后，她把那几个地名抄在新本子的第一页。她写：有的路不在地上。有的路会在天亮以前离开。`,
  }),
  entry({
    id: "novel-river-1",
    category: "novel",
    createdAt: 44,
    seriesId: "river-kids",
    chapter: 1,
    title: "河上的孩子 · 一",
    blurb: "Chapter one: summer, a borrowed boat, and a promise not to tell.",
    body: `夏天，河水会变黄。阿年的爷爷说，那是山上的土下来了。阿年不喜欢黄。他喜欢清的时候，能看见石头。

他有一个朋友叫小北。小北的家在河对岸。要见面，得走桥，或者用爷爷的小船。桥上人多。船比较快，也比较像秘密。

有一天他们把船解开，没有告诉大人。河看起来很熟。他们以为熟的东西不会变。船到了河中间，风来了。水不再像路，更像一张自己会动的桌子。

小北抓住船边。阿年抓住桨。他们没有说话。岸上的树一会儿近，一会儿远。阿年想起爷爷说过：河不是你的。你只是从它身上经过。

他们终于碰到对岸的草。草很滑。两人爬上去，坐了很久，才把船拉好。小北说：“我们不要告诉他们。”阿年说：“好。可是我们要记住。记住比告诉更有用。”

回家的时候，天已经红了。爷爷在门口修网。他看了看他们的鞋，鞋是湿的。他什么也没问。他把网放下，去烧水。好像所有从河里回来的人，都值得先喝一口热的。`,
  }),
  entry({
    id: "novel-south-3",
    category: "novel",
    createdAt: 46,
    seriesId: "south-wind",
    chapter: 3,
    title: "南风镇 · 三",
    blurb: "Chapter three: the empty dock, a name on a crate, and rain that does not ask.",
    body: `第三天没有船。林夏还是去了码头。水很平，像一张没有写过字的纸。杨树叶子轻轻响，可是没有人解开绳子。

她在岸边走来走去。木头湿的，鞋会响。一只猫从网堆里出来，看了她一眼，又回去睡。猫比人更早知道：今天没有远方。

店里，妈妈把新到的本子码好。她问：“你昨天那么早出去，看见什么了？”林夏说：“雾。还有一条已经走了的船。”妈妈没有再问。南风镇的人习惯把话说一半，另一半留给河。

下午来了一个送信的人。信不是给林夏的，是给店的。纸上只有一行字，字很慢，像老人写的：如果有人找杨树码头，让他等雨停。林夏把信读了两遍。她想起那个旧包。男人走的时候，天还没亮。雨是中午才开始的。

雨很大。桥变成一条发亮的线。有人在桥下躲，有人还在走。林夏把店门关上一条缝，留一点风。风里有河的味道，也有纸的味道。她把那几个地名又抄了一遍，在旁边写：等雨停。

晚上灯亮得很早。猫又来了，坐在门槛上，看外面的水。林夏说：“你也在等吗？”猫不回答。它只是把眼睛闭上，好像所有要来的人，都会自己找到路。

雨停的时候已经很晚。码头还是空的。可是绳子湿了，说明有东西刚刚离开，或者刚刚想离开。林夏站在那里，把灯举高一点。她不知道自己在给谁照路。她只知道，南风镇的夜很长，长到足够让一句没有说完的话，慢慢变成明天。`,
  }),
  entry({
    id: "novel-river-2",
    category: "novel",
    createdAt: 47,
    seriesId: "river-kids",
    chapter: 2,
    title: "河上的孩子 · 二",
    blurb: "Chapter two: the net, the lie they did not tell, and a map drawn in mud.",
    body: `第二天阿年没有去找小北。他帮爷爷晒网。网很大，像一层一层的影子。太阳一晒，水珠就变成很小的光。

爷爷说：“河会记住谁从它身上走过。”阿年问：“它会告诉别人吗？”爷爷笑：“河不说话。它只把鞋上的泥留下。”

阿年低头看自己的鞋。泥已经干了，裂开，像一张没有完成的地图。他用手指在泥上画了一条线，从这边到对岸。线走到一半，断了。

傍晚小北还是来了。他站在桥上，不下来。阿年走过去。两人靠着栏杆，看水。水比昨天清一点，石头又露出来。小北说：“我回家以后，妈妈问我为什么头发是湿的。我说我洗脸。”

阿年说：“这也算记住。”

他们又去看那只船。船还在草里，像一头睡着的动物。爷爷没有把它藏起来，也没有把它锁起来。阿年忽然明白：大人有时候看见了，只是选择先烧水。

夜里，风从河上过来。阿年躺在床上，听木头轻轻响。他想，秘密不是为了藏。秘密是为了让下一次过河的时候，手更稳一点。他把那句话又说了一遍，很小声：河不是你的。你只是从它身上经过。

窗外有一只鸟叫。对岸也有灯。灯很远，可是一直在。阿年把灯当成小北的家。他想，明天如果风小，他们可以再走一次。不是为了逃，是为了知道自己还敢不敢。`,
  }),
  entry({
    id: "novel-river-3",
    category: "novel",
    createdAt: 48,
    seriesId: "river-kids",
    chapter: 3,
    title: "河上的孩子 · 三",
    blurb: "Chapter three: they take an adult along, and the river becomes a road again.",
    body: `第三天风真的小了。阿年以为小北不会来。结果小北来了，还带着一个大人：他的舅舅。舅舅在镇上修船。他看见那只小船，蹲下来摸了摸船边，说：“你们把它弄到对岸了？还活着，算你们运气好。”

阿年脸热。小北看别处。舅舅没有骂。他把桨放正，说：“河中间的风，不是跟你们作对。它只是比你们早到。下次要去，叫我。我不是要看你们，我是要让船还认得回家的路。”

他们三个人把船推回水里。这一次很慢。舅舅坐在后面，不怎么说话。船到河中间的时候，水还是会动，可是不再像一张自己会翻的桌子。阿年看见石头在下面走。小北把手放在水上，很快又拿回来。

到了对岸，舅舅让他们自己爬上去。他说：“你们在这里玩。太阳偏了，我们回去。记住，过河不是秘密。过河是一件要慢慢学的事。”

阿年坐在草上。草还是滑。可是今天他不怕。他看对岸自己的家，看网，看那条已经熟悉的线。小北说：“我们还是不要把所有话都告诉他们。”阿年说：“有的话可以留着。有的话要说出来，船才会更稳。”

回家的时候，天还早。爷爷在门口，水已经烧好。他看了看舅舅，点一点头。好像所有从河里回来的人，都还是值得先喝一口热的。阿年把杯子捧在手里。水很普通。普通的东西，有时候最像岸。`,
  }),
  entry({
    id: "novel-lamp-1",
    category: "novel",
    createdAt: 49,
    seriesId: "old-lamp",
    chapter: 1,
    title: "旧灯 · 一",
    blurb: "A longer series: a broken streetlamp, and the girl who keeps a notebook of nights.",
    body: `巷子里有一盏旧灯。它不算好看，铁皮都锈了。可是每天晚上六点，它会亮。亮得很稳，像一个不会迟到的人。

陈小雨住在灯下面。她的窗户对着巷子。她有一个本子，专门写灯什么时候亮，什么时候不亮。大多数日子，灯都很守时。只有下雨的夜里，它会闪两下，再稳住。

有一天它没有亮。巷子一下子变得很长。小雨坐在窗边，把笔拿出来，写：灯灭了。她写完，又觉得这句话太短，不像真的。

楼下有人走路，用手电。手电的光一跳一跳。有人骂，有人笑。小雨的爸爸说：“明天会有人来修。”小雨问：“谁修灯？”爸爸说：“修灯的人。他们白天来，晚上我们就看不见他们。”

小雨把这句话也写下来。她忽然想到：灯亮的时候，我们看不见修灯的人。灯灭的时候，我们才想起灯。很多东西都是这样。桌子、路、河。它们好好工作的时候，人就从旁边走过去。

夜里她没有睡。她把蜡烛点上，光很小，把本子照成一块黄。她写：如果我是灯，我也想有人记得我灭掉的那一天。写完她觉得自己有点可笑。可是她没有把那一行划掉。`,
  }),
  entry({
    id: "novel-lamp-2",
    category: "novel",
    createdAt: 50,
    seriesId: "old-lamp",
    chapter: 2,
    title: "旧灯 · 二",
    blurb: "Chapter two: the repairman comes at noon, and leaves a story in the rust.",
    body: `第二天中午，真的来了一个人。他背着一个箱子，箱子很重。他站在灯下，抬头看了很久，像在认一个老朋友。

小雨从窗口看见他。她想下去问，又怕问得太快。她把本子夹在胳膊下，慢慢走下楼。

“灯会亮吗？”她问。

修灯的人还在拧螺丝。他说：“会。它只是累了。铁累了，线也累了。东西用得久，就会有一天不想说话。”

小雨把本子翻开给他看。密密的日期。修灯的人笑了一下，不是嘲笑。他说：“你比我们还认真。我们只在它灭的时候来。你在它亮的时候就看着它。”

他把旧零件放进箱子。一块锈掉的铁，小小的，像一枚不想用的钱。小雨问能不能看。他放在她手里。铁很轻，边缘不尖。他说：“你留下也行。它已经不做灯了。它可以做记得。”

傍晚六点，灯又亮了。巷子恢复成原来的长度。小雨把那块铁放在本子里，当书签。她写：灯回来了。修灯的人白天来过。我看见了他。

她坐在窗边，看那一小块光。光还是那么普通。普通得像水，像路，像所有我们以为会永远在的东西。可是她知道，永远不是一种颜色。永远是有人愿意在中午过来，把螺丝拧紧。`,
  }),
  entry({
    id: "child-three-char",
    category: "children",
    createdAt: 45,
    title: "三字经（节选）",
    blurb: "The old primer: people start out close, then learning pulls them apart.",
    source: "Public domain · 传统蒙学",
    body: `人之初，性本善。
性相近，习相远。
苟不教，性乃迁。
教之道，贵以专。
昔孟母，择邻处。
子不学，断机杼。`,
  }),
  entry({
    id: "band-dumplings",
    category: "children",
    createdAt: 51,
    title: "奶奶包饺子",
    blurb: "Cabbage, flour, and a dumpling that does not look like the others.",
    body: `星期六早上，厨房里很香。奶奶在包饺子。桌上有白菜、肉和面。

我问：“我可以帮忙吗？”奶奶说：“可以。手要干净。”

我学着包。第一个饺子不好看。奶奶笑了：“没有关系。好吃就行。”

我们包了很多。中午全家人一起吃。饺子很热。我觉得今天比上学还高兴。`,
  }),
  entry({
    id: "band-wet-dog",
    category: "children",
    createdAt: 52,
    title: "小狗湿了",
    blurb: "Rain, a small dog, and a towel by the door.",
    body: `下午忽然下雨了。我从学校往家跑。门口有一只小狗，毛都湿了。

它看我，不走。我说：“你是谁家的？”它不说话，只是站着。

我打开门，给它一块布。它抖了抖毛，水都在地上。

过了一会儿，邻居来找它。邻居说：“谢谢。它怕打雷。”小狗回家了。家里又安静了。`,
  }),
  entry({
    id: "band-recess",
    category: "children",
    createdAt: 53,
    title: "课间十分钟",
    blurb: "Ten minutes, a ball, and a teacher who is not in a hurry.",
    body: `下课了。同学们都出去了。有人跑步，有人说话，有人喝水。

小华问我：“要不要一起玩球？”我说：“要。可是时间很短。”

我们在操场上跑。球飞得很快。老师在旁边看，她也笑了。

铃又响了。我们回到教室。衣服有一点热。我觉得十分钟也很长。`,
  }),
  entry({
    id: "band-backpack",
    category: "children",
    createdAt: 54,
    title: "新书包",
    blurb: "A new bag, too many books, and a walk that feels longer.",
    body: `妈妈给我买了新书包。书包是蓝色的，上面有一只小鸟。

我把书都放进去。书包一下子变重了。我背着它去学校。

同学说：“很好看。”我很高兴。可是路上我觉得有点累。

放学以后，我把不用的书拿出来。明天书包会轻一点。我还是喜欢这只小鸟。`,
  }),
  entry({
    id: "band-upstairs-cat",
    category: "children",
    createdAt: 55,
    title: "楼上的猫",
    blurb: "The cat upstairs visits, then remembers who feeds it.",
    body: `我们楼上有一只猫。它常常坐在窗户边看人。

今天它走到我家门口。我给它一点鱼。它吃完，还不走。

妈妈说：“它不是我们的。”我说：“我知道。可是它好像很饿。”

晚上，楼上的阿姨来找它。猫一下子就回家了。阿姨说：“它每天都要下来看看。”`,
  }),
  entry({
    id: "band-baozi",
    category: "children",
    createdAt: 56,
    title: "放学买包子",
    blurb: "Steam in the street, two buns, and not quite enough for three.",
    body: `放学以后，校门口有人卖包子。包子很热，味道很好。

我和同学去买。一个包子两块钱。我买了两个。

同学说：“我也要。”可是他没有带钱。我说：“我先给你一个。明天你再给我。”

我们站在路边吃。风有一点冷。包子在手里很暖。我觉得回家的路变短了。`,
  }),
  entry({
    id: "band-exam",
    category: "graded",
    createdAt: 57,
    title: "今天有考试",
    blurb: "A short test, a slow pencil, and tea at home afterwards.",
    body: `今天上午有考试。我昨天晚上看书看到很晚。

进教室的时候，我有一点紧张。老师说：“不要怕。你会的就会。”

题目不是很难。可是我写得慢。下课的时候，我才写完。

回家以后，妈妈问我难不难。我说：“还可以。”她给我倒了茶。我觉得明天可以睡久一点。`,
  }),
  entry({
    id: "band-cook",
    category: "graded",
    createdAt: 58,
    title: "我想学做饭",
    blurb: "Eggs in a pan, too much salt, and a second try.",
    body: `晚上爸爸在厨房做饭。我站在旁边看。

我说：“我也要学。”爸爸说：“好。你先洗菜。”

菜洗好了。他让我炒鸡蛋。油很热。鸡蛋很快就好了。可是我放了太多盐。

爸爸尝了一口，笑了：“明天少放一点。”我们还是吃完了。我觉得做饭没有那么难。`,
  }),
  entry({
    id: "band-station",
    category: "graded",
    createdAt: 59,
    title: "车站的早晨",
    blurb: "Early buses, a missed stop, and a kind driver.",
    body: `今天我起得很早。我要坐车去看奶奶。车站里人已经很多。

我上车，找到一个座位。车开了。外面的树很快过去。

我看书，忘了下车。后来我才知道，车已经过了奶奶家。

司机说：“没有关系。下一站你可以下来，再坐回去。”我下了车。风很大。可是我不着急了。`,
  }),
  entry({
    id: "band-umbrella",
    category: "graded",
    createdAt: 60,
    title: "一把伞两个人",
    blurb: "Rain on the way home, and one umbrella that is not quite big enough.",
    body: `放学的时候下雨了。我有伞，同学小李没有。

她站在门口，衣服已经湿了一点。我走过去，说：“我们一起走吧。”

一把伞不太大。我的左边还是会湿。她说：“对不起。”我说：“没有关系。快到家了。”

到她家楼下，雨还没有停。她说：“谢谢。明天我带伞。”我点头。路上的灯都亮了。`,
  }),
  entry({
    id: "band-bread",
    category: "graded",
    createdAt: 61,
    title: "面包还是热的",
    blurb: "A supermarket aisle, warm bread, and a small choice.",
    body: `下午我和妈妈去超市。超市很大，人也不少。

我们先买青菜，再买鸡蛋。后来我看见面包。面包还是热的。

妈妈问：“要不要买？”我说：“要。明天早上可以吃。”

回家的路上，袋子有一点重。可是面包很香。我觉得今天的晚饭也会很好。`,
  }),
  entry({
    id: "band-walk",
    category: "graded",
    createdAt: 62,
    title: "晚饭后散步",
    blurb: "A slow walk after dinner, and neighbors who still say hello.",
    body: `晚饭以后，爸爸说要去散步。外面风很凉快，天还没有全黑。

我们走到河边。有人跑步，有人带着狗。河水很安静。

邻居看见我们，说：“吃了吗？”爸爸说：“吃了。你们也出来了。”

回家的时候，街上的灯都亮了。我有一点困。可是我觉得走路比坐在家里好。`,
  }),
  entry({
    id: "band-teacher-note",
    category: "graded",
    createdAt: 63,
    title: "给老师的话",
    blurb: "A short note, three sentences, and a teacher who reads slowly.",
    body: `老师明天过生日。同学们想送她一本书。

我也想写几句话。我写：老师，谢谢您。我现在喜欢汉语了。因为上课的时候您会笑。

我把纸放在书里。第二天我们一起给她。老师看了很久。

她说：“我很高兴。你们也要好好休息。”我觉得这句话也很暖。`,
  }),
  entry({
    id: "band-metro",
    category: "story",
    createdAt: 64,
    title: "第一次坐地铁",
    blurb: "Maps on the wall, the wrong exit, and a city under the ground.",
    body: `今天我第一次坐地铁。车站在地下，人很多，风也很大。

我看地图，找要去的地方。车来了。门开得很快。我走进去，拉着上面的东西。

到站以后，我走错了出口。上面是一条我不认识的路。

我又下去，换了一个出口。这次对了。太阳很亮。我觉得地铁很快，可是也很容易迷路。`,
  }),
  entry({
    id: "band-window-flowers",
    category: "story",
    createdAt: 65,
    title: "窗台上的花",
    blurb: "Three small pots, too little water, then a little too much.",
    body: `我家窗台上有三盆花。一盆是红的，两盆是白的。

上个星期我忘了浇水。叶子有一点黄。妈妈说：“花也要吃饭。”

今天我给它们水。水多了，流到桌子上。我赶快用布擦。

晚上花还在。叶子看起来好一点。我觉得它们没有生气。它们只是等。`,
  }),
  entry({
    id: "band-radio",
    category: "children",
    createdAt: 66,
    title: "爷爷的收音机",
    blurb: "An old radio, a song from far away, and tea that has gone cold.",
    body: `爷爷有一台旧收音机。他每天早上都打开。里面有人说话，也有歌。

我问：“这是哪里的声音？”爷爷说：“很远的地方。可是我们听得见。”

茶在桌子上，已经不热了。爷爷还在听。他的眼睛看着窗外。

我也坐下来。歌并不难。我觉得这台收音机关了以后，屋子会一下子变小。`,
  }),
  entry({
    id: "band-because-rain",
    category: "graded",
    createdAt: 67,
    title: "因为下雨",
    blurb: "The park is cancelled, so the living room becomes a small shop.",
    body: `今天我们要去公园。可是早上起来，外面在下雨。路都湿了。

妈妈说：“今天不去了。因为下雨，会很冷。”我有一点不高兴。

后来我们在家玩。我当商店的人，妹妹来买东西。她要苹果，我给她一本书。她笑了。

下午雨小了。我们站在门口看水。我觉得没去公园，也没有关系。`,
  }),
  entry({
    id: "band-see-sea",
    category: "graded",
    createdAt: 68,
    title: "我要去看海",
    blurb: "A map on the table, a long bus, and water that does not end.",
    body: `爸爸说明年要带我去看海。我还没有见过海。

我在桌子上画了一张图。有车，有路，还有很大的蓝色。妈妈说：“海比这个还大。”

我问：“要坐很久的车吗？”爸爸说：“要。可是你会觉得值得。”

晚上我睡觉的时候，还在想水的声音。我觉得海一定比河更安静，也更亮。`,
  }),
  entry({
    id: "band-sister-sleep",
    category: "children",
    createdAt: 69,
    title: "妹妹还不睡",
    blurb: "Lights off, one more story, and a sister who is still talking.",
    body: `晚上九点，妈妈说该睡觉了。灯关了。屋子里有一点黑。

妹妹还在说话。她问月亮还在不在。我说：“在。你看不见，因为它在窗外。”

她又问明天吃什么。我说：“米饭。现在睡觉。”她笑了一下，不说话了。

过了一会儿，她已经睡了。我还醒着。窗外有车。我觉得家很安静，也很近。`,
  }),
  entry({
    id: "band-borrow-salt",
    category: "story",
    createdAt: 70,
    title: "邻居借盐",
    blurb: "A knock at the door, a spoon of salt, and soup that is saved.",
    body: `晚饭的时候，有人敲门。是对门的阿姨。她说：“还在做饭。盐没有了。可以借一点吗？”

妈妈给她盐。阿姨说：“谢谢。明天还你。”妈妈说：“不用急。”

过了一会儿，楼道里有菜的味道。很好闻。

妈妈说：“邻居近，比商店近。”我觉得这句话对。有的东西不是买来的，是门对面来的。`,
  }),
  entry({
    id: "band-library-card",
    category: "graded",
    createdAt: 71,
    title: "办借书证",
    blurb: "A quiet desk, a small card, and two books that go home.",
    body: `今天我去图书馆办借书证。图书馆里很安静。大家都在看书。

阿姨问我叫什么名字。我告诉她。她给我一张小卡片。卡片上有我的名字。

我可以借两本书。我借了一本故事，一本汉语。

回家的路上，书在书包里。我觉得这张卡片很小，可是它能打开很多门。`,
  }),
  entry({
    id: "band-lost-key",
    category: "story",
    createdAt: 72,
    title: "钥匙在哪里",
    blurb: "No key in the pocket, a wait on the stairs, and dad coming home.",
    body: `我到家门口，一摸口袋，钥匙没有了。门开不了。

我在书包里找，在衣服里找。还是没有。我坐在楼梯上等。

邻居路过，问我：“怎么了？”我说：“钥匙不见了。我在等爸爸。”

六点半，爸爸回来了。钥匙在他的包里。他说：“早上我帮你拿了。”我觉得今天的楼梯特别长，可是现在已经过去了。`,
  }),
];

export const CATALOG: LibraryText[] = [...OWNED, ...wikiStubs(300), ...wikisourceStubs(800)];

export const SAMPLES = CATALOG.filter((t) => t.id.startsWith("sample-"));
