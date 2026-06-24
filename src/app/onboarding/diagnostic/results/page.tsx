"use client";

import { useRouter } from "next/navigation";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import {
  OnboardingCard,
  PrimaryButton,
} from "@/components/shared/onboarding-card";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { useSessionResults } from "@/services/interview.service";
import { useCompleteOnboarding } from "@/services/profile.service";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

export default function DiagnosticResultsPage() {
  const router = useRouter();
  const { draft, clear } = useOnboardingDraft();
  const sessionId = draft.diagnostic?.sessionId;
  const resultsQuery = useSessionResults(sessionId);
  const completeOnboarding = useCompleteOnboarding();

  const data = resultsQuery.data;
  const isPending = !data || data.status === "pending";

  const handleGoToDashboard = async () => {
    try {
      await completeOnboarding.mutateAsync();
    } catch (err) {
      // If the server-side completion failed, do NOT navigate — the dashboard
      // guard would just bounce the user back to /onboarding/diagnostic
      // because `onboarding.completed` is still false. Surface the error so
      // they can retry instead of getting stuck in a redirect loop.
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not finalize onboarding. Please try again.",
      );
      return;
    }
    clear();
    router.push("/dashboard");
  };

  // Score colour mirrors the Figma: green ≥60, amber 40-59, red <40
  const score = data?.readinessScore ?? null;
  const scoreColour =
    score == null
      ? "#9999a5"
      : score >= 60
        ? "#22c55e"
        : score >= 40
          ? "#f97316"
          : "#ef4444";

  return (
    <OnboardingShell>
      <OnboardingCard
        icon={<ClipboardCheck size={28} />}
        iconColor="primary"
        title="Diagnostic Results"
        subtitle="Here's your interview readiness assessment"
        width={520}
      >
        {/* Readiness score */}
        <div
          className="rounded-[14px] border px-6 py-5 text-center"
          style={{ borderColor: "#ececf5" }}
        >
          {isPending ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2
                size={32}
                className="animate-spin"
                style={{ color: "#5450d8" }}
              />
              <span
                style={{
                  fontFamily: inter,
                  fontSize: "13px",
                  color: "#9999a5",
                }}
              >
                Scoring your responses…
              </span>
            </div>
          ) : (
            <>
              <div
                style={{
                  fontFamily: sora,
                  fontSize: "40px",
                  fontWeight: 700,
                  color: scoreColour,
                  lineHeight: 1.1,
                }}
              >
                {score ?? "—"}
                {score != null ? "%" : ""}
              </div>
              <div
                className="mt-1"
                style={{
                  fontFamily: inter,
                  fontSize: "13px",
                  color: "#9999a5",
                }}
              >
                Readiness Score
              </div>
            </>
          )}
        </div>

        {/* Strengths + Improve */}
        {!isPending && data && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <ResultBox
              tone="success"
              icon={<CheckCircle2 size={14} style={{ color: "#22c55e" }} />}
              title="Strengths"
              items={data.strengths.length ? data.strengths : ["—"]}
            />
            <ResultBox
              tone="warning"
              icon={<AlertTriangle size={14} style={{ color: "#f97316" }} />}
              title="Improve"
              items={data.improvements.length ? data.improvements : ["—"]}
            />
          </div>
        )}

        <div className="mt-5">
          <PrimaryButton
            onClick={handleGoToDashboard}
            disabled={completeOnboarding.isPending}
          >
            {completeOnboarding.isPending ? "Loading…" : "Go To Dashboard"}
          </PrimaryButton>
        </div>
      </OnboardingCard>
    </OnboardingShell>
  );
}

function ResultBox({
  icon,
  title,
  items,
}: {
  tone: "success" | "warning";
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div
      className="rounded-[14px] border px-3 py-3"
      style={{ borderColor: "#ececf5", background: "#fafafe" }}
    >
      <div className="mb-2 flex items-center gap-1.5">
        {icon}
        <span
          style={{
            fontFamily: sora,
            fontSize: "13px",
            fontWeight: 600,
            color: "#222c44",
          }}
        >
          {title}
        </span>
      </div>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-1.5"
            style={{
              fontFamily: inter,
              fontSize: "12px",
              color: "#5b5b6b",
            }}
          >
            <span
              className="h-1 w-1 rounded-full"
              style={{ background: "#9999a5" }}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
