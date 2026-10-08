#!/usr/bin/env node
/**
 * Builds long public-domain works into lazily loaded static files:
 *
 *   public/works/<workId>/toc.json        sections → chapters (key, title, chars, level)
 *   public/works/<workId>/<key>.json      one chapter: { key, title, body }
 *   public/works/<workId>/profile.json    work vocabulary (top words + counts) for "you know ~X%"
 *   src/data/works.generated.ts           tiny per-work numbers for library cards
 *
 * Chapter keys are permanent IDs (reading progress is stored per key), so a
 * rebuild must never change them: Bible = USFM book code + chapter ("GEN.1"),
 * collections = original table-of-contents position ("03", "09.4").
 *
 *   node scripts/build-works.mjs [--offline]
 * Sources: eBible.org USFM zip (cmn-cu89s) and zh.wikisource.org (variant=zh-hans).
 * Downloads are cached in node_modules/.cache/duki-works.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { analyze, loadAppModules, root, round } from "./lib/corpus.mjs";

const OFFLINE = process.argv.includes("--offline");
const CACHE = path.join(root, "node_modules/.cache/duki-works");
const OUT = path.join(root, "public/works");
const UA = "DukiLibraryBuild/1.0 (offline build of public-domain texts)";
fs.mkdirSync(CACHE, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cachedFetch(url, file) {
  const p = path.join(CACHE, file);
  if (fs.existsSync(p)) return fs.readFileSync(p);
  if (OFFLINE) throw new Error(`offline and not cached: ${url}`);
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(p, buf);
      await sleep(800);
      return buf;
    }
    await sleep(3000 * (attempt + 1));
  }
  throw new Error(`fetch failed: ${url}`);
}

// ---------------------------------------------------------------- Bible (CUV)

const BIBLE_ZIP = "https://ebible.org/Scriptures/cmn-cu89s_usfm.zip";
const SUPERS = "⁰¹²³⁴⁵⁶⁷⁸⁹";
export const toSuper = (n) => String(n).replace(/\d/g, (d) => SUPERS[Number(d)]);

/** One USFM book → { code, name, chapters: [{ n, body }] }. */
export function parseUsfmBook(src) {
  const code = /\\id\s+(\w+)/.exec(src)?.[1];
  const name = (/\\h\s+(.+)/.exec(src)?.[1] || /\\toc1\s+(.+)/.exec(src)?.[1] || code).trim();
  let s = src.replace(/\r/g, "");
  s = s.replace(/\\f\s[\s\S]*?\\f\*/g, ""); // footnotes
  s = s.replace(/\\x\s[\s\S]*?\\x\*/g, ""); // cross references
  s = s.replace(/\\(add|pn|qs|nd|wj|k)\*?\s?/g, (m, tag) => (m.includes("*") ? "" : "")); // keep inner text
  s = s.replace(/[\u3000 ]+(?=神)/g, ""); // honorific space before 神 (typographic, not text)
  const chapters = [];
  let cur = null;
  let paras = []; // array of paragraphs; each paragraph = array of lines
  let line = "";
  const flushLine = () => {
    const t = line.replace(/\s+/g, "").trim();
    if (t) {
      if (!paras.length) paras.push([]);
      paras[paras.length - 1].push(t);
    }
    line = "";
  };
  const newPara = () => {
    flushLine();
    if (!paras.length || paras[paras.length - 1].length) paras.push([]);
  };
  const flushChapter = () => {
    flushLine();
    if (cur) {
      cur.body = paras
        .filter((p) => p.length)
        .map((p) => p.join("\n"))
        .join("\n\n");
      chapters.push(cur);
    }
    paras = [];
  };
  for (const raw of s.split("\n")) {
    const m = /^\\(\w+)\s?(.*)$/.exec(raw.trim());
    if (!m) {
      line += raw;
      continue;
    }
    const [, tag, rest] = m;
    switch (tag) {
      case "c":
        flushChapter();
        cur = { n: Number(rest.trim()), body: "" };
        break;
      case "p":
      case "m":
      case "b":
      case "d":
        newPara();
        line += rest;
        break;
      case "q1":
      case "q2":
      case "q":
        flushLine();
        line += rest;
        break;
      case "v": {
        const vm = /^(\d+)(?:-\d+)?\s*(.*)$/.exec(rest);
        if (vm) line += toSuper(vm[1]) + vm[2];
        break;
      }
      default:
        // \id \h \toc \mt \s1 \s2 \ms1 \sp \r: headings and editorial apparatus
        break;
    }
  }
  flushChapter();
  return { code, name, chapters };
}

