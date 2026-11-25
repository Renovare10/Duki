# AGENTS.md

## What this is
Duki is a local-first Mandarin and English reader (React 19, Vite, TypeScript). Live: https://duki.chadmurchison.com. Repo: [Renovare10/Duki](https://github.com/Renovare10/Duki) (public). Owner: Yoshi.

## Start here
1. Read `REPO-MAP.md`.
2. `LIVE.md` is not generated in this repo yet; do not invent one.
3. Shared programmer playbook: `/home/box/reference/PLAYBOOK.md`.

## Run / test
```bash
npm ci
npm run glossary          # if public/glossary.json is missing
npm run dev               # http://localhost:5173
npm test                  # scripts/validate-library.mjs + vitest (src/**/*.test.ts)
npm run build             # tsc --noEmit && vite build
npm run e2e / e2e:en      # Playwright, optional
```
Run only focused tests locally. CI (`.github/workflows/ci.yml`) runs the full suite (`npm test`) on every push and pull request; do not deploy until that CI is green.

## Hard rules
- No deploy, push to `main`, paid service, or delete without Chad's approval in his own words.
- Commit as `Chadfire <chadfire10@yahoo.com>`. Never commit or print secrets, tokens, or user data.
- Pushing `main` deploys the live site via `.github/workflows/deploy.yml`. Work on a feature branch.
- Guest IndexedDB is tied to the hostname `duki.chadmurchison.com`; do not change it.
- Backend (Cognito, Lambda `duki-sync`, S3) lives outside this repo (`portfolio-infra` / AWS). Do not change AWS from here.
- Do not touch `C:\Users\chadf\Desktop\Repos\Duki` on Chad's PC; work from a box or GitHub copy.
- Coordinate with in-flight branches before editing shared files.

## Deploy (only when approved)
1. Record the current Cloudflare Pages deployment ID for rollback (project `chadmurchison-duki`).
2. Production: push to `main`. CI runs `npm ci && npm test && npm run build`, `./scripts/build-pages.sh dist-pages`, then `pages deploy dist-pages --project-name=chadmurchison-duki --branch=main`.
3. CI sets `VITE_DUKI_API` and `VITE_COGNITO_*` (see the workflow). A preview may set `VITE_DUKI_CLOUD_SYNC=off` to stay local-only.
4. Manual preview: assemble `dist-pages` the same way and deploy to a Pages branch other than `main`. Never `--branch=main` unless Chad approved going live.
5. Rollback: redeploy the recorded prior Pages deployment. AWS login and sync are unchanged by a Pages rollback.

## Keep current
Changed layout, commands, or deploy? Update this file and `REPO-MAP.md` in the same commit.
