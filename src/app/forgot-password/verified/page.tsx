"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { OnboardingCard, PrimaryButton } from "@/components/shared/onboarding-card";

export default function ForgotPasswordVerifiedPage() {
  const router = useRouter();

  return (
    <OnboardingShell>
      <OnboardingCard
        icon={<Check size={32} strokeWidth={3} />}
        iconColor="green"
        title="Email Verified"
        subtitle="Your email has been successfully verified. You can now reset your password."
      >
        <PrimaryButton onClick={() => router.push("/forgot-password/reset")}>
          Continue
        </PrimaryButton>
      </OnboardingCard>
    </OnboardingShell>
  );
}
