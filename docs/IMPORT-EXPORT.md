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

Chad's latest decision (Oct 21, 9:20 PM) is **1 MB total per verified user**. MB here is decimal: **1,000,000 bytes**, not 1 MiB. Count the complete compact UTF-8 JSON account snapshot, including words, metadata, settings, and the retained sessions as well as pasted story bodies. This is a user-payload budget; provider-internal database/index/log overhead is not displayed as user usage.

- New/changed pasted stories: **512,000 bytes (0.512 MB)** per serialized story record, including title and metadata. That allows roughly 170,000 common Chinese characters before metadata. Small stories can be numerous; there is no story-count limit. A single large story cannot consume the entire account allowance.
- Anonymous/unverified: **local-only**, with a **1,000,000-byte (1 MB)** budget for the prospective account-style payload when accepting new stories/imports. This is not a claim to cap all browser disk usage: cached public text bodies, older local sessions and local Stats events are outside this budget. Existing local data is never purged.
- Email verification is read from the ID token for UI/preflight only (`true` or the string `"true"`). Missing claims are unverified. The client does not cryptographically verify this claim; the server must do so. Unverified sessions do not invoke account sync, but can still read locally and export.
- Usage shows e.g. **0.7 MB of 1 MB**, labelled as an account or local budget. Unverified users have no cloud allowance; their 1 MB local-only import budget is not server storage. Usage estimates the next sync payload, not a server-confirmed storage reading. An 80% warning advises backup; at/above the limit new additions are paused. The final merged snapshot is checked again before PUT. A concurrent/new remote update can therefore make an initially accepted local import fail to sync; the local copy stays available and an error is shown.
- A story/quota rejection does not truncate content, evict another story or silently upload a subset. An import is preflighted before any writes, so rejected content does not partially overwrite words, stories or settings. Existing oversized story bodies can still be loaded/exported; unchanged legacy oversized stories are grandfathered for the per-story check. A whole snapshot above 1 MB is not sent. No schema-version bump, data clearing or automatic migration is introduced.
- **Legacy over-cap data keeps working.** An import or sync that adds no new or changed pasted story (only words, progress, settings, or stories the device/account already has) is allowed even above 1 MB; only writes that add/grow a pasted story are refused. Text-only checks on sync skip story rows unchanged from the pulled account copy, so one odd legacy row can never block syncing progress.
- **Accounting caveat for Chad:** the 1 MB counts the whole snapshot, including vocabulary. One word record is ~240 bytes, the catalog metadata every user carries is ~0.12 MB, and 200 sessions are ~0.03 MB. So a reader with ~3,500 word records is at 1 MB with no uploads at all and cannot add a story. If the cap is meant for uploaded text only, count `kind: paste` story records (and keep a separate generous ceiling for the whole snapshot).
- Ordinary progress/settings writes remain available locally even over budget. Reducing cloud usage is subject to the deletion/merge caveat below; do not promise that a local removal reclaims cloud storage yet.

## Text-only boundary

Accepted inputs are pasted plain Chinese, a **UTF-8 `.txt`** story (previewed in Add text before saving), or Duki's own **text-only `.json`** backup. Both file pickers advertise only these types, but runtime checks do not trust the picker or extension.

The frontend checks extension/MIME agreement, decodes UTF-8 strictly, rejects common binary-file signatures/control bytes, embedded data/blob URLs and media markup, known base64 binary signatures, and long opaque base64/base64url runs (including line-wrapped runs). JSON is checked before normalization against the existing backup/snapshot field sets; attachment fields and byte arrays are rejected, including hidden fields in otherwise valid Duki JSON. URLs already used as source/cover metadata remain text URLs, never embedded image bytes. Unsupported content receives a clear “Text only” error. No image/PDF/document/audio parsers or converters are added.

The encoded-content check is deliberately conservative: a long opaque Latin token can be rejected too. No text classifier can prove that arbitrary short strings were not produced by encoding bytes. This check is not a security substitute for the server's strict schema/size/auth boundary. The server must not accept arbitrary attachment fields or provide an alternate binary-upload path.

A **25,000,000-byte file-read guard** bounds backup parsing. It is not the account allowance: exported backups can contain cached public bodies and pretty-print whitespace that never go to the account. A valid file still must pass per-story and merged-payload checks. Old valid v1/v2 text backups remain supported; oversized new uploads or embedded binary in an imported file are rejected without changing the existing DB.

## Exact external backend work required before publication

The frontend deployment workflow configures `VITE_DUKI_API` as:

`https://j251m3eof8.execute-api.us-east-2.amazonaws.com`

