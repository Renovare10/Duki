# English toggle skeleton — local preview

Branch `yoshi/duki-en-toggle-bones` (base f677230). Not a release: do not deploy or push.

## Run

```sh
npm install
npm run dev        # http://localhost:5173/
```

- Header **Mandarin / English** toggle; the choice is stored in `localStorage["duki.language"]` and survives reloads.
- English has 20 original graded stories, two per level L1–L10 (`src/data/en-stories.ts`). Pick a level, open a story, tap a word for its Chinese gloss, and mark it Don't know / Barely / Okay. No audio or pinyin in English.
- Glosses: `src/data/en-glosses.generated.ts`, built from ECDICT (MIT) by `ECDICT_CSV=… node scripts/build-en-glosses.mjs`; re-run it after editing stories (a test fails if any story word lacks a gloss).
- Mandarin is unchanged (shelves, Review, Stats, Add text, Night, app tray), except that sign-in and cloud sync are off in the preview.

## Safety: preview / no-sync mode (default)

- `previewNoSync()` (`src/lib/language.ts`) is ON unless the build sets `VITE_DUKI_CLOUD_SYNC=on`. It disables sign-in, SSO, refresh, cloud pulls and pushes, and `pushSnapshot` refuses every PUT (`CloudWritesDisabledError`) before any request.
- Production Duki only speaks sync v1. Do not enable cloud sync on this branch until the v2 client and backend ship together.
- English word records are stored as `en:<word>` and English rows are stripped (`mandarinOnly`) from every v1 snapshot before merge or PUT, so English can never overwrite Mandarin or cloud data, and Mandarin Latin keys (OK, DNA) stay Mandarin.
- A GET that advertises `x-duki-sync-version: 2` must carry `v: 2` (`assertSyncV2Body`); a header-v2/body-v1 response, or any unknown body version, aborts before merge or PUT.

## Verify

```sh
npm test
npm run build
npm run e2e:en     # needs the dev server; DUKI_URL / DUKI_CHROME / DUKI_SHOTS optional
```

## Deferred

More stories, Review/Stats/Add text/import for English, v2 sync, accounts.

## Production (Nov 11 2026)

- Production builds sync exactly as before: Mandarin only, v1 body, no `x-duki-sync-version` request header,
  so the live duki-sync Lambda keeps answering with its legacy (Mandarin-only) projection.
- English is local-only on this device: `mandarinOnly()` strips `en:` words, `lang: "en"` texts and their
  sessions before every merge and PUT. IndexedDB stays at v6 (no schema change).
- `src/lib/sync.ts` is byte-identical to main (cb02207). The preview's v2-header guard was removed because the
  live Lambda sends `x-duki-sync-version: 2` on every response, which would have stopped Mandarin pulls.
- A throwaway preview can still be built local-only with `VITE_DUKI_CLOUD_SYNC=off`.
