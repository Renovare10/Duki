# Import, export and storage

Status: frontend implemented on `reader-settings`, based on `origin/main` (`40e091a`). Nothing has been pushed or deployed. The authoritative API changes below are a publication prerequisite, not implemented server enforcement.

## What the live-base code did

- Local data is IndexedDB database `duki`, schema version 6: `words`, `texts`, `sessions`, `settings`, and `events`. Story bodies are not stored in localStorage. localStorage holds authentication and small preferences/caches; sessionStorage holds sign-in flow state. Those are not backup contents.
- Export downloads `duki-YYYY-MM-DD.json`, a UTF-8, pretty-printed JSON v2 file with `app`, `version`, `exportedAt`, `words`, `texts`, `sessions`, and `settings`. It contains locally stored story bodies (including cached catalog/remote bodies), word schedules/counts, bookmarks/read flags and reader settings. It does not contain auth credentials, the separate local Stats `events`, or browser preference caches. Unfetched work-chapter bodies are not stored/exported; their progress rows are.
- Import accepted Duki JSON v1 and v2. It upserts matching words, texts and sessions, keeps unrelated existing rows, normalizes old fields, restores bundled catalog content while retaining imported read/bookmark progress, and optionally replaces reader settings. It does not clear the database. Stats history is left alone. Matching imported rows can overwrite existing values; export a backup before restoring.
- Signed-in sync refreshes auth, GETs `/me`, merges local/remote state, upserts the merged state locally, then PUTs `/me`. The snapshot includes words, reader settings, text metadata, full `kind: paste` bodies and the most recent 200 reading sessions. Built-in/wiki/classic/Gutenberg bodies are stripped; only their metadata/progress travels. Events do not sync.
- The old client had an 8 MiB-labelled request check implemented as JavaScript string length, not UTF-8 bytes. It had no per-story check or verified-email gate and swallowed sync errors. This was not evidence of any backend quota.

Relevant code: `src/App.tsx` (export/import and sync orchestration), `src/lib/db.ts` (IndexedDB/upserts), `src/lib/sync.ts` (snapshot construction and `/me`), `src/lib/auth.ts` (auth).

## Agreed policy and frontend behavior

Chad's decision (Oct 21, 9:49 PM): **1 MB of uploaded stories per verified user**. MB is decimal (**1,000,000 bytes**). Only uploaded/pasted stories count (`kind: "paste"` records, compact UTF-8 JSON including title and metadata, summed). Saved words, progress, bookmarks, library listings, reading sessions and settings do **not** count.

- **Per story:** each new or changed uploaded story is at most **512,000 bytes (0.512 MB)**, roughly 170,000 Chinese characters. There is no limit on the number of stories.
- **Whole-sync safety limit: 6,000,000 bytes** of compact JSON for the whole account snapshot. It applies only to saves that add or change an uploaded story. Ordinary users never reach it: listings are ~0.12 MB, 200 sessions ~0.03 MB, each word ~240 B (20,000 words ≈ 4.8 MB), plus at most 1 MB of uploads. Progress, word and settings syncs are never blocked below the server's existing **8 MiB (8,388,608-byte)** raw ceiling; only above that can nothing be saved.
- **Anonymous/unverified:** local-only, with the same 1 MB uploaded-story budget for new stories/imports on the device. Existing local data is never purged.
- Email verification is read from the ID token for UI/preflight only (`true` or the string `"true"`); the server checks it again. Unverified sessions do not sync but can still read and export.
- **Usage** shows uploaded stories only, e.g. **"Uploaded stories: 0.3 MB of 1 MB"**, with the note "Words, progress and the built-in library don't count toward this." At 80% it advises a backup; at the limit new uploads are paused.
- **Legacy over-cap data is never deleted or trimmed.** An import or sync that adds or changes no uploaded story is always allowed, even above 1 MB or 6 MB. Only adding or growing an uploaded story is refused. Unchanged legacy stories are exempt from the per-story and text-only checks, and removals are allowed. Imports are preflighted before any write, so a rejected import changes nothing.
- **Conflicts:** sync reads the account's ETag on GET and sends `If-Match` on PUT once the API exposes it. On **409** it re-fetches, merges exactly as before, and retries, up to 3 rounds (`retryOnConflict` in src/lib/sync.ts). After that a sync error is shown and the local copy stays.
- Reducing cloud usage is subject to the deletion/merge caveat below.

## Text-only boundary

Accepted inputs are pasted plain Chinese, a **UTF-8 `.txt`** story (previewed in Add text before saving), or Duki's own **text-only `.json`** backup. Both file pickers advertise only these types, but runtime checks do not trust the picker or extension.

The frontend checks extension/MIME agreement, decodes UTF-8 strictly, rejects common binary-file signatures/control bytes, embedded data/blob URLs and media markup, known base64 binary signatures, and long opaque base64/base64url runs (including line-wrapped runs). JSON is checked before normalization against the existing backup/snapshot field sets; attachment fields and byte arrays are rejected, including hidden fields in otherwise valid Duki JSON. URLs already used as source/cover metadata remain text URLs, never embedded image bytes. Unsupported content receives a clear “Text only” error. No image/PDF/document/audio parsers or converters are added.

