"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PageIntro } from "@/components/admin/page-intro";
import { SimpleStatCard } from "@/components/admin/simple-stat-card";
import { AdminPagination } from "@/components/admin/admin-pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SchoolLogo } from "@/components/admin/school-logo";
import { useSchools, useSchoolQuestions, schoolKeys } from "@/services/schools.service";
import {
  useCreateSchool,
  useDeactivateSchool,
  useUpdateSchool,
  useAdminOverview,
} from "@/services/admin.service";
import type { School } from "@/types/domain";

// ── School Card ──────────────────────────────────────────────────────────────

function SchoolCard({
  school,
  onView,
  onEdit,
  onDelete,
  isDeleting,
}: {
  school: School;
  onView: (school: School) => void;
  onEdit: (school: School) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  return (
    <article className="flex flex-col gap-10 rounded-[20px] bg-white p-4 py-6">
      <div className="flex flex-col gap-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SchoolLogo school={school} size={56} className="rounded-2xl" rounded={false} />
            <div className="flex flex-col gap-1.5">
              <h3 className="font-heading text-[18px] font-semibold leading-7.5 tracking-tight text-[#272727]">
                {school.name}
              </h3>
              <div className="flex items-center gap-2">
                <Icon icon="tdesign:location-filled" width={16} height={16} className="text-[#868686]" />
                <span className="font-body text-[16px] leading-[1.3] text-[#868686]">
                  {school.location ?? "—"}
                </span>
              </div>
            </div>
          </div>
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full px-4.5 py-2.5 font-body text-[15px] leading-5",
              school.isActive ? "bg-[#eef8ea] text-[#53b930]" : "bg-[#fef2f2] text-[#fc5a33]",
            )}
          >
            {school.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Info row */}
        <div className="flex items-start gap-8">
          <div className="flex flex-col gap-2">
            <span className="font-body text-[16px] leading-[1.3] text-[#868686]">Abbreviation</span>
            <div className="inline-flex w-34 items-center justify-center rounded-[20px] bg-[#eaf0fe] px-4 py-1.5">
              <span className="font-body text-[16px] font-medium leading-[1.3] text-primary">
                {school.abbreviation}
              </span>
            </div>
          </div>
          {school.description && (
            <div className="flex flex-1 flex-col gap-2">
              <span className="font-body text-[16px] leading-[1.3] text-[#868686]">Description</span>
              <p className="font-body text-[15px] leading-[1.4] text-[#555]">
                {school.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onView(school)}
          className="flex h-14.5 w-37.5 items-center justify-center rounded-[16px] bg-primary px-8 py-4 font-body text-[18px] font-medium capitalize leading-7 text-white transition-opacity hover:opacity-90"
        >
          View
        </button>
        <button
          type="button"
          onClick={() => onEdit(school)}
          className="flex h-14.5 w-37.5 items-center justify-center rounded-[16px] border border-primary px-8 py-4 font-body text-[18px] font-semibold capitalize leading-7 text-primary transition-colors hover:bg-primary/5"
        >
          Edit
        </button>
        <button
          type="button"
          aria-label="Delete school"
          disabled={isDeleting}
          onClick={() => onDelete(school.id)}
          className="grid size-14.5 place-items-center rounded-[16px] border border-[#fc5a33] text-[#fc5a33] transition-colors hover:bg-[#fc5a33]/5 disabled:opacity-50"
        >
          {isDeleting ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <Icon icon="material-symbols:delete-rounded" width={24} height={24} />
          )}
        </button>
      </div>
    </article>
  );
}

// ── View Dialog ──────────────────────────────────────────────────────────────

