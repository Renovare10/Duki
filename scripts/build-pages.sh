#!/usr/bin/env bash
# Assemble the Cloudflare Pages output (default ./dist-pages) from the Vite build in ./dist
# (run `npm run build` first) plus deploy/pages/_headers and _redirects.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$ROOT/dist-pages}"
test -f "$ROOT/dist/index.html" || { echo "dist/ missing: run npm run build first"; exit 1; }
test ! -e "$ROOT/dist/404.html" || { echo "dist/404.html would disable the SPA fallback"; exit 1; }
rm -rf "$OUT" && mkdir -p "$OUT"
cp -r "$ROOT/dist"/. "$OUT"/
cp "$ROOT/deploy/pages/_headers" "$ROOT/deploy/pages/_redirects" "$OUT/"
# A missing hashed file under /assets/ is a real 404 (otherwise the SPA fallback would serve
# index.html there with the 1-year immutable header). Everything else keeps the SPA fallback.
cp "$ROOT/deploy/pages/assets-404.html" "$OUT/assets/404.html"
big=$(find "$OUT" -type f -size +25M); [ -z "$big" ] || { echo "Files over the 25 MiB Pages limit: $big"; exit 1; }
n=$(find "$OUT" -type f | wc -l); [ "$n" -lt 20000 ] || { echo "Too many files for Pages: $n"; exit 1; }
echo "Pages output: $OUT ($n files, $(du -sh "$OUT" | cut -f1))"
