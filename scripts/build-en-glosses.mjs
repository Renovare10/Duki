// Builds src/data/en-glosses.generated.ts: short Chinese glosses for every word in the English
// stories (every file in SOURCES), taken from ECDICT (MIT, https://github.com/skywind3000/ECDICT).
// Usage: ECDICT_CSV=/path/to/ecdict.csv node scripts/build-en-glosses.mjs
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const csv = process.env.ECDICT_CSV;
if (!csv) throw new Error("Set ECDICT_CSV to ecdict.csv");

/** Every English data file whose titles and bodies a reader can tap. Add new section files here. */
const SOURCES = ["src/data/en-stories.ts", "src/data/en-level-elementary.ts", "src/data/en-level-intermediate.ts",
  "src/data/en-level-advanced.ts", "src/data/en-level-native.ts", "src/data/en-wiki.ts", "src/data/en-level-beginner.ts",
  "src/data/en-classics.ts"];
const src = SOURCES.map((f) => fs.readFileSync(path.join(root, f), "utf8")).join("\n");
const bodies = [...src.matchAll(/(?:title: "([^"]*)"|body: `([^`]*)`)/g)].map((m) => m[1] ?? m[2]).join("\n");
const keys = new Set((bodies.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g) ?? []).map((w) => w.toLowerCase().replaceAll("’", "'")));

function parseLine(line) {
  const out = [];
  let i = 0;
  while (i <= line.length) {
    if (line[i] === '"') {
      let v = "";
      i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { v += '"'; i += 2; }
        else if (line[i] === '"') { i++; break; }
        else v += line[i++];
      }
      out.push(v);
      i++; // comma
    } else {
      const j = line.indexOf(",", i);
      const end = j === -1 ? line.length : j;
      out.push(line.slice(i, end));
      i = end + 1;
    }
  }
  return out;
}

const dict = new Map();
const rl = readline.createInterface({ input: fs.createReadStream(csv) });
let header = true;
for await (const line of rl) {
  if (header) { header = false; continue; }
  const f = parseLine(line);
  const word = f[0]?.toLowerCase();
  if (!word || dict.has(word) && dict.get(word).translation) continue;
  dict.set(word, { translation: f[3] ?? "", exchange: f[10] ?? "" });
}

/** Character names in the stories: glossed as names, not as dictionary senses. */
const NAMES = new Set(["max", "ben", "lily", "anna", "sam", "maria", "lopez", "david", "grace", "harris", "mei",
  "frank", "nadia", "walter", "brooks", "elena", "tom", "harold", "robert", "priya", "claire", "margaret", "james",
  "ruth", "alder",
  // Elementary section (en-level-elementary.ts)
  "ali", "amir", "ava", "beth", "daniel", "ellis", "emma", "helen", "jack", "jo", "kate", "leo", "lila", "luis",
  "maya", "mina", "nina", "nora", "owen", "paul", "pip", "rosa", "sara", "sophie",
  // Intermediate and Advanced sections (en-level-intermediate.ts, en-level-advanced.ts)
  "alice", "arthur", "bell", "cole", "ellen", "eva", "frances", "heinrich", "jean", "leah", "leila", "mara", "martin",
  "olbers", "oliver", "rob", "rose", "sal", "sandra", "tess", "wilhelm", "wong",
  // Native section (en-level-native.ts)
  "ada", "celia", "dyer", "graham", "peter", "reeves", "sami", "vale",
  // Beginner section (en-level-beginner.ts); "may", "rose" and "sock" are also common words, see OVERRIDES
  "alex", "amy", "dan", "eli", "ken", "mia"]);

function short(translation) {
  const lines = translation.split("\\n").map((l) => l.replace(/\\r/g, "").trim())
    .filter((l) => l && !/^\[(网络|人名|医|化|计|电|法|经|地名)\]/.test(l))
    .map((l) => l.replace(/\[[^\]]*\]\s*/g, "").split(/[,，；;]\s*/).slice(0, 3).join("，"));
  return lines.slice(0, 2).join("；").replace(/\s+/g, " ").trim();
}

