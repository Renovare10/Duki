#!/usr/bin/env node
/**
 * Turn draft JSON (default /tmp/duki-drafts/p*.json) into src/data/library packs
 * and rewrite the manifest.
 *
 *   node scripts/emit-packs.mjs [/tmp/duki-drafts]
 */
import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2] || "/tmp/duki-drafts";
const outDir = path.resolve("src/data/library");
const files = fs.readdirSync(dir).filter((name) => /^p\d+\.json$/.test(name)).sort();
if (!files.length) {
  console.error("no pack json in", dir);
  process.exit(1);
}

const packs = [];
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  const id = data.packId || path.basename(file, ".json");
  const texts = [];
  for (const entry of data.texts || []) {
    if (!entry.body?.trim()) throw new Error(`${entry.id || file}: empty body`);
    if (!entry.title?.trim()) throw new Error(`${entry.id}: empty title`);
    if (!entry.blurb?.trim()) throw new Error(`${entry.id}: empty blurb`);
    if (entry.blurb.length > 90) throw new Error(`${entry.id}: blurb is ${entry.blurb.length} chars`);
    texts.push({
      id: entry.id,
      title: entry.title.trim(),
      blurb: entry.blurb.trim(),
      topics: entry.topics,
      level: entry.level,
      body: entry.body.trim(),
      aiGenerated: true,
      category: entry.category || "story",
      license: "Original (Duki)",
      ...(entry.series ? { series: entry.series } : {}),
    });
  }
  packs.push({ id, texts });
}

function tsString(value) {
  return JSON.stringify(value);
}

for (const pack of packs) {
  const body = pack.texts
    .map((entry) => {
      const fields = [
        `      id: ${tsString(entry.id)},`,
        `      title: ${tsString(entry.title)},`,
        `      blurb: ${tsString(entry.blurb)},`,
        `      topics: ${tsString(entry.topics)},`,
        `      level: ${entry.level},`,
        `      body: ${tsString(entry.body)},`,
        `      aiGenerated: true,`,
        `      category: ${tsString(entry.category)},`,
        `      license: ${tsString(entry.license)},`,
      ];
      if (entry.series) {
        fields.push(
          `      series: { id: ${tsString(entry.series.id)}, title: ${tsString(entry.series.title)}, part: ${entry.series.part} },`,
        );
      }
      return `    {\n${fields.join("\n")}\n    }`;
    })
    .join(",\n");
  const source = `import type { LibraryPack } from "../../lib/library-entry";\n\nconst pack: LibraryPack = {\n  id: ${tsString(pack.id)},\n  texts: [\n${body},\n  ],\n};\n\nexport default pack;\n`;
  fs.writeFileSync(path.join(outDir, `${pack.id}.ts`), source);
  console.log("wrote", pack.id, pack.texts.length);
}

const imports = packs.map((pack) => `import ${pack.id} from "./${pack.id}";`).join("\n");
const list = packs.map((pack) => pack.id).join(", ");
const index = `/**
 * Manifest of library packs (see README.md in this folder).
 * Add one import per pack file and list it in PACKS. Nothing else goes here.
 */
import type { LibraryPack } from "../../lib/library-entry";
${imports}

export const PACKS: LibraryPack[] = [${list}];

/** Topic tags for pack texts, keyed by text id. First topic is the main one. */
export const LIBRARY_TOPICS: Record<string, string[]> = Object.fromEntries(
  PACKS.flatMap((pack) => pack.texts.map((entry) => [entry.id, entry.topics])),
);
`;
fs.writeFileSync(path.join(outDir, "index.ts"), index);
console.log("manifest", packs.reduce((n, pack) => n + pack.texts.length, 0), "texts");
