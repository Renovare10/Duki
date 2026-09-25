/** Sentence ends a learner would want spoken as one breath. */
const BREAK = /[。！？!?；;\n]/;
const PAUSE = /[，、,]/;
/** Chrome drops an utterance that runs too long. Keep pieces short. */
const MAX_CHARS = 80;

export type SpeechChunk = { text: string; start: number; end: number };

/** Spoken pieces of a story. Punctuation stays with its sentence. */
export function speechChunks(body: string): SpeechChunk[] {
  const chunks: SpeechChunk[] = [];
  let start = 0;
  for (let i = 0; i < body.length; i++) {
    if (!BREAK.test(body[i])) continue;
    chunks.push(...splitLong(body, start, i + 1));
    start = i + 1;
  }
  chunks.push(...splitLong(body, start, body.length));
  return chunks;
}

function splitLong(body: string, start: number, end: number): SpeechChunk[] {
  const raw = body.slice(start, end);
  const lead = raw.length - raw.trimStart().length;
  const spoken = raw.trim();
  if (!spoken) return [];
  const from = start + lead;
  const to = from + spoken.length;
  if (spoken.length <= MAX_CHARS) return [{ text: spoken, start: from, end: to }];

  let breakAt = -1;
  const limit = Math.min(MAX_CHARS, spoken.length - 1);
  for (let i = limit; i >= 12; i--) {
    if (PAUSE.test(spoken[i])) {
      breakAt = i + 1;
      break;
    }
  }
  if (breakAt < 0) return [{ text: spoken, start: from, end: to }];
  return [...splitLong(body, from, from + breakAt), ...splitLong(body, from + breakAt, to)];
}

export type VoiceLike = { lang: string };

/** A Mandarin voice. Cantonese (zh-HK) is not a stand-in. */
export function mandarinVoice<T extends VoiceLike>(voices: T[]): T | null {
  const lang = (voice: T) => voice.lang.toLowerCase().replaceAll("_", "-");
  const zh = voices.filter((voice) => {
    const code = lang(voice);
    return code.startsWith("zh") && !code.startsWith("zh-hk") && !code.includes("yue");
  });
  return (
    zh.find((voice) => lang(voice).startsWith("zh-cn")) ??
    zh.find((voice) => lang(voice).startsWith("zh-tw")) ??
    zh[0] ??
    null
  );
}

export type SpeakSupport = "hidden" | "ready" | "none";

/**
 * No speech engine: hide the control.
 * Engine, but no Mandarin voice once the list is known: explain, do not offer Play.
 * List not loaded yet: show Play. Chrome's list is empty until voiceschanged.
 */
export function speakSupport(
  hasSynth: boolean,
  voices: VoiceLike[],
  voicesKnown: boolean,
): SpeakSupport {
  if (!hasSynth) return "hidden";
  if (voices.length === 0 && !voicesKnown) return "ready";
  return mandarinVoice(voices) ? "ready" : "none";
}

export function tokensInRange(
  tokens: { text: string }[],
  start: number,
  end: number,
): { from: number; to: number } {
  let pos = 0;
  let from = -1;
  let to = -1;
  for (let i = 0; i < tokens.length; i++) {
    const next = pos + tokens[i].text.length;
    if (next > start && pos < end) {
      if (from < 0) from = i;
      to = i + 1;
    }
    pos = next;
  }
  return { from, to };
}
