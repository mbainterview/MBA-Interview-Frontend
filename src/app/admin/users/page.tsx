"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { PageIntro } from "@/components/admin/page-intro";
import { AddUserDialog } from "@/components/admin/add-user-dialog";
import { SimpleStatCard } from "@/components/admin/simple-stat-card";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table";
import { PlanBadge } from "@/components/admin/plan-badge";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  useAdminUsers,
  useUpdateUserStatus,
  useAdminOverview,
} from "@/services/admin.service";
import type { AdminUser } from "@/types/domain";
import type { StatusType } from "@/components/admin/status-badge";

interface UserRow {
  id: string;
  name: string;
  email: string;
  plan: string;
  interviews: number;
  lastActive: string;
  status: StatusType;
}

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function mapUserToRow(user: AdminUser): UserRow {
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const status: StatusType =
    user.status === "active"
      ? "Active"
      : user.status === "suspended"
        ? "Suspended"
        : user.status === "pending"
          ? "Pending"
          : "Inactive";

  // The backend returns the resolved plan name in the list response.
  const rawUser = user as AdminUser & { planName?: string | null };

  return {
    id: user.id,
    name,
    email: user.email,
    plan: rawUser.planName ?? "Free",
    interviews: 0,
    lastActive: formatDate(user.createdAt),
    status,
  };
}

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<"active" | "suspended">("active");
  const [addOpen, setAddOpen] = useState(false);

  const { data: usersData, isLoading } = useAdminUsers({
    status: activeTab,
    limit: 20,
  });
  const { data: suspendedData } = useAdminUsers({
    status: "suspended",
    limit: 1,
  });
  const { data: overview } = useAdminOverview();
  const updateStatus = useUpdateUserStatus();

  const rows: UserRow[] = (usersData?.data ?? []).map(mapUserToRow);
  const suspendedCount = suspendedData?.meta?.total ?? 0;

  const handleSuspend = (id: string) => {
    updateStatus.mutate(
      { id, data: { status: "suspended" } },
      {
        onSuccess: () => toast.success("User suspended"),
        onError: () => toast.error("Failed to suspend user"),
      },
    );
  };

  const handleActivate = (id: string) => {
    updateStatus.mutate(
      { id, data: { status: "active" } },
      {
        onSuccess: () => toast.success("User activated"),
        onError: () => toast.error("Failed to activate user"),
      },
    );
  };

  const COLUMNS: AdminColumn<UserRow>[] = [
    {
      key: "user",
      header: "User",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-body text-[16px] text-[#272727]">
            {row.name}
          </span>
          <span className="font-body text-[14px] text-[#868686]">
            {row.email}
          </span>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      cell: (row) => <PlanBadge plan={row.plan} />,
    },
    {
      key: "interviews",
      header: "Interviews",
      cell: (row) => row.interviews,
    },
    {
      key: "lastActive",
      header: "Last Active",
      cell: (row) => row.lastActive,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
      className: "w-47.25",
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-47.25",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/users/${row.id}`}
            className="text-[#5450d8] transition-opacity hover:opacity-70"
            aria-label="View user"
          >
            <Icon icon="solar:eye-bold" width={20} height={20} />
          </Link>
          {activeTab === "active" ? (
            <button
              type="button"
              className="text-[#fc5a33] transition-opacity hover:opacity-70"
              aria-label="Suspend user"
              onClick={() => handleSuspend(row.id)}
              disabled={updateStatus.isPending}
            >
              <Icon icon="material-symbols:block" width={20} height={20} />
            </button>
          ) : (
            <button
              type="button"
              className="text-[#53b930] transition-opacity hover:opacity-70"
              aria-label="Activate user"
              onClick={() => handleActivate(row.id)}
              disabled={updateStatus.isPending}
            >
              <Icon
                icon="material-symbols:check-circle"
                width={20}
                height={20}
              />
            </button>
          )}
        </div>
      ),
    },
  ];

  const totalUsers = overview?.totalUsers?.toLocaleString() ?? "—";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageIntro
          title="Users"
          description={`${totalUsers} total registered users`}
        />
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-[16px] bg-[#5450d8] px-6 py-3 font-body text-[16px] font-medium text-white transition-opacity hover:opacity-90"
        >
          <Icon icon="material-symbols:add-rounded" width={20} height={20} />
          Add User
        </button>
      </div>

      <AddUserDialog open={addOpen} onOpenChange={setAddOpen} />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SimpleStatCard
          value={totalUsers}
          label="Total Users"
          icon="material-symbols:person-rounded"
          iconBgClass="bg-gradient-to-br from-[#4a46c3] to-[#5450d8]"
        />
        <SimpleStatCard
          value={overview?.activeUsers7d?.toLocaleString() ?? "0"}
          label="Active (7d)"
          icon="icon-park-solid:peoples"
          iconBgClass="bg-gradient-to-br from-[#48a927] to-[#53b930]"
        />
        <SimpleStatCard
          value={
            overview?.avgScore != null
              ? overview.avgScore.toFixed(1)
              : "0"
          }
          label="Avg Score"
          icon="solar:star-bold"
          iconBgClass="bg-gradient-to-br from-[#e5b900] to-[#f8cc16]"
        />
        <SimpleStatCard
          value={suspendedCount.toLocaleString()}
          label="Suspended"
          icon="material-symbols:block"
          iconBgClass="bg-gradient-to-br from-[#fc5a33] to-[#e0441e]"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <span className="font-body text-[16px] text-[#868686]">
            Loading users...
          </span>
        </div>
      ) : (
        <AdminTabs
          tabs={[
            {
              value: "active",
              label: "Active",
              content: (
                <AdminTable
                  columns={COLUMNS}
                  data={activeTab === "active" ? rows : []}
                  rowKey={(r) => r.id}
                />
              ),
            },
            {
              value: "suspended",
              label: "Suspended",
              content: (
                <AdminTable
                  columns={COLUMNS}
                  data={activeTab === "suspended" ? rows : []}
                  rowKey={(r) => r.id}
                />
              ),
            },
          ]}
          onValueChange={(value) =>
            setActiveTab(value as "active" | "suspended")
          }
        />
      )}
    </div>
  );
}