const OT_COUNT = 39;

async function buildBible() {
  const zip = path.join(CACHE, "cmn-cu89s_usfm.zip");
  await cachedFetch(BIBLE_ZIP, "cmn-cu89s_usfm.zip");
  const dir = path.join(CACHE, "cmn-cu89s");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    execFileSync("unzip", ["-oq", zip, "-d", dir]);
  }
  const files = fs
    .readdirSync(dir)
    .filter((f) => /^\d\d-[\w-]+\.usfm$/.test(f) && !/^(00|01)-/.test(f))
    .sort();
  const sections = [];
  for (const [i, f] of files.entries()) {
    const book = parseUsfmBook(fs.readFileSync(path.join(dir, f), "utf8"));
    sections.push({
      key: book.code,
      title: book.name,
      part: i < OT_COUNT ? "旧约" : "新约",
      chapters: book.chapters.map((c) => ({
        key: `${book.code}.${c.n}`,
        title: `${book.name} ${c.n}`,
        label: String(c.n),
        body: c.body,
      })),
    });
  }
  if (sections.length !== 66) throw new Error(`expected 66 books, got ${sections.length}`);
  return sections;
}

// ------------------------------------------------------------- Wikisource

const VOID = new Set(["br", "img", "hr", "meta", "link", "input", "wbr", "source", "col", "area"]);
const BLOCK = new Set(["p", "div", "li", "dd", "dt", "h1", "tr", "blockquote", "center", "poem", "pre"]);
const HEADING = new Set(["h2", "h3", "h4", "h5", "h6"]);
/** Headings come out as their own paragraph prefixed with this marker. */
export const HEADING_MARK = "§";
const SKIP_CLASS = /\b(pagenum|ws-pagenum|ws-noexport|reference|references|mw-references-wrap|reflist|licenseContainer|licensetpl|noprint|mw-editsection|ws-summary|ws-header|mw-empty-elt|sisitem|navbox|metadata)\b/;

/** Wikisource editors' annotations that are not part of the original text. */
const EDITOR_NOTES = [/初次发表时无此文，为《呐喊》编集时所加。/g, /一作“五月一日，广州。”/g];
/** Rare variant characters the glossary can't look up → standard forms (OpenCC t2s). */
const VARIANTS = { 彿: "佛", 賸: "剩", 矇: "蒙", 餧: "喂" };

/** Minimal HTML → text for Wikisource parser output (no dependencies). */
export function wsHtmlToText(html) {
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  const out = [];
  const stack = []; // { tag, skip }
  let skipDepth = 0;
  const re = /<\/?([a-zA-Z0-9]+)([^>]*)>|([^<]+)/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[3] !== undefined) {
      if (!skipDepth) out.push(m[3]);
      continue;
    }
    const tag = m[1].toLowerCase();
    const attrs = m[2] || "";
    const closing = m[0].startsWith("</");
    const selfClosing = VOID.has(tag) || attrs.trim().endsWith("/");
    if (closing) {
      // pop to the matching tag
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === tag) {
          const popped = stack.splice(i);
          for (const p of popped) if (p.skip) skipDepth--;
          break;
        }
      }
      if (!skipDepth && (BLOCK.has(tag) || HEADING.has(tag))) out.push("\n\n");
      continue;
    }
    if (selfClosing) {
      if (!skipDepth && tag === "br") out.push("\n");
      continue;
    }
    const cls = /class="([^"]*)"/.exec(attrs)?.[1] || "";
    const id = /id="([^"]*)"/.exec(attrs)?.[1] || "";
    const skip =
      ["script", "style", "table", "sup", "ol"].includes(tag) ||
      SKIP_CLASS.test(cls) ||
      id === "headerContainer";
    if (skip) skipDepth++;
    stack.push({ tag, skip });
    if (!skipDepth && BLOCK.has(tag)) out.push("\n\n");
    if (!skipDepth && HEADING.has(tag)) out.push("\n\n" + HEADING_MARK);
  }
  let text = out.join("");
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\u200b/g, "");
  text = text.replace(/Template:\S+/g, "");
  for (const note of EDITOR_NOTES) text = text.replace(note, "");
  text = text.replace(/[彿賸矇餧]/g, (ch) => VARIANTS[ch]);
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/[ \t\u3000]+/g, "").replace(/\n+/g, "").trim())
    .filter((p) => p && /[\u3400-\u9fff]/.test(p) && !/^版权|^本作品/.test(p))
    .join("\n\n");
}

