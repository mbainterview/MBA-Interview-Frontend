"use client";

import React, { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout } from "@/services/auth.service";

interface OnboardingShellProps {
  children: ReactNode;
  className?: string;
  /** Hide the header logout button (e.g. on screens prior to authentication). */
  hideLogout?: boolean;
}

/**
 * Full-viewport purple background with decorative line overlay used by all
 * post-auth onboarding / forgot-password screens. Centers a single card child.
 *
 * Source: Figma node 180:4739 — every centered-card screen in the Onboarding
 * section sits on this purple base with a faint geometric line pattern.
 */
export function OnboardingShell({
  children,
  className,
  hideLogout,
}: OnboardingShellProps) {
  const router = useRouter();
  const logout = useLogout();

  const handleLogout = () => {
    if (logout.isPending) return;
    logout.mutate(undefined, {
      onSettled: () => router.replace("/sign-in"),
    });
  };

  return React.createElement(
    "div",
    {
      className: cn(
        "relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-12",
        className,
      ),
      style: { background: "#5450d8" },
    },
    !hideLogout
      ? React.createElement(
          "button",
          {
            type: "button",
            onClick: handleLogout,
            disabled: logout.isPending,
            "aria-label": "Log out",
            className:
              "absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-50 sm:right-6 sm:top-6",
          },
          React.createElement(LogOut, { size: 16 }),
          React.createElement(
            "span",
            null,
            logout.isPending ? "Logging out…" : "Log out",
          ),
        )
      : null,
    React.createElement(
      "div",
      {
        className:
          "relative z-10 flex w-full max-w-160 items-center justify-center",
      },
      children,
    ),
  );
}
