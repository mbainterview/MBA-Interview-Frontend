import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import type { PaginatedResponse } from "@/types/api";
import type {
  AdminUser,
  AdminUserDetail,
  AdminUserFilterParams,
  AdminOverview,
  AdminUsageAnalytics,
  AdminEngagement,
  AdminRevenue,
  School,
  Question,
  SubscriptionPlan,
  CreatePlanInput,
  UpdatePlanInput,
  SubscriptionFilterParams,
  SubscriptionStats,
  NotificationItem,
  NotificationTemplate,
  NotificationTemplateFilterParams,
  NotificationTemplatePreview,
  CreateNotificationTemplateInput,
  UpdateNotificationTemplateInput,
} from "@/types/domain";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const adminKeys = {
  all: ["admin"] as const,
  users: (params?: AdminUserFilterParams) =>
    [...adminKeys.all, "users", params] as const,
  user: (id: string) => [...adminKeys.all, "user", id] as const,
  overview: () => [...adminKeys.all, "overview"] as const,
  usage: () => [...adminKeys.all, "usage"] as const,
  engagement: () => [...adminKeys.all, "engagement"] as const,
  revenue: () => [...adminKeys.all, "revenue"] as const,
  schools: () => [...adminKeys.all, "schools"] as const,
  questions: () => [...adminKeys.all, "questions"] as const,
  plans: () => [...adminKeys.all, "plans"] as const,
  subscriptions: (params?: SubscriptionFilterParams) =>
    [...adminKeys.all, "subscriptions", params] as const,
  subscriptionStats: () => [...adminKeys.all, "subscription-stats"] as const,
  notifications: () => [...adminKeys.all, "notifications"] as const,
  notificationCount: () => [...adminKeys.all, "notification-count"] as const,
  notificationTemplates: (params?: NotificationTemplateFilterParams) =>
    [...adminKeys.all, "notification-templates", params] as const,
  notificationTemplate: (id: string) =>
    [...adminKeys.all, "notification-template", id] as const,
  kiraPrompts: () => [...adminKeys.all, "kira-prompts"] as const,
  kiraConfiguration: () => [...adminKeys.all, "kira-configuration"] as const,
  interviewConfiguration: (schoolId?: string | null) =>
    [...adminKeys.all, "interview-configuration", schoolId ?? "general"] as const,
  interviewConfigurations: () =>
    [...adminKeys.all, "interview-configurations"] as const,
};

export interface KiraConfiguration {
  id: string;
  prepTimeSeconds: number;
  responseTimeSeconds: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  interviewLength: number;
  followUpDepth: "light" | "medium" | "deep";
  tone: "formal" | "conversational" | "analytical";
  format: "behavioral" | "case" | "mixed";
}

export type UpdateKiraConfigurationInput = Partial<
  Omit<KiraConfiguration, "id">
>;

export interface InterviewConfiguration {
  id: string;
  schoolId: string | null;
  school?: { id: string; name: string; abbreviation?: string } | null;
  difficulty: "beginner" | "intermediate" | "advanced";
  interviewLength: number;
  followUpDepth: "light" | "medium" | "deep";
  tone: "formal" | "conversational" | "analytical";
  format: "behavioral" | "case" | "mixed";
  focusAreas: string[];
}

export type UpdateInterviewConfigurationInput = Partial<
  Omit<InterviewConfiguration, "id" | "school">
>;

// ─── Raw API calls ───────────────────────────────────────────────────────────

