# English toggle skeleton — local preview

Branch `yoshi/duki-en-toggle-bones` (base f677230). Not a release: do not deploy or push.

## Run

```sh
npm install
npm run dev        # http://localhost:5173/
```

- Header **Mandarin / English** toggle; the choice is stored in `localStorage["duki.language"]` and survives reloads.
- English shows an empty "No English stories yet" shelf. Add stories later as `LibraryText` rows with `lang: "en"` in `src/data/en-samples.ts` (`EN_SAMPLES`); they then use the shared cards and reader.
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

English stories, Review/Stats/Add text/import for English, v2 sync, accounts.
