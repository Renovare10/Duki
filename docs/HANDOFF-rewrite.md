# Duki: rewrite the 402 library texts (handoff to Grok Build)

Repo /workspace/duki-stats, branch `library-v2` (tip febad2f). Read docs/library-v2-status.md and src/data/library/README.md first. Work end to end without asking questions.

## Why
The 402 texts in src/data/library/p01.ts–p15.ts (ids `lib-…`) were stitched together by scripts to hit difficulty rules. The result is unreadable: unrelated sentences, and the same template repeated with names swapped ("小乐吃米饭。小乐喝茶。小乐很开心。小乐回家。"). Example: `lib-p08-01-history` "从前的事" is filed as history but contains no history. At the higher levels the scripts just swapped in fancier synonyms. Chad (the owner) reads at about 10–12% unknown words and wants real reading that a good children's library or a good intermediate nonfiction shelf would carry. He prefers human-quality writing.

## The job
Rewrite EVERY text in p01–p15 as a real, coherent piece written directly by you, one at a time:
- Stories need a character, a situation, something that happens, and an ending. Nonfiction (history, science, geography, biography, how-to, news-style) must teach real, accurate facts in a clear order. Letters, diaries and dialogues must read like real ones. Fables and folk tales can retell real traditional ones.
- Natural, idiomatic Mandarin a native writer would produce at that level. Simple does not mean choppy: use connectors (因为、所以、可是、后来、于是…) as the level allows. No filler, no repeated sentence templates, no lists of names doing the same actions.
- Title, blurb (specific English, ≤90 chars, describes this text, never generic like "A careful, general account…"), and topics must match the content.
- The three serials (河边的夏天 L3, 奶奶的厨房 L4, 城南邮局 L5) are the best of the batch. Keep their characters and premise, but polish every part so it reads as one continuing story.
- Remove the duplicate L2 food texts (p02-18 vs p02-25, p02-24 vs p02-31): replace one of each pair with a new text on a different everyday subject.
- Keep the spread: all the plan's topics (daily life, family, food, shopping, money, work, school, travel, places, home, health, emotions, weather, nature/animals, science, technology, sports, music, art, media, festivals/customs, Chinese and world history, biographies, geography, news-style, humor, fables/folk tales, mysteries, adventure, letters/diaries, how-to, faith, social issues), every level L1–L8 with at least 30 texts, densest at L3–L7, a few L9–L10, and lengths per the README table.

## Hard rules
- NEVER generate or alter prose with code. No templates, no synonym swapping, no sentence shuffling, no `check-drafts.mjs --fix`, no `fitText`. Scripts are only for MEASURING (scripts/check-text.mjs, scripts/check-drafts.mjs without --fix, scripts/validate-library.mjs).
- Fit the level by editing words by hand. If a good text measures one level off, it is fine to change its `level` field to the measured level as long as the overall distribution targets still hold. Never make a text worse to hit a number. Every token must be in public/glossary.json (pick a different natural word if one is missing).
- Keep every existing `id` (ids are permanent; replace content under the same id). Keep `aiGenerated: true`, `license: "Original (Duki)"`. Do not touch older non-`lib-` texts, user data code, or the DB. Rebuild src/data/text-meta.ts with the existing build script after content changes.
- DO NOT push, open PRs, or deploy (push is disabled; leave it). Commit locally after each pack file: `git -c user.name="Grok Bot (for Chad)" -c user.email="150154847+Renovare10@users.noreply.github.com" commit ...`.
- Keep a running log in docs/rewrite-progress.md (which packs are done) so the work can resume if interrupted. Before starting, check that file and continue from where it left off.
- After writing each pack, read it back in full as a reader would and fix anything unnatural, repetitive or factually doubtful.

## Finish line
- `npm test`, `npm run build`, and the data-safety e2e (`node scripts/e2e/library-v2-migration.mjs /tmp/duki-main/dist dist screenshots`) pass.
- Rebuild dist so the running `vite preview` on 127.0.0.1:4174 (behind the existing cloudflared tunnel) serves the new texts. If that server is not running, restart it (`npx vite preview --host 127.0.0.1 --port 4174 --config vite.preview.local.mjs` or as before).
- Fresh mobile screenshots of 4–5 rewritten texts at different levels into screenshots/ (scripts/e2e/library-v2-shots.mjs), named library-v2-rewrite-<id>-390-dark.png.
- Update docs/library-v2-status.md with a short plain-language section "Rewrite": what changed, totals by level and topic, a few good routes to sample (one per level band), commit hash, anything left over.

## Usage budget (added Oct 8 evening, IMPORTANT)
The first run burned the whole usage balance in an hour, mostly by re-reading big files and re-measuring after every edit. From now on:
- Each session handles exactly ONE pack (named in the prompt). Do that pack, commit, update docs/rewrite-progress.md, and exit. Do not start another pack.
- Read only the pack you are rewriting (use offsets/limits; don't dump whole files repeatedly). Don't re-read the README, plan, audit or other packs unless truly needed.
- Write all texts in the pack first, then measure the whole pack in ONE check-drafts/check-text pass, fix, and re-measure at most twice.
- Keep tool output short (pipe measuring output through a summary; never print full JSON or huge diffs).
- Skip npm test/build/e2e and screenshots except in the final session (prompt will say "FINAL").

## Wiki-sourced stories (added Oct 15, IMPORTANT)
Chad wants to KEEP the Wikipedia-sourced stories exactly as they are: src/data/wiki-rewrites.ts, wiki-rewrite-*.ts, wiki-titles.ts, wiki-rewrite-helpers.ts and any catalog entries that point to them. Do not edit, remove, replace or re-level them. Only the `lib-…` texts in src/data/library/p01–p15.ts are being rewritten.

## Checkpoints and status (added Oct 15, IMPORTANT)
Sessions get cut off (the model stream stalls when the machine is snapshotted; the runner then kills and resumes the session). Make every cut-off cheap:
- Commit after EVERY finished text, not once per pack: stage only the files you changed (`git add src/data/library/pXX.ts docs/rewrite-progress.md`), never `git add -A`. Rebuild text-meta.ts once at the end of the pack.
- After each commit, overwrite /workspace/duki-stats/grok-status.txt with one line (never commit this file):
  `<date -Iseconds> TEXT-DONE pack=pXX text=<id> n=<done>/<total> commit=<short hash>`
- Keep a 1–3 line "Resume notes" entry for the pack in docs/rewrite-progress.md (next text id, decisions made, open problems), so a fresh session can continue without re-exploring.
- On a resumed run ("previous run was cut off"): check `git status --short` and `git log --oneline -5`, then continue. Do not re-read files that are already in your context, and do not re-read the handoff, README, scripts or glossary.
- Think briefly. Write each text, measure it with one short check, fix, commit, move on. No long deliberation over a single word; no full-file dumps.
