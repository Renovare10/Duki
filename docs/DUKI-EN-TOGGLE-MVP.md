# English toggle MVP — private local draft

This branch is a shell demonstration, not a release. Do not deploy or push it.

## Run

From `C:\Users\chadf\Desktop\Repos\duki-en-mvp`:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run dev -- --host 127.0.0.1 --port 5186
```

Open <http://127.0.0.1:5186/>. The explicit loopback host keeps this preview on this computer. Port 5186 also keeps its browser storage separate from a normal port-5173 preview. Keep the same host and port to retain this draft's progress.

1. A fresh browser profile starts in **Mandarin** with the existing local catalog.
2. Click **English** in the header. The **Draft · local only** chip appears.
3. Open **The Cat**, **The Red Bag**, or **A Quiet Table**.
4. Tap a word; use **Don't know / Barely / Okay** or keys **1 / 2 / 3**. New words are blue, unknown red, shaky yellow, known plain. Capitalization shares one lowercase word record. English has no pinyin.
5. **Play** uses an installed English browser voice (prefers en-US). No English voice gives a clear note; no speech engine hides the control.
6. **I'm done** saves completion and returns to English shelves. Reload preserves the mode, word grades and completion.
7. Click **Mandarin** to return to its shelves and normal Chinese/pinyin reader. English word records, sessions and events are excluded from Mandarin review/stats/recommendation inputs.

## Local-only boundaries

- `LOCAL_DRAFT = true` in `src/App.tsx` disables account entry, SSO callbacks/redirects, token refresh, cloud pulls and cloud pushes in this clone, in both languages. Do not remove this guard as part of story writing.
- Random Wikipedia hydration on boot is disabled in the private draft. The existing Mandarin catalog and local Wikisource stubs remain; Mandarin on-demand source functions were not rewritten.
- English stubs live only in `src/data/en-samples.ts`; no English source fetch/crawl exists.
- `duki.language` is a device-local localStorage preference (`zh` or `en`, default `zh`). Words/texts/progress use the existing IndexedDB stores; no DB version bump or data migration.
- No live-folder access, push, deploy, accounts or infrastructure actions are part of this work.

## Verify

With the loopback dev server running:

```sh
npm test
npm run build
npm run e2e:en
```

`e2e:en` uses a fresh, disposable headless Edge context and blocks external page requests. Override `DUKI_URL` / `DUKI_BROWSER` only for another local preview/browser. It tests desktop and 390px mobile layouts, the toggle, grade/reload/case handling, completion, language isolation, Mandarin pinyin, and final-line clearance above the word dock.

The speech script labels its controlled API fixtures separately from its native-engine probe. Its JSON evidence is `e2e-artifacts/en-speech-report.json`. Screenshots are also generated under `e2e-artifacts/` (gitignored).

Verification on this host: library validator OK; **387 tests passed across 41 files**; TypeScript/Vite build passed; both English browser scripts passed. Native Edge exposed local Microsoft David (en-US), and reported start **and completion** of the first English sentence. This is engine-event evidence, not a human listening-quality assessment.

Inherited notices: the approved L3 8.1% exception remains; the build still warns about a bundle over 500 kB, as before this change. The older generic `npm run e2e` script targets an earlier library layout; use the dedicated MVP checks above for this task.

## Deferred

Real English story packs, calibrated English levels, full dictionary, morphology/inflection lemmatization (keys are lowercase forms only), advanced English tokenization, English uploads/import UI, review/stats screens, remote English sources, sync/accounts and any publication. The three samples and tiny Chinese gloss map are deliberately provisional; unknown glosses show `—`.
