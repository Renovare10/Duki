import { describe, expect, it } from "vitest";
import { parseShareHash, shareHash, shareUrl } from "./share";

describe("shareHash", () => {
  it("builds wiki, gutenberg, wikisource, and local hashes", () => {
    expect(
      shareHash({ id: "wiki-猫", kind: "wiki", wikiTitle: "猫" }),
    ).toBe(`#/r/wiki/${encodeURIComponent("猫")}`);
    expect(
      shareHash({ id: "gb-25579", kind: "gutenberg", gutenbergId: 25579 }),
    ).toBe("#/r/gutenberg/25579");
    expect(
      shareHash({ id: "ws-论语/学而", kind: "wikisource", wsTitle: "论语/学而" }),
    ).toBe(`#/r/wikisource/${encodeURIComponent("论语/学而")}`);
    expect(shareHash({ id: "sample-home", kind: "sample" })).toBe("#/r/local/sample-home");
  });

  it("does not put lexicon in the URL", () => {
    const url = shareUrl("https://read.example", {
      id: "sample-home",
      kind: "sample",
    });
    expect(url).toBe("https://read.example/#/r/local/sample-home");
    expect(url.includes("known")).toBe(false);
    expect(url.includes("bookmark")).toBe(false);
  });
});

describe("parseShareHash", () => {
  it("reads encoded catalog links", () => {
    expect(parseShareHash(`#/r/wiki/${encodeURIComponent("猫")}`)).toEqual({
      kind: "wiki",
      key: "猫",
    });
    expect(parseShareHash("#/r/gutenberg/25579")).toEqual({
      kind: "gutenberg",
      key: "25579",
    });
    expect(parseShareHash(`#/r/wikisource/${encodeURIComponent("论语/学而")}`)).toEqual({
      kind: "wikisource",
      key: "论语/学而",
    });
    expect(parseShareHash("#/r/local/sample-home")).toEqual({
      kind: "local",
      key: "sample-home",
    });
  });

  it("returns null for unrelated hashes", () => {
    expect(parseShareHash("#/")).toBeNull();
    expect(parseShareHash("#/read/sample-home")).toBeNull();
  });
});
