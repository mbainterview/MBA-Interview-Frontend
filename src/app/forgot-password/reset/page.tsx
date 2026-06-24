"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { OnboardingCard, PrimaryButton } from "@/components/shared/onboarding-card";
import { useResetPassword } from "@/services/auth.service";
import {
  consumeResetToken,
  peekResetToken,
} from "@/lib/reset-token-storage";
import { validateStrongPassword, passwordRequirementsHint } from "@/lib/password-rules";
import { toast } from "sonner";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

// Eye icon shared with sign-in (Figma 812:5717).
const eyeIcon = "/figma-assets/5671f5b6-0d56-437f-987b-224495dcc28d.svg";

const fieldWrapStyle: React.CSSProperties = {
  height: "52px",
  borderRadius: "12px",
  border: "1px solid #d9d9d9",
  padding: "0 18px",
  background: "white",
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const fieldInputStyle: React.CSSProperties = {
  border: "none",
  outline: "none",
  fontFamily: inter,
  fontSize: "14px",
  color: "#272727",
  background: "transparent",
  flex: 1,
  minWidth: 0,
};

export default function ForgotPasswordResetPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordResetInner />
    </Suspense>
  );
}

function ForgotPasswordResetInner() {
  const router = useRouter();
  // Hydrate once on mount so we don't accidentally drop the token before
  // the user submits — peek without consuming until submit.
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate: reset, isPending } = useResetPassword();

  useEffect(() => {
    setHasToken(peekResetToken() !== null);
  }, []);

  const passwordError = password.length > 0 ? validateStrongPassword(password) : null;
  const valid = passwordError === null && password === confirm && confirm.length > 0;

  if (hasToken === null) return null; // wait for hydration

  if (!hasToken) {
    return (
      <OnboardingShell hideLogout>
        <OnboardingCard
          icon={<Lock size={26} />}
          iconColor="orange"
          title="Reset Session Expired"
          subtitle="Your password reset session has expired. Start again to receive a new verification code."
        >
          <Link href="/forgot-password" className="block w-full">
            <PrimaryButton>Start over</PrimaryButton>
          </Link>
        </OnboardingCard>
      </OnboardingShell>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const resetToken = consumeResetToken();
    if (!resetToken) {
      toast.error("Reset session expired. Please start again.");
      router.push("/forgot-password");
      return;
    }
    reset(
      { resetToken, newPassword: password },
      {
        onSuccess: () => router.push("/forgot-password/done"),
        onError: (error: unknown) =>
          toast.error(
            error instanceof Error
              ? error.message
              : "Reset session expired. Please request a new code.",
          ),
      },
    );
  };

  return (
    <OnboardingShell hideLogout>
      <OnboardingCard
        icon={<Lock size={26} />}
        iconColor="primary"
        title="Update Password"
        subtitle="Create new password"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="new-password"
              style={{
                fontFamily: sora,
                fontSize: "14px",
                fontWeight: 500,
                color: "#222c44",
              }}
            >
              New Password
            </label>
            <div style={fieldWrapStyle} className="focus-within:border-[#5450d8]">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={fieldInputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: showPassword ? 1 : 0.55,
                  transition: "opacity 120ms ease",
                }}
              >
                <img
                  src={eyeIcon}
                  alt=""
                  style={{ width: "22px", height: "22px", display: "block" }}
                />
              </button>
            </div>
            <span
              style={{
                fontFamily: inter,
                fontSize: "12px",
                color: passwordError ? "#d4393a" : "#808080",
              }}
            >
              {passwordError ?? passwordRequirementsHint}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="confirm-password"
              style={{
                fontFamily: sora,
                fontSize: "14px",
                fontWeight: 500,
                color: "#222c44",
              }}
            >
              Confirm Password
            </label>
            <div style={fieldWrapStyle} className="focus-within:border-[#5450d8]">
              <input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                style={fieldInputStyle}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: showConfirm ? 1 : 0.55,
                  transition: "opacity 120ms ease",
                }}
              >
                <img
                  src={eyeIcon}
                  alt=""
                  style={{ width: "22px", height: "22px", display: "block" }}
                />
              </button>
            </div>
            {confirm.length > 0 && password !== confirm && (
              <span
                style={{
                  fontFamily: inter,
                  fontSize: "12px",
                  color: "#d4393a",
                }}
              >
                Passwords do not match.
              </span>
            )}
          </div>

          <PrimaryButton type="submit" disabled={!valid || isPending}>
            {isPending ? "Updating…" : "Update Password"}
          </PrimaryButton>
        </form>
      </OnboardingCard>
    </OnboardingShell>
  );
}
