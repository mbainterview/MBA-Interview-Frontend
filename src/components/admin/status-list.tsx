import { cn } from "@/lib/utils";

export interface StatusRow {
  label: string;
  value: string;
  /** Tailwind class for the value text color (e.g. text-green-500) */
  valueClassName?: string;
}

interface StatusListProps {
  items: StatusRow[];
  className?: string;
}

export function StatusList({ items, className }: StatusListProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {items.map((row, i) => (
        <div key={row.label} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-heading text-[16px] leading-7.5 text-[#868686]">
              {row.label}
            </span>
            <span
              className={cn(
                "font-heading text-[16px] leading-7.5 text-[#272727]",
                row.valueClassName
              )}
            >
              {row.value}
            </span>
          </div>
          {i < items.length - 1 && (
            <div className="h-px w-full bg-[#f0f0f5]" />
          )}
        </div>
      ))}
    </div>
  );
}
