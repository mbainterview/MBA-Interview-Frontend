import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import type {
  NotificationPreferences,
  PrivacySettings,
  JobResponse,
} from "@/types/domain";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const settingsKeys = {
  all: ["settings"] as const,
  notifications: () => [...settingsKeys.all, "notifications"] as const,
  privacy: () => [...settingsKeys.all, "privacy"] as const,
};

// ─── Raw API calls ───────────────────────────────────────────────────────────

const settingsApi = {
  getNotificationPrefs: () =>
    apiClient
      .get<NotificationPreferences>("/settings/notifications")
      .then((res) => res.data),

  updateNotificationPrefs: (data: Partial<NotificationPreferences>) =>
    apiClient
      .patch<NotificationPreferences>("/settings/notifications", data)
      .then((res) => res.data),

  getPrivacySettings: () =>
    apiClient
      .get<PrivacySettings>("/settings/privacy")
      .then((res) => res.data),

  updatePrivacySettings: (data: Partial<PrivacySettings>) =>
    apiClient
      .patch<PrivacySettings>("/settings/privacy", data)
      .then((res) => res.data),

  exportData: () =>
    apiClient
      .post<JobResponse>("/settings/export-data")
      .then((res) => res.data),

  deleteAccount: () =>
    apiClient
      .delete<{ message: string; deletionScheduledAt: string }>(
        "/settings/account",
      )
      .then((res) => res.data),
};

// ─── React Query hooks ───────────────────────────────────────────────────────

export function useNotificationPrefs() {
  return useQuery({
    queryKey: settingsKeys.notifications(),
    queryFn: settingsApi.getNotificationPrefs,
  });
}

export function useUpdateNotificationPrefs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.updateNotificationPrefs,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.notifications(),
      });
    },
  });
}

export function usePrivacySettings() {
  return useQuery({
    queryKey: settingsKeys.privacy(),
    queryFn: settingsApi.getPrivacySettings,
  });
}

export function useUpdatePrivacySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.updatePrivacySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.privacy() });
    },
  });
}

export function useExportData() {
  return useMutation({
    mutationFn: settingsApi.exportData,
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: settingsApi.deleteAccount,
  });
}
