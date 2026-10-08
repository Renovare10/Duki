#!/usr/bin/env node
/**
 * Measure one Simplified text the same way the library does.
 *
 *   node scripts/check-text.mjs --level 3 <<'EOF'
 *   我今天去学校。
 *   EOF
 *
 * Prints level, Han count, HSK coverage, unknown share for a reader who
 * finished the previous level, and any token missing from the glossary.
 * Exit 1 when --level is set and the measured level differs, or a token is missing.
 */
import { analyze, loadAppModules, loadGlossary } from "./lib/corpus.mjs";

const args = process.argv.slice(2);
let expect = null;
const levelFlag = args.find((a) => a.startsWith("--level"));
if (levelFlag === "--level") expect = Number(args[args.indexOf("--level") + 1]);
else if (levelFlag?.startsWith("--level=")) expect = Number(levelFlag.slice(8));

const text = (await new Response(process.stdin).text()).trim();
const app = await loadAppModules();
const g = loadGlossary();
const a = analyze(app, text);
const missing = [];
for (const [word] of a.counts) if (!g.hasWord(word)) missing.push(word);
const prev = a.level <= 1 ? null : 1 - (a.coverage[a.level - 2] ?? 0);
console.log(
  JSON.stringify(
    {
      level: a.level,
      score: Math.round(a.score * 100) / 100,
      chars: a.chars,
      tokens: a.tokens,
      coverage: a.coverage.map((n) => Math.round(n * 1000) / 1000),
      prevUnknown: prev === null ? null : Math.round(prev * 1000) / 1000,
      missing,
    },
    null,
    2,
  ),
);
if (missing.length || (expect && a.level !== expect)) process.exit(1);
