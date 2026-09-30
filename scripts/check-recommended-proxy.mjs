#!/usr/bin/env node
/** Assert proxy lexicon yields Recommended picks in just-right and hard bands. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportPath = path.join(root, "..", "histogram-after.json");
if (!fs.existsSync(reportPath)) {
  spawnSync("node", ["scripts/catalog-unknown-histogram.mjs", "--out", reportPath], {
    cwd: root,
    stdio: "inherit",
  });
}
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const jr = report.texts.filter((t) => t.unknownLoad >= 0.05 && t.unknownLoad <= 0.1);
const hard = report.texts.filter((t) => t.unknownLoad > 0.1 && t.unknownLoad <= 0.2);
console.log(`just-right (5-10%): ${jr.length}`);
console.log(jr.map((t) => `  ${t.unknownPct}% ${t.id}`).join("\n"));
console.log(`hard rec (10-20%): ${hard.length}`);
console.log(hard.slice(0, 12).map((t) => `  ${t.unknownPct}% ${t.id}`).join("\n"));
if (jr.length < 1) throw new Error("No just-right picks under proxy lexicon");
if (hard.length < 1) throw new Error("No hard Recommended picks under proxy lexicon");
console.log("OK: Recommended mid-band picks exist under HSK 1+2+3 proxy.\n");
