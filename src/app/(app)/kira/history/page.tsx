"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, Loader2 } from "lucide-react";
import { useKiraSessions } from "@/services/kira.service";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

function scoreColor(score: number) {
  if (score >= 70) return "#22c55e";
  if (score >= 60) return "#eab308";
  return "#ef4444";
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getAverageScore(
  responses?: { aiFeedback?: { overallScore: number } | null }[],
): number | null {
  if (!responses || responses.length === 0) return null;
  const scored = responses.filter((r) => r.aiFeedback?.overallScore != null);
  if (scored.length === 0) return null;
  const sum = scored.reduce(
    (acc, r) => acc + (r.aiFeedback?.overallScore ?? 0),
    0,
  );
  return Math.round(sum / scored.length);
}

export default function KiraHistoryPage() {
  const { data: sessions, isLoading } = useKiraSessions();

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="flex items-start justify-between">
        <div>
          <h1
            style={{
              fontFamily: sora,
              fontSize: "28px",
              fontWeight: 700,
              color: "#222c44",
              lineHeight: 1.2,
            }}
          >
            Kira Practice
          </h1>
          <p
            className="mt-1"
            style={{ fontFamily: inter, fontSize: "14px", color: "#9ea1c5" }}
          >
            Review your past interview sessions
          </p>
        </div>

        <Link
          href="/kira"
          className="rounded-[12px] transition-opacity hover:opacity-90"
          style={{
            background: "#5450d8",
            color: "white",
            padding: "12px 24px",
            fontFamily: inter,
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Kira Practice
        </Link>
      </div>

      <div
        className="mt-6 overflow-hidden rounded-[18px] bg-white"
        style={{ boxShadow: "0 4px 14px rgba(15, 11, 56, 0.05)" }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              size={28}
              className="animate-spin"
              style={{ color: "#5450d8" }}
            />
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <div className="py-16 text-center">
            <p
              style={{
                fontFamily: inter,
                fontSize: "14px",
                color: "#9ea1c5",
              }}
            >
              No Kira sessions yet. Start your first practice!
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: "#fafafe" }}>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Score</Th>
                <Th>Progress</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const avgScore = getAverageScore(session.responses);
                return (
                  <tr
                    key={session.id}
                    className="border-t"
                    style={{ borderColor: "#ececf5" }}
                  >
                    <Td>{formatDate(session.id)}</Td>
                    <Td>
                      <span
                        className="inline-flex rounded-full px-3 py-1"
                        style={{
                          background: "#edecfd",
                          color: "#5450d8",
                          fontFamily: inter,
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        Kira Essay
                      </span>
                    </Td>
                    <Td>
                      <span
                        style={{
                          fontFamily: inter,
                          fontSize: "12px",
                          fontWeight: 500,
                          color:
                            session.status === "completed"
                              ? "#22c55e"
                              : session.status === "in_progress"
                                ? "#eab308"
                                : "#9ea1c5",
                        }}
                      >
                        {session.status === "completed"
                          ? "Completed"
                          : session.status === "in_progress"
                            ? "In Progress"
                            : "Abandoned"}
                      </span>
                    </Td>
                    <Td>
                      {avgScore != null ? (
                        <span
                          style={{
                            color: scoreColor(avgScore),
                            fontFamily: sora,
                            fontSize: "14px",
                            fontWeight: 700,
                          }}
                        >
                          {avgScore}%
                        </span>
                      ) : (
                        <span
                          style={{
                            fontFamily: inter,
                            fontSize: "13px",
                            color: "#9ea1c5",
                          }}
                        >
                          --
                        </span>
                      )}
                    </Td>
                    <Td>
                      {session.completedCount}/{session.promptCount}
                    </Td>
                    <Td>
                      <Link
                        href={`/kira/results?sessionId=${session.id}`}
                        className="inline-flex items-center gap-1.5 rounded-[10px] border transition-colors hover:bg-[#f5f4ff]"
                        style={{
                          borderColor: "#5450d8",
                          color: "#5450d8",
                          padding: "7px 14px",
                          fontFamily: inter,
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        <Eye size={13} />
                        Feedback
                      </Link>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left"
      style={{
        fontFamily: sora,
        fontSize: "13px",
        fontWeight: 600,
        color: "#9ea1c5",
        padding: "14px 20px",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td
      style={{
        fontFamily: inter,
        fontSize: "13px",
        color: "#272727",
        padding: "14px 20px",
      }}
    >
      {children}
    </td>
  );
}
