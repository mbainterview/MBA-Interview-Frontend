import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { setTokens, clearTokens } from "@/lib/auth-tokens";
import type {
  TokenPairResponse,
  AuthMessageResponse,
  UserMe,
} from "@/types/domain";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export type OtpFlowType = "signup" | "password_reset";

export interface VerifyOtpData {
  email: string;
  code: string;
  type: OtpFlowType;
}

export interface ResendOtpData {
  email: string;
  type: OtpFlowType;
}

export interface OtpVerifyResponse {
  // SIGNUP flow → tokens
  access_token?: string;
  refresh_token?: string;
  expires_in?: string;
  // PASSWORD_RESET flow → one-time reset token
  resetToken?: string;
}

export interface ResetPasswordData {
  resetToken: string;
  newPassword: string;
}

export interface ChangePasswordData {
  currentPassword?: string;
  newPassword: string;
}

export interface ChangeEmailData {
  newEmail: string;
  currentPassword?: string;
  callbackURL?: string;
}

export interface UpdateMePayload {
  firstName?: string;
  lastName?: string;
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

// ─── Raw API calls ───────────────────────────────────────────────────────────

export const authApi = {
  signUp: (data: SignUpData) =>
    apiClient
      .post<AuthMessageResponse>("/auth/register", data)
      .then((res) => res.data),

  signIn: (data: SignInData) =>
    apiClient
      .post<TokenPairResponse>("/auth/login", data)
      .then((res) => res.data),

  requestPasswordReset: (email: string) =>
    apiClient
      .post<AuthMessageResponse>("/auth/forgot-password", { email })
      .then((res) => res.data),

  verifyOtp: (data: VerifyOtpData) =>
    apiClient
      .post<OtpVerifyResponse>("/auth/verify-otp", data)
      .then((res) => res.data),

  resendOtp: (data: ResendOtpData) =>
    apiClient
      .post<AuthMessageResponse>("/auth/resend-otp", data)
      .then((res) => res.data),

  resetPassword: (data: ResetPasswordData) =>
    apiClient
      .post<AuthMessageResponse>("/auth/reset-password", data)
      .then((res) => res.data),

  getMe: () =>
    apiClient.get<UserMe>("/auth/me").then((res) => res.data),

  updateMe: (data: UpdateMePayload) =>
    apiClient.patch<UserMe>("/users/me", data).then((res) => res.data),

  logout: () =>
    apiClient
      .post<AuthMessageResponse>("/auth/logout")
      .then((res) => res.data),

  refreshTokens: () =>
    apiClient
      .post<TokenPairResponse>("/auth/refresh")
      .then((res) => res.data),

  changePassword: (data: ChangePasswordData) =>
    apiClient
      .patch<AuthMessageResponse>("/auth/change-password", data)
      .then((res) => res.data),

  changeEmail: (data: ChangeEmailData) =>
    apiClient
      .patch<AuthMessageResponse>("/auth/change-email", data)
      .then((res) => res.data),
};

// ─── React Query hooks ───────────────────────────────────────────────────────

export function useSignUp() {
  return useMutation({ mutationFn: authApi.signUp });
}

export function useSignIn() {
  return useMutation({
    mutationFn: authApi.signIn,
    onSuccess: (tokens) => {
      if (tokens?.access_token && tokens?.refresh_token) {
        setTokens(tokens.access_token, tokens.refresh_token);
      }
    },
  });
}

export function useRequestPasswordReset() {
  return useMutation({ mutationFn: authApi.requestPasswordReset });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (resp) => {
      // SIGNUP returns tokens — stash them so the user lands authenticated.
      if (resp?.access_token && resp?.refresh_token) {
        setTokens(resp.access_token, resp.refresh_token);
      }
    },
  });
}

export function useResendOtp() {
  return useMutation({ mutationFn: authApi.resendOtp });
}

export function useResetPassword() {
  return useMutation({ mutationFn: authApi.resetPassword });
}

export function useMe(enabled = true) {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: authApi.getMe,
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearTokens();
      queryClient.clear();
      // Drop the per-tab onboarding draft so the next signed-in user on this
      // browser doesn't inherit the previous user's sessionId / answers and
      // hit "You do not own this session" on Submit.
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.removeItem("mba.onboarding");
        } catch {
          /* ignore */
        }
      }
    },
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.updateMe,
    onSuccess: (_data, variables) => {
      // Optimistically patch the cached /auth/me so the topbar name/initials
      // update immediately, then revalidate against the server.
      queryClient.setQueryData<UserMe>(authKeys.me(), (prev) =>
        prev ? { ...prev, ...variables } : prev,
      );
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: authApi.changePassword });
}

export function useChangeEmail() {
  return useMutation({ mutationFn: authApi.changeEmail });
}
