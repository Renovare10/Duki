# Duki Library v2 — audit and content plan (Phase 1)

_Branch `library-v2`, written Oct 7, 2026. This file lives in `docs/` and nothing in `src/` imports it, so it never ships in the bundle. The raw audit numbers are in `docs/library-audit.json`. To regenerate them, run `node scripts/library-audit.mjs --json docs/library-audit.json`._

## 1. Audit: what the library holds today (main @ c6dfe46)

### Inventory

| Kind | Count | Where the body lives |
|---|---|---|
| Owned graded / children / story / science / history / article / novel texts | 107 (27 / 21 / 13 / 27 / 6 / 5 / 8) | In the JS bundle (`src/data/samples.ts`, `catalog.ts`, wiki rewrites) |
| Wikipedia catalog entries | 297 | Fetched live from zh.wikipedia when opened (`body: ""` until then) |
| Wikisource catalog entries | 74 | Fetched live from zh.wikisource when opened |
| **Total catalog ids** | **478** | All 478 ids are frozen in `src/lib/__fixtures__/catalog-ids-c6dfe46.json`, and a test fails if any of them disappears |

**Owned texts are all short.** They hold 11,908 Han characters in total. A text runs from 18 to 452 characters, with a median of 97. Only 6 go over 300 characters, and none goes over 1,000. The longest reading experience was the 8-chapter 旧灯 serial, and each of its chapters is short.

**Vocabulary.** The owned texts use 1,223 distinct words. Here is how much of each HSK level's word list appears somewhere in them:

| HSK | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| Words seen | 133/150 | 109/147 | 154/298 | 101/598 | 86/1300 | 23/2500 |

Below HSK 3 the owned texts cover the word lists well. From HSK 4 up they cover almost nothing.

### How levels are computed (new: `src/lib/difficulty.ts`)

1. Segment the text with the app's own `segment()` and glossary, then keep the Han word tokens.
2. Look up each token with `makeHskLookup`. It splits the token into HSK words with a DP. A character that is not itself an HSK word gets (lowest HSK level of any word containing it) + 1. Anything above 6 counts as off-list.
3. Compute coverage_k, the share of tokens at HSK ≤ k.
4. Pick the level:
   - **L1–L6**: the first k with coverage_k ≥ 95%. This is the "comfortable reading" threshold from the extensive-reading literature.
   - **L7** if coverage_6 ≥ 90%; **L8** if ≥ 85%; **L9** if ≥ 80%; otherwise **L10**.
5. A fractional score (for example 4.37) orders texts within a level.
6. Bands:

   | Band | Levels |
   |---|---|
   | Beginner | L1–2 |
   | Elementary | L3–4 |
   | Intermediate | L5–6 |
   | Advanced | L7–8 |
   | Native | L9–10 |

7. Reading time is Han characters ÷ a pace of 90 / 120 / 150 / 180 characters per minute, by band.
8. Owned-text levels are precomputed into `src/data/text-meta.ts` (`[level, score×100, chars]`; run `scripts/build-text-meta.mjs`). A unit test fails if any owned text's body changes without that file being regenerated.
9. Live Wikipedia pages are labelled "Native" and Wikisource pages "Classical", without computing a level, because their bodies are not in the bundle.
10. **Personal "you know ~X%"** uses the reader's own word records:
    - texts: the token share already marked known, the same score the app already used
    - works: a 4,000-word frequency profile per work, with the tail counted as unknown so the estimate stays conservative
    - It appears only once the reader has at least 20 known words.

### Level distribution of the 107 owned texts

| Level | L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 | L10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Texts | 1 | 10 | 21 | 30 | 32 | 6 | 5 | 0 | 1 | 1 |
| Median chars | 38 | 56 | 91 | 99 | 101 | 143 | 100 | — | 36 | 18 |

### Difficulty-curve gaps

There are two ways to measure each step up the ladder:

- **A, step jump**: the median share of unknown tokens for a reader who knows HSK ≤ (level − 1).
- **B, novelty**: the share of tokens never seen earlier when reading the library from easiest to hardest.