async function wsPage(title) {
  const url =
    "https://zh.wikisource.org/w/api.php?" +
    new URLSearchParams({ action: "parse", format: "json", formatversion: "2", prop: "text", variant: "zh-hans", redirects: "1", page: title });
  const buf = await cachedFetch(url, `ws-${encodeURIComponent(title)}.json`);
  const json = JSON.parse(buf.toString("utf8"));
  if (!json.parse?.text) {
    fs.rmSync(path.join(CACHE, `ws-${encodeURIComponent(title)}.json`), { force: true });
    throw new Error(`no text for ${title}`);
  }
  return wsHtmlToText(json.parse.text);
}

const CN_NUM = "一二三四五六七八九十";

/** Split 阿Q正传-style texts on 第X章 headings. Returns null if there are none. */
export function splitChapters(body) {
  const paras = body.split("\n\n");
  const parts = [];
  for (const p of paras) {
    const h = /^§?第([一二三四五六七八九十]+)章[\s　]*(.*)$/.exec(p);
    if (h && p.length < 30) parts.push({ heading: p.replace(/^§/, "").replace(/章(?=\S)/, "章 "), paras: [] });
    else if (parts.length) parts[parts.length - 1].paras.push(p);
    else parts.push({ heading: null, paras: [p] });
  }
  const real = parts.filter((x) => x.heading);
  if (real.length < 2) return null;
  return parts.filter((x) => x.heading).map((x) => ({ heading: x.heading, body: x.paras.join("\n\n") }));
}

const dropHeadings = (body) =>
  body
    .split("\n\n")
    .filter((p) => !p.startsWith(HEADING_MARK))
    .join("\n\n");

async function buildCollection(items) {
  const sections = [];
  for (const [i, item] of items.entries()) {
    const key = String(i + 1).padStart(2, "0");
    let body = await wsPage(item.page);
    if (item.trimStart) body = body.slice(body.indexOf(item.trimStart));
    const parts = item.split ? splitChapters(body) : null;
    body = dropHeadings(body);
    const chapters = parts
      ? parts.map((p, j) => ({ key: `${key}.${j + 1}`, title: `${item.title} · ${p.heading}`, label: p.heading, body: dropHeadings(p.body) }))
      : [{ key, title: item.title, label: item.title, body }];
    sections.push({ key, title: item.title, sourceUrl: `https://zh.wikisource.org/wiki/${encodeURIComponent(item.page)}`, chapters });
  }
  return sections;
}

const NAHAN = [
  { page: "吶喊", title: "自序" },
  { page: "狂人日記", title: "狂人日记" },
  { page: "孔乙己", title: "孔乙己" },
  { page: "藥", title: "药" },
  { page: "明天", title: "明天" },
  { page: "一件小事", title: "一件小事" },
  { page: "頭髮的故事", title: "头发的故事" },
  { page: "風波", title: "风波" },
  { page: "故鄉", title: "故乡" },
  { page: "阿Q正傳", title: "阿Q正传", split: true },
  { page: "端午節", title: "端午节" },
  { page: "白光", title: "白光" },
  { page: "兔和貓", title: "兔和猫" },
  { page: "鴨的喜劇", title: "鸭的喜剧" },
  { page: "社戲", title: "社戏" },
];

const ZHAOHUA = [
  { page: "朝花夕拾/小引", title: "小引" },
  { page: "狗·猫·鼠", title: "狗·猫·鼠" },
  { page: "阿長與《山海經》", title: "阿长与《山海经》" },
  { page: "二十四孝圖", title: "二十四孝图" },
  { page: "五猖會", title: "五猖会" },
  { page: "无常", title: "无常" },
  { page: "從百草園到三味書屋", title: "从百草园到三味书屋" },
  { page: "父亲的病", title: "父亲的病" },
  { page: "琐记", title: "琐记" },
  { page: "藤野先生", title: "藤野先生" },
  { page: "范愛農", title: "范爱农" },
  { page: "朝花夕拾/後記", title: "后记" },
];

const ZHU = [
  { page: "匆匆", title: "匆匆" },
  { page: "槳聲燈影裏的秦淮河", title: "桨声灯影里的秦淮河" },
  { page: "背影", title: "背影" },
  { page: "荷塘月色", title: "荷塘月色" },
];

// ------------------------------------------------------------- output

