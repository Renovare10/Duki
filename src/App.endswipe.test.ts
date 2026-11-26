import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { chromium, devices, type Browser, type CDPSession, type Page } from "playwright";
import { createServer, type ViteDevServer } from "vite";

/**
 * Chad, Nov 25 2026: at the end of a story, with a word's info card up, scrolling down should
 * smoothly take the card away (there is nothing left to scroll, so before this it stayed put).
 * Real touch input through CDP on an iPhone 13 profile, against the real App.
 */
describe("Reader word card: swipe down at the end of a story dismisses it", () => {
  let server: ViteDevServer;
  let browser: Browser;
  let base: string;

  beforeAll(async () => {
    server = await createServer({
      server: { host: "127.0.0.1", port: 0, strictPort: false, open: false },
      define: { "import.meta.env.VITE_DUKI_CLOUD_SYNC": JSON.stringify("off") },
    });
    await server.listen();
    base = server.resolvedUrls!.local[0];
    browser = await chromium.launch({
      headless: true,
      ...(process.env.DUKI_CHROME ? { executablePath: process.env.DUKI_CHROME }
        : existsSync(chromium.executablePath()) ? {}
        : existsSync("/opt/google/chrome/chrome") ? { channel: "chrome" } : {}),
    });
  }, 60_000);

  afterAll(async () => {
    await browser?.close();
    await server?.close();
  });

  async function open(): Promise<{ page: Page; cdp: CDPSession; close: () => Promise<void>; errors: string[] }> {
    const context = await browser.newContext({ ...devices["iPhone 13"] });
    await context.route("**/*", (route) =>
      new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    const page = await context.newPage();
    page.setDefaultTimeout(10_000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(`${base}#/read/lib-p13-10-poetry`);
    await page.locator(".article .word").first().waitFor();
    await page.waitForTimeout(400);
    return { page, cdp: await context.newCDPSession(page), close: () => context.close(), errors };
  }

  /** A real finger drag: + dy moves the finger up the screen (scrolls content down). */
  async function swipe(cdp: CDPSession, x: number, y: number, dy: number, steps = 10) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    for (let i = 1; i <= steps; i++) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y - (dy * i) / steps }] });
      await new Promise((r) => setTimeout(r, 16));
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  }

  const dockState = (page: Page) => page.evaluate(() => {
    const dock = document.querySelector<HTMLElement>(".dock")!;
    const m = new DOMMatrixReadOnly(getComputedStyle(dock).transform);
    return { hidden: dock.classList.contains("dock-hidden"), offset: Math.round(m.m42), word: document.querySelector(".dock-word")?.textContent ?? null };
  });

  /** Tap a word a finger can actually reach (not under the sticky chrome or the card). */
  async function tapWord(page: Page, pick: "last" | "other") {
    const box = await page.evaluate((pick) => {
      const current = document.querySelector(".article .word.selected");
      const hittable = [...document.querySelectorAll<HTMLElement>(".article .word")].filter((w) => {
        const r = w.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return false;
        return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === w;
      });
      const w = pick === "last" ? hittable.at(-1)! : hittable.filter((x) => x !== current && x.textContent !== current?.textContent).at(-1)!;
      const r = w.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, text: w.textContent };
    }, pick);
    await page.touchscreen.tap(box.x, box.y);
    await page.waitForTimeout(250);
    return box.text;
  }

  /** Record the dock's offset every frame for `ms`. */
  const sample = (page: Page, ms = 900) => page.evaluate((ms) => {
    const w = window as unknown as { __samples: number[] };
    w.__samples = [];
    const dock = document.querySelector<HTMLElement>(".dock")!;
    const t0 = performance.now();
    const tick = () => {
      w.__samples.push(Math.round(new DOMMatrixReadOnly(getComputedStyle(dock).transform).m42));
      if (performance.now() - t0 < ms) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, ms);
  const samples = (page: Page) => page.evaluate(() => (window as unknown as { __samples: number[] }).__samples);

  /** Open a card at scroll position `y`, swipe down, and check it folds all the way, smoothly. */
  async function foldsAt(where: "mid" | "near-bottom" | "bottom") {
    const { page, cdp, close, errors } = await open();
    try {
      await page.evaluate((where) => {
        const max = document.documentElement.scrollHeight - innerHeight;
        window.scrollTo(0, where === "mid" ? Math.round(max / 2) : where === "near-bottom" ? max - 60 : max);
      }, where);
      await page.waitForTimeout(400);
      const opened = await tapWord(page, "last");
      // The opening tap never folds it.
      await page.waitForTimeout(500);
      expect(await dockState(page)).toMatchObject({ hidden: false, offset: 0, word: opened });

      await sample(page);
      await swipe(cdp, 195, 500, 120);
      await page.waitForTimeout(700);
      const seen = await samples(page);
      const done = await dockState(page);
      expect(done.hidden).toBe(true);
      expect(done.offset).toBeGreaterThan(100);
      // Slid (in-between frames seen), only ever moving down: no half-way stop, no jump back.
      expect(seen.some((v) => v > 0 && v < done.offset)).toBe(true);
      for (let i = 1; i < seen.length; i++) expect(seen[i]).toBeGreaterThanOrEqual(seen[i - 1]);
      expect(seen.at(-1)).toBe(done.offset);

      // Another word reopens the card with that word.
      const other = await tapWord(page, "other");
      expect(other).not.toBe(opened);
      expect(await dockState(page)).toMatchObject({ hidden: false, offset: 0, word: other });
      expect(errors).toEqual([]);
    } finally {
      await close();
    }
  }

  it("mid-story: a downward swipe folds the card all the way (200 ms slide)", () => foldsAt("mid"), 40_000);
  it("near the bottom (used to stick half way): folds all the way", () => foldsAt("near-bottom"), 40_000);
  it("at the very bottom (nothing left to scroll): folds all the way", () => foldsAt("bottom"), 40_000);

  it("tiny jitter and upward scrolling leave the card where it is", async () => {
    const { page, cdp, close, errors } = await open();
    try {
      await page.evaluate(() => window.scrollTo(0, 1200));
      await page.waitForTimeout(400);
      await tapWord(page, "last");
      await page.waitForTimeout(400);
      await swipe(cdp, 195, 500, 4, 2);
      await page.waitForTimeout(300);
      expect(await dockState(page)).toMatchObject({ hidden: false, offset: 0 });
      const y0 = await page.evaluate(() => window.scrollY);
      await swipe(cdp, 195, 300, -150);
      await page.waitForTimeout(400);
      expect(await page.evaluate(() => window.scrollY)).toBeLessThan(y0);
      expect(await dockState(page)).toMatchObject({ hidden: false, offset: 0 });
      expect(errors).toEqual([]);
    } finally {
      await close();
    }
  }, 40_000);
});
