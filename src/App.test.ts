import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { createServer, type ViteDevServer } from "vite";
import { EN_BOOK_TEXTS } from "./data/en-books";
import { CATALOG } from "./data/catalog";
import { WORKS } from "./data/works";
import { collapseTexts } from "./lib/books";

// Exercise the real App render gate and IndexedDB persistence, not a copy of its condition.
// Every test uses a fresh browser context; all network traffic is restricted to local Vite.
describe("App book navigation", () => {
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
        : process.platform === "win32" && !existsSync(chromium.executablePath()) ? { channel: "msedge" } : {}),
    });
  }, 60_000);

  afterAll(async () => {
    await browser?.close();
    await server?.close();
  });

  async function localPage(): Promise<{ context: BrowserContext; page: Page; errors: string[]; writes: string[] }> {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const writes: string[] = [];
    await context.route("**/*", (route) => {
      const request = route.request();
      if (!["GET", "HEAD"].includes(request.method())) writes.push(`${request.method()} ${request.url()}`);
      return new URL(request.url()).origin === new URL(base).origin ? route.continue() : route.abort();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.goto(base);
    await page.getByRole("heading", { name: "Read real Chinese at your level." }).waitFor();
    return { context, page, errors, writes };
  }

  it("opens all six English books, reads chapters, persists progress and resumes via Continue", async () => {
    const { context, page, errors, writes } = await localPage();
    try {
      await page.getByRole("button", { name: "English", exact: true }).click();
      await page.getByRole("heading", { name: "Read English at your level." }).waitFor();
      expect(await page.locator(".work-card").count()).toBe(0);
      const books = collapseTexts(EN_BOOK_TEXTS).filter((item) => item.type === "book");
      expect(books).toHaveLength(6);
      for (const { book } of books) {
        await page.locator('[data-row="books"] .title-card', { hasText: book.title }).locator(".title-hit").click();
        await page.getByRole("heading", { name: book.title, exact: true }).waitFor();
        expect(await page.locator(".shelf-grid .title-card").count()).toBe(book.chapters.length);
        await page.getByRole("button", { name: "← Back", exact: true }).click();
      }

      const book = books[0].book;
      const [first, second] = book.chapters;
      await page.locator('[data-row="books"] .title-card', { hasText: book.title }).locator(".title-hit").click();
      await page.locator(".title-card", { hasText: first.title }).locator(".title-hit").click();
      await page.locator('.article[lang="en-US"] .word').first().waitFor();
      expect(page.url()).toContain(`#/read/${first.id}`);
      await page.getByRole("button", { name: "I’m done", exact: true }).click();
      await page.getByRole("heading", { name: book.title, exact: true }).waitFor();
      expect(await page.locator(".home-hero-copy").innerText()).toContain("In progress");
      await page.getByRole("button", { name: `Continue · ${second.title}`, exact: true }).click();
      await page.locator('.article[lang="en-US"] .word').first().waitFor();
      expect(page.url()).toContain(`#/read/${second.id}`);
      await page.evaluate(() => window.scrollTo(0, 650));
      await page.waitForFunction(() => window.scrollY >= 40);
      // Wait for the real throttled bookmark write, then verify it survives a reload.
      await page.waitForFunction((id) => new Promise<boolean>((resolve) => {
        const request = indexedDB.open("duki");
        request.onsuccess = () => {
          const db = request.result;
          const get = db.transaction("texts").objectStore("texts").get(id);
          get.onsuccess = () => { resolve(get.result?.bookmark?.scrollY >= 40); db.close(); };
        };
      }), second.id);
      await page.reload();
      await page.locator('.article[lang="en-US"] .word').first().waitFor();
      await page.waitForFunction(() => window.scrollY >= 40);
      await page.goto(base);
      await page.locator('[data-row="continue"] .title-card', { hasText: book.title }).locator(".title-hit").click();
      await page.getByRole("heading", { name: book.title, exact: true }).waitFor();
      await page.getByRole("button", { name: `Continue · ${second.title}`, exact: true }).click();
      await page.locator('.article[lang="en-US"] .word').first().waitFor();
      expect(page.url()).toContain(`#/read/${second.id}`);
      expect(errors).toEqual([]);
      expect(writes).toEqual([]);
    } finally {
      await context.close();
    }
  }, 90_000);

  it("keeps Mandarin books and long works readable, with English works still disabled", async () => {
    const { context, page, errors, writes } = await localPage();
    try {
      const item = collapseTexts(CATALOG).find((item) => item.type === "book" && item.book.id === "south-wind");
      if (!item || item.type !== "book") throw new Error("Mandarin series fixture missing");
      const book = item.book;
      await page.locator('[data-row="books"] .title-card', { hasText: book.title }).locator(".title-hit").click();
      await page.getByRole("heading", { name: book.title, exact: true }).waitFor();
      await page.getByRole("button", { name: /^Continue ·/ }).click();
      await page.locator('.article[lang="zh-CN"] .word').first().waitFor();
      await page.getByRole("button", { name: "I’m done", exact: true }).click();
      await page.getByRole("heading", { name: book.title, exact: true }).waitFor();
      expect(await page.locator(".home-hero-copy").innerText()).toContain("In progress");

      const work = WORKS[0];
      await page.goto(`${base}#/work/${work.id}`);
      await page.getByRole("heading", { name: work.title, exact: true }).waitFor();
      await page.getByRole("button", { name: /^Start reading ·/ }).click();
      await page.locator('.article[lang="zh-CN"] .word').first().waitFor();
      expect(page.url()).toContain("#/read/w%3A");
      await page.getByRole("button", { name: "I’m done", exact: true }).click();
      await page.getByRole("heading", { name: work.title, exact: true }).waitFor();
      await page.getByLabel(/^1 of \d+ chapters read$/).waitFor();

      await page.getByRole("button", { name: "English", exact: true }).click();
      await page.getByRole("heading", { name: "Read English at your level." }).waitFor();
      expect(await page.locator(".work-card").count()).toBe(0);
      await page.goto(`${base}#/book/${book.id}`);
      await page.getByText("That book is gone.", { exact: true }).waitFor();
      await page.goto(`${base}#/work/${work.id}`);
      await page.waitForFunction(() => document.querySelector(".top-actions") && !document.querySelector(".splash"));
      expect(await page.locator(".work-page").count()).toBe(0);
      expect(errors).toEqual([]);
      expect(writes).toEqual([]);
    } finally {
      await context.close();
    }
  }, 90_000);
});
