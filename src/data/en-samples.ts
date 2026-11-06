import type { LibraryText } from "../types";

/** Original throwaway texts for the private language-toggle prototype, not a story pack. */
export const EN_SAMPLES: LibraryText[] = [
  {
    id: "en-draft-cat", title: "The Cat", blurb: "Starter · English sample",
    body: "A cat is at the door. I open the door. The cat runs in. It sits on my red bag. Now the bag is warm.",
  },
  {
    id: "en-draft-bag", title: "The Red Bag", blurb: "Starter · English sample",
    body: "My bag is not here. I look under the table. I look by the door. Then I see my sister. She has my red bag!",
  },
  {
    id: "en-draft-table", title: "A Quiet Table", blurb: "Next step · English sample",
    body: "The cafe is busy, but one table is empty. I put my book on it and buy some tea. When I come back, a cat is asleep beside my book. I sit down quietly. We can share the table.",
  },
].map((sample, i) => ({
  ...sample, lang: "en", kind: "sample", category: "graded", createdAt: i + 1,
  readAt: null, bookmark: null, source: "Original English stub · local draft",
}));

/** A few inline explanations only. Unknown words deliberately get a dash. */
export const EN_GLOSSES: Record<string, string> = {
  cat: "猫", door: "门", bag: "包", red: "红色的", warm: "温暖的",
  table: "桌子", sister: "姐妹", book: "书", tea: "茶", cafe: "咖啡馆",
  busy: "忙碌的；人多的", empty: "空的", quietly: "轻声地；安静地",
  share: "共用；分享", asleep: "睡着的", beside: "在……旁边",
};
