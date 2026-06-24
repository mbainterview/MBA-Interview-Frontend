"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Clock,
  Mic,
  Sparkles,
  Type as TypeIcon,
  Video as VideoIcon,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { OnboardingCard, PrimaryButton } from "@/components/shared/onboarding-card";
import { useStartSession } from "@/services/interview.service";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { diagnosticVideoStore } from "@/lib/diagnostic-video-store";

const inter = "var(--font-inter), sans-serif";

type ResponseMode = "text" | "audio" | "video";

const MODE_OPTIONS: {
  value: ResponseMode;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}[] = [
  {
    value: "text",
    label: "Text",
    description: "Type your answer in a text box.",
    icon: TypeIcon,
  },
  {
    value: "audio",
    label: "Audio",
    description: "Record your spoken answer with your microphone.",
    icon: Mic,
  },
  {
    value: "video",
    label: "Video",
    description: "Record your answer on camera. Best practice for real interviews.",
    icon: VideoIcon,
  },
];

export default function DiagnosticIntroPage() {
  const router = useRouter();
  const startSession = useStartSession();
  const { draft, update } = useOnboardingDraft();

  // If the user already picked a mode (e.g. backed out of question 1), pre-
  // select it so they don't have to re-pick.
  const [selectedMode, setSelectedMode] = useState<ResponseMode | null>(
    draft.diagnostic?.mode ?? null,
  );

  const handleStart = async () => {
    if (!selectedMode) {
      toast.error("Please choose how you'd like to respond before starting.");
      return;
    }

    // Video mode: one continuous recording spans all 10 questions. We need to
    // open the camera + start the recorder before navigating into the flow,
    // otherwise the first question would lose any answer recorded on it.
    if (selectedMode === "video") {
      // Reset any leftover state from a previous attempt (back-navigated user).
      diagnosticVideoStore.reset();
      await diagnosticVideoStore.start();
      const snap = diagnosticVideoStore.getSnapshot();
      if (snap.status !== "recording") {
        toast.error(
          snap.error ??
            "We couldn't start the camera. Please grant permission and try again.",
        );
        return;
      }
    }

    // Always start a fresh session. Reusing a stored sessionId across runs
    // (and especially across logout/account-switch) causes the backend to
    // reject the batch submit with "You do not own this session".
    startSession.mutate(
      { questionCount: 10 },
      {
        onSuccess: (session) => {
          update({
            diagnostic: {
              sessionId: session.id,
              mode: selectedMode,
              answers: {},
              answersMeta: {},
            },
          });
          router.push("/onboarding/diagnostic/1");
        },
        onError: (err) => {
          // If the backend startSession fails for a video session, kill the
          // recorder so we don't leak a camera light on the intro screen.
          if (selectedMode === "video") diagnosticVideoStore.reset();
          toast.error(
            err instanceof Error ? err.message : "Failed to start diagnostic",
          );
        },
      },
    );
  };

  return (
    <OnboardingShell>
      <OnboardingCard
        icon={<GraduationCap size={28} />}
        iconColor="primary"
        title="Diagnostic Interview"
        subtitle="This short assessment helps us understand your current level and customize your prep plan."
        width={520}
      >
        <div
          className="rounded-[14px] border p-4"
          style={{ borderColor: "#ececf5", background: "#fafafe" }}
        >
          <InfoRow
            icon={<Clock size={16} style={{ color: "#5450d8" }} />}
            label={
              <>
                <strong>10 Questions</strong>{" "}
                <span style={{ color: "#9999a5" }}>90 seconds each</span>
              </>
            }
          />
          <InfoRow
            icon={<Sparkles size={16} style={{ color: "#5450d8" }} />}
            label="AI-powered scoring and feedback"
          />
        </div>

        <div className="mt-5">
          <p
            style={{
              fontFamily: inter,
              fontSize: "13px",
              fontWeight: 500,
              color: "#222c44",
              marginBottom: "10px",
            }}
          >
            How would you like to respond?
          </p>
          <div className="flex flex-col gap-2">
            {MODE_OPTIONS.map((opt) => (
              <ModeOption
                key={opt.value}
                option={opt}
                selected={selectedMode === opt.value}
                onSelect={() => setSelectedMode(opt.value)}
              />
            ))}
          </div>
          <p
            className="mt-2"
            style={{
              fontFamily: inter,
              fontSize: "12px",
              color: "#9999a5",
            }}
          >
            You&apos;ll use this response method for all 10 questions.
          </p>
        </div>

        <div className="mt-5">
          <PrimaryButton
            onClick={handleStart}
            disabled={startSession.isPending || !selectedMode}
          >
            {startSession.isPending ? "Starting…" : "Start Test"}
          </PrimaryButton>
        </div>
      </OnboardingCard>
    </OnboardingShell>
  );
}

interface ModeOptionProps {
  option: (typeof MODE_OPTIONS)[number];
  selected: boolean;
  onSelect: () => void;
}

function ModeOption({ option, selected, onSelect }: ModeOptionProps) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="flex w-full items-center gap-3 rounded-[12px] border px-3 py-2.5 text-left transition-colors"
      style={{
        borderColor: selected ? "#5450d8" : "#ececf5",
        background: selected ? "#f3f1ff" : "white",
        cursor: "pointer",
      }}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{
          background: selected ? "#5450d8" : "#edecfd",
          color: selected ? "white" : "#5450d8",
        }}
      >
        <Icon size={16} />
      </span>
      <span className="flex flex-1 flex-col">
        <span
          style={{
            fontFamily: inter,
            fontSize: "14px",
            fontWeight: 600,
            color: "#222c44",
          }}
        >
          {option.label}
        </span>
        <span
          style={{
            fontFamily: inter,
            fontSize: "12px",
            color: "#808080",
            lineHeight: 1.4,
          }}
        >
          {option.description}
        </span>
      </span>
      {selected && (
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
          style={{ background: "#5450d8", color: "white" }}
          aria-hidden
        >
          <Check size={12} />
        </span>
      )}
    </button>
  );
}

function InfoRow({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      {icon}
      <span style={{ fontFamily: inter, fontSize: "13px", color: "#272727" }}>
        {label}
      </span>
    </div>
  );
}
