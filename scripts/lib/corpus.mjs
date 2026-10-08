/**
 * Shared offline helpers for library tooling (audit, works import, text meta).
 * TypeScript sources are bundled on the fly with rolldown so scripts reuse the
 * app's exact segmenter and difficulty logic.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "rolldown";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Bundle a TS entry (source text) to a temp ESM file and import it. */
export async function importTs(source, name = "entry") {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "duki-ts-"));
  const entry = path.join(dir, `${name}.ts`);
  fs.writeFileSync(entry, source);
  const out = path.join(dir, `${name}.mjs`);
  await build({
    input: entry,
    output: { file: out, format: "esm" },
    logLevel: "silent",
    resolve: { extensions: [".ts", ".tsx", ".js", ".mjs"] },
  });
  return import(pathToFileURL(out).href);
}

export async function loadAppModules() {
  const src = (p) => JSON.stringify(path.join(root, "src", p));
  return importTs(`
export { CATALOG } from ${src("data/library.ts")};
export { segment } from ${src("lib/segment.ts")};
export * as difficulty from ${src("lib/difficulty.ts")};
`);
}

let glossaryCache = null;
export function loadGlossary() {
  if (glossaryCache) return glossaryCache;
  const data = JSON.parse(fs.readFileSync(path.join(root, "public", "glossary.json"), "utf8"));
  const dict = new Set(Object.keys(data.entries || {}));
  glossaryCache = { dict, maxLen: data.maxLen || 8, hasWord: (w) => dict.has(w) };
  return glossaryCache;
}

let hskCache = null;
/** word → lowest HSK 2.0 level (1–6). */
export function loadHsk() {
  if (hskCache) return hskCache;
  const map = new Map();
  for (let level = 1; level <= 6; level++) {
    const rows = JSON.parse(fs.readFileSync(path.join(root, "scripts", `hsk-${level}.json`), "utf8"));
    for (const row of rows) {
      const h = String(row.hanzi || "").trim();
      if (h && !map.has(h)) map.set(h, level);
    }
  }
  hskCache = map;
  return map;
}

/** Word tokens of a text using the app segmenter. */
export function wordTokens(app, text) {
  const g = loadGlossary();
  return app.segment(text, g.hasWord, g.maxLen).filter((t) => t.isWord).map((t) => t.text);
}

/** Level, length, and vocabulary stats for one text. */
let lookupCache = null;
export function hskLookup(app) {
  lookupCache ||= app.difficulty.makeHskLookup(loadHsk());
  return lookupCache;
}

export function analyze(app, text) {
  const lookup = hskLookup(app);
  const words = wordTokens(app, text);
  const { tokens, coverage } = app.difficulty.hskCoverage(words, lookup);
  const info = app.difficulty.levelFromCoverage(coverage);
  const counts = new Map();
  for (const w of words) counts.set(w, (counts.get(w) || 0) + 1);
  return {
    tokens,
    coverage,
    level: info.level,
    score: info.score,
    chars: app.difficulty.hanCount(text),
    unique: counts.size,
    counts,
  };
}

export function round(n, d = 3) {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}
