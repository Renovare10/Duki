// Toggle skeleton check against a running local dev server (no external requests).
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const base = process.env.DUKI_URL || "http://127.0.0.1:5173";
const shots = process.env.DUKI_SHOTS || "e2e-artifacts";
mkdirSync(shots, { recursive: true });
const browser = await chromium.launch({
  ...(process.env.DUKI_BROWSER ? { channel: process.env.DUKI_BROWSER } : {}),
  ...(process.env.DUKI_CHROME ? { executablePath: process.env.DUKI_CHROME } : {}),
  headless: true,
});
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const external = [];
const writes = [];
await context.route("**/*", (route) => {
  const req = route.request();
  if (!["GET", "HEAD"].includes(req.method())) writes.push(`${req.method()} ${req.url()}`);
  if (new URL(req.url()).origin === new URL(base).origin) return route.continue();
  external.push(req.url());
  return route.abort();
});
const page = await context.newPage();
page.setDefaultTimeout(15000);
const errors = [];
page.on("pageerror", (err) => errors.push(String(err)));
page.on("console", (msg) => { if (msg.type() === "error" && !/net::ERR_FAILED|Failed to load resource/.test(msg.text())) errors.push(msg.text()); });
try {
  await page.goto(base);
  await page.getByRole("heading", { name: "Read real Chinese at your level." }).waitFor();
  assert.equal(await page.getByRole("button", { name: "Mandarin", exact: true }).getAttribute("aria-pressed"), "true");
  const zhCards = await page.locator(".title-card").count();
  assert.ok(zhCards > 0, "Mandarin shelves render");
  await page.screenshot({ path: `${shots}/mandarin.png` });

  // Mandarin: one built-in story still opens and reads (pinyin + gloss dock).
  // Avoid the first recommended card if it is a Wikipedia stub (e2e blocks remote fetches).
  const zhStory = page.locator(".title-card", { hasText: "我的家" }).locator(".title-hit").first();
  if (await zhStory.count()) await zhStory.click();
  else await page.locator(".title-card", { hasText: "L1" }).locator(".title-hit").first().click();
  await page.locator(".article .word").first().waitFor();
  await page.locator(".article .word").first().click();
  await page.locator(".dock-pinyin").waitFor();
  await page.goto(base);
  await page.getByRole("heading", { name: "Read real Chinese at your level." }).waitFor();

  const zhWikiRow = page.locator('section.shelf[data-row="wiki"]');
  const zhWiki = (await zhWikiRow.count()) ? { title: (await zhWikiRow.locator(".shelf-title-btn").first().innerText()).trim(), count: (await zhWikiRow.locator(".shelf-count").first().innerText()).trim() } : null;
  if (zhWiki) assert.match(zhWiki.title, /Wikipedia · native Chinese/, "Mandarin Wikipedia shelf keeps its heading");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.getByRole("heading", { name: "Read English at your level." }).waitFor();
  const enWikiRow = page.locator('section.shelf[data-row="wiki"]');
  assert.match((await enWikiRow.locator(".shelf-title-btn").first().innerText()).trim(), /Wikipedia · English/, "English Wikipedia shelf heading");
  assert.equal(Number((await enWikiRow.locator(".shelf-count").first().innerText()).trim()), 30, "English Wikipedia shelf has 30 adaptations");
  for (const name of ["Review", "Stats", "Add text"]) {
    assert.ok(await page.getByRole("button", { name, exact: true }).count(), `English header has ${name}`);
  }
  assert.ok(await page.getByLabel("Search the library").count(), "English keeps the search box");
  for (const label of ["Level", "Length", "For me", "Status", "Sort"]) {
    assert.ok(await page.getByLabel(label, { exact: true }).count(), `English keeps the ${label} filter`);
  }
  const enTitles = await page.locator(".title-card-name").allTextContents();
  assert.ok(new Set(enTitles.map((s) => s.trim()).filter(Boolean)).size >= 24, "English home rows render (each row shows up to 24 cards)");
  await page.screenshot({ path: `${shots}/english-story-list.png` });

  await page.reload();
  await page.getByRole("heading", { name: "Read English at your level." }).waitFor();
  assert.equal(await page.getByRole("button", { name: "English", exact: true }).getAttribute("aria-pressed"), "true");

  // Shared search + Level filter, then open a story, tap a word, mark it.
  // Level rows include the Wikipedia adaptations at their level (five each at L4–L9).
  const allTitles = new Set();
  for (const [band, n, label] of [["beginner", 4, "Beginner is L1–2"], ["intermediate", 34, "Intermediate is L5–6"], ["advanced", 34, "Advanced is L7–8"], ["native", 24, "Native is L9–10"], ["elementary", 29, "Elementary is L3–4"]]) {
    await page.getByLabel("Level", { exact: true }).selectOption(band);
    assert.equal(await page.locator(".title-card").count(), n, `${label} (${n} texts)`);
    for (const t of await page.locator(".title-card-name").allTextContents()) allTitles.add(t.trim());
  }
  assert.equal(allTitles.size, 125, "20 starter + 105 section texts across the level filters (unique titles)");
  await page.getByLabel("Level", { exact: true }).selectOption("elementary");
  assert.equal(await page.locator(".title-card").count(), 29, "Elementary is L3–4 (4 starter + 20 section stories + 5 L4 Wikipedia)");
  await page.getByLabel("Search the library").fill("Wrong Train");
  await page.locator(".title-card", { hasText: "The Wrong Train" }).waitFor();
  assert.equal(await page.locator(".title-card").count(), 1);
  await page.locator(".title-card", { hasText: "The Wrong Train" }).locator(".title-hit").click();
  await page.locator(".article[lang='en-US'] .word").first().waitFor();
  assert.equal(await page.locator(".dock-pinyin, .tooltip .py").count(), 0, "no pinyin in English");
  assert.equal(await page.locator(".voice-player, [aria-label*='Play' i]").count(), 0, "no audio in English");
  const word = page.locator(".article .word", { hasText: /^station$/ }).first();
  await word.click();
  const gloss = await page.locator(".dock-en").innerText();
  assert.ok(gloss && gloss !== "—", `gloss shown: ${gloss}`);
  await page.getByRole("button", { name: /Barely/ }).click();
  await page.waitForFunction(() => document.querySelector(".article .word.selected")?.classList.contains("shaky"));
  await page.screenshot({ path: `${shots}/english-story-page.png` });
  const keys = await page.evaluate(() => new Promise((resolve, reject) => {
    const req = indexedDB.open("duki");
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const all = req.result.transaction("words").objectStore("words").getAllKeys();
      all.onsuccess = () => resolve(all.result);
    };
  }));
  assert.ok(keys.includes("en:station"), "English word stored under en: prefix");
  assert.ok(!keys.includes("station"), "no unprefixed English key");
  await page.reload();
  await page.locator(".article .word.shaky", { hasText: /^station$/ }).first().waitFor();

  await page.goto(base);
  await page.getByRole("heading", { name: "Read English at your level." }).waitFor();
  await page.getByLabel("Search the library").fill("Giant Panda");
  await page.locator(".title-card", { hasText: "Giant Panda" }).first().locator(".title-hit").click();
  await page.locator(".article[lang='en-US'] .word").first().waitFor();
  assert.ok((await page.locator(".article .word").count()) > 100, "Wikipedia adaptation opens with its full inline text");
  await page.locator(".article .word", { hasText: /^bamboo$/ }).first().click();
  const wikiGloss = await page.locator(".dock-en").innerText();
  assert.ok(wikiGloss && wikiGloss !== "—", `Wikipedia gloss shown: ${wikiGloss}`);
  await page.goto(base);
  await page.getByRole("heading", { name: "Read English at your level." }).waitFor();

  await page.getByRole("button", { name: "Mandarin", exact: true }).click();
  await page.getByRole("heading", { name: "Read real Chinese at your level." }).waitFor();
  assert.equal(await page.locator(".title-card").count(), zhCards, "Mandarin shelves unchanged");
  if (zhWiki) {
    assert.equal((await zhWikiRow.locator(".shelf-title-btn").first().innerText()).trim(), zhWiki.title, "Mandarin Wikipedia heading unchanged");
    assert.equal((await zhWikiRow.locator(".shelf-count").first().innerText()).trim(), zhWiki.count, "Mandarin Wikipedia count unchanged");
  }

  assert.deepEqual(writes, [], "no non-GET requests (no cloud writes)");
  assert.deepEqual(errors, [], "no console errors");
  console.log(JSON.stringify({ ok: true, zhCards, externalBlocked: external.length }));
} finally {
  await browser.close();
}
