import type { SyncSnapshot } from "./sync";
import { parseSnapshot } from "./sync";

/**
 * TEST preview only (build with VITE_DUKI_CLOUD_SYNC=off and VITE_DUKI_DEMO_CLOUD=on): a fake,
 * slow "account" kept in this browser's localStorage, so the sync path can be tried with sample
 * data and no sign-in. Never on in production builds.
 *   ?syncDelay=2500  how long the fake GET takes (ms; the PUT takes half)
 *   ?syncFail=1      every fake PUT fails, to show the failed-save message
 */
export function demoCloudBuild(env: Record<string, unknown> | undefined = import.meta.env as Record<string, unknown> | undefined): boolean {
  return env?.VITE_DUKI_DEMO_CLOUD === "on";
}

const KEY = "duki.demo.cloud";

function option(name: string): string | null {
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}

function delayMs(): number {
  const raw = Number(option("syncDelay"));
  return Number.isFinite(raw) && raw >= 0 ? Math.min(raw, 20_000) : 2500;
}

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function demoPull(): Promise<{ snapshot: SyncSnapshot | null; etag: string | null }> {
  let raw: unknown = null;
  try {
    raw = JSON.parse(window.localStorage.getItem(KEY) || "null");
  } catch {
    raw = null;
  }
  await sleep(delayMs());
  return { snapshot: raw ? parseSnapshot(raw) : null, etag: null };
}

export async function demoPush(snapshot: SyncSnapshot): Promise<void> {
  await sleep(delayMs() / 2);
  if (option("syncFail") === "1") throw new Error("Could not save account library.");
  // Words only: the fake account doesn't need the library texts.
  window.localStorage.setItem(
    KEY,
    JSON.stringify({ v: 1, updatedAt: snapshot.updatedAt, words: snapshot.words, texts: [], sessions: [], settings: null }),
  );
}