The encoded-content check is deliberately conservative: a long opaque Latin token can be rejected too. No text classifier can prove that arbitrary short strings were not produced by encoding bytes. This check is not a security substitute for the server's strict schema/size/auth boundary. The server must not accept arbitrary attachment fields or provide an alternate binary-upload path.

A **25,000,000-byte file-read guard** bounds backup parsing. It is not the account allowance: exported backups can contain cached public bodies and pretty-print whitespace that never go to the account. A valid file still must pass per-story and merged-payload checks. Old valid v1/v2 text backups remain supported; oversized new uploads or embedded binary in an imported file are rejected without changing the existing DB.

## Server enforcement

The frontend's `VITE_DUKI_API` is `https://j251m3eof8.execute-api.us-east-2.amazonaws.com`. The backend is in `Renovare10/portfolio-infra`: API Gateway `duki-http` with a Cognito JWT authorizer, then Lambda `duki-sync`, then `s3://chadm-duki-user/<sub>/state.json`.

The same rules are implemented server-side on the local branch `duki-storage-cap` of `/workspace/portfolio-infra` (worktree `/workspace/portfolio-infra-duki-storage-cap`). It is **not pushed or applied**, and starts in `LOG_ONLY` mode. See [SERVER-STORAGE-PLAN.md](SERVER-STORAGE-PLAN.md) and that repo's `DUKI_STORAGE_CAP.md`. Until it is applied and switched to enforce, the live API still only checks 8 MiB and `v === 1`. The client checks are a convenience, not security.

### Existing sync caveats discovered during the audit

- Deleting a pasted story locally schedules a pull/union merge; without tombstones/versioned deletion, the old remote row can reappear. A safe explicit deletion/tombstone protocol is needed on both client and API before telling users a local delete frees account quota. This branch does not invent a destructive deletion protocol against an unknown backend.
- The pre-existing single device DB is retained across sign-out. Sign-in merges it with an account; it is not an isolated DB per account. This branch does not migrate or clear it. Review account switching/isolation separately before promising private per-account local libraries.
- Events are still local-only and absent from exports. Do not describe the backup as a complete Stats-history archive.

## Reader settings and animation verification

- Highlights: default Color-coded, optional Normal (one neutral highlight for first-time/unknown/shaky; Okay stays plain). Word statuses and counters do not change when switching appearance.
- Characters: 18–96 px (previously capped at 42). Widths: Narrow 620 px, Medium 860 px (old default), Wide 1200 px, Full available width. All are constrained to the viewport.
- New optional settings fields normalize missing old values to the old appearance. A `readerSetAt` stamp lets the newest explicit appearance/font/width choice sync independently of vocabulary richness; existing theme timestamp behavior is preserved. Settings persist in the same IndexedDB row and backup/snapshot formats.
- Mobile jank cause: each throttled bookmark save changed the `texts` array, invalidating App's score memo and synchronously re-segmenting/scoring the **whole library**. The early 4x-CPU probe showed multi-second frame gaps even after transform scheduling improved. The score cache now reuses scores for unchanged content/vocabulary/profile when only progress metadata changes. Article token elements are memoized too.
- The sheet already used transforms and `will-change`, not height/top animation. Tracking is now coalesced by `requestAnimationFrame` with `translate3d`; geometry is cached and refreshed on resize rather than read for each scroll. Its scroll listener is passive; there are no app touchmove listeners. React only changes sheet latch state, not per-pixel state. Reveal keeps the short transform transition and honors reduced-motion; coarse-touch hover tooltips are suppressed.

Run locally (no backend configured by default):

```
nohup npx vite --host 127.0.0.1 --port 5175 --strictPort > dev.log 2>&1 &
```

Preview: `http://127.0.0.1:5175/`. Open any story to use the controls. For a story URL, `http://127.0.0.1:5175/#/read/sample-home` works without importing data. Do not add production API settings to a test run.

Verification commands:

```
npm test
npm run build
node scripts/e2e/reader-settings.mjs
```

The dedicated e2e uses an isolated headless system-Chrome profile (`/usr/bin/google-chrome --headless=new`; `DUKI_CHROME`/`DUKI_BROWSER` override) and blocks external requests. It seeds only test-browser IndexedDB, not user data. It covers both modes, reload persistence, desktop (1280 px) narrow/wide and all widths at 96 px, uploaded-only usage (0.3 MB of 1 MB), legacy over-cap restore, text-only rejection, `.txt` save, quota atomicity, JSON round trip, and real touch dismissal/reveal at **390×844 with 4x CPU throttling**. It records 88 frame samples and asserts p95 below 50 ms with zero article DOM mutations. The latest run recorded median 16.7 ms, p95 16.8 ms and maximum 33.4 ms. These are desktop-emulation measurements, not a claim about every physical phone.

`npm test`: 37 files / 352 tests pass (including library validation). Build passes with the existing large-bundle warning. No Wikipedia/library/classic content was edited.

Nine screenshots and machine-readable results are in `docs/shots/reader-settings-*`: Color-coded, Normal, large/wide and large/narrow desktop, large mobile, mobile word bar, dismissed and revealed states, storage usage, plus `reader-settings-verification.json`.
