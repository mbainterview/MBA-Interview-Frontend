"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-5.25 pb-0 md:px-8 xl:px-15 max-w-360 mx-auto">
      <div className="relative rounded-[20px] h-24.25 px-8 flex items-center justify-between shadow-sm" style={{ background: "#edecfd" }}>
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <img
            src="/figma-assets/50efbb76-3497-42d1-9b7b-99c0dc7f6917.png"
            alt={siteConfig.name}
            className="h-11 w-auto object-contain"
          />
        </Link>

        {/* Desktop nav links — absolutely centred against the full bar */}
        <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          {siteConfig.nav.map((item) => {
            const isActive = pathname === item.href || (item.href === "/" && pathname === "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("text-[14px] leading-5.625 transition-colors whitespace-nowrap", isActive ? "font-semibold" : "font-normal")}
                style={{
                  fontFamily: isActive ? "var(--font-sora), sans-serif" : "var(--font-inter), sans-serif",
                  color: isActive ? "#222c44" : "rgba(0,0,0,0.6)",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA buttons */}
        <div className="hidden md:flex items-center gap-1.25 shrink-0">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center w-32.5 h-12.5 rounded-[16px] text-white text-[14px] font-bold transition-colors"
            style={{ background: "#423dea", fontFamily: "var(--font-inter), sans-serif" }}
          >
            Sign in
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" style={{ color: "#423dea" }} onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      <div className={cn("md:hidden rounded-b-[20px] overflow-hidden transition-all duration-200", open ? "max-h-96 pb-4" : "max-h-0")} style={{ background: "#edecfd" }}>
        <nav className="flex flex-col gap-1 px-8 pt-2">
          {siteConfig.nav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("px-2 py-2 text-[14px] rounded-md transition-colors", isActive ? "font-semibold" : "font-normal")}
                style={{ fontFamily: isActive ? "var(--font-sora), sans-serif" : "var(--font-inter), sans-serif", color: isActive ? "#222c44" : "rgba(0,0,0,0.6)" }}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="mt-3 flex flex-col gap-2 pt-3" style={{ borderTop: "1px solid rgba(66,61,234,0.2)" }}>
            <Link href="/sign-in" className="inline-flex items-center justify-center h-11 rounded-[16px] text-white text-[14px] font-bold" style={{ background: "#423dea", fontFamily: "var(--font-inter), sans-serif" }} onClick={() => setOpen(false)}>Sign in</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
