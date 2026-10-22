# Duki reader settings + import/export audit (from Chad, Oct 21 2026 8:46 PM ET)

Repo: this folder (GitHub Renovare10/Duki, Vite + React + TS). Push is DISABLED and must stay that way; Rocky publishes after Chad approves.
Start a new branch `reader-settings` from origin/main (40e091a, the live site). Do not touch the Wikipedia stories or library pack text. Never break or migrate away existing user data (saved settings, known words, stories): new settings need safe defaults and must read old saved data fine.

## 1. Highlight style toggle
- Add a reader setting to switch highlighted words between "Normal" (single plain highlight, no color levels) and "Color-coded" (current color scheme). Default = current behavior. Persist it like the other settings (and per user when logged in, if settings sync).

## 2. Word info bar on mobile
- Investigate the bottom word info bar/card: its slide-down/dismiss animation is choppy on mobile. Make it smooth (transform/translate + will-change, no layout-thrashing height/top animations, requestAnimationFrame for drag-follow, passive touch listeners, avoid re-rendering the whole text on each move). Test at 390x844 with CPU throttling. Explain the cause in your summary.

## 3. Bigger characters + text width
- Raise the max font size for the Chinese characters well beyond the current max (good for desktop reading). Add a "Text width" setting (e.g. narrow / medium / wide / full, or a slider) that sets the reading column max-width. Both persist. Check desktop and mobile; nothing overflows.

## 4. Import/export + storage limits (investigate first, then fix)
- Document how import and export work today (what's stored where: localStorage vs backend/DB/object storage, what an export file contains, what import does).
- Chad's rule: a verified user can have many stories, but each user's TOTAL storage must be capped at a reasonable amount (no unlimited storage). Propose a cap (e.g. ~50 MB per verified user, with per-story size limit) with reasoning, and implement it server-side where stories are stored server-side (client-side checks alone are not enough), plus a friendly message near the limit and showing usage. Unverified/anonymous users get a smaller cap or local-only. Never delete existing stories that are already over the cap; just block new uploads until under.
- If the backend can't be changed from this repo, say exactly what's needed.

## Done when
- Build + existing tests pass; add tests for the cap and the new settings.
- Screenshots in docs/shots/reader-settings-*.png (toggle both modes, large characters + width on desktop, mobile word bar).
- docs/IMPORT-EXPORT.md explains the flow and the cap.
- Commit on branch reader-settings (no push). Comment a short summary on the card with how to preview locally (dev server command + URL).

> Update (Oct 21, 9:20 PM): Chad set the cap to **1 MB (1,000,000 bytes) total per verified user** and **512,000 bytes per story**; this supersedes the ~50 MB example above. See docs/IMPORT-EXPORT.md.