| Step | →L2 | →L3 | →L4 | →L5 | →L6 | →L7 | →L9 | →L10 |
|---|---|---|---|---|---|---|---|---|
| A: unknown share at the previous level | 10.2% | **21.1%** | 9.7% | 7.9% | 6.6% | 7.0% | 17.6% | 43.8% |
| B: novelty | 27.7% | 25.4% | 15.6% | 12.4% | 13.8% | 14.5% | 67.6% | 75% |

What the numbers show:

- **L2→L3 is a cliff.** A reader who has finished L2 meets one unknown word in five.
- **L1 has a single text, and L6–L10 are almost empty** (6 / 5 / 0 / 1 / 1 texts). Between the intermediate texts and native Wikipedia there was nothing to bridge the gap.
- **Length doesn't progress at all.** Every level's median is about 100 characters, so the library never trains stamina.

### Topic gaps (owned texts, tagged in `src/data/topics.ts`)

- Strong topics: nature (25 texts), science (18), daily-life, family and food.
- Missing or thin: work (1), biography (1), arts (1), sports (1), letters (1), faith (0) and encyclopedia-style explainers (0). Beginner texts exist only for everyday topics. History, biography, culture and literature start at intermediate. The advanced band holds only 5 texts.

### Storage and loading (before v2)

- **IndexedDB `duki` v6** has five stores:
  - `words`, keyed by hanzi (SM-2 fields)
  - `texts`, keyed by id (catalog rows, plus `readAt`, `bookmark` and pasted bodies)
  - `sessions`
  - `settings`
  - `events`
- Catalog bodies ship inside the JS bundle. Wiki and Wikisource bodies are fetched and cached in the row.
- Sync merges snapshots per record.
- **v2 makes no schema change.** Section 3 has the details.

### UI (before v2)

- The home screen is a hero, then search, then three rows of filter pills (fit / read-status / category), then a "sweet-spot" panel, then shelves ("Recommended", "Continue", categories).
- Cards show category, read status, an Easy/Harder tag and an "x% unknown" figure.
- No card showed level, length or reading time, and there was no topic taxonomy and no real book navigation (series were collapsed into simple "books").

---

## 2. Content plan

### Taxonomy: 28 topics in four families

Every text carries 1–3 topics. The app keeps the ids in `src/data/topics.ts`, and each one gets a chip on the home screen.

- **Everyday:** daily-life, family, food, school, shopping, work, travel, health, feelings, weather
- **Knowledge:** nature, science, history, biography, culture, arts, sports, news, how-to, encyclopedia
- **Story and voice:** humor, folk-tales, adventure, letters, literature, poetry
- **Heritage:** faith, classics

The browse facets are topic × band × length (short < 300 characters, medium ≤ 1,500, long > 1,500) × personal fit (Comfortable / Stretch / Challenge, from known-%) × status.

### Level ladder: targets for each step

The rule is that a reader who has finished level N−1 should meet **at most 5% unknown tokens at L1–L4 and at most 8% at L5–L8**, measured with metric A. L9–L10 are real-world texts and are allowed to be steep.

| Level | Band | Coverage rule | Target new-word share (A) | Target texts (standalone) | Target length (median chars) | Now |
|---|---|---|---|---|---|---|
| L1 | Beginner | HSK1 ≥95% | n/a (entry) | 30 | 40–80 | 1 |
| L2 | Beginner | HSK≤2 ≥95% | ≤5% | 40 | 80–150 | 10 |
| L3 | Elementary | HSK≤3 ≥95% | ≤5% (now 21%) | 45 | 150–300 | 21 |
| L4 | Elementary | HSK≤4 ≥95% | ≤5% | 45 | 200–500 | 30 |
| L5 | Intermediate | HSK≤5 ≥95% | ≤8% | 45 | 400–1,000 | 32 |
| L6 | Intermediate | HSK≤6 ≥95% | ≤8% | 40 | 600–1,500 | 6 |
| L7 | Advanced | HSK≤6 ≥90% | ≤8% | 30 + PD works | 1,000–3,000 | 5 (+ Lu Xun, Zhu Ziqing, the Gospels) |
| L8 | Advanced | HSK≤6 ≥85% | ≤8% | 20 + PD works | 1,500+ | 0 (+ most of the Bible) |
| L9 | Native | HSK≤6 ≥80% | steep | PD works and Wikipedia | any | 1 (+ 297 Wikipedia) |
| L10 | Native | below 80% | steep | Classical / Wikisource | any | 1 (+ 74 Wikisource) |

