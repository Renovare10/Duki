import { REMOTE_META } from "../data/remote-meta.generated";

/**
 * Build-time scores for Wikipedia and Wikisource pages.
 * `meta` values are [level 1–10, score × 100, Han characters, word tokens].
 * `classics` values are [gloss coverage of the original, gloss coverage in Simplified].
 * `files` values are the hash used in `public/classics/<hash>.json`.
 */
export type RemoteMetaFile = {
  meta: Record<string, readonly [number, number, number, number]>;
  classics: Record<string, readonly [number, number]>;
  files: Record<string, string>;
  failed: { id: string; error: string }[];
};

export function remoteMeta(id: string): readonly [number, number, number, number] | undefined {
  return REMOTE_META.meta[id];
}

export function hasRemoteMeta(id: string): boolean {
  return Boolean(REMOTE_META.meta[id]);
}

export function classicFile(id: string): string | null {
  return REMOTE_META.files[id] ?? null;
}
