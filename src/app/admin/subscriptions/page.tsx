"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { StatCard } from "@/components/admin/stat-card";
import { WidgetCard } from "@/components/admin/widget-card";
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table";
import { PlanBadge, type PlanType } from "@/components/admin/plan-badge";
import { StatusBadge } from "@/components/admin/status-badge";
import { PlanDialog } from "@/components/admin/plan-dialog";
import { CardGridSkeleton, TableSkeleton } from "@/components/shared/loading-skeleton";
import {
  useAdminPlans,
  useAdminSubscriptions,
  useAdminSubscriptionStats,
  useAdminRevenue,
  useDeletePlan,
} from "@/services/admin.service";
import type { SubscriptionPlan } from "@/types/domain";

/* ── helpers ──────────────────────────────────────────────────────────────── */
function formatCurrency(cents: number) {
  return `$ ${(cents / 100).toFixed(2)}`;
}

function intervalLabel(intervalMonths: number): string {
  if (intervalMonths <= 0) return "free";
  if (intervalMonths === 1) return "month";
  if (intervalMonths === 12) return "year";
  return `${intervalMonths} months`;
}

/* ── subscription row type (from admin API) ──────────────────────────────── */
interface SubscriptionRow {
  id: string;
  user?: { fullName?: string; email?: string };
  userName?: string;
  userEmail?: string;
  plan: { name: string; priceInCents: number };
  status: string;
  currentPeriodStart?: string | null;
  createdAt?: string;
}

/* ── table columns ────────────────────────────────────────────────────────── */
const COLUMNS: AdminColumn<SubscriptionRow>[] = [
  {
    key: "user",
    header: "User",
    cell: (r) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-body text-[16px] text-[#272727]">
          {r.user?.fullName ?? r.userName ?? "—"}
        </span>
        <span className="font-body text-[14px] text-[#868686]">
          {r.user?.email ?? r.userEmail ?? "—"}
        </span>
      </div>
    ),
  },
  {
    key: "plan",
    header: "Plan",
    cell: (r) => <PlanBadge plan={r.plan?.name as PlanType} />,
  },
  {
    key: "amount",
    header: "Amount",
    cell: (r) => (
      <span className="font-heading text-[16px] font-semibold text-[#272727]">
        {formatCurrency(r.plan?.priceInCents ?? 0)}
      </span>
    ),
  },
  {
    key: "date",
    header: "Date",
    cell: (r) => {
      const date = r.currentPeriodStart ?? r.createdAt;
      if (!date) return "—";
      return new Date(date).toLocaleDateString();
    },
  },
  {
    key: "status",
    header: "Status",
    cell: (r) => {
      const label =
        r.status === "active"
          ? "Completed"
          : r.status === "past_due"
            ? "Failed"
            : r.status === "canceled" || r.status === "expired"
              ? "Failed"
              : "Pending";
      return <StatusBadge status={label} />;
    },
  },
];

