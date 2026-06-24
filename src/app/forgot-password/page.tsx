"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { OnboardingCard, PrimaryButton } from "@/components/shared/onboarding-card";
import { useRequestPasswordReset } from "@/services/auth.service";
import { toast } from "sonner";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const { mutate: requestReset, isPending } = useRequestPasswordReset();

  const valid = /\S+@\S+\.\S+/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const next = `/forgot-password/verify?email=${encodeURIComponent(email)}`;
    requestReset(email, {
      onSuccess: () => router.push(next),
      onError: (error: any) => {
        // Backend returns generic response to prevent email enumeration,
        // so navigate anyway to avoid leaking whether the email exists
        router.push(next);
      },
    });
  };

  return (
    <OnboardingShell>
      <OnboardingCard
        icon={<Mail size={28} />}
        iconColor="primary"
        title="Email Address"
        subtitle="Enter your email to continue with password recovery"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              style={{
                fontFamily: sora,
                fontSize: "14px",
                fontWeight: 500,
                color: "#222c44",
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="john@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full focus:border-[#5450d8] focus:outline-none"
              style={{
                height: "52px",
                borderRadius: "12px",
                border: "1px solid #d9d9d9",
                padding: "0 18px",
                fontFamily: inter,
                fontSize: "14px",
                color: "#272727",
                background: "white",
              }}
            />
          </div>

          <PrimaryButton type="submit" disabled={!valid || isPending}>
            {isPending ? "Sending…" : "Continue"}
          </PrimaryButton>
        </form>
      </OnboardingCard>
    </OnboardingShell>
  );
}
