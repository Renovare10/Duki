import { describe, expect, it } from "vitest";
import {
  mergeSnapshots,
  packSnapshot,
  parseSnapshot,
  preferSnapshot,
  snapshotBytes,
  type SyncSnapshot,
} from "./sync";
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
      settings: { fontFamily: "serif", fontSize: 28, theme: "paper" },
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
      settings: { fontFamily: "sans", fontSize: 20, theme: "night" },
    };
    const remote: SyncSnapshot = {
      v: 1,
      updatedAt: 40,
      words: [word("猫", 10, "unknown"), word("狗", 40, "shaky")],
      texts: [text({ id: "a", readAt: 80, bookmark: { tokenIndex: 12, scrollY: 40 } })],
      sessions: [],
      settings: { fontFamily: "serif", fontSize: 28, theme: "paper" },
    };
    const merged = mergeSnapshots(local, remote);
    expect(merged.words.find((w) => w.hanzi === "猫")?.status).toBe("known");
    expect(merged.words.find((w) => w.hanzi === "狗")?.status).toBe("shaky");
    expect(merged.texts[0].readAt).toBe(20);
    expect(merged.texts[0].bookmark?.tokenIndex).toBe(12);
    expect(merged.settings?.fontFamily).toBe("sans");
  });

  it("defaults to the snapshot with more known words even if the other is newer", () => {
    const thinLocal: SyncSnapshot = {
      v: 1,
      updatedAt: 9_000,
      words: [word("猫", 9_000, "known")],
      texts: [text({ id: "a", readAt: null })],
      sessions: [],
      settings: { fontFamily: "sans", fontSize: 20 },
    };
    const richRemote: SyncSnapshot = {
      v: 1,
      updatedAt: 100,
      words: [word("猫", 50, "known"), word("狗", 40, "known"), word("鸟", 40, "known")],
      texts: [text({ id: "a", readAt: 80 }), text({ id: "b", readAt: 90 })],
      sessions: [],
      settings: { fontFamily: "serif", fontSize: 28 },
    };
    const merged = mergeSnapshots(thinLocal, richRemote);
    expect(merged.words.filter((w) => w.status === "known")).toHaveLength(3);
    expect(merged.texts.filter((t) => t.readAt).map((t) => t.id).sort()).toEqual(["a", "b"]);
    expect(merged.settings?.fontFamily).toBe("serif");
  });

  it("defaults to the more recently updated snapshot when known counts tie", () => {
    const older: SyncSnapshot = {
      v: 1,
      updatedAt: 10,
      words: [word("猫", 10, "known")],
      texts: [],
      sessions: [],
      settings: { fontFamily: "serif", fontSize: 28 },
    };
    const newer: SyncSnapshot = {
      v: 1,
      updatedAt: 20,
      words: [word("狗", 20, "known")],
      texts: [],
      sessions: [],
      settings: { fontFamily: "sans", fontSize: 22 },
    };
    const merged = mergeSnapshots(older, newer);
    expect(preferSnapshot(older, newer)).toBe(newer);
    expect(merged.settings?.fontFamily).toBe("sans");
    expect(merged.words.map((w) => w.hanzi).sort()).toEqual(["狗", "猫"]);
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
      settings: { fontFamily: "serif", fontSize: 28, theme: "paper" },
    });
    expect(snapshotBytes(packed)).toBeGreaterThan(20);
  });
});
