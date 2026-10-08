# `src/data/library/` — built-in texts (canonical format)

Every new built-in text goes in this folder as a **pack file**. The app turns each
entry into an ordinary catalog row: it is scored, levelled, recommended, and can be
tapped/marked like every other text. The type lives in `src/lib/library-entry.ts`
(`LibraryEntry`, `LibraryPack`) — that file is the source of truth; this README
describes it.

## Files

```
src/data/library/
  README.md            ← this file
  index.ts             ← manifest: imports every pack and lists it in PACKS
  <pack-id>.ts         ← one pack per file, e.g. l1-daily-life.ts, l5-history.ts
```

A pack file:

```ts
import type { LibraryPack } from "../../lib/library-entry";

const pack: LibraryPack = {
  id: "l3-food",
  texts: [
    {
      id: "lib-l3-food-dumplings",
      title: "包饺子",
      blurb: "A family folds dumplings the night before New Year.",
      topics: ["food", "family", "culture"],
      level: 3,
      body: `除夕前一天，奶奶叫我们一起包饺子。

她先和面，我和妹妹洗白菜……`,
      aiGenerated: true,
      category: "story",
      license: "Original (Duki)",
    },
  ],
};

export default pack;
```

`index.ts` (the manifest) then gets one import and one list item per pack:

```ts
import type { LibraryPack } from "../../lib/library-entry";
import l3Food from "./l3-food";

export const PACKS: LibraryPack[] = [l3Food];
```

## Fields (`LibraryEntry`)

| Field | Required | Rules |
|---|---|---|
| `id` | yes | **Permanent.** `lib-` + lowercase `a-z0-9` words joined by `-` (regex `^lib-[a-z0-9]+(?:-[a-z0-9]+)*$`). Unique across the whole catalog. Never renamed or reused once shipped — user progress is keyed by it. |
| `title` | yes | Chinese title, Simplified. |
| `blurb` | yes | One short English line for the card (≤ 90 chars). |
| `topics` | yes | 1–3 ids from `src/data/topics.ts` `TOPICS` (same list as docs/library-v2-plan.md §2). First = main topic. Use `classics` only for classical Chinese. |
| `level` | yes | Target level 1–10 from the plan's ladder. The app **re-measures** the level from the body at build time (`scripts/build-text-meta.mjs`); aim for the measured level to match. |
| `body` | yes | Simplified Chinese only. Full-width punctuation (，。！？：；“”‘’《》). Paragraphs separated by one blank line. No pinyin, no English, no HTML/Markdown, no headings inside the body. |
| `aiGenerated` | yes | `true` if drafted by an AI model (even if edited afterwards), `false` if human-written. |
| `category` | no | Card category: `"graded" \| "children" \| "story" \| "science" \| "history" \| "article" \| "novel"`. Default `"story"`. |
| `author` | no | Real author (human-written or public-domain texts). Leave empty for AI drafts. |
| `source`, `sourceUrl` | no | Where a human-written / public-domain text came from. |
| `license` | no | Legal basis, e.g. `"Original (Duki)"`, `"Public domain (author d. 1936)"`, `"CC BY-SA 4.0"`. |
| `series` | no | `{ id, title, part }` for multi-part serials; all parts share `id` and `title`, `part` counts from 1. The library shows them as one book. |

## Level targets (from docs/library-v2-plan.md)

| Level | Coverage rule (HSK words) | Target length (Han chars) |
|---|---|---|
| L1 | HSK1 ≥ 95% | 40–80 |
| L2 | HSK≤2 ≥ 95% | 80–150 |
| L3 | HSK≤3 ≥ 95% | 150–300 |
| L4 | HSK≤4 ≥ 95% | 200–500 |
| L5 | HSK≤5 ≥ 95% | 400–1,000 |
| L6 | HSK≤6 ≥ 95% | 600–1,500 |
| L7 | HSK≤6 ≥ 90% | 1,000–3,000 |
| L8 | HSK≤6 ≥ 85% | 1,500+ |

Measure while writing: `node scripts/build-text-meta.mjs` prints every text's measured
level after the pack is listed in `index.ts`.

## Checks

`npm test` validates every pack (`src/lib/library-content.test.ts`): id format and
uniqueness (also against all existing catalog ids), topics, level range, Chinese body,
`aiGenerated` flag, series fields.