The 21% at L3 means L2→L3 needs bridge texts at fractional scores 2.6–3.2: HSK-3 vocabulary introduced 3–5 words per text and recycled.

### Target counts per topic × band, and the gap list

Targets per family, per band (Beginner / Elementary / Intermediate / Advanced / Native):

| Family | Target texts per topic |
|---|---|
| Everyday | 4 / 4 / 3 / 2 / 0 |
| Knowledge | 1 / 3 / 3 / 2 / 0 |
| Story | 2 / 3 / 3 / 2 / 1 |
| Faith and classics | 0 / 1 / 1 / 1 / 0 |

These targets count **short standalone texts**. Books, and the native band in general, are covered by the PD works plus Wikipedia/Wikisource.

**How to read the table:** each cell is `gap (have/target)`. A text usually carries 2 topics, so the 171 topic slots work out to roughly **100–115 new texts**. Within each band, split the count evenly between its two levels.

L10 1 median chars 18
| Topic | Beginner L1–2 | Elementary L3–4 | Intermediate L5–6 | Advanced L7–8 | Native L9–10 | Total gap |
|---|---|---|---|---|---|---|
| daily-life | 0 (5/4) | 0 (8/4) | 1 (2/3) | 2 (0/2) | 0 (0/0) | 3 |
| family | 1 (3/4) | 0 (7/4) | 0 (3/3) | 2 (0/2) | 0 (0/0) | 3 |
| food | 1 (3/4) | 0 (8/4) | 1 (2/3) | 2 (0/2) | 0 (0/0) | 4 |
| school | 2 (2/4) | 0 (6/4) | 1 (2/3) | 2 (0/2) | 0 (1/0) | 5 |
| shopping | 3 (1/4) | 3 (1/4) | 1 (2/3) | 1 (1/2) | 0 (0/0) | 8 |
| work | 4 (0/4) | 4 (0/4) | 2 (1/3) | 2 (0/2) | 0 (0/0) | 12 |
| travel | 4 (0/4) | 0 (6/4) | 0 (3/3) | 2 (0/2) | 0 (0/0) | 6 |
| health | 3 (1/4) | 2 (2/4) | 3 (0/3) | 2 (0/2) | 0 (0/0) | 10 |
| feelings | 3 (1/4) | 0 (4/4) | 0 (3/3) | 1 (1/2) | 0 (0/0) | 4 |
| nature | 0 (1/1) | 0 (14/3) | 0 (7/3) | 0 (2/2) | 0 (1/0) | 0 |
| weather | 3 (1/4) | 1 (3/4) | 0 (7/3) | 2 (0/2) | 0 (0/0) | 6 |
| science | 1 (0/1) | 0 (7/3) | 0 (10/3) | 1 (1/2) | 0 (0/0) | 2 |
| history | 1 (0/1) | 3 (0/3) | 0 (5/3) | 1 (1/2) | 0 (0/0) | 5 |
| biography | 1 (0/1) | 3 (0/3) | 2 (1/3) | 2 (0/2) | 0 (0/0) | 8 |
| culture | 1 (0/1) | 2 (1/3) | 2 (1/3) | 1 (1/2) | 0 (0/0) | 6 |
| arts | 1 (0/1) | 3 (0/3) | 2 (1/3) | 2 (0/2) | 0 (0/0) | 8 |
| sports | 1 (0/1) | 3 (0/3) | 2 (1/3) | 2 (0/2) | 0 (0/0) | 8 |
| news | 1 (0/1) | 0 (3/3) | 1 (2/3) | 2 (0/2) | 0 (0/0) | 4 |
| how-to | 1 (0/1) | 1 (2/3) | 2 (1/3) | 2 (0/2) | 0 (0/0) | 6 |
| humor | 1 (1/2) | 1 (2/3) | 2 (1/3) | 2 (0/2) | 1 (0/1) | 7 |
| folk-tales | 2 (0/2) | 2 (1/3) | 2 (1/3) | 2 (0/2) | 1 (0/1) | 9 |
| adventure | 2 (0/2) | 2 (1/3) | 0 (6/3) | 2 (0/2) | 1 (0/1) | 7 |
| letters | 2 (0/2) | 2 (1/3) | 3 (0/3) | 2 (0/2) | 1 (0/1) | 10 |
| poetry | 2 (0/2) | 2 (1/3) | 3 (0/3) | 1 (1/2) | 0 (1/1) | 8 |
| literature | 2 (0/2) | 3 (0/3) | 0 (8/3) | 2 (0/2) | 1 (0/1) | 8 |
| faith | 0 (0/0) | 1 (0/1) | 1 (0/1) | 1 (0/1) | 0 (0/0) | 3 |
| encyclopedia | 1 (0/1) | 3 (0/3) | 3 (0/3) | 2 (0/2) | 0 (0/0) | 9 |
| classics | 0 (0/0) | 1 (0/1) | 1 (0/1) | 0 (1/1) | 0 (2/0) | 2 |
| **Total slots** | 44 | 42 | 35 | 45 | 5 | 171 |

