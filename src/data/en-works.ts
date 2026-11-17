/** Metadata only. English long-work bodies load from public/works on demand. */
import type { WorkMeta } from "../lib/works";

export const EN_WORKS: WorkMeta[] = [{
  id: "en-bible-web",
  lang: "en",
  title: "The Bible (World English Bible)",
  english: "World English Bible · Protestant edition",
  author: "World English Bible translators",
  year: "2020 stable text edition",
  blurb: "The complete Bible in modern English: 66 books, from Genesis to Revelation. Unabridged public-domain text.",
  category: "history",
  topics: ["faith", "history", "literature"],
  sectionNoun: "Book",
  source: "eBible.org · World English Bible, Protestant edition (engwebp), 2020 stable text edition",
  sourceUrl: "https://ebible.org/engwebp/copyright.htm",
  license: "Public domain. The World English Bible translators dedicated this translation to the public domain. “World English Bible” is a trademark of eBible.org.",
  notes: "Unabridged scripture text, not a Duki adaptation. Section headings, speaker labels, footnotes, cross-references and Strong’s annotations are omitted; psalm superscriptions and verse numbers are retained. L9 is an editorial native-English placement, not a measured Mandarin difficulty score. Imported from eBible’s 10 November 2026 archive; provenance and checksum are in docs/english-long-works.md.",
}];
