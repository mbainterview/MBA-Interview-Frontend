"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { PageIntro } from "@/components/admin/page-intro";
import { PillGroup } from "@/components/admin/pill-group";
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAdminKiraPrompts,
  useCreateKiraPrompts,
  useUpdateKiraPrompt,
  useDeleteKiraPrompt,
  useKiraConfiguration,
  useUpdateKiraConfiguration,
} from "@/services/admin.service";
import { SchoolPicker } from "@/components/admin/school-picker";
import { toast } from "sonner";

interface KiraPrompt {
  id: string;
  text: string;
  category: string;
  difficulty: string;
  prepTimeSeconds: number;
  responseTimeSeconds: number;
  schoolId: string | null;
  school: { name: string } | null;
  isActive: boolean;
  orderIndex: number;
}

export default function KiraVideoPage() {
  const [prepTime, setPrepTime] = useState("30");
  const [respTime, setRespTime] = useState("90");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [length, setLength] = useState("10");
  const [followUp, setFollowUp] = useState("light");
  const [tone, setTone] = useState("conversational");
  const [format, setFormat] = useState("behavioral");

  // Dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<KiraPrompt | null>(null);

  // Form state
  const [formText, setFormText] = useState("");
  const [formPrep, setFormPrep] = useState("30");
  const [formResp, setFormResp] = useState("90");
  const [formSchool, setFormSchool] = useState("");
  const [formDifficulty, setFormDifficulty] = useState("medium");

  // API hooks
  const { data: prompts, isLoading } = useAdminKiraPrompts();
  const createPrompts = useCreateKiraPrompts();
  const updatePrompt = useUpdateKiraPrompt();
  const deletePrompt = useDeleteKiraPrompt();
  const { data: kiraConfig } = useKiraConfiguration();
  const updateKiraConfig = useUpdateKiraConfiguration();
  // Hydrate local state from loaded configuration
  useEffect(() => {
    if (!kiraConfig) return;
    setPrepTime(String(kiraConfig.prepTimeSeconds));
    setRespTime(String(kiraConfig.responseTimeSeconds));
    setDifficulty(kiraConfig.difficulty);
    setLength(String(kiraConfig.interviewLength));
    setFollowUp(kiraConfig.followUpDepth);
    setTone(kiraConfig.tone);
    setFormat(kiraConfig.format);
  }, [kiraConfig]);

  const handleSaveConfiguration = () => {
    updateKiraConfig.mutate(
      {
        prepTimeSeconds: Number(prepTime),
        responseTimeSeconds: Number(respTime),
        difficulty: difficulty as "beginner" | "intermediate" | "advanced",
        interviewLength: Number(length),
        followUpDepth: followUp as "light" | "medium" | "deep",
        tone: tone as "formal" | "conversational" | "analytical",
        format: format as "behavioral" | "case" | "mixed",
      },
      {
        onSuccess: () => toast.success("Kira configuration saved"),
        onError: (e: Error) =>
          toast.error(e.message || "Failed to save configuration"),
      },
    );
  };

  const promptList: KiraPrompt[] = Array.isArray(prompts) ? prompts : [];

  const resetForm = () => {
    setFormText("");
    setFormPrep("30");
    setFormResp("90");
    setFormSchool("");
    setFormDifficulty("medium");
  };

  const handleAdd = () => {
    if (!formText.trim()) {
      toast.error("Prompt text is required");
      return;
    }
    createPrompts.mutate(
      {
        prompts: [
          {
            text: formText.trim(),
            prepTimeSeconds: Number(formPrep),
            responseTimeSeconds: Number(formResp),
            difficulty: formDifficulty,
            ...(formSchool ? { schoolId: formSchool } : {}),
          },
        ],
      },
      {
        onSuccess: () => {
          toast.success("Kira prompt added");
          setAddOpen(false);
          resetForm();
        },
        onError: (e: Error) => toast.error(e.message || "Failed to add prompt"),
      },
    );
  };

  const handleEditOpen = (prompt: KiraPrompt) => {
    setSelectedPrompt(prompt);
    setFormText(prompt.text);
    setFormPrep(String(prompt.prepTimeSeconds));
    setFormResp(String(prompt.responseTimeSeconds));
    setFormSchool(prompt.schoolId ?? "");
    setFormDifficulty(prompt.difficulty);
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!selectedPrompt || !formText.trim()) return;
    updatePrompt.mutate(
      {
        id: selectedPrompt.id,
        data: {
          text: formText.trim(),
          prepTimeSeconds: Number(formPrep),
          responseTimeSeconds: Number(formResp),
          difficulty: formDifficulty,
          ...(formSchool ? { schoolId: formSchool } : { schoolId: null }),
        },
      },
      {
        onSuccess: () => {
          toast.success("Prompt updated");
          setEditOpen(false);
          setSelectedPrompt(null);
          resetForm();
        },
        onError: (e: Error) =>
          toast.error(e.message || "Failed to update prompt"),
      },
    );
  };

  const handleDeleteOpen = (prompt: KiraPrompt) => {
    setSelectedPrompt(prompt);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedPrompt) return;
    deletePrompt.mutate(selectedPrompt.id, {
      onSuccess: () => {
        toast.success("Prompt deleted");
        setDeleteOpen(false);
        setSelectedPrompt(null);
      },
      onError: (e: Error) =>
        toast.error(e.message || "Failed to delete prompt"),
    });
  };

  const COLUMNS: AdminColumn<KiraPrompt>[] = [
    {
      key: "text",
      header: "Questions",
      cell: (r) => (
        <span className="font-body text-[16px] leading-5 text-[#272727]">
          {r.text}
        </span>
      ),
    },
    {
      key: "difficulty",
      header: "Difficulty",
      cell: (r) => (
        <span className="inline-flex items-center justify-center rounded-full bg-[#eeeefe] px-4.5 py-2.5 font-body text-[14px] capitalize leading-5 text-primary">
          {r.difficulty}
        </span>
      ),
    },
    {
      key: "school",
      header: "School",
      cell: (r) => r.school?.name ?? "General",
    },
    {
      key: "prepTimeSeconds",
      header: "Preparation",
      cell: (r) => `${r.prepTimeSeconds}s`,
    },
    {
      key: "responseTimeSeconds",
      header: "Response",
      cell: (r) => `${r.responseTimeSeconds}s`,
    },
    {
      key: "isActive",
      header: "Status",
      className: "w-47.25",
      cell: (r) => (
        <StatusBadge status={r.isActive ? "Active" : "Inactive"} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-30",
      cell: (r) => (
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-primary"
            aria-label="Edit"
            onClick={() => handleEditOpen(r)}
          >
            <Icon icon="ri:edit-fill" width={24} height={24} />
          </button>
          <button
            type="button"
            className="text-[#fc5a33]"
            aria-label="Delete"
            onClick={() => handleDeleteOpen(r)}
          >
            <Icon
              icon="material-symbols:delete-rounded"
              width={24}
              height={24}
            />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageIntro
          title="Kira Video Module"
          description="Configure video interview flow and evaluation criteria"
        />
        <div className="inline-flex items-center gap-2.5 rounded-full bg-[#eef8ea] px-4.5 py-2.5">
          <Icon
            icon="tabler:video-filled"
            width={20}
            height={20}
            className="text-[#53b930]"
          />
          <span className="font-body text-[16px] leading-5 text-[#53b930]">
            {promptList.length} Prompts Configured
          </span>
        </div>
      </div>

      {/* Timing Settings card */}
      <section className="rounded-[20px] bg-white p-4 py-6">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <Icon
              icon="mingcute:time-fill"
              width={24}
              height={24}
              className="text-primary"
            />
            <h2 className="font-heading text-[20px] font-semibold leading-7.5 tracking-tight text-[#272727]">
              Timing Settings
            </h2>
          </div>

          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-8">
              {/* Preparation + Response time */}
              <div className="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-[16px] leading-7.5 tracking-tight text-[#272727]">
                      Preparation Time
                    </span>
                    <span className="font-body text-[16px] font-semibold leading-7.5 tracking-tight text-primary">
                      {prepTime}s
                    </span>
                  </div>
                  <PillGroup
                    value={prepTime}
                    onChange={setPrepTime}
                    options={[
                      { value: "15", label: "15s" },
                      { value: "30", label: "30s" },
                      { value: "45", label: "45s" },
                      { value: "60", label: "60s" },
                    ]}
                  />
                  <p className="font-body text-[14px] leading-7.5 tracking-tight text-[#868686]">
                    Time candidates have to read and prepare before recording
                    begins
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-[16px] leading-7.5 tracking-tight text-[#272727]">
                      Response Time
                    </span>
                    <span className="font-body text-[16px] font-semibold leading-7.5 tracking-tight text-primary">
                      {respTime}s
                    </span>
                  </div>
                  <PillGroup
                    value={respTime}
                    onChange={setRespTime}
                    options={[
                      { value: "60", label: "60s" },
                      { value: "90", label: "90s" },
                      { value: "120", label: "120s" },
                      { value: "180", label: "180s" },
                    ]}
                  />
                  <p className="font-body text-[14px] leading-7.5 tracking-tight text-[#868686]">
                    Maximum recording time per question
                  </p>
                </div>
              </div>

              {/* Difficulty / Length / Follow-up */}
              <div className="flex flex-wrap items-start justify-between gap-6">
                <Field label="Difficulty Level">
                  <PillGroup
                    value={difficulty}
                    onChange={setDifficulty}
                    options={[
                      { value: "beginner", label: "Beginner" },
                      { value: "intermediate", label: "Intermediate" },
                      { value: "advanced", label: "Advanced" },
                    ]}
                  />
                </Field>
                <Field label="Interview Length (Questions)">
                  <PillGroup
                    value={length}
                    onChange={setLength}
                    options={[
                      { value: "5", label: "05" },
                      { value: "10", label: "10" },
                      { value: "15", label: "15" },
                    ]}
                  />
                </Field>
                <Field label="Follow-up Depth">
                  <PillGroup
                    value={followUp}
                    onChange={setFollowUp}
                    options={[
                      { value: "light", label: "Light" },
                      { value: "medium", label: "Medium" },
                      { value: "deep", label: "Deep" },
                    ]}
                  />
                </Field>
              </div>

              {/* Tone / Format */}
              <div className="flex flex-wrap items-start gap-x-16 gap-y-6">
                <Field label="Interview Tone">
                  <PillGroup
                    value={tone}
                    onChange={setTone}
                    options={[
                      { value: "formal", label: "Formal" },
                      { value: "conversational", label: "Conversational" },
                      { value: "analytical", label: "Analytical" },
                    ]}
                  />
                </Field>
                <Field label="Preferred Format">
                  <PillGroup
                    value={format}
                    onChange={setFormat}
                    options={[
                      { value: "behavioral", label: "Behavioral" },
                      { value: "case", label: "Case" },
                      { value: "mixed", label: "Mixed" },
                    ]}
                  />
                </Field>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveConfiguration}
                disabled={updateKiraConfig.isPending}
                className="flex h-16 w-80 items-center justify-center rounded-[16px] bg-primary font-body text-[18px] font-medium capitalize leading-7 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updateKiraConfig.isPending ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Kira Questions */}
      <section className="rounded-[20px] bg-white p-4 py-6">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Icon
                  icon="tabler:video-filled"
                  width={24}
                  height={24}
                  className="text-primary"
                />
                <h2 className="font-heading text-[20px] font-semibold leading-7.5 tracking-tight text-[#272727]">
                  Custom Kira Questions
                </h2>
              </div>
              <p className="font-body text-[16px] leading-7.5 tracking-tight text-[#868686]">
                Assign video prompts to specific schools or make them general
              </p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setAddOpen(true);
              }}
              className="h-16 gap-2.5 rounded-[16px] bg-primary px-8 font-body text-[18px] font-medium capitalize text-white shadow-md hover:bg-primary/90"
            >
              <Icon
                icon="material-symbols:add-rounded"
                width={24}
                height={24}
              />
              Add Kira Questions
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-[#868686]">
              Loading prompts...
            </div>
          ) : (
            <AdminTable
              columns={COLUMNS}
              data={promptList}
              rowKey={(r) => r.id}
              className="rounded-none"
            />
          )}
        </div>
      </section>

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-130">
          <DialogHeader>
            <DialogTitle className="font-heading text-[22px] font-semibold">
              Add Kira Question
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-prompt">Prompt</Label>
              <Input
                id="add-prompt"
                placeholder="Enter the video prompt..."
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-prep">Preparation (s)</Label>
                <Input
                  id="add-prep"
                  type="number"
                  value={formPrep}
                  onChange={(e) => setFormPrep(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-resp">Response (s)</Label>
                <Input
                  id="add-resp"
                  type="number"
                  value={formResp}
                  onChange={(e) => setFormResp(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-difficulty">Difficulty</Label>
                <select
                  id="add-difficulty"
                  value={formDifficulty}
                  onChange={(e) => setFormDifficulty(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-school">School (optional)</Label>
                <SchoolPicker
                  value={formSchool}
                  onChange={(id) => setFormSchool(id)}
                  placeholder="General"
                  triggerClassName="h-10 min-w-0 w-full"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={createPrompts.isPending}>
              {createPrompts.isPending ? "Adding..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-130">
          <DialogHeader>
            <DialogTitle className="font-heading text-[22px] font-semibold">
              Edit Kira Question
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-prompt">Prompt</Label>
              <Input
                id="edit-prompt"
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-prep">Preparation (s)</Label>
                <Input
                  id="edit-prep"
                  type="number"
                  value={formPrep}
                  onChange={(e) => setFormPrep(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-resp">Response (s)</Label>
                <Input
                  id="edit-resp"
                  type="number"
                  value={formResp}
                  onChange={(e) => setFormResp(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-difficulty">Difficulty</Label>
                <select
                  id="edit-difficulty"
                  value={formDifficulty}
                  onChange={(e) => setFormDifficulty(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-school">School (optional)</Label>
                <SchoolPicker
                  value={formSchool}
                  onChange={(id) => setFormSchool(id)}
                  placeholder="General"
                  triggerClassName="h-10 min-w-0 w-full"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={updatePrompt.isPending}>
              {updatePrompt.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle className="font-heading text-[22px] font-semibold">
              Delete Kira Question
            </DialogTitle>
          </DialogHeader>
          <p className="py-4 text-[15px] text-[#868686]">
            Are you sure you want to delete this prompt? This action cannot be
            undone.
          </p>
          <p className="rounded-lg bg-[#f5f4ff] p-3 text-[14px] text-[#272727]">
            &ldquo;{selectedPrompt?.text}&rdquo;
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deletePrompt.isPending}
            >
              {deletePrompt.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-body text-[18px] font-medium leading-7.5 tracking-tight text-[#272727]">
        {label}
      </p>
      {children}
    </div>
  );
}
