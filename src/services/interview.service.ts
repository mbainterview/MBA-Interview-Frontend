import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import type {
  InterviewSession,
  InterviewSessionDetail,
  JobResponse,
} from "@/types/domain";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const sessionKeys = {
  all: ["sessions"] as const,
  lists: () => [...sessionKeys.all, "list"] as const,
  details: () => [...sessionKeys.all, "detail"] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as const,
};

export const interviewConfigKeys = {
  all: ["interview-configuration"] as const,
  scope: (schoolId?: string | null) =>
    [...interviewConfigKeys.all, schoolId ?? "general"] as const,
};

export interface InterviewClientConfiguration {
  id: string;
  schoolId: string | null;
  difficulty: "beginner" | "intermediate" | "advanced";
  interviewLength: number;
  followUpDepth: "light" | "medium" | "deep";
  tone: "formal" | "conversational" | "analytical";
  format: "behavioral" | "case" | "mixed";
  focusAreas: string[];
}

/** Mirrors the backend `BulkAnswerItem` DTO. */
export interface BulkAnswerItem {
  turnIndex: number;
  answer: string;
  responseMode?: "text" | "audio" | "video";
  recordingKey?: string;
}

/** Response shape for POST /sessions/:id/transcribe. */
export interface TranscribeRecordingResponse {
  transcript: string;
  recordingKey: string;
  mediaType: "audio" | "video";
}

// ─── Raw API calls ───────────────────────────────────────────────────────────

const interviewApi = {
  getSessions: () =>
    apiClient
      .get<InterviewSession[]>("/sessions")
      .then((res) => res.data),

  getSession: (id: string) =>
    apiClient
      .get<InterviewSessionDetail>(`/sessions/${id}`)
      .then((res) => res.data),

  startSession: (data: { schoolId?: string; questionCount?: number }) =>
    apiClient
      .post<InterviewSession>("/sessions", data)
      .then((res) => res.data),

  submitAnswer: (sessionId: string, data: { answer: string }) =>
    apiClient
      .post<JobResponse>(`/sessions/${sessionId}/answer`, data)
      .then((res) => res.data),

  submitAndComplete: (
    sessionId: string,
    answers: BulkAnswerItem[],
  ) =>
    apiClient
      .post<InterviewSession>(
        `/sessions/${sessionId}/submit-and-complete`,
        { answers },
      )
      .then((res) => res.data),

  /**
   * Upload an audio/video recording, transcribe via the backend, and persist
   * the file to storage — WITHOUT advancing the session. Used by the
   * onboarding diagnostic where each turn's transcript is collected locally
   * and the whole set is submitted in one bulk call at the end.
   */
  transcribeRecording: (sessionId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<TranscribeRecordingResponse>(
        `/sessions/${sessionId}/transcribe`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          // Transcription of a ~90s clip can take 30-90s depending on the
          // provider. 60s was too tight in practice; 120s gives margin.
          timeout: 120000,
        },
      )
      .then((res) => res.data);
  },

  pauseSession: (id: string) =>
    apiClient
      .post<InterviewSession>(`/sessions/${id}/pause`)
      .then((res) => res.data),

  resumeSession: (id: string) =>
    apiClient
      .post<InterviewSessionDetail>(`/sessions/${id}/resume`)
      .then((res) => res.data),

  recoverSession: (id: string) =>
    apiClient
      .get<InterviewSessionDetail>(`/sessions/${id}/recover`)
      .then((res) => res.data),

  sendHeartbeat: (id: string) =>
    apiClient.post(`/sessions/${id}/heartbeat`),

  completeSession: (id: string) =>
    apiClient
      .post<InterviewSession>(`/sessions/${id}/complete`)
      .then((res) => res.data),

  uploadRecording: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<JobResponse>(`/sessions/${id}/recording`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },

  /** Upload video recording, transcribe via Gemini, and submit transcription as answer */
  submitAnswerWithRecording: (sessionId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<{ jobId: string; transcription: string }>(
        `/sessions/${sessionId}/answer-recording`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 60000, // 60s timeout for transcription
        },
      )
      .then((res) => res.data);
  },
};

// ─── React Query hooks ───────────────────────────────────────────────────────

export function useSessions() {
  return useQuery({
    queryKey: sessionKeys.lists(),
    queryFn: interviewApi.getSessions,
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: sessionKeys.detail(id),
    queryFn: () => interviewApi.getSession(id),
    enabled: !!id,
    // Refetch once if questions haven't loaded yet
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2000;
      if (!data.plannedQuestions?.length && data.status !== "completed") {
        return 3000;
      }
      return false;
    },
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: interviewApi.startSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
    },
  });
}

export function useSubmitAnswer(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { answer: string }) =>
      interviewApi.submitAnswer(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(sessionId),
      });
    },
  });
}

export function usePauseSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: interviewApi.pauseSession,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(data.id),
      });
    },
  });
}

export function useResumeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: interviewApi.resumeSession,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(data.id),
      });
    },
  });
}

export function useRecoverSession(id: string) {
  return useQuery({
    queryKey: [...sessionKeys.detail(id), "recover"],
    queryFn: () => interviewApi.recoverSession(id),
    enabled: false, // manual trigger only
  });
}

export function useUploadRecording(sessionId: string) {
  return useMutation({
    mutationFn: (file: File) => interviewApi.uploadRecording(sessionId, file),
  });
}

export function useSubmitAnswerWithRecording(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) =>
      interviewApi.submitAnswerWithRecording(sessionId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(sessionId),
      });
    },
  });
}

export function useCompleteSession(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => interviewApi.completeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(sessionId),
      });
    },
  });
}

export function useSubmitAndComplete(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { answers: BulkAnswerItem[] }) =>
      interviewApi.submitAndComplete(sessionId, data.answers),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(sessionId),
      });
    },
  });
}

export function useTranscribeRecording(sessionId: string) {
  return useMutation({
    mutationFn: (file: File) =>
      interviewApi.transcribeRecording(sessionId, file),
  });
}

export function useSendHeartbeat(sessionId: string) {
  return useMutation({
    mutationFn: () => interviewApi.sendHeartbeat(sessionId),
  });
}

// ─── Simplified results (used by diagnostic results screen) ────────────────

export interface SessionResults {
  sessionId: string;
  status: "pending" | "ready";
  readinessScore: number | null;
  strengths: string[];
  improvements: string[];
  overallSummary: string | null;
  suggestedFocusAreas: string[];
}

const sessionResultsApi = {
  getResults: (sessionId: string) =>
    apiClient
      .get<SessionResults>(`/sessions/${sessionId}/results`)
      .then((res) => res.data),
};

export function useSessionResults(sessionId: string | undefined) {
  return useQuery({
    queryKey: [...sessionKeys.detail(sessionId ?? ""), "results"],
    queryFn: () => sessionResultsApi.getResults(sessionId as string),
    enabled: !!sessionId,
    refetchInterval: (query) =>
      query.state.data?.status === "ready" ? false : 2500,
  });
}

// ─── Public AI Interview configuration ──────────────────────────────────────

const interviewConfigApi = {
  getConfiguration: (schoolId?: string | null) =>
    apiClient
      .get<InterviewClientConfiguration>("/interview/configuration", {
        params: schoolId ? { schoolId } : undefined,
      })
      .then((res) => res.data),
};

export function useInterviewConfiguration(schoolId?: string | null) {
  return useQuery({
    queryKey: interviewConfigKeys.scope(schoolId),
    queryFn: () => interviewConfigApi.getConfiguration(schoolId ?? null),
    staleTime: 60 * 1000,
  });
}
