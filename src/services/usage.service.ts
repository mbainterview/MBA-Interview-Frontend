import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import type { UsageResponse } from "@/types/domain";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const usageKeys = {
  all: ["usage"] as const,
  current: () => [...usageKeys.all, "current"] as const,
};

// ─── Raw API calls ───────────────────────────────────────────────────────────

const usageApi = {
  getUsage: () =>
    apiClient.get<UsageResponse>("/me/usage").then((res) => res.data),
};

// ─── React Query hooks ───────────────────────────────────────────────────────

export function useUsage() {
  return useQuery({
    queryKey: usageKeys.current(),
    queryFn: usageApi.getUsage,
  });
}
