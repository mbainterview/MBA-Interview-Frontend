"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, X, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Gauge } from "@/components/shared/gauge";
import { RadarChart } from "@/components/shared/radar-chart";
import { useKiraSession } from "@/services/kira.service";
import type { KiraResponse } from "@/types/domain";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function collectInsights(responses: KiraResponse[]) {
  const strengths: string[] = [];
  const improvements: string[] = [];

  for (const r of responses) {
    const fb = r.aiFeedback;
    if (!fb) continue;

    // Categorize suggestions based on score thresholds
    if (fb.clarity > 7) strengths.push(`Q${r.orderIndex + 1}: Strong clarity in response`);
    if (fb.structure > 7) strengths.push(`Q${r.orderIndex + 1}: Well-structured answer`);
    if (fb.content > 7) strengths.push(`Q${r.orderIndex + 1}: Excellent content quality`);
    if (fb.confidence > 7) strengths.push(`Q${r.orderIndex + 1}: Confident delivery`);

    if (fb.clarity <= 7) improvements.push(`Q${r.orderIndex + 1}: Improve clarity of response`);
    if (fb.structure <= 7) improvements.push(`Q${r.orderIndex + 1}: Work on answer structure`);
    if (fb.content <= 7) improvements.push(`Q${r.orderIndex + 1}: Strengthen content depth`);
    if (fb.confidence <= 7) improvements.push(`Q${r.orderIndex + 1}: Build more confidence`);

    // Also include explicit suggestions from the AI
    for (const suggestion of fb.suggestions ?? []) {
      if (fb.overallScore > 70) {
        strengths.push(suggestion);
      } else {
        improvements.push(suggestion);
      }
    }
  }

  // Deduplicate and limit
  return {
    strengths: [...new Set(strengths)].slice(0, 6),
    improvements: [...new Set(improvements)].slice(0, 6),
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Page (with Suspense wrapper for useSearchParams)                          */
/* ────────────────────────────────────────────────────────────────────────── */

export default function KiraResultsPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2
            size={32}
            className="animate-spin"
            style={{ color: "#5450d8" }}
          />
        </div>
      }
    >
      <KiraResultsPage />
    </Suspense>
  );
}

function KiraResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId") ?? "";
  const { data: session, isLoading } = useKiraSession(sessionId);

  const [expandedId, setExpandedId] = useState<number | null>(0);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-6 py-20">
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: "#5450d8" }}
        />
      </div>
    );
  }

  const responses = session?.responses ?? [];

  // Calculate overall score
  const scoredResponses = responses.filter(
    (r) => r.aiFeedback?.overallScore != null,
  );
  const overallScore = avg(
    scoredResponses.map((r) => r.aiFeedback!.overallScore),
  );

  // Sub-metrics
  const subMetrics = [
    {
      label: "Clarity",
      value: avg(
        scoredResponses.map((r) => r.aiFeedback!.clarity * 10),
      ),
    },
    {
      label: "Structure",
      value: avg(
        scoredResponses.map((r) => r.aiFeedback!.structure * 10),
      ),
    },
    {
      label: "Content",
      value: avg(
        scoredResponses.map((r) => r.aiFeedback!.content * 10),
      ),
    },
    {
      label: "Confidence",
      value: avg(
        scoredResponses.map((r) => r.aiFeedback!.confidence * 10),
      ),
    },
  ];

  // Radar axes (0-1 scale)
  const radarAxes = [
    {
      label: "Clarity",
      value: scoredResponses.length
        ? scoredResponses.reduce((a, r) => a + r.aiFeedback!.clarity, 0) /
          scoredResponses.length /
          10
        : 0,
    },
    {
      label: "Structure",
      value: scoredResponses.length
        ? scoredResponses.reduce((a, r) => a + r.aiFeedback!.structure, 0) /
          scoredResponses.length /
          10
        : 0,
    },
    {
      label: "Content",
      value: scoredResponses.length
        ? scoredResponses.reduce((a, r) => a + r.aiFeedback!.content, 0) /
          scoredResponses.length /
          10
        : 0,
    },
    {
      label: "Confidence",
      value: scoredResponses.length
        ? scoredResponses.reduce((a, r) => a + r.aiFeedback!.confidence, 0) /
          scoredResponses.length /
          10
        : 0,
    },
  ];

  const { strengths, improvements } = collectInsights(responses);

  // AI Insights from all suggestions
  const aiInsights = responses.flatMap(
    (r) => r.aiFeedback?.suggestions ?? [],
  ).slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <h1
        style={{
          fontFamily: sora,
          fontSize: "26px",
          fontWeight: 700,
          color: "#222c44",
        }}
      >
        Kira Interview Results
      </h1>

      {/* Row 1 -- gauge + radar */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Overall Performance</CardTitle>
          <div className="mt-3 flex flex-col items-center">
            <Gauge value={overallScore} />
          </div>
          <div className="mt-5 grid grid-cols-4 gap-2">
            {subMetrics.map((metric) => (
              <div
                key={metric.label}
                className="flex flex-col items-center"
              >
                <span
                  style={{
                    fontFamily: sora,
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#222c44",
                  }}
                >
                  {metric.value}%
                </span>
                <span
                  className="mt-0.5 text-center"
                  style={{
                    fontFamily: inter,
                    fontSize: "11px",
                    color: "#9ea1c5",
                  }}
                >
                  {metric.label}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>Performance Breakdown</CardTitle>
          <div className="mt-2 flex justify-center">
            <RadarChart axes={radarAxes} />
          </div>
        </Card>
      </div>

      {/* Row 2 -- strengths + improvements */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Your Strengths</CardTitle>
          <ul className="mt-3 flex flex-col gap-2.5">
            {strengths.length > 0 ? (
              strengths.map((item) => (
                <ListItem key={item} tone="success">
                  {item}
                </ListItem>
              ))
            ) : (
              <li
                style={{
                  fontFamily: inter,
                  fontSize: "13px",
                  color: "#9ea1c5",
                }}
              >
                Complete more questions to see your strengths
              </li>
            )}
          </ul>
        </Card>

        <Card>
          <CardTitle>Needs Improvement</CardTitle>
          <ul className="mt-3 flex flex-col gap-2.5">
            {improvements.length > 0 ? (
              improvements.map((item) => (
                <ListItem key={item} tone="error">
                  {item}
                </ListItem>
              ))
            ) : (
              <li
                style={{
                  fontFamily: inter,
                  fontSize: "13px",
                  color: "#9ea1c5",
                }}
              >
                Complete more questions to see areas for improvement
              </li>
            )}
          </ul>
        </Card>
      </div>

      {/* Row 3 -- Question-wise Feedback */}
      <div className="mt-4">
        <Card>
          <CardTitle>Question-wise Feedback</CardTitle>
          <div className="mt-3 flex flex-col gap-2.5">
            {responses.map((r, idx) => {
              const fb = r.aiFeedback;
              const isOpen = expandedId === idx;
              const score = fb?.overallScore ?? 0;
              const duration = r.recordingDurationSeconds
                ? `${r.recordingDurationSeconds}/${r.prompt?.responseTimeSeconds ?? 60}s`
                : "--";

              // Split suggestions into strengths/improvements for per-question view
              const qStrengths: string[] = [];
              const qImprovements: string[] = [];
              if (fb) {
                if (fb.clarity > 7) qStrengths.push("Clear and articulate response");
                if (fb.structure > 7) qStrengths.push("Well-organized structure");
                if (fb.content > 7) qStrengths.push("Strong content quality");
                if (fb.confidence > 7) qStrengths.push("Confident delivery");
                if (fb.clarity <= 7) qImprovements.push("Improve clarity of expression");
                if (fb.structure <= 7) qImprovements.push("Better organize your response");
                if (fb.content <= 7) qImprovements.push("Add more depth to content");
                if (fb.confidence <= 7) qImprovements.push("Project more confidence");
              }

              return (
                <div
                  key={r.id}
                  className="rounded-[12px] border"
                  style={{ borderColor: "#ececf5", background: "#fafafe" }}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                  >
                    <div className="flex flex-1 items-center gap-3">
                      <span
                        style={{
                          fontFamily: sora,
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#5450d8",
                          minWidth: "22px",
                        }}
                      >
                        Q{idx + 1}
                      </span>
                      <span
                        style={{
                          fontFamily: inter,
                          fontSize: "13px",
                          color: "#272727",
                        }}
                      >
                        {r.prompt?.text ?? "Question"}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        style={{
                          fontFamily: inter,
                          fontSize: "12px",
                          color: "#9ea1c5",
                        }}
                      >
                        {duration}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-0.5"
                        style={{
                          background: "#edecfd",
                          color: "#5450d8",
                          fontFamily: inter,
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {score}/10
                      </span>
                      {isOpen ? (
                        <ChevronUp size={14} style={{ color: "#9ea1c5" }} />
                      ) : (
                        <ChevronDown size={14} style={{ color: "#9ea1c5" }} />
                      )}
                    </div>
                  </button>

                  {isOpen && fb && (
                    <div
                      className="border-t px-4 py-4"
                      style={{ borderColor: "#ececf5" }}
                    >
                      {fb.summary && (
                        <p
                          className="rounded-[10px] px-3 py-2"
                          style={{
                            background: "#eef0ff",
                            fontFamily: inter,
                            fontSize: "12px",
                            color: "#5b5b6b",
                          }}
                        >
                          {fb.summary}
                        </p>
                      )}

                      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <h4
                            className="mb-2"
                            style={{
                              fontFamily: sora,
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "#22c55e",
                            }}
                          >
                            What went well
                          </h4>
                          <ul className="flex flex-col gap-1.5">
                            {qStrengths.map((w) => (
                              <ListItem key={w} tone="success" small>
                                {w}
                              </ListItem>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4
                            className="mb-2"
                            style={{
                              fontFamily: sora,
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "#ef4444",
                            }}
                          >
                            Could be better
                          </h4>
                          <ul className="flex flex-col gap-1.5">
                            {qImprovements.map((b) => (
                              <ListItem key={b} tone="error" small>
                                {b}
                              </ListItem>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {fb.suggestions && fb.suggestions.length > 0 && (
                        <div
                          className="mt-3 rounded-[10px] p-3"
                          style={{ background: "#f2f3f9" }}
                        >
                          <h4
                            className="mb-1.5"
                            style={{
                              fontFamily: sora,
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "#222c44",
                            }}
                          >
                            AI Suggestions
                          </h4>
                          <ul className="flex flex-col gap-1">
                            {fb.suggestions.map((s, si) => (
                              <li
                                key={si}
                                style={{
                                  fontFamily: inter,
                                  fontSize: "12px",
                                  color: "#5b5b6b",
                                  lineHeight: 1.55,
                                }}
                              >
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Row 4 -- AI Insights */}
      {aiInsights.length > 0 && (
        <div className="mt-4">
          <Card>
            <CardTitle>AI Insights</CardTitle>
            <ul className="mt-3 flex flex-col gap-2.5">
              {aiInsights.map((insight, i) => (
                <ListItem key={i} tone="success">
                  {insight}
                </ListItem>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ActionButton variant="solid" onClick={() => router.push("/dashboard")}>
          Go To Dashboard
        </ActionButton>
        <ActionButton variant="outline">Download Report</ActionButton>
        <ActionButton
          variant="outline"
          onClick={() => router.push("/kira/history")}
        >
          Back To Interview List
        </ActionButton>
        <ActionButton variant="solid" onClick={() => router.push("/kira")}>
          Retry Kira Interview
        </ActionButton>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Local building blocks                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[18px] bg-white p-5"
      style={{ boxShadow: "0 4px 14px rgba(15, 11, 56, 0.05)" }}
    >
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: sora,
        fontSize: "15px",
        fontWeight: 700,
        color: "#222c44",
      }}
    >
      {children}
    </h2>
  );
}

function ListItem({
  children,
  tone,
  small,
}: {
  children: React.ReactNode;
  tone: "success" | "error";
  small?: boolean;
}) {
  const Icon = tone === "success" ? Check : X;
  const color = tone === "success" ? "#22c55e" : "#ef4444";
  return (
    <li
      className="flex items-start gap-2"
      style={{
        fontFamily: inter,
        fontSize: small ? "12px" : "13px",
        color: "#5b5b6b",
        lineHeight: 1.5,
      }}
    >
      <Icon
        size={small ? 12 : 14}
        className="mt-0.5 shrink-0"
        style={{ color }}
      />
      <span>{children}</span>
    </li>
  );
}

function ActionButton({
  children,
  variant,
  onClick,
}: {
  children: React.ReactNode;
  variant: "solid" | "outline";
  onClick?: () => void;
}) {
  const solid = variant === "solid";
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[12px] transition-opacity hover:opacity-90"
      style={{
        background: solid ? "#5450d8" : "white",
        color: solid ? "white" : "#5450d8",
        border: solid ? "none" : "1px solid #5450d8",
        padding: "12px 24px",
        fontFamily: inter,
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
