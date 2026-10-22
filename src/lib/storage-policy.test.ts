import { afterEach, describe, expect, it, vi } from "vitest";
import type { LibraryText } from "../types";
import { emailVerifiedFromIdToken } from "./auth";
import { parseBackup } from "./db";
import { packSnapshot, pullSnapshotWithTag, pushSnapshot, retryOnConflict, SyncConflictError } from "./sync";
import {
  ACCOUNT_STORAGE_BYTES, LOCAL_STORAGE_BYTES, STORY_STORAGE_BYTES,
  assertNewStories, assertPlainText, assertStorageLimit, assertTextOnlyPayload,
  SYNC_HARD_MAX_BYTES, SYNC_SAFETY_BYTES, changedStories, importFileKind, jsonBytes, readTextImport,
  storageLabel, uploadedStoryBytes,
} from "./storage-policy";

const story = (body = "你好，世界。", id = "mine"): LibraryText => ({
  id, body, title: "我的故事", blurb: "Added by you.", kind: "paste", category: "paste",
  createdAt: 1, readAt: null, bookmark: null,
});
const snapshot = (texts: LibraryText[] = []) => packSnapshot({
  texts, words: [], sessions: [], settings: { fontFamily: "serif", fontSize: 28, theme: "paper" }, now: 1,
});
const token = (claim: unknown = true) => `test.${btoa(JSON.stringify({ email_verified: claim }))}.test`;
const backup = (texts: LibraryText[] = []) => ({ app: "duki", version: 2, words: [], texts });
afterEach(() => vi.unstubAllEnvs());

