import { Icon } from "@iconify/react";

const GRADIENTS = {
  green:
    "linear-gradient(-72.26deg, rgb(72,169,39) 0.59%, rgb(83,185,48) 96.83%)",
  yellow:
    "linear-gradient(-71.83deg, rgb(229,185,0) 21.06%, rgb(240,194,0) 99.39%)",
  red: "linear-gradient(107.71deg, rgb(252,90,51) 2.34%, rgb(224,68,30) 111.81%)",
  purple:
    "linear-gradient(-75.92deg, rgb(74,70,195) 3.01%, rgb(84,80,216) 96.4%)",
} as const;

export type StatCardGradient = keyof typeof GRADIENTS;

interface StatCardProps {
  value: string;
  label: string;
  icon: string;
  delta?: string;
  gradient: StatCardGradient;
  /** Override badge background — yellow card uses 30% white instead of 10% */
  badgeBgClass?: string;
}

export function StatCard({
  value,
  label,
  icon,
  delta = "+8.2%",
  gradient,
  badgeBgClass = "bg-white/10",
}: StatCardProps) {
  return (
    <div
      className="relative h-43.5 w-full overflow-hidden rounded-[20px]"
      style={{ backgroundImage: GRADIENTS[gradient] }}
    >
      {/* Decorative ellipses */}
      <div className="pointer-events-none absolute -top-6 right-4.5 size-28.25 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute right-10 top-12.25 size-38.25 rounded-full bg-white/10" />

      {/* Delta badge */}
      <div
        className={`absolute right-5 top-5 flex items-center gap-1.5 rounded-[20px] px-3 py-0.5 backdrop-blur-[2px] ${badgeBgClass}`}
      >
        <Icon
          icon="cil:graph"
          width={12}
          height={12}
          className="text-white"
        />
        <span className="font-body text-[12px] tracking-tight text-white">
          {delta}
        </span>
      </div>

      {/* Icon + value/label */}
      <div className="absolute left-6 top-4 flex flex-col gap-5">
        <div className="grid size-14 place-items-center rounded-2xl bg-white/15">
          <Icon icon={icon} width={28} height={28} className="text-white" />
        </div>
        <div className="flex flex-col gap-1 text-white">
          <p className="font-heading text-[24px] font-bold leading-7.5 tracking-tight">
            {value}
          </p>
          <p className="font-body text-[18px] leading-7 tracking-tight">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}
