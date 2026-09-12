You are continuing **Duki**. Do **not** rewrite the app. Do **not** add accounts, Cognito, AWS, or Gutenberg proxy code. Keep `npm test` and `npm run build` green. Add tests for click routing and Wikisource parse fallbacks.

# 1. Card clicks

`TitleCard.onHit` currently: empty body → Score, else Read. Wrong.

| Click | Action |
|---|---|
| **Unscored** badge (and only that / the Score button) | `onScore` — fetch preview, stay on Home |
| **Cover, title, blurb** | `onOpen` — open the reader (fetch full text if body empty) |
| **Score / Read / Mark read / Remove** | existing bottom buttons; `stopPropagation` so they don’t fire the hit target |

Do not score when the user is trying to read. Do not open the reader when they tap Unscored.

# 2. Wikisource actually loads

Many `WIKISOURCE_SEED.wsTitle` values 404 or return empty extracts (`西游记/第001回`, `红楼梦/第一回`, etc.).

- Hit `https://zh.wikisource.org/w/api.php` with `origin=*` and **verify every seed title**. Use the canonical title Wikisource actually has (search API if needed). Prefer chapter pages that return plain extract text.
- `redirects=1` already — keep it.
- If `extract` is empty: fall back to `action=parse&prop=wikitext` or `prop=text`, strip markup/templates to readable paragraphs. If still empty, set a quiet error **on that card only**.
- Don’t use `exchars` so small that classics come back blank; chapter-sized is fine, cap ~12–20k chars for the reader.
- Tests: `parseWsExtract` on a missing page vs a page with extract vs empty extract → fallback path.

Keep Wikipedia + original stories as they are.

# 3. Do not touch

`fetchGutenbergText` / Gutendex download. Hermes is adding a CORS proxy. Leave Gutenberg fetch as-is.

Do not regress: category carousels, All levels default, Share `#/r/...`, blue/red/yellow grades, sticky I’m done, dock padding.

# Done when

- Unscored badge scores; cover/title opens the story
- Wikisource seed chapters open in the reader with Chinese text (spot-check 论语, 西游记, 鲁迅)
- Failed titles error on the card, not a blank library
- `npm test` and `npm run build` pass
