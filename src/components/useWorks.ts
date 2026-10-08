import { useEffect, useState } from "react";
import type { VocabProfile } from "../lib/difficulty";
import { loadToc, loadWorkProfile, type WorkToc } from "../lib/works";

/** Fetch each work's vocabulary profile once `enabled` (personal known-%). */
export function useWorkProfiles(ids: string[], enabled: boolean): Map<string, VocabProfile> {
  const [profiles, setProfiles] = useState<Map<string, VocabProfile>>(new Map());
  const key = ids.join("|");
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    for (const id of ids) {
      if (profiles.has(id)) continue;
      loadWorkProfile(id)
        .then((p) => {
          if (!cancelled) setProfiles((prev) => new Map(prev).set(id, p));
        })
        .catch(() => {
          /* card just shows no personal % */
        });
    }
    return () => {
      cancelled = true;
    };
  }, [key, enabled]);
  return profiles;
}

/** Fetch tables of contents for the given works (only the started ones, on Home). */
export function useWorkTocs(ids: string[]): Map<string, WorkToc> {
  const [tocs, setTocs] = useState<Map<string, WorkToc>>(new Map());
  const key = ids.join("|");
  useEffect(() => {
    let cancelled = false;
    for (const id of ids) {
      if (tocs.has(id)) continue;
      loadToc(id)
        .then((t) => {
          if (!cancelled) setTocs((prev) => new Map(prev).set(id, t));
        })
        .catch(() => {
          /* continue row falls back to the last opened chapter */
        });
    }
    return () => {
      cancelled = true;
    };
  }, [key]);
  return tocs;
}
