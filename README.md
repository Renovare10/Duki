# Duki

A local-first **library of Mandarin stories**. Learning (word colors, taps, i+1) stays in the reader. Home is shelves, not a paste box.

## Home

Horizontal rows of covers: Continue, Just right, Because you read…, Stories, Children’s, Science, History, Graded, Articles, Novels, Featured, Your uploads.

Filters: **Just right** (default) · Easy · Harder · All levels · Already known, plus Unread/Read and category chips. Easy never includes 100% known texts. Suggestions never hero a finished-known sample.

**Add text** is a header side door for Chinese you own.

## Reader

Unknown is red, shaky is yellow, known is plain. Hover pinyin only on unknown/shaky. `1` `2` `3` mark Don’t know / Barely / Okay. Counts increment every tap. **I’m done** marks Read and returns to the shelves.

## Review and stats

SM-2 cards for unknown, shaky, and due words. Stats lists misses and recent unknown load.

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
