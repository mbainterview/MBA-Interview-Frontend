import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export interface ActivityItem {
  title: string;
  detail: string;
  time: string;
  icon: string;
  /** Tailwind classes for the icon background gradient */
  iconBgClass?: string;
}

interface ActivityRowProps extends ActivityItem {
  isLast?: boolean;
}

export function ActivityRow({
  title,
  detail,
  time,
  icon,
  iconBgClass = "bg-gradient-to-br from-[#fc5a33] to-[#e0441e]",
  isLast,
}: ActivityRowProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "grid size-14 place-items-center rounded-2xl shadow-md",
              iconBgClass
            )}
          >
            <Icon icon={icon} width={24} height={24} className="text-white" />
          </div>
          <div className="flex flex-col">
            <p className="font-heading text-[18px] font-semibold leading-7.5 tracking-tight text-[#272727]">
              {title}
            </p>
            <p className="font-body text-[18px] leading-7 tracking-tight text-[#868686]">
              {detail}
            </p>
          </div>
        </div>
        <p className="font-body text-[18px] leading-7 tracking-tight text-[#868686]">
          {time}
        </p>
      </div>
      {!isLast && <div className="h-px w-full bg-[#f0f0f5]" />}
    </div>
  );
}
