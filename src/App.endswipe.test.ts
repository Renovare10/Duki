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

  it("at the end: a downward swipe slides the card away (~200 ms, no flicker); another word still opens", async () => {
    const { page, cdp, close, errors } = await open();
    try {
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(400);
      await tapWord(page, "last");
      const opened = await dockState(page);
      expect(opened).toMatchObject({ hidden: false, offset: 0 });
      expect(opened.word).toBeTruthy();

      // Sample the dock every frame through the swipe and the slide.
      await page.evaluate(() => {
        const w = window as unknown as { __samples: number[] };
        w.__samples = [];
        const dock = document.querySelector<HTMLElement>(".dock")!;
        const t0 = performance.now();
        const tick = () => {
          w.__samples.push(Math.round(new DOMMatrixReadOnly(getComputedStyle(dock).transform).m42));
          if (performance.now() - t0 < 900) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      await swipe(cdp, 195, 500, 160);
      await page.waitForTimeout(700);
      const samples = await page.evaluate(() => (window as unknown as { __samples: number[] }).__samples);
      const done = await dockState(page);
      expect(done.hidden).toBe(true);
      expect(done.offset).toBeGreaterThan(100);
      // Smooth: in-between positions seen, and it only ever moves down (no jump back / flicker).
      expect(samples.some((v) => v > 0 && v < done.offset)).toBe(true);
      for (let i = 1; i < samples.length; i++) expect(samples[i]).toBeGreaterThanOrEqual(samples[i - 1]);

      // Tapping another word brings the card back with that word.
      const other = await tapWord(page, "other");
      expect(other).not.toBe(opened.word);
      expect(await dockState(page)).toMatchObject({ hidden: false, offset: 0, word: other });
      // And opening it doesn't dismiss it by itself.
      await page.waitForTimeout(500);
      expect((await dockState(page)).hidden).toBe(false);
      expect(errors).toEqual([]);
    } finally {
      await close();
    }
  }, 40_000);

  it("mid-story is unchanged: the card rides down 1:1 with the scroll", async () => {
    const { page, cdp, close, errors } = await open();
    try {
      await page.evaluate(() => window.scrollTo(0, 300));
      await page.waitForTimeout(400);
      await tapWord(page, "last");
      expect(await dockState(page)).toMatchObject({ hidden: false, offset: 0 });
      const y0 = await page.evaluate(() => window.scrollY);
      await swipe(cdp, 195, 500, 60, 6);
      await page.waitForTimeout(300);
      const y1 = await page.evaluate(() => window.scrollY);
      const s = await dockState(page);
      expect(y1).toBeGreaterThan(y0);
      expect(s.hidden).toBe(false);
      // Pushed down by the distance scrolled (the existing behaviour), not slid away.
      expect(Math.abs(s.offset - (y1 - y0))).toBeLessThanOrEqual(3);
      expect(errors).toEqual([]);
    } finally {
      await close();
    }
  }, 40_000);
});
