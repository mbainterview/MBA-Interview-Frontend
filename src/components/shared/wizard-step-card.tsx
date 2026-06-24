import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PrimaryButton, SecondaryButton, type IconColor } from "./onboarding-card";

const sora = "var(--font-sora), sans-serif";

const iconBg: Record<IconColor, string> = {
  primary: "#5450d8",
  green: "#22c55e",
  orange: "#f97316",
  yellow: "#eab308",
};

interface WizardStepCardProps {
  icon: ReactNode;
  iconColor?: IconColor;
  title: string;
  children: ReactNode;
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  backLabel?: string;
  hideBack?: boolean;
  className?: string;
  width?: number;
}

/**
 * Wizard step card used by the multi-step Onboarding flow:
 * Personal Profile, Resume Upload, Target Schools, Interview Goals.
 *
 * Layout: small colored circle icon + bold title (left aligned), then children
 * (form fields), then a Back / Continue button row.
 */
export function WizardStepCard({
  icon,
  iconColor = "primary",
  title,
  children,
  onBack,
  onContinue,
  continueLabel = "Continue",
  continueDisabled,
  backLabel = "Back",
  hideBack,
  className,
  width = 560,
}: WizardStepCardProps) {
  return (
    <div
      className={cn("flex w-full flex-col rounded-[24px] bg-white", className)}
      style={{
        maxWidth: `${width}px`,
        padding: "36px 40px",
        boxShadow: "0 20px 60px rgba(15, 11, 56, 0.18)",
      }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex shrink-0 items-center justify-center rounded-full"
          style={{
            width: "44px",
            height: "44px",
            background: iconBg[iconColor],
          }}
        >
          <div className="text-white">{icon}</div>
        </div>
        <h2
          style={{
            fontFamily: sora,
            fontSize: "20px",
            fontWeight: 600,
            color: "#222c44",
            lineHeight: 1.3,
          }}
        >
          {title}
        </h2>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-5">{children}</div>

      {/* Footer actions */}
      {(onBack || onContinue) && (
        <div className="mt-8 flex gap-4">
          {!hideBack && (
            <SecondaryButton onClick={onBack} disabled={!onBack}>
              {backLabel}
            </SecondaryButton>
          )}
          <PrimaryButton onClick={onContinue} disabled={continueDisabled}>
            {continueLabel}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
