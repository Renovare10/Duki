/**
 * Stats demo mode: a deterministic, in-memory EXAMPLE learner history so the charts can be
 * explored on a fresh browser. Nothing here touches IndexedDB, backups, or cloud sync — the
 * result only ever lives in the Stats component’s state.
 */
import type { ReadingSession, ReviewGrade, WordEvent, WordRecord, WordStatus } from "../types";
import { DEMO_VOCAB } from "../data/demo-vocab";
import { makeWordEvent } from "./history";
import { buildReviewQueue } from "./review";
import { addDays, startOfDay } from "./stats";
import { applyReadingTap, applyReviewGrade } from "./word";

export type DemoData = {
  words: Map<string, WordRecord>;
  events: WordEvent[];
  sessions: ReadingSession[];
};

/** Small seeded PRNG so the example looks the same on every load. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function demoRequested(search: string, hash: string): boolean {
  const flag = (q: string) => {
    const v = new URLSearchParams(q).get("demo");
    return v === "1" || v === "true";
  };
  const hashQuery = hash.includes("?") ? hash.slice(hash.indexOf("?")) : "";
  return flag(search) || flag(hashQuery);
}

export function generateDemoData(options: {
  now: number;
  days?: number;
  seed?: number;
  textIds?: string[];
  vocab?: string[];
}): DemoData {
  const { now } = options;
  const days = options.days ?? 420;
  const rand = mulberry32(options.seed ?? 20261007);
  const vocab = options.vocab ?? DEMO_VOCAB;
  const textIds = options.textIds?.length ? options.textIds : ["demo-text"];
  const words = new Map<string, WordRecord>();
  const events: WordEvent[] = [];
  const sessions: ReadingSession[] = [];
  let nextVocab = 0;
  let evId = 0;
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];

  const tap = (hanzi: string, status: WordStatus, at: number) => {
    const prev = words.get(hanzi);
    const next = applyReadingTap(prev, hanzi, status, at);
    words.set(hanzi, next);
    events.push(makeWordEvent(prev, next, "read", undefined, `demo-${evId++}`));
  };
  const grade = (hanzi: string, g: ReviewGrade, at: number) => {
    const prev = words.get(hanzi)!;
    const next = applyReviewGrade(prev, g, at);
    words.set(hanzi, next);
    events.push(makeWordEvent(prev, next, "review", g, `demo-${evId++}`));
  };

  const today = startOfDay(now);
  const breakStart = Math.floor(days * 0.45);
  for (let d = days; d >= 0; d -= 1) {
    const day = addDays(today, -d);
    const weekday = new Date(day).getDay();
    const onBreak = d <= breakStart && d > breakStart - 9;
    // Ramp-up early, a 9-day break mid-way, and a solid recent streak.
    let pActive = weekday === 0 || weekday === 6 ? 0.68 : 0.86;
    if (d > days - 30) pActive -= 0.15;
    if (d < 26) pActive = 1;
    if (onBreak || rand() > pActive) continue;

    let t = day + (7 + rand() * 12) * 3600_000;
    if (d === 0) {
      if (now - day < 2 * 3600_000) continue;
      t = Math.max(day, Math.min(t, now - 90 * 60_000));
    }

    // Reading: meet new words and re-tap some old ones.
    const reads = rand() < 0.7 ? (rand() < 0.3 ? 2 : 1) : 0;
    for (let r = 0; r < reads; r += 1) {
      const start = t;
      const fresh = 3 + Math.floor(rand() * 7);
      for (let i = 0; i < fresh && nextVocab < vocab.length; i += 1) {
        const roll = rand();
        tap(vocab[nextVocab++], roll < 0.45 ? "unknown" : roll < 0.7 ? "shaky" : "known", t);
        t += 20_000 + rand() * 60_000;
      }
      const old = [...words.keys()];
      const retaps = old.length ? 2 + Math.floor(rand() * 5) : 0;
      for (let i = 0; i < retaps; i += 1) {
        const hanzi = pick(old);
        const w = words.get(hanzi)!;
        const strong = w.status === "known" ? 0.9 : w.status === "shaky" ? 0.6 : 0.35;
        const roll = rand();
        const wobble = w.status === "known" ? 0.1 : 0.25;
        tap(hanzi, roll < strong ? "known" : roll < strong + wobble ? "shaky" : "unknown", t);
        t += 15_000 + rand() * 40_000;
      }
      const roll = rand();
      sessions.push({
        id: `demo-s-${sessions.length}`,
        textId: pick(textIds),
        finishedAt: t,
        uniqueUnknown: Math.floor(roll * 9),
        uniqueShaky: Math.floor(rand() * 6),
        durationMs: Math.round((6 + rand() * 22) * 60_000),
      });
      t += 5 * 60_000;
      if (t - start > 3 * 3600_000) break;
    }

    // Review: work through part of the SM-2 queue.
    if (rand() < 0.88) {
      const queue = buildReviewQueue(words.values(), t);
      const cap = 25 + Math.floor(rand() * 45);
      for (const card of queue.slice(0, cap)) {
        let pAgain: number;
        let pHard: number;
        if (card.status === "unknown") {
          pAgain = 0.3;
          pHard = 0.16;
        } else if (card.status === "shaky") {
          pAgain = 0.14;
          pHard = 0.12;
        } else {
          pAgain = 0.04 + 0.1 / Math.max(1, card.intervalDays / 2) + (2.5 - card.ease) * 0.04;
          pHard = 0.06;
        }
        const roll = rand();
        const g: ReviewGrade =
          roll < pAgain ? "again" : roll < pAgain + pHard ? "hard" : roll < 0.93 ? "good" : "easy";
        grade(card.hanzi, g, t);
        t += 6_000 + rand() * 14_000;
      }
    }
  }
  events.sort((a, b) => a.at - b.at);
  return {
    words,
    events: events.filter((e) => e.at <= now),
    sessions: sessions.filter((s) => s.finishedAt <= now),
  };
}
