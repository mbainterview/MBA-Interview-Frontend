"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useMe, useLogout, authKeys, authApi } from "@/services/auth.service";
import { setTokens, clearTokens, getAccessToken } from "@/lib/auth-tokens";
import type { TokenPairResponse, UserMe } from "@/types/domain";

/**
 * Quick check to see if we might have an active session.
 * Returns true if there's an in-memory token OR an access_token cookie.
 * On public pages with no auth, this returns false → useMe() stays disabled.
 */
function hasPossibleSession(): boolean {
  if (getAccessToken()) return true;
  if (typeof document !== "undefined") {
    return document.cookie.includes("access_token");
  }
  return false;
}

interface AuthContextValue {
  user: UserMe | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (tokens: TokenPairResponse) => Promise<UserMe | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Track whether we should attempt auth. Starts based on cookie/token check,
  // flips to true after login() is called so useMe() re-enables.
  const [authEnabled, setAuthEnabled] = useState(hasPossibleSession);

  const { data: user, isLoading } = useMe(authEnabled);
  const logoutMutation = useLogout();

  const login = useCallback(
    async (tokens: TokenPairResponse): Promise<UserMe | null> => {
      setTokens(tokens.access_token, tokens.refresh_token);
      setAuthEnabled(true); // re-render → useMe becomes enabled
      // Fetch fresh user data and seed the cache before navigation. Without
      // this, callers (e.g. /sign-in → /dashboard) can navigate while useMe()
      // is still resolving, and the dashboard's onboarding guard reads stale
      // or undefined state and bounces the user back to /onboarding even when
      // they already completed it.
      try {
        const user = await queryClient.fetchQuery({
          queryKey: authKeys.me(),
          queryFn: authApi.getMe,
          staleTime: 0,
        });
        return user ?? null;
      } catch {
        return null;
      }
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        clearTokens();
        setAuthEnabled(false);
        queryClient.clear();
        router.push("/sign-in");
      },
    });
  }, [logoutMutation, queryClient, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      isLoading: authEnabled ? isLoading : false,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, isLoading, authEnabled, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
