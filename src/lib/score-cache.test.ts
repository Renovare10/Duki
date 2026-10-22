import { describe, expect, it, vi } from "vitest";
import { createScoreCache } from "./score-cache";
import { scoreTokens } from "./score";
import type { LibraryText, WordStatus } from "../types";

const text: LibraryText = { id: "a", title: "故事", body: "你好", blurb: "", kind: "paste", category: "paste", createdAt: 1, readAt: null, bookmark: null };
describe("scroll-safe score cache", () => {
  it("does not segment/score again for bookmark or read metadata changes", () => {
    const cache = createScoreCache();
    const statuses = new Map<string, WordStatus>();
    const calculate = vi.fn(() => scoreTokens([], statuses));
    const first = cache.get(text, statuses, undefined, calculate);
    for (let y = 0; y < 100; y++) {
      expect(cache.get({ ...text, bookmark: { tokenIndex: y, scrollY: y }, readAt: y }, statuses, undefined, calculate)).toBe(first);
    }
    expect(calculate).toHaveBeenCalledTimes(1);
  });
  it("invalidates changed prose, word states, remote profiles and removed/readded rows", () => {
    const cache = createScoreCache();
    const statuses = new Map<string, WordStatus>();
    const calculate = vi.fn(() => scoreTokens([], statuses));
    cache.get(text, statuses, undefined, calculate);
    cache.get({ ...text, body: "新的正文" }, statuses, undefined, calculate);
    const nextStatuses = new Map<string, WordStatus>([["你好", "known"]]);
    cache.get(text, nextStatuses, undefined, calculate);
    cache.get(text, nextStatuses, { words: ["你好"], counts: [1] }, calculate);
    cache.retain(new Set());
    cache.get(text, nextStatuses, undefined, calculate);
    expect(calculate).toHaveBeenCalledTimes(5);
  });
});
