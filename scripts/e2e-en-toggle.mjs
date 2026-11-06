import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.env.DUKI_URL || "http://127.0.0.1:5186";
const browser = await chromium.launch({ channel: process.env.DUKI_BROWSER || "msedge", headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
// Never contact accounts, APIs, wiki or other external services during this local test.
await context.route("**/*", (route) => new URL(route.request().url()).origin === new URL(base).origin
  ? route.continue() : route.abort());
const page = await context.newPage();
page.setDefaultTimeout(10000);
const errors = [];
page.on("pageerror", (err) => errors.push(String(err)));
try {
  await page.goto(base);
  await page.getByRole("heading", { name: "Read real Chinese at your level." }).waitFor();
  assert.equal(await page.locator("chadm-appbar").count(), 0, "Private draft must not offer account or app-tray actions");
  const chineseCard = page.locator(".title-hit").first();
  const chineseTitle = await chineseCard.locator(".title-card-name").innerText();
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.getByText("Draft · local only", { exact: true }).waitFor();
  await page.getByRole("heading", { name: "English samples" }).waitFor();
  assert.equal(await page.locator(".title-card").count(), 3);
  await page.screenshot({ path: "e2e-artifacts/en-shelves-desktop.png", fullPage: true });
  assert.equal(await page.locator(".work-card").count(), 0);
  assert.equal(await page.getByText(chineseTitle, { exact: true }).count(), 0);
  await page.reload();
  await page.getByRole("heading", { name: "English samples" }).waitFor();
  assert.equal(await page.getByRole("button", { name: "English", exact: true }).getAttribute("aria-pressed"), "true");
  await page.locator(".title-hit").first().click();
  await page.locator(".article[lang='en-US'] .word").first().waitFor();
  assert.equal(await page.locator(".article").innerText(), "A cat is at the door. I open the door. The cat runs in. It sits on my red bag. Now the bag is warm.");
  assert.equal(await page.locator(".dock-pinyin, .tooltip .py").count(), 0);
  const cat = page.locator(".article .word", { hasText: /^cat$/ }).first();
  await cat.click();
  assert.equal(await page.locator(".dock-en").innerText(), "猫");
  for (const [label, status] of [[/Don.t know/, "unknown"], [/Barely/, "shaky"], [/Okay/, "known"]]) {
    await page.getByRole("button", { name: label }).click();
    await page.waitForFunction((status) => document.querySelector(".article .word.selected")?.classList.contains(status), status);
  }
  await page.reload();
  await page.locator(".article .word.known", { hasText: /^cat$/ }).first().waitFor();
  await page.locator(".reader-title .word.known", { hasText: /^Cat$/ }).waitFor();
  await cat.click();
  await page.keyboard.press("2");
  await page.locator(".reader-title .word.shaky", { hasText: /^Cat$/ }).waitFor();
  await page.keyboard.press("3");
  await page.locator(".article .word", { hasText: /^bag$/ }).first().click();
  await page.getByRole("button", { name: /Don.t know/ }).click();
  await page.screenshot({ path: "e2e-artifacts/en-reader-desktop.png", fullPage: true });
  assert.equal(await page.locator(".dock-pinyin, .tooltip .py").count(), 0);
  await page.getByRole("button", { name: /I.m done/ }).click();
  await page.getByRole("heading", { name: "English samples" }).waitFor();
  await page.reload();
  await page.locator(".title-card", { hasText: "The Cat" }).getByRole("button", { name: "Mark unread" }).waitFor();
  await page.getByRole("button", { name: "Mandarin", exact: true }).click();
  await page.getByRole("heading", { name: "Read real Chinese at your level." }).waitFor();
  await page.goto(`${base}/#/review`);
  await page.getByText("Nothing due right now.", { exact: true }).waitFor();
  await page.goto(`${base}/#/read/sample-home`);
  await page.locator(".article[lang='zh-CN'] .word").first().click();
  await page.locator(".dock-pinyin").waitFor();
  assert.equal(await page.getByText("Draft · local only", { exact: true }).count(), 0);
  await page.getByRole("button", { name: /I.m done/ }).click();
  await page.getByRole("heading", { name: "Read real Chinese at your level." }).waitFor();
  assert.deepEqual(errors, []);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.getByRole("heading", { name: "English samples" }).waitFor();
  assert.equal(await page.getByRole("button", { name: "Menu", exact: true }).count(), 0, "English draft has no empty menu");
  for (const name of ["Mandarin", "English"]) {
    const box = await page.getByRole("button", { name, exact: true }).boundingBox();
    assert.ok(box && box.x >= 0 && box.x + box.width <= 390 && box.y >= 0 && box.y + box.height <= 844);
  }
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Mobile shell must not overflow");
  await page.screenshot({ path: "e2e-artifacts/en-shelves-mobile.png", fullPage: true });
  await page.locator(".title-hit").first().click();
  await page.locator(".article .word").first().click();
  await page.screenshot({ path: "e2e-artifacts/en-reader-mobile.png", fullPage: true });
  assert.equal(await page.locator(".dock-pinyin, .tooltip .py").count(), 0);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.locator(".article .word").last().click();
  const lastWord = await page.locator(".article .word").last().boundingBox();
  const dock = await page.locator(".dock").boundingBox();
  assert.ok(lastWord && dock && lastWord.y + lastWord.height <= dock.y, "The final English line must scroll clear of the word dock");
  console.log("PASS: Mandarin default → English shelves → persisted toggle → reader grading/reload without pinyin → Mandarin reader/pinyin/done; mobile layout and final-line clearance.");
} catch (err) {
  console.error("Page state:", await page.locator("body").innerText());
  await page.screenshot({ path: "e2e-artifacts/en-toggle-failure.png", fullPage: true });
  throw err;
} finally {
  await context.close();
  await browser.close();
}
