"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  MessageSquare,
  Target,
  Video,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Gauge } from "@/components/shared/gauge";
import { useAuth } from "@/providers/auth-provider";
import {
  useAnalyticsOverview,
  useAnalyticsHistory,
  useDashboardSkillBreakdown,
} from "@/services/analytics.service";
import { useCurrentSubscription } from "@/services/subscription.service";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

interface DashboardStat {
  label: string;
  value: string;
  iconKey: "compass" | "chat" | "target" | "video";
  highlighted?: boolean;
}

const ICONS: Record<DashboardStat["iconKey"], LucideIcon> = {
  compass: Compass,
  chat: MessageSquare,
  target: Target,
  video: Video,
};

const SKILL_COLORS = ["#eab308", "#22c55e", "#f97316", "#5450d8"];
const SKILL_TRACK_COLORS = ["#fef3c7", "#dcfce7", "#ffe9da", "#edecfd"];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: overview, isLoading: overviewLoading } =
    useAnalyticsOverview();
  const { data: historyData, isLoading: historyLoading } =
    useAnalyticsHistory({ limit: 8 });
  const { data: skills, isLoading: skillsLoading } =
    useDashboardSkillBreakdown();
  const { data: subscription } = useCurrentSubscription({
    // Dashboard is the most common landing point after payment success — force
    // a fresh fetch on mount so the "Upgrade" banner disappears as soon as the
    // webhook has written the paid plan, without waiting out the 60s staleTime.
    refetchOnMount: "always",
    staleTime: 0,
  });

  const firstName = user?.firstName || "there";
  const initials =
    (user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "") || "U";

  const stats: DashboardStat[] = overview
    ? [
        {
          label: "Total Sessions",
          value: String(overview.totalSessions),
          iconKey: "compass",
        },
        {
          label: "Average Score",
          value: `${Math.round(overview.averageScore)}%`,
          iconKey: "chat",
          highlighted: true,
        },
        {
          label: "Completed",
          value: String(overview.completedSessions),
          iconKey: "target",
        },
        {
          label: "Tokens Used",
          value: overview.totalTokensUsed.toLocaleString(),
          iconKey: "video",
        },
      ]
    : [];

  const recentInterviews = (historyData?.items ?? []).map((item) => ({
    id: item.sessionId,
    title: item.schoolName ?? (item.type === "kira" ? "Kira Essay" : "General"),
    date: new Date(item.createdAt).toLocaleDateString(),
    score: item.overallScore ?? 0,
    href:
      item.type === "kira"
        ? `/kira/results?sessionId=${item.sessionId}`
        : `/mock-interview/results?sessionId=${item.sessionId}`,
  }));

  // Match the Figma's four-bucket gauge set in fixed order so the dashboard
  // is visually stable across users (no shuffling between sessions).
  const skillProgress = [
    { label: "Communication", value: skills?.communication ?? 0 },
    { label: "Structure", value: skills?.structure ?? 0 },
    { label: "Motivation", value: skills?.motivation ?? 0 },
    { label: "School Fit", value: skills?.schoolFit ?? 0 },
  ].map((s, i) => ({
    ...s,
    color: SKILL_COLORS[i % SKILL_COLORS.length],
    trackColor: SKILL_TRACK_COLORS[i % SKILL_TRACK_COLORS.length],
  }));

  const showUpgrade =
    !subscription ||
    subscription.plan.isDefault ||
    subscription.plan.priceInCents === 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      {/* Greeting */}
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback
            style={{
              background: "#edecfd",
              color: "#5450d8",
              fontFamily: inter,
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h1
            style={{
              fontFamily: sora,
              fontSize: "24px",
              fontWeight: 700,
              color: "#222c44",
              lineHeight: 1.2,
            }}
          >
            Welcome back, {firstName}
          </h1>
          <p
            style={{
              fontFamily: inter,
              fontSize: "13px",
              color: "#9ea1c5",
            }}
          >
            Here&apos;s your interview preparation overview
          </p>
        </div>
      </div>

      {/* Stat row */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewLoading ? (
          <div
            className="col-span-full text-center py-8"
            style={{ fontFamily: inter, color: "#9ea1c5" }}
          >
            Loading...
          </div>
        ) : (
          stats.map((stat) => {
            const Icon = ICONS[stat.iconKey];
            const highlighted = stat.highlighted;
            return (
              <div
                key={stat.label}
                className="rounded-[16px] p-5"
                style={{
                  background: highlighted ? "#5450d8" : "white",
                  boxShadow: highlighted
                    ? "0 10px 30px rgba(84, 80, 216, 0.18)"
                    : "0 4px 14px rgba(15, 11, 56, 0.05)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: highlighted
                        ? "rgba(255,255,255,0.18)"
                        : "#edecfd",
                      color: highlighted ? "white" : "#5450d8",
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span
                      style={{
                        fontFamily: inter,
                        fontSize: "13px",
                        color: highlighted
                          ? "rgba(255,255,255,0.85)"
                          : "#9ea1c5",
                      }}
                    >
                      {stat.label}
                    </span>
                    <span
                      style={{
                        fontFamily: sora,
                        fontSize: "22px",
                        fontWeight: 700,
                        color: highlighted ? "white" : "#222c44",
                      }}
                    >
                      {stat.value}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Body — recent interviews + skill progress */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Recent Interviews */}
        <div>
          <h2
            className="mb-4"
            style={{
              fontFamily: sora,
              fontSize: "20px",
              fontWeight: 700,
              color: "#222c44",
            }}
          >
            Recent Interviews
          </h2>

          {historyLoading ? (
            <div
              className="py-8 text-center"
              style={{ fontFamily: inter, color: "#9ea1c5" }}
            >
              Loading...
            </div>
          ) : recentInterviews.length === 0 ? (
            <div
              className="py-8 text-center"
              style={{ fontFamily: inter, color: "#9ea1c5" }}
            >
              No interviews yet
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {recentInterviews.map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between rounded-[14px] bg-white px-5 py-4"
                  style={{ boxShadow: "0 4px 14px rgba(15, 11, 56, 0.05)" }}
                >
                  <div className="flex flex-col">
                    <span
                      style={{
                        fontFamily: sora,
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#222c44",
                      }}
                    >
                      {row.title}
                    </span>
                    <span
                      className="mt-0.5"
                      style={{
                        fontFamily: inter,
                        fontSize: "12px",
                        color: "#9ea1c5",
                      }}
                    >
                      {row.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      style={{
                        fontFamily: sora,
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#222c44",
                      }}
                    >
                      {row.score}%
                    </span>
                    <Link
                      href={row.href}
                      className="rounded-[10px] border transition-colors hover:bg-[#f5f4ff]"
                      style={{
                        borderColor: "#5450d8",
                        color: "#5450d8",
                        padding: "6px 16px",
                        fontFamily: inter,
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <h2
            style={{
              fontFamily: sora,
              fontSize: "20px",
              fontWeight: 700,
              color: "#222c44",
            }}
          >
            Skill Progress
          </h2>

          <div
            className="rounded-[16px] bg-white p-5"
            style={{ boxShadow: "0 4px 14px rgba(15, 11, 56, 0.05)" }}
          >
            {skillsLoading ? (
              <div
                className="py-8 text-center"
                style={{ fontFamily: inter, color: "#9ea1c5" }}
              >
                Loading...
              </div>
            ) : skillProgress.length === 0 ? (
              <div
                className="py-8 text-center"
                style={{ fontFamily: inter, color: "#9ea1c5" }}
              >
                No skill data yet
              </div>
            ) : (
              <ul className="flex flex-col gap-1">
                {skillProgress.map((skill) => (
                  <li
                    key={skill.label}
                    className="flex items-center justify-between border-b py-3 last:border-b-0"
                    style={{ borderColor: "#ececf5" }}
                  >
                    <span
                      style={{
                        fontFamily: sora,
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#222c44",
                      }}
                    >
                      {skill.label}
                    </span>
                    <Gauge
                      value={skill.value}
                      color={skill.color}
                      trackColor={skill.trackColor}
                      size={130}
                      stroke={10}
                      format="percent"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Upgrade card */}
          {showUpgrade && (
            <div
              className="rounded-[16px] p-5"
              style={{ background: "#0f1230" }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <Zap size={18} style={{ color: "#f97316" }} />
              </div>
              <h3
                className="mt-3"
                style={{
                  fontFamily: sora,
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "white",
                }}
              >
                Upgrade to Pro
              </h3>
              <p
                className="mt-1.5"
                style={{
                  fontFamily: inter,
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                Unlock unlimited interviews and detailed AI feedback
              </p>
              <button
                type="button"
                onClick={() => router.push("/billing")}
                className="mt-4 w-full rounded-[12px] transition-opacity hover:opacity-90"
                style={{
                  background: "#f97316",
                  color: "white",
                  padding: "12px 20px",
                  fontFamily: inter,
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Start 7-Day Trial
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
