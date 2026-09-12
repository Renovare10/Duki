You are continuing **Duki**. Do **not** rewrite the app. Do **not** add Cognito, AWS, accounts, or a backend. Patch Home/shelves, hash routes, and a Share button. Keep `npm test` and `npm run build` green.

Grok: you implement. You do not write a plan and stop. You also do **not** “simplify” the home into Recommended-only.

# Phase 1 only (this pass)

## 1. Put the category shelves back — this is the product

The home must feel like a library you can scroll forever.

**Bug:** default filter is `just-right`. `inBase` hides unscored stubs unless `level === "all"`, so Wikipedia / Gutenberg / Wikisource / most category carousels vanish. That is a regression. Fix it.

**Required home, top to bottom (skip a row only if it has zero cards):**

1. Recommended — up to 3 cards: Easy, Just right, Harder (still-teaches, never 100% known, Harder cap 20%)
2. Continue
3. Then **every category carousel**, always, even when Just right is selected:
   Stories, Children’s, Science, History, Graded, Articles, Novels, Wikipedia, Wikisource, Gutenberg, Yours

Unread / Read stay as extra rows if useful, after Continue, **before** categories.

**Level chips (Just right / Easy / Harder / All / Already known):**
- They **sort and badge** cards. They must **not** delete category rows.
- Unscored stubs stay on category shelves (button: “Score” — fetch preview, stay on home, show % unknown). They are not Harder-by-default.
- Just right / Easy / Harder may **reorder** a category track (matching cards first). If nothing in that category matches the chip, still show the shelf (stubs + other levels), do not hide it.
- Default landing filter: **All levels** so the library is visible on first paint. Remember the last chip in localStorage if you want.

Click a **shelf title** → full grid of that category (`#/shelf/story` etc.). Back → home.

Keep filter chips + search. Horizontal carousel + snap as now.

Every card: title, blurb, category, fit if scored, read/unread, % unknown, unique new, Score vs Read.

## 2. Navigation (hash routes — already started)

Keep hash routing (S3/CloudFront friendly). Canonical:

| Hash | Screen |
|---|---|
| `#/` | Home library |
| `#/shelf/:id` | Full shelf grid |
| `#/read/:id` | Reader |
| `#/review` | Review |
| `#/stats` | Stats |
| `#/add` | Paste (side door) |

Shareable catalog links (in addition to internal id):

- `#/r/wiki/{zhTitle}`
- `#/r/gutenberg/{gutendexId}`
- `#/r/wikisource/{title}`
- `#/r/local/{id}` for originals / pastes

Opening `#/r/...` loads/scores that text and goes to the reader (or scores first if body empty, then read). Guest works. Do not put lexicon in the URL.

Top bar: **Duki** (home) | Review | Stats | Add text. No account menu yet.

## 3. Share in the reader

Sticky reader chrome already has I’m done + fonts. Add **Share**:

- Copy `https://{current-origin}/{hash}` for this text (`#/r/...` preferred).
- `navigator.clipboard.writeText`. If `navigator.share` exists (phone), offer that too.
- Toast: “Link copied”.
- Shared link never includes words known / bookmarks.

## 4. Do not regress

Blue = never graded; red = Don’t know (immediate); yellow = Barely; Okay = plain.
Title grades like body. Dock does not cover last line. I’m done + fonts stay visible.
Paste is a side door. Never auto-mark known. No Libgen. No copyrighted commercial books.
Do **not** remove EDITORIAL category shelves from `buildShelves`.
Do **not** add login.

# Done when

- Home shows category carousels on first load (All levels default)
- Just right chip does not wipe Wikipedia/Stories/etc.
- Shelf title opens the full category
- Share copies a `#/r/...` link that opens that text
- `npm test` and `npm run build` pass

# Not this pass (do not implement)

Accounts, Cognito, Dynamo, deploy to chadmurchison.com, subdomain Terraform. Hermes will do infra later.