function ViewSchoolDialog({
  school,
  open,
  onClose,
}: {
  school: School | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data: questionsData, isLoading } = useSchoolQuestions(
    school?.id ?? "",
    { limit: 50 },
  );
  const questions = questionsData?.data ?? [];

  if (!school) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-[22px] font-semibold">
            {school.name}
          </DialogTitle>
          <DialogDescription className="font-body text-[14px] text-[#868686]">
            {school.location ?? ""} · {school.abbreviation}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* School info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-body text-[14px] text-[#868686]">Status</span>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[13px] font-medium",
                  school.isActive ? "bg-[#eef8ea] text-[#53b930]" : "bg-[#fef2f2] text-[#fc5a33]",
                )}
              >
                {school.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            {school.description && (
              <div>
                <span className="font-body text-[14px] text-[#868686]">Description</span>
                <p className="mt-1 font-body text-[15px] leading-relaxed text-[#272727]">
                  {school.description}
                </p>
              </div>
            )}
          </div>

          {/* Questions list */}
          <div>
            <h4 className="font-heading text-[16px] font-semibold text-[#272727]">
              Questions ({questions.length})
            </h4>
            {isLoading ? (
              <div className="flex items-center gap-2 py-4">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span className="font-body text-[14px] text-[#868686]">Loading questions...</span>
              </div>
            ) : questions.length === 0 ? (
              <p className="py-4 font-body text-[14px] text-[#868686]">No questions added yet.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {questions.map((q, i) => (
                  <li
                    key={q.id}
                    className="flex items-start gap-3 rounded-lg border border-[#f0f0f5] p-3"
                  >
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-body text-[12px] font-semibold text-primary">
                      {i + 1}
                    </span>
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="font-body text-[14px] text-[#272727]">{q.text}</p>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-[#eeeefe] px-2 py-0.5 font-body text-[12px] text-primary">
                          {q.category}
                        </span>
                        <span className="rounded bg-[#f5f5f5] px-2 py-0.5 font-body text-[12px] text-[#868686]">
                          {q.difficulty}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Dialog ──────────────────────────────────────────────────────────────

function EditSchoolDialog({
  school,
  open,
  onClose,
}: {
  school: School | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const updateSchool = useUpdateSchool();

  const [editData, setEditData] = useState({
    name: "",
    description: "",
    location: "",
  });

  // Sync form when school changes
  const [lastSchoolId, setLastSchoolId] = useState<string | null>(null);
  if (school && school.id !== lastSchoolId) {
    setLastSchoolId(school.id);
    setEditData({
      name: school.name ?? "",
      description: school.description ?? "",
      location: school.location ?? "",
    });
  }

  if (!school) return null;

  const handleSave = () => {
    updateSchool.mutate(
      {
        id: school.id,
        data: {
          name: editData.name.trim() || undefined,
          description: editData.description.trim() || undefined,
          location: editData.location.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: schoolKeys.lists() });
          toast.success("School updated successfully");
          onClose();
        },
        onError: () => toast.error("Failed to update school"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle className="font-heading text-[22px] font-semibold">
            Edit School
          </DialogTitle>
          <DialogDescription className="font-body text-[14px] text-[#868686]">
            Update details for {school.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">School name</Label>
            <Input
              id="edit-name"
              value={editData.name}
              onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
              placeholder="City, State"
              value={editData.location}
              onChange={(e) => setEditData((p) => ({ ...p, location: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-desc">Description</Label>
            <Textarea
              id="edit-desc"
              rows={3}
              value={editData.description}
              onChange={(e) => setEditData((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateSchool.isPending}>
            {updateSchool.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function SchoolsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [viewSchool, setViewSchool] = useState<School | null>(null);
  const [editSchool, setEditSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
    description: "",
    location: "",
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Show every school on one page, ordered by seed/created order (ASC) so the
  // featured M7 programs (HBS, Wharton, Stanford, Columbia…) lead the list.
  // The API default is created_at DESC + limit 20, which buried them on page 2.
  const { data: schoolsData, isLoading: schoolsLoading } = useSchools({
    limit: 100,
    sort: "created_at",
    order: "ASC",
  });
  const { data: overview, isLoading: overviewLoading } = useAdminOverview();
  const createSchool = useCreateSchool();
  const deactivateSchool = useDeactivateSchool();

  const schools = schoolsData?.data ?? [];
  const totalSchools = schools.length;
  const activeSchools = schools.filter((s) => s.isActive).length;

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.abbreviation.trim()) {
      toast.error("School name and abbreviation are required");
      return;
    }
    createSchool.mutate(
      {
        name: formData.name.trim(),
        abbreviation: formData.abbreviation.trim(),
        description: formData.description.trim() || undefined,
        location: formData.location.trim() || undefined,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: schoolKeys.lists() });
          toast.success("School created successfully");
          setAddOpen(false);
          setFormData({ name: "", abbreviation: "", description: "", location: "" });
        },
        onError: () => toast.error("Failed to create school"),
      },
    );
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deactivateSchool.mutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: schoolKeys.lists() });
        toast.success("School deactivated");
        setDeletingId(null);
      },
      onError: () => {
        toast.error("Failed to deactivate school");
        setDeletingId(null);
      },
    });
  };

  const isLoading = schoolsLoading || overviewLoading;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageIntro title="Schools" description="Manage MBA programs and their interview configurations" />
        <Button
          onClick={() => setAddOpen(true)}
          className="h-16 gap-2.5 rounded-[16px] bg-primary px-8 font-body text-[18px] font-medium capitalize text-white shadow-md hover:bg-primary/90"
        >
          <Icon icon="material-symbols:add-rounded" width={24} height={24} />
          Add School
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SimpleStatCard
          value={isLoading ? "—" : String(totalSchools)}
          label="Total Schools"
          icon="material-symbols:school-rounded"
          iconBgClass="bg-linear-to-br from-[#4a46c3] to-[#5450d8]"
        />
        <SimpleStatCard
          value={isLoading ? "—" : String(overview?.totalUsers ?? 0)}
          label="Total Users"
          icon="icon-park-solid:peoples"
          iconBgClass="bg-linear-to-br from-[#48a927] to-[#53b930]"
        />
        <SimpleStatCard
          value={isLoading ? "—" : String(overview?.totalSessions ?? 0)}
          label="Total Sessions"
          icon="tabler:message-filled"
          iconBgClass="bg-linear-to-br from-[#e5b900] to-[#f8cc16]"
        />
        <SimpleStatCard
          value={isLoading ? "—" : String(activeSchools)}
          label="Active Schools"
          icon="material-symbols:check-circle-rounded"
          iconBgClass="bg-linear-to-br from-[#fc5a33] to-[#e0441e]"
        />
      </div>

      {/* School card grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-10 animate-spin text-primary" />
        </div>
      ) : schools.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[20px] bg-white py-20">
          <Icon icon="material-symbols:school-rounded" width={48} height={48} className="text-[#868686]" />
          <p className="font-body text-[18px] text-[#868686]">
            No schools found. Add your first school to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {schools.map((school) => (
            <SchoolCard
              key={school.id}
              school={school}
              onView={setViewSchool}
              onEdit={setEditSchool}
              onDelete={handleDelete}
              isDeleting={deletingId === school.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="rounded-[12px] bg-white">
        <AdminPagination
          currentPage={schoolsData?.meta?.page ?? 1}
          totalPages={schoolsData?.meta?.total_pages ?? 1}
        />
      </div>

      {/* View School Dialog */}
      <ViewSchoolDialog
        school={viewSchool}
        open={!!viewSchool}
        onClose={() => setViewSchool(null)}
      />

      {/* Edit School Dialog */}
      <EditSchoolDialog
        school={editSchool}
        open={!!editSchool}
        onClose={() => setEditSchool(null)}
      />

      {/* Add School Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-130">
          <DialogHeader>
            <DialogTitle className="font-heading text-[22px] font-semibold">Add School</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">School name</Label>
              <Input
                id="name"
                placeholder="e.g. Harvard Business School"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="abbreviation">Abbreviation</Label>
              <Input
                id="abbreviation"
                placeholder="e.g. HBS"
                value={formData.abbreviation}
                onChange={(e) => setFormData((p) => ({ ...p, abbreviation: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">Location</Label>
              <Input
                id="city"
                placeholder="Boston, MA"
                value={formData.location}
                onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Description</Label>
              <Textarea
                id="notes"
                placeholder="Any description..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createSchool.isPending}>
              {createSchool.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
