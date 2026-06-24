"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
}

interface AdminTabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
  onValueChange?: (value: string) => void;
}

/**
 * Pill-tab bar matching Figma — active tab gets a 10% primary background
 * and a 2px primary bottom border.
 */
export function AdminTabs({ tabs, defaultValue, className, onValueChange }: AdminTabsProps) {
  const [active, setActive] = useState(defaultValue ?? tabs[0]?.value);
  const activeTab = tabs.find((t) => t.value === active) ?? tabs[0];

  const handleChange = (value: string) => {
    setActive(value);
    onValueChange?.(value);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="inline-flex rounded-lg bg-white p-2">
        <div className="flex items-center gap-3">
          {tabs.map((tab) => {
            const isActive = tab.value === active;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleChange(tab.value)}
                className={cn(
                  "rounded-t-xl px-8 py-4 font-heading text-[18px] font-semibold leading-7.5 tracking-tight transition-colors",
                  isActive
                    ? "border-b-2 border-primary bg-[rgba(84,80,216,0.1)] text-primary"
                    : "text-[#272727] hover:bg-gray-50"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div>{activeTab?.content}</div>
    </div>
  );
}
