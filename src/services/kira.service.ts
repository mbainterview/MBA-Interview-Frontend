import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import type {
  KiraSession,
  KiraResponse,
  KiraPrompt,
  JobResponse,
} from "@/types/domain";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const kiraKeys = {
  all: ["kira"] as const,
  sessions: () => [...kiraKeys.all, "sessions"] as const,
  session: (id: string) => [...kiraKeys.all, "session", id] as const,
  prompts: (schoolId?: string) =>
    [...kiraKeys.all, "prompts", schoolId] as const,
  feedback: (sessionId: string, responseId: string) =>
    [...kiraKeys.all, "feedback", sessionId, responseId] as const,
  playback: (sessionId: string, responseId: string) =>
    [...kiraKeys.all, "playback", sessionId, responseId] as const,
  configuration: () => [...kiraKeys.all, "configuration"] as const,
};

export interface KiraClientConfiguration {
  id: string;
  prepTimeSeconds: number;
  responseTimeSeconds: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  interviewLength: number;
  followUpDepth: "light" | "medium" | "deep";
  tone: "formal" | "conversational" | "analytical";
  format: "behavioral" | "case" | "mixed";
}

// ─── Raw API calls ───────────────────────────────────────────────────────────

const kiraApi = {
  startSession: (data: { schoolId?: string; promptCount?: number }) =>
    apiClient
      .post<KiraSession>("/kira/sessions", data)
      .then((res) => res.data),

  getSessions: () =>
    apiClient
      .get<KiraSession[]>("/kira/sessions")
      .then((res) => res.data),

  getSession: (id: string) =>
    apiClient
      .get<KiraSession>(`/kira/sessions/${id}`)
      .then((res) => res.data),

  uploadResponse: (
    sessionId: string,
    responseId: string,
    file: File,
    durationSeconds?: number,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    if (durationSeconds !== undefined) {
      formData.append("durationSeconds", String(durationSeconds));
    }
    return apiClient
      .post<JobResponse>(
        `/kira/sessions/${sessionId}/responses/${responseId}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      )
      .then((res) => res.data);
  },

  getFeedback: (sessionId: string, responseId: string) =>
    apiClient
      .get<KiraResponse>(
        `/kira/sessions/${sessionId}/responses/${responseId}/feedback`,
      )
      .then((res) => res.data),

  getPlayback: (sessionId: string, responseId: string) =>
    apiClient
      .get<{ playbackUrl: string }>(
        `/kira/sessions/${sessionId}/responses/${responseId}/playback`,
      )
      .then((res) => res.data),

  getPrompts: (schoolId?: string) =>
    apiClient
      .get<KiraPrompt[]>("/kira/prompts", {
        params: schoolId ? { schoolId } : undefined,
      })
      .then((res) => res.data),

  getConfiguration: () =>
    apiClient
      .get<KiraClientConfiguration>("/kira/configuration")
      .then((res) => res.data),
};

// ─── React Query hooks ───────────────────────────────────────────────────────

export function useStartKiraSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: kiraApi.startSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kiraKeys.sessions() });
    },
  });
}

export function useKiraSessions() {
  return useQuery({
    queryKey: kiraKeys.sessions(),
    queryFn: kiraApi.getSessions,
  });
}

export function useKiraSession(id: string) {
  return useQuery({
    queryKey: kiraKeys.session(id),
    queryFn: () => kiraApi.getSession(id),
    enabled: !!id,
  });
}

export function useUploadKiraResponse(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      responseId,
      file,
      durationSeconds,
    }: {
      responseId: string;
      file: File;
      durationSeconds?: number;
    }) => kiraApi.uploadResponse(sessionId, responseId, file, durationSeconds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: kiraKeys.session(sessionId),
      });
    },
  });
}

export function useKiraFeedback(sessionId: string, responseId: string) {
  return useQuery({
    queryKey: kiraKeys.feedback(sessionId, responseId),
    queryFn: () => kiraApi.getFeedback(sessionId, responseId),
    enabled: !!sessionId && !!responseId,
  });
}

export function useKiraPlayback(sessionId: string, responseId: string) {
  return useQuery({
    queryKey: kiraKeys.playback(sessionId, responseId),
    queryFn: () => kiraApi.getPlayback(sessionId, responseId),
    enabled: false, // triggered on demand
  });
}

export function useKiraPrompts(schoolId?: string) {
  return useQuery({
    queryKey: kiraKeys.prompts(schoolId),
    queryFn: () => kiraApi.getPrompts(schoolId),
  });
}

export function useKiraConfiguration() {
  return useQuery({
    queryKey: kiraKeys.configuration(),
    queryFn: kiraApi.getConfiguration,
    staleTime: 60 * 1000,
  });
}
