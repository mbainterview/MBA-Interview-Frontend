"use client";

import { useState } from "react";
import { Video, Trophy, Award, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Gauge } from "@/components/shared/gauge";
import { RadarChart } from "@/components/shared/radar-chart";
import {
  useAnalyticsOverview,
  useAnalyticsTrends,
  useSkillBreakdown,
} from "@/services/analytics.service";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Types                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

interface StatCard {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
}

interface SkillGauge {
  label: string;
  value: number;
  color: string;
  trackColor: string;
}

type Period = "7d" | "30d" | "90d";

const SKILL_COLORS = ["#eab308", "#22c55e", "#f97316", "#5450d8"];
const SKILL_TRACK_COLORS = ["#fef3c7", "#dcfce7", "#ffe9da", "#edecfd"];

/* ────────────────────────────────────────────────────────────────────────── */
/*  Page                                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");

  const { data: overview, isLoading: overviewLoading } =
    useAnalyticsOverview();
  const { data: trends, isLoading: trendsLoading } =
    useAnalyticsTrends(period);
  const { data: skills, isLoading: skillsLoading } = useSkillBreakdown();

  // Stat cards
  const stats: StatCard[] = overview
    ? [
        {
          label: "Total Sessions",
          value: String(overview.totalSessions),
          icon: Video,
          iconBg: "#22c55e",
        },
        {
          label: "Avg. Score",
          value: `${Math.round(overview.averageScore)}%`,
          icon: Trophy,
          iconBg: "#f97316",
        },
        {
          label: "Completed",
          value: String(overview.completedSessions),
          icon: Award,
          iconBg: "#22c55e",
        },
        {
          label: "Completion Rate",
          value: `${Math.round(overview.completionRate)}%`,
          icon: TrendingUp,
          iconBg: "#eab308",
        },
      ]
    : [];

  // Trends chart data
  const progressPoints = (trends ?? []).map((t) => ({
    date: new Date(t.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: Math.round(t.value),
  }));

  // Skill gauges
  const skillGauges: SkillGauge[] = (skills ?? []).map((s, i) => ({
    label: s.criterionName,
    value: Math.round(s.averageScore * 10),
    color: SKILL_COLORS[i % SKILL_COLORS.length],
    trackColor: SKILL_TRACK_COLORS[i % SKILL_TRACK_COLORS.length],
  }));

  // Radar axes
  const radarAxes = (skills ?? []).map((s) => ({
    label: s.criterionName,
    value: s.averageScore / 10, // normalize to 0-1
  }));

  // School bars — derive from skills sample counts as a proxy; keep the chart visible
  const schoolBars = (skills ?? []).slice(0, 5).map((s) => ({
    name: s.criterionName.length > 10
      ? s.criterionName.slice(0, 10)
      : s.criterionName,
    value: s.sampleCount,
  }));

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
        Performance Analytics
      </h1>
      <p
        className="mt-1"
        style={{ fontFamily: inter, fontSize: "14px", color: "#9ea1c5" }}
      >
        Track your improvement over time
      </p>

      {/* Stat row */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewLoading ? (
          <div
            className="col-span-full py-8 text-center"
            style={{ fontFamily: inter, color: "#9ea1c5" }}
          >
            Loading...
          </div>
        ) : (
          stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ background: stat.iconBg }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span
                      style={{
                        fontFamily: inter,
                        fontSize: "13px",
                        color: "#9ea1c5",
                      }}
                    >
                      {stat.label}
                    </span>
                    <span
                      style={{
                        fontFamily: sora,
                        fontSize: "22px",
                        fontWeight: 700,
                        color: "#222c44",
                      }}
                    >
                      {stat.value}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Row 2 — progress + bars */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Progress Over Time</CardTitle>
            <div className="flex gap-1">
              {(["7d", "30d", "90d"] as Period[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className="rounded-[8px] px-3 py-1 transition-colors"
                  style={{
                    background: period === p ? "#edecfd" : "transparent",
                    color: period === p ? "#5450d8" : "#9ea1c5",
                    fontFamily: inter,
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            {trendsLoading ? (
              <div
                className="py-12 text-center"
                style={{ fontFamily: inter, color: "#9ea1c5" }}
              >
                Loading...
              </div>
            ) : progressPoints.length === 0 ? (
              <div
                className="py-12 text-center"
                style={{ fontFamily: inter, color: "#9ea1c5" }}
              >
                No trend data yet
              </div>
            ) : (
              <AreaChart points={progressPoints} />
            )}
          </div>
        </Card>

        <Card>
          <CardTitle>Top 5 Business School</CardTitle>
          <div className="mt-4">
            {skillsLoading ? (
              <div
                className="py-12 text-center"
                style={{ fontFamily: inter, color: "#9ea1c5" }}
              >
                Loading...
              </div>
            ) : schoolBars.length === 0 ? (
              <div
                className="py-12 text-center"
                style={{ fontFamily: inter, color: "#9ea1c5" }}
              >
                No data yet
              </div>
            ) : (
              <BarChart bars={schoolBars} />
            )}
          </div>
        </Card>
      </div>

      {/* Row 3 — skill gauges + radar */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Skill Improvement</CardTitle>
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8">
            {skillsLoading ? (
              <div
                className="col-span-2 py-8 text-center"
                style={{ fontFamily: inter, color: "#9ea1c5" }}
              >
                Loading...
              </div>
            ) : skillGauges.length === 0 ? (
              <div
                className="col-span-2 py-8 text-center"
                style={{ fontFamily: inter, color: "#9ea1c5" }}
              >
                No skill data yet
              </div>
            ) : (
              skillGauges.map((gauge) => (
                <div
                  key={gauge.label}
                  className="flex flex-col items-center"
                >
                  <Gauge
                    value={gauge.value}
                    color={gauge.color}
                    trackColor={gauge.trackColor}
                    size={150}
                    stroke={11}
                    format="percent"
                  />
                  <span
                    className="mt-2"
                    style={{
                      fontFamily: inter,
                      fontSize: "13px",
                      color: "#5b5b6b",
                    }}
                  >
                    {gauge.label}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardTitle>Skills Radar</CardTitle>
          <div className="mt-2 flex justify-center">
            {skillsLoading ? (
              <div
                className="py-12 text-center"
                style={{ fontFamily: inter, color: "#9ea1c5" }}
              >
                Loading...
              </div>
            ) : radarAxes.length === 0 ? (
              <div
                className="py-12 text-center"
                style={{ fontFamily: inter, color: "#9ea1c5" }}
              >
                No skill data yet
              </div>
            ) : (
              <RadarChart axes={radarAxes} size={300} />
            )}
          </div>
        </Card>
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

/* ────────────────────────────────────────────────────────────────────────── */
/*  Area chart — Progress Over Time                                           */
/* ────────────────────────────────────────────────────────────────────────── */

function AreaChart({ points }: { points: { date: string; value: number }[] }) {
  const width = 540;
  const height = 220;
  const padLeft = 36;
  const padRight = 12;
  const padTop = 12;
  const padBottom = 32;

  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const yMax = Math.max(80, ...points.map((p) => p.value));
  const yStep = Math.ceil(yMax / 4);
  const yTicks = Array.from({ length: 5 }, (_, i) => i * yStep);

  const xFor = (i: number) =>
    padLeft + (i / (points.length - 1)) * innerW;
  const yFor = (v: number) => padTop + innerH - (v / yMax) * innerH;

  // Smoothed line is overkill; straight segments match the Figma frame
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.value)}`)
    .join(" ");

  const areaPath =
    `M ${xFor(0)} ${yFor(0)} ` +
    points.map((p, i) => `L ${xFor(i)} ${yFor(p.value)}`).join(" ") +
    ` L ${xFor(points.length - 1)} ${yFor(0)} Z`;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Y-axis grid */}
      {yTicks.map((tick) => {
        const y = yFor(tick);
        return (
          <g key={tick}>
            <line
              x1={padLeft}
              y1={y}
              x2={width - padRight}
              y2={y}
              stroke="#ececf5"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <text
              x={padLeft - 8}
              y={y + 4}
              textAnchor="end"
              style={{
                fontFamily: inter,
                fontSize: "10px",
                fill: "#9ea1c5",
              }}
            >
              {tick}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaPath} fill="rgba(34, 197, 94, 0.18)" />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="#22c55e"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* X-axis labels */}
      {points.map((p, i) => (
        <text
          key={p.date + i}
          x={xFor(i)}
          y={height - 10}
          textAnchor="middle"
          style={{
            fontFamily: inter,
            fontSize: "10px",
            fill: "#9ea1c5",
          }}
        >
          {p.date}
        </text>
      ))}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Bar chart — Top 5 Business Schools                                        */
/* ────────────────────────────────────────────────────────────────────────── */

function BarChart({ bars }: { bars: { name: string; value: number }[] }) {
  const width = 540;
  const height = 220;
  const padLeft = 44;
  const padRight = 12;
  const padTop = 12;
  const padBottom = 32;

  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const yMax = Math.max(1000, ...bars.map((b) => b.value));
  const yStep = Math.ceil(yMax / 5);
  const yTicks = Array.from({ length: 6 }, (_, i) => i * yStep);

  const slotWidth = innerW / bars.length;
  const barWidth = slotWidth * 0.42;

  const yFor = (v: number) => padTop + innerH - (v / yMax) * innerH;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Y-axis grid */}
      {yTicks.map((tick) => {
        const y = yFor(tick);
        return (
          <g key={tick}>
            <line
              x1={padLeft}
              y1={y}
              x2={width - padRight}
              y2={y}
              stroke="#ececf5"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <text
              x={padLeft - 8}
              y={y + 4}
              textAnchor="end"
              style={{
                fontFamily: inter,
                fontSize: "10px",
                fill: "#9ea1c5",
              }}
            >
              {tick}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {bars.map((bar, i) => {
        const x = padLeft + slotWidth * i + (slotWidth - barWidth) / 2;
        const y = yFor(bar.value);
        const h = padTop + innerH - y;
        return (
          <g key={bar.name + i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={h}
              rx={4}
              fill="#3b3aff"
            />
            <text
              x={x + barWidth / 2}
              y={height - 10}
              textAnchor="middle"
              style={{
                fontFamily: inter,
                fontSize: "10px",
                fill: "#5b5b6b",
              }}
            >
              {bar.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
