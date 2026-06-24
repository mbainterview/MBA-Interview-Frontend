import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5500/api/v1",
  timeout: 60000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: attach auth token ───────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lazy import to avoid circular dependency
    // Token is attached here; cookies are also sent via withCredentials
    try {
      const { getAccessToken, touchAccessCookie } = require("@/lib/auth-tokens");
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Re-stamp the frontend cookie so an active user never loses it
        // mid-flow (the cookie is what middleware checks before allowing
        // /dashboard, /onboarding/*, etc.).
        touchAccessCookie();
      }
    } catch {
      // auth-tokens module not yet available during bootstrap
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ── Response interceptor: unwrap backend envelope ────────────────────────────
// Backend wraps ALL responses as: { success: true, data: T, meta?: PaginationMeta }
// This interceptor strips the envelope so services receive the inner payload directly.
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const body = response.data;

    // Only unwrap if it's a backend envelope (has `success` flag)
    if (body && typeof body === "object" && body.success === true) {
      if (body.meta !== undefined) {
        // Paginated response — preserve both data array and meta
        response.data = { data: body.data, meta: body.meta };
      } else {
        // Single resource or message — unwrap to inner data
        response.data = body.data;
      }
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // ── 401 Unauthorized: attempt token refresh ──────────────────────────
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Refresh tokens — cookies are sent automatically via withCredentials
        const refreshResponse = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const tokens = refreshResponse.data?.data ?? refreshResponse.data;

        if (tokens?.access_token) {
          try {
            const { setTokens } = require("@/lib/auth-tokens");
            setTokens(tokens.access_token, tokens.refresh_token);
          } catch {
            // auth-tokens not available
          }

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Refresh failed — clear tokens
        try {
          const { clearTokens } = require("@/lib/auth-tokens");
          clearTokens();
        } catch {
          // auth-tokens not available
        }

        // Only redirect to sign-in if we're on a protected page, not public pages.
        // Calls to /auth/me from public pages should fail silently.
        const isAuthMeRequest = originalRequest.url?.includes("/auth/me");
        if (typeof window !== "undefined" && !isAuthMeRequest) {
          const publicPrefixes = ["/", "/pricing", "/resources", "/how-it-works", "/schools", "/kira-prep", "/sign-in", "/forgot-password"];
          const isPublicPage = publicPrefixes.some(
            (p) => p === "/" ? window.location.pathname === "/" : window.location.pathname.startsWith(p),
          );
          if (!isPublicPage) {
            window.location.href = "/sign-in";
          }
        }
      }
    }

    // ── Normalize error message from backend envelope ────────────────────
    // Backend errors: { success: false, error: { code, message, field?, retryAfter? } }
    const backendError = (error.response?.data as Record<string, unknown>)
      ?.error as Record<string, unknown> | undefined;

    if (backendError?.message) {
      const normalizedError = new Error(backendError.message as string) as Error & {
        code?: string;
        field?: string;
        retryAfter?: number;
        status?: number;
      };
      normalizedError.code = backendError.code as string;
      normalizedError.field = backendError.field as string | undefined;
      normalizedError.retryAfter = backendError.retryAfter as number | undefined;
      normalizedError.status = error.response?.status;
      return Promise.reject(normalizedError);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
