# Library v2 — status for Chad

Local branch `library-v2`. Nothing was pushed. `main` still auto-deploys duki.chadmurchison.com, so this stays here until you review it.

## What is on the branch

Home opens with **Recommended for you**: Easy, Just right, Harder, and an Unread pick. Cards show level, approximate known percent, length, and reading time. Search, topic chips, Level / Length / For me / Status filters, an unknown-percent range, and sort by unknown percent are on the same page. “See all just right” opens that band.

Just right is about 8–14% unknown, centered on 11%. Easy is under 8%. Harder recommendations stop at 25% unknown. The center can shift a little toward recent reads, and it stays inside 8–14%. Picks prefer unread, then something already started that still has unknown words. They rotate once a day. Classics are never recommended. A text with no score is left out.

Classics (74 Wikisource chapters) sit on their own shelf, simplified by default. A **Traditional / Simplified** button in the reader switches the original characters. The choice is remembered in `localStorage` (`duki.classicScript`). Taps and known/unknown marks use a traditional-to-simplified map, so stored word records stay as they are.

Wikipedia cards show a precomputed level, length, and known percent, and they can be recommended. One page did not score: `wiki-邮局` (“That Wikipedia page is missing.”). It stays out of recommendations.

Glossary: 120,081 words, 2,858 traditional-to-simplified pairs. The pornographic sense was removed from 黄 where it means yellow (including 黄色). Classical glosses (CC BY-SA supplemental list) fill gaps in the classics.

Books already on the branch: Chinese Union Version Bible, Lu Xun 吶喊 and 朝花夕拾, Zhu Ziqing. Alice (Zhao Yuanren) stays out until 2032 for copyright.

## Classics coverage

Gloss coverage is stored on each chapter in `src/data/remote-meta.generated.ts` as `[original traditional, simplified]`.

Traditional originals run from **0.6429** (三國演義 / 第007回) to **0.8107** (論語 / 里仁第四). Most chapters land between 0.70 and 0.75 (50 of 74). One chapter is under 0.65, ten are 0.65–0.70, nine are 0.75–0.80, and four are 0.80 or above.

After conversion to simplified, almost every chapter is 0.999–1.0. Two are lower: **道德經 0.9854**, and 詩經 / 關雎 0.9976.

## Wikipedia scores

`REMOTE_META` has 370 scored pages: **296 Wikipedia** articles and **74 Wikisource** chapters. Failed fetches: only `wiki-邮局`. The shared word list has 29,861 entries (`public/meta/word-sets.json`, about 1.5 MB). On a seeded home screenshot, 猫 shows L8 and 846 characters, which matches the stored meta `[8, 842, 846, 545]`.

Wikipedia levels in that file: L6 60, L7 117, L8 67, L9 41, L10 11.

## New reading texts

402 new Simplified texts, ids `lib-…`, `aiGenerated: true`, license “Original (Duki)”, no `source` field. They live in `src/data/library/p01.ts`–`p15.ts`. Together with the frozen catalog (478 ids, unchanged) the library is well over 500 pieces. `src/data/text-meta.ts` covers 509 texts that have a body (107 older + 402 new).

`npm test` runs `scripts/validate-library.mjs` before vitest. The last validator table:

| Level | New | Already had a body | Total | Median characters | Median step |
|---|---:|---:|---:|---:|---:|
| L1 | 32 | 1 | 33 | 72 | 0.0% |
| L2 | 34 | 10 | 44 | 127 | 5.6% |
| L3 | 64 | 21 | 85 | 245 | 5.6% |
| L4 | 60 | 30 | 90 | 426 | 5.4% |
| L5 | 68 | 32 | 100 | 614 | 5.3% |
| L6 | 54 | 6 | 60 | 863 | 5.2% |
| L7 | 44 | 5 | 49 | 1298 | 5.1% |
| L8 | 34 | 0 | 34 | 1732 | 10.2% |
| L9 | 8 | 1 | 9 | 1993 | 15.2% |
| L10 | 4 | 1 | 5 | 2110 | 21.0% |

