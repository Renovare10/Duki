import type { LibraryText } from "../types";

/**
 * English shelf rows. Deliberately empty in the toggle skeleton: stories are added later
 * (each row needs `lang: "en"`; they then appear on the English shelves and open in the reader).
 */
export const EN_SAMPLES: LibraryText[] = [];

/** A few inline explanations only. Unknown words deliberately get a dash. */
export const EN_GLOSSES: Record<string, string> = {
  cat: "猫", door: "门", bag: "包", red: "红色的", warm: "温暖的",
  table: "桌子", sister: "姐妹", book: "书", tea: "茶", cafe: "咖啡馆",
  busy: "忙碌的；人多的", empty: "空的", quietly: "轻声地；安静地",
  share: "共用；分享", asleep: "睡着的", beside: "在……旁边",
};