**What to write first:**

1. Beginner work, travel, shopping, health, weather and feelings (19 slots).
2. The L2→L3 bridge (about 15 texts, spread over the everyday topics).
3. Knowledge topics at elementary: history, biography, arts, sports and encyclopedia (15 slots).
4. Advanced everyday and knowledge texts (45 slots) as **medium-length** pieces of 1,000–3,000 characters, to build stamina before the PD books.
5. Letters, folk tales and poetry across all bands.

**Length gap.** At least 30% of new texts at L5+ should be medium (300–1,500 characters), and each band needs at least 2 serialized books (5–10 chapters) built with the existing series mechanism.

### Where the PD works sit on the ladder

| Work | Computed level | Range (chapter levels) | Reading time | Role |
|---|---|---|---|---|
| 和合本 Bible (CUV) | L8 (score 8.23) | L7–L8 for the middle 50% of chapters (interquartile range) (extremes L6–L10) | ≈ 85 h | Long-form advanced reading. Almost the whole New Testament is L7 (the Gospels, Acts and the Epistles; 2–3 John are L6). Most of the Old Testament is L8. Leviticus and 1–2 Chronicles / Ezra, with their lists of names, are L9. Job, Ecclesiastes, Song of Songs and Daniel are L7. The suggested entry point is the Gospel of Mark or John. |
| 吶喊 (Lu Xun) | L7 (7.36) | L7–L8 | ≈ 5.5 h | First "real literature". Start with 一件小事 and 故鄉. |
| 朝花夕拾 (Lu Xun) | L7 (7.43) | L6–L7 | ≈ 3.2 h | Memoir. 從百草園到三味書屋 is the classic entry text. |
| 朱自清散文 (4 essays) | L7 (7.81) | L7–L8 | ≈ 45 min | Short modern essays: 匆匆, 背影, 荷塘月色 and 秦淮河. |

Nothing PD sits below L6. Early-20th-century vernacular (白话) already uses literary vocabulary, so **the beginner through intermediate bands have to be written new**. PD gives the top of the ladder its depth.

### Policy for AI-generated and human-written content

- **Human-written text comes first** wherever it can be legally hosted: PD works, CC-licensed texts with attribution, and texts commissioned or written by the team.
- **AI drafting is acceptable for the graded bulk at L1–L6**, under these conditions:
  1. Generate against the target level and topic, then **gate the draft with `difficulty.ts`**. Reject any draft whose computed level is not the target or whose metric A exceeds the step target.
  2. A fluent human reviews every text for naturalness, factual accuracy and cultural accuracy before it ships.
  3. AI texts carry `source: "Duki original"`, and the plan records which were AI-drafted, without labelling them as the product of a human author.
  4. No AI imitations of real authors. No invented "facts" in history, biography or news topics, which have to be checked against a source.
- **L7+ should be mostly human-written** (PD works and real articles). AI goes at most into bridge texts there.
- **Phase 1 generated no new AI stories**, as instructed.

---

## 3. What v2 built (Phase 1)

