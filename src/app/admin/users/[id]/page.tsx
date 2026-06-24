"use client";

import { use } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { PageIntro } from "@/components/admin/page-intro";
import { WidgetCard } from "@/components/admin/widget-card";
import { StatusList } from "@/components/admin/status-list";
import { PlanBadge } from "@/components/admin/plan-badge";
import { StatusBadge } from "@/components/admin/status-badge";
import { useAdminUser } from "@/services/admin.service";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = use(params);
  const { data: user, isLoading } = useAdminUser(id);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <Link
          href="/admin/users"
          className="inline-flex w-fit items-center gap-2 font-body text-[14px] text-[#868686] transition-colors hover:text-primary"
        >
          <Icon icon="mdi:arrow-left" width={18} height={18} />
          Back to users
        </Link>
        <p className="font-body text-[14px] text-[#868686]">Loading user...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-8">
        <Link
          href="/admin/users"
          className="inline-flex w-fit items-center gap-2 font-body text-[14px] text-[#868686] transition-colors hover:text-primary"
        >
          <Icon icon="mdi:arrow-left" width={18} height={18} />
          Back to users
        </Link>
        <p className="font-body text-[14px] text-[#868686]">User not found.</p>
      </div>
    );
  }

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown User";
  const planName = user.subscription?.plan?.name ?? "Free";
  const statusLabel = user.status ?? "active";

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/admin/users"
        className="inline-flex w-fit items-center gap-2 font-body text-[14px] text-[#868686] transition-colors hover:text-primary"
      >
        <Icon icon="mdi:arrow-left" width={18} height={18} />
        Back to users
      </Link>

      <PageIntro title={displayName} description={user.email} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[420px_minmax(0,1fr)]">
        {/* Profile card */}
        <WidgetCard title="Profile">
          <div className="flex flex-col items-center gap-4 pb-4">
            <div className="grid size-24 place-items-center rounded-full bg-linear-to-br from-[#5450d8] to-[#7a76e3] font-heading text-[36px] font-semibold text-white">
              {displayName[0]}
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="font-heading text-[20px] font-semibold text-[#272727]">
                {displayName}
              </p>
              <p className="font-body text-[14px] text-[#868686]">
                {user.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PlanBadge plan={planName} />
              <StatusBadge status={statusLabel as any} />
            </div>
          </div>
        </WidgetCard>

        {/* Stats */}
        <WidgetCard title="Activity">
          <StatusList
            items={[
              {
                label: "Role",
                value: user.role,
              },
              {
                label: "Email verified",
                value: user.isEmailVerified ? "Yes" : "No",
              },
              { label: "Plan", value: planName },
              { label: "Status", value: statusLabel },
              {
                label: "Joined",
                value: new Date(user.createdAt).toLocaleDateString(),
              },
            ]}
          />
        </WidgetCard>
      </div>
    </div>
  );
}