/** Hand fixes where ECDICT's first senses mislead a learner, or it has no entry. */
const OVERRIDES = {
  a: "art. 一（个）", an: "art. 一（个）", the: "art. 这个；那个", internet: "n. 互联网",
  online: "adv. 在网上", overreaction: "n. 反应过度", does: "v. 做；aux. 助动词（do 的第三人称单数）",
  affordable: "a. 买得起的，负担得起的", laptop: "n. 笔记本电脑", randomization: "n. 随机化，随机分配",
  standardization: "n. 标准化", timekeeping: "n. 计时，守时", unrelated: "a. 无关的，不相关的",
  vapour: "n. 水汽，蒸气", mum: "n. 妈妈（英式）",
  // Native and Wikipedia sections: words ECDICT lacks, and senses that mislead in these texts.
  antimalarial: "a. 抗疟疾的", app: "n. 应用程序，App", correctness: "n. 正确性", inbox: "n. 收件箱",
  organiser: "n. 组织者", "organiser's": "n. 组织者的", overstatement: "n. 夸大，言过其实", subduction: "n. （地质）俯冲",
  unallocated: "a. 未分配的", untreated: "a. 未经处理的，未治疗的", workspace: "n. 工作区，工作空间",
  m: "（a.m. 中的 m）", r: "（字母）R", v: "（罗马数字）五", c: "（人名缩写）C", st: "abbr. 圣（用于名称，如 St Martin's）",
  westbridge: "（地名）韦斯特布里奇", beijing: "n. 北京", angkorian: "a. 吴哥时期的", wat: "n. 寺（Angkor Wat 吴哥窟）",
  tang: "n. 唐朝；强烈的味道", jikji: "n. 《直指》（现存最早的金属活字印本）", galapagos: "n. 加拉帕戈斯（群岛）",
  beagle: "n. 比格犬；（HMS Beagle 小猎犬号）", annua: "（学名）Artemisia annua 黄花蒿", sinensis: "（学名）Camellia sinensis 茶树",
  jabr: "（阿拉伯语）还原（algebra 一词的来源）", al: "（阿拉伯人名前缀）", von: "（德语人名中的）冯",
  lovelace: "（人名）洛夫莱斯（英国数学家）", drais: "（人名）德莱斯（德国发明家）", wangari: "（人名）旺加里",
  maathai: "（人名）马塔伊（肯尼亚环保人士）", "maathai's": "（人名）马塔伊的", khwarizmi: "（人名）花拉子米（数学家）",
  musa: "（人名）穆萨", menabrea: "（人名）梅纳布雷亚", milbanke: "（人名）米尔班克", omura: "（人名）大村智",
  tu: "（人名）屠（屠呦呦）", youyou: "（人名）呦呦（屠呦呦）", bi: "（人名）毕（毕昇）", sheng: "（人名）昇（毕昇）",
  ge: "（人名）葛（葛洪）", hong: "（人名）洪（葛洪）", lasker: "（人名）拉斯克（拉斯克奖）",
  // Beginner and Classics sections: names that are also words, archaic poetry forms, and missing entries.
  may: "aux. 可以，可能；n. 五月；（也作人名）", rose: "n. 玫瑰；v. 上升（rise 的过去式）；（也作人名）",
  sock: "n. 短袜；（也作布偶名）", kolokolo: "（鸟名）Kolokolo 鸟（故事中的鸟）", t: "（'t 即 it，古诗用法；T-shirt 的 T）",
  ye: "pron. （古）你们", art: "n. 艺术，技术；v. （古）是（thou art = you are）",
  "brimm'd": "a. （古）盛满的（brimmed）", "dimm'd": "v. （古）使暗淡（dimmed）", "grow'st": "v. （古）你成长（grow）",
  "lov'd": "v. （古）爱过（loved）", "moss'd": "a. （古）长满青苔的（mossed）", "ow'st": "v. （古）你拥有（owe = own）",
  "prov'd": "v. （古）被证明（proved）", "reap'd": "a. （古）收割过的（reaped）", "untrimm'd": "a. （古）未修饰的（untrimmed）",
  "wander'st": "v. （古）你漫游（wander）", watchest: "v. （古）你注视（watch）", starwort: "n. 繁缕；紫菀（植物）", june: "n. 六月；（也作人名）", mark: "n. 记号，分数；vt. 做记号；（也作人名）",
};

function lookup(key) {
  if (OVERRIDES[key]) return OVERRIDES[key];
  const base = key.endsWith("'s") ? key.slice(0, -2) : key;
  if (NAMES.has(base)) return "（人名）";
  const tries = [key];
  if (key.endsWith("'s")) tries.push(key.slice(0, -2));
  for (const k of tries) {
    const hit = dict.get(k);
    if (hit?.translation) {
      const own = short(hit.translation);
      const lemma = hit.exchange.match(/(?:^|\/)0:([^/]+)/)?.[1];
      if (lemma && lemma !== k && dict.get(lemma)?.translation) return `${short(dict.get(lemma).translation)}（${lemma}）`;
      if (own) return own;
    }
  }
  return null;
}

const glosses = {};
const missing = [];
for (const key of [...keys].sort()) {
  const g = lookup(key);
  if (g) glosses[key] = g; else missing.push(key);
}
const out = `// Generated by scripts/build-en-glosses.mjs from ECDICT (MIT License, Copyright (c) 2025 Linwei,
// https://github.com/skywind3000/ECDICT). Do not edit by hand; re-run the script after changing stories.
export const EN_GLOSSES_GENERATED: Record<string, string> = ${JSON.stringify(glosses, null, 1)};
`;
fs.writeFileSync(path.join(root, "src/data/en-glosses.generated.ts"), out);
console.log(JSON.stringify({ words: keys.size, glossed: Object.keys(glosses).length, missing }));