const adminApi = {
  getAdminUsers: (params?: AdminUserFilterParams) =>
    apiClient
      .get<PaginatedResponse<AdminUser>>("/admin/users", { params })
      .then((res) => res.data),

  getAdminUser: (id: string) =>
    apiClient
      .get<AdminUserDetail>(`/admin/users/${id}`)
      .then((res) => res.data),

  createUser: (data: {
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
  }) =>
    apiClient.post<AdminUser>("/admin/users", data).then((res) => res.data),

  updateUserStatus: (id: string, data: { status: string; reason?: string }) =>
    apiClient
      .patch<AdminUser>(`/admin/users/${id}/status`, data)
      .then((res) => res.data),

  updateUserRole: (id: string, data: { role: string }) =>
    apiClient
      .patch<AdminUser>(`/admin/users/${id}/role`, data)
      .then((res) => res.data),

  getAdminOverview: () =>
    apiClient
      .get<AdminOverview>("/admin/analytics/overview")
      .then((res) => res.data),

  getAdminUsage: () =>
    apiClient
      .get<AdminUsageAnalytics>("/admin/analytics/usage")
      .then((res) => res.data),

  getAdminEngagement: () =>
    apiClient
      .get<AdminEngagement>("/admin/analytics/engagement")
      .then((res) => res.data),

  getAdminRevenue: () =>
    apiClient
      .get<AdminRevenue>("/admin/analytics/revenue")
      .then((res) => res.data),

  // Schools
  createSchool: (data: {
    name: string;
    abbreviation: string;
    description?: string;
    location?: string;
  }) =>
    apiClient.post<School>("/admin/schools", data).then((res) => res.data),

  updateSchool: (id: string, data: Record<string, unknown>) =>
    apiClient
      .patch<School>(`/admin/schools/${id}`, data)
      .then((res) => res.data),

  deactivateSchool: (id: string) =>
    apiClient.delete(`/admin/schools/${id}`).then((res) => res.data),

  // Questions
  addQuestions: (
    schoolId: string,
    data: {
      questions: Array<{
        text: string;
        category: string;
        difficulty: string;
      }>;
    },
  ) =>
    apiClient
      .post<Question[]>(`/admin/schools/${schoolId}/questions`, data)
      .then((res) => res.data),

  updateQuestion: (id: string, data: Record<string, unknown>) =>
    apiClient
      .patch<Question>(`/admin/questions/${id}`, data)
      .then((res) => res.data),

  deleteQuestion: (id: string) =>
    apiClient.delete(`/admin/questions/${id}`).then((res) => res.data),

  // Plans & Subscriptions
  getPlans: () =>
    apiClient
      .get<SubscriptionPlan[]>("/admin/plans")
      .then((res) => res.data),

  createPlan: (data: CreatePlanInput) =>
    apiClient
      .post<SubscriptionPlan>("/admin/plans", data)
      .then((res) => res.data),

  updatePlan: (id: string, data: UpdatePlanInput) =>
    apiClient
      .patch<SubscriptionPlan>(`/admin/plans/${id}`, data)
      .then((res) => res.data),

  deletePlan: (id: string) =>
    apiClient
      .delete<{ deleted: true }>(`/admin/plans/${id}`)
      .then((res) => res.data),

  getSubscriptions: (params?: SubscriptionFilterParams) =>
    apiClient
      .get("/admin/subscriptions", { params })
      .then((res) => res.data),

  getSubscriptionStats: () =>
    apiClient
      .get<SubscriptionStats>("/admin/subscriptions/stats")
      .then((res) => res.data),

  // Notifications
  getNotifications: () =>
    apiClient
      .get<NotificationItem[]>("/notifications")
      .then((res) => res.data),

  getUnreadCount: () =>
    apiClient
      .get<{ count: number }>("/notifications/unread-count")
      .then((res) => res.data),

  markNotificationRead: (id: string) =>
    apiClient
      .patch(`/notifications/${id}/read`)
      .then((res) => res.data),

  markAllNotificationsRead: () =>
    apiClient.post("/notifications/read-all").then((res) => res.data),

  // Notification Templates (admin-authored email templates)
  getNotificationTemplates: (params?: NotificationTemplateFilterParams) =>
    apiClient
      .get<PaginatedResponse<NotificationTemplate>>(
        "/admin/notifications/templates",
        { params },
      )
      .then((res) => res.data),

  getNotificationTemplate: (id: string) =>
    apiClient
      .get<NotificationTemplate>(`/admin/notifications/templates/${id}`)
      .then((res) => res.data),

  createNotificationTemplate: (data: CreateNotificationTemplateInput) =>
    apiClient
      .post<NotificationTemplate>("/admin/notifications/templates", data)
      .then((res) => res.data),

  updateNotificationTemplate: (
    id: string,
    data: UpdateNotificationTemplateInput,
  ) =>
    apiClient
      .patch<NotificationTemplate>(
        `/admin/notifications/templates/${id}`,
        data,
      )
      .then((res) => res.data),

  deleteNotificationTemplate: (id: string) =>
    apiClient
      .delete(`/admin/notifications/templates/${id}`)
      .then((res) => res.data),

  previewNotificationTemplate: (
    id: string,
    variables: Record<string, string>,
  ) =>
    apiClient
      .post<NotificationTemplatePreview>(
        `/admin/notifications/templates/${id}/preview`,
        { variables },
      )
      .then((res) => res.data),

  // Kira Prompts
  getKiraPrompts: () =>
    apiClient
      .get("/admin/kira/prompts")
      .then((res) => res.data),

  createKiraPrompts: (data: {
    prompts: Array<{
      text: string;
      category?: string;
      difficulty?: string;
      prepTimeSeconds?: number;
      responseTimeSeconds?: number;
      schoolId?: string;
      orderIndex?: number;
    }>;
  }) =>
    apiClient.post("/admin/kira/prompts", data).then((res) => res.data),

  updateKiraPrompt: (id: string, data: Record<string, unknown>) =>
    apiClient
      .patch(`/admin/kira/prompts/${id}`, data)
      .then((res) => res.data),

  deactivateKiraPrompt: (id: string) =>
    apiClient
      .patch(`/admin/kira/prompts/${id}/deactivate`)
      .then((res) => res.data),

  deleteKiraPrompt: (id: string) =>
    apiClient.delete(`/admin/kira/prompts/${id}`).then((res) => res.data),

  getInterviewConfiguration: (schoolId?: string | null) =>
    apiClient
      .get<InterviewConfiguration>("/admin/interview/configuration", {
        params: schoolId ? { schoolId } : undefined,
      })
      .then((res) => res.data),

  listInterviewConfigurations: () =>
    apiClient
      .get<InterviewConfiguration[]>("/admin/interview/configurations")
      .then((res) => res.data),

  updateInterviewConfiguration: (data: UpdateInterviewConfigurationInput) =>
    apiClient
      .put<InterviewConfiguration>("/admin/interview/configuration", data)
      .then((res) => res.data),

  deleteInterviewConfiguration: (schoolId: string) =>
    apiClient
      .delete(`/admin/interview/configuration/${schoolId}`)
      .then((res) => res.data),

  getKiraConfiguration: () =>
    apiClient
      .get<KiraConfiguration>("/admin/kira/configuration")
      .then((res) => res.data),

  updateKiraConfiguration: (data: UpdateKiraConfigurationInput) =>
    apiClient
      .patch<KiraConfiguration>("/admin/kira/configuration", data)
      .then((res) => res.data),
};

