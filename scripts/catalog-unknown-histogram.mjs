#!/usr/bin/env node
/**
 * Offline unknown-load histogram for owned catalog texts.
 * Proxy lexicon = HSK 1+2 (+ optionally HSK 3). Segmentation matches
 * src/lib/segment.ts using public/glossary.json as hasWord.
 *
 * Usage:
 *   node scripts/catalog-unknown-histogram.mjs
 *   node scripts/catalog-unknown-histogram.mjs --out /path/report.json
 *   node scripts/catalog-unknown-histogram.mjs --hsk 1,2   # default 1,2,3
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const HAN = /[\u3400-\u9fff\uf900-\ufaff]/;

function parseArgs(argv) {
  const out = { out: null, hsk: [1, 2, 3] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") out.out = argv[++i];
    else if (a === "--hsk") {
      out.hsk = String(argv[++i])
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => n >= 1 && n <= 6);
    }
  }
  return out;
}

function loadHsk(levels) {
  const known = new Set();
  for (const level of levels) {
    const file = path.join(root, "scripts", `hsk-${level}.json`);
    const rows = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const row of rows) {
      const h = String(row.hanzi || "").trim();
      if (h) known.add(h);
    }
  }
  return known;
}

function loadGlossary() {
  const data = JSON.parse(
    fs.readFileSync(path.join(root, "public", "glossary.json"), "utf8"),
  );
  const dict = new Set(Object.keys(data.entries || {}));
  return { dict, maxLen: data.maxLen || 8 };
}

/** Same greedy longest-match logic as src/lib/segment.ts */
function segment(text, hasWord, maxLen) {
  const tokens = [];
  let i = 0;
  const n = text.length;
  while (i < n) {
    const ch = text[i];
    if (!HAN.test(ch)) {
      let j = i + 1;
      while (j < n && !HAN.test(text[j])) j++;
      tokens.push({ text: text.slice(i, j), isWord: false });
      i = j;
      continue;
    }
    const limit = Math.min(maxLen, n - i);
    let found = ch;
    for (let len = limit; len >= 2; len--) {
      const slice = text.slice(i, i + len);
      if (hasWord(slice)) {
        found = slice;
        break;
      }
    }
    tokens.push({ text: found, isWord: true });
    i += found.length;
  }
  return tokens;
}

/**
 * Extract OWNED entry({...}) blocks from catalog.ts without compiling TS.
 * Bodies use template literals; we capture until the closing backtick.
 */
function loadOwnedTexts() {
  const src = fs.readFileSync(path.join(root, "src/data/catalog.ts"), "utf8");
  const ownedMatch = src.match(/const OWNED: LibraryText\[] = \[([\s\S]*?)\];\s*\n\s*export const CATALOG/);
  if (!ownedMatch) throw new Error("Could not find OWNED array in catalog.ts");
  const block = ownedMatch[1];
  const texts = [];
  const entryRe = /entry\(\{\s*([\s\S]*?)\n\s*\}\),?/g;
  let m;
  while ((m = entryRe.exec(block))) {
    const body = m[1];
    const id = body.match(/\bid:\s*"([^"]+)"/)?.[1];
    const title = body.match(/\btitle:\s*"([^"]+)"/)?.[1];
    const category = body.match(/\bcategory:\s*"([^"]+)"/)?.[1];
    const bodyM = body.match(/\bbody:\s*`([\s\S]*?)`/);
    if (!id || !title || !bodyM) continue;
    const textBody = bodyM[1];
    if (!textBody.trim()) continue;
    texts.push({ id, title, category: category || "?", body: textBody });
  }
  return texts;
}

function scoreText(body, known, hasWord, maxLen) {
  const tokens = segment(body, hasWord, maxLen);
  const words = tokens.filter((t) => t.isWord);
  let knownCount = 0;
  const unique = new Set();
  const uniqueUnknown = new Set();
  for (const t of words) {
    unique.add(t.text);
    if (known.has(t.text)) knownCount += 1;
    else uniqueUnknown.add(t.text);
  }
  const total = words.length;
  const knownPct = total === 0 ? 0 : knownCount / total;
  const unknownLoad = total === 0 ? 0 : 1 - knownPct;
  return {
    total,
    known: knownCount,
    unknown: total - knownCount,
    knownPct,
    unknownLoad,
    unique: unique.size,
    uniqueUnknown: uniqueUnknown.size,
  };
}

