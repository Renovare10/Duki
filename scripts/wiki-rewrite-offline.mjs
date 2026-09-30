#!/usr/bin/env node
/**
 * Offline wiki → owned rewrite pipeline (ROI #5).
 *
 * Batch/offline ONLY. Do NOT wire into frontend or lambdas for generation.
 * Runtime stays $0 LLM: catalog entries are static TypeScript.
 *
 * What this does:
 *  1) Optionally fetch zh.wikipedia intro extracts for topic inspiration (--fetch).
 *  2) Emit a JSON scaffold of topics with Wikipedia CC BY-SA source URLs.
 *  3) Optionally score a drafts JSON against HSK 1–3 unknown-load (--score).
 *
 * What you must still do by hand/agent:
 *  Write ORIGINAL Mandarin shorts (do not paste raw wiki extracts into the catalog).
 *  Merge finished entries into src/data/wiki-rewrites.ts (see existing animals/science batch).
 *  Re-run: node scripts/catalog-unknown-histogram.mjs
 *
 * Usage:
 *   node scripts/wiki-rewrite-offline.mjs
 *   node scripts/wiki-rewrite-offline.mjs --topics 猫,狗,雨 --fetch --out /tmp/wiki-scaffold.json
 *   node scripts/wiki-rewrite-offline.mjs --score /tmp/wiki-drafts.json
 *   node scripts/wiki-rewrite-offline.mjs --list-defaults
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const HAN = /[\u3400-\u9fff\uf900-\ufaff]/;

/** Default animal + science-process topics (zh.wikipedia titles). */
export const DEFAULT_TOPICS = {
  animals: ["猫", "狗", "大熊猫", "鸟", "鱼", "兔", "蜜蜂", "马", "海豚", "企鹅"],
  science: ["雨", "种子", "光", "声音", "月球", "水循环", "云", "地震"],
};

function parseArgs(argv) {
  const out = {
    topics: null,
    fetch: false,
    out: null,
    score: null,
    listDefaults: false,
    hsk: [1, 2, 3],
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--topics") out.topics = String(argv[++i]).split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--fetch") out.fetch = true;
    else if (a === "--out") out.out = argv[++i];
    else if (a === "--score") out.score = argv[++i];
    else if (a === "--list-defaults") out.listDefaults = true;
    else if (a === "--hsk") {
      out.hsk = String(argv[++i])
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => n >= 1 && n <= 6);
    }
  }
  return out;
}

function wikiPageUrl(title) {
  return `https://zh.wikipedia.org/wiki/${encodeURIComponent(title)}`;
}

function wikiApiUrl(title) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    prop: "extracts|info",
    explaintext: "1",
    exintro: "1",
    inprop: "url",
    redirects: "1",
    titles: title,
  });
  return `https://zh.wikipedia.org/w/api.php?${params.toString()}`;
}

