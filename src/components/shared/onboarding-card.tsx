import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

export type IconColor = "primary" | "green" | "orange" | "yellow";

const iconBg: Record<IconColor, string> = {
  primary: "#5450d8",
  green: "#22c55e",
  orange: "#f97316",
  yellow: "#eab308",
};

interface OnboardingCardProps {
  icon?: ReactNode;
  iconColor?: IconColor;
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
  width?: number;
}

/**
 * Centered white card used by every "centered" Onboarding screen
 * (Welcome, verify-email, verified, forgot-password, diagnostic results, etc.)
 *
 * Layout: round colored icon → title → subtitle → children → actions row.
 */
export function OnboardingCard({
  icon,
  iconColor = "primary",
  title,
  subtitle,
  children,
  actions,
  className,
  width = 448,
}: OnboardingCardProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center rounded-[24px] bg-white",
        className,
      )}
      style={{
        maxWidth: `${width}px`,
        padding: "40px 36px",
        boxShadow: "0 20px 60px rgba(15, 11, 56, 0.18)",
      }}
    >
      {icon && (
        <div
          className="mb-6 flex items-center justify-center rounded-full"
          style={{
            width: "64px",
            height: "64px",
            background: iconBg[iconColor],
          }}
        >
          <div className="text-white">{icon}</div>
        </div>
      )}

      <h1
        className="text-center"
        style={{
          fontFamily: sora,
          fontSize: "28px",
          fontWeight: 600,
          color: "#222c44",
          lineHeight: 1.25,
        }}
      >
        {title}
      </h1>

      {subtitle && (
        <p
          className="mt-3 text-center"
          style={{
            fontFamily: inter,
            fontSize: "15px",
            color: "#808080",
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>
      )}

      {children && <div className="mt-6 w-full">{children}</div>}

      {actions && <div className="mt-6 w-full">{actions}</div>}
    </div>
  );
}

/* ── Standardized buttons used inside OnboardingCard ──────────────────────── */

interface PrimaryButtonProps {
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PrimaryButton({
  children,
  type = "button",
  disabled,
  onClick,
  className,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full rounded-[14px] transition-opacity disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      style={{
        background: "#5450d8",
        color: "white",
        padding: "16px 24px",
        fontFamily: inter,
        fontSize: "16px",
        fontWeight: 500,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  type = "button",
  disabled,
  onClick,
  className,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full rounded-[14px] transition-opacity disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      style={{
        background: "#dfddff",
        color: "#5450d8",
        padding: "16px 24px",
        fontFamily: inter,
        fontSize: "16px",
        fontWeight: 500,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}
