import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  warning: {
    bg: "bg-[rgba(248,204,22,0.1)]",
    border: "border-[#f8cc16]",
    iconBg: "bg-[#f8cc16]",
    icon: "material-symbols:warning-rounded",
    iconColor: "text-white",
  },
  success: {
    bg: "bg-[rgba(83,185,48,0.1)]",
    border: "border-[#53b930]",
    iconBg: "bg-[#53b930]",
    icon: "lets-icons:check-fill",
    iconColor: "text-white",
  },
  danger: {
    bg: "bg-[rgba(252,90,51,0.1)]",
    border: "border-[#fc5a33]",
    iconBg: "bg-[#fc5a33]",
    icon: "material-symbols:error-rounded",
    iconColor: "text-white",
  },
} as const;

export type AlertVariant = keyof typeof VARIANTS;

interface AlertBoxProps {
  variant: AlertVariant;
  title: string;
  description?: string;
  className?: string;
  /** Compact mode (single line, no description) */
  compact?: boolean;
}

export function AlertBox({
  variant,
  title,
  description,
  className,
  compact = false,
}: AlertBoxProps) {
  const v = VARIANTS[variant];

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-4 rounded-xl border-b px-4 py-3",
          v.bg,
          v.border,
          className
        )}
      >
        <div
          className={cn(
            "grid size-6 place-items-center rounded-full",
            v.iconBg
          )}
        >
          <Icon icon={v.icon} width={16} height={16} className={v.iconColor} />
        </div>
        <p
          className={cn("font-heading text-[18px] leading-7.5 tracking-tight", {
            "text-[#53b930]": variant === "success",
            "text-[#f8cc16]": variant === "warning",
            "text-[#fc5a33]": variant === "danger",
          })}
        >
          {title}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-6 rounded-[20px] border-b-2 p-4",
        v.bg,
        v.border,
        className
      )}
    >
      <div
        className={cn(
          "grid size-14 shrink-0 place-items-center rounded-2xl",
          v.iconBg
        )}
      >
        <Icon icon={v.icon} width={28} height={28} className={v.iconColor} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-heading text-[18px] font-semibold leading-7.5 tracking-tight text-[#272727]">
          {title}
        </p>
        {description && (
          <p className="font-body text-[18px] leading-7 tracking-tight text-[#868686]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
