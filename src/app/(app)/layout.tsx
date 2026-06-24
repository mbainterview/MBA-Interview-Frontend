"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppTopNav } from "@/components/app/app-topnav";
import { useAuth } from "@/providers/auth-provider";

/**
 * Authenticated app shell.
 *
 * Guards:
 *   • Unauthenticated → /sign-in
 *   • Authenticated but onboarding incomplete → bounce into the wizard at the
 *     server-tracked step (so the user resumes exactly where they left off)
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/sign-in");
      return;
    }

    const onboarding = user?.onboarding;
    if (onboarding && !onboarding.completed) {
      const stepRoute: Record<string, string> = {
        welcome: "/onboarding",
        profile: "/onboarding/profile",
        resume: "/onboarding/resume",
        schools: "/onboarding/schools",
        goals: "/onboarding/goals",
        diagnostic: "/onboarding/diagnostic",
      };
      const target = stepRoute[onboarding.step] ?? "/onboarding";
      router.replace(target);
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || (user && !user.onboarding?.completed)) {
    return (
      <div
        className="flex min-h-screen w-full items-center justify-center"
        style={{ background: "#eef0ff" }}
      >
        <span
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            color: "#9ea1c5",
          }}
        >
          Loading…
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen w-full flex-col"
      style={{ background: "#eef0ff" }}
    >
      <AppTopNav />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