const BUCKETS = [
  { key: "0-5%", lo: 0, hi: 0.05 },
  { key: "5-10%", lo: 0.05, hi: 0.1 },
  { key: "10-15%", lo: 0.1, hi: 0.15 },
  { key: "15-20%", lo: 0.15, hi: 0.2 },
  { key: "20-26%", lo: 0.2, hi: 0.26 },
  { key: "26%+", lo: 0.26, hi: Infinity },
];

function bucketOf(load) {
  for (const b of BUCKETS) {
    if (load >= b.lo && load < b.hi) return b.key;
  }
  return "26%+";
}

function main() {
  const args = parseArgs(process.argv);
  const known = loadHsk(args.hsk);
  const { dict, maxLen } = loadGlossary();
  const hasWord = (w) => dict.has(w);
  const texts = loadOwnedTexts();

  const rows = texts.map((t) => {
    const score = scoreText(t.body, known, hasWord, maxLen);
    return {
      id: t.id,
      title: t.title,
      category: t.category,
      hanChars: (t.body.match(/[\u3400-\u9fff]/g) || []).length,
      ...score,
      unknownPct: Math.round(score.unknownLoad * 1000) / 10,
      bucket: bucketOf(score.unknownLoad),
    };
  });
  rows.sort((a, b) => a.unknownLoad - b.unknownLoad || a.id.localeCompare(b.id));

  const buckets = {};
  for (const b of BUCKETS) buckets[b.key] = [];
  for (const r of rows) buckets[r.bucket].push(r);

  const jr = buckets["5-10%"].length;
  const mid = buckets["10-15%"].length + buckets["15-20%"].length;
  const wall = buckets["20-26%"].length + buckets["26%+"].length;
  const easy = buckets["0-5%"].length;
  const cliff =
    mid === 0 && wall > 0
      ? "CONFIRMED: mid-band (10-20%) empty while harder texts exist (cliff)"
      : mid < 3 && wall >= 5
        ? "LIKELY: thin mid-band vs many harder texts"
        : mid >= 5
          ? "REFUTED / FILLED: mid-band has several titles"
          : "PARTIAL: some mid-band presence";

  const report = {
    generatedAt: new Date().toISOString(),
    proxyLexicon: `HSK ${args.hsk.join("+")}`,
    lexiconSize: known.size,
    glossaryMaxLen: maxLen,
    glossaryWords: dict.size,
    textCount: rows.length,
    buckets: Object.fromEntries(
      BUCKETS.map((b) => [
        b.key,
        {
          count: buckets[b.key].length,
          titles: buckets[b.key].map((r) => ({
            id: r.id,
            title: r.title,
            unknownPct: r.unknownPct,
            total: r.total,
            uniqueUnknown: r.uniqueUnknown,
          })),
        },
      ]),
    ),
    summary: { easy, justRight: jr, midHard: mid, wall, cliff },
    texts: rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      unknownPct: r.unknownPct,
      unknownLoad: r.unknownLoad,
      total: r.total,
      uniqueUnknown: r.uniqueUnknown,
      hanChars: r.hanChars,
      bucket: r.bucket,
    })),
  };

  console.log(`Proxy lexicon: HSK ${args.hsk.join("+")} (${known.size} words)`);
  console.log(`Owned texts with bodies: ${rows.length}`);
  console.log(`Segmentation: glossary maxLen=${maxLen}, dict=${dict.size}`);
  console.log("");
  for (const b of BUCKETS) {
    const list = buckets[b.key];
    console.log(`=== ${b.key} (${list.length}) ===`);
    for (const r of list) {
      console.log(
        `  ${r.unknownPct.toFixed(1).padStart(5)}%  ${r.id.padEnd(28)} ${r.title}  (words=${r.total}, unkU=${r.uniqueUnknown})`,
      );
    }
    console.log("");
  }
  console.log("Cliff status:", cliff);
  console.log(
    `Counts: easy(0-5)=${easy} just-right(5-10)=${jr} mid(10-20)=${mid} wall(20+)=${wall}`,
  );

  if (args.out) {
    fs.mkdirSync(path.dirname(args.out), { recursive: true });
    fs.writeFileSync(args.out, JSON.stringify(report, null, 2));
    console.log(`Wrote ${args.out}`);
  }
}

main();
