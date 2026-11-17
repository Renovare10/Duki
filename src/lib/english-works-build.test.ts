import { describe, expect, it } from "vitest";
import { parseEnglishUsfmBook as parseUsfmBook } from "../../scripts/lib/english-usfm.mjs";

const source = String.raw`\id GEN World English Bible
\h Genesis
\c 1
\p
\v 1 \w In|strong="H1"\w* the beginning, God created the heavens and the earth.\f + \ft Not body text.\f*
\v 2 The earth was formless and empty.\x + \xt See elsewhere.\x*
\p
\v 3 \wj God said, “Let there be light.”\wj*
\q1 and there was light.
\q2 God saw that it was good.
\c 2
\p
\v 1 The heavens and the earth were finished.
`;

describe("English USFM import", () => {
  it("preserves a space after closing inline styles, and keeps psalm superscriptions", () => {
    const book = parseUsfmBook(String.raw`\id PSA
\h Psalms
\c 1
\d A Psalm.
\p
\v 1 \wj Blessed\wj* is the man. \qs Selah.\qs*
\v 2 His delight is in the law.`);
    expect(book.chapters[0].body).toBe("A Psalm.\n\n¹ Blessed is the man. Selah.\n² His delight is in the law.");
  });

  it("retains a verse number when the edition has only a textual-variant footnote", () => {
    const book = parseUsfmBook(String.raw`\id LUK
\h Luke
\c 17
\p
\v 35 One will be taken.
\v 36 \f + \ft Some manuscripts add this verse.\f*
\v 37 They answered him.`);
    expect(book.chapters[0].body).toBe("³⁵ One will be taken.\n³⁶\n³⁷ They answered him.");
  });

  it("preserves English words, verse spacing, paragraphs and poetry without apparatus", () => {
    const book = parseUsfmBook(source);
    expect(book.code).toBe("GEN");
    expect(book.name).toBe("Genesis");
    expect(book.chapters).toEqual([
      { n: 1, body: "¹ In the beginning, God created the heavens and the earth.\n² The earth was formless and empty.\n\n³ God said, “Let there be light.”\nand there was light.\nGod saw that it was good." },
      { n: 2, body: "¹ The heavens and the earth were finished." },
    ]);
  });
});
