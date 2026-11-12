# English long works: first edition

## Included work

- Permanent work id: `en-bible-web`; counterpart of Mandarin `bible-cuv`.
- **World English Bible, Protestant edition (`engwebp`), 2020 stable text edition.** This is the complete 66-book Bible, not an adaptation: 39 Old Testament books, 27 New Testament books, 1,189 chapters.
- Source edition and public-domain dedication: <https://ebible.org/engwebp/copyright.htm>.
- Source USFM archive: <https://ebible.org/Scriptures/engwebp_usfm.zip>.
- Retrieved 12 November 2026. eBible's edition page identifies source files dated 10 November 2026.
- Pinned archive SHA-256: `a155940bdba087cdbccb0f6737c036de9884bc5a3b8da2e82c2970d8ed26c1ba`.
- The translators explicitly dedicate the translation to the public domain. “World English Bible” is eBible.org's trademark; the scripture wording is preserved rather than rewritten under that name.

## Presentation and measurements

The importer removes book/section headings, speaker labels, notes, cross-references and Strong's annotations. It keeps the scripture wording, psalm superscriptions, paragraph/poetry breaks and verse numbers. Where a verse contains only a textual-variant footnote in this edition, its number remains without invented replacement text. The full source edition remains linked from About this text and the reader.

There are **757,242 readable words**, counted by the app's English `segment(..., "en")` word tokens (hyphenated forms split). English cards, contents, chapter labels and durations use words, never Han characters. The L9 placement is editorial for unabridged native English, not a Mandarin difficulty measurement; this is disclosed in About this text. Reading time uses the existing advanced English rate of 160 words/minute (about 79 hours for the whole work).

The 1,191 static JSON files total 4,462,257 bytes. Only registry metadata and aggregate statistics enter the JS bundle. The TOC loads when contents are opened; chapters load when opened, with at most the next chapter warmed as in Mandarin. A vocabulary profile loads only when personal estimates are enabled. No chapter body is saved to IndexedDB or sync: the existing `w:<workId>:<chapterKey>` progress rows carry `lang: "en"`, bookmarks and completion metadata only. English rows continue to be excluded from production Mandarin sync by the existing language boundary.

## Rebuild

Requires the existing Node dependencies, `curl` and `unzip` (available in Git Bash).

```bash
# In this worktree. Pin scratch vars to the active profile's native Windows path.
export TMPDIR='C:/Users/chadf/AppData/Local/hermes/profiles/penelope/cache/scratch'
export TEMP="$TMPDIR" TMP="$TMPDIR"
node scripts/build-en-works.mjs
# With node_modules/.cache/duki-works/engwebp_usfm.zip already cached:
node scripts/build-en-works.mjs --offline
```

Only `public/works/en-bible-web/` and `src/data/en-works.generated.ts` are written. The script verifies the pinned source hash **before** conversion/output; a changed upstream archive is rejected and requires an explicit edition review, not a silent refresh. Mandarin content, generated stats and `scripts/build-works.mjs` are untouched.

## Verification

Focused command:

```bash
npx vitest run src/App.test.ts src/lib/library.test.ts src/lib/works.test.ts src/lib/english-works.test.ts src/lib/english-works-build.test.ts
```

56 focused tests pass. The browser tests launch a managed local Vite server and isolated Playwright/Edge contexts, disable cloud sync and block off-origin traffic. They exercise the actual English Books entry, on-demand fetching, contents, English reader, completion, next chapter, bookmark persistence across reload, work Continue, home Continue, language isolation, and existing English series/Mandarin books and long works. Optional `DUKI_TEST_ARTIFACTS=<absolute directory>` saves English contents/reader screenshots.

A separate Python/zipfile source comparison verified the exact English word sequence in **all 1,189 chapters** and **all 31,103 verse markers** against the pinned archive after omitting the documented editorial apparatus. Unit tests also recount every chapter with the app segmenter, verify section/work totals and all chapter files, and cover inline-tag spacing, poetry and footnote-only verses.

Final checks: `npm test` passed the library validator and **417 tests across 45 files**. `npm run build` passed TypeScript and Vite; the existing large-chunk warning remains non-blocking. Production JS assets were checked separately for absence of WEB chapter text, with all static work JSON copied byte-for-byte to `dist/works/en-bible-web/`.

No push, deploy, live user data, gloss generation or second English work is part of this change.
