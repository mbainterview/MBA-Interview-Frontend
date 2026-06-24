import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  Active: "bg-[#eef8ea] text-[#53b930]",
  Suspended: "bg-[#fdebe7] text-[#fc5a33]",
  Pending: "bg-[#fefae8] text-[#f8cc16]",
  Inactive: "bg-[#f4f4f6] text-[#868686]",
  Completed: "bg-[#eef8ea] text-[#53b930]",
  Failed: "bg-[#fdebe7] text-[#fc5a33]",
} as const;

export type StatusType = keyof typeof STATUS_STYLES;

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4.5 py-2.5 font-body text-[16px] leading-5",
        STATUS_STYLES[status]
      )}
    >
      {status}
    </span>
  );
}
