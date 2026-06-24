"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { adminNavLinks } from "@/config/site";
import { useAuth } from "@/providers/auth-provider";

function pageTitleFromPath(pathname: string): string {
  const match = adminNavLinks.find(
    (l) => pathname === l.href || pathname.startsWith(l.href + "/"),
  );
  return match?.label ?? "Dashboard";
}

interface AdminTopbarProps {
  title?: string;
}

export function AdminTopbar({ title }: AdminTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pageTitle = title ?? pageTitleFromPath(pathname);
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Admin";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  return (
    <header className="fixed left-0 right-0 top-0 z-20 h-30 border-b border-[#f9fafb] bg-white lg:left-86.25">
      <div className="flex h-full items-center justify-between px-10">
        {/* Page title */}
        <h1 className="font-heading text-[32px] font-semibold leading-[1.4] text-[#272727]">
          {pageTitle}
        </h1>

        {/* Right cluster: search + notifications + profile */}
        <div className="flex items-center gap-6">
          {/* Search */}
          <div className="hidden h-15 w-83 items-center gap-2 rounded-[16px] bg-[#f9fafb] pl-6 pr-8 md:flex">
            <Icon
              icon="material-symbols:search-rounded"
              width={28}
              height={28}
              className="shrink-0 text-[#868686]"
            />
            <input
              type="text"
              placeholder="Search here..."
              className="w-full bg-transparent font-body text-[18px] text-[#272727] placeholder:text-[#868686] focus:outline-none"
            />
          </div>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => router.push("/admin/notifications")}
            className="relative grid size-12 place-items-center rounded-lg bg-[rgba(248,204,22,0.2)] transition-colors hover:bg-[rgba(248,204,22,0.3)]"
          >
            <Icon
              icon="clarity:notification-line"
              width={24}
              height={24}
              className="text-[#272727]"
            />
            <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-red-500" />
          </button>

          {/* User pill + dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-3 rounded-[16px] transition-opacity hover:opacity-90"
            >
              <div className="grid size-15 place-items-center overflow-hidden rounded-[16px] bg-gradient-to-br from-[#5450d8] to-[#7a76e3] font-heading text-[20px] font-semibold text-white">
                {initials}
              </div>
              <div className="hidden flex-col text-left leading-tight md:flex">
                <span className="font-heading text-[18px] text-[#272727]">
                  {displayName}
                </span>
                <span className="font-body text-[14px] text-[#868686]">
                  Admin
                </span>
              </div>
              <Icon
                icon="material-symbols:keyboard-arrow-down-rounded"
                width={20}
                height={20}
                className={`hidden text-[#868686] transition-transform md:block ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-64 rounded-[16px] bg-white py-2 shadow-lg"
                style={{
                  boxShadow: "0 10px 40px rgba(15, 11, 56, 0.12)",
                  border: "1px solid #f0f0f5",
                }}
              >
                {/* User info header */}
                <div className="border-b border-[#f0f0f5] px-4 pb-3 pt-2">
                  <p className="font-heading text-[16px] font-semibold text-[#272727]">
                    {displayName}
                  </p>
                  <p className="font-body text-[13px] text-[#868686]">
                    {user?.email}
                  </p>
                </div>

                {/* Menu items */}
                <div className="flex flex-col py-1">
                  <Link
                    href="/admin/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 font-body text-[15px] text-[#272727] transition-colors hover:bg-[#f4f4fe]"
                  >
                    <Icon
                      icon="material-symbols:settings-rounded"
                      width={20}
                      height={20}
                      className="text-[#868686]"
                    />
                    Settings
                  </Link>
                  <Link
                    href="/admin/notifications"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 font-body text-[15px] text-[#272727] transition-colors hover:bg-[#f4f4fe]"
                  >
                    <Icon
                      icon="clarity:notification-line"
                      width={20}
                      height={20}
                      className="text-[#868686]"
                    />
                    Notifications
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-[#f0f0f5] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 font-body text-[15px] text-[#fc5a33] transition-colors hover:bg-[#fef2f2]"
                  >
                    <Icon
                      icon="material-symbols:logout-rounded"
                      width={20}
                      height={20}
                    />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
