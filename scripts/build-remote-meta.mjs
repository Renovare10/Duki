#!/usr/bin/env node
/**
 * Precompute card metadata for the live catalog pages (Wikipedia + Wikisource).
 *
 *   node scripts/build-remote-meta.mjs [--offline] [--only=wiki|ws]
 *
 * Fetches every catalog page with the app's own fetch/parse code (so the text is
 * exactly what the reader shows), caches API responses in scripts/cache/remote/,
 * and writes:
 *   - src/data/remote-meta.generated.ts  level / score / length / gloss coverage per id
 *   - public/meta/word-sets.json          compact word→count sets for the unknown-% estimate
 *   - public/classics/<file>.json         Wikisource bodies: original + Simplified (char-aligned)
 * Wikipedia article text is NOT stored (only derived metadata); the reader still
 * fetches it live, as before. Wikisource texts are public domain.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import OpenCC from "opencc-js";
import { analyze, importTs, loadGlossary, root, round } from "./lib/corpus.mjs";

const args = new Set(process.argv.slice(2));
const OFFLINE = args.has("--offline");
const ONLY = [...args].find((a) => a.startsWith("--only="))?.slice(7);
const CACHE = path.join(root, "scripts", "cache", "remote");
fs.mkdirSync(CACHE, { recursive: true });
const UA = "DukiLibraryBuild/1.0 (https://duki.chadmurchison.com; github.com/Renovare10) node-fetch";
const realFetch = globalThis.fetch;
const MIN_GAP_MS = 350;
let lastAt = 0;
let network = 0;
let cached = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** fetch() replacement for the app modules: on-disk cache, polite rate limit, retries. */
async function cachedFetch(input) {
  const url = String(input);
  const file = path.join(CACHE, crypto.createHash("sha1").update(url).digest("hex") + ".json");
  if (fs.existsSync(file)) {
    cached += 1;
    return new Response(fs.readFileSync(file), { status: 200, headers: { "content-type": "application/json" } });
  }
  if (OFFLINE) return new Response("{}", { status: 503 });
  for (let attempt = 0; attempt < 6; attempt++) {
    const wait = lastAt + MIN_GAP_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastAt = Date.now();
    network += 1;
    let res;
    try {
      res = await realFetch(url, { headers: { "User-Agent": UA, "Api-User-Agent": UA } });
    } catch {
      await sleep(2000 * (attempt + 1));
      continue;
    }
    if (res.status === 429 || res.status >= 500) {
      const after = Number(res.headers.get("retry-after")) || 5 * (attempt + 1);
      await sleep(after * 1000);
      continue;
    }
    const body = await res.text();
    if (res.ok) {
      try {
        const json = JSON.parse(body);
        if (!json.error) fs.writeFileSync(file, body);
      } catch {
        /* not JSON: don't cache */
      }
    }
    return new Response(body, { status: res.status, headers: { "content-type": "application/json" } });
  }
  return new Response("{}", { status: 503 });
}
globalThis.fetch = cachedFetch;

const src = (p) => JSON.stringify(path.join(root, "src", p));
const app = await importTs(`
export { wikiStubs, fetchWikiPage } from ${src("lib/wiki.ts")};
export { wikisourceStubs, fetchWikisourcePage } from ${src("lib/wikisource.ts")};
export { segment } from ${src("lib/segment.ts")};
export * as difficulty from ${src("lib/difficulty.ts")};
`);

const glossary = JSON.parse(fs.readFileSync(path.join(root, "public", "glossary.json"), "utf8"));
const entries = glossary.entries;
const g = loadGlossary();
const toSimpPhrase = OpenCC.Converter({ from: "t", to: "cn" });
const T2S = new Map();
for (let i = 0; i + 1 < glossary.t2s.length; i += 2) T2S.set(glossary.t2s[i], glossary.t2s[i + 1]);
const charSimp = (s) => Array.from(s, (c) => T2S.get(c) ?? c).join("");

/** Simplified text with exactly the same UTF-16 length/positions as the original. */
function alignedSimplified(text) {
  const whole = toSimpPhrase(text);
  if (whole.length === text.length) return whole;
  return text
    .split(/(\n)/)
    .map((line) => {
      const conv = toSimpPhrase(line);
      return conv.length === line.length ? conv : charSimp(line);
    })
    .join("");
}

const HAN = /[\u3400-\u9fff\uf900-\ufaff]/;
/** Share of Han characters that sit in a glossary word with an English gloss. */
function glossCoverage(text) {
  let han = 0;
  let glossed = 0;
  for (const t of app.segment(text, g.hasWord, g.maxLen)) {
    const n = Array.from(t.text).filter((c) => HAN.test(c)).length;
    if (!n) continue;
    han += n;
    if (t.isWord && entries[t.text]?.[1]) glossed += n;
  }
  return han ? glossed / han : 0;
}

