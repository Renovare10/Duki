import { afterEach, describe, expect, it, vi } from "vitest";
import type { LibraryText } from "../types";
import { emailVerifiedFromIdToken } from "./auth";
import { parseBackup } from "./db";
import { packSnapshot, pushSnapshot } from "./sync";
import {
  ACCOUNT_STORAGE_BYTES, LOCAL_STORAGE_BYTES, STORY_STORAGE_BYTES,
  assertNewStories, assertPlainText, assertStorageLimit, assertTextOnlyPayload,
  importFileKind, jsonBytes, readTextImport, storageLabel,
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
  });
  it("accepts the exact boundary and rejects even one byte over", () => {
    const data = { body: "中".repeat(100) };
    const bytes = jsonBytes(data);
    expect(() => assertStorageLimit(data, bytes)).not.toThrow();
    expect(() => assertStorageLimit(data, bytes - 1)).toThrow(/Existing stories are safe/);
  });
  it("counts all stories together, including multibyte Chinese and metadata", () => {
    const texts = Array.from({ length: 3 }, (_, i) => story("中".repeat(160_000), String(i)));
    expect(() => assertNewStories(texts)).not.toThrow();
    const data = snapshot(texts);
    expect(JSON.stringify(data).length).toBeLessThan(ACCOUNT_STORAGE_BYTES);
    expect(() => assertStorageLimit(data, ACCOUNT_STORAGE_BYTES)).toThrow(/Storage limit/);
    expect(() => assertStorageLimit(snapshot(texts.slice(0, 2)), LOCAL_STORAGE_BYTES)).not.toThrow();
    expect(() => assertStorageLimit(snapshot(texts.slice(0, 3)), LOCAL_STORAGE_BYTES)).toThrow();
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
    for (const claim of [false, undefined, "true", 1]) {
      const idToken = claim === undefined ? "legacy.token" : token(claim);
      expect(emailVerifiedFromIdToken(idToken)).toBe(false);
      await expect(pushSnapshot(idToken, snapshot(), fetcher)).rejects.toThrow(/Verify your email/);
    }
    expect(fetcher).not.toHaveBeenCalled();
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
