import { chromium } from "playwright";

const base = process.env.DUKI_URL || "http://localhost:5173";

const browser = await chromium.launch({
  channel: process.env.DUKI_BROWSER || "msedge",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (err) => errors.push(String(err)));

await page.goto(base, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.getByRole("heading", { name: "Read Chinese stories at your level." }).waitFor();
if (await page.getByPlaceholder("把中文贴在这里…").count()) {
  throw new Error("Paste box must not be on the home hero.");
}
await page.locator(".chip", { hasText: /^Just right$/ }).waitFor();
await page.locator(".chip", { hasText: /^Science$/ }).waitFor();
await page.locator(".chip", { hasText: /^Wikipedia$/ }).waitFor();
if (await page.locator(".chip", { hasText: /^Gutenberg$/ }).count()) {
  throw new Error("Gutenberg must not appear in the library.");
}
if (await page.locator(".badge", { hasText: /^Unread$/ }).count()) {
  throw new Error("Unread must not be used as a difficulty badge.");
}
await page.locator(".title-card").first().waitFor();
await page.locator(".shelf-title-btn", { hasText: /^Stories/ }).waitFor();
await page.locator(".shelf-title-btn", { hasText: /^Wikipedia/ }).waitFor();
await page.locator(".chip", { hasText: /^Just right$/ }).click();
await page.locator(".shelf-title-btn", { hasText: /^Stories/ }).waitFor();
await page.locator(".shelf-title-btn", { hasText: /^Wikipedia/ }).waitFor();
await page.locator(".chip", { hasText: /^All levels$/ }).click();
await page.screenshot({ path: "e2e-artifacts/library.png", fullPage: true });
await page.locator(".shelf-title-btn", { hasText: /^Wikipedia/ }).click();
if (!page.url().includes("#/shelf/wiki")) {
  throw new Error(`Expected #/shelf/wiki, got ${page.url()}`);
}
await page.getByRole("button", { name: "← Back" }).click();
await page.getByRole("heading", { name: "Read Chinese stories at your level." }).waitFor();

await page.locator(".title-card", { hasText: "我的家" }).locator(".title-hit").first().click();
await page.locator(".article").waitFor();
await page.getByRole("button", { name: "Share" }).click();
await page.getByText("Link copied").waitFor();
await page.locator(".reader-title .word").first().waitFor();
const newColor = await page.locator(".article .word.new").first().evaluate((el) => getComputedStyle(el).color);
{
  const rgb = newColor.match(/\d+/g)?.map(Number) ?? [];
  if (rgb.length < 3 || rgb[2] <= rgb[0]) {
    throw new Error(`New/unseen words should be blue, got ${newColor}`);
  }
}

const likes = page.locator(".word", { hasText: /^喜欢$/ });
if ((await likes.count()) < 2) {
  throw new Error("Expected word token 喜欢 to appear more than once.");
}

const firstLike = likes.first();
await expectClass(firstLike, "new");
await firstLike.hover();
await page.locator(".tooltip .py").waitFor();

await firstLike.click();
const dont = page.getByRole("button", { name: /Don.t know/ });
await dont.click();
await dont.click();
await dont.click();
const counts = await page.locator(".dock-counts").innerText();
if (!/Don.t know 3/.test(counts.replace(/\s+/g, " "))) {
  throw new Error(`Expected Don’t know 3 in dock, got: ${counts}`);
}
await expectClass(firstLike, "unknown");
{
  const red = await firstLike.evaluate((el) => getComputedStyle(el).color);
  const rgb = red.match(/\d+/g)?.map(Number) ?? [];
  if (rgb.length < 3 || rgb[0] <= rgb[2]) {
    throw new Error(`Don’t know should turn red immediately, got ${red}`);
  }
}

const article = page.locator(".article");
const before = await article.evaluate((el) => getComputedStyle(el).fontSize);
await page.getByLabel("Reader font size").fill("36");
const after = await article.evaluate((el) => getComputedStyle(el).fontSize);
if (!(parseFloat(after) > parseFloat(before))) {
  throw new Error(`Font size did not grow: ${before} -> ${after}`);
}

await firstLike.click();
await page.getByRole("button", { name: /Okay/ }).click();
await firstLike.hover();
await page.waitForTimeout(250);
if (await page.locator(".tooltip").count()) {
  throw new Error("Pinyin tooltip should not appear over a known word.");
}

await firstLike.click();
await page.getByRole("button", { name: /Barely/ }).click();
await page.getByRole("button", { name: /I.m done/ }).click();
await page.getByRole("heading", { name: "Read Chinese stories at your level." }).waitFor();
await page.locator(".chip", { hasText: /^All levels$/ }).click();
const homeCard = page.locator(".title-card", { hasText: "我的家" });
await homeCard.getByText("Read", { exact: true }).first().waitFor();

await page.locator(".chip", { hasText: /^Unread$/ }).click();
if (await page.locator(".title-card", { hasText: "我的家" }).count()) {
  throw new Error("Unread filter should hide a finished text.");
}
await page.locator(".chip", { hasText: /^Read$/ }).click();
await page.locator(".title-card", { hasText: "我的家" }).first().waitFor();
await page.getByRole("button", { name: "Mark unread" }).first().click();
await page.locator(".chip", { hasText: /^All$/ }).first().click();

await page.getByRole("button", { name: "Add text" }).click();
await page.getByPlaceholder("把中文贴在这里…").fill("你好吗？我喜欢学习汉语。");
await page.getByPlaceholder("Title (optional)").fill("Paste test");
await page.getByRole("button", { name: "Add to library" }).click();
await page.locator(".article").waitFor();
const hello = page.locator(".word", { hasText: /^你好$/ });
if ((await hello.count()) !== 1) {
  throw new Error("Pasted 你好 should be one word token.");
}
await hello.first().click();
await page.getByRole("button", { name: /Don.t know/ }).click();

await page.getByRole("button", { name: "Review" }).click();
await page.locator(".review-hanzi").waitFor();
await page.locator(".review-card").click();
await page.getByRole("button", { name: "Again" }).waitFor();

await page.getByRole("button", { name: "Stats" }).click();
await page.getByRole("heading", { name: "Stats" }).waitFor();
await page.getByRole("button", { name: /Unknown/ }).first().click();
await page.getByRole("heading", { name: "Unknown words" }).waitFor();
await page.getByRole("button", { name: /你好/ }).first().click();
await page.locator(".review-hanzi").waitFor();
await page.getByRole("button", { name: "Stats" }).click();
await page.getByRole("heading", { name: "Stats" }).waitFor();
await page.getByRole("button", { name: /Finished/ }).click();
await page.getByRole("heading", { name: "Finished" }).waitFor();
await page.getByText("Nothing here yet.").waitFor();
await page.getByRole("button", { name: "← Back" }).click();
await page.getByRole("button", { name: /Not started/ }).click();
await page.getByRole("heading", { name: "Not started" }).waitFor();
await page.locator(".title-card").first().waitFor();
await page.getByRole("button", { name: "← Back" }).click();
await page.getByRole("heading", { name: "Stats" }).waitFor();
await page.getByRole("button", { name: /喜欢|你好/ }).first().waitFor();

await page.locator(".brand").click();
await page.getByRole("heading", { name: "Read Chinese stories at your level." }).waitFor();

await page.locator(".file-btn input").setInputFiles({
  name: "duki.json",
  mimeType: "application/json",
  buffer: Buffer.from(
    JSON.stringify({
      app: "duki",
      version: 1,
      exportedAt: new Date().toISOString(),
      words: [{ hanzi: "我", status: "known", updatedAt: Date.now() }],
      texts: [
        {
          id: "imported-1",
          title: "Imported",
          body: "我爱你。",
          kind: "paste",
          createdAt: Date.now(),
        },
      ],
    }),
  ),
});
await page.locator(".chip", { hasText: /^All levels$/ }).click();
await page.locator(".chip", { hasText: /^Yours$/ }).click();
await page.getByRole("button", { name: /Imported/ }).first().click();
await expectClass(page.locator(".word", { hasText: /^我$/ }).first(), "known");

await page.locator(".brand").click();
await page.locator(".chip", { hasText: /^All levels$/ }).click();
await page.locator(".chip", { hasText: /^Novels$/ }).click();
await page.locator(".title-card", { hasText: "南风镇" }).locator(".title-hit").first().click();
await page.getByRole("heading", { name: "南风镇" }).waitFor();
await page.locator(".title-card", { hasText: "南风镇 · 一" }).locator(".title-hit").first().click();
await page.locator(".article").waitFor();
await page.addStyleTag({ content: ".article { min-height: 2400px; }" });
await page.evaluate(() => window.scrollTo(0, 520));
await page.waitForTimeout(800);
await page.locator(".brand").click();
await page.locator(".chip", { hasText: /^All levels$/ }).click();
await page.locator(".chip", { hasText: /^Novels$/ }).click();
await page.locator(".title-card", { hasText: "南风镇" }).getByText(/In progress/).first().waitFor();
await page.locator(".title-card", { hasText: "南风镇" }).locator(".title-hit").first().click();
await page.getByRole("button", { name: /Continue/ }).click();
await page.locator(".article").waitFor();
await page.waitForTimeout(200);
const y = await page.evaluate(() => window.scrollY);
if (y < 80) throw new Error(`scroll was not restored, got ${y}`);

await page.locator(".brand").click();
await page.locator(".chip", { hasText: /^All levels$/ }).click();
await page.locator(".chip", { hasText: /^Wikipedia$/ }).click();
const wikiCard = page
  .locator(".title-card")
  .filter({ has: page.locator(".title-card-name", { hasText: /^猫$/ }) })
  .first();
await wikiCard.getByRole("button", { name: "Score", exact: true }).click();
await page.getByRole("heading", { name: "Read Chinese stories at your level." }).waitFor();
try {
  await wikiCard
    .locator(".wiki-error")
    .or(wikiCard.getByText("% unknown"))
    .first()
    .waitFor({ timeout: 20000 });
  if (!(await wikiCard.locator(".wiki-error").count())) {
    await wikiCard.getByRole("button", { name: "Read", exact: true }).click();
    await page.locator(".article .word").first().waitFor({ timeout: 20000 });
    await page.getByText(/From Wikipedia, CC BY-SA/).waitFor();
  }
} catch (err) {
  await page.screenshot({ path: "e2e-artifacts/wiki-fail.png", fullPage: true });
  const hash = await page.evaluate(() => window.location.hash);
  const card = await wikiCard.innerText().catch(() => "");
  throw new Error(`wiki flow: ${err.message}\nhash=${hash}\ncard=${card.slice(0, 400)}`);
}

await page.goto(`${base}/#/r/local/sample-home`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.locator(".article").waitFor();
{
  const hash = await page.evaluate(() => window.location.hash);
  if (!hash.includes("/r/local/sample-home")) {
    throw new Error(`share link should stay on #/r/local/sample-home, got ${hash}`);
  }
}

if (errors.length) throw new Error(errors.join("\n"));
await browser.close();
console.log("e2e ok");

async function expectClass(locator, name) {
  const cls = (await locator.getAttribute("class")) || "";
  if (!cls.split(/\s+/).includes(name)) {
    throw new Error(`Expected class ${name}, got "${cls}"`);
  }
}
