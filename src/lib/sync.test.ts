import { describe, expect, it } from "vitest";
import { mergeSnapshots, packSnapshot, parseSnapshot, snapshotBytes, type SyncSnapshot } from "./sync";
import type { LibraryText, WordRecord } from "../types";

function word(hanzi: string, updatedAt: number, status: WordRecord["status"] = "known"): WordRecord {
  return {
    hanzi,
    status,
    updatedAt,
    dontKnowCount: 0,
    barelyCount: 0,
    okayCount: status === "known" ? 1 : 0,
    ease: 2.5,
    intervalDays: 1,
    repetitions: 1,
    dueAt: null,
  };
}

function text(partial: Partial<LibraryText> & { id: string }): LibraryText {
  return {
    title: partial.title || partial.id,
    blurb: "",
    body: partial.body ?? "正文",
    kind: partial.kind || "sample",
    category: partial.category || "story",
    createdAt: 1,
    readAt: partial.readAt ?? null,
    bookmark: partial.bookmark ?? null,
    wikiTitle: partial.wikiTitle,
    gutenbergId: partial.gutenbergId,
    ...partial,
  };
}

describe("sync snapshot", () => {
  it("strips catalog bodies and keeps pastes", () => {
    const packed = packSnapshot({
      words: [word("猫", 10)],
      texts: [
        text({ id: "gb-1", kind: "gutenberg", gutenbergId: 1, body: "long public domain" }),
        text({ id: "p1", kind: "paste", category: "paste", body: "我写的" }),
      ],
      sessions: [],
      settings: { fontFamily: "serif", fontSize: 28 },
      now: 99,
    });
    expect(packed.texts.find((t) => t.id === "gb-1")?.body).toBe("");
    expect(packed.texts.find((t) => t.id === "p1")?.body).toBe("我写的");
    expect(packed.updatedAt).toBe(99);
  });

  it("merges words by latest updatedAt and keeps the earlier readAt", () => {
    const local: SyncSnapshot = {
      v: 1,
      updatedAt: 50,
      words: [word("猫", 50, "known")],
      texts: [text({ id: "a", readAt: 20, body: "" })],
      sessions: [],
      settings: { fontFamily: "sans", fontSize: 20 },
    };
    const remote: SyncSnapshot = {
      v: 1,
      updatedAt: 40,
      words: [word("猫", 10, "unknown"), word("狗", 40, "shaky")],
      texts: [text({ id: "a", readAt: 80, bookmark: { tokenIndex: 12, scrollY: 40 } })],
      sessions: [],
      settings: { fontFamily: "serif", fontSize: 28 },
    };
    const merged = mergeSnapshots(local, remote);
    expect(merged.words.find((w) => w.hanzi === "猫")?.status).toBe("known");
    expect(merged.words.find((w) => w.hanzi === "狗")?.status).toBe("shaky");
    expect(merged.texts[0].readAt).toBe(20);
    expect(merged.texts[0].bookmark?.tokenIndex).toBe(12);
    expect(merged.settings?.fontFamily).toBe("sans");
  });

  it("parseSnapshot ignores junk", () => {
    expect(parseSnapshot(null)).toBeNull();
    expect(parseSnapshot({ v: 2 })).toBeNull();
    expect(parseSnapshot({ v: 1, words: [], texts: [] })?.words).toEqual([]);
  });

  it("counts bytes", () => {
    const packed = packSnapshot({
      words: [],
      texts: [],
      sessions: [],
      settings: { fontFamily: "serif", fontSize: 28 },
    });
    expect(snapshotBytes(packed)).toBeGreaterThan(20);
  });
});