Cloud reads/writes use GET/PUT `/me` with an ID-token bearer header. The backend is **not** in this repo. It lives in `Renovare10/portfolio-infra` (`duki.tf` + `duki-sync-lambda/index.mjs`; GitHub main 97f98cd is identical to the box checkout): API Gateway HTTP API `duki-http` with a Cognito JWT authorizer on `GET /me` and `PUT /me` → Lambda `duki-sync` (nodejs20.x) → one object per user at `s3://chadm-duki-user/<sub>/state.json` (bucket versioned, no lifecycle rule). Today the Lambda only checks the raw body is ≤ 8 MiB and `v === 1`, then overwrites the object; no email-verified check, no schema/text-only check, no per-story limit, no concurrency control. See [SERVER-STORAGE-PLAN.md](SERVER-STORAGE-PLAN.md) for the enforcement plan. No live account/API inspection was performed and the deployed Lambda version was not checked (no AWS credentials on the box).

The owner of that API must:

1. Locate the deployed `/me` integration and its real DB/object-storage implementation. Validate JWT signature/JWKS, issuer, audience/client, expiry and token use; derive the owner only from validated `sub`. Require a true verified-email claim for cloud persistence, regardless of what the browser sent. Reject unverified persistence (403); preserve legacy reads/export access according to the account policy, without deleting anything.
2. Accept only JSON text snapshots on `/me`, with a strict, bounded schema. Decode any API Gateway transport envelope before validating the actual payload; that transport encoding is not a story attachment. Reject multipart/files, unknown attachment properties, byte arrays, embedded data/base64/media payloads and unsupported content (415 or a structured validation error). Catalog/source metadata IDs and kinds must be server-validated: a forged `kind: sample` must not become a way to store a user body without quota. Non-user public bodies should not be persisted in account snapshots.
3. Compute compact UTF-8 JSON bytes on the server, not string length, client counters, compressed transfer size or base64 envelope size. Enforce **1,000,000 bytes total** and **512,000 per new/changed user story record** on **every** account write/import route. If snapshots span multiple rows/objects, sum the entire owner's persisted payload, not just the current request. Disallow unbounded retained versions/attachments outside that accounting.
4. Enforce the aggregate check and write atomically using the storage engine's transaction/conditional-version mechanism. Concurrent requests cannot each reserve the same free space. Reject the complete offending write, retaining the previous account state; never trim a snapshot or delete old stories to make it fit. Return structured 413 information with usage, limit and per-story limit. The client already displays 413/415 sync errors instead of hiding them.
5. Preserve existing over-limit accounts and story bodies for reads/export. Reject new/growing uploads until below the total cap; allow authenticated explicit removals or genuinely size-reducing updates under a safe version check, and grandfather unchanged legacy large stories. Metadata/progress-only exceptions must not allow increased stored payload while over quota. No background cleanup/deletion job.
6. Return authoritative usage (e.g. `usedBytes`, `limitBytes`, `storyLimitBytes`) via an additive, versioned `/me/usage` endpoint or equivalent documented response headers, so the frontend can distinguish committed account usage from its current local estimate. Do not replace the existing snapshot response shape silently.
7. Add backend integration tests for exact limits/one byte over, UTF-8 Chinese, many small stories, simultaneous writes, forged claims/owners/kinds, non-text/embedded bytes, and legacy over-cap reads/reduction without data loss. Direct requests bypassing this frontend must be rejected too.

There is **no server-side enforcement delivered or verified in this branch**. Publishing the frontend alone does not satisfy that security requirement.

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

The dedicated e2e uses an isolated headless system-Chrome profile (`/usr/bin/google-chrome --headless=new`; `DUKI_CHROME`/`DUKI_BROWSER` override) and blocks external requests. It seeds only test-browser IndexedDB, not user data. It covers both modes, reload persistence, desktop (1280 px) narrow/wide and all widths at 96 px, legacy over-cap restore, text-only rejection, `.txt` save, quota atomicity, JSON round trip, and real touch dismissal/reveal at **390×844 with 4x CPU throttling**. It records 88 frame samples and asserts p95 below 50 ms with zero article DOM mutations. The latest run recorded median 16.7 ms, p95 16.8 ms and maximum 33.4 ms. These are desktop-emulation measurements, not a claim about every physical phone.

`npm test`: 37 files / 347 tests pass (including library validation). Build passes with the existing large-bundle warning. No Wikipedia/library/classic content was edited.

Nine screenshots and machine-readable results are in `docs/shots/reader-settings-*`: Color-coded, Normal, large/wide and large/narrow desktop, large mobile, mobile word bar, dismissed and revealed states, storage usage, plus `reader-settings-verification.json`.
