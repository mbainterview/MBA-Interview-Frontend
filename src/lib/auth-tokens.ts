/**
 * Token storage for client-side auth.
 *
 * Tokens live in three places:
 *   1. In-memory (fast, cleared on page close).
 *   2. localStorage (survives page reloads).
 *   3. A frontend-origin cookie named `access_token`.
 *
 * (3) is critical in production: the backend's HttpOnly cookie is scoped to
 * the API domain, so Next.js middleware (which runs on the frontend origin)
 * can't see it. Mirroring the access token into a frontend cookie lets the
 * middleware check auth state without hitting the backend. XSS risk is no
 * worse than the existing localStorage storage.
 */

const STORAGE_KEY_ACCESS = "auth_access_token";
const STORAGE_KEY_REFRESH = "auth_refresh_token";
const COOKIE_NAME_ACCESS = "access_token";

// The frontend `access_token` cookie's only job is to tell Next.js middleware
// "this user is signed in" — it is NOT used by axios for the actual request
// (axios attaches the in-memory / localStorage token as a Bearer header).
//
// We therefore size the cookie to the refresh-token window, not the
// 15-minute JWT lifetime. Otherwise long-lived UX flows (the 15-minute
// diagnostic, or any user who idles on a screen for more than 15 min) lose
// their cookie mid-flow, and the middleware redirects them away from
// /dashboard / /onboarding even though their refresh token is still valid.
const ACCESS_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

let accessToken: string | null = null;
let refreshToken: string | null = null;

function writeAccessCookie(token: string): void {
  if (typeof document === "undefined") return;
  const isSecure = window.location.protocol === "https:";
  // SameSite=Lax is fine — this cookie is only read by our own middleware on
  // the same origin. Secure is required in production (HTTPS).
  const parts = [
    `${COOKIE_NAME_ACCESS}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${ACCESS_COOKIE_MAX_AGE}`,
    "SameSite=Lax",
  ];
  if (isSecure) parts.push("Secure");
  document.cookie = parts.join("; ");
}

function clearAccessCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME_ACCESS}=; Path=/; Max-Age=0; SameSite=Lax`;
}

// Hydrate from localStorage on module load
if (typeof window !== "undefined") {
  try {
    accessToken = localStorage.getItem(STORAGE_KEY_ACCESS);
    refreshToken = localStorage.getItem(STORAGE_KEY_REFRESH);
    // Also restore the frontend cookie so a hard refresh after reopening the
    // tab keeps the middleware seeing the user as authenticated.
    if (accessToken) writeAccessCookie(accessToken);
  } catch {
    // localStorage unavailable (e.g. incognito in some browsers)
  }
}

export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_ACCESS, access);
      localStorage.setItem(STORAGE_KEY_REFRESH, refresh);
    } catch {
      // localStorage unavailable
    }
    writeAccessCookie(access);
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Re-write the frontend access-token cookie with a fresh Max-Age. Called by
 * the axios request interceptor so that every API call from an active user
 * extends the cookie window — prevents the middleware from booting out a
 * user who has been on a long-running screen (e.g. mid-diagnostic).
 */
export function touchAccessCookie(): void {
  if (accessToken) writeAccessCookie(accessToken);
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY_ACCESS);
      localStorage.removeItem(STORAGE_KEY_REFRESH);
    } catch {
      // localStorage unavailable
    }
    clearAccessCookie();
  }
}
