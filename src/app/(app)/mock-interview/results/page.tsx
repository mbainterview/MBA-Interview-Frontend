"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, ChevronUp, Clock, Loader2, X } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { DotLoader } from "@/components/shared/dot-loader";
import {
  useSessionFeedback,
  generateAndFetchReport,
} from "@/services/feedback.service";
import { useSession } from "@/services/interview.service";
import type { TurnFeedback } from "@/types/domain";
import { toast } from "sonner";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

type DownloadState = "idle" | "preparing" | "done";

export default function MockInterviewResultsPage() {
  return (
    <Suspense fallback={null}>
      <ResultsInner />
    </Suspense>
  );
}

function ResultsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId") ?? "";

  const feedback = useSessionFeedback(sessionId);
  const session = useSession(sessionId);

  const [downloadState, setDownloadState] = useState<DownloadState>("idle");
  const [expandedTurn, setExpandedTurn] = useState<number | null>(0);

  const triggerBrowserDownload = (reportUrl: string) => {
    // Prefer an <a download> click so the file saves directly to disk
    // instead of opening a browser tab (same-origin rule doesn't apply to
    // signed URLs in most browsers — if it does, the server URL has
    // Content-Disposition: attachment set on the pre-signed response).
    const a = document.createElement("a");
    a.href = reportUrl;
    a.rel = "noopener";
    a.target = "_blank";
    a.download = `mock-interview-report-${sessionId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownload = async () => {
    if (downloadState === "preparing") return;
    setDownloadState("preparing");
    try {
      const { reportUrl } = await generateAndFetchReport(sessionId);
      triggerBrowserDownload(reportUrl);
      setDownloadState("done");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate report";
      toast.error(message);
      setDownloadState("idle");
    }
  };

  const handleClose = () => setDownloadState("idle");

  const feedbackData = feedback.data;
  const sessionData = session.data;

  // Coerce string-encoded decimals (Postgres returns "0.20") to numbers.
  const overallScore = Number(feedbackData?.overallScore ?? 0);
  const criteriaScores = feedbackData?.criteriaScores ?? [];
  const videoAnalysis = feedbackData?.videoAnalysis ?? null;
  const strengths = useMemo(() => {
    const combined = [
      ...(feedbackData?.strengths ?? []),
      ...(videoAnalysis?.strengths ?? []),
    ];
    return dedupe(combined);
  }, [feedbackData?.strengths, videoAnalysis?.strengths]);
  const improvements = useMemo(() => {
    const combined = [
      ...(feedbackData?.weaknesses ?? []),
      ...(videoAnalysis?.improvements ?? []),
    ];
    return dedupe(combined);
  }, [feedbackData?.weaknesses, videoAnalysis?.improvements]);
  const focusAreas = feedbackData?.suggestedFocusAreas ?? [];

  // Build turn feedback rows with the actual question text from the session.
  const questionRows = useMemo(() => {
    const rows = feedbackData?.turnFeedbacks ?? [];
    return rows.map((tf) => {
      const sessionTurn = sessionData?.turns?.find(
        (t) => t.turnIndex === tf.turnIndex,
      );
      return {
        ...tf,
        score: Number(tf.score),
        aiQuestion: sessionTurn?.aiQuestion ?? `Question ${tf.turnIndex + 1}`,
      };
    });
  }, [feedbackData?.turnFeedbacks, sessionData?.turns]);

  const radarData = useMemo(() => {
    if (!videoAnalysis) return [];
    return [
      { axis: "Confidence", score: Number(videoAnalysis.confidenceScore ?? 0) },
      { axis: "Body Language", score: Number(videoAnalysis.bodyLanguageScore ?? 0) },
      { axis: "Eye Contact", score: Number(videoAnalysis.eyeContactScore ?? 0) },
      { axis: "Pacing", score: Number(videoAnalysis.pacingScore ?? 0) },
      {
        axis: "Presentation",
        score: Number(videoAnalysis.overallPresentationScore ?? 0),
      },
    ];
  }, [videoAnalysis]);

  const feedbackNotReady =
    feedback.isLoading || feedback.isError || !feedbackData;

  if (feedback.isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-6 py-20">
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: "#5450d8" }}
        />
        <span
          className="ml-3"
          style={{ fontFamily: inter, fontSize: "15px", color: "#9ea1c5" }}
        >
          Loading feedback...
        </span>
      </div>
    );
  }

  if (feedbackNotReady) {
    return (
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <div
          className="rounded-[24px] bg-white p-8 lg:p-10"
          style={{ boxShadow: "0 20px 60px rgba(15, 11, 56, 0.08)" }}
        >
          <h1
            style={{
              fontFamily: sora,
              fontSize: "22px",
              fontWeight: 700,
              color: "#222c44",
            }}
          >
            Mock Interview
          </h1>
          <div className="mt-8 flex flex-col items-center py-12">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: "#eef0ff" }}
            >
              <Clock size={32} style={{ color: "#5450d8" }} />
            </div>
            <h2
              className="mt-5"
              style={{
                fontFamily: sora,
                fontSize: "20px",
                fontWeight: 700,
                color: "#222c44",
              }}
            >
              Your Feedback is Being Generated
            </h2>
            <p
              className="mt-2 max-w-md text-center"
              style={{
                fontFamily: inter,
                fontSize: "14px",
                color: "#9ea1c5",
                lineHeight: 1.6,
              }}
            >
              Our AI is analyzing your interview recording and preparing
              detailed feedback. This may take a few minutes.
            </p>
            <p
              className="mt-1 max-w-md text-center"
              style={{
                fontFamily: inter,
                fontSize: "14px",
                color: "#9ea1c5",
                lineHeight: 1.6,
              }}
            >
              You can check your feedback in the{" "}
              <span style={{ color: "#5450d8", fontWeight: 600 }}>History</span>{" "}
              page once it&apos;s ready.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/history")}
                className="rounded-[12px] border transition-colors hover:bg-[#f5f4ff]"
                style={{
                  borderColor: "#5450d8",
                  background: "white",
                  color: "#5450d8",
                  padding: "12px 28px",
                  fontFamily: inter,
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Go to History
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="rounded-[12px] transition-opacity hover:opacity-90"
                style={{
                  background: "#5450d8",
                  color: "white",
                  padding: "12px 28px",
                  fontFamily: inter,
                  fontSize: "14px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <h1
        style={{
          fontFamily: sora,
          fontSize: "24px",
          fontWeight: 600,
          color: "#222c44",
          lineHeight: 1.3,
        }}
      >
        Mock Interview Results
      </h1>

      {/* Row 1: Overall Performance + Performance Breakdown */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Overall Performance">
          <div className="mt-4 flex flex-col items-center">
            <Gauge percent={Math.round(overallScore * 10)} />
          </div>
          {criteriaScores.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {criteriaScores.slice(0, 4).map((c) => (
                <div
                  key={c.criterionName}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    style={{
                      fontFamily: sora,
                      fontSize: "26px",
                      fontWeight: 700,
                      color: "#272727",
                      lineHeight: 1.3,
                    }}
                  >
                    {Math.round(Number(c.score) * 10)}%
                  </div>
                  <div
                    className="text-center"
                    style={{
                      fontFamily: sora,
                      fontSize: "13px",
                      color: "#868686",
                      lineHeight: 1.3,
                    }}
                  >
                    {c.criterionName}
                  </div>
                </div>
              ))}
            </div>
          )}
          {feedbackData.overallSummary && (
            <p
              className="mt-5 border-t pt-4"
              style={{
                borderColor: "#ececf5",
                fontFamily: inter,
                fontSize: "13px",
                color: "#5b5b6b",
                lineHeight: 1.6,
              }}
            >
              {feedbackData.overallSummary}
            </p>
          )}
        </Card>

        <Card title="Performance Breakdown">
          {videoAnalysis && radarData.length > 0 ? (
            <div className="mt-2 h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="75%"
                  data={radarData}
                >
                  <PolarGrid stroke="#e6e6e6" />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fill: "#868686", fontSize: 13 }}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#5450d8"
                    fill="#5450d8"
                    fillOpacity={0.25}
                    isAnimationActive={false}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState label="Presentation breakdown will appear once video analysis completes." />
          )}
        </Card>
      </div>

      {/* Row 2: Strengths + Needs Improvement */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Your Strengths">
          <BulletList
            items={strengths}
            variant="positive"
            emptyMessage="No strengths identified yet."
          />
        </Card>

        <Card title="Needs Improvement">
          <BulletList
            items={improvements}
            variant="negative"
            emptyMessage="No specific improvement areas identified."
          />
        </Card>
      </div>

      {/* Row 3: Question-wise Feedback */}
      <div className="mt-6">
        <Card title="Question-wise Feedback">
          {questionRows.length === 0 ? (
            <EmptyState label="Per-question feedback is not available yet." />
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              {questionRows.map((row) => (
                <QuestionRow
                  key={row.id}
                  row={row}
                  isOpen={expandedTurn === row.turnIndex}
                  onToggle={() =>
                    setExpandedTurn(
                      expandedTurn === row.turnIndex ? null : row.turnIndex,
                    )
                  }
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Row 4: AI Insights */}
      <div className="mt-6">
        <Card title="AI Insights">
          <BulletList
            items={focusAreas}
            variant="positive"
            emptyMessage="No additional insights."
          />
        </Card>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-[16px] transition-opacity hover:opacity-90"
          style={{
            background: "#5450d8",
            color: "white",
            padding: "14px 32px",
            fontFamily: inter,
            fontSize: "15px",
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
          }}
        >
          Go to Dashboard
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloadState === "preparing"}
          className="rounded-[16px] border transition-colors hover:bg-[#f5f4ff] disabled:opacity-60"
          style={{
            borderColor: "#5450d8",
            background: "white",
            color: "#5450d8",
            padding: "14px 32px",
            fontFamily: inter,
            fontSize: "15px",
            fontWeight: 500,
            cursor:
              downloadState === "preparing" ? "not-allowed" : "pointer",
          }}
        >
          Download Report
        </button>
        <button
          type="button"
          onClick={() => router.push("/history")}
          className="rounded-[16px] border transition-colors hover:bg-[#f5f4ff]"
          style={{
            borderColor: "#5450d8",
            background: "white",
            color: "#5450d8",
            padding: "14px 32px",
            fontFamily: inter,
            fontSize: "15px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Back to Interview List
        </button>
        <button
          type="button"
          onClick={() => router.push("/mock-interview")}
          className="rounded-[16px] transition-opacity hover:opacity-90"
          style={{
            background: "#5450d8",
            color: "white",
            padding: "14px 32px",
            fontFamily: inter,
            fontSize: "15px",
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
          }}
        >
          Retry Interview
        </button>
      </div>

      {/* Preparing Your Report modal */}
      <Dialog
        open={downloadState === "preparing"}
        onOpenChange={(open) => {
          if (!open) setDownloadState("idle");
        }}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-100">
          <div className="flex flex-col items-center px-4 py-6">
            <DotLoader />
            <h2
              className="mt-5"
              style={{
                fontFamily: sora,
                fontSize: "20px",
                fontWeight: 700,
                color: "#222c44",
              }}
            >
              Preparing Your Report
            </h2>
            <p
              className="mt-2 text-center"
              style={{
                fontFamily: inter,
                fontSize: "13px",
                color: "#9ea1c5",
              }}
            >
              Your Interview report is being generated. Please wait
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-5 rounded-[12px] border transition-colors"
              style={{
                borderColor: "#5450d8",
                background: "white",
                color: "#5450d8",
                padding: "10px 32px",
                fontFamily: inter,
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Download Successful modal */}
      <Dialog
        open={downloadState === "done"}
        onOpenChange={(open) => {
          if (!open) setDownloadState("idle");
        }}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-100">
          <div className="flex flex-col items-center px-4 py-6">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-white"
              style={{ background: "#5450d8" }}
            >
              <Check size={26} strokeWidth={3} />
            </div>
            <h2
              className="mt-4"
              style={{
                fontFamily: sora,
                fontSize: "20px",
                fontWeight: 700,
                color: "#222c44",
              }}
            >
              Download Successful
            </h2>
            <p
              className="mt-2 text-center"
              style={{
                fontFamily: inter,
                fontSize: "13px",
                color: "#9ea1c5",
              }}
            >
              Your file has been successfully downloaded.
            </p>
            <div className="mt-5 flex w-full gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-[12px] border transition-colors"
                style={{
                  borderColor: "#5450d8",
                  background: "white",
                  color: "#5450d8",
                  padding: "10px 0",
                  fontFamily: inter,
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 rounded-[12px] transition-opacity hover:opacity-90"
                style={{
                  background: "#5450d8",
                  color: "white",
                  padding: "10px 0",
                  fontFamily: inter,
                  fontSize: "14px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Download Again
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Presentational sub-components
// ────────────────────────────────────────────────────────────────────────────

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[20px] bg-white p-6"
      style={{ boxShadow: "0 4px 14px rgba(15, 11, 56, 0.05)" }}
    >
      <h2
        style={{
          fontFamily: sora,
          fontSize: "18px",
          fontWeight: 600,
          color: "#272727",
          lineHeight: 1.5,
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function Gauge({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = 90;
  const circumference = Math.PI * radius;
  const dashOffset = circumference * (1 - clamped / 100);
  const stroke = percent >= 70 ? "#22c55e" : percent >= 50 ? "#eab308" : "#ef4444";

  return (
    <div className="relative flex w-full justify-center">
      <svg width="240" height="140" viewBox="0 0 240 140">
        <path
          d="M 20 120 A 100 100 0 0 1 220 120"
          fill="none"
          stroke="#eef0ff"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M 30 120 A 90 90 0 0 1 210 120"
          fill="none"
          stroke={stroke}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-end pb-2"
        style={{ paddingBottom: "8px" }}
      >
        <div
          style={{
            fontFamily: inter,
            fontWeight: 500,
            fontSize: "32px",
            color: "#272727",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {clamped} / 100
        </div>
        <div
          className="mt-1"
          style={{
            fontFamily: inter,
            fontSize: "12px",
            color: "#868686",
          }}
        >
          Overall Score
        </div>
      </div>
    </div>
  );
}

function BulletList({
  items,
  variant,
  emptyMessage,
}: {
  items: string[];
  variant: "positive" | "negative";
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <EmptyState label={emptyMessage} />;
  }
  const iconBg = variant === "positive" ? "#e7f6e1" : "#fde4e4";
  const iconColor = variant === "positive" ? "#53b930" : "#ef4444";

  return (
    <ul className="mt-4 flex flex-col gap-4">
      {items.map((item, idx) => (
        <li
          key={idx}
          className="flex items-start gap-3"
          style={{
            fontFamily: inter,
            fontSize: "14px",
            color: "#5b5b6b",
            lineHeight: 1.5,
          }}
        >
          <span
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            style={{ background: iconBg, color: iconColor }}
          >
            {variant === "positive" ? (
              <Check size={14} strokeWidth={3} />
            ) : (
              <X size={14} strokeWidth={3} />
            )}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div
      className="mt-3 flex h-[120px] items-center justify-center rounded-[12px] border border-dashed px-4 text-center"
      style={{
        borderColor: "#ececf5",
        fontFamily: inter,
        fontSize: "13px",
        color: "#9ea1c5",
      }}
    >
      {label}
    </div>
  );
}

function QuestionRow({
  row,
  isOpen,
  onToggle,
}: {
  row: TurnFeedback & { score: number; aiQuestion: string };
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="rounded-[12px] border"
      style={{ borderColor: "#e6e6e6" }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-4 px-4 py-5 text-left"
        style={{ cursor: "pointer" }}
      >
        <div className="flex flex-1 items-start gap-3">
          <span
            style={{
              fontFamily: inter,
              fontWeight: 700,
              fontSize: "22px",
              color: "#f8cc16",
              lineHeight: 1.2,
            }}
          >
            Q{row.turnIndex + 1}
          </span>
          <span
            className="flex-1"
            style={{
              fontFamily: inter,
              fontWeight: 400,
              fontSize: "15px",
              color: "#272727",
              lineHeight: 1.5,
            }}
          >
            {row.aiQuestion}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span
            className="rounded-full px-3 py-1.5"
            style={{
              background: "#eeeefe",
              color: "#5450d8",
              fontFamily: inter,
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            {row.score.toFixed(1)}/10
          </span>
          {isOpen ? (
            <ChevronUp size={18} style={{ color: "#868686" }} />
          ) : (
            <ChevronDown size={18} style={{ color: "#868686" }} />
          )}
        </div>
      </button>

      {isOpen && (
        <div
          className="border-t px-4 py-5"
          style={{ borderColor: "#ececf5" }}
        >
          {row.feedback && (
            <div
              className="rounded-[12px] px-4 py-4"
              style={{ background: "#f3f3f3" }}
            >
              <p
                style={{
                  fontFamily: inter,
                  fontSize: "14px",
                  color: "#5b5b6b",
                  lineHeight: 1.5,
                }}
              >
                {row.feedback}
              </p>
            </div>
          )}

          {(row.keyStrengths.length > 0 ||
            row.areasForImprovement.length > 0) && (
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <p
                  className="mb-3"
                  style={{
                    fontFamily: inter,
                    fontWeight: 600,
                    fontSize: "15px",
                    color: "#53b930",
                  }}
                >
                  What went well
                </p>
                <BulletList
                  items={row.keyStrengths}
                  variant="positive"
                  emptyMessage="No specific strengths for this answer."
                />
              </div>
              <div>
                <p
                  className="mb-3"
                  style={{
                    fontFamily: inter,
                    fontWeight: 600,
                    fontSize: "15px",
                    color: "#ef4444",
                  }}
                >
                  Could be better
                </p>
                <BulletList
                  items={row.areasForImprovement}
                  variant="negative"
                  emptyMessage="No specific improvements for this answer."
                />
              </div>
            </div>
          )}

          {row.suggestedAnswer && (
            <div
              className="mt-5 rounded-[12px] px-4 py-4"
              style={{ background: "#f3f3f3" }}
            >
              <p
                className="mb-2"
                style={{
                  fontFamily: inter,
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#272727",
                }}
              >
                Suggested Ideal Answer
              </p>
              <p
                style={{
                  fontFamily: inter,
                  fontSize: "14px",
                  color: "#5b5b6b",
                  lineHeight: 1.6,
                  fontStyle: "italic",
                }}
              >
                &ldquo;{row.suggestedAnswer}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function dedupe(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const item = raw?.trim();
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
