import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import type { SessionFeedback, JobResponse } from "@/types/domain";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const feedbackKeys = {
  all: ["feedback"] as const,
  session: (sessionId: string) =>
    [...feedbackKeys.all, sessionId] as const,
  report: (sessionId: string) =>
    [...feedbackKeys.all, "report", sessionId] as const,
};

// ─── Raw API calls ───────────────────────────────────────────────────────────

const feedbackApi = {
  getSessionFeedback: (sessionId: string) =>
    apiClient
      .get<SessionFeedback>(`/sessions/${sessionId}/feedback`)
      .then((res) => res.data),

  regenerateFeedback: (sessionId: string) =>
    apiClient
      .post<JobResponse>(`/sessions/${sessionId}/feedback/regenerate`)
      .then((res) => res.data),

  getReport: (sessionId: string) =>
    apiClient
      .get<{ reportUrl: string }>(`/sessions/${sessionId}/feedback/report`)
      .then((res) => res.data),

  /**
   * POST generates the PDF inline on the server and returns the signed URL
   * in the same response — no polling needed.
   */
  generateReport: (sessionId: string) =>
    apiClient
      .post<{ reportUrl: string }>(`/sessions/${sessionId}/feedback/report`)
      .then((res) => res.data),
};

export async function generateAndFetchReport(
  sessionId: string,
): Promise<{ reportUrl: string }> {
  return feedbackApi.generateReport(sessionId);
}

// ─── React Query hooks ───────────────────────────────────────────────────────

export function useSessionFeedback(sessionId: string) {
  return useQuery({
    queryKey: feedbackKeys.session(sessionId),
    queryFn: () => feedbackApi.getSessionFeedback(sessionId),
    enabled: !!sessionId,
    retry: false,
  });
}

export function useRegenerateFeedback() {
  return useMutation({
    mutationFn: feedbackApi.regenerateFeedback,
  });
}

export function useFeedbackReport(sessionId: string) {
  return useQuery({
    queryKey: feedbackKeys.report(sessionId),
    queryFn: () => feedbackApi.getReport(sessionId),
    enabled: false, // triggered on demand
  });
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: feedbackApi.generateReport,
  });
}