describe("storage policy", () => {
  it("uses decimal MB and clear usage labels", () => {
    expect(ACCOUNT_STORAGE_BYTES).toBe(1_000_000);
    expect(LOCAL_STORAGE_BYTES).toBe(1_000_000);
    expect(STORY_STORAGE_BYTES).toBeLessThan(ACCOUNT_STORAGE_BYTES);
    expect(storageLabel(700_000, ACCOUNT_STORAGE_BYTES)).toBe("0.7 MB of 1 MB");
    expect(jsonBytes("中文")).toBe(8);
    expect(storageLabel(300_000, ACCOUNT_STORAGE_BYTES)).toBe("0.3 MB of 1 MB");
    expect(storageLabel(0, ACCOUNT_STORAGE_BYTES)).toBe("0.0 MB of 1 MB");
    expect(storageLabel(20_000, ACCOUNT_STORAGE_BYTES)).toBe("<0.1 MB of 1 MB");
    expect(storageLabel(990_000, ACCOUNT_STORAGE_BYTES)).toBe("0.99 MB of 1 MB");
    expect(storageLabel(1_000_000, ACCOUNT_STORAGE_BYTES)).toBe("1.0 MB of 1 MB");
  });
  it("never blocks existing over-cap data, only new uploads", () => {
    const texts = Array.from({ length: 3 }, (_, i) => story("中".repeat(160_000), String(i)));
    const data = snapshot(texts);
    expect(() => assertStorageLimit(data, ACCOUNT_STORAGE_BYTES)).toThrow(/Storage limit/);
    expect(() => assertStorageLimit(data, ACCOUNT_STORAGE_BYTES, { addsStories: false })).not.toThrow();
    expect(() => assertStorageLimit(data, ACCOUNT_STORAGE_BYTES, { addsStories: true })).toThrow(/Storage limit/);
    expect(changedStories(texts, texts)).toEqual([]);
    expect(changedStories([...texts, story("新", "x")], texts).map((t) => t.id)).toEqual(["x"]);
    expect(changedStories([{ ...texts[0], bookmark: { tokenIndex: 1, scrollY: 1 } }], texts)).toEqual([]);
  });
  it("accepts the exact uploaded-story boundary and rejects even one byte over", () => {
    const one = story("中".repeat(100));
    const bytes = jsonBytes(one);
    expect(uploadedStoryBytes([one])).toBe(bytes);
    expect(() => assertStorageLimit({ texts: [one] }, bytes)).not.toThrow();
    expect(() => assertStorageLimit({ texts: [one] }, bytes - 1)).toThrow(/Existing stories are safe/);
  });
  it("counts all uploaded stories together, including multibyte Chinese and metadata", () => {
    const texts = Array.from({ length: 3 }, (_, i) => story("中".repeat(160_000), String(i)));
    expect(() => assertNewStories(texts)).not.toThrow();
    const data = snapshot(texts);
    expect(JSON.stringify(data).length).toBeLessThan(ACCOUNT_STORAGE_BYTES);
    expect(() => assertStorageLimit(data, ACCOUNT_STORAGE_BYTES)).toThrow(/Storage limit/);
    expect(() => assertStorageLimit(snapshot(texts.slice(0, 2)), LOCAL_STORAGE_BYTES)).not.toThrow();
    expect(() => assertStorageLimit(snapshot(texts.slice(0, 3)), LOCAL_STORAGE_BYTES)).toThrow();
  });
  it("does not count words, progress, sessions or library listings toward 1 MB", () => {
    const word = { hanzi: "图书馆", status: "known" as const, updatedAt: 1792632772322, dontKnowCount: 0, barelyCount: 0, okayCount: 0, ease: 2.5, intervalDays: 12.5, repetitions: 4, dueAt: 1792632772322, phase: "review" as const, step: 0, lapses: 0, introducedAt: 1792632772322 };
    const words = Array.from({ length: 8_000 }, (_, i) => ({ ...word, hanzi: `词${i}` }));
    const sessions = Array.from({ length: 200 }, (_, i) => ({ id: `s${i}`, textId: "x", finishedAt: i, uniqueUnknown: 1, uniqueShaky: 1, durationMs: 1 }));
    const listing = Array.from({ length: 900 }, (_, i) => ({ ...story("", `cat-${i}`), kind: "sample" as const, category: "graded" as const, blurb: "A catalog listing ".repeat(5) }));
    const big = packSnapshot({ words, sessions, texts: [...listing, story("中".repeat(1000), "mine")], settings: { fontFamily: "serif", fontSize: 28, theme: "paper" } });
    expect(jsonBytes(big)).toBeGreaterThan(ACCOUNT_STORAGE_BYTES);
    expect(uploadedStoryBytes(big.texts)).toBeLessThan(5_000);
    expect(() => assertStorageLimit(big, ACCOUNT_STORAGE_BYTES)).not.toThrow();
  });
  it("applies the 6 MB whole-sync safety limit only to saves that add a story", () => {
    expect(SYNC_SAFETY_BYTES).toBe(6_000_000);
    expect(SYNC_SAFETY_BYTES).toBeLessThan(SYNC_HARD_MAX_BYTES);
    expect(SYNC_HARD_MAX_BYTES).toBe(8 * 1024 * 1024);
    const huge = { ...snapshot([story("新")]), words: [{ hanzi: "x".repeat(SYNC_SAFETY_BYTES) }] } as unknown as ReturnType<typeof snapshot>;
    expect(() => assertStorageLimit(huge, ACCOUNT_STORAGE_BYTES)).toThrow(/6 MB safety limit/);
    expect(() => assertStorageLimit(huge, ACCOUNT_STORAGE_BYTES, { addsStories: false })).not.toThrow();
  });
  it("limits each new story but preserves legacy oversized rows and progress", () => {
    const old = story("中".repeat(180_000));
    expect(() => assertNewStories([old])).toThrow(/Each new story/);
    expect(() => assertNewStories([{ ...old, bookmark: { tokenIndex: 9, scrollY: 90 } }], [old])).not.toThrow();
    const before = JSON.stringify(old);
    expect(() => assertStorageLimit(snapshot([old]), 1)).toThrow();
    expect(JSON.stringify(old)).toBe(before);
    expect(() => assertNewStories([{ ...old, body: old.body + "新" }], [old])).toThrow();
  });
  it("excludes built-in bodies from the cloud budget", () => {
    const builtIn = { ...story("中".repeat(2_000_000)), kind: "sample" as const };
    expect(() => assertStorageLimit(snapshot([builtIn]), ACCOUNT_STORAGE_BYTES)).not.toThrow();
  });
});

