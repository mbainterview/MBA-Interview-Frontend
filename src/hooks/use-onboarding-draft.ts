"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "mba.onboarding";

export interface OnboardingDraft {
  profile?: {
    education?: string;
    yearsExperience?: number;
    country?: string;
    timezone?: string;
  };
  resume?: {
    fileName?: string;
    parsed?: {
      education?: string;
      experience?: string;
      skills?: string;
    };
  };
  schools?: string[];
  kiraSelected?: boolean;
  goals?: string[];
  feedbackLevel?: "beginner" | "advanced";
  diagnostic?: {
    sessionId?: string;
    /**
     * Response modality chosen by the user on the intro screen, applied to
     * every one of the 10 questions for this diagnostic. Set once before the
     * session starts and treated as immutable for the rest of the flow.
     */
    mode?: "text" | "audio" | "video";
    answers?: Record<number, string>;
    /**
     * Per-question metadata captured when the user answered with audio or
     * video. Kept as a parallel map so the existing `answers` shape stays
     * backwards-compatible with already-persisted drafts in user browsers.
     */
    answersMeta?: Record<
      number,
      { mode: "text" | "audio" | "video"; recordingKey?: string }
    >;
    completedAt?: string;
  };
}

const EMPTY: OnboardingDraft = {};
const listeners = new Set<() => void>();
let cachedSnapshot: OnboardingDraft = EMPTY;
let cachedRaw: string | null = null;

function readFromStorage(): OnboardingDraft {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  try {
    cachedSnapshot = raw ? (JSON.parse(raw) as OnboardingDraft) : EMPTY;
  } catch {
    cachedSnapshot = EMPTY;
  }
  return cachedSnapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function writeToStorage(next: OnboardingDraft) {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(next);
    window.sessionStorage.setItem(STORAGE_KEY, serialized);
    cachedRaw = serialized;
    cachedSnapshot = next;
  } catch {
    /* ignore quota errors */
  }
  listeners.forEach((l) => l());
}

/**
 * Lightweight session-scoped state for the multi-step onboarding wizard.
 * Persists to sessionStorage so refreshes don't lose progress, but doesn't
 * survive a browser close. The wizard's last step submits the full draft.
 */
export function useOnboardingDraft() {
  const draft = useSyncExternalStore(
    subscribe,
    readFromStorage,
    () => EMPTY,
  );

  const update = useCallback((patch: Partial<OnboardingDraft>) => {
    writeToStorage({ ...readFromStorage(), ...patch });
  }, []);

  const clear = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
    cachedRaw = null;
    cachedSnapshot = EMPTY;
    listeners.forEach((l) => l());
  }, []);

  return { draft, update, clear };
}
