import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionBadgeProps {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionBadge({ icon, children, className }: SectionBadgeProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-2.5 rounded-full px-4 py-2 w-fit", className)}
      style={{ background: "rgba(84,80,216,0.1)" }}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "16px", color: "#5450d8" }}>{children}</span>
    </div>
  );
}
