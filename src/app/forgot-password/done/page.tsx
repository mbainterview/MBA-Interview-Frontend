"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { OnboardingCard, PrimaryButton } from "@/components/shared/onboarding-card";

export default function ForgotPasswordDonePage() {
  const router = useRouter();

  return (
    <OnboardingShell>
      <OnboardingCard
        icon={<Check size={32} strokeWidth={3} />}
        iconColor="green"
        title="Password Updated"
        subtitle="Your password has been updated successfully. You can now log in with your new password."
      >
        <PrimaryButton onClick={() => router.push("/sign-in")}>
          Done
        </PrimaryButton>
      </OnboardingCard>
    </OnboardingShell>
  );
}
