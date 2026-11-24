import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { chromium, type Browser, type Page } from "playwright";
import { createServer, type ViteDevServer } from "vite";

/**
 * Chad, Nov 24 2026: "the visuals on the website need to react instantly". A status tap must be
 * painted before IndexedDB is even written (the write is scheduled after paint), and the juice
 * (pop, flash, haptic) runs, except for motion under prefers-reduced-motion.
 */
describe("Reader status tap: paint first, then save", () => {
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

  async function open(reducedMotion: "reduce" | "no-preference"): Promise<{ page: Page; close: () => Promise<void>; errors: string[] }> {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion });
    await context.route("**/*", (route) =>
      new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    await context.addInitScript(() => {
      const w = window as unknown as { __puts: { t: number; cls: string }[]; __vibrate: number[] };
      w.__puts = [];
      w.__vibrate = [];
      const put = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function (this: IDBObjectStore, ...args: Parameters<IDBObjectStore["put"]>) {
        if (this.name === "words") {
          w.__puts.push({ t: performance.now(), cls: document.querySelector(".article .word.selected")?.className ?? "" });
        }
        return put.apply(this, args);
      };
      Object.defineProperty(navigator, "vibrate", { configurable: true, value: (ms: number) => { w.__vibrate.push(ms); return true; } });
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10_000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(`${base}#/read/sample-home`);
    await page.locator(".article .word").first().waitFor();
    return { page, close: () => context.close(), errors };
  }

  async function tapAndTrace(page: Page, status: string) {
    await page.evaluate((status) => {
      const w = window as unknown as { __painted: number | null; __tapAt: number };
      w.__painted = null;
      const btn = document.querySelector(`.dock .status-btn.${status}`)!;
      btn.addEventListener("pointerdown", (e) => {
        w.__tapAt = e.timeStamp;
        const check = () => {
          if (document.querySelector(".article .word.selected")?.classList.contains(status)) w.__painted = performance.now();
          else requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      }, { once: true, capture: true });
    }, status);
    const before = await page.evaluate(() => (window as unknown as { __puts: unknown[] }).__puts.length);
    await page.locator(`.dock .status-btn.${status}`).tap();
    await page.waitForFunction((n) => (window as unknown as { __puts: unknown[] }).__puts.length > n, before);
    return page.evaluate((n) => {
      const w = window as unknown as { __puts: { t: number; cls: string }[]; __painted: number | null; __tapAt: number };
      return { put: w.__puts[n], painted: w.__painted, tapAt: w.__tapAt };
    }, before);
  }

  it("paints the new status before the IndexedDB write starts, for each button", async () => {
    const { page, close, errors } = await open("no-preference");
    try {
      await page.locator(".article .word").nth(4).tap();
      for (const status of ["unknown", "shaky", "known", "unknown"]) {
        const { put, painted, tapAt } = await tapAndTrace(page, status);
        expect(painted).not.toBeNull();
        // The word already showed the new status when the write was issued, a frame earlier.
        expect(put.cls).toContain(status);
        expect(put.t).toBeGreaterThanOrEqual(painted!);
        expect(painted! - tapAt).toBeLessThan(100);
        await page.waitForTimeout(150);
      }
      // Saved: survives a reload.
      await page.waitForTimeout(300);
      await page.reload();
      await page.locator(".article .word").first().waitFor();
      await page.locator(".article .word").nth(4).tap();
      expect(await page.locator(".dock .status-btn.active").getAttribute("class")).toContain("unknown");
      expect(errors).toEqual([]);
    } finally {
      await close();
    }
  }, 40_000);

  it("pops the button, flashes the word in its new colour and buzzes; no motion when reduced", async () => {
    for (const motion of ["no-preference", "reduce"] as const) {
      const { page, close, errors } = await open(motion);
      try {
        await page.locator(".article .word").nth(4).tap();
        await page.locator(".dock .status-btn.shaky").tap();
        const fx = await page.evaluate(() => {
          const word = document.querySelector(".article .word.selected")!;
          const btn = document.querySelector(".dock .status-btn.shaky")!;
          return {
            wordClass: word.className,
            wordAnim: getComputedStyle(word).animationName,
            btnClass: btn.className,
            btnAnim: getComputedStyle(btn).animationName,
            vibrate: (window as unknown as { __vibrate: number[] }).__vibrate,
          };
        });
        expect(fx.wordClass).toMatch(/flash f[01]/);
        expect(fx.btnClass).toMatch(/pop p[01]/);
        expect(fx.vibrate).toEqual([10]);
        if (motion === "reduce") {
          expect(fx.wordAnim).toBe("none");
          expect(fx.btnAnim).toBe("none");
        } else {
          expect(fx.wordAnim).toMatch(/^word-flash-[01]$/);
          expect(fx.btnAnim).toMatch(/^status-pop-[01]$/);
        }
        expect(errors).toEqual([]);
      } finally {
        await close();
      }
    }
  }, 40_000);
});
