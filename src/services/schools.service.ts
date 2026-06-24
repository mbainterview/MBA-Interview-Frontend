import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import type { ListParams, PaginatedResponse } from "@/types/api";
import type { School, Question, QuestionFilterParams } from "@/types/domain";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const schoolKeys = {
  all: ["schools"] as const,
  lists: () => [...schoolKeys.all, "list"] as const,
  list: (params?: ListParams) => [...schoolKeys.lists(), params] as const,
  details: () => [...schoolKeys.all, "detail"] as const,
  detail: (id: string) => [...schoolKeys.details(), id] as const,
  questions: (id: string, filters?: QuestionFilterParams) =>
    [...schoolKeys.all, "questions", id, filters] as const,
};

// ─── Raw API calls ───────────────────────────────────────────────────────────

const schoolsApi = {
  getSchools: (params?: ListParams) =>
    apiClient
      .get<PaginatedResponse<School>>("/schools", { params })
      .then((res) => res.data),

  getSchool: (id: string) =>
    apiClient.get<School>(`/schools/${id}`).then((res) => res.data),

  getSchoolQuestions: (id: string, filters?: QuestionFilterParams) =>
    apiClient
      .get<PaginatedResponse<Question>>(`/schools/${id}/questions`, {
        params: filters,
      })
      .then((res) => res.data),
};

// ─── React Query hooks ───────────────────────────────────────────────────────

export function useSchools(params?: ListParams) {
  return useQuery({
    queryKey: schoolKeys.list(params),
    queryFn: () => schoolsApi.getSchools(params),
  });
}

export function useSchool(id: string) {
  return useQuery({
    queryKey: schoolKeys.detail(id),
    queryFn: () => schoolsApi.getSchool(id),
    enabled: !!id,
  });
}

export function useSchoolQuestions(
  id: string,
  filters?: QuestionFilterParams,
) {
  return useQuery({
    queryKey: schoolKeys.questions(id, filters),
    queryFn: () => schoolsApi.getSchoolQuestions(id, filters),
    enabled: !!id,
  });
}
