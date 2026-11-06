import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.DUKI_URL || "http://127.0.0.1:5186";
const browser = await chromium.launch({ channel: process.env.DUKI_BROWSER || "msedge", headless: true });
const report = { fixtures: [], native: null };
async function isolated() {
  const context = await browser.newContext();
  await context.route("**/*", (route) => new URL(route.request().url()).origin === new URL(base).origin
    ? route.continue() : route.abort());
  return context;
}
try {
  for (const mode of ["ready", "none", "late", "hidden"]) {
    const context = await isolated();
    await context.addInitScript((mode) => {
      localStorage.setItem("duki.language", "en");
      window.__spoken = [];
      window.__cancels = 0;
      const events = new EventTarget();
      window.__voices = mode === "ready"
        ? [{ lang: "en-GB" }, { lang: "zh-CN" }, { lang: "en-US" }]
        : mode === "none" ? [{ lang: "zh-CN" }] : [];
      window.SpeechSynthesisUtterance = class extends EventTarget {
        constructor(text) { super(); this.text = text; }
      };
      Object.defineProperty(window, "speechSynthesis", { configurable: true, value: mode === "hidden" ? undefined : {
        getVoices: () => window.__voices,
        addEventListener: events.addEventListener.bind(events),
        removeEventListener: events.removeEventListener.bind(events),
        speak: (u) => window.__spoken.push({ text: u.text, lang: u.lang, voice: u.voice.lang, rate: u.rate }),
        cancel: () => window.__cancels++,
      } });
      window.__voicesChanged = () => events.dispatchEvent(new Event("voiceschanged"));
    }, mode);
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    await page.goto(`${base}/#/read/en-draft-cat`);
    await page.locator(".article .word").first().waitFor();
    if (mode === "hidden") {
      assert.equal(await page.locator(".voice-player, .voice-note").count(), 0);
    } else if (mode === "none") {
      await page.getByText("No English voice on this device.", { exact: true }).waitFor();
      assert.equal(await page.getByRole("button", { name: "Play", exact: true }).count(), 0);
    } else {
      if (mode === "late") {
        await page.getByRole("button", { name: "Play", exact: true }).click();
        await page.getByText("No English voice on this device.", { exact: true }).waitFor();
        await page.evaluate(() => { window.__voices = [{ lang: "en-US" }, { lang: "zh-CN" }]; window.__voicesChanged(); });
      }
      await page.getByRole("button", { name: "Play", exact: true }).click();
      const spoken = await page.evaluate(() => window.__spoken);
      assert.deepEqual(spoken[0], { text: "A cat is at the door.", lang: "en-US", voice: "en-US", rate: 0.85 });
      await page.locator(".article .speaking").first().waitFor();
      await page.getByRole("button", { name: "Pause", exact: true }).click();
      await page.getByRole("button", { name: "Ahead", exact: true }).click();
      assert.equal(await page.locator(".voice-place").innerText(), "2 / 5");
      await page.getByRole("button", { name: "Back", exact: true }).click();
      assert.equal(await page.locator(".voice-place").innerText(), "1 / 5");
      const before = await page.evaluate(() => window.__cancels);
      await page.getByRole("button", { name: "Play", exact: true }).click();
      await page.getByRole("button", { name: "Mandarin", exact: true }).click();
      await page.getByRole("heading", { name: "Read real Chinese at your level." }).waitFor();
      assert.ok(await page.evaluate((before) => window.__cancels > before, before));
      await page.goto(`${base}/#/read/sample-home`);
      await page.locator(".article").waitFor();
      await page.getByRole("button", { name: "Play", exact: true }).click();
      assert.equal(await page.evaluate(() => window.__spoken.at(-1).lang), "zh-CN");
    }
    report.fixtures.push({ mode, passed: true, note: "Controlled browser API fixture, not native audio" });
    await context.close();
  }

  // Separate native-engine probe. Do not invent voices or call fixtures real speech.
  const context = await isolated();
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem("duki.language", "en");
    window.__nativeSpeech = [];
    if (!window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    const original = synth.speak.bind(synth);
    synth.speak = (u) => {
      const entry = { text: u.text, lang: u.lang, voice: u.voice?.name, started: false, ended: false, error: null };
      window.__nativeSpeech.push(entry);
      u.addEventListener("start", () => { entry.started = true; });
      u.addEventListener("end", () => { entry.ended = true; });
      u.addEventListener("error", (e) => { entry.error = e.error; });
      window.__nativeUtterance = u;
      original(u);
    };
  });
  await page.goto(`${base}/#/read/en-draft-cat`);
  await page.locator(".article").waitFor();
  await page.waitForFunction(() => window.speechSynthesis?.getVoices().length > 0, undefined, { timeout: 5000 }).catch(() => {});
  const voices = await page.evaluate(() => window.speechSynthesis?.getVoices().map((v) => ({ name: v.name, lang: v.lang, localService: v.localService })) ?? []);
  const hasEnglish = voices.some((v) => /^en(?:-|$)/i.test(v.lang));
  if (hasEnglish) {
    await page.getByRole("button", { name: "Play", exact: true }).click();
    await page.waitForFunction(() => window.__nativeSpeech[0]?.ended || window.__nativeSpeech[0]?.error, undefined, { timeout: 15000 }).catch(() => {});
    const utterances = await page.evaluate(() => window.__nativeSpeech);
    assert.equal(utterances[0]?.lang, "en-US");
    assert.ok(utterances[0]?.started && utterances[0]?.ended, `Installed English voice did not complete its first sentence: ${JSON.stringify(utterances)}`);
    report.native = { voices, utterances, result: "Native browser reported English sentence start and completion; no human listening assertion" };
  } else {
    const play = page.getByRole("button", { name: "Play", exact: true });
    if (await play.count()) await play.click();
    await page.getByText("No English voice on this device.", { exact: true }).waitFor();
    report.native = { voices, result: "No installed English voice exposed by this headless browser; fallback note verified, native English audio not verified" };
  }
  await context.close();
  await mkdir("e2e-artifacts", { recursive: true });
  await writeFile("e2e-artifacts/en-speech-report.json", JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
