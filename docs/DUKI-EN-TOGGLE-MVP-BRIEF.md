# DUKI-EN-TOGGLE-MVP-BRIEF.md
Chad OK 2026-11-06 ~7:45 AM ET. Bare-bones private draft: English learning mode via a language toggle. Nothing public. Stories can be filled later.

## Goal
Local-only Duki draft where Chad can flip a toggle Mandarin <-> English and read/tap a couple of stub English texts the same way he does Mandarin. Prove the shell; defer real English story packs and dictionaries.

## Workspace
C:\Users\chadf\Desktop\Repos\duki-en-mvp on branch duki-en-toggle-mvp (fresh clone of Renovare10/Duki @ cb02207). Do NOT touch C:\Users\chadf\Desktop\Repos\Duki. Read README.md and existing src/lib/segment.ts, speech.ts, glossary.ts, types.ts first.

## Build (bare bones)
1. Language setting persisted locally (IndexedDB or existing settings store): `zh` (default) | `en`. Header or settings control: a clear Mandarin / English toggle (one click).
2. Plumb `lang` (or equivalent) through the reader path:
   - `zh`: keep current Han segmenter, CC-CEDICT/pinyin, zh-CN TTS, existing Mandarin catalog. No regressions.
   - `en`: whitespace/punctuation segmenter behind the same `segment()` entry point; hide pinyin UI; TTS via en-US (browser voices); word key can stay the `hanzi` field name internally — map English lemmas there without a schema migration if possible.
3. Stub English content only: 2–3 very short graded English sample texts (hardcode in samples or a tiny `en-samples` module). Enough to open shelves + reader in EN mode. No Gutenberg/wiki English crawl. No full dictionary — minimal inline gloss map for those stub words (or "—" gloss is fine for unknowns).
4. When toggle flips: filter/show the matching language shelf set; empty English shelves are OK beyond the stubs. Mandarin library unchanged.
5. Banner or small "Draft · local only" chip when `en` is selected so it is obvious this is not live.

## Hard rules
- No deploy, push, paid services, accounts, deletes, Cloudflare, duki.chadmurchison.com, AWS.
- Do not touch the live Duki folder, Fire Realty, LOA, or church repos.
- Fake/stub data only. No secrets in commits.
- Output: local commits on duki-en-toggle-mvp + short handoff in C:\Users\chadf\Desktop\Repos\_hermes-out\DUKI-EN-TOGGLE-HANDOFF.md (how to `npm run dev`, toggle steps, commit SHAs, what was deferred).

## Acceptance
Local preview: open app in Mandarin as today; flip toggle to English; see stub English texts; open one, tap words (red/yellow/known), no pinyin; TTS speaks English if a voice exists; flip back to Mandarin and existing stories still work. Nothing published.
