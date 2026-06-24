"use client";

import { useRouter } from "next/navigation";
import { Rocket } from "lucide-react";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import {
  OnboardingCard,
  PrimaryButton,
} from "@/components/shared/onboarding-card";
import { useAuth } from "@/providers/auth-provider";

export default function OnboardingWelcomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const firstName = user?.firstName?.trim() || "there";

  return (
    <OnboardingShell>
      <OnboardingCard
        icon={<Rocket size={28} />}
        iconColor="primary"
        title={`Welcome, ${firstName}!`}
        subtitle="Let's personalize your MBA interview prep journey"
      >
        <PrimaryButton onClick={() => router.push("/onboarding/profile")}>
          Start Setup
        </PrimaryButton>
      </OnboardingCard>
    </OnboardingShell>
  );
}
