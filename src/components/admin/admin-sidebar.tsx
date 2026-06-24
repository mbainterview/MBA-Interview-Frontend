"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { adminNavLinks } from "@/config/site";
import { cn } from "@/lib/utils";
import { AdminBrand } from "./admin-brand";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-86.25 overflow-y-auto border-r border-[#f9fafb] bg-white lg:block">
      {/* Brand */}
      <div className="flex h-30 items-center px-11.5">
        <Link href="/admin/dashboard" className="block">
          <AdminBrand />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-4 px-11.5 pb-10">
        {adminNavLinks.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex h-16 w-full items-center gap-6 rounded-[16px] px-6 py-4 transition-colors",
                isActive
                  ? "bg-primary text-white shadow-[0px_20px_50px_0px_rgba(55,69,87,0.1),inset_0px_4px_6px_0px_rgba(188,186,255,0.4)]"
                  : "text-[#868686] hover:bg-[#f5f5fa]"
              )}
            >
              <Icon
                icon={item.icon}
                width={32}
                height={32}
                className={cn(
                  "shrink-0",
                  isActive ? "text-white" : "text-[#868686]"
                )}
              />
              <span
                className={cn(
                  "font-heading text-[18px] whitespace-nowrap",
                  isActive ? "font-semibold text-white" : "font-normal"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
