import { describe, expect, it } from "vitest";
import { gutendexUrl, parseGutendex, pickPlainTextUrl, trimGutenbergText } from "./gutenberg";

describe("gutenberg", () => {
  it("builds a zh Gutendex URL", () => {
    expect(gutendexUrl()).toContain("languages=zh");
    expect(gutendexUrl({ search: "鲁迅" })).toContain("search=");
  });

  it("parses Gutendex results into stubs", () => {
    const cards = parseGutendex({
      results: [
        {
          id: 25579,
          title: "呐喊",
          authors: [{ name: "鲁迅" }],
          formats: {
            "text/plain; charset=utf-8": "https://www.gutenberg.org/files/25579/25579-0.txt",
            "image/jpeg": "https://www.gutenberg.org/cache/epub/25579/pg25579.cover.medium.jpg",
          },
        },
      ],
    });
    expect(cards[0].id).toBe("gb-25579");
    expect(cards[0].kind).toBe("gutenberg");
    expect(cards[0].gutenbergId).toBe(25579);
    expect(cards[0].body).toBe("");
  });

  it("picks a non-zip plain text URL", () => {
    expect(
      pickPlainTextUrl({
        "application/zip": "https://x/a.zip",
        "text/plain; charset=utf-8": "https://x/a.txt",
      }),
    ).toBe("https://x/a.txt");
  });

  it("trims Gutenberg boilerplate and caps length", () => {
    const raw = `*** START OF THE PROJECT GUTENBERG EBOOK X ***\n\n${"字".repeat(200)}\n\n*** END OF THE PROJECT GUTENBERG EBOOK X ***`;
    const out = trimGutenbergText(raw);
    expect(out.includes("START")).toBe(false);
    expect(out.includes("END OF")).toBe(false);
    expect(out.length).toBeGreaterThan(50);
  });

  it("keeps a scoring preview to the first few thousand characters", () => {
    const raw = `*** START OF THE PROJECT GUTENBERG EBOOK X ***\n\n${"字".repeat(20000)}\n\n*** END OF THE PROJECT GUTENBERG EBOOK X ***`;
    const out = trimGutenbergText(raw, 8000);
    expect(out.length).toBeLessThan(8500);
    expect(out.includes("START")).toBe(false);
  });
});
