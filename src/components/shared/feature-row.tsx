import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FeatureRowProps {
  icon: ReactNode;
  title: string;
  desc: string;
  variant?: "card" | "simple";
  className?: string;
}

export function FeatureRow({ icon, title, desc, variant = "card", className }: FeatureRowProps) {
  return (
    <div
      className={cn("flex items-center h-20 rounded-[12px]", variant === "card" ? "border border-white pl-3 pr-4 py-3" : "gap-4 px-5", className)}
      style={{ background: "#eeeefc" }}
    >
      {variant === "card" ? (
        <div className="relative shrink-0 w-14.5 h-14.5 mr-3">
          <div className="absolute inset-0 rounded-[12px] bg-white" style={{ boxShadow: "0px 30px 60px -10px rgba(0,0,0,0.14)" }} />
          <div className="absolute inset-0 flex items-center justify-center">{icon}</div>
        </div>
      ) : (
        <div className="flex items-center justify-center shrink-0 w-11 h-11 rounded-[12px]" style={{ background: "rgba(84,80,216,0.15)" }}>
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <span className="font-semibold" style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "18px", color: "#272727", lineHeight: "1.3" }}>{title}</span>
        <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "14px", color: "#868686", lineHeight: "20px" }}>{desc}</span>
      </div>
    </div>
  );
}
