/**
 * Traditional ↔ simplified for classical texts.
 * Word records stay under the key they were first saved with.
 * New marks use the simplified glossary key. Lookups try both.
 */

export type ScriptChoice = "simplified" | "traditional";

const SCRIPT_KEY = "duki.classicScript";

export function loadScriptChoice(): ScriptChoice {
  try {
    return window.localStorage.getItem(SCRIPT_KEY) === "traditional" ? "traditional" : "simplified";
  } catch {
    return "simplified";
  }
}

export function saveScriptChoice(choice: ScriptChoice): void {
  try {
    window.localStorage.setItem(SCRIPT_KEY, choice);
  } catch {
    /* private mode */
  }
}

/**
 * Key to read or write for a tapped word.
 * An existing record wins so we never rename stored hanzi.
 * Otherwise the simplified glossary form is stored.
 */
export function markKey(glossKey: string, surface: string, has: (key: string) => boolean): string {
  if (has(glossKey)) return glossKey;
  if (surface !== glossKey && has(surface)) return surface;
  return glossKey;
}

/** Traditional glyphs for the same spans as a simplified segmentation, when the strings are aligned. */
export function surfaceFor(
  token: string,
  offset: number,
  tradBody: string | null,
  script: ScriptChoice,
): string {
  if (script === "traditional" && tradBody) return tradBody.slice(offset, offset + token.length);
  return token;
}
