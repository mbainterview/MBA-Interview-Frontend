"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/providers/auth-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  const isLoginPage = pathname === "/admin/login";

  // Redirect non-admin users (only for non-login pages)
  useEffect(() => {
    if (isLoginPage || isLoading) return;
    if (!isAuthenticated) {
      router.replace("/admin/login");
      return;
    }
    if (user && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [isLoginPage, isLoading, isAuthenticated, user, router]);

  // Admin login page renders without the shell or role guard
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading while checking auth
  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eaf0fe]">
        <Loader2 size={32} className="animate-spin text-[#5450d8]" />
      </div>
    );
  }

  // Block non-admin users
  if (user.role !== "admin") {
    return null;
  }

  return <AdminShell>{children}</AdminShell>;
}
