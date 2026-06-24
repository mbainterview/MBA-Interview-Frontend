"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Target,
  Sparkles,
  Heart,
  ListChecks,
  GraduationCap,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { WizardStepCard } from "@/components/shared/wizard-step-card";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { useUpdateProfile } from "@/services/profile.service";
import type { InterviewGoal } from "@/types/domain";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

interface Goal {
  id: InterviewGoal;
  label: string;
  icon: LucideIcon;
}

const GOALS: Goal[] = [
  { id: "improve_confidence", label: "Improve confidence", icon: Heart },
  { id: "improve_structure", label: "Improve answer structure", icon: ListChecks },
  { id: "school_specific", label: "School-specific prep", icon: GraduationCap },
  { id: "kira_essay", label: "Kira Video Essay practice", icon: Video },
];

export default function InterviewGoalsPage() {
  const router = useRouter();
  const { draft, update } = useOnboardingDraft();
  const updateProfile = useUpdateProfile();
  const [goals, setGoals] = useState<InterviewGoal[]>(
    (draft.goals as InterviewGoal[] | undefined) ?? ["improve_confidence"],
  );
  const [level, setLevel] = useState<"beginner" | "advanced">(
    draft.feedbackLevel ?? "advanced",
  );

  const toggleGoal = (id: InterviewGoal) => {
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  const handleContinue = async () => {
    try {
      await updateProfile.mutateAsync({
        interviewGoals: goals,
        aiFeedbackLevel: level,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save your goals",
      );
      return;
    }
    update({ goals, feedbackLevel: level });
    router.push("/onboarding/diagnostic");
  };

  return (
    <OnboardingShell>
      <WizardStepCard
        icon={<Target size={20} />}
        iconColor="green"
        title="Interview Goals"
        onBack={() => router.push("/onboarding/schools")}
        onContinue={handleContinue}
        continueDisabled={goals.length === 0 || updateProfile.isPending}
        width={580}
      >
        <div className="flex flex-col gap-2.5">
          {GOALS.map((goal) => {
            const Icon = goal.icon;
            const selected = goals.includes(goal.id);
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => toggleGoal(goal.id)}
                className="flex items-center gap-3 rounded-[12px] border px-4 py-3 text-left transition-colors"
                style={{
                  borderColor: selected ? "#5450d8" : "#e6e6e6",
                  background: selected ? "#edecfd" : "white",
                }}
              >
                <Icon
                  size={18}
                  style={{ color: selected ? "#5450d8" : "#5b5b6b" }}
                />
                <span
                  style={{
                    fontFamily: inter,
                    fontSize: "14px",
                    fontWeight: 600,
                    color: selected ? "#222c44" : "#222c44",
                  }}
                >
                  {goal.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* AI Feedback Level */}
        <div className="mt-2 flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: "#eab308", color: "white" }}
          >
            <Sparkles size={16} />
          </div>
          <h3
            style={{
              fontFamily: sora,
              fontSize: "16px",
              fontWeight: 600,
              color: "#222c44",
            }}
          >
            AI Feedback Level
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(["beginner", "advanced"] as const).map((value) => {
            const active = level === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setLevel(value)}
                className="flex items-center justify-center gap-2 rounded-[12px] border px-4 py-3 transition-colors"
                style={{
                  borderColor: active ? "#5450d8" : "#e6e6e6",
                  background: active ? "#edecfd" : "white",
                }}
              >
                {active && (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: "#5450d8" }}
                  />
                )}
                <span
                  style={{
                    fontFamily: inter,
                    fontSize: "14px",
                    fontWeight: active ? 600 : 500,
                    color: active ? "#5450d8" : "#9999a5",
                    textTransform: "capitalize",
                  }}
                >
                  {value}
                </span>
              </button>
            );
          })}
        </div>
      </WizardStepCard>
    </OnboardingShell>
  );
}
