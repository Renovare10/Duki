import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { chromium, type Browser, type BrowserContext, type Page, type Route } from "playwright";
import { createServer, type ViteDevServer } from "vite";
import { CATALOG } from "./data/catalog";
import { AUTH_TOKENS_KEY, SCHEMA_KEY, STORAGE_SCHEMA } from "./lib/auth";

/**
 * Word-status jump (Chad, Nov 24 2026): a status tap made while a cloud sync is in flight must
 * show at once, stay put, and be the value that ends up on the server. Exercises the real App,
 * the real IndexedDB code and the real sync path, against a fake same-origin account API.
 */

const API = "/fake-api";
const GET_DELAY_MS = 1500;

function jwt(claims: Record<string, unknown>): string {
  return `eyJhbGciOiJub25lIn0.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.sig`;
}

const sample = CATALOG.find((t) => (t.lang ?? "zh") === "zh" && t.body.trim().length > 40)!;

type Server = {
  words: Map<string, { hanzi: string; status: string; updatedAt: number }>;
  gets: number;
  puts: number;
  putFails: boolean;
  getStarted: (() => void)[];
};

describe("Reader word status vs. cloud sync", () => {
  let server: ViteDevServer;
  let browser: Browser;
  let base: string;

  beforeAll(async () => {
    server = await createServer({
      server: { host: "127.0.0.1", port: 0, strictPort: false, open: false },
      define: { "import.meta.env.VITE_DUKI_API": JSON.stringify(API) },
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

  async function signedInReader(): Promise<{ context: BrowserContext; page: Page; srv: Server; errors: string[] }> {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const srv: Server = { words: new Map(), gets: 0, puts: 0, putFails: false, getStarted: [] };
    const idToken = jwt({ sub: "test-sub", email: "test@example.com", email_verified: true, exp: Math.floor(Date.now() / 1000) + 3600, auth_time: Math.floor(Date.now() / 1000) });
    await context.addInitScript(([key, schemaKey, schema, tokens]) => {
      if (!window.sessionStorage.getItem("seeded")) {
        window.localStorage.setItem(schemaKey, String(schema));
        window.localStorage.setItem(key, tokens);
        window.sessionStorage.setItem("seeded", "1");
      }
    }, [AUTH_TOKENS_KEY, SCHEMA_KEY, STORAGE_SCHEMA, JSON.stringify({ accessToken: "A", idToken, email: "test@example.com", signedInAt: Date.now() })] as const);
    await context.route("**/*", async (route: Route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== new URL(base).origin) return route.abort();
      if (!url.pathname.startsWith(`${API}/`)) return route.continue();
      if (url.pathname === `${API}/me` && request.method() === "GET") {
        srv.gets += 1;
        // Snapshot what the server holds when the GET arrives (like a real read), then answer late.
        const words = [...srv.words.values()];
        srv.getStarted.splice(0).forEach((fn) => fn());
        await new Promise((r) => setTimeout(r, GET_DELAY_MS));
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ v: 1, updatedAt: 1, words, texts: [], sessions: [], settings: null }),
        }).catch(() => {});
      }
      if (url.pathname === `${API}/me` && request.method() === "PUT") {
        srv.puts += 1;
        if (srv.putFails) return route.fulfill({ status: 500, body: "{}" });
        const body = JSON.parse(request.postData() || "{}") as { words?: { hanzi: string; status: string; updatedAt: number }[] };
        srv.words = new Map((body.words ?? []).map((w) => [w.hanzi, w]));
        return route.fulfill({ status: 204, body: "" });
      }
      return route.fulfill({ status: 404, body: "{}" });
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.goto(`${base}#/read/${encodeURIComponent(sample.id)}`);
    await page.locator(".article .word").first().waitFor();
    // Let the startup sync (GET + PUT) finish so the test starts from a quiet state.
    await expect.poll(() => srv.puts, { timeout: 10_000 }).toBeGreaterThanOrEqual(1);
    return { context, page, srv, errors };
  }

  function nextGet(srv: Server): Promise<void> {
    return new Promise((resolve) => srv.getStarted.push(resolve));
  }

  async function activeStatus(page: Page): Promise<string | null> {
    return page.evaluate(() => {
      const btn = document.querySelector(".dock .status-btn.active");
      if (!btn) return null;
      return ["unknown", "shaky", "known"].find((s) => btn.classList.contains(s)) ?? null;
    });
  }

  it("rapid taps while a sync GET is in flight show at once, never jump back, and the last tap is saved", async () => {
    const { context, page, srv, errors } = await signedInReader();
    try {
      await page.locator(".article .word").nth(2).click();
      const hanzi = (await page.locator(".dock-word").innerText()).trim();
      const dock = page.locator(".dock");

      // First tap schedules a sync (1.5 s debounce). Wait until its GET is on the wire.
      const inFlight = nextGet(srv);
      await dock.locator(".status-btn.unknown").click();
      expect(await activeStatus(page)).toBe("unknown");
      await inFlight;

      // Rapid taps while the GET is still out: each shows instantly.
      await dock.locator(".status-btn.shaky").click();
      expect(await activeStatus(page)).toBe("shaky");
      await dock.locator(".status-btn.known").click();
      expect(await activeStatus(page)).toBe("known");

      // Watch the dock through the GET landing, the merge/reload, the PUT and the follow-up sync.
      const seen: (string | null)[] = [];
      const until = Date.now() + GET_DELAY_MS + 4500;
      while (Date.now() < until) {
        seen.push(await activeStatus(page));
        await page.waitForTimeout(40);
      }
      expect(seen.filter((s) => s !== "known")).toEqual([]);

      // The server ends up with the last tap (last write wins).
      await expect.poll(() => srv.words.get(hanzi)?.status, { timeout: 8000 }).toBe("known");

      // And this device kept it too.
      await page.reload();
      await page.locator(".article .word").first().waitFor();
      await page.locator(".article .word").nth(2).click();
      expect(await activeStatus(page)).toBe("known");
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  }, 45_000);

  it("a failed account save is shown in the reader and the tap stays put", async () => {
    const { context, page, srv, errors } = await signedInReader();
    try {
      srv.putFails = true;
      await page.locator(".article .word").nth(3).click();
      await page.locator(".dock .status-btn.shaky").click();
      expect(await activeStatus(page)).toBe("shaky");
      const note = page.locator(".dock [role=alert]");
      await note.waitFor({ timeout: 8000 });
      expect(await note.innerText()).toMatch(/couldn.t|could not/i);
      expect(await activeStatus(page)).toBe("shaky");
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  }, 30_000);
});
