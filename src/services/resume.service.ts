import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import type { JobResponse } from "@/types/domain";
import { profileKeys } from "./profile.service";

// ─── Raw API calls ───────────────────────────────────────────────────────────

const resumeApi = {
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<JobResponse>("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },
};

// ─── React Query hooks ───────────────────────────────────────────────────────

export function useUploadResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resumeApi.uploadResume,
    onSuccess: () => {
      // Force the profile query to re-fetch so the resume page picks up the
      // new resumeS3Key + resumeParseStatus='queued' immediately. Without
      // this the screen stays on the dropzone until a manual refresh, since
      // the cached profile still says resumeParseStatus='none'.
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
    },
  });
}
