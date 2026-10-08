import { classicFile } from "./remote-meta";

export type ClassicBody = {
  id: string;
  title: string;
  url?: string;
  original: string;
  simplified: string;
};

/** Public-domain Wikisource text: original traditional plus a char-aligned Simplified copy. */
export async function loadClassic(id: string): Promise<ClassicBody | null> {
  const file = classicFile(id);
  if (!file) return null;
  const res = await fetch(`/classics/${file}.json`);
  if (!res.ok) return null;
  const data = (await res.json()) as Partial<ClassicBody>;
  if (!data.original || !data.simplified) return null;
  return {
    id: data.id || id,
    title: data.title || "",
    url: data.url,
    original: data.original,
    simplified: data.simplified,
  };
}
