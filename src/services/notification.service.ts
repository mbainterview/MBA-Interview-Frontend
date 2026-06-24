import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import type { NotificationItem } from "@/types/domain";
import type { PaginatedResponse } from "@/types/api";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (params?: { page?: number; limit?: number }) =>
    [...notificationKeys.all, "list", params] as const,
  unreadCount: () => [...notificationKeys.all, "unread"] as const,
};

// ─── Raw API calls ───────────────────────────────────────────────────────────

const notificationApi = {
  getNotifications: (params?: { page?: number; limit?: number }) =>
    apiClient
      .get<PaginatedResponse<NotificationItem>>("/notifications", { params })
      .then((res) => res.data),

  getUnreadCount: () =>
    apiClient
      .get<{ unreadCount: number }>("/notifications/unread-count")
      .then((res) => res.data),

  markAsRead: (id: string) =>
    apiClient
      .patch<NotificationItem>(`/notifications/${id}/read`)
      .then((res) => res.data),

  markAllAsRead: () =>
    apiClient
      .post<{ updated: number }>("/notifications/read-all")
      .then((res) => res.data),

  deleteNotification: (id: string) =>
    apiClient.delete(`/notifications/${id}`),
};

// ─── React Query hooks ───────────────────────────────────────────────────────

export function useNotifications(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationApi.getNotifications(params),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: notificationApi.getUnreadCount,
    staleTime: 30 * 1000, // near-real-time badge
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
