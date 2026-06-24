"use client";

import { cn } from "@/lib/utils";

export interface PillOption {
  value: string;
  label: string;
}

interface PillGroupProps {
  options: PillOption[];
  value: string;
  onChange?: (value: string) => void;
  className?: string;
}

/**
 * Pill-style segmented control matching the Figma admin spec.
 * Container: rounded-[20px] bg-[#eaf0fe] p-2.
 * Pills: px-8 py-4, rounded-[12px], inactive=text-[#272727], active=primary bg + white text.
 */
export function PillGroup({
  options,
  value,
  onChange,
  className,
}: PillGroupProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-[20px] bg-[#eaf0fe] p-2",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {options.map((opt) => {
          const isActive = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange?.(opt.value)}
              className={cn(
                "flex items-center justify-center rounded-[12px] px-8 py-4 text-[18px] font-semibold leading-7.5 tracking-tight transition-colors whitespace-nowrap",
                isActive
                  ? "bg-primary font-heading text-white"
                  : "font-body text-[#272727] hover:bg-white/40"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