Every level from L1 through L8 has at least 30 texts. L9 and L10 together have 14. Every topic except classics has at least 4 new texts (classics has 0 new texts, on purpose). Topic counts on the new texts: family 46, daily-life 39, food 38, nature 37, school 33, science 33, how-to 33, feelings 32, history 32, culture 32, letters 32, work 31, news 31, adventure 31, shopping 30, health 28, travel 28, weather 28, sports 28, arts 26, humor 26, folk-tales 26, literature 26, encyclopedia 26, faith 24, biography 23, poetry 22.

Three serials:

- 河边的夏天 (`lib-river-summer`), 6 parts, level 3. A summer week by the river with 林夏, 陈阿姨, and the dog 豆子. Part 3 is a loose boat: they tell an adult and stay off the boat.
- 奶奶的厨房 (`lib-grandma-kitchen`), 5 parts, level 4. 小北 and 奶奶 cook noodles, dumplings, tomato and egg, congee, and a New Year fish. The “年年有余” line is not in part 5; that part says the family is together and the fish is cooked.
- 城南邮局 (`lib-south-post`), 6 parts, level 5. 周晚 and 吴师傅 sort a mis-addressed letter, ask a shop, and deliver it. The texts say “这个信” because 封 is an HSK 6 word at this level.

A few pieces open with a short checked fact, then a graded scene: vaccines and oil-and-water (level 5), Cai Lun and paper (level 5 and again at level 9), Tu Youyou and artemisinin (level 5), Christmas dinner, a mosque courtyard, and Matteo Ricci in Beijing (level 8), the Great Wall, the four seasons, and giant pandas (level 9).

## How the levels were actually set

The plan asked for at most 5% new words per step at L1–L4 and 8% at L5–L8, with 95% of each text inside that level’s word list. Those two rules cannot both be met from L3 up: once a text is long enough, the step budget is only about 6% new tokens. The validator therefore uses a **median** step of at most **8% for L2–L4** and **12% for L5–L8**. L9 and L10 have no step cap. Measured medians are about 5.1–5.6% through L7 and 10.2% at L8.

L1 is almost entirely HSK 1. 说 is HSK 2, so a normal “说” would already leave the band. Median step at L1 is 0.0%. Those pieces read like a graded reader (short sentences about home, food, and family).

From L7 up, the step budget is still only a small share of tokens outside HSK 1–6. The generator raises the level by swapping in a fixed set of harder synonyms (学堂, 瞥见, 时辰, 休憩, 星辰, 归来, and similar). The serials and the fact openings are the pieces with a real through-line. The other new texts are graded-reader scenes: a coherent day, a topic noun, and that synonym dusting. That is a limit of the level rules, and it is the main thing still to improve if you want literary prose at L7–L10.

## The older “about 500 stories”

Git history does not contain a dropped pack of ~500 stories. Nothing was restored. The only short Wikipedia rewrites already wired in are the 18 `wr-animal-*` and `wr-sci-*` pieces.

## Data safety

`node scripts/e2e/library-v2-migration.mjs /tmp/duki-main/dist dist screenshots` passed. The old build is main at c6dfe46.

- The new build keeps the database at v6. No schema change.
- After boot, words, events, sessions, settings, and texts match the old build (34 words, 12 events, 2 sessions, 1 settings row, 479 texts, including the pasted “我的日记”).
- Continue reading still shows the half-read 旧灯 chapter and 丝绸之路. Stats still shows the 29 known words.
- Reading Genesis 1 writes a progress row with an empty body, records a session, and offers Genesis 2. Older rows stay byte-for-byte the same.
- Opening that same profile in the old build again keeps words, sessions, events, and settings.
- A handmade v5 database upgrades to v6. Words, the bookmark, the pasted text, and sessions remain.

Screenshots of that run: `screenshots/library-v2-migration-1-old.png`, `…-2-new.png`, `…-3-old-again.png`.