export default function SubscriptionsPage() {
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useAdminSubscriptionStats();

  const {
    data: revenue,
    isLoading: revenueLoading,
    isError: revenueError,
  } = useAdminRevenue();

  const {
    data: plans,
    isLoading: plansLoading,
    isError: plansError,
  } = useAdminPlans();

  const {
    data: subscriptions,
    isLoading: subsLoading,
    isError: subsError,
  } = useAdminSubscriptions({ limit: 10 });

  const deletePlan = useDeletePlan();

  useEffect(() => {
    if (statsError) toast.error("Failed to load subscription stats");
  }, [statsError]);
  useEffect(() => {
    if (revenueError) toast.error("Failed to load revenue data");
  }, [revenueError]);
  useEffect(() => {
    if (plansError) toast.error("Failed to load plans");
  }, [plansError]);
  useEffect(() => {
    if (subsError) toast.error("Failed to load recent transactions");
  }, [subsError]);

  /* ── derived values ───────────────────────────────────────────────────── */
  const mrr = stats?.totalMrrCents ?? 0;
  const mrrDisplay = formatCurrency(mrr);

  const activeSubscribers = revenue?.paidSubscribers ?? 0;
  const avgRevPerUser =
    activeSubscribers > 0
      ? `$ ${(mrr / 100 / activeSubscribers).toFixed(2)}`
      : "$ 0.00";

  const totalByStatus = stats?.byStatus ?? {};
  const totalActive = totalByStatus["active"] ?? 0;
  const totalCanceled = totalByStatus["canceled"] ?? 0;
  const churnRate =
    totalActive + totalCanceled > 0
      ? `${((totalCanceled / (totalActive + totalCanceled)) * 100).toFixed(1)}%`
      : "0%";

  const isCardsLoading = statsLoading || revenueLoading;

  const subRows: SubscriptionRow[] = Array.isArray(subscriptions)
    ? subscriptions
    : subscriptions?.data ?? [];

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setDialogMode("edit");
  };

  const handleDelete = (plan: SubscriptionPlan) => {
    if (plan.isDefault) {
      toast.error("Cannot delete the default plan.");
      return;
    }
    const confirmed = window.confirm(
      `Deactivate plan "${plan.name}"? It will stop appearing on pricing surfaces.`,
    );
    if (!confirmed) return;
    deletePlan.mutate(plan.id, {
      onSuccess: () => toast.success(`Plan "${plan.name}" deactivated`),
      onError: (err: unknown) =>
        toast.error(err instanceof Error ? err.message : "Failed to delete plan"),
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* ── Figma 811:7688 — page header with Add Plan + Create Coupon ───── */}
      <header className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-2">
          <h1
            className="leading-[1.3]"
            style={{
              fontFamily: "var(--font-sora), sans-serif",
              fontSize: 24,
              fontWeight: 600,
              color: "#222c44",
            }}
          >
            Subscriptions &amp; Payments
          </h1>
          <p
            className="leading-[1.4]"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 16,
              color: "#808080",
            }}
          >
            Revenue, transactions, and plan management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => toast.info("Coupon management coming soon")}
            className="inline-flex items-center gap-2 capitalize transition hover:bg-[#f5f5fb]"
            style={{
              height: 64,
              borderRadius: 16,
              border: "1px solid #5450d8",
              padding: "16px 32px",
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 18,
              fontWeight: 500,
              color: "#5450d8",
              lineHeight: "28px",
            }}
          >
            <Icon icon="mingcute:coupon-fill" width={24} height={24} />
            Create Coupon
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingPlan(null);
              setDialogMode("create");
            }}
            className="inline-flex items-center gap-2 capitalize text-white transition"
            style={{
              height: 64,
              borderRadius: 16,
              background: "#5450d8",
              padding: "16px 32px",
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 18,
              fontWeight: 500,
              lineHeight: "28px",
            }}
          >
            <Icon icon="material-symbols:add-rounded" width={24} height={24} />
            Add Plan
          </button>
        </div>
      </header>

      {/* Top stats — gradient cards from dashboard */}
      {isCardsLoading ? (
        <CardGridSkeleton count={4} className="xl:grid-cols-4" />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            gradient="purple"
            value={mrrDisplay}
            label="Monthly Revenue"
            icon="solar:card-bold"
          />
          <StatCard
            gradient="green"
            value={activeSubscribers.toLocaleString()}
            label="Active Subscribers"
            icon="material-symbols:person-rounded"
          />
          <StatCard
            gradient="yellow"
            value={avgRevPerUser}
            label="Avg Revenue / User"
            icon="majesticons:analytics"
            badgeBgClass="bg-white/30"
          />
          <StatCard
            gradient="red"
            value={churnRate}
            label="Churn Rate"
            icon="material-symbols:trending-down-rounded"
          />
        </div>
      )}

      {/* Plan cards — dynamic, admin-editable */}
      {plansLoading ? (
        <CardGridSkeleton count={3} />
      ) : (plans ?? []).length === 0 ? (
        <WidgetCard title="Plans" icon="solar:card-bold">
          <div className="py-10 text-center font-body text-[#808080]">
            No plans yet. Click <strong>+ Add Plan</strong> above to create one.
          </div>
        </WidgetCard>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {(plans ?? []).map((plan: SubscriptionPlan) => {
            const userCount =
              stats?.byPlan?.[plan.slug] ?? stats?.byPlan?.[plan.name] ?? 0;
            const bullets = plan.displayFeatures?.length
              ? plan.displayFeatures
              : [
                  `${plan.features?.maxSessionsPerDay ?? 0} sessions / day`,
                  plan.features?.videoEssayAccess
                    ? "Video essay access"
                    : "",
                  plan.features?.pdfReportAccess ? "PDF report access" : "",
                ].filter(Boolean);

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col gap-6 overflow-hidden rounded-[20px] bg-white p-6 ${
                  plan.isFeatured ? "ring-2 ring-primary" : ""
                }`}
              >
                {plan.isFeatured && (
                  <span className="absolute right-4 top-4 rounded-full bg-[#5450d8] px-3 py-1 text-[11px] font-semibold uppercase text-white">
                    Most Popular
                  </span>
                )}
                {plan.isDefault && (
                  <span className="absolute left-4 top-4 rounded-full bg-[#48a927] px-3 py-1 text-[11px] font-semibold uppercase text-white">
                    Default
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-[#4a46c3] to-[#5450d8]">
                    <Icon
                      icon="solar:card-bold"
                      width={28}
                      height={28}
                      className="text-white"
                    />
                  </div>
                  <div>
                    <p className="font-heading text-[24px] font-bold text-[#272727]">
                      {plan.name}
                    </p>
                    <p className="font-body text-[14px] text-[#868686]">
                      {userCount.toLocaleString()} users
                    </p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-[40px] font-bold text-[#272727]">
                    {plan.priceInCents === 0
                      ? "$0"
                      : `$${(plan.priceInCents / 100).toFixed(2)}`}
                  </span>
                  <span className="font-body text-[16px] text-[#868686]">
                    /{intervalLabel(plan.intervalMonths)}
                  </span>
                </div>
                {bullets.length > 0 && (
                  <ul className="flex flex-col gap-3">
                    {bullets.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 font-body text-[14px] text-[#272727]"
                      >
                        <Icon
                          icon="lets-icons:check-fill"
                          width={18}
                          height={18}
                          className="shrink-0 text-[#53b930]"
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto flex items-center gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => handleEdit(plan)}
                    className="flex-1 rounded-[10px] border border-[#5450d8] py-2 text-[13px] font-semibold text-[#5450d8] transition hover:bg-[#f5f5fb]"
                  >
                    Edit Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(plan)}
                    disabled={plan.isDefault || deletePlan.isPending}
                    className="rounded-[10px] border border-[#ef4444] px-3 py-2 text-[13px] font-semibold text-[#ef4444] transition hover:bg-[#fef2f2] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Delete plan ${plan.name}`}
                  >
                    <Icon icon="mingcute:delete-2-line" width={16} height={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <WidgetCard title="Recent Transactions" icon="solar:card-bold">
        {subsLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : (
          <AdminTable
            columns={COLUMNS}
            data={subRows}
            rowKey={(r) => r.id}
            className="rounded-none border-0"
          />
        )}
      </WidgetCard>

      <PlanDialog
        mode={dialogMode ?? "create"}
        plan={editingPlan}
        open={dialogMode !== null}
        onOpenChange={(next) => {
          if (!next) {
            setDialogMode(null);
            setEditingPlan(null);
          }
        }}
      />
    </div>
  );
}
