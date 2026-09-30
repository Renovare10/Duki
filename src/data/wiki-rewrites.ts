/**
 * Original Mandarin shorts inspired by Wikipedia animal/science topics.
 * Rights-clean: Duki-owned text; `source` cites Wikipedia CC BY-SA article URLs.
 * Offline batch only — not generated at runtime (no LLM in frontend/lambdas).
 * Target: mid-band unknown load (~5–20% under HSK 1–3 proxy; science may run ~20–26%).
 */
import type { LibraryText } from "../types";
import { WIKI_REWRITE_ANIMALS } from "./wiki-rewrite-animals";
import { WIKI_REWRITE_SCIENCE } from "./wiki-rewrite-science";

export const WIKI_REWRITES: LibraryText[] = [
  ...WIKI_REWRITE_ANIMALS,
  ...WIKI_REWRITE_SCIENCE,
];
