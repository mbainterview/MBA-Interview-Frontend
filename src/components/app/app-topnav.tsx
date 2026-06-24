"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Video,
  BarChart3,
  History,
  CreditCard,
  Settings,
  Search,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

const inter = "var(--font-inter), sans-serif";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Mock Interview", href: "/mock-interview", icon: MessageSquare },
  { label: "Kira Interview", href: "/kira", icon: Video },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "History", href: "/history", icon: History },
  { label: "Pricing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];

/**
 * Top icon nav used by every authenticated app screen.
 *
 * Source: Figma node 981:5806 (Mock Interview frames). The active item
 * expands into a solid purple pill with icon + label; inactive items are
 * rounded grey icon-only buttons.
 */
export function AppTopNav() {
  const pathname = usePathname() ?? "";
  const { logout } = useAuth();

  return (
    <header
      className="w-full"
      style={{ background: "#eef0ff" }}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-5">
        {/* Brand — same MBA Interview AI logo used on the sign-in page (Figma
            805:1275), rendered as a CSS mask so the swoosh + wordmark take on
            the brand primary `#5450d8` (matching the Dashboard pill) instead
            of the dark-navy baked into the PNG. */}
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center"
          aria-label="MBA Interview AI"
        >
          <div
            role="img"
            aria-label="MBA Interview AI — Powered by MMC"
            className="h-10 shrink-0"
            style={{
              width: "78px",
              background: "#5450d8",
              maskImage:
                "url('/figma-assets/ad82c1b5-4e3d-40db-921e-2351e6ee095c.png')",
              maskRepeat: "no-repeat",
              maskPosition: "center",
              maskSize: "contain",
              WebkitMaskImage:
                "url('/figma-assets/ad82c1b5-4e3d-40db-921e-2351e6ee095c.png')",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              WebkitMaskSize: "contain",
            }}
          />
        </Link>

        {/* Nav pills */}
        <nav className="flex flex-1 items-center justify-center gap-2">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="flex items-center justify-center transition-colors"
                style={
                  active
                    ? {
                        background: "#5450d8",
                        color: "white",
                        borderRadius: "10px",
                        padding: "8px 14px",
                        gap: "8px",
                        fontFamily: inter,
                        fontSize: "13px",
                        fontWeight: 600,
                      }
                    : {
                        background: "white",
                        color: "#9ea1c5",
                        borderRadius: "10px",
                        width: "36px",
                        height: "36px",
                      }
                }
              >
                <Icon size={16} />
                {active && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Search + Logout */}
        <div className="flex shrink-0 items-center gap-2">
          <div
            className="hidden md:flex items-center gap-2 rounded-[10px] px-3"
            style={{
              background: "white",
              width: "200px",
              height: "36px",
            }}
          >
            <Search size={14} style={{ color: "#9ea1c5" }} />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-transparent focus:outline-none"
              style={{
                fontFamily: inter,
                fontSize: "13px",
                color: "#272727",
              }}
            />
          </div>
          <button
            type="button"
            onClick={logout}
            title="Logout"
            className="flex items-center justify-center rounded-[10px] transition-colors hover:bg-red-50"
            style={{
              background: "white",
              color: "#9ea1c5",
              width: "36px",
              height: "36px",
              border: "none",
              cursor: "pointer",
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
