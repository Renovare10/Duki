import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.join(root, "..", "public", "glossary.json");

const TONE_MAP = {
  a: "āáǎàa",
  e: "ēéěèe",
  i: "īíǐìi",
  o: "ōóǒòo",
  u: "ūúǔùu",
  ü: "ǖǘǚǜü",
};

function markSyllable(raw) {
  const s = raw.trim();
  const m = s.match(/^([A-Za-züÜvV:]+)([1-5])$/);
  if (!m) return s.replace(/u:/gi, "ü").replace(/v/gi, "ü");
  let letters = m[1].replace(/u:/gi, "ü").replace(/v/gi, "ü");
  const tone = Number(m[2]);
  if (tone === 5) return letters;
  const lower = letters.toLowerCase();
  const place = (ch) => {
    const idx = lower.indexOf(ch);
    if (idx === -1) return false;
    const key = lower[idx] === "ü" ? "ü" : lower[idx];
    const marked = TONE_MAP[key][tone - 1];
    letters =
      letters.slice(0, idx) +
      (letters[idx] === letters[idx].toUpperCase() ? marked.toUpperCase() : marked) +
      letters.slice(idx + 1);
    return true;
  };
  if (!place("a") && !place("e")) {
    if (lower.includes("ou")) place("o");
    else {
      for (let i = lower.length - 1; i >= 0; i--) {
        if ("aeiouü".includes(lower[i])) {
          const key = lower[i];
          const marked = TONE_MAP[key][tone - 1];
          letters =
            letters.slice(0, i) +
            (letters[i] === letters[i].toUpperCase() ? marked.toUpperCase() : marked) +
            letters.slice(i + 1);
          break;
        }
      }
    }
  }
  return letters;
}

function pinyinMarks(numeric) {
  return numeric
    .trim()
    .split(/\s+/)
    .map(markSyllable)
    .join(" ");
}

function cleanGloss(parts) {
  const out = [];
  for (const raw of parts) {
    let s = String(raw).trim();
    if (!s) continue;
    if (/^CL[:：]/i.test(s)) continue;
    if (/^(variant of|see also|see |same as |surname |Kangxi radical)/i.test(s)) continue;
    s = s.replace(/\s*CL:.*$/i, "");
    s = s.replace(/\[[^\]]*\]/g, "");
    s = s.replace(/\s*\|\s*/g, "/");
    s = s.replace(/\s+/g, " ").trim();
    s = s.replace(/^[,\s]+|[,\s]+$/g, "");
    if (s.length < 2) continue;
    if (!out.includes(s)) out.push(s);
    if (out.length >= 2) break;
  }
  return out.join("; ");
}

function isHanWord(s) {
  return /^[\u3400-\u9fff\uf900-\ufaff]{1,8}$/.test(s);
}

/** @type {Map<string, { pinyin: string, english: string, hsk: number | null }>} */
const entries = new Map();
let maxLen = 1;

function upsert(hanzi, pinyin, english, hsk) {
  if (!isHanWord(hanzi) || !pinyin) return;
  maxLen = Math.max(maxLen, hanzi.length);
  const prev = entries.get(hanzi);
  if (!prev) {
    entries.set(hanzi, { pinyin, english: english || "", hsk: hsk ?? null });
    return;
  }
  if (hsk != null && prev.hsk == null) {
    prev.hsk = hsk;
    if (pinyin) prev.pinyin = pinyin;
    if (english) prev.english = english;
    return;
  }
  if (!prev.english && english) prev.english = english;
}

for (let level = 1; level <= 6; level++) {
  const list = JSON.parse(fs.readFileSync(path.join(root, `hsk-${level}.json`), "utf8"));
  for (const item of list) {
    const hanzi = item.hanzi;
    const pinyin = String(item.pinyin || "")
      .trim()
      .replace(/\s+/g, " ");
    const english = cleanGloss(item.translations || []);
    upsert(hanzi, pinyin, english, level);
  }
}

const gz = fs.readFileSync(path.join(root, "cedict.txt.gz"));
const cedict = zlib.gunzipSync(gz).toString("utf8");
const lineRe = /^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\/\s*$/;
for (const line of cedict.split(/\n/)) {
  if (!line || line.startsWith("#")) continue;
  const m = line.match(lineRe);
  if (!m) continue;
  const simplified = m[2];
  const pinyin = pinyinMarks(m[3].replace(/u:/g, "ü"));
  const english = cleanGloss(m[4].split("/"));
  upsert(simplified, pinyin, english, null);
}

const packed = {};
for (const [hanzi, val] of entries) {
  packed[hanzi] = [val.pinyin, val.english];
}

const payload = { maxLen, count: entries.size, entries: packed };
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(payload));
const kb = Math.round(fs.statSync(outFile).size / 1024);
console.log(`glossary: ${entries.size} words, maxLen=${maxLen}, ${kb} KB -> ${outFile}`);
