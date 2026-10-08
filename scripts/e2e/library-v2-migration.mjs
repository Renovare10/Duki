#!/usr/bin/env node
/**
 * Headless-Chrome data-safety check for library v2.
 *
 *   node scripts/e2e/library-v2-migration.mjs <old-dist> <new-dist> [outDir]
 *
 * 1. Serves the OLD production build, lets it create its IndexedDB (v6), then
 *    seeds realistic user data through IndexedDB: SM-2 word records, history
 *    events, reading sessions, a pasted text, bookmarks/read marks on catalog
 *    texts, and settings.
 * 2. Serves the NEW build on the same origin and profile: every stored record
 *    must be byte-for-byte identical after boot, and the UI must show the old
 *    progress. Then it reads a Bible chapter and checks what was written.
 * 3. Serves the OLD build again on that profile: it must still boot and keep
 *    every word, session and event (backward compatibility).
 * 4. Separately, opens the NEW build on a hand-made v5 database (the shape
 *    before the events store existed) and checks the upgrade keeps everything.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const [oldDist, newDist, outDir = "screenshots"] = process.argv.slice(2);
if (!oldDist || !newDist) {
  console.error("usage: library-v2-migration.mjs <old-dist> <new-dist> [outDir]");
  process.exit(2);
}
const PORT = 4188;
const ORIGIN = `http://127.0.0.1:${PORT}`;
fs.mkdirSync(outDir, { recursive: true });

let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) failures += 1;
};

async function serve(dir) {
  const proc = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1", "--directory", dir], {
    stdio: "ignore",
  });
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(ORIGIN + "/");
      if (res.ok) return proc;
    } catch {
      /* not yet */
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("server did not start");
}

const stop = (proc) =>
  new Promise((r) => {
    proc.once("exit", r);
    proc.kill();
  });

async function waitBoot(page) {
  await page.waitForSelector(".home, .boot-error", { timeout: 30000 });
  const err = await page.$(".boot-error");
  if (err) throw new Error("boot error: " + (await err.textContent()));
  await page.waitForTimeout(600);
}

/** Raw dump of every store, sorted, for exact comparisons. */
async function dump(page) {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open("duki");
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const names = [...db.objectStoreNames];
          const tx = db.transaction(names, "readonly");
          const out = { version: db.version, stores: {} };
          let pending = names.length;
          for (const name of names) {
            const r = tx.objectStore(name).getAll();
            r.onsuccess = () => {
              out.stores[name] = r.result;
              if (--pending === 0) {
                db.close();
                resolve(out);
              }
            };
          }
        };
      }),
  );
}

const byKey = (rows, key) => new Map(rows.map((r) => [r[key], r]));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const keyOf = { words: "hanzi", texts: "id", sessions: "id", settings: "key", events: "id" };

function compareStores(before, after, label, { allowChangedTexts = new Set() } = {}) {
  for (const [store, rows] of Object.entries(before.stores)) {
    const now = byKey(after.stores[store] || [], keyOf[store]);
    let missing = 0;
    let changed = 0;
    const changedIds = [];
    for (const row of rows) {
      const id = row[keyOf[store]];
      const hit = now.get(id);
      if (!hit) missing += 1;
      else if (!same(row, hit) && !(store === "texts" && allowChangedTexts.has(id))) {
        changed += 1;
        changedIds.push(id);
      }
    }
    check(missing === 0 && changed === 0, `${label}: ${store} — ${rows.length} records kept${missing ? `, ${missing} MISSING` : ""}${changed ? `, ${changed} CHANGED (${changedIds.slice(0, 5).join(", ")})` : ""}`);
  }
}

const DAY = 86400000;
const NOW = Date.now();

function seedData() {
  const known = "我 你 他 的 是 在 有 一 不 了 人 说 好 去 来 看 家 吃 喝 茶 水 天 大 小 书 猫 狗 朋友 学校 老师 中国 今天 明天".split(" ");
  const words = known.map((hanzi, i) => ({
    hanzi,
    status: i % 7 === 3 ? "shaky" : "known",
    updatedAt: NOW - i * 3600000,
    dontKnowCount: i % 3,
    barelyCount: i % 2,
    okayCount: 2 + (i % 4),
    ease: 2.5 - (i % 5) * 0.1,
    intervalDays: 1 + i,
    repetitions: 1 + (i % 3),
    dueAt: NOW + (i - 5) * DAY,
    phase: i % 9 === 0 ? "relearning" : "review",
    step: 0,
    lapses: i % 4 === 0 ? 1 : 0,
    introducedAt: NOW - 30 * DAY,
  }));
  words.push({ hanzi: "骆驼", status: "unknown", updatedAt: NOW, dontKnowCount: 2, barelyCount: 0, okayCount: 0, ease: 2.5, intervalDays: 0, repetitions: 0, dueAt: NOW - 1000, phase: "learning", step: 1, lapses: 0, introducedAt: NOW - DAY });
  const events = words.slice(0, 12).map((w, i) => ({
    id: `ev-${i}`,
    hanzi: w.hanzi,
    at: NOW - (12 - i) * DAY,
    source: i % 2 ? "review" : "read",
    ...(i % 2 ? { grade: "good" } : {}),
    prevStatus: i === 0 ? null : "shaky",
    status: w.status,
    prevIntervalDays: 1,
    intervalDays: w.intervalDays,
  }));
  const sessions = [
    { id: "sess-1", textId: "sample-home", finishedAt: NOW - 5 * DAY, uniqueUnknown: 2, uniqueShaky: 1, durationMs: 120000 },
    { id: "sess-2", textId: "my-paste-1", finishedAt: NOW - 2 * DAY, uniqueUnknown: 7, uniqueShaky: 0, durationMs: 300000 },
  ];
  return { words, events, sessions };
}

