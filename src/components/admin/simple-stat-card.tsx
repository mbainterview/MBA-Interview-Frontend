import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface SimpleStatCardProps {
  value: string;
  label: string;
  icon: string;
  iconBgClass?: string;
  className?: string;
}

/**
 * Flat white stat card used on list pages (Users, Schools, etc).
 * Different from the gradient `StatCard` used on the Dashboard.
 */
export function SimpleStatCard({
  value,
  label,
  icon,
  iconBgClass = "bg-gradient-to-br from-[#48a927] to-[#53b930]",
  className,
}: SimpleStatCardProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-5 rounded-[20px] bg-white px-6 py-7",
        className
      )}
    >
      <div
        className={cn(
          "grid size-14 shrink-0 place-items-center rounded-2xl shadow-md",
          iconBgClass
        )}
      >
        <Icon icon={icon} width={28} height={28} className="text-white" />
      </div>
      <div className="flex flex-col gap-1 text-[#272727]">
        <p className="font-heading text-[24px] font-bold leading-7.5 tracking-tight">
          {value}
        </p>
        <p className="font-body text-[18px] leading-7 tracking-tight">
          {label}
        </p>
      </div>
    </div>
  );
}