- **Difficulty on every card**:
  - a level badge (L1–L10, colour by band)
  - "~X% known" once the reader has at least 20 known words
  - length in characters and reading time (for example "1.2k chars · 8 min")
  - works show a level range (for example "L7–8")
- **Browse**:
  - search across titles, blurbs and English
  - topic chips with counts
  - Level / Length / "For me" (Comfortable / Stretch / Challenge) / Status pickers
  - Clear
  - a results grid sorted easiest-first
- **Home rows**:
  - Continue reading (half-read texts, series and works, most recently opened first)
  - Books
  - Recommended
  - one row per band, with an empty-state note where there is nothing yet
  - Wikipedia
  - Wikisource
  - Yours
- **Books (`#/work/<id>`)**:
  - cover and blurb
  - level strip
  - a Start / Continue / Next button
  - chapter progress (x / y chapters read)
  - a collapsible **About this text** panel (source, license basis, notes)
  - a TOC grouped by part (旧约 / 新约), with each book expanding into a grid of chapter chips marked read / started / next
- **Reader for work chapters** (`#/read/w:<work>:<key>`):
  - Bible verse numbers rendered as subtle superscripts (non-tappable)
  - a chapter footer: ← previous / Contents / **Done · next: 创世记 2 →**
  - the next chapter is prefetched
- **Lazy chapters**:
  - `public/works/<id>/toc.json` (the TOC with per-chapter level and character counts)
  - `profile.json` (the frequency profile for known-%)
  - one small JSON per chapter, fetched on demand and cached in memory
  - Nothing from the works is in the JS bundle except about 1 KB of stats.
- **Pipeline**:
  - `scripts/build-works.mjs` downloads (with a cache), parses, levels and writes the works. Use `--offline` to build from the cache.
  - `scripts/library-audit.mjs` produces the audit.
  - `scripts/build-text-meta.mjs` builds `text-meta.ts`.

### Data safety: how progress is stored without touching user data

- **No IndexedDB version bump and no new store.** The database stays at v6.
- Work-chapter progress uses ordinary `texts` rows with **new, namespaced ids** of the form `w:<workId>:<chapterKey>` (for example `w:bible-cuv:GEN.1`). They are created only when the reader opens a chapter. The body is always stored as `""` and comes from `public/works`, so a row costs about 200 bytes.
- **Existing ids are never renamed.** The 478 catalog ids from main are frozen in a fixture test.
- One optional field is new: `openedAt`, which orders the Continue row.
  - normalize keeps it
  - sync takes the max of the two values and leaves it absent when both lack it
  - backups keep work rows that have no body
- **Old clients:**
  - An old build reading a v2 database shows `w:` rows as plain stub cards. It loses no data.
  - It drops `openedAt` from catalog rows when it normalizes them. That field is only an ordering hint, so nothing user-visible is lost.

---

## 4. Public-domain works: legal basis and sources

| Work | Status | US basis | China basis | Source (URL) |
|---|---|---|---|---|
| **Holy Bible, Chinese Union Version 和合本** (simplified, 新标点), 66 books / 1,189 chapters | **Imported** | Published 1919, before 1931, so in the public domain in the US | Translation committee publication of 1919. Collective / institutional work more than 50 years after publication, so PD under PRC Copyright Law art. 23 | eBible.org "cmn-cu89s", marked Public Domain: https://ebible.org/find/details.php?id=cmn-cu89s (USFM download) |
| **吶喊 Nahan** (Lu Xun, 1923), 自序 + 14 stories | **Imported** | Published 1923 (before 1931) | Lu Xun died 1936, so PD since 1 Jan 1987 (life + 50) | Wikisource: https://zh.wikisource.org/wiki/%E5%90%B6%E5%96%8A |
| **朝花夕拾** (Lu Xun, essays 1926, book 1928), 10 essays + 小引 / 後記 | **Imported** | Published 1928 (before 1931) | PD since 1987 | Wikisource: https://zh.wikisource.org/wiki/%E6%9C%9D%E8%8A%B1%E5%A4%95%E6%8B%BE |
| **朱自清散文**: 匆匆 (1922), 槳聲燈影裏的秦淮河 (1924), 背影 (1925), 荷塘月色 (1927) | **Imported** | All published before 1931 | Zhu Ziqing died 1948, so PD since 1999 | Wikisource Author:朱自清: https://zh.wikisource.org/wiki/Author:%E6%9C%B1%E8%87%AA%E6%B8%85 |