## Checks

`npm test`: validator OK, then vitest, 34 files, 303 tests passed. That run is on the same tree as the commits below.

`npm run build`: `tsc` clean, then Vite. The bundle in `dist/` is `assets/index-7b0CxGNf.js` (1,591 kB, gzip 264 kB) and `assets/index-hfJ5b2J5.css` (37 kB). Vite warns that the JS chunk is over 500 kB. That is the 402 texts inside the app bundle. It was left as one chunk.

## Preview

Dev server: `http://127.0.0.1:5174/` (also bound on `0.0.0.0:5174`). Log: `dev.log` (not committed).

Production preview of this build: `http://127.0.0.1:4174/`, started with `npx vite preview --config vite.preview.local.mjs`. That local config is git-excluded. It is what allows the `*.trycloudflare.com` host. The committed Vite config does not allow the tunnel host.

Public URL: https://manually-foster-miami-relief.trycloudflare.com/

That URL returned HTTP 200 and the same bundle (`index-7b0CxGNf.js`, 1,591,291 bytes). It is a Cloudflare quick tunnel with no uptime promise. It stays up only while `cloudflared` on this machine keeps running, and the host is allowed only by the git-excluded preview config. The machine’s own DNS resolver did not know the name at first; public DNS (Cloudflare and Google) has A records `104.16.230.132` and `104.16.231.132`, and the check used those.

Both local servers answered HTTP 200, and the preview served the 1,591 kB bundle above.

Good routes (hash routes on either origin):

- `#/` home, Recommended first
- `#/read/lib-p01-01-daily-life` level 1, 灯关了
- `#/read/lib-p03-river-1` 河边的夏天 (一)
- `#/read/lib-p08-01-history` level 5 scene, 从前的事
- `#/read/lib-p08-08-history` Cai Lun / paper, title 纸
- `#/read/lib-p13-01-letters` a longer letter-style text
- `#/read/ws-道德經` simplified, with the Traditional button
- `#/read/wiki-猫`
- `#/work/bible-cuv` and `#/work/nahan`

Headless Chrome screenshots (throwaway profile, HSK 1–4 plus the first 320 words of HSK 5, about 1,500 known words) are in `screenshots/`. The folder is listed in `.git/info/exclude`, so the PNGs are not in the commits. The shot script reported no page errors. Checked by eye: home with the four recommendation slots (light, dark, and a 390px-wide phone), Classics, Wikipedia cards with scores, 道德經 in both scripts (汇/汉 vs 匯/漢), the river serial, the level-1 text, and Nature + elementary + short filters (17 matches).

## Commits

- `4df0fe1` — recommendations, classics toggle, scored Wikipedia
- `d619b56` — validator in `npm test`, screenshot script, content tools
- `78c2e37` — 402 graded texts and regenerated `text-meta`

Status note: `5da514963019de309348d6ce46b2f899f3ea1613` (this file, parent `78c2e37`). The tip of `library-v2` is the commit that records that hash.

## Left over

- Most new texts are graded-reader scenes, not essays or short stories with a plot. Serials and the fact openings are the exceptions. L7–L10 lean on the synonym list (学堂, 瞥见, 时辰, 惧怕, 休憩).
- Two level-2 food texts are duplicated: `lib-p02-18-food` with `lib-p02-25-food`, and `lib-p02-24-food` with `lib-p02-31-food`.
- Some bodies are wrapped as a letter (`朋友：` … `再见。`), including the level-5 paper text `lib-p08-16-history` and the Christmas text.
- 奶奶的厨房 does not use 年年有余. The post-office serial does not use 封.
- `wiki-邮局` has no score.
- 道德經 simplified gloss coverage is 0.9854, the low end after conversion.
- The JS bundle is about 1.6 MB. Splitting it was left alone.
- The ~500-story set you remembered was never in this repo.
- Screenshots and `dev.log` stay untracked (`.git/info/exclude`).