// ─── React Query hooks ───────────────────────────────────────────────────────

export function useAdminUsers(params?: AdminUserFilterParams) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => adminApi.getAdminUsers(params),
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: adminKeys.user(id),
    queryFn: () => adminApi.getAdminUser(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      firstName: string;
      lastName: string;
      email: string;
      role?: string;
    }) => adminApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; reason?: string } }) =>
      adminApi.updateUserStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { role: string } }) =>
      adminApi.updateUserRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useAdminOverview() {
  return useQuery({
    queryKey: adminKeys.overview(),
    queryFn: adminApi.getAdminOverview,
  });
}

export function useAdminUsageAnalytics() {
  return useQuery({
    queryKey: adminKeys.usage(),
    queryFn: adminApi.getAdminUsage,
  });
}

export function useAdminEngagement() {
  return useQuery({
    queryKey: adminKeys.engagement(),
    queryFn: adminApi.getAdminEngagement,
  });
}

export function useAdminRevenue() {
  return useQuery({
    queryKey: adminKeys.revenue(),
    queryFn: adminApi.getAdminRevenue,
  });
}

// ─── School hooks ─────────────────────────────────────────────────────────────

export function useCreateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      abbreviation: string;
      description?: string;
      location?: string;
    }) => adminApi.createSchool(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.schools() });
    },
  });
}

export function useUpdateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      adminApi.updateSchool(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.schools() });
    },
  });
}

export function useDeactivateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deactivateSchool(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.schools() });
    },
  });
}

// ─── Question hooks ───────────────────────────────────────────────────────────

export function useAddQuestions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      schoolId,
      data,
    }: {
      schoolId: string;
      data: {
        questions: Array<{
          text: string;
          category: string;
          difficulty: string;
        }>;
      };
    }) => adminApi.addQuestions(schoolId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.questions() });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      adminApi.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.questions() });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.questions() });
    },
  });
}

// ─── Plan & Subscription hooks ──────────────────────────────────────────────

export function useAdminPlans() {
  return useQuery({
    queryKey: adminKeys.plans(),
    queryFn: adminApi.getPlans,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlanInput) => adminApi.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.plans() });
      queryClient.invalidateQueries({ queryKey: ["subscription", "plans"] });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanInput }) =>
      adminApi.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.plans() });
      queryClient.invalidateQueries({ queryKey: ["subscription", "plans"] });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.plans() });
      queryClient.invalidateQueries({ queryKey: ["subscription", "plans"] });
    },
  });
}

