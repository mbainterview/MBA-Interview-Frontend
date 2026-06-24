"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import {
  OnboardingCard,
  PrimaryButton,
} from "@/components/shared/onboarding-card";
import { OtpInput } from "@/components/shared/otp-input";
import {
  useResendOtp,
  useVerifyOtp,
} from "@/services/auth.service";
import { setResetToken } from "@/lib/reset-token-storage";
import { toast } from "sonner";

const inter = "var(--font-inter), sans-serif";
const RESEND_COOLDOWN_SECONDS = 60;

export default function ForgotPasswordVerifyPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordVerifyInner />
    </Suspense>
  );
}

function ForgotPasswordVerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  useEffect(() => {
    if (!email) router.replace("/forgot-password");
  }, [email, router]);

  const handleVerify = () => {
    if (code.length !== 6 || verifyOtp.isPending) return;
    verifyOtp.mutate(
      { email, code, type: "password_reset" },
      {
        onSuccess: (resp) => {
          if (!resp.resetToken) {
            toast.error("Verification succeeded but no reset token returned.");
            return;
          }
          setResetToken(resp.resetToken);
          router.push("/forgot-password/verified");
        },
        onError: (error: unknown) => {
          const msg =
            error instanceof Error
              ? error.message
              : "Invalid or expired code. Please try again.";
          toast.error(msg);
          setCode("");
        },
      },
    );
  };

  const handleResend = () => {
    if (cooldown > 0 || resendOtp.isPending) return;
    resendOtp.mutate(
      { email, type: "password_reset" },
      {
        onSuccess: () => {
          toast.success("Verification code resent.");
          setCooldown(RESEND_COOLDOWN_SECONDS);
        },
        onError: (error: unknown) => {
          const msg =
            error instanceof Error
              ? error.message
              : "Failed to resend. Please try again.";
          toast.error(msg);
        },
      },
    );
  };

  return (
    <OnboardingShell hideLogout>
      <OnboardingCard
        icon={<ShieldCheck size={28} />}
        iconColor="primary"
        title="Verify Your Email"
        subtitle={
          <>
            We&apos;ve sent a 6-digit verification code to{" "}
            <strong className="text-[#222c44]">{email}</strong>. Enter the code
            below to continue.
          </>
        }
      >
        <div className="flex flex-col gap-6">
          <OtpInput value={code} onChange={setCode} autoFocus />

          <PrimaryButton
            type="button"
            onClick={handleVerify}
            disabled={code.length !== 6 || verifyOtp.isPending}
          >
            {verifyOtp.isPending ? "Verifying…" : "Verify"}
          </PrimaryButton>

          <div
            className="text-center"
            style={{ fontFamily: inter, fontSize: 14, color: "#808080" }}
          >
            Didn&apos;t receive code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resendOtp.isPending}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontFamily: inter,
                fontSize: 14,
                fontWeight: 600,
                color: cooldown > 0 ? "#a8a8a8" : "#5450d8",
                cursor: cooldown > 0 ? "not-allowed" : "pointer",
              }}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
            </button>
          </div>
        </div>
      </OnboardingCard>
    </OnboardingShell>
  );
}
