/**
 * Storage key for the short-lived one-time reset token returned by
 * POST /auth/verify-otp (type=password_reset). The token lives in
 * sessionStorage so it survives a same-tab navigation between the OTP-verify
 * step and the new-password step, but is dropped when the tab closes.
 */
export const RESET_TOKEN_STORAGE_KEY = "mba.reset_token";

export function setResetToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(RESET_TOKEN_STORAGE_KEY, token);
  } catch {
    // sessionStorage may be disabled (private mode, locked-down browsers).
  }
}

export function consumeResetToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.sessionStorage.getItem(RESET_TOKEN_STORAGE_KEY);
    if (value) window.sessionStorage.removeItem(RESET_TOKEN_STORAGE_KEY);
    return value;
  } catch {
    return null;
  }
}

export function peekResetToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(RESET_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}
