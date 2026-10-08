# Duki

A local-first **library of Mandarin stories**. Learning (word colors, taps, i+1) stays in the reader. Home is shelves, not a paste box.

## Home

Horizontal rows of covers: Continue, Just right, Because you read…, Stories, Children’s, Science, History, Graded, Articles, Novels, Featured, Your uploads.

Filters: **Just right** (default) · Easy · Harder · All levels · Already known, plus Unread/Read and category chips. Easy never includes 100% known texts. Suggestions never hero a finished-known sample.

**Add text** is a header side door for Chinese you own.

## Reader

Unknown is red, shaky is yellow, known is plain. Hover pinyin only on unknown/shaky. `1` `2` `3` mark Don’t know / Barely / Okay. Counts increment every tap. **I’m done** marks Read and returns to the shelves.

## Review and stats

Spaced repetition (SM-2 as Anki runs it). Words you mark Don’t know or Barely become **new cards**, introduced up to 20 a day. New cards step through 1 min → 10 min, then graduate to 1 day; after that Good multiplies the interval by the card’s ease (≈ 1 → 3 → 8 → 20 → 50 days), Hard ×1.2, Easy ×ease×1.3. Again on a review card is a lapse: ease −0.2, the interval resets to 1 day, and the card relearns at 10 min. Cards are shown only when due (review cards from midnight of their due day). Grade buttons preview the next interval. Reader taps never reschedule a card, except Don’t know on a scheduled card, which makes it due now without touching its interval or ease. Older saved cards keep their interval and due date; never-reviewed misses join the new-card queue (20/day), so nothing floods one day.

**Stats** (`#/stats`) is an Anki-style dashboard: learned & forgotten per day/month, cumulative totals, words over time (known/shaky/unknown), reviews and retention, new words met, reading time, a daily-activity heatmap, streaks, card states (new / learning / young / mature), a 30-day review forecast, interval spread, and hardest words — with 1 month / 3 months / 1 year / All and By day / By month toggles.

- *Learned* = the first time a word reaches Known (Okay in the reader, Good/Easy in review). *Forgotten* = a learned word dropping back to Don’t know (Again / Don’t know); Barely/Hard is not a lapse. *Relearned* = a forgotten word reaching Known again.
- History comes from an `events` IndexedDB store (DB v6) that logs every reader tap and review grade. It is local to this browser — not synced or exported yet — and starts when you first run this version.
- **Demo mode:** click **Load demo data** on Stats, or open `/?demo=1#/stats` (or `#/stats?demo=1`). It generates an example learner in memory only, shows an “Example data” banner, and never writes to IndexedDB or sync.

## Storage

IndexedDB on this device. Export JSON v2 (imports v1). No accounts.

## Run

```bash
npm install
npm run glossary   # if public/glossary.json is missing
npm run dev
```

Open http://localhost:5173

Live: https://duki.chadmurchison.com (guest / this-browser storage).

Glosses are derived from [CC-CEDICT](https://www.mdbg.net/chinese/dictionary?page=cc-cedict) (CC BY-SA 4.0).

## Offline wiki rewrites (static catalog)

Animal/science mid-band shorts live in `src/data/wiki-rewrites.ts` (original Mandarin; Wikipedia CC BY-SA topic cited in `source`). Generation is **offline only** — not wired into the app or lambdas ($0 runtime LLM).

```bash
node scripts/wiki-rewrite-offline.mjs --list-defaults
node scripts/wiki-rewrite-offline.mjs --topics 猫,雨 --fetch --out /tmp/wiki-scaffold.json
# author original Mandarin bodies, then merge into src/data/wiki-rewrites.ts
node scripts/wiki-rewrite-offline.mjs --score /tmp/wiki-drafts.json
node scripts/catalog-unknown-histogram.mjs
```
