import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { createServer, type ViteDevServer } from "vite";
import { EN_BOOK_TEXTS } from "./data/en-books";
import { CATALOG } from "./data/catalog";
import { findWork, workStats, WORKS } from "./data/works";
import { collapseTexts } from "./lib/books";

/** The reading language lives in the account menu (avatar) as a toggle, not an always-visible header control. */
async function switchLanguage(page: Page, to: "English" | "Mandarin") {
  await page.locator("chadm-appbar .cab-avatar").click();
  await page.getByRole("radio", { name: to === "English" ? "English" : "中文" }).click();
  await page.getByRole("heading", { name: to === "English" ? "Read English at your level." : "Read real Chinese at your level." }).waitFor();
}

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
        : existsSync(chromium.executablePath()) ? {}
        // CI (GitHub's ubuntu runner) has Google Chrome but no Playwright browser download.
        : process.platform === "win32" ? { channel: "msedge" } : existsSync("/opt/google/chrome/chrome") ? { channel: "chrome" } : {}),
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

  it("switches language with the account-menu toggle and remembers it after a reload", async () => {
    const { context, page, errors, writes } = await localPage();
    try {
      await page.locator("chadm-appbar .cab-avatar").click();
      const item = page.locator(".lang-toggle-item");
      await item.waitFor();
      expect(await item.getAttribute("data-lang")).toBe("zh");
      await item.getByRole("radio", { name: "English" }).click();
      await page.getByRole("heading", { name: "Read English at your level." }).waitFor();
      await page.reload();
      await page.getByRole("heading", { name: "Read English at your level." }).waitFor();
      await page.locator("chadm-appbar .cab-avatar").click();
      expect(await page.locator(".lang-toggle-item").getAttribute("data-lang")).toBe("en");
      expect(await page.getByRole("radio", { name: "English" }).getAttribute("aria-checked")).toBe("true");
      expect(errors).toEqual([]);
      expect(writes).toEqual([]);
    } finally {
      await context.close();
    }
  }, 30_000);

  it("opens all six English books, reads chapters, persists progress and resumes via Continue", async () => {
    const { context, page, errors, writes } = await localPage();
    try {
      await switchLanguage(page, "English");
      await page.getByRole("heading", { name: "Read English at your level." }).waitFor();
      expect(await page.locator('[data-row="books"] .work-card').count()).toBe(1);
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

  it("opens the English long work on demand, persists chapter progress and resumes via home Continue", async () => {
    const { context, page, errors, writes } = await localPage();
    const requests: string[] = [];
    page.on("request", (request) => {
      if (new URL(request.url()).pathname.startsWith("/works/")) requests.push(new URL(request.url()).pathname);
    });
    try {
      const work = findWork("en-bible-web", "en")!;
      await switchLanguage(page, "English");
      const card = page.locator('[data-row="books"] .work-card', { hasText: work.title });
      await card.waitFor();
      expect(await card.innerText()).toContain(`${workStats(work.id)!.words!.toLocaleString("en-US")} words`);
      expect(await card.locator(".cover-title").getAttribute("lang")).toBe("en");
      expect(await card.innerText()).not.toMatch(/字|characters/);
      expect(requests.filter((url) => /\/[A-Z0-9]+\.\d+\.json$/.test(url))).toEqual([]);
      await card.locator(".title-hit").click();
      await page.getByRole("heading", { name: work.title, exact: true }).waitFor();
      await page.getByRole("button", { name: "Start reading · Genesis 1", exact: true }).waitFor();
      expect(await page.locator(".work-page").innerText()).toContain("Old Testament");
      expect(await page.locator(".work-page").innerText()).toContain("New Testament");
      expect(await page.locator(".work-page").innerText()).not.toMatch(/字|characters/);
      expect(await page.locator(".ch-chip").first().getAttribute("aria-label")).toMatch(/Genesis 1 · L9 · \d+ words/);
      if (process.env.DUKI_TEST_ARTIFACTS) {
        mkdirSync(process.env.DUKI_TEST_ARTIFACTS, { recursive: true });
        await page.screenshot({ path: path.join(process.env.DUKI_TEST_ARTIFACTS, "english-work-contents.png") });
      }
      expect(requests.filter((url) => /\/[A-Z0-9]+\.\d+\.json$/.test(url))).toEqual([]);
      await page.getByRole("button", { name: "Start reading · Genesis 1", exact: true }).click();
      await page.locator('.article[lang="en-US"] .word').first().waitFor();
      expect(await page.locator(".article").innerText()).toContain("In the beginning, God created the heavens and the earth.");
      expect(page.url()).toContain("#/read/w%3Aen-bible-web%3AGEN.1");
      if (process.env.DUKI_TEST_ARTIFACTS) await page.screenshot({ path: path.join(process.env.DUKI_TEST_ARTIFACTS, "english-work-reader.png") });
      await page.getByRole("button", { name: "I’m done", exact: true }).click();
      await page.getByLabel("1 of 1189 chapters read", { exact: true }).waitFor();
      await page.getByRole("button", { name: "Next · Genesis 2", exact: true }).click();
      await page.locator('.article[lang="en-US"] .word').first().waitFor();
      await page.evaluate(() => window.scrollTo(0, 650));
      await page.waitForFunction(() => new Promise<boolean>((resolve) => {
        const request = indexedDB.open("duki");
        request.onsuccess = () => {
          const db = request.result;
          const get = db.transaction("texts").objectStore("texts").get("w:en-bible-web:GEN.2");
          get.onsuccess = () => { resolve(get.result?.lang === "en" && get.result?.body === "" && get.result?.bookmark?.scrollY >= 40); db.close(); };
        };
      }));
      await page.reload();
      await page.locator('.article[lang="en-US"] .word').first().waitFor();
      await page.waitForFunction(() => window.scrollY >= 40);
      await page.goto(`${base}#/work/${work.id}`);
      await page.getByRole("button", { name: "Continue · Genesis 2", exact: true }).waitFor();
      await page.getByRole("button", { name: "← Library", exact: true }).click();
      await page.locator('[data-row="continue"] .work-card', { hasText: work.title }).locator(".title-hit").click();
      await page.locator('.article[lang="en-US"] .word').first().waitFor();
      expect(page.url()).toContain("#/read/w%3Aen-bible-web%3AGEN.2");
      expect(requests.filter((url) => /\/[A-Z0-9]+\.\d+\.json$/.test(url)).every((url) => /\/en-bible-web\/GEN\.[123]\.json$/.test(url))).toBe(true);
      await switchLanguage(page, "Mandarin");
      expect(await page.locator('[data-row="books"] .work-card').count()).toBe(4);
      expect(await page.locator('[data-row="continue"] .work-card').count()).toBe(0);
      await page.goto(`${base}#/work/${work.id}`);
      await page.getByText("That book isn’t in the library.", { exact: true }).waitFor();
      expect(errors).toEqual([]);
      expect(writes).toEqual([]);
    } finally {
      await context.close();
    }
  }, 90_000);

  it("keeps Mandarin books and long works readable and rejects cross-language work routes", async () => {
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

      await switchLanguage(page, "English");
      await page.getByRole("heading", { name: "Read English at your level." }).waitFor();
      expect(await page.locator('[data-row="books"] .work-card').count()).toBe(1);
      await page.goto(`${base}#/book/${book.id}`);
      await page.getByText("That book is gone.", { exact: true }).waitFor();
      await page.goto(`${base}#/work/${work.id}`);
      await page.getByText("That book isn’t in the library.", { exact: true }).waitFor();
      expect(await page.locator(".work-page").count()).toBe(0);
      await page.goto(`${base}#/read/w%3Abible-cuv%3AGEN.1`);
      await page.getByText("That book isn’t in this version of Duki.", { exact: true }).waitFor();
      expect(await page.locator(".article").count()).toBe(0);
      expect(errors).toEqual([]);
      expect(writes).toEqual([]);
    } finally {
      await context.close();
    }
  }, 90_000);
});
