import { describe, expect, it } from "vitest";
import { incomingWins, keepNewerWords, tapTime } from "./word-merge";
import { applyReadingTap } from "./word";
import type { WordRecord } from "../types";

function w(hanzi: string, status: WordRecord["status"], updatedAt: number): WordRecord {
  return { ...applyReadingTap(undefined, hanzi, status, updatedAt) };
}

describe("keepNewerWords", () => {
  it("keeps a tap made while a sync was in flight over the older synced copy", () => {
    const loaded = new Map([["好", w("好", "unknown", 100)]]);
    const current = [w("好", "known", 200)];
    expect(keepNewerWords(loaded, current).get("好")?.status).toBe("known");
  });

  it("takes a newer synced copy (another device) over an older local one", () => {
    const loaded = new Map([["好", w("好", "shaky", 300)]]);
    expect(keepNewerWords(loaded, [w("好", "known", 200)]).get("好")?.status).toBe("shaky");
  });

  it("keeps words only one side has, and ties keep the base", () => {
    const loaded = new Map([["好", w("好", "shaky", 300)]]);
    const out = keepNewerWords(loaded, [w("好", "known", 300), w("我", "unknown", 5)]);
    expect(out.get("好")?.status).toBe("shaky");
    expect(out.get("我")?.status).toBe("unknown");
    expect(loaded.size).toBe(1);
  });
});

describe("tapTime", () => {
  it("is strictly after the previous change even in the same millisecond or with a clock step back", () => {
    expect(tapTime(undefined, 50)).toBe(50);
    expect(tapTime(w("好", "unknown", 50), 50)).toBe(51);
    expect(tapTime(w("好", "unknown", 90), 50)).toBe(91);
    expect(tapTime(w("好", "unknown", 10), 50)).toBe(50);
  });
});

describe("incomingWins", () => {
  it("never lets an older synced word overwrite a newer stored tap", () => {
    expect(incomingWins(w("好", "known", 200), w("好", "unknown", 100))).toBe(false);
    expect(incomingWins(w("好", "known", 200), w("好", "unknown", 200))).toBe(false);
    expect(incomingWins(w("好", "known", 200), w("好", "unknown", 201))).toBe(true);
    expect(incomingWins(undefined, w("好", "unknown", 1))).toBe(true);
  });
});