async function fetchIntro(title) {
  const res = await fetch(wikiApiUrl(title), {
    headers: { "User-Agent": "DukiOfflineRewrite/1.0 (educational; batch only)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${title}`);
  const raw = await res.json();
  const pages = raw?.query?.pages || {};
  const page = Object.values(pages)[0];
  if (!page || page.missing != null || page.invalid != null) {
    return { title, extract: "", url: wikiPageUrl(title), ok: false };
  }
  return {
    title: page.title || title,
    extract: String(page.extract || "").trim(),
    url: page.fullurl || wikiPageUrl(page.title || title),
    ok: Boolean(String(page.extract || "").trim()),
  };
}

function loadHsk(levels) {
  const known = new Set();
  for (const level of levels) {
    const rows = JSON.parse(fs.readFileSync(path.join(root, "scripts", `hsk-${level}.json`), "utf8"));
    for (const row of rows) {
      const h = String(row.hanzi || "").trim();
      if (h) known.add(h);
    }
  }
  return known;
}

function loadGlossary() {
  const data = JSON.parse(fs.readFileSync(path.join(root, "public", "glossary.json"), "utf8"));
  return { dict: new Set(Object.keys(data.entries || {})), maxLen: data.maxLen || 8 };
}

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

function scoreBody(body, known, hasWord, maxLen) {
  const words = segment(body, hasWord, maxLen).filter((t) => t.isWord);
  let knownCount = 0;
  const uniqueUnknown = new Set();
  for (const t of words) {
    if (known.has(t.text)) knownCount += 1;
    else uniqueUnknown.add(t.text);
  }
  const total = words.length;
  const unknownLoad = total === 0 ? 0 : 1 - knownCount / total;
  return {
    total,
    known: knownCount,
    unknownLoad,
    unknownPct: Math.round(unknownLoad * 1000) / 10,
    uniqueUnknown: [...uniqueUnknown],
    hanChars: (body.match(/[\u3400-\u9fff]/g) || []).length,
  };
}

function scoreDrafts(file, hskLevels) {
  const drafts = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(drafts)) throw new Error("--score file must be a JSON array of {id,title,body}");
  const known = loadHsk(hskLevels);
  const { dict, maxLen } = loadGlossary();
  const hasWord = (w) => dict.has(w);
  console.log(`Scoring ${drafts.length} drafts vs HSK ${hskLevels.join("+")} (${known.size} words)`);
  for (const d of drafts) {
    const s = scoreBody(String(d.body || ""), known, hasWord, maxLen);
    const band =
      s.unknownLoad < 0.05
        ? "easy"
        : s.unknownLoad < 0.2
          ? "mid"
          : s.unknownLoad < 0.26
            ? "upper"
            : "wall";
    console.log(
      `${String(s.unknownPct).padStart(5)}% [${band}] han=${s.hanChars} words=${s.total} unkU=${s.uniqueUnknown.length}  ${d.id || "?"}  ${d.title || ""}`,
    );
    if (s.uniqueUnknown.length) console.log(`         unk: ${s.uniqueUnknown.join("、")}`);
  }
}

async function buildScaffold(topics, doFetch) {
  const rows = [];
  for (const title of topics) {
    const base = {
      wikiTitle: title,
      source: `Duki original · topic from Wikipedia「${title}」CC BY-SA`,
      sourceUrl: wikiPageUrl(title),
      note: "Write ORIGINAL Mandarin (~80–220 Han). Do not paste wiki extract into catalog.",
      suggestedId: `wr-${title}`,
      blurb: "",
      body: "",
      category: "science",
      wikiIntro: null,
    };
    if (doFetch) {
      try {
        const page = await fetchIntro(title);
        base.wikiIntro = page.ok ? page.extract.slice(0, 1200) : "";
        base.sourceUrl = page.url;
        base.wikiTitle = page.title;
        base.fetchOk = page.ok;
      } catch (err) {
        base.fetchOk = false;
        base.fetchError = String(err?.message || err);
      }
    }
    rows.push(base);
  }
  return rows;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.listDefaults) {
    console.log(JSON.stringify(DEFAULT_TOPICS, null, 2));
    return;
  }
  if (args.score) {
    scoreDrafts(args.score, args.hsk);
    return;
  }

  const topics =
    args.topics ||
    [...DEFAULT_TOPICS.animals, ...DEFAULT_TOPICS.science];

  console.log(`Topics: ${topics.length}${args.fetch ? " (fetching Wikipedia intros…)" : ""}`);
  const scaffold = await buildScaffold(topics, args.fetch);
  const payload = {
    generatedAt: new Date().toISOString(),
    policy: {
      runtimeLlm: false,
      offlineOnly: true,
      rights: "Original Mandarin owned by Duki; cite Wikipedia CC BY-SA topic URL in source/sourceUrl",
      catalogFile: "src/data/wiki-rewrites.ts",
      histogram: "node scripts/catalog-unknown-histogram.mjs",
    },
    topics: scaffold,
  };

  const outPath = args.out || path.join(root, "scripts", "wiki-rewrite-scaffold.json");
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(`Wrote scaffold ${outPath}`);
  console.log("Next: author original Mandarin into body fields, then merge into src/data/wiki-rewrites.ts");
  console.log("Score drafts: node scripts/wiki-rewrite-offline.mjs --score drafts.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
