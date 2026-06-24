"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { toast } from "sonner";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { WizardStepCard } from "@/components/shared/wizard-step-card";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { useUpdateProfile } from "@/services/profile.service";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

const fieldStyle: React.CSSProperties = {
  height: "48px",
  borderRadius: "10px",
  border: "1px solid #d9d9d9",
  padding: "0 14px",
  fontFamily: inter,
  fontSize: "14px",
  color: "#272727",
  background: "white",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontFamily: sora,
  fontSize: "13px",
  fontWeight: 500,
  color: "#222c44",
};

const educationOptions = [
  "High School",
  "Bachelor's",
  "Master's",
  "MBA",
  "PhD",
  "Other",
];

const timezones = [
  "GMT-08:00 (PST)",
  "GMT-05:00 (EST)",
  "GMT+00:00 (UTC)",
  "GMT+01:00 (CET)",
  "GMT+05:30 (IST)",
  "GMT+08:00 (CST)",
];

export default function PersonalProfilePage() {
  const router = useRouter();
  const { draft, update } = useOnboardingDraft();
  const updateProfile = useUpdateProfile();
  const [education, setEducation] = useState(draft.profile?.education ?? "");
  const [years, setYears] = useState<number | "">(
    draft.profile?.yearsExperience ?? "",
  );
  const [country, setCountry] = useState(
    draft.profile?.country ?? "United States",
  );
  const [timezone, setTimezone] = useState(draft.profile?.timezone ?? "");

  const canContinue = !!education && !!country && !updateProfile.isPending;

  const handleContinue = async () => {
    try {
      await updateProfile.mutateAsync({
        highestEducation: education,
        yearsOfExperience: typeof years === "number" ? years : undefined,
        country,
        timezone: timezone || undefined,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save your profile",
      );
      return;
    }
    update({
      profile: {
        education,
        yearsExperience: typeof years === "number" ? years : undefined,
        country,
        timezone: timezone || undefined,
      },
    });
    router.push("/onboarding/resume");
  };

  return (
    <OnboardingShell>
      <WizardStepCard
        icon={<User size={20} />}
        iconColor="orange"
        title="Personal Profile"
        onContinue={handleContinue}
        continueDisabled={!canContinue}
        hideBack
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="education" style={labelStyle}>
            Highest Education
          </label>
          <select
            id="education"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            className="focus:border-[#5450d8] focus:outline-none"
            style={{ ...fieldStyle, color: education ? "#272727" : "#9999a5" }}
          >
            <option value="" disabled>
              Select
            </option>
            {educationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="years" style={labelStyle}>
            Years of Work Experience <span style={{ color: "#9999a5" }}>(optional)</span>
          </label>
          <input
            id="years"
            type="number"
            min={0}
            max={60}
            placeholder="3"
            value={years}
            onChange={(e) =>
              setYears(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="focus:border-[#5450d8] focus:outline-none"
            style={fieldStyle}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="country" style={labelStyle}>
              Country
            </label>
            <input
              id="country"
              type="text"
              placeholder="United States"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="focus:border-[#5450d8] focus:outline-none"
              style={fieldStyle}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="timezone" style={labelStyle}>
              Timezone <span style={{ color: "#9999a5" }}>(optional)</span>
            </label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="focus:border-[#5450d8] focus:outline-none"
              style={{ ...fieldStyle, color: timezone ? "#272727" : "#9999a5" }}
            >
              <option value="" disabled>
                Select
              </option>
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>
      </WizardStepCard>
    </OnboardingShell>
  );
}
