/** English-only USFM conversion. Never remove the spaces between English words. */
export function parseEnglishUsfmBook(src) {
  const code = /\\id\s+(\w+)/.exec(src)?.[1];
  const name = (/\\h\s+([^\r\n]+)/.exec(src)?.[1] || code)?.trim();
  const supers = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  let text = src.replace(/\r/g, "")
    .replace(/\\f\s[\s\S]*?\\f\*/g, "")
    .replace(/\\x\s[\s\S]*?\\x\*/g, "")
    .replace(/\\\+?w\s+([^|\\]*)(?:\|[^\\]*)?\\\+?w\*/g, "$1")
    .replace(/\\(?:wj|add|nd|pn|qs|bk)\*/g, "")
    .replace(/\\(?:wj|add|nd|pn|qs|bk)[ \t]+/g, "");
  const chapters = [];
  let chapter = null;
  let paragraphs = [];
  let lines = [];
  const paragraph = () => {
    if (lines.length) paragraphs.push(lines.join("\n"));
    lines = [];
  };
  const finish = () => {
    paragraph();
    if (chapter) chapters.push({ n: chapter, body: paragraphs.join("\n\n") });
    paragraphs = [];
  };
  for (const raw of text.split("\n")) {
    const m = /^\\(\w+)\s*(.*)$/.exec(raw.trim());
    if (!m) {
      if (chapter && raw.trim()) lines.push(raw.trim());
      continue;
    }
    const [, tag, rest] = m;
    if (tag === "c") {
      finish();
      chapter = Number(rest.trim());
    } else if (chapter && tag === "v") {
      const verse = /^(\d+)(?:-\d+)?(?:\s+(.*))?$/.exec(rest);
      if (!verse) throw new Error(`Invalid verse in ${code} ${chapter}: ${rest}`);
      lines.push((verse[1].replace(/\d/g, (d) => supers[Number(d)]) + " " + (verse[2] ?? "").trim()).trim());
    } else if (chapter && /^(p|m|b|d|q\d*|li\d*|pi\d*|mi|nb)$/.test(tag)) {
      // Poetry and list lines retain line breaks; prose/psalm superscriptions start paragraphs.
      if (!/^(q|li)/.test(tag)) paragraph();
      if (rest.trim()) lines.push(rest.trim());
    }
    // Book/section headings, speaker labels, chapter labels and other editorial apparatus are omitted.
  }
  finish();
  for (const ch of chapters) {
    if (!ch.body || /[\\|]|strong=/.test(ch.body)) throw new Error(`Unconverted USFM in ${code} ${ch.n}`);
  }
  return { code, name, chapters };
}
