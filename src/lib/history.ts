import type { ReviewGrade, WordEvent, WordRecord, WordStatus } from "../types";

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Build the history row for one reader tap or review grade (prev = record before the change). */
export function makeWordEvent(
  prev: WordRecord | undefined,
  next: WordRecord,
  source: WordEvent["source"],
  grade?: ReviewGrade,
  id: string = newId(),
): WordEvent {
  const event: WordEvent = {
    id,
    hanzi: next.hanzi,
    at: next.updatedAt || Date.now(),
    source,
    prevStatus: prev ? prev.status : null,
    status: next.status,
    prevIntervalDays: prev?.intervalDays ?? 0,
    intervalDays: next.intervalDays,
  };
  if (source === "review" && grade) event.grade = grade;
  return event;
}

const STATUSES: readonly WordStatus[] = ["unknown", "shaky", "known"];
const GRADES: readonly ReviewGrade[] = ["again", "hard", "good", "easy"];

/** Defensive read of a stored row; returns null for anything malformed. */
export function normalizeEvent(raw: unknown): WordEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<WordEvent>;
  if (typeof r.id !== "string" || typeof r.hanzi !== "string" || !r.hanzi) return null;
  if (typeof r.at !== "number" || !Number.isFinite(r.at)) return null;
  if (r.source !== "review" && r.source !== "read") return null;
  if (!r.status || !STATUSES.includes(r.status)) return null;
  const prevStatus = r.prevStatus && STATUSES.includes(r.prevStatus) ? r.prevStatus : null;
  const event: WordEvent = {
    id: r.id,
    hanzi: r.hanzi,
    at: r.at,
    source: r.source,
    prevStatus,
    status: r.status,
    prevIntervalDays: typeof r.prevIntervalDays === "number" ? r.prevIntervalDays : 0,
    intervalDays: typeof r.intervalDays === "number" ? r.intervalDays : 0,
  };
  if (r.source === "review" && r.grade && GRADES.includes(r.grade)) event.grade = r.grade;
  return event;
}
