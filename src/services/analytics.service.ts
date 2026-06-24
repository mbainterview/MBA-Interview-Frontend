import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import type { ListParams } from "@/types/api";
import type {
  OverallStats,
  HistoryItem,
  HistoryResponse,
  TrendPoint,
  SkillBreakdownItem,
  SchoolInsights,
  UsageStats,
  UsageHistoryPoint,
} from "@/types/domain";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const analyticsKeys = {
  all: ["analytics"] as const,
  overview: () => [...analyticsKeys.all, "overview"] as const,
  history: (params?: ListParams) =>
    [...analyticsKeys.all, "history", params] as const,
  trends: (period?: string) =>
    [...analyticsKeys.all, "trends", period] as const,
  skills: () => [...analyticsKeys.all, "skills"] as const,
  school: (id: string) => [...analyticsKeys.all, "school", id] as const,
  usage: (history?: number) =>
    [...analyticsKeys.all, "usage", history] as const,
};

// ─── Raw API calls ───────────────────────────────────────────────────────────

const analyticsApi = {
  getOverview: () =>
    apiClient
      .get<OverallStats>("/analytics/overview")
      .then((res) => res.data),

  getHistory: (params?: ListParams) =>
    apiClient
      .get("/analytics/history", { params })
      .then((res) => {
        // ResponseInterceptor splits { items, ...meta } into { data: items[], meta }
        // Axios unwrapper preserves that shape — map it back to HistoryResponse
        const raw = res.data as { data?: HistoryItem[]; meta?: Record<string, unknown> };
        if (raw.data && raw.meta) {
          return {
            items: raw.data,
            total: raw.meta.total as number,
            page: raw.meta.page as number,
            limit: raw.meta.limit as number,
            totalPages: (raw.meta.totalPages ?? raw.meta.total_pages) as number,
            hasMore: (raw.meta.hasMore ?? raw.meta.has_more) as boolean,
          } as HistoryResponse;
        }
        return res.data as HistoryResponse;
      }),

  getTrends: (period?: string) =>
    apiClient
      .get<TrendPoint[]>("/analytics/trends", {
        params: period ? { period } : undefined,
      })
      .then((res) => res.data),

  getSkills: () =>
    apiClient
      .get<SkillBreakdownItem[]>("/analytics/skills")
      .then((res) => res.data),

  getDashboardSkills: () =>
    apiClient
      .get<{
        communication: number | null;
        structure: number | null;
        motivation: number | null;
        schoolFit: number | null;
        sampleCount: number;
      }>("/analytics/skill-breakdown")
      .then((res) => res.data),

  getSchoolInsights: (id: string) =>
    apiClient
      .get<SchoolInsights>(`/analytics/schools/${id}`)
      .then((res) => res.data),

  getUsage: (history?: number) =>
    apiClient
      .get<{ current: UsageStats; history?: UsageHistoryPoint[] }>(
        "/analytics/usage",
        { params: history ? { history } : undefined },
      )
      .then((res) => res.data),
};

// ─── React Query hooks ───────────────────────────────────────────────────────

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: analyticsKeys.overview(),
    queryFn: analyticsApi.getOverview,
  });
}

export function useAnalyticsHistory(params?: ListParams) {
  return useQuery({
    queryKey: analyticsKeys.history(params),
    queryFn: () => analyticsApi.getHistory(params),
  });
}

export function useAnalyticsTrends(period?: string) {
  return useQuery({
    queryKey: analyticsKeys.trends(period),
    queryFn: () => analyticsApi.getTrends(period),
  });
}

export function useSkillBreakdown() {
  return useQuery({
    queryKey: analyticsKeys.skills(),
    queryFn: analyticsApi.getSkills,
  });
}

export function useDashboardSkillBreakdown() {
  return useQuery({
    queryKey: [...analyticsKeys.all, "dashboard-skills"] as const,
    queryFn: analyticsApi.getDashboardSkills,
  });
}

export function useSchoolInsights(id: string) {
  return useQuery({
    queryKey: analyticsKeys.school(id),
    queryFn: () => analyticsApi.getSchoolInsights(id),
    enabled: !!id,
  });
}

export function useAnalyticsUsage(history?: number) {
  return useQuery({
    queryKey: analyticsKeys.usage(history),
    queryFn: () => analyticsApi.getUsage(history),
  });
}
