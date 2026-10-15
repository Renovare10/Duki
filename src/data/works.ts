/**
 * Long public-domain works. Text lives in public/works/<id>/ (built by
 * scripts/build-works.mjs); this registry is the small part that ships in the
 * bundle. Legal basis for each is documented in docs/library-v2-plan.md.
 */
import type { WorkMeta, WorkStats } from "../lib/works";
import { WORK_STATS } from "./works.generated";

export const WORKS: WorkMeta[] = [
  {
    id: "bible-cuv",
    title: "圣经（和合本）",
    english: "The Bible — Chinese Union Version",
    author: "和合本译者",
    year: "1919",
    blurb:
      "The complete Bible, all 66 books, in the 1919 Chinese Union Version — the translation most Chinese churches still read.",
    category: "history",
    topics: ["faith", "history", "literature"],
    sectionNoun: "Book",
    source: "eBible.org · Chinese Union Version, simplified script (cmn-cu89s)",
    sourceUrl: "https://ebible.org/find/details.php?id=cmn-cu89s",
    license:
      "Public domain. The Chinese Union Version was published in 1919 (public domain in the US as a pre-1931 publication, and in China as a work first published more than 50 years ago). eBible.org distributes this edition as public domain.",
    notes:
      "Simplified-script text with the modern punctuation of the 1988 edition. Section headings, footnotes and the traditional space before 神 are left out; verse numbers are shown small.",
  },
  {
    id: "nahan",
    title: "呐喊",
    english: "Call to Arms — Lu Xun",
    author: "鲁迅",
    year: "1923",
    blurb:
      "Lu Xun’s first story collection: 狂人日记, 孔乙己, 故乡, 阿Q正传 and more — the stories that started modern Chinese fiction.",
    category: "novel",
    topics: ["literature", "history"],
    sectionNoun: "Story",
    source: "Wikisource · 呐喊 (from 鲁迅全集, 1938)",
    sourceUrl: "https://zh.wikisource.org/wiki/%E5%90%B6%E5%96%8A",
    license:
      "Public domain. Published 1923 (public domain in the US as a pre-1931 publication); Lu Xun died in 1936, so it has been public domain in China since 1987.",
    notes: "Converted to simplified characters. Lu Xun’s 1920s spelling (的/底, 豫备, 那里 for 哪里) is kept as written.",
  },
  {
    id: "zhaohua-xishi",
    title: "朝花夕拾",
    english: "Dawn Blossoms Plucked at Dusk — Lu Xun",
    author: "鲁迅",
    year: "1928",
    blurb:
      "Ten memoir essays about Lu Xun’s childhood and youth: the herb garden, his nanny, his father’s illness, his teacher in Japan.",
    category: "history",
    topics: ["literature", "biography", "family", "school"],
    sectionNoun: "Essay",
    source: "Wikisource · 朝花夕拾",
    sourceUrl: "https://zh.wikisource.org/wiki/%E6%9C%9D%E8%8A%B1%E5%A4%95%E6%8B%BE",
    license:
      "Public domain. Published as a book in 1928 (essays 1926–27), public domain in the US as a pre-1931 publication; public domain in China since 1987 (author died 1936).",
  },
  {
    id: "zhu-ziqing-essays",
    title: "朱自清散文四篇",
    english: "Four essays — Zhu Ziqing",
    author: "朱自清",
    year: "1922–1927",
    blurb:
      "匆匆, 背影, 荷塘月色 and the Qinhuai River at night — short, famous essays every Chinese student reads.",
    category: "article",
    topics: ["literature", "family", "nature", "feelings"],
    sectionNoun: "Essay",
    source: "Wikisource · 朱自清",
    sourceUrl: "https://zh.wikisource.org/wiki/Author:%E6%9C%B1%E8%87%AA%E6%B8%85",
    license:
      "Public domain. All four essays were first published 1922–1927 (public domain in the US as pre-1931 publications); Zhu Ziqing died in 1948, so they have been public domain in China since 1999.",
    notes: "His later essays (such as 春, 1933) are not included because they are still under US copyright.",
  },
];

export function findWork(id: string): WorkMeta | undefined {
  return WORKS.find((w) => w.id === id);
}

export function workStats(id: string): WorkStats | undefined {
  return WORK_STATS[id];
}
