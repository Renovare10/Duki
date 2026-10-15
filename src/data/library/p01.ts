import type { LibraryPack } from "../../lib/library-entry";

const pack: LibraryPack = {
  id: "p01",
  texts: [
    {
      id: "lib-p01-01-daily-life",
      title: "我想睡觉",
      blurb: "After school and rice, the house goes quiet.",
      topics: ["daily-life", "family"],
      level: 1,
      body: `今天上午我在学校看书，写字。我写了十个字。老师看见我，他很高兴。

中午我回家。爸爸和妈妈都在家。我们吃米饭，喝茶。

下午我看电视。现在我睡觉。家里没有人说话。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-02-daily-life",
      title: "同学的书",
      blurb: "She has no book until a classmate shares his.",
      topics: ["daily-life", "school"],
      level: 1,
      body: `今天我去学校。我没有书。同学有三本书，书在桌子上。

老师看我们。我读同学的书，同学写字。书里的字很大。

现在我能看书了。我读了五个字。老师很高兴。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-03-daily-life",
      title: "爸爸工作",
      blurb: "Dad is at work until noon brings him home.",
      topics: ["daily-life", "work"],
      level: 1,
      body: `今天爸爸去工作。他是老师，他去学校。我和妈妈在家喝茶。

我想爸爸。中午爸爸回家了。他坐在椅子上。

他看见我，他很高兴。我们吃米饭。爸爸现在在家。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-04-daily-life",
      title: "妈妈去医院",
      blurb: "Mom sees the doctor and comes home well.",
      topics: ["daily-life", "health"],
      level: 1,
      body: `今天妈妈去医院。我不高兴。医生在医院看妈妈。

医生很好。妈妈喝茶，她坐在医院。下午妈妈回家。

我看见妈妈。我们吃苹果。妈妈好了，我很高兴。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-05-daily-life",
      title: "下雨的狗",
      blurb: "The dog is out in the rain until she finds it.",
      topics: ["daily-life", "nature"],
      level: 1,
      body: `今天下雨了。狗不在家。我在学校后面看狗。

狗在那里。下雨了，狗很冷。我叫狗，狗来我家。

我们回家。狗不喝茶。我喝茶，狗在椅子上睡觉。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-06-daily-life",
      title: "给妈妈打电话",
      blurb: "A phone call reaches Mom while she is in Beijing.",
      topics: ["daily-life", "science"],
      level: 1,
      body: `我打电话。妈妈在北京，她不在家。我说话，我听妈妈说话。

妈妈很好。她在北京工作。妈妈说话：你看书吗？我说话：我看书。

我想妈妈。下午我看电脑。明天妈妈回家。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-07-daily-life",
      title: "我们的老师",
      blurb: "Who the teacher is: Beijing, a daughter, and books.",
      topics: ["daily-life", "biography"],
      level: 1,
      body: `我认识一个老师。他在北京住，他在学校工作。学生都喜欢他。

他有一个女儿。女儿十岁，她是学生。她学习汉语。老师喜欢她。

老师喜欢书。他看书，他写字。我们都喜欢这个老师。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-08-daily-life",
      title: "一个电影",
      blurb: "A film about a young woman who likes tea.",
      topics: ["daily-life", "arts"],
      level: 1,
      body: `下午我和妈妈去看电影。电影里有一个小姐。她很漂亮。

小姐在北京住。她喜欢茶，她看书。我喜欢这个小姐。

我们看了这个电影。我们回家吃苹果。我很高兴。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-09-daily-life",
      title: "北京今天下雨",
      blurb: "The class hears Beijing is rainy, so they stay.",
      topics: ["daily-life", "news"],
      level: 1,
      body: `今天老师说话。我们都听。北京今天下雨了。

我们今天不去北京。北京很大，我们不坐飞机。

我们在学校看书。下午我们回家。我想明天去北京。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-10-daily-life",
      title: "杯子太小",
      blurb: "A cat tries a teacup and does not fit.",
      topics: ["daily-life", "humor"],
      level: 1,
      body: `我在家喝茶。猫看我的杯子。杯子很小，猫很大。

猫想坐在杯子里吗？杯子太小。猫坐在椅子上，不坐杯子。

我喝茶。猫不喝茶。猫看我，我看猫。我们都高兴。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-11-daily-life",
      title: "火车站",
      blurb: "They lose the teacher in the station, then find him.",
      topics: ["daily-life", "adventure"],
      level: 1,
      body: `今天我去火车站。妈妈在火车站。火车站很大，人很多。

我没有看见老师。妈妈叫：老师！老师在那里。他看我们。

我们看见老师了。他很高兴。我们坐出租车回家。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-12-daily-life",
      title: "热茶",
      blurb: "A few lines about tea that is too hot to drink.",
      topics: ["daily-life", "poetry"],
      level: 1,
      body: `茶太热，我不喝。
妈妈看茶，她不喝。

水不热，我喝水。
爸爸喝水，我喝水。

现在茶好了，我喝茶。
茶很好。妈妈喝茶，我喝茶。
我们都高兴。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-13-daily-life",
      title: "说谢谢",
      blurb: "She says thank you before anyone eats.",
      topics: ["daily-life", "faith"],
      level: 1,
      body: `我们坐在桌子前面。桌子上有米饭，有菜，有茶。

我想吃。妈妈看我。我说话：谢谢妈妈，谢谢爸爸。

爸爸很高兴。我们吃米饭，喝茶。米饭很好，茶很好。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-14-daily-life",
      title: "五个字",
      blurb: "She writes five characters until they look right.",
      topics: ["daily-life", "school"],
      level: 1,
      body: `今天我在学校学习汉语。老师写五个字。字很大。

我写五个字。一个字不好。我看老师的字，我写这个字。

现在五个字都好。老师看见我的字，他很高兴。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-15-daily-life",
      title: "茶太热",
      blurb: "Lunch is ready, but the tea needs a minute.",
      topics: ["daily-life", "food"],
      level: 1,
      body: `中午我们吃米饭和菜。菜很好。妈妈的茶太热。

妈妈不喝茶。我喝水。水不热，水很好。我想喝茶。

现在茶不热了。我喝茶，妈妈喝茶。我们都高兴。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-16-daily-life",
      title: "八块钱",
      blurb: "Eight yuan is not enough until Mom pays.",
      topics: ["daily-life", "shopping"],
      level: 1,
      body: `我和妈妈去商店。商店有苹果，苹果很漂亮。

一个苹果十块钱。我有八块。我不能买。

妈妈有钱。她买三个苹果。我们回家吃。苹果很好。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-17-daily-life",
      title: "去北京",
      blurb: "A first flight, then a big afternoon in Beijing.",
      topics: ["daily-life", "travel"],
      level: 1,
      body: `今天我们去北京。我们坐飞机。飞机很大。我看妈妈。

妈妈高兴，我高兴。北京很大。中午我们吃米饭，喝茶。

下午我们坐出租车看北京。现在我们回家。我喜欢北京。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-18-daily-life",
      title: "朋友不在",
      blurb: "A friend misses school, and tomorrow is the hope.",
      topics: ["daily-life", "feelings"],
      level: 1,
      body: `今天朋友不在学校。我没有看见他。我不高兴。

我回家。我想朋友。妈妈在家，我们喝茶。妈妈说话：明天他来。

我想明天。明天我在学校看见朋友。我现在高兴了。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-19-daily-life",
      title: "太热了",
      blurb: "Noon is too hot, then rain cools the house.",
      topics: ["daily-life", "weather"],
      level: 1,
      body: `中午天气太热。我不想去学校。我和妈妈在家。

下午下雨了。我们看下雨。家里不热了。

狗在椅子上睡觉。我们喝茶，吃苹果。我喜欢这个下午。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-20-daily-life",
      title: "中国的书",
      blurb: "A book shows Beijing and the people of China.",
      topics: ["daily-life", "history"],
      level: 1,
      body: `老师有一本书。这是中国的书。书里有北京，有很多人。

我们看书。老师说话，我们听。北京很大，中国很大。

我喜欢这本书。我想明天读。我想认识书里的人。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-21-daily-life",
      title: "请喝茶",
      blurb: "A guest comes, and the family offers tea and rice.",
      topics: ["daily-life", "culture"],
      level: 1,
      body: `朋友来我家。他不是中国人。他是我们的朋友。

我们请他喝茶。中国人喜欢茶。朋友喝茶，他喜欢。

我们吃米饭和菜。朋友说话：谢谢。今天我们都高兴。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-22-daily-life",
      title: "学校后面",
      blurb: "After class they exercise behind the school.",
      topics: ["daily-life", "sports"],
      level: 1,
      body: `下午我在学校。同学和我去学校后面。那里人不多。

同学运动，我看。老师看见我们。他很高兴。

现在我们喝水。我喜欢学校后面。明天我来。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-23-daily-life",
      title: "请写这个字",
      blurb: "Look, write, and read one character until it is right.",
      topics: ["daily-life", "how-to"],
      level: 1,
      body: `你想写字吗？请看老师。老师写一个字，字很大。

请写这个字。字不好吗？请看老师的字。请写这个字。

现在请读这个字。字好了。你学习了。老师高兴。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-24-daily-life",
      title: "狗和猫",
      blurb: "A big dog sees that the little cat has no rice.",
      topics: ["daily-life", "folk-tales"],
      level: 1,
      body: `狗很大，猫很小。狗有很多米饭。猫没有米饭。

猫看狗。狗看见猫没有米饭。狗不吃了。

现在米饭是猫的。猫吃米饭。狗看猫，狗在家。狗和猫都睡觉了。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-25-daily-life",
      title: "朋友，你好",
      blurb: "A short letter asking a friend to come on Saturday.",
      topics: ["daily-life", "letters"],
      level: 1,
      body: `朋友：

你好。我在家。今天我看书，我写了八个字。

明天是星期六。你来我家吗？我们吃苹果，喝茶。妈妈在家。她想你。

我想你。请来。

再见。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-26-daily-life",
      title: "书里的小姐",
      blurb: "She reads a book and stays for the last page.",
      topics: ["daily-life", "literature"],
      level: 1,
      body: `我有一本书。书里有一个小姐。她在北京住，她喜欢茶。

她去商店买苹果。她的朋友在火车站。小姐在火车站看见朋友。

她和朋友回家。我看了这本书。我喜欢这本书。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-27-family",
      title: "我家",
      blurb: "The first day she names everyone in the new home.",
      topics: ["family", "encyclopedia"],
      level: 1,
      body: `今天我在我家。家有爸爸，有妈妈，有我。我是女儿。

我们的家在中国。家不大。家里有桌子，有椅子，有一个电视。

中午我们吃米饭，喝茶。我喜欢我家。爸爸和妈妈都高兴。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-28-family",
      title: "买杯子",
      blurb: "Mom and daughter buy apples and a cup for Dad.",
      topics: ["family", "shopping"],
      level: 1,
      body: `妈妈和我去商店。我们买苹果。苹果十块，妈妈有钱。

我看见一个杯子。杯子很漂亮。我想：这是爸爸的杯子。

妈妈买杯子。我们回家。爸爸看见杯子，他喝茶。他很高兴。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-29-family",
      title: "我是学生",
      blurb: "Her first school day ends when Mom comes back.",
      topics: ["family", "school"],
      level: 1,
      body: `今天我去学校。我是学生。我学习汉语，我写字。老师很好。

中午妈妈来学校。她看见我。我读五个字。她很高兴。

下午我们回家。我吃苹果，喝茶。我想明天去学校。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-30-family",
      title: "爸爸是老师",
      blurb: "She visits the school where her father works.",
      topics: ["family", "work"],
      level: 1,
      body: `爸爸是老师。他在学校工作。今天我去学校看爸爸。

学校很大。爸爸的学生很多。学生看书，写字。爸爸看学生。

爸爸看见我，他很高兴。中午我们回家吃米饭。我喜欢爸爸的学校。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-31-family",
      title: "去医院",
      blurb: "She will not eat, sees a doctor, then wants an apple.",
      topics: ["family", "health"],
      level: 1,
      body: `今天我不想吃米饭。我不高兴。妈妈和我去医院。

医生看我。医生很好。他有水，我喝水。我喝茶。

下午我回家。现在我想吃苹果。我吃一个苹果。妈妈高兴，我好了。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
    {
      id: "lib-p01-32-family",
      title: "看下雨",
      blurb: "Rain keeps Dad, the child, and the dog inside.",
      topics: ["family", "nature"],
      level: 1,
      body: `今天下雨了。天气很冷。爸爸和我在家。狗在家里。

狗不去学校后面。爸爸看书。我看电视。狗在椅子上睡觉。

我们看下雨。我们喝茶。我喜欢狗，我喜欢爸爸。`,
      aiGenerated: true,
      category: "children",
      license: "Original (Duki)",
    },
  ],
};

export default pack;
