import Link from "next/link";
import { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "muted";

const variantStyles: Record<Variant, CSSProperties> = {
  primary:   { background: "#5450d8", color: "white" },
  secondary: { background: "#dfddff", color: "#5450d8" },
  ghost:     { background: "rgba(84,80,216,0.1)", color: "#5450d8" },
  muted:     { background: "#f9f9f9", color: "#5450d8", fontFamily: "var(--font-sora), sans-serif" },
};

interface LandingButtonProps {
  href?: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

const baseStyle: CSSProperties = { fontFamily: "var(--font-inter), sans-serif" };

export function LandingButton({
  href,
  variant = "primary",
  className,
  children,
  onClick,
  type = "button",
}: LandingButtonProps) {
  const style: CSSProperties = { ...baseStyle, ...variantStyles[variant] };
  const cls = cn("inline-flex items-center justify-center font-medium", className);

  if (href) {
    return (
      <Link href={href} className={cls} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} style={style} onClick={onClick}>
      {children}
    </button>
  );
}
