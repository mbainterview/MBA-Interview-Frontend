"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

/**
 * Guards every /onboarding/* route:
 *   • Requires an authenticated user (otherwise → /sign-in)
 *   • Sends users who have already completed the wizard → /dashboard
 *
 * The diagnostic-results screen is the ONE step that runs after the user has
 * finished answering questions but before completeOnboarding() is called, so we
 * allow it through even when status === 'done' (defensive — completeOnboarding
 * is fired on the "Go To Dashboard" click).
 */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/sign-in");
      return;
    }

    if (user?.onboarding?.completed && pathname !== "/onboarding/diagnostic/results") {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen w-full items-center justify-center"
        style={{ background: "#eef0ff" }}
      >
        <span style={{ fontFamily: "var(--font-inter), sans-serif", color: "#9ea1c5" }}>
          Loading…
        </span>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
