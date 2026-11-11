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

  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.getByRole("heading", { name: "Read English at your level." }).waitFor();
  for (const name of ["Review", "Stats", "Add text"]) {
    assert.ok(await page.getByRole("button", { name, exact: true }).count(), `English header has ${name}`);
  }
  assert.ok(await page.getByLabel("Search the library").count(), "English keeps the search box");
  for (const label of ["Level", "Length", "For me", "Status", "Sort"]) {
    assert.ok(await page.getByLabel(label, { exact: true }).count(), `English keeps the ${label} filter`);
  }
  const enTitles = await page.locator(".title-card-name").allTextContents();
  assert.equal(new Set(enTitles.map((s) => s.trim()).filter(Boolean)).size, 20, "two stories per level (unique titles)");
  await page.screenshot({ path: `${shots}/english-story-list.png` });

  await page.reload();
  await page.getByRole("heading", { name: "Read English at your level." }).waitFor();
  assert.equal(await page.getByRole("button", { name: "English", exact: true }).getAttribute("aria-pressed"), "true");

  // Shared search + Level filter, then open a story, tap a word, mark it.
  await page.getByLabel("Level", { exact: true }).selectOption("elementary");
  assert.equal(await page.locator(".title-card").count(), 4, "Elementary is L3–4 (four stories)");
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

  await page.getByRole("button", { name: "Mandarin", exact: true }).click();
  await page.getByRole("heading", { name: "Read real Chinese at your level." }).waitFor();
  assert.equal(await page.locator(".title-card").count(), zhCards, "Mandarin shelves unchanged");

  assert.deepEqual(writes, [], "no non-GET requests (no cloud writes)");
  assert.deepEqual(errors, [], "no console errors");
  console.log(JSON.stringify({ ok: true, zhCards, externalBlocked: external.length }));
} finally {
  await browser.close();
}
