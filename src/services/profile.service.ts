import {
  useMutation,
  useQuery,
  useQueryClient,
  type Query,
} from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { authKeys } from "@/services/auth.service";
import type { UserMe, UserProfile, UpdateProfilePayload } from "@/types/domain";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const profileKeys = {
  all: ["profile"] as const,
  detail: () => [...profileKeys.all, "detail"] as const,
};

// ─── Raw API calls ───────────────────────────────────────────────────────────

const profileApi = {
  getProfile: () =>
    apiClient.get<UserProfile>("/profile").then((res) => res.data),

  updateProfile: (data: UpdateProfilePayload) =>
    apiClient.patch<UserProfile>("/profile", data).then((res) => res.data),

  completeOnboarding: () =>
    apiClient
      .post<UserProfile>("/profile/onboarding/complete")
      .then((res) => res.data),
};

// ─── React Query hooks ───────────────────────────────────────────────────────

type ProfileRefetch =
  | number
  | false
  | ((query: Query<UserProfile, Error>) => number | false | undefined);

export function useProfile(options?: {
  refetchInterval?: ProfileRefetch;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: profileApi.getProfile,
    refetchInterval: options?.refetchInterval,
    enabled: options?.enabled,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.completeOnboarding,
    onSuccess: (updatedProfile) => {
      // Synchronously patch the /auth/me cache so the dashboard's onboarding
      // guard sees `completed: true` on its very first render after
      // router.push("/dashboard"). Awaiting an invalidate-driven refetch is
      // racy: Next.js can mount the (app) layout before the refetch resolves,
      // and the guard then reads the stale value and bounces back to
      // /onboarding/diagnostic.
      const completedAt =
        (updatedProfile as { onboardingCompletedAt?: string | Date | null })
          .onboardingCompletedAt;
      const completedAtIso =
        completedAt instanceof Date
          ? completedAt.toISOString()
          : (completedAt ?? new Date().toISOString());

      queryClient.setQueryData<UserMe>(authKeys.me(), (prev) =>
        prev
          ? {
              ...prev,
              onboarding: {
                step: "done",
                completed: true,
                completedAt: completedAtIso,
              },
            }
          : prev,
      );

      // Background revalidation — keep server as source of truth.
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}
