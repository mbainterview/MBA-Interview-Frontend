import { cn } from "@/lib/utils";

const PLAN_STYLES = {
  Free: "bg-[#eef8ea] text-[#53b930]",
  Pro: "bg-[#eeeefe] text-primary",
  Enterprise: "bg-[#fefae8] text-[#f8cc16]",
} as const;

export type PlanType = keyof typeof PLAN_STYLES;

// Plan names that should render with the "free/default" green style. Anything
// else is treated as a paid plan and rendered in the primary (purple) tint.
const FREE_LABELS = ["free", "explorer"];

interface PlanBadgeProps {
  // Accepts any plan label (e.g. "Free", "Explorer", "Full Season Pass").
  plan: string;
}

export function PlanBadge({ plan }: PlanBadgeProps) {
  const label = plan?.trim() || "Free";
  const style =
    (PLAN_STYLES as Record<string, string>)[label] ??
    (FREE_LABELS.includes(label.toLowerCase())
      ? PLAN_STYLES.Free
      : PLAN_STYLES.Pro);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4.5 py-2.5 font-body text-[16px] leading-5",
        style
      )}
    >
      {label}
    </span>
  );
}
