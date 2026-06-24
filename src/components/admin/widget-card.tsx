import { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface WidgetCardProps {
  title: string;
  icon?: string;
  iconColor?: string;
  className?: string;
  headerActions?: ReactNode;
  children: ReactNode;
}

export function WidgetCard({
  title,
  icon,
  iconColor = "text-primary",
  className,
  headerActions,
  children,
}: WidgetCardProps) {
  return (
    <section
      className={cn(
        "rounded-[20px] bg-white p-6 shadow-[0px_4px_24px_0px_rgba(83,80,141,0.04)]",
        className
      )}
    >
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <Icon icon={icon} width={32} height={32} className={iconColor} />
          )}
          <h2 className="font-heading text-[22px] font-semibold leading-7.5 tracking-tight text-[#272727]">
            {title}
          </h2>
        </div>
        {headerActions}
      </header>
      {children}
    </section>
  );
}
