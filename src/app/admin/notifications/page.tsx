"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageIntro } from "@/components/admin/page-intro";
import { WidgetCard } from "@/components/admin/widget-card";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { NotificationTemplateDialog } from "@/components/admin/notification-template-dialog";
import {
  useAdminNotificationTemplates,
  useDeleteAdminNotificationTemplate,
  useUpdateAdminNotificationTemplate,
} from "@/services/admin.service";
import {
  TRIGGER_EVENTS,
  TRIGGER_EVENT_LABELS,
  type NotificationTemplate,
  type NotificationTemplateFilterParams,
  type TriggerEvent,
} from "@/types/domain";

const PAGE_LIMIT = 20;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminNotificationsPage() {
  const [page, setPage] = useState(1);
  const [triggerFilter, setTriggerFilter] = useState<TriggerEvent | "">("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<NotificationTemplate | null>(null);

  const filter: NotificationTemplateFilterParams = {
    page,
    limit: PAGE_LIMIT,
    triggerEvent: triggerFilter || undefined,
    isActive: activeFilter === "" ? undefined : activeFilter === "true",
    search: search.trim() || undefined,
    sort: "updated_at",
    order: "DESC",
  };

  const { data, isLoading, isFetching } = useAdminNotificationTemplates(filter);
  const updateMutation = useUpdateAdminNotificationTemplate();
  const deleteMutation = useDeleteAdminNotificationTemplate();

  // Response shape is `PaginatedResponse<NotificationTemplate>`:
  //   { data: NotificationTemplate[], meta: { total, page, limit, total_pages, has_more } }
  // (the axios interceptor unwraps the backend's { success, data, meta } envelope).
  const templates = data?.data ?? [];
  const totalPages = Math.max(1, data?.meta?.total_pages ?? 1);

  const openCreate = () => {
    setDialogMode("create");
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (tpl: NotificationTemplate) => {
    setDialogMode("edit");
    setEditing(tpl);
    setDialogOpen(true);
  };

  const toggleActive = (tpl: NotificationTemplate) => {
    updateMutation.mutate(
      { id: tpl.id, data: { isActive: !tpl.isActive } },
      {
        onSuccess: () =>
          toast.success(
            `"${tpl.name}" ${tpl.isActive ? "deactivated" : "activated"}`,
          ),
        onError: (err: unknown) =>
          toast.error(
            err instanceof Error ? err.message : "Failed to update template",
          ),
      },
    );
  };

  const handleDelete = (tpl: NotificationTemplate) => {
    const confirmed = window.confirm(
      `Delete template "${tpl.name}"?\n\nThis cannot be undone. Any dispatch for its trigger (${TRIGGER_EVENT_LABELS[tpl.triggerEvent]}) will fall back to the hardcoded renderer.`,
    );
    if (!confirmed) return;

    deleteMutation.mutate(tpl.id, {
      onSuccess: () => toast.success(`Template "${tpl.name}" deleted`),
      onError: (err: unknown) =>
        toast.error(err instanceof Error ? err.message : "Failed to delete template"),
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageIntro
          title="Notification Templates"
          description="Manage email and push notification campaigns"
        />
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-12 items-center gap-2 rounded-[16px] bg-[#5450d8] px-6 font-heading text-[16px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Icon icon="material-symbols:add-rounded" width={20} height={20} />
          Add Template
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 rounded-[16px] bg-white p-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="relative">
          <Icon
            icon="mdi:magnify"
            width={20}
            height={20}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#868686]"
          />
          <input
            type="text"
            placeholder="Search by name, key, or subject…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-11 w-full rounded-[12px] border border-[#e6e6e6] bg-white pl-10 pr-3 font-body text-[15px] text-[#272727] outline-none placeholder:text-[#868686] focus:border-[#5450d8]"
          />
        </div>
        <select
          value={triggerFilter}
          onChange={(e) => {
            setTriggerFilter(e.target.value as TriggerEvent | "");
            setPage(1);
          }}
          className="h-11 w-full rounded-[12px] border border-[#e6e6e6] bg-white px-3 font-body text-[15px] text-[#272727] outline-none focus:border-[#5450d8]"
        >
          <option value="">All triggers</option>
          {TRIGGER_EVENTS.map((t) => (
            <option key={t} value={t}>
              {TRIGGER_EVENT_LABELS[t]}
            </option>
          ))}
        </select>
        <select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value as "" | "true" | "false");
            setPage(1);
          }}
          className="h-11 w-full rounded-[12px] border border-[#e6e6e6] bg-white px-3 font-body text-[15px] text-[#272727] outline-none focus:border-[#5450d8]"
        >
          <option value="">Active &amp; inactive</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
        </select>
      </div>

      {/* Table */}
      <WidgetCard title="All Templates">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Icon
              icon="material-symbols:mail-outline-rounded"
              width={40}
              height={40}
              className="text-[#bebebe]"
            />
            <p className="font-body text-[16px] text-[#868686]">
              No templates match your filters.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="font-body text-[14px] font-medium text-[#5450d8] hover:underline"
            >
              Create your first template
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Key</Th>
                  <Th>Trigger</Th>
                  <Th>Subject</Th>
                  <Th>Active</Th>
                  <Th>Updated</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {templates.map((tpl) => (
                  <tr key={tpl.id}>
                    <Td>
                      <span className="font-medium text-[#272727]">
                        {tpl.name}
                      </span>
                    </Td>
                    <Td>
                      <code className="rounded bg-[#f5f5fb] px-1.5 py-0.5 font-mono text-[13px] text-[#5450d8]">
                        {tpl.key}
                      </code>
                    </Td>
                    <Td>
                      <span className="text-[#272727]">
                        {TRIGGER_EVENT_LABELS[tpl.triggerEvent]}
                      </span>
                    </Td>
                    <Td className="max-w-sm">
                      <span
                        className="block truncate text-[#272727]"
                        title={tpl.emailSubject}
                      >
                        {tpl.emailSubject}
                      </span>
                    </Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => toggleActive(tpl)}
                        disabled={updateMutation.isPending}
                        className={`inline-flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
                          tpl.isActive ? "bg-[#5450d8]" : "bg-[#d4d4e0]"
                        }`}
                        aria-label={tpl.isActive ? "Deactivate" : "Activate"}
                      >
                        <span
                          className={`size-5 rounded-full bg-white shadow transition-transform ${
                            tpl.isActive ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </Td>
                    <Td>
                      <span className="text-[14px] text-[#868686]">
                        {formatDate(tpl.updated_at)}
                      </span>
                    </Td>
                    <Td className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <IconButton
                          title="Edit"
                          icon="ri:edit-fill"
                          onClick={() => openEdit(tpl)}
                        />
                        <IconButton
                          title="Delete"
                          icon="material-symbols:delete-rounded"
                          onClick={() => handleDelete(tpl)}
                          danger
                          disabled={deleteMutation.isPending}
                        />
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isFetching && (
              <div className="flex items-center justify-center py-3">
                <Loader2 size={16} className="animate-spin text-[#868686]" />
              </div>
            )}
            {totalPages > 1 && (
              <AdminPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </div>
        )}
      </WidgetCard>

      <NotificationTemplateDialog
        mode={dialogMode}
        template={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

// ─── Small presentational helpers ────────────────────────────────────────────

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`h-14 border-b border-[#e6e6e6] bg-[#fafafa] px-5 py-3 text-left font-heading text-[15px] font-medium leading-5 text-[#272727] ${
        className ?? ""
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`h-16 border-b border-[#e6e6e6] px-5 py-3 align-middle font-body text-[15px] leading-5 text-[#272727] ${
        className ?? ""
      }`}
    >
      {children}
    </td>
  );
}

function IconButton({
  icon,
  title,
  onClick,
  danger,
  disabled,
}: {
  icon: string;
  title: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex size-9 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "text-[#d4393a] hover:bg-[#fdecec]"
          : "text-[#5450d8] hover:bg-[#f5f5fb]"
      }`}
    >
      <Icon icon={icon} width={18} height={18} />
    </button>
  );
}
