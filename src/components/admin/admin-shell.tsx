import { ReactNode } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#eaf0fe]">
      <AdminSidebar />
      <AdminTopbar />
      <main className="pt-30 lg:pl-86.25">
        <div className="px-10 pb-10 pt-12">{children}</div>
      </main>
    </div>
  );
}
