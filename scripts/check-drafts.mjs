#!/usr/bin/env node
/**
 * Measure library drafts and optionally nudge them into the level band.
 *
 *   node scripts/check-drafts.mjs drafts.json
 *   node scripts/check-drafts.mjs drafts.json --fix
 *
 * The file is `{ "packId": "...", "texts": [ { id, title, blurb, topics, level, body, category?, series? } ] }`.
 * Exit 1 when any text is outside its band, missing glossary words, or the wrong length.
 */
import fs from "node:fs";
import { loadAppModules } from "./lib/corpus.mjs";
import { aimFor, failureNotes, fitText, glossary, inBand, loadLookup, measureText, stepFor } from "./lib/level-fit.mjs";

const LENGTH = {
  1: [50, 90],
  2: [90, 160],
  3: [160, 300],
  4: [240, 500],
  5: [420, 800],
  6: [620, 1100],
  7: [980, 1600],
  8: [1450, 2000],
  9: [1500, 2400],
  10: [1600, 2600],
};

const file = process.argv[2];
const fix = process.argv.includes("--fix");
if (!file) {
  console.error("usage: node scripts/check-drafts.mjs <drafts.json> [--fix]");
  process.exit(2);
}

const app = await loadAppModules();
const g = glossary();
const lookup = loadLookup(app);
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const trad = new Set();
const raw = JSON.parse(fs.readFileSync(new URL("../public/glossary.json", import.meta.url), "utf8"));
const t2s = String(raw.t2s || "");
for (let i = 0; i < t2s.length; i += 2) trad.add(t2s[i]);

let failed = 0;
for (const entry of data.texts || []) {
  let body = String(entry.body || "").trim();
  let measured = measureText(app, g, lookup, body);
  let fitted = false;
  if (fix && !inBand(measured, entry.level)) {
    const result = fitText(app, g, lookup, body, entry.level, { maxSteps: 80 });
    body = result.text.trim();
    measured = result.measured;
    fitted = result.text.trim() !== String(entry.body || "").trim();
    entry.body = body;
  }
  const problems = [];
  if (!inBand(measured, entry.level)) problems.push(failureNotes(measured, entry.level));
  const [lo, hi] = LENGTH[entry.level] || [1, 20000];
  if (measured.chars < lo || measured.chars > hi) problems.push(`length ${measured.chars} outside ${lo}–${hi}`);
  const tradChars = [...body].filter((ch) => trad.has(ch));
  if (tradChars.length) problems.push(`traditional characters: ${[...new Set(tradChars)].slice(0, 8).join("")}`);
  if (/[A-Za-z]/.test(body)) problems.push("Latin letters in body");
  if (/[,.!?;:]/.test(body)) problems.push("half-width punctuation");
  const step = stepFor(measured, entry.level);
  const aim = aimFor(entry.level);
  const mark = problems.length ? "FAIL" : "ok";
  if (problems.length) failed += 1;
  console.log(
    `${mark} ${entry.id} L${entry.level} measured L${measured.level} step ${(step * 100).toFixed(1)}% (band ${(aim.minStep * 100).toFixed(0)}–${(aim.maxStep * 100).toFixed(0)}) ${measured.chars}字${fitted ? " fixed" : ""}`,
  );
  for (const problem of problems) console.log(`  ${problem.replaceAll("\n", "\n  ")}`);
}

if (fix) fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log(`\n${data.texts.length - failed}/${data.texts.length} passed`);
process.exit(failed ? 1 : 0);
