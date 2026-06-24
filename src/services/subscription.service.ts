import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import type { SubscriptionPlan, CurrentSubscription } from "@/types/domain";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const subscriptionKeys = {
  all: ["subscription"] as const,
  plans: () => [...subscriptionKeys.all, "plans"] as const,
  current: () => [...subscriptionKeys.all, "current"] as const,
};

// ─── Raw API calls ───────────────────────────────────────────────────────────

const subscriptionApi = {
  getPlans: () =>
    apiClient
      .get<SubscriptionPlan[]>("/plans")
      .then((res) => res.data),

  getCurrentSubscription: () =>
    apiClient
      .get<CurrentSubscription>("/me/subscription")
      .then((res) => res.data),
};

// ─── React Query hooks ───────────────────────────────────────────────────────

export function usePlans() {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: subscriptionApi.getPlans,
  });
}

type CurrentSubscriptionQueryOptions = Omit<
  UseQueryOptions<CurrentSubscription, Error, CurrentSubscription, readonly unknown[]>,
  "queryKey" | "queryFn"
>;

export function useCurrentSubscription(options?: CurrentSubscriptionQueryOptions) {
  return useQuery({
    queryKey: subscriptionKeys.current(),
    queryFn: subscriptionApi.getCurrentSubscription,
    ...options,
  });
}
