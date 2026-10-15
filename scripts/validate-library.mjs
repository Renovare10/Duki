#!/usr/bin/env node
/**
 * Check built-in library packs (src/data/library) against the content plan.
 *
 *   node scripts/validate-library.mjs
 *
 * Prints distribution tables. Exits 1 when a target is missed.
 * Levels and glossary tokens use the same segmenter as the reader.
 */
import { analyze, importTs, loadGlossary, root } from "./lib/corpus.mjs";
import path from "node:path";

const app = await importTs(`
export { CATALOG } from ${JSON.stringify(path.join(root, "src/data/library.ts"))};
export { segment } from ${JSON.stringify(path.join(root, "src/lib/segment.ts"))};
export * as difficulty from ${JSON.stringify(path.join(root, "src/lib/difficulty.ts"))};
`);

const lib = await importTs(`
export { PACKS } from ${JSON.stringify(path.join(root, "src/data/library/index.ts"))};
export { TOPICS } from ${JSON.stringify(path.join(root, "src/data/topics.ts"))};
export { validateEntries } from ${JSON.stringify(path.join(root, "src/lib/library-entry.ts"))};
`);
const { PACKS, TOPICS, validateEntries } = lib;

const topicIds = new Set(TOPICS.map((t) => t.id));
const entries = PACKS.flatMap((p) => p.texts);
const errors = [];
const formatErrors = validateEntries(entries, topicIds, new Set(app.CATALOG.filter((t) => !t.id.startsWith("lib-")).map((t) => t.id)));
errors.push(...formatErrors);

const g = loadGlossary();
const byLevel = new Map();
for (let n = 1; n <= 10; n++) byLevel.set(n, []);

const topicCounts = new Map(TOPICS.map((t) => [t.id, 0]));
const series = new Map();

for (const entry of entries) {
  for (const topic of entry.topics || []) topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
  if (entry.series?.id) {
    const row = series.get(entry.series.id) || { title: entry.series.title, parts: [] };
    row.parts.push(entry.series.part);
    series.set(entry.series.id, row);
  }
  const a = analyze(app, entry.body || "");
  const missing = [];
  for (const [word] of a.counts) if (!g.hasWord(word)) missing.push(word);
  if (missing.length) errors.push(`${entry.id}: not in glossary: ${missing.slice(0, 8).join("、")}`);
  if (a.level !== entry.level) errors.push(`${entry.id}: declared L${entry.level}, measured L${a.level} (${a.chars} 字)`);
  // L1 is all HSK 1. L2–L6 step off the list just below the level.
  // L7+ has no list of its own: the step is the share of tokens outside HSK 1–6.
  const prevUnknown = stepOf(a);
  byLevel.get(a.level)?.push({ id: entry.id, chars: a.chars, prevUnknown, topics: entry.topics });
}

const ownedLevels = new Map();
for (let n = 1; n <= 10; n++) ownedLevels.set(n, 0);
for (const text of app.CATALOG) {
  if (!text.body?.trim()) continue;
  if (text.kind === "wiki" || text.kind === "wikisource" || text.category === "wiki" || text.category === "wikisource") continue;
  if (text.id.startsWith("lib-")) continue;
  const a = analyze(app, text.body);
  ownedLevels.set(a.level, (ownedLevels.get(a.level) || 0) + 1);
}

function median(nums) {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

/** Share of tokens that are new at this measured level (0–1). */
function stepOf(info) {
  if (info.level <= 1) return 0;
  if (info.level >= 7) return 1 - (info.coverage[5] ?? 0);
  return 1 - (info.coverage[info.level - 2] ?? 0);
}

console.log("\nNew texts by measured level");
console.log("level  new  owned  total  median字  step%");
let newTotal = 0;
for (let n = 1; n <= 10; n++) {
  const rows = byLevel.get(n);
  newTotal += rows.length;
  const total = rows.length + (ownedLevels.get(n) || 0);
  const medChars = median(rows.map((r) => r.chars));
  const step = median(rows.map((r) => r.prevUnknown));
  console.log(
    `L${String(n).padEnd(2)}  ${String(rows.length).padStart(4)}  ${String(ownedLevels.get(n) || 0).padStart(5)}  ${String(total).padStart(5)}  ${
      medChars == null ? "  —" : String(medChars).padStart(6)
    }  ${step == null ? "  —" : (step * 100).toFixed(1).padStart(5)}`,
  );
  if (n <= 8 && total < 30) errors.push(`L${n} has ${total} texts (need ≥ 30)`);
  if (n >= 2 && n <= 4 && rows.length && step > 0.08) errors.push(`L${n} step is ${(step * 100).toFixed(1)}% (need ≤ 8%)`);
  if (n >= 5 && n <= 8 && rows.length && step > 0.12) errors.push(`L${n} step is ${(step * 100).toFixed(1)}% (need ≤ 12%)`);
}
console.log("new total", newTotal, "owned with a body", [...ownedLevels.values()].reduce((s, n) => s + n, 0));

console.log("\nTopics on new texts");
for (const topic of TOPICS) {
  const n = topicCounts.get(topic.id) || 0;
  console.log(`${topic.id.padEnd(14)} ${n}`);
  if (topic.id !== "classics" && n < 4) errors.push(`topic ${topic.id} has ${n} new texts (need ≥ 4)`);
}

const serials = [...series.entries()].filter(([, row]) => new Set(row.parts).size >= 5);
console.log("\nSerials with ≥ 5 parts:", serials.map(([id, row]) => `${id} (${row.parts.length})`).join(", ") || "(none)");
if (serials.length < 2) errors.push(`need ≥ 2 serials of 5+ parts, found ${serials.length}`);
if (newTotal < 400) errors.push(`need ≥ 400 new texts, found ${newTotal}`);
if ((byLevel.get(9)?.length || 0) + (byLevel.get(10)?.length || 0) < 6) errors.push("need a few L9–L10 texts");

const lengthBand = {
  1: [40, 100],
  2: [70, 180],
  3: [130, 360],
  4: [180, 600],
  5: [350, 1200],
  6: [500, 1800],
  7: [900, 3200],
  8: [1400, 4000],
};
for (const [level, rows] of byLevel) {
  const band = lengthBand[level];
  if (!band || !rows.length) continue;
  const med = median(rows.map((r) => r.chars));
  if (med < band[0] || med > band[1]) errors.push(`L${level} median length ${med} is outside ${band[0]}–${band[1]}`);
}

console.log(errors.length ? `\n${errors.length} problems` : "\nOK");
for (const e of errors) console.log(" -", e);
process.exit(errors.length ? 1 : 0);
