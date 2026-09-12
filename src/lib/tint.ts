import type { WordRecord } from "../types";

export type WordTint = "new" | "unknown" | "shaky" | "known";

/** Visual state: ungraded is blue, Don’t know is red. */
export function wordTint(record: WordRecord | undefined): WordTint {
  if (!record) return "new";
  if (record.status === "known") return "known";
  if (record.status === "shaky") return "shaky";
  const taps = record.dontKnowCount + record.barelyCount + record.okayCount;
  if (taps <= 0) return "new";
  return "unknown";
}