describe("text-only import", () => {
  it("does not mistake ordinary prose for binary", () => {
    for (const ok of [
      "这篇文章讲 metadata: 什么是元数据。", "Database: 数据库", "我在 blob: 上看到的",
      "长句子 " + "the quick brown fox jumps over the lazy dog ".repeat(20),
      "一行一行\n" + "abcdefghij klmnopqrst\n".repeat(40),
    ]) expect(() => assertPlainText(ok)).not.toThrow();
  });
  it("accepts plain text and both old Duki backup versions", async () => {
    expect(() => assertPlainText("中文\n第二段\twith English and numbers 123.")).not.toThrow();
    for (const version of [1, 2]) expect(parseBackup({ ...backup([story()]), version }).texts[0].body).toBe("你好，世界。");
    expect(await readTextImport(new File(["你好"], "story.txt", { type: "text/plain" }))).toEqual({ kind: "txt", content: "你好" });
    expect(importFileKind({ name: "DUKI.JSON", type: "", size: 12 })).toBe("json");
  });
  it.each(["image.png", "photo.jpg", "report.pdf", "report.docx", "audio.mp3", "page.html", "book.epub"])("rejects %s", (name) => {
    expect(() => importFileKind({ name, type: "", size: 12 })).toThrow(/Text only/);
  });
  it("rejects conflicting MIME, excessive files, renamed binaries and malformed UTF-8", async () => {
    expect(() => importFileKind({ name: "story.txt", type: "image/png", size: 12 })).toThrow(/Text only/);
    expect(() => importFileKind({ name: "duki.json", type: "application/json", size: 25_000_001 })).toThrow(/25 MB/);
    await expect(readTextImport(new File(["%PDF-1.7"], "story.txt"))).rejects.toThrow(/Text only/);
    await expect(readTextImport(new File([new Uint8Array([0xff, 0x00, 0x80])], "story.txt"))).rejects.toThrow(/Text only/);
  });
  it.each(["中文\0binary", "中文 data:image/png;base64,AAAA", "中文 <img src='x'>", "中文 " + "QUJD".repeat(100), "中文 " + "QUJD\n".repeat(100)])("rejects embedded binary/encoded content", (body) => {
    expect(() => assertPlainText(body)).toThrow(/Text only/);
    expect(() => parseBackup(backup([story(body)]))).toThrow(/Text only/);
  });
  it("rejects attachment fields and numeric byte arrays before normalization", () => {
    expect(() => parseBackup({ ...backup(), image: [137, 80, 78, 71] })).toThrow(/Text only/);
    expect(() => parseBackup(backup([{ ...story(), body: [1, 2, 3] } as unknown as LibraryText]))).toThrow(/Text only/);
    expect(() => assertTextOnlyPayload({ ...snapshot(), attachment: "AAAA" }, true)).toThrow(/Text only/);
    expect(() => parseBackup(backup([{ ...story(), coverUrl: "data:image/png;base64,AA==" }]))).toThrow(/Text only/);
  });
});

