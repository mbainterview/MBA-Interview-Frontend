"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Loader2 } from "lucide-react";
import { PageIntro } from "@/components/admin/page-intro";
import { StatCard } from "@/components/admin/stat-card";
import { WidgetCard } from "@/components/admin/widget-card";
import { GrowthChart } from "@/components/admin/growth-chart";
import { SchoolsBarChart } from "@/components/admin/schools-bar-chart";
import {
  useAdminOverview,
  useAdminRevenue,
  useAdminEngagement,
  useAdminUsageAnalytics,
} from "@/services/admin.service";

const PLAN_COLORS: Record<string, string> = {
  Free: "#53b930",
  Pro: "#5450d8",
  Enterprise: "#f8cc16",
};

const DEFAULT_COLOR = "#8884d8";

export default function AnalyticsPage() {
  const { data: overview, isLoading: overviewLoading } = useAdminOverview();
  const { data: revenue, isLoading: revenueLoading } = useAdminRevenue();
  const { data: engagement, isLoading: engagementLoading } =
    useAdminEngagement();
  const { data: usage, isLoading: usageLoading } = useAdminUsageAnalytics();

  const isLoading =
    overviewLoading || revenueLoading || engagementLoading || usageLoading;

  const planDistribution = revenue?.planDistribution
    ? revenue.planDistribution.map((p) => ({
        name: p.name,
        value: p.count,
        color: PLAN_COLORS[p.name] ?? DEFAULT_COLOR,
      }))
    : [];

  const growthData = usage?.dailySessions30d ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <PageIntro
          title="Analytics"
          description="Platform-wide performance and usage metrics"
        />
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="text-primary h-10 w-10 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        title="Analytics"
        description="Platform-wide performance and usage metrics"
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          gradient="green"
          value={overview?.totalUsers?.toLocaleString() ?? "—"}
          label="Total Users"
          icon="material-symbols:person-rounded"
        />
        <StatCard
          gradient="yellow"
          value={overview?.totalSessions?.toLocaleString() ?? "—"}
          label="Interviews"
          icon="tabler:message-filled"
          badgeBgClass="bg-white/30"
        />
        <StatCard
          gradient="purple"
          value={
            revenue
              ? `$ ${((revenue.mrrCents ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : "—"
          }
          label="Revenue"
          icon="solar:card-bold"
        />
        <StatCard
          gradient="red"
          value={
            engagement
              ? `${(engagement.completionRate * 100).toFixed(1)}%`
              : "—"
          }
          label="Success Rate"
          icon="majesticons:analytics"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_460px]">
        <WidgetCard
          title="Interview & User Growth"
          icon="mingcute:mic-fill"
        >
          <GrowthChart data={growthData} />
        </WidgetCard>

        <WidgetCard title="Plan Distribution" icon="solar:card-bold">
          <div className="h-105 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={130}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {planDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#5450d8",
                    border: "none",
                    borderRadius: 8,
                    color: "white",
                    fontFamily: "Inter",
                  }}
                  itemStyle={{ color: "white" }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontFamily: "Inter", fontSize: 14 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </WidgetCard>
      </div>

      <WidgetCard
        title="Interviews by School"
        icon="material-symbols:school-rounded"
      >
        <SchoolsBarChart />
      </WidgetCard>
    </div>
  );
}
