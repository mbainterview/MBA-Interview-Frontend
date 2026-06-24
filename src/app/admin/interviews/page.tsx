"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Loader2 } from "lucide-react";
import { PageIntro } from "@/components/admin/page-intro";
import { PillGroup } from "@/components/admin/pill-group";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useAdminInterviewConfiguration,
  useUpdateAdminInterviewConfiguration,
} from "@/services/admin.service";
import { SchoolPicker } from "@/components/admin/school-picker";

const FOCUS_AREAS = [
  "Leadership",
  "Decision Making",
  "Self-Awareness",
  "Innovation",
  "Impact",
  "Career Goals",
  "Team Collaboration",
  "Resilience",
] as const;

type FocusArea = (typeof FOCUS_AREAS)[number];

export default function AdminAIInterviewPage() {
  // Scope: "general" (null schoolId) or a school's UUID
  const [mode, setMode] = useState<"general" | "school">("general");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");

  const scopeSchoolId = mode === "school" ? selectedSchoolId || null : null;
  const scopeActive = mode === "general" || !!selectedSchoolId;

  const {
    data: config,
    isLoading: configLoading,
    isFetching: configFetching,
  } = useAdminInterviewConfiguration(scopeActive ? scopeSchoolId : undefined);
  const updateConfig = useUpdateAdminInterviewConfiguration();

  // Local form state — hydrated from loaded config.
  const [difficulty, setDifficulty] = useState("intermediate");
  const [length, setLength] = useState("10");
  const [followUp, setFollowUp] = useState("light");
  const [tone, setTone] = useState("conversational");
  const [format, setFormat] = useState("behavioral");
  const [focusAreas, setFocusAreas] = useState<Set<FocusArea>>(
    new Set(["Leadership", "Innovation", "Career Goals"]),
  );

  useEffect(() => {
    if (!config) return;
    setDifficulty(config.difficulty);
    setLength(String(config.interviewLength));
    setFollowUp(config.followUpDepth);
    setTone(config.tone);
    setFormat(config.format);
    setFocusAreas(
      new Set(
        (config.focusAreas ?? []).filter((a): a is FocusArea =>
          (FOCUS_AREAS as readonly string[]).includes(a),
        ),
      ),
    );
  }, [config]);

  const handleSave = () => {
    if (mode === "school" && !selectedSchoolId) {
      toast.error("Select a school before saving a school-specific configuration");
      return;
    }
    updateConfig.mutate(
      {
        schoolId: scopeSchoolId,
        difficulty: difficulty as "beginner" | "intermediate" | "advanced",
        interviewLength: Number(length),
        followUpDepth: followUp as "light" | "medium" | "deep",
        tone: tone as "formal" | "conversational" | "analytical",
        format: format as "behavioral" | "case" | "mixed",
        focusAreas: Array.from(focusAreas),
      },
      {
        onSuccess: () =>
          toast.success(
            scopeSchoolId
              ? "School-specific interview configuration saved"
              : "General interview configuration saved",
          ),
        onError: (e: Error) =>
          toast.error(e.message || "Failed to save configuration"),
      },
    );
  };

  const toggleFocus = (area: FocusArea) => {
    setFocusAreas((prev) => {
      const next = new Set(prev);
      if (next.has(area)) next.delete(area);
      else next.add(area);
      return next;
    });
  };

  const loading = scopeActive && (configLoading || configFetching);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <PageIntro
          title="AI Interview Configuration"
          description="Define rules and scoring logic — AI handles everything else automatically"
        />
        <div className="inline-flex items-center gap-2.5 rounded-full bg-[#eef8ea] px-4.5 py-2.5">
          <span className="size-3 rounded-full bg-[#53b930]" />
          <span className="font-body text-[16px] leading-5 text-[#53b930]">
            AI Engine Active
          </span>
        </div>
      </div>

      {/* How it works info card */}
      <div className="flex items-start gap-6 rounded-[20px] border-b-2 border-primary bg-white p-4 px-4 py-6">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-[#4a46c3] to-[#5450d8]">
          <Icon
            icon="fluent:brain-32-filled"
            width={28}
            height={28}
            className="text-white"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <p className="font-heading text-[18px] font-semibold leading-7.5 tracking-tight text-[#272727]">
            How AI Interview Generation Works
          </p>
          <p className="font-body text-[16px] leading-7 tracking-tight text-[#868686]">
            Save a <strong>General</strong> configuration as the global default,
            and optionally override it per school. When a candidate starts a
            school-specific session, the school&apos;s row is used; otherwise the
            General row applies. The AI engine uses these rules to generate
            questions, follow-ups, and feedback.
          </p>
        </div>
      </div>

      {/* Main config card */}
      <section className="rounded-[20px] bg-white p-4 py-6">
        <div className="flex flex-col gap-8">
          {/* Card header */}
          <div className="flex items-center gap-3">
            <Icon
              icon="rivet-icons:filter"
              width={24}
              height={24}
              className="text-primary"
            />
            <h2 className="font-heading text-[20px] font-semibold leading-7.5 tracking-tight text-[#272727]">
              Interview Generation Rules
            </h2>
            {loading && (
              <span className="inline-flex items-center gap-2 text-[14px] text-[#868686]">
                <Loader2 size={14} className="animate-spin" /> Loading…
              </span>
            )}
          </div>

          <div className="flex flex-col gap-15">
            <div className="flex flex-col gap-6">
              {/* Interview Mode */}
              <Field label="Interview Mode">
                <div className="flex flex-wrap items-center gap-4">
                  <PillGroup
                    value={mode}
                    onChange={(v) => setMode(v as "general" | "school")}
                    options={[
                      { value: "general", label: "General" },
                      { value: "school", label: "School-Specific" },
                    ]}
                  />
                  {mode === "school" && (
                    <SchoolPicker
                      value={selectedSchoolId}
                      onChange={(id) => setSelectedSchoolId(id)}
                      placeholder="Select a school…"
                    />
                  )}
                </div>
              </Field>

              {/* Row: Difficulty / Length / Follow-up */}
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

              {/* Row: Tone / Format */}
              <div className="flex flex-wrap items-start justify-between gap-y-6">
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

              {/* Focus Areas */}
              <Field label="Focus Areas">
                <div className="flex flex-wrap gap-x-10 gap-y-3">
                  {FOCUS_AREAS.map((area) => {
                    const checked = focusAreas.has(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleFocus(area)}
                        className="flex items-center gap-2"
                      >
                        <span
                          className={cn(
                            "grid size-5 place-items-center rounded border",
                            checked
                              ? "border-primary bg-primary"
                              : "border-[#bebebe] bg-white",
                          )}
                        >
                          {checked && (
                            <Icon
                              icon="qlementine-icons:check-tick-24"
                              width={14}
                              height={14}
                              className="text-white"
                            />
                          )}
                        </span>
                        <span className="font-body text-[16px] leading-7.5 tracking-tight text-[#272727]">
                          {area}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>

            {/* Save Configuration button — bottom right */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={updateConfig.isPending || (mode === "school" && !selectedSchoolId)}
                className="flex h-16 w-80 items-center justify-center rounded-[16px] bg-primary font-body text-[18px] font-medium capitalize leading-7 text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {updateConfig.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save Configuration"
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
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
