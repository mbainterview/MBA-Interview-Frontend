"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye } from "lucide-react";
import { useAnalyticsHistory } from "@/services/analytics.service";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

function scoreColor(score: number) {
  if (score >= 70) return "#22c55e";
  if (score >= 60) return "#eab308";
  return "#ef4444";
}

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useAnalyticsHistory({ page, limit });

  const rows = (data?.items ?? []).map((item) => {
    const isKira = item.type === "kira";
    return {
      id: item.sessionId,
      date: new Date(item.createdAt).toLocaleDateString(),
      school: item.schoolName ?? "General",
      score: item.overallScore,
      sessionId: item.sessionId,
      isKira,
      typeLabel: isKira ? "Kira Essay" : "School-Specific",
      feedbackHref: isKira
        ? `/kira/results?sessionId=${item.sessionId}`
        : `/mock-interview/results?sessionId=${item.sessionId}`,
    };
  });

  const totalPages = data?.totalPages ?? 1;

  // Build page numbers to display
  function buildPageNumbers(): (number | "...")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (page > 3) pages.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <h1
        style={{
          fontFamily: sora,
          fontSize: "28px",
          fontWeight: 700,
          color: "#222c44",
          lineHeight: 1.2,
        }}
      >
        Interview History
      </h1>
      <p
        className="mt-1"
        style={{ fontFamily: inter, fontSize: "14px", color: "#9ea1c5" }}
      >
        Review your past interview sessions
      </p>

      <div
        className="mt-6 overflow-hidden rounded-[18px] bg-white"
        style={{ boxShadow: "0 4px 14px rgba(15, 11, 56, 0.05)" }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: "#fafafe" }}>
              <Th>Date</Th>
              <Th>Type</Th>
              <Th>School</Th>
              <Th>Score</Th>
              <Th>Feedback</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center"
                  style={{ fontFamily: inter, color: "#9ea1c5" }}
                >
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center"
                  style={{ fontFamily: inter, color: "#9ea1c5" }}
                >
                  No interview history yet
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t"
                  style={{ borderColor: "#ececf5" }}
                >
                  <Td>{row.date}</Td>
                  <Td>
                    <span
                      className="inline-flex rounded-full px-3 py-1"
                      style={{
                        background: row.isKira ? "#e6f9f0" : "#edecfd",
                        color: row.isKira ? "#0f9d58" : "#5450d8",
                        fontFamily: inter,
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      {row.typeLabel}
                    </span>
                  </Td>
                  <Td>{row.school}</Td>
                  <Td>
                    {row.score === null ? (
                      <span
                        className="inline-flex rounded-full px-3 py-1"
                        style={{
                          background: "#fff3d6",
                          color: "#a07c1a",
                          fontFamily: inter,
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        Pending
                      </span>
                    ) : (
                      <span
                        style={{
                          color: scoreColor(row.score),
                          fontFamily: sora,
                          fontSize: "14px",
                          fontWeight: 700,
                        }}
                      >
                        {row.score}%
                      </span>
                    )}
                  </Td>
                  <Td>
                    <Link
                      href={row.feedbackHref}
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
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div
          className="flex items-center justify-between gap-2 border-t px-5 py-4"
          style={{ borderColor: "#ececf5" }}
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1.5 rounded-[10px] border px-3 py-2 disabled:opacity-40"
            style={{
              borderColor: "#ececf5",
              color: "#5b5b6b",
              fontFamily: inter,
              fontSize: "12px",
              fontWeight: 500,
              background: "white",
            }}
          >
            <ArrowLeft size={13} />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {buildPageNumbers().map((p, i) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-1"
                    style={{
                      fontFamily: inter,
                      fontSize: "13px",
                      color: "#9ea1c5",
                    }}
                  >
                    ...
                  </span>
                );
              }
              const active = p === page;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className="rounded-[8px]"
                  style={{
                    background: active ? "#edecfd" : "transparent",
                    color: active ? "#5450d8" : "#5b5b6b",
                    width: "30px",
                    height: "30px",
                    fontFamily: inter,
                    fontSize: "13px",
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1.5 rounded-[10px] border px-3 py-2 disabled:opacity-40"
            style={{
              borderColor: "#ececf5",
              color: "#5b5b6b",
              fontFamily: inter,
              fontSize: "12px",
              fontWeight: 500,
              background: "white",
            }}
          >
            Next
            <ArrowRight size={13} />
          </button>
        </div>
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
