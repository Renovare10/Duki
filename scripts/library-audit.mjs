#!/usr/bin/env node
/**
 * Library audit: inventory, levels, lengths, topics, and difficulty-curve jumps.
 *   node scripts/library-audit.mjs [--json docs/library-audit.json]
 * Uses the app's segmenter + glossary and HSK 2.0 lists (scripts/hsk-*.json).
 */
import fs from "node:fs";
import path from "node:path";
import { analyze, loadAppModules, loadHsk, root, round } from "./lib/corpus.mjs";

const args = process.argv.slice(2);
const jsonOut = args.includes("--json") ? args[args.indexOf("--json") + 1] : null;

const app = await loadAppModules();
const hsk = loadHsk();
const catalog = app.CATALOG;
const owned = catalog.filter((t) => t.body.trim());
const median = (xs) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const pct = (n) => `${round(n * 100, 1)}%`;

const byKind = {};
for (const t of catalog) byKind[`${t.kind}/${t.category}`] = (byKind[`${t.kind}/${t.category}`] || 0) + 1;

const rows = owned.map((t) => {
  const a = analyze(app, t.body);
  return { id: t.id, title: t.title, category: t.category, ...a };
});
rows.sort((a, b) => a.score - b.score);

const levels = {};
for (const r of rows) levels[r.level] = (levels[r.level] || 0) + 1;
const chars = rows.map((r) => r.chars);

// Corpus vocabulary and HSK coverage of the corpus.
const vocab = new Map();
for (const r of rows) for (const [w, c] of r.counts) vocab.set(w, (vocab.get(w) || 0) + c);
const hskSeen = [0, 0, 0, 0, 0, 0];
const hskTotal = [0, 0, 0, 0, 0, 0];
for (const [, lv] of hsk) hskTotal[lv - 1] += 1;
for (const w of vocab.keys()) {
  const lv = hsk.get(w);
  if (lv) hskSeen[lv - 1] += 1;
}

// Jump A: for a reader who has exactly HSK 1…L-1, the unknown share of level-L texts.
const jumpA = {};
for (let L = 2; L <= 10; L++) {
  const texts = rows.filter((r) => r.level === L);
  if (!texts.length) continue;
  const k = Math.min(6, L - 1);
  jumpA[L] = { texts: texts.length, medianUnknownForPrev: round(median(texts.map((r) => 1 - r.coverage[k - 1]))) };
}

// Jump B: corpus-internal novelty. Reading the library easiest→hardest, the share of
// each text's tokens that never appeared in any easier text.
const seen = new Set();
const novelty = [];
for (const r of rows) {
  let fresh = 0;
  let total = 0;
  for (const [w, c] of r.counts) {
    total += c;
    if (!seen.has(w)) fresh += c;
  }
  novelty.push({ id: r.id, level: r.level, score: round(r.score, 2), newShare: round(total ? fresh / total : 0) });
  for (const w of r.counts.keys()) seen.add(w);
}
const noveltyByLevel = {};
for (const n of novelty) (noveltyByLevel[n.level] ||= []).push(n.newShare);

const report = {
  generatedAt: new Date().toISOString(),
  catalog: { total: catalog.length, byKind, owned: owned.length },
  owned: {
    chars: { total: chars.reduce((a, b) => a + b, 0), min: Math.min(...chars), median: median(chars), max: Math.max(...chars) },
    over300: rows.filter((r) => r.chars > 300).length,
    over1000: rows.filter((r) => r.chars > 1000).length,
    levels,
    vocabulary: vocab.size,
    hskCovered: hskSeen.map((n, i) => `${n}/${hskTotal[i]}`),
    jumpUnknownForPreviousLevel: jumpA,
    noveltyMedianByLevel: Object.fromEntries(Object.entries(noveltyByLevel).map(([k, v]) => [k, round(median(v))])),
  },
  texts: rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    level: r.level,
    score: round(r.score, 2),
    chars: r.chars,
    unique: r.unique,
    coverage: r.coverage.map((c) => round(c)),
  })),
  novelty,
};

console.log(`Catalog: ${catalog.length} entries; owned with text: ${owned.length}`);
console.log("By kind/category:", byKind);
console.log(`Owned chars total ${report.owned.chars.total}, median ${report.owned.chars.median}, max ${report.owned.chars.max}; >300 字: ${report.owned.over300}; >1000 字: ${report.owned.over1000}`);
console.log("Levels:", levels);
console.log(`Corpus vocabulary: ${vocab.size} words; HSK words seen per level: ${report.owned.hskCovered.join(", ")}`);
console.log("Unknown share for a reader at the previous level (median):", jumpA);
console.log("Corpus novelty median by level:", report.owned.noveltyMedianByLevel);
for (const r of rows) {
  console.log(`  L${r.level} ${r.score.toFixed(2)} ${String(r.chars).padStart(4)}字 ${r.category.padEnd(8)} ${r.id} ${r.title}  cov=${r.coverage.map((c) => pct(c)).join("/")}`);
}
if (jsonOut) {
  fs.writeFileSync(path.resolve(root, jsonOut), JSON.stringify(report, null, 2));
  console.log(`wrote ${jsonOut}`);
}
