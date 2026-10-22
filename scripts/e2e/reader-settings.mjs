import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

// Isolated headless profile and localhost only. Never opens a user's browser/data.
const base = process.env.DUKI_URL || "http://127.0.0.1:5175";
const shots = "docs/shots";
await mkdir(shots, { recursive: true });
const browser = await chromium.launch({ channel: process.env.DUKI_BROWSER || "msedge", headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, hasTouch: true, isMobile: true, acceptDownloads: true });
await context.route("**/*", (route) => {
  const url = route.request().url();
  return url.startsWith(base) || url.startsWith("data:") || url.startsWith("blob:") ? route.continue() : route.abort();
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));
const report = { viewport: "390x844", cpuThrottle: 4, checks: [] };
const check = (name) => { report.checks.push(name); console.log("PASS", name); };
const fileInput = () => page.locator('input[type="file"][hidden]');
const loadDb = () => page.evaluate(async () => (await import("/src/lib/db.ts")).loadAll());
async function noOverflow() {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(overflow, false, "Horizontal viewport overflow");
}
async function openReader() {
  await page.goto(`${base}/#/read/reader-settings-fixture`);
  await page.reload(); // also refresh React state after direct test-fixture seeding
  await page.locator(".article .word").first().waitFor();
}
try {
  await page.goto(base);
  await page.locator(".title-card").first().waitFor();
  assert.match(await page.getByLabel("Library storage").innerText(), /MB of 1 MB/);
  await page.screenshot({ path: `${shots}/reader-settings-storage.png` });
  await page.evaluate(async () => {
    const db = await import("/src/lib/db.ts");
    await db.putText({ id: "reader-settings-fixture", title: "书店的一天", blurb: "Local test fixture",
      body: "今天我去书店。我喜欢看书，也喜欢喝茶。朋友说，这里很安静。我们坐在窗边，一起读书。\n\n".repeat(40),
      kind: "paste", category: "paste", createdAt: 1, readAt: null, bookmark: null });
    await db.putSettings({ fontFamily: "serif", fontSize: 28, theme: "paper" });
  });
  await openReader();
  assert.equal(await page.getByLabel("Highlight style", { exact: true }).inputValue(), "color-coded");
  await page.locator(".article .word.new").first().click();
  await page.getByRole("button", { name: /Don’t know/ }).click();
  const unknown = page.locator(".article .word.unknown").first();
  const fresh = page.locator(".article .word.new").first();
  const color = (loc) => loc.evaluate((el) => getComputedStyle(el).backgroundColor);
  assert.notEqual(await color(unknown), await color(fresh));
  await page.screenshot({ path: `${shots}/reader-settings-color-coded.png` });
  await page.getByLabel("Highlight style", { exact: true }).selectOption("normal");
  assert.equal(await color(unknown), await color(fresh));
  await page.screenshot({ path: `${shots}/reader-settings-normal.png` });
  check("both highlight modes preserve word status and use the expected colors");

  await page.getByLabel("Reader font size", { exact: true }).fill("96");
  await page.getByLabel("Text width", { exact: true }).selectOption("wide");
  assert.equal(await page.locator(".article").evaluate((el) => getComputedStyle(el).fontSize), "96px");
  await noOverflow();
  await page.screenshot({ path: `${shots}/reader-settings-desktop-large-wide.png` });
  const widths = {};
  for (const width of ["narrow", "medium", "wide", "full"]) {
    await page.getByLabel("Text width", { exact: true }).selectOption(width);
    widths[width] = await page.locator(".reader-page").evaluate((el) => el.getBoundingClientRect().width);
    await noOverflow();
  }
  assert(widths.narrow < widths.medium && widths.medium < widths.wide && widths.wide < widths.full);
  await page.waitForTimeout(150);
  await page.reload();
  await page.locator(".article").waitFor();
  assert.equal(await page.getByLabel("Text width", { exact: true }).inputValue(), "full");
  assert.equal(await page.getByLabel("Highlight style", { exact: true }).inputValue(), "normal");
  assert.equal(await page.getByLabel("Reader font size", { exact: true }).inputValue(), "96");
  check("96 px and four widths fit desktop; settings persist after reload");

  // File-picker filtering is not security: try unsupported files through it explicitly.
  await fileInput().setInputFiles({ name: "picture.png", mimeType: "image/png", buffer: Buffer.from([137, 80, 78, 71]) });
  await page.getByText(/Text only: use a UTF-8/).waitFor();
  await fileInput().setInputFiles({ name: "pretend.txt", mimeType: "text/plain", buffer: Buffer.from("%PDF-1.7") });
  await page.getByText(/Text only: use a UTF-8/).waitFor();
  const before = await loadDb();
  const malicious = { app: "duki", version: 2, words: [], texts: [{ ...before.texts.find((t) => t.kind === "paste"), body: "中文 data:image/png;base64,AAAA" }] };
  await fileInput().setInputFiles({ name: "duki.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(malicious)) });
  await page.getByText(/Text only: use a UTF-8/).waitFor();
  assert.deepEqual((await loadDb()).words, before.words);
  assert.deepEqual((await loadDb()).texts, before.texts);
  check("image, renamed PDF and JSON base64 imports rejected without writes");

  await fileInput().setInputFiles({ name: "一段故事.txt", mimeType: "text/plain", buffer: Buffer.from("今天我在家看书。") });
  await page.getByLabel("Chinese text to read").waitFor();
  assert.equal(await page.getByLabel("Chinese text to read").inputValue(), "今天我在家看书。");
  await page.getByRole("button", { name: "Add to library", exact: true }).click();
  await page.locator(".article").waitFor();
  assert.equal(await page.locator(".article").innerText(), "今天我在家看书。");
  check("UTF-8 .txt import previews and saves as a story");

  // Import preflight must be all-or-nothing including words/settings.
  const atomic = await page.evaluate(async () => {
    const db = await import("/src/lib/db.ts");
    const catalog = (await import("/src/data/catalog.ts")).CATALOG;
    const before = await db.loadAll();
    const texts = Array.from({ length: 3 }, (_, n) => ({ id: `quota-${n}`, title: "配额测试", blurb: "", body: "中".repeat(160_000), kind: "paste", category: "paste", createdAt: n + 1, readAt: null, bookmark: null }));
    let message;
    try {
      await db.importBackup(db.parseBackup({ app: "duki", version: 2, words: [{ hanzi: "配额", status: "known", updatedAt: 1 }], texts,
        settings: { fontFamily: "sans", fontSize: 18, theme: "night" } }), catalog);
    } catch (error) { message = error.message; }
    const after = await db.loadAll();
    return { message, unchanged: JSON.stringify(before) === JSON.stringify(after) };
  });
  assert.match(atomic.message, /Storage limit/);
  assert.equal(atomic.unchanged, true);
  check("over-cap import atomically preserves existing stories, words and settings");

  // Exercise the actual Export download, then import that exact text-only file.
  await page.getByRole("button", { name: "Account (not signed in)", exact: true }).click();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const download = await downloaded;
  assert.match(download.suggestedFilename(), /^duki-\d{4}-\d{2}-\d{2}\.json$/);
  const exportedBytes = await readFile(await download.path());
  const exported = JSON.parse(exportedBytes.toString("utf8"));
  assert.equal(exported.app, "duki");
  assert.equal(exported.version, 2);
  assert(!("events" in exported) && !("tokens" in exported));
  await page.getByLabel("Reader font size", { exact: true }).fill("18");
  await page.waitForFunction(async () => (await (await import("/src/lib/db.ts")).loadSettings()).fontSize === 18);
  await fileInput().setInputFiles({ name: download.suggestedFilename(), mimeType: "application/json", buffer: exportedBytes });
  await page.waitForFunction(async (size) => (await (await import("/src/lib/db.ts")).loadSettings()).fontSize === size, exported.settings.fontSize);
  const restored = await loadDb();
  assert.deepEqual(restored.words, exported.words);
  assert.deepEqual(restored.settings, exported.settings);
  assert(exported.texts.filter((t) => t.kind === "paste").every((t) => restored.texts.some((r) => r.id === t.id && r.body === t.body)));
  check("own text-only JSON round trip preserves words, uploaded stories and settings");

  await page.setViewportSize({ width: 390, height: 844 });
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await openReader();
  for (const width of ["narrow", "medium", "wide", "full"]) {
    await page.getByLabel("Text width", { exact: true }).selectOption(width);
    await noOverflow();
  }
  await page.screenshot({ path: `${shots}/reader-settings-mobile-large.png` });
  await page.getByLabel("Reader font size", { exact: true }).fill("32");
  await page.locator(".article .word").first().click();
  await page.locator(".dock-word").waitFor();
  await page.screenshot({ path: `${shots}/reader-settings-mobile-word-bar.png` });
  check("390x844 mobile fits 96 px at every width and shows word actions");

  // Real touch fling, followed by the normal tap-to-reveal interaction.
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 190, y: 600 }] });
  for (let y = 580; y >= 250; y -= 20) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 190, y }] });
    await page.waitForTimeout(16);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.locator(".dock-hidden").waitFor({ state: "attached" });
  assert.equal(await page.locator(".dock").getAttribute("aria-hidden"), "true");
  await page.screenshot({ path: `${shots}/reader-settings-mobile-dismissed.png` });
  // Let touch momentum stop before tapping; a programmatic click doesn't stop it.
  let lastY = -1;
  for (let n = 0; n < 20; n++) {
    const y = await page.evaluate(() => window.scrollY);
    if (y === lastY) break;
    lastY = y;
    await page.waitForTimeout(100);
  }
  const tap = await page.evaluate(() => {
    const candidates = [...document.querySelectorAll(".article .word")];
    const word = candidates.find((el) => { const r = el.getBoundingClientRect(); return r.top > 450 && r.bottom < 700; });
    if (!word) throw new Error("No visible word for reveal");
    const r = word.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.touchscreen.tap(tap.x, tap.y);
  await page.waitForFunction(() => !document.querySelector(".dock").hasAttribute("aria-hidden"));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${shots}/reader-settings-mobile-revealed.png` });
  check("4x CPU touch fling latches hidden; word tap reveals the sheet");

  report.animation = await page.evaluate(async () => {
    const dock = document.querySelector(".dock");
    const deltas = [];
    let previous = performance.now();
    let mutations = 0;
    const observer = new MutationObserver((entries) => { mutations += entries.length; });
    observer.observe(document.querySelector(".article"), { childList: true, subtree: true, characterData: true });
    await new Promise((resolve) => {
      let n = 0;
      const deadline = setTimeout(resolve, 10000);
      function frame(now) {
        deltas.push(now - previous); previous = now;
        window.scrollBy(0, 3);
        if (++n < 90) requestAnimationFrame(frame); else { clearTimeout(deadline); resolve(); }
      }
      requestAnimationFrame(frame);
    });
    observer.disconnect();
    const samples = deltas.slice(2).sort((a, b) => a - b);
    return { frames: samples.length, medianMs: samples[Math.floor(samples.length / 2)], p95Ms: samples[Math.floor(samples.length * 0.95)], maxMs: Math.max(...samples), articleDomMutations: mutations, transform: getComputedStyle(dock).transform, willChange: getComputedStyle(dock).willChange };
  });
  console.log("Animation samples:", JSON.stringify(report.animation));
  assert.equal(report.animation.frames, 88, "Animation sample collection stalled");
  assert.equal(report.animation.articleDomMutations, 0);
  assert.equal(report.animation.willChange, "transform");
  assert(report.animation.p95Ms < 50, `Scroll frames too slow: ${JSON.stringify(report.animation)}`);
  check("4x CPU scroll-follow frame budget and no article DOM churn");
  assert.deepEqual(errors, []);
  report.desktopWidths = widths;
  await writeFile(`${shots}/reader-settings-verification.json`, JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  await page.screenshot({ path: `${shots}/reader-settings-failure.png` }).catch(() => {});
  console.error("Page:", (await page.locator("body").innerText().catch(() => "")).slice(0, 700));
  console.error("Browser errors:", errors);
  throw error;
} finally {
  await browser.close();
}