async function seed(page) {
  const data = seedData();
  await page.evaluate(
    ({ data, NOW }) =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open("duki");
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction(["words", "texts", "sessions", "settings", "events"], "readwrite");
          for (const w of data.words) tx.objectStore("words").put(w);
          for (const e of data.events) tx.objectStore("events").put(e);
          for (const s of data.sessions) tx.objectStore("sessions").put(s);
          tx.objectStore("settings").put({ key: "reader", fontFamily: "kai", fontSize: 32, theme: "night", themeSetAt: NOW - 1000 });
          tx.objectStore("texts").put({
            id: "my-paste-1",
            title: "我的日记",
            blurb: "Added by you.",
            body: "今天我和朋友去学校。我们喝茶，看书。老师说中国很大。",
            kind: "paste",
            category: "paste",
            featured: false,
            createdAt: NOW - 3 * DAY,
            readAt: NOW - 2 * DAY,
            bookmark: null,
            preview: false,
          });
          const texts = tx.objectStore("texts");
          const patch = (id, fn) => {
            const g = texts.get(id);
            g.onsuccess = () => g.result && texts.put(fn(g.result));
          };
          patch("sample-home", (t) => ({ ...t, readAt: NOW - 5 * DAY }));
          patch("novel-lamp-1", (t) => ({ ...t, bookmark: { tokenIndex: 41, scrollY: 640 } }));
          patch("hist-silk", (t) => ({ ...t, bookmark: { tokenIndex: 12, scrollY: 180 } }));
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    { data, NOW },
  );
}

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "duki-mig-"));
  const launch = (dir) =>
    chromium.launchPersistentContext(dir, {
      executablePath: "/usr/bin/google-chrome",
      headless: true,
      viewport: { width: 1280, height: 900 },
    });

  // ---- 1. old build creates and holds the data
  let server = await serve(oldDist);
  let ctx = await launch(profile);
  let page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(ORIGIN + "/#/");
  await waitBoot(page);
  await seed(page);
  await page.reload();
  await waitBoot(page);
  const before = await dump(page);
  check(before.version === 6, `old build database is v${before.version}`);
  await page.screenshot({ path: path.join(outDir, "library-v2-migration-1-old.png") });
  await ctx.close();
  await stop(server);

  // ---- 2. new build on the same data
  server = await serve(newDist);
  ctx = await launch(profile);
  page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(ORIGIN + "/#/");
  await waitBoot(page);
  const afterBoot = await dump(page);
  check(afterBoot.version === 6, `new build keeps database at v${afterBoot.version} (no schema change)`);
  compareStores(before, afterBoot, "new build boot");
  const homeText = await page.textContent(".home");
  check(/Continue reading/.test(homeText) && /旧灯/.test(homeText), "Continue reading shows the half-read 旧灯 chapter");
  check(/丝绸之路/.test(await page.textContent('[data-row="continue"]')), "Continue reading shows half-read 丝绸之路");
  check(/我的日记/.test(homeText), "pasted text still on the shelves");
  await page.screenshot({ path: path.join(outDir, "library-v2-migration-2-new.png") });

  // Stats and review still see the same lexicon.
  await page.goto(ORIGIN + "/#/stats");
  await page.waitForSelector(".stats-shell", { timeout: 10000 });
  const statsText = await page.textContent(".stats-shell");
  check(/\b29\b/.test(statsText) || statsText.includes("29"), "Stats shows the 29 known words");

  // Read a Bible chapter: progress row written without a body.
  await page.goto(ORIGIN + "/#/read/" + encodeURIComponent("w:bible-cuv:GEN.1"));
  await page.waitForSelector(".article .word", { timeout: 15000 });
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(900);
  await page.click(".chapter-nav .primary");
  await page.waitForSelector(".article .word", { timeout: 15000 });
  await page.waitForTimeout(800);
  check(page.url().includes("GEN.2"), "Done · next opens Genesis 2");
  await page.goto(ORIGIN + "/#/");
  await waitBoot(page);
  const afterRead = await dump(page);
  const rows = byKey(afterRead.stores.texts, "id");
  const g1 = rows.get("w:bible-cuv:GEN.1");
  const g2 = rows.get("w:bible-cuv:GEN.2");
  check(Boolean(g1?.readAt) && g1.body === "" && g1.openedAt > 0, "GEN.1 row: read, opened, no body stored");
  check(Boolean(g2) && !g2.readAt && g2.body === "", "GEN.2 row: opened, unread, no body stored");
  check(afterRead.stores.sessions.some((s) => s.textId === "w:bible-cuv:GEN.1"), "reading session recorded for GEN.1");
  compareStores(before, afterRead, "after reading new content");
  check(/创世记 2/.test(await page.textContent('[data-row="continue"]')), "Continue reading offers Genesis 2");
  await ctx.close();
  await stop(server);

  // ---- 3. old build again on data the new build wrote
  server = await serve(oldDist);
  ctx = await launch(profile);
  page = await ctx.newPage();
  const oldErrors = [];
  page.on("pageerror", (e) => oldErrors.push(e.message));
  await page.goto(ORIGIN + "/#/");
  await waitBoot(page);
  const back = await dump(page);
  for (const store of ["words", "sessions", "events", "settings"]) {
    const a = byKey(afterRead.stores[store], keyOf[store]);
    const b = byKey(back.stores[store], keyOf[store]);
    check(a.size === b.size && [...a].every(([k, v]) => same(v, b.get(k))), `old build after new: ${store} unchanged (${a.size})`);
  }
  check(oldErrors.length === 0, `old build boots on new data without script errors${oldErrors.length ? ": " + oldErrors[0] : ""}`);
  await page.screenshot({ path: path.join(outDir, "library-v2-migration-3-old-again.png") });
  await ctx.close();
  await stop(server);

  // ---- 4. a v5-shaped database opened by the new build
  const profile5 = fs.mkdtempSync(path.join(os.tmpdir(), "duki-mig5-"));
  server = await serve(newDist);
  ctx = await launch(profile5);
  page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(ORIGIN + "/favicon.svg");
  const data = seedData();
  await page.evaluate(
    ({ data, NOW }) =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open("duki", 5);
        req.onupgradeneeded = () => {
          const db = req.result;
          db.createObjectStore("words", { keyPath: "hanzi" });
          db.createObjectStore("texts", { keyPath: "id" });
          db.createObjectStore("sessions", { keyPath: "id" });
          db.createObjectStore("settings", { keyPath: "key" });
        };
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction(["words", "texts", "sessions", "settings"], "readwrite");
          // v5-era word rows had no SM-2 phase fields yet.
          for (const w of data.words) {
            const { phase, step, lapses, introducedAt, ...old } = w;
            tx.objectStore("words").put(old);
          }
          for (const s of data.sessions) tx.objectStore("sessions").put(s);
          tx.objectStore("settings").put({ key: "reader", fontFamily: "serif", fontSize: 30, theme: "paper" });
          tx.objectStore("texts").put({ id: "sample-home", title: "我的家", blurb: "", body: "我家有三个人。", kind: "sample", category: "graded", createdAt: 1, readAt: NOW - DAY, bookmark: null });
          tx.objectStore("texts").put({ id: "novel-lamp-1", title: "旧灯 · 一", blurb: "", body: "巷子里有一盏旧灯。", kind: "sample", category: "novel", createdAt: 49, readAt: null, bookmark: { tokenIndex: 41, scrollY: 640 }, seriesId: "old-lamp", chapter: 1 });
          tx.objectStore("texts").put({ id: "my-paste-1", title: "我的日记", blurb: "Added by you.", body: "今天我和朋友去学校。", kind: "paste", category: "paste", createdAt: 5, readAt: null, bookmark: null });
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
        };
      }),
    { data, NOW },
  );
  await page.goto(ORIGIN + "/#/");
  await waitBoot(page);
  const v5 = await dump(page);
  check(v5.version === 6 && "events" in v5.stores, "v5 database upgraded to v6 by the new build");
  const w5 = byKey(v5.stores.words, "hanzi");
  check(data.words.every((w) => w5.get(w.hanzi)?.status === w.status && w5.get(w.hanzi)?.okayCount === w.okayCount), `v5 words kept (${w5.size})`);
  const t5 = byKey(v5.stores.texts, "id");
  check(Boolean(t5.get("sample-home")?.readAt) && t5.get("novel-lamp-1")?.bookmark?.tokenIndex === 41 && Boolean(t5.get("my-paste-1")), "v5 read marks, bookmark and pasted text kept");
  check(v5.stores.sessions.length === 2, "v5 sessions kept");
  await ctx.close();
  await stop(server);

  check(errors.length === 0, `new build: no script errors${errors.length ? ": " + errors.join(" | ") : ""}`);
  console.log(failures ? `\n${failures} check(s) failed` : "\nAll data-safety checks passed");
  process.exit(failures ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