export function useAdminSubscriptions(params?: SubscriptionFilterParams) {
  return useQuery({
    queryKey: adminKeys.subscriptions(params),
    queryFn: () => adminApi.getSubscriptions(params),
  });
}

export function useAdminSubscriptionStats() {
  return useQuery({
    queryKey: adminKeys.subscriptionStats(),
    queryFn: adminApi.getSubscriptionStats,
  });
}

// ─── Notification hooks ─────────────────────────────────────────────────────

export function useNotifications() {
  return useQuery({
    queryKey: adminKeys.notifications(),
    queryFn: adminApi.getNotifications,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: adminKeys.notificationCount(),
    queryFn: adminApi.getUnreadCount,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: adminKeys.notificationCount() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: adminKeys.notificationCount() });
    },
  });
}

// ─── Kira Prompts hooks ─────────────────────────────────────────────────────

export function useAdminKiraPrompts() {
  return useQuery({
    queryKey: adminKeys.kiraPrompts(),
    queryFn: adminApi.getKiraPrompts,
  });
}

export function useCreateKiraPrompts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createKiraPrompts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.kiraPrompts() });
    },
  });
}

export function useUpdateKiraPrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      adminApi.updateKiraPrompt(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.kiraPrompts() });
    },
  });
}

export function useDeleteKiraPrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteKiraPrompt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.kiraPrompts() });
    },
  });
}

export function useKiraConfiguration() {
  return useQuery({
    queryKey: adminKeys.kiraConfiguration(),
    queryFn: adminApi.getKiraConfiguration,
  });
}

export function useUpdateKiraConfiguration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.updateKiraConfiguration,
    onSuccess: (data) => {
      queryClient.setQueryData(adminKeys.kiraConfiguration(), data);
    },
  });
}

// ─── Admin AI Interview Configuration ────────────────────────────────────────

export function useAdminInterviewConfiguration(schoolId?: string | null) {
  return useQuery({
    queryKey: adminKeys.interviewConfiguration(schoolId),
    queryFn: () => adminApi.getInterviewConfiguration(schoolId ?? null),
  });
}

export function useAdminInterviewConfigurations() {
  return useQuery({
    queryKey: adminKeys.interviewConfigurations(),
    queryFn: adminApi.listInterviewConfigurations,
  });
}

export function useUpdateAdminInterviewConfiguration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.updateInterviewConfiguration,
    onSuccess: (data) => {
      queryClient.setQueryData(
        adminKeys.interviewConfiguration(data.schoolId),
        data,
      );
      queryClient.invalidateQueries({
        queryKey: adminKeys.interviewConfigurations(),
      });
    },
  });
}

export function useDeleteAdminInterviewConfiguration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteInterviewConfiguration,
    onSuccess: (_data, schoolId) => {
      queryClient.invalidateQueries({
        queryKey: adminKeys.interviewConfiguration(schoolId),
      });
      queryClient.invalidateQueries({
        queryKey: adminKeys.interviewConfigurations(),
      });
    },
  });
}

// ─── Admin Notification Templates ────────────────────────────────────────────

export function useAdminNotificationTemplates(
  params?: NotificationTemplateFilterParams,
) {
  return useQuery({
    queryKey: adminKeys.notificationTemplates(params),
    queryFn: () => adminApi.getNotificationTemplates(params),
  });
}

export function useAdminNotificationTemplate(id: string | undefined) {
  return useQuery({
    queryKey: adminKeys.notificationTemplate(id ?? ""),
    queryFn: () => adminApi.getNotificationTemplate(id as string),
    enabled: !!id,
  });
}

export function useCreateAdminNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createNotificationTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "notification-templates"],
      });
    },
  });
}

export function useUpdateAdminNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateNotificationTemplateInput;
    }) => adminApi.updateNotificationTemplate(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(adminKeys.notificationTemplate(data.id), data);
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "notification-templates"],
      });
    },
  });
}

export function useDeleteAdminNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteNotificationTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.all, "notification-templates"],
      });
    },
  });
}

export function usePreviewAdminNotificationTemplate() {
  return useMutation({
    mutationFn: ({
      id,
      variables,
    }: {
      id: string;
      variables: Record<string, string>;
    }) => adminApi.previewNotificationTemplate(id, variables),
  });
}
