"use client";

import { StatCard } from "@/components/admin/stat-card";
import { WidgetCard } from "@/components/admin/widget-card";
import { StatusList } from "@/components/admin/status-list";
import { AlertBox } from "@/components/admin/alert-box";
import { ActivityRow, type ActivityItem } from "@/components/admin/activity-row";
import { GrowthChart } from "@/components/admin/growth-chart";
import { SchoolsBarChart } from "@/components/admin/schools-bar-chart";
import {
  useAdminOverview,
  useAdminRevenue,
  useAdminEngagement,
  useAdminUsageAnalytics,
  useAdminUsers,
} from "@/services/admin.service";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatNumber(n: number | undefined): string {
  if (n === undefined) return "—";
  return n.toLocaleString();
}

function formatCurrency(n: number | undefined): string {
  if (n === undefined) return "—";
  return `$ ${n.toLocaleString()}`;
}

export default function AdminDashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useAdminOverview();
  const { data: revenue, isLoading: revenueLoading } = useAdminRevenue();
  const { data: engagement, isLoading: engagementLoading } = useAdminEngagement();
  const { data: usage, isLoading: usageLoading } = useAdminUsageAnalytics();
  const { data: recentUsers } = useAdminUsers({ limit: 5 });

  const isLoading = overviewLoading || revenueLoading || engagementLoading || usageLoading;

  const SYSTEM_STATUS = [
    { label: "AI Status", value: "Active", valueClassName: "text-[#53b930]" },
    { label: "Total Sessions", value: isLoading ? "..." : formatNumber(overview?.totalSessions) },
    { label: "Avg Score", value: isLoading ? "..." : `${overview?.avgScore?.toFixed(1) ?? "—"}%` },
    { label: "Completion Rate", value: isLoading ? "..." : `${((engagement?.completionRate ?? 0) * 100).toFixed(0)}%` },
    { label: "OpenAI API Health", value: "Operational", valueClassName: "text-[#53b930]" },
  ];

  const recentActivity: ActivityItem[] = (recentUsers?.data ?? []).map((u) => ({
    title: "User registered",
    detail: u.email,
    time: timeAgo(u.createdAt),
    icon: "material-symbols:person-rounded",
    iconBgClass: "bg-gradient-to-br from-[#5450d8] to-[#4a46c3]",
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Page intro */}
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-[24px] font-semibold leading-[1.3] text-[#222c44]">
          Dashboard
        </h2>
        <p className="font-body text-[16px] leading-[1.4] text-[#808080]">
          Platform overview — AI systems operating normally
        </p>
      </div>

      {/* Stat cards — 3x2 grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          gradient="green"
          value={isLoading ? "..." : formatNumber(overview?.totalUsers)}
          label="Total Users"
          icon="material-symbols:person-rounded"
        />
        <StatCard
          gradient="yellow"
          value={isLoading ? "..." : formatNumber(overview?.totalSessions)}
          label="Interviews Generated"
          icon="tabler:message-filled"
          badgeBgClass="bg-white/30"
        />
        <StatCard
          gradient="red"
          value={isLoading ? "..." : formatNumber(overview?.activeUsers7d)}
          label="Active Users (7d)"
          icon="tabler:video-filled"
        />
        <StatCard
          gradient="purple"
          value={isLoading ? "..." : formatNumber(revenue?.paidSubscribers)}
          label="Active Subscriptions"
          icon="solar:card-bold"
        />
        <StatCard
          gradient="purple"
          value={isLoading ? "..." : formatCurrency(revenue?.mrrCents != null ? revenue.mrrCents / 100 : undefined)}
          label="Monthly Revenue"
          icon="majesticons:analytics"
        />
        <StatCard
          gradient="purple"
          value={isLoading ? "..." : formatCurrency(usage?.estimatedCost)}
          label="AI Cost (Month)"
          icon="fluent:brain-32-filled"
        />
      </div>

      {/* Lower grid: 2 columns (left narrow, right wide) */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[639px_minmax(0,1fr)]">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          <WidgetCard
            title="AI System Status"
            icon="fluent:brain-32-filled"
            iconColor="text-primary"
          >
            <div className="flex flex-col gap-8">
              <AlertBox
                variant="warning"
                title="Fully Automated"
                description="AI interview generation and evaluation is fully automated. No manual review required."
              />
              <StatusList items={SYSTEM_STATUS} />
              <AlertBox
                variant="success"
                title="All systems operational"
                compact
              />
            </div>
          </WidgetCard>

          <WidgetCard title="Recent Activity">
            <div className="flex flex-col">
              {recentActivity.length > 0 ? (
                recentActivity.map((item, i) => (
                  <ActivityRow
                    key={`${item.detail}-${i}`}
                    {...item}
                    isLast={i === recentActivity.length - 1}
                  />
                ))
              ) : (
                <p className="py-4 text-center font-body text-[14px] text-[#868686]">
                  No recent activity
                </p>
              )}
            </div>
          </WidgetCard>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          <WidgetCard
            title="Interview & User Growth"
            icon="mingcute:mic-fill"
            iconColor="text-primary"
            headerActions={
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-[#5450d8]" />
                  <span className="font-body text-[16px] text-[#868686]">
                    Interviews
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-[#53b930]" />
                  <span className="font-body text-[16px] text-[#868686]">
                    New Users
                  </span>
                </div>
              </div>
            }
          >
            <GrowthChart data={usage?.dailySessions30d} />
          </WidgetCard>

          <WidgetCard
            title="Interviews by School"
            icon="material-symbols:school-rounded"
            iconColor="text-primary"
          >
            <SchoolsBarChart />
          </WidgetCard>
        </div>
      </div>
    </div>
  );
}