const meta = {};
const failed = [];
const sets = {};
const vocab = new Map();
const classics = {};
const classicFiles = {};
fs.mkdirSync(path.join(root, "public", "classics"), { recursive: true });
fs.mkdirSync(path.join(root, "public", "meta"), { recursive: true });

function record(id, body) {
  const a = analyze(app, body);
  const flat = [];
  for (const [w, c] of [...a.counts].sort((x, y) => y[1] - x[1])) {
    if (!vocab.has(w)) vocab.set(w, vocab.size);
    flat.push(vocab.get(w), c);
  }
  sets[id] = flat;
  meta[id] = [a.level, Math.round(a.score * 100), a.chars, a.tokens];
  return a;
}

const started = Date.now();
if (ONLY !== "ws") {
  const stubs = app.wikiStubs(300);
  let i = 0;
  for (const stub of stubs) {
    i += 1;
    try {
      const page = await app.fetchWikiPage(stub.wikiTitle, { full: true });
      record(stub.id, page.extract);
    } catch (err) {
      failed.push({ id: stub.id, error: String(err.message || err) });
    }
    if (i % 25 === 0) console.log(`wiki ${i}/${stubs.length} (network ${network}, cached ${cached}, failed ${failed.length})`);
  }
}

if (ONLY !== "wiki") {
  const stubs = app.wikisourceStubs(800);
  for (const stub of stubs) {
    try {
      const page = await app.fetchWikisourcePage(stub.wsTitle);
      const original = page.extract;
      const simp = alignedSimplified(original);
      const before = glossCoverage(original);
      const after = glossCoverage(simp);
      record(stub.id, simp);
      const file = crypto.createHash("sha1").update(stub.id).digest("hex").slice(0, 12);
      classicFiles[stub.id] = file;
      classics[stub.id] = [round(before, 4), round(after, 4)];
      fs.writeFileSync(
        path.join(root, "public", "classics", `${file}.json`),
        JSON.stringify({ id: stub.id, title: stub.title, url: page.url, original, simplified: simp }),
      );
    } catch (err) {
      failed.push({ id: stub.id, error: String(err.message || err) });
    }
  }
  console.log(`wikisource ${stubs.length} done (failed so far ${failed.length})`);
}

// Merge with a previous run when only one source was rebuilt.
const outTs = path.join(root, "src", "data", "remote-meta.generated.ts");
const outSets = path.join(root, "public", "meta", "word-sets.json");
if (ONLY && fs.existsSync(outSets)) {
  const prev = JSON.parse(fs.readFileSync(outSets, "utf8"));
  const prevMeta = JSON.parse(fs.readFileSync(outTs, "utf8").match(/\/\*JSON\*\/(.*)\/\*END\*\//s)[1]);
  for (const [id, flat] of Object.entries(prev.texts)) {
    const keep = ONLY === "wiki" ? id.startsWith("ws-") : id.startsWith("wiki-");
    if (!keep || sets[id]) continue;
    const re = [];
    for (let k = 0; k < flat.length; k += 2) {
      const w = prev.vocab[flat[k]];
      if (!vocab.has(w)) vocab.set(w, vocab.size);
      re.push(vocab.get(w), flat[k + 1]);
    }
    sets[id] = re;
    meta[id] = prevMeta.meta[id];
    if (prevMeta.classics[id]) classics[id] = prevMeta.classics[id];
    if (prevMeta.files[id]) classicFiles[id] = prevMeta.files[id];
  }
  for (const f of prevMeta.failed) if (!meta[f.id] && !failed.some((x) => x.id === f.id)) failed.push(f);
}

fs.writeFileSync(outSets, JSON.stringify({ v: 1, vocab: [...vocab.keys()], texts: sets }));
const payload = { meta, classics, files: classicFiles, failed };
fs.writeFileSync(
  outTs,
  `// Generated by scripts/build-remote-meta.mjs — do not edit by hand.
// meta: id → [level, score×100, Han chars, word tokens]
// classics: id → [gloss coverage of the original, gloss coverage in Simplified]
// files: id → public/classics/<file>.json
import type { RemoteMetaFile } from "../lib/remote-meta";

export const REMOTE_META: RemoteMetaFile = /*JSON*/${JSON.stringify(payload)}/*END*/;
`,
);

const kb = (f) => Math.round(fs.statSync(f).size / 1024);
console.log(
  `done in ${Math.round((Date.now() - started) / 1000)}s: scored ${Object.keys(meta).length}, failed ${failed.length}, ` +
    `vocab ${vocab.size}; word-sets ${kb(outSets)} KB, meta ${kb(outTs)} KB; network ${network}, cached ${cached}`,
);
for (const f of failed) console.log("  failed:", f.id, "—", f.error);
