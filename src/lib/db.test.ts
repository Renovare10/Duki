import { describe, expect, it } from "vitest";
import { parseBackup } from "./db";

describe("parseBackup", () => {
  it("accepts a v1 Duki file and fills new word fields", () => {
    const backup = parseBackup({
      app: "duki",
      version: 1,
      exportedAt: "2026-09-11T00:00:00.000Z",
      words: [{ hanzi: "我", status: "known", updatedAt: 1 }],
      texts: [{ id: "t1", title: "Old", body: "你好", kind: "paste", createdAt: 1 }],
    });
    expect(backup.words[0].hanzi).toBe("我");
    expect(backup.words[0].dontKnowCount).toBe(0);
    expect(backup.words[0].okayCount).toBe(0);
    expect(backup.texts[0].readAt).toBeNull();
    expect(backup.texts[0].category).toBe("paste");
  });

  it("accepts a v2 file with counts and sessions", () => {
    const backup = parseBackup({
      app: "duki",
      version: 2,
      exportedAt: "2026-09-11T00:00:00.000Z",
      words: [{ hanzi: "喜欢", status: "unknown", dontKnowCount: 3, updatedAt: 2 }],
      texts: [],
      sessions: [
        {
          id: "s1",
          textId: "t1",
          finishedAt: 3,
          uniqueUnknown: 4,
          uniqueShaky: 1,
          durationMs: 12000,
        },
      ],
    });
    expect(backup.version).toBe(2);
    expect(backup.words[0].dontKnowCount).toBe(3);
    expect(backup.sessions?.[0].uniqueUnknown).toBe(4);
  });

  it("rejects unrelated JSON", () => {
    expect(() => parseBackup({ foo: 1 })).toThrow(/Duki backup/);
  });
});