function chapterLevelStats(app, sections) {
  const vocab = new Map();
  let chars = 0;
  let chapterCount = 0;
  const levels = [];
  for (const sec of sections) {
    for (const ch of sec.chapters) {
      const a = analyze(app, ch.body);
      ch.chars = a.chars;
      ch.level = a.level;
      ch.score = round(a.score, 2);
      chars += a.chars;
      chapterCount += 1;
      levels.push(a.level);
      for (const [w, c] of a.counts) {
        vocab.set(w, (vocab.get(w) || 0) + c);
      }
    }
    sec.chars = sec.chapters.reduce((s, c) => s + c.chars, 0);
    const secA = analyze(app, sec.chapters.map((c) => c.body).join("\n"));
    sec.level = secA.level;
    sec.score = round(secA.score, 2);
  }
  const all = analyze(app, sections.flatMap((s) => s.chapters.map((c) => c.body)).join("\n"));
  levels.sort((a, b) => a - b);
  return {
    chars,
    chapterCount,
    level: all.level,
    score: round(all.score, 2),
    levelMin: levels[0],
    levelMax: levels[levels.length - 1],
    levelLow: levels[Math.floor((levels.length - 1) * 0.25)],
    levelHigh: levels[Math.floor((levels.length - 1) * 0.75)],
    profile: profileOf(vocab, 4000),
  };
}

function profileOf(vocab, cap) {
  const sorted = [...vocab.entries()].sort((a, b) => b[1] - a[1]);
  const tokens = sorted.reduce((s, [, c]) => s + c, 0);
  const top = sorted.slice(0, cap);
  return { tokens, words: top.map(([w]) => w), counts: top.map(([, c]) => c) };
}

function writeWork(app, id, sections) {
  const dir = path.join(OUT, id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const stats = chapterLevelStats(app, sections);
  const toc = {
    id,
    sections: sections.map((s) => ({
      key: s.key,
      title: s.title,
      ...(s.part ? { part: s.part } : {}),
      ...(s.sourceUrl ? { sourceUrl: s.sourceUrl } : {}),
      chars: s.chars,
      level: s.level,
      chapters: s.chapters.map((c) => ({ key: c.key, title: c.title, label: c.label, chars: c.chars, level: c.level })),
    })),
  };
  fs.writeFileSync(path.join(dir, "toc.json"), JSON.stringify(toc));
  for (const s of sections) {
    for (const c of s.chapters) {
      if (!/^[A-Z0-9.]+$/.test(c.key)) throw new Error(`unsafe chapter key ${c.key}`);
      fs.writeFileSync(path.join(dir, `${c.key}.json`), JSON.stringify({ key: c.key, title: c.title, body: c.body }));
    }
  }
  fs.writeFileSync(path.join(dir, "profile.json"), JSON.stringify(stats.profile));
  const first = sections[0].chapters[0].key;
  return {
    id,
    chapters: stats.chapterCount,
    sections: sections.length,
    chars: stats.chars,
    level: stats.level,
    score: stats.score,
    levelMin: stats.levelMin,
    levelMax: stats.levelMax,
    levelLow: stats.levelLow,
    levelHigh: stats.levelHigh,
    firstKey: first,
  };
}

function dirSize(dir) {
  let total = 0;
  let files = 0;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      const s = dirSize(p);
      total += s.total;
      files += s.files;
    } else {
      total += fs.statSync(p).size;
      files += 1;
    }
  }
  return { total, files };
}

async function main() {
  const app = await loadAppModules();
  const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
  const jobs = [
    ["bible-cuv", buildBible],
    ["nahan", () => buildCollection(NAHAN)],
    ["zhaohua-xishi", () => buildCollection(ZHAOHUA)],
    ["zhu-ziqing-essays", () => buildCollection(ZHU)],
  ];
  const genPath = path.join(root, "src/data/works.generated.ts");
  const existing = fs.existsSync(genPath)
    ? JSON.parse(/= (\{[\s\S]*\});/.exec(fs.readFileSync(genPath, "utf8"))?.[1] || "{}")
    : {};
  const meta = { ...existing };
  for (const [id, build] of jobs) {
    if (only && only !== id) continue;
    const sections = await build();
    meta[id] = writeWork(app, id, sections);
    const size = dirSize(path.join(OUT, id));
    console.log(
      `${id}: ${meta[id].sections} sections, ${meta[id].chapters} chapters, ${meta[id].chars} 字, level ${meta[id].level} (${meta[id].levelMin}–${meta[id].levelMax}); ${size.files} files, ${(size.total / 1024 / 1024).toFixed(2)} MB`,
    );
  }
  const header =
    "// Generated by scripts/build-works.mjs — do not edit by hand.\n" +
    'import type { WorkStats } from "../lib/works";\n\n' +
    "export const WORK_STATS: Record<string, WorkStats> = ";
  fs.writeFileSync(genPath, header + JSON.stringify(meta, null, 2) + ";\n");
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