describe("cloud preflight (not server enforcement)", () => {
  it("requires a strict verified-email claim", async () => {
    vi.stubEnv("VITE_DUKI_API", "https://test.invalid");
    const fetcher = vi.fn();
    for (const claim of [false, undefined, "false", "yes", 1]) {
      const idToken = claim === undefined ? "legacy.token" : token(claim);
      expect(emailVerifiedFromIdToken(idToken)).toBe(false);
      await expect(pushSnapshot(idToken, snapshot(), fetcher)).rejects.toThrow(/Verify your email/);
    }
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("accepts Cognito's string \"true\" claim for federated users", () => {
    expect(emailVerifiedFromIdToken(token("true"))).toBe(true);
    expect(emailVerifiedFromIdToken(token(true))).toBe(true);
  });
  it("keeps syncing a legacy over-cap account but refuses new stories", async () => {
    vi.stubEnv("VITE_DUKI_API", "https://test.invalid");
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const legacy = [story("中".repeat(180_000), "big"), ...Array.from({ length: 2 }, (_, i) => story("中".repeat(160_000), String(i)))];
    const progress = legacy.map((t) => ({ ...t, bookmark: { tokenIndex: 5, scrollY: 50 } }));
    await pushSnapshot(token(), snapshot(progress), fetcher, legacy);
    expect(fetcher).toHaveBeenCalledTimes(1);
    await expect(pushSnapshot(token(), snapshot([...progress, story("新故事", "new")]), fetcher, legacy)).rejects.toThrow(/Storage limit/);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("sends If-Match from the GET ETag and maps 409 to a retryable conflict", async () => {
    vi.stubEnv("VITE_DUKI_API", "https://test.invalid");
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(snapshot()), { status: 200, headers: { etag: '"abc"' } }));
    const pulled = await pullSnapshotWithTag(token(), fetcher);
    expect(pulled.etag).toBe('"abc"');
    fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ error: "conflict" }), { status: 409 }));
    await expect(pushSnapshot(token(), snapshot(), fetcher, [], { ifMatch: pulled.etag })).rejects.toBeInstanceOf(SyncConflictError);
    expect(fetcher.mock.calls[1][1].headers["If-Match"]).toBe('"abc"');
    fetcher.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await pushSnapshot(token(), snapshot(), fetcher);
    expect(fetcher.mock.calls[2][1].headers).not.toHaveProperty("If-Match");
  });
  it("re-runs pull/merge/push after a conflict, at most three times", async () => {
    const ok = vi.fn().mockRejectedValueOnce(new SyncConflictError()).mockResolvedValueOnce(undefined);
    await retryOnConflict(ok);
    expect(ok).toHaveBeenCalledTimes(2);
    const always = vi.fn().mockRejectedValue(new SyncConflictError());
    await expect(retryOnConflict(always)).rejects.toBeInstanceOf(SyncConflictError);
    expect(always).toHaveBeenCalledTimes(3);
    const other = vi.fn().mockRejectedValue(new Error("offline"));
    await expect(retryOnConflict(other)).rejects.toThrow("offline");
    expect(other).toHaveBeenCalledTimes(1);
  });
  it("shows the server's 413/403 explanations", async () => {
    vi.stubEnv("VITE_DUKI_API", "https://test.invalid");
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ error: "quota", message: "Uploaded stories are over 1 MB." }), { status: 413 }));
    await expect(pushSnapshot(token(), snapshot(), fetcher)).rejects.toThrow("Uploaded stories are over 1 MB.");
    fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ error: "verify_email" }), { status: 403 }));
    await expect(pushSnapshot(token(), snapshot(), fetcher)).rejects.toThrow(/Verify your email/);
  });
  it("blocks total/per-story overflow and binary before any network write", async () => {
    vi.stubEnv("VITE_DUKI_API", "https://test.invalid");
    const fetcher = vi.fn();
    await expect(pushSnapshot(token(), snapshot([story("中".repeat(180_000))]), fetcher)).rejects.toThrow(/Each new story/);
    const texts = Array.from({ length: 3 }, (_, i) => story("中".repeat(160_000), String(i)));
    await expect(pushSnapshot(token(), snapshot(texts), fetcher)).rejects.toThrow(/Storage limit/);
    await expect(pushSnapshot(token(), snapshot([story("data:image/png;base64,AAAA")]), fetcher)).rejects.toThrow(/Text only/);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("sends valid text and reports server refusal without modifying data", async () => {
    vi.stubEnv("VITE_DUKI_API", "https://test.invalid");
    const data = snapshot([story()]);
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    await pushSnapshot(token(), data, fetcher);
    expect(fetcher.mock.calls[0][0]).toBe("https://test.invalid/me");
    expect(JSON.parse(fetcher.mock.calls[0][1].body).texts[0].body).toBe("你好，世界。");
    const before = JSON.stringify(data);
    fetcher.mockResolvedValue(new Response(null, { status: 413 }));
    await expect(pushSnapshot(token(), data, fetcher)).rejects.toThrow(/1 MB/);
    fetcher.mockResolvedValue(new Response(null, { status: 415 }));
    await expect(pushSnapshot(token(), data, fetcher)).rejects.toThrow(/plain text only/);
    expect(JSON.stringify(data)).toBe(before);
  });
});
