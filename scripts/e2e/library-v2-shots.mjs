#!/usr/bin/env node
/**
 * Screenshots of library v2 in headless Chrome, using a throwaway browser
 * profile with demo progress. It never touches a real store or sync.
 *
 *   node scripts/e2e/library-v2-shots.mjs [origin] [outDir]
 *   (default origin http://127.0.0.1:4174, a local `vite preview`)
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ORIGIN = process.argv[2] || "http://127.0.0.1:4174";
const OUT = process.argv[3] || "screenshots";
fs.mkdirSync(OUT, { recursive: true });

// A learner who knows HSK 1–4 plus the start of HSK 5 (about 1,500 words).
const known = [1, 2, 3, 4].flatMap((n) => JSON.parse(fs.readFileSync(`scripts/hsk-${n}.json`, "utf8")).map((w) => w.hanzi));
known.push(...JSON.parse(fs.readFileSync("scripts/hsk-5.json", "utf8")).slice(0, 320).map((w) => w.hanzi));
const NOW = Date.now();
const MIN = 60000;

async function seed(page) {
  await page.evaluate(
    ({ known, NOW, MIN }) =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open("duki");
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction(["words", "texts"], "readwrite");
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
          const words = tx.objectStore("words");
          known.forEach((hanzi, i) =>
            words.put({ hanzi, status: "known", updatedAt: NOW - i * 1000, dontKnowCount: 0, barelyCount: 0, okayCount: 3, ease: 2.5, intervalDays: 10, repetitions: 3, dueAt: NOW + 5 * 86400000 }),
          );
          const texts = tx.objectStore("texts");
          const row = (id, title, blurb, category, author, extra) => ({
            id, title, blurb, body: "", kind: "sample", category, createdAt: NOW - 3 * 86400000,
            readAt: null, bookmark: null, author, ...extra,
          });
          texts.put(row("w:bible-cuv:MRK.1", "马可福音 1", "圣经（和合本）", "faith", "和合本译者", { readAt: NOW - 50 * MIN, openedAt: NOW - 60 * MIN }));
          texts.put(row("w:bible-cuv:MRK.2", "马可福音 2", "圣经（和合本）", "faith", "和合本译者", { openedAt: NOW - 5 * MIN, bookmark: { tokenIndex: 60, scrollY: 400 } }));
          texts.put(row("w:nahan:06", "一件小事", "吶喊", "literature", "鲁迅", { readAt: NOW - 2 * 86400000, openedAt: NOW - 2 * 86400000 }));
          texts.put(row("w:nahan:09", "故乡", "吶喊", "literature", "鲁迅", { openedAt: NOW - 30 * MIN, bookmark: { tokenIndex: 120, scrollY: 900 } }));
          const g = texts.get("hist-silk");
          g.onsuccess = () => g.result && texts.put({ ...g.result, bookmark: { tokenIndex: 12, scrollY: 180 }, openedAt: NOW - 20 * MIN });
        };
      }),
    { known, NOW, MIN },
  );
}

const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome" });
const errors = [];
for (const [w, h] of [[1280, 900], [390, 844]]) {
  for (const theme of ["light", "dark"]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1 });
    await ctx.addInitScript((t) => {
      localStorage.setItem("duki.theme", JSON.stringify({ device: t, migrated: true, accounts: {} }));
    }, theme === "dark" ? "night" : "paper");
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(`${w}/${theme}: ${e.message}`));
    const shot = async (name, opts = {}) => {
      await page.waitForTimeout(500);
      const file = path.join(OUT, `library-v2-${name}-${w}-${theme}.png`);
      if (opts.el) await (await page.$(opts.el)).screenshot({ path: file });
      else await page.screenshot({ path: file, fullPage: Boolean(opts.full) });
      console.log("wrote", file);
    };
    await page.goto(ORIGIN + "/#/");
    await page.waitForSelector(".home", { timeout: 30000 });
    await seed(page);
    await page.reload();
    await page.waitForSelector('[data-row="continue"]', { timeout: 30000 });
    await page.waitForTimeout(1500);
    await shot("home");
    await page.waitForSelector('[data-row="recommended"]', { timeout: 20000 });
    await page.$eval('[data-row="recommended"]', (el) => el.scrollIntoView({ block: "center" }));
    await shot("recommended", { el: '[data-row="recommended"]' });
    await page.$eval('[data-row="classics"]', (el) => el.scrollIntoView({ block: "center" }));
    await shot("classics", { el: '[data-row="classics"]' });
    await page.$eval('[data-row="wiki"]', (el) => el.scrollIntoView({ block: "center" }));
    await shot("wiki", { el: '[data-row="wiki"]' });
    await page.$eval('[data-row="level-elementary"]', (el) => el.scrollIntoView({ block: "center" }));
    await shot("cards", { el: '[data-row="level-elementary"]' });

    await page.click('.topic-strip .chip:has-text("Nature")');
    await page.selectOption('select[aria-label="Level"]', "elementary");
    await page.selectOption('select[aria-label="Length"]', "short");
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot("filters");

    await page.goto(ORIGIN + "/#/work/bible-cuv");
    await page.waitForSelector(".toc-list", { timeout: 20000 });
    await shot("bible-toc");
    await page.$eval(".toc-section[open]", (el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 90));
    await shot("bible-toc-open");

    await page.goto(ORIGIN + "/#/read/" + encodeURIComponent("w:bible-cuv:MRK.2"));
    await page.waitForSelector(".article .word", { timeout: 20000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot("bible-chapter");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await shot("bible-chapter-end");

    await page.goto(ORIGIN + "/#/work/nahan");
    await page.waitForSelector(".toc-list", { timeout: 20000 });
    await shot("nahan-toc");
    await page.goto(ORIGIN + "/#/read/" + encodeURIComponent("w:nahan:09"));
    await page.waitForSelector(".article .word", { timeout: 20000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot("nahan-chapter");

    await page.goto(ORIGIN + "/#/read/" + encodeURIComponent("ws-道德經"));
    await page.waitForSelector(".article .word", { timeout: 30000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot("classic-simplified");
    await page.click('button:has-text("Traditional")');
    await page.waitForTimeout(400);
    await shot("classic-traditional");

    for (const id of ["lib-p01-01-daily-life", "lib-p03-river-1", "lib-p08-01-history", "lib-p13-01-letters"]) {
      await page.goto(ORIGIN + "/#/read/" + encodeURIComponent(id));
      await page.waitForSelector(".article .word", { timeout: 20000 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await shot(`text-${id}`);
    }
    await ctx.close();
  }
}
await browser.close();
console.log(errors.length ? "page errors:\n" + errors.join("\n") : "no page errors");