**Why CUV rather than something closer to the NASB.** The NASB is a formal-equivalence ("word-for-word") translation. Of the Chinese Bibles that can be legally hosted, the 1919 和合本 is the most literal and formal. It was translated from the Revised Version / Greek and Hebrew on a literal principle, and it is still the standard Protestant Chinese Bible. The modern formal translations (和合本修订版 2010, 新译本, 中文标准译本 CSB, 新汉语译本) are all under copyright, so they can't be hosted without a license.

**Caveat on the CUV text.** eBible's text is the 1988/89 "新标点和合本" (new punctuation). The Hong Kong Bible Society / UBS claim copyright in that edition's punctuation and paragraphing. Under US law, mechanical punctuation edits of a PD text are generally not copyrightable, and eBible distributes the text as Public Domain.

If the team wants zero risk, there is a fallback: swap in the original 1919 punctuation from Wikisource (`聖經 (和合本)`), converted to simplified with OpenCC. The importer is set up so this change is limited to the source step.

**Editorial handling.** The app shows the text as it appears in the source, with these changes:

- section headings, footnotes and cross-references are dropped
- verse numbers are shown as superscripts
- Lu Xun's old variant characters 彿/賸/矇/餧 are normalized to 佛/剩/蒙/喂 so the glossary can look them up
- Wikisource editor notes are stripped

The Wikisource pages come through the zh-hans display variant, which the importer requests. The in-app "About this text" panel records the same basis.

### Candidates, not imported (status uncertain or protected)

| Candidate | Why left out |
|---|---|
| **阿丽思漫游奇境记** (Alice, tr. Zhao Yuanren 1922) | Published 1922, so PD in the US. Zhao Yuanren died in 1982, so the translation **is protected in mainland China and Taiwan until 2032 (through 31 Dec)**. I also found **no clean PD digital edition**: it isn't on Project Gutenberg or Wikisource, and the copies online are volunteer transcriptions with unclear terms. Revisit after 2032, or license a scan. The 吶喊 screens stand in for it in the screenshots. |
| 稻草人 (Ye Shengtao, 1923) | PD in the US (pre-1931), but Ye died in 1988, so it is protected in China until 2038. |
| 春 (Zhu Ziqing, 1933) | PD in China, but published after 1930, so possibly still protected in the US. Excluded. |
| 呼兰河传 (Xiao Hong, 1940) | PD in China (she died in 1942), but 1940 publication needs a US renewal check. |
| 西游记 / 红楼梦 (full) | PD, but classical/early-vernacular, so L10. Good candidates for a later "Classics" shelf through Wikisource (already reachable live). |
| Old Chinese translations of Grimm / Andersen / Aesop | The translators and their death dates are often unknown. Each edition needs research first. |
| Xu Dishan 落花生 (1922) and similar May-Fourth essays | Likely PD in both countries (Xu died in 1941, publication before 1931). Verify each source page, then add them as short L6–L7 essays. Good next imports. |

---

## 5. Size impact

| Item | Raw | Notes |
|---|---|---|
| `public/works/` total | 4.02 MB in 1,236 files (≈1.66 MB gzipped as a tarball) | Static files served on demand. Nothing is precached. |
| Bible | 3.55 MB in 1,191 files: 1,189 chapters + `toc.json` 96 KB + `profile.json` 46 KB | About 3 KB per chapter fetch |
| 吶喊 / 朝花夕拾 / 朱自清 | 259 KB / 168 KB / 46 KB | |
| JS bundle | 407.7 → 441.2 KB (+33.5 KB raw, **+10.8 KB gzip**: 132.0 → 142.8 KB) | Mostly `text-meta`, topics and the new UI. Work bodies are not in the bundle. |
| CSS | 29.9 → 36.4 KB (+6.5 KB raw, +1.3 KB gzip) | |
| Opening a Bible chapter | toc 96 KB once + about 3 KB per chapter (+ profile 46 KB if known-% is shown) | |
| User storage | about 200 bytes per opened chapter row (no body) | |
