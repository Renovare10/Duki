# REPO-MAP.md

## Folders
- `src/main.tsx`, `src/App.tsx` — React entry and shell (hash routes, language, sync).
- `src/components/` — Home, Reader, Book, Work, Review, Stats, AddText, AppBar, Charts, VoicePlayer, ThemeToggle.
- `src/lib/` — IndexedDB, auth, sync, library, scoring, SM-2 review, language toggle, Gutenberg/wiki/Wikisource, storage caps, handoff, word-merge (last write wins during a cloud sync), demo-cloud (preview-only fake slow account when `VITE_DUKI_DEMO_CLOUD=on` and cloud sync is off).
- `src/data/` — built-in Mandarin and English catalogs (some `*.generated.ts`).
- `src/vendor/` — copied shared `chadm-appbar`, `chadm-session`, `chadm-handoff` (same files as LOA and the portfolio).
- `public/` — `glossary.json`, classic JSON, static works under `public/works/`.
- `scripts/` — glossary/works builders, `validate-library.mjs`, `build-pages.sh`, Playwright e2e.
- `deploy/pages/` — `_headers` (CSP + cache), `_redirects`, `assets-404.html`.
- `docs/` — historical briefs and import/storage notes. Not the source of truth for commands (see `AGENTS.md`).
- `.github/workflows/deploy.yml` — push to `main` deploys Cloudflare Pages.

## Entry points
- Dev: `npm run dev` (Vite, port 5173).
- Prod bundle: `npm run build` → `dist/`, then `scripts/build-pages.sh` → `dist-pages/`.
- Sign-in and SSO handoff start in `src/main.tsx` (`captureHandoff`, `answerPullRequest`).

## Data stores
- Browser IndexedDB database `duki`, version 6: `words`, `texts`, `sessions`, `settings`, plus `events` (stats history; not synced).
- Cognito tokens in `localStorage` (`duki.auth.tokens`). Reading-language preference is device-local (`duki.language`) and is not synced. English rows never sync.
- Guest data stays in this origin's IndexedDB (hostname must stay `duki.chadmurchison.com`).

## External services
- Cloudflare Pages project `chadmurchison-duki` (live hostname above).
- AWS Cognito hosted UI `https://accounts.chadmurchison.com` (public PKCE client in `src/lib/auth.ts`; shared pool, Duki client id `34crk50b2obng6cdgh2mhp029s`).
- Duki sync API (`VITE_DUKI_API` in the deploy workflow): `GET`/`PUT /me`. Gutenberg text may also use `${VITE_DUKI_API}/gutenberg/:id`.
- Public fetches: gutendex.com, gutenberg.org, zh.wikipedia.org, zh.wikisource.org.

## Hot files (bots: coordinate first)
`src/App.tsx`, `src/lib/auth.ts`, `src/lib/sync.ts`, `src/lib/word-merge.ts`, `src/lib/language.ts`, `src/lib/handoff.ts`, `src/vendor/chadm-*.js`.
