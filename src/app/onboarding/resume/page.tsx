"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { OnboardingShell } from "@/components/shared/onboarding-shell";
import { WizardStepCard } from "@/components/shared/wizard-step-card";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { useUploadResume } from "@/services/resume.service";
import { useProfile } from "@/services/profile.service";
import type { ParsedResume } from "@/types/domain";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

interface ParsedPreview {
  education: string;
  experience: string;
  skills: string;
}

function summariseParsed(parsed: ParsedResume): ParsedPreview {
  const eduParts = parsed.education
    .map((e) =>
      [e.degree, e.major, e.school].filter(Boolean).join(" — "),
    )
    .filter(Boolean);

  const yearsTotal = parsed.work.reduce((acc, w) => {
    if (!w.startDate) return acc;
    const start = new Date(w.startDate);
    const end = w.endDate ? new Date(w.endDate) : new Date();
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return acc;
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    return acc + Math.max(0, months);
  }, 0);
  const yearsLabel = yearsTotal > 0 ? `${Math.round(yearsTotal / 12)} years` : "";
  const latestRole = parsed.work[0];
  const expParts = [
    yearsLabel,
    latestRole ? [latestRole.title, latestRole.company].filter(Boolean).join(" at ") : "",
  ].filter(Boolean);

  return {
    education: eduParts[0] ?? "—",
    experience: expParts.join(" — ") || "—",
    skills: parsed.skills.slice(0, 6).join(", ") || "—",
  };
}

export default function ResumeUploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { update } = useOnboardingDraft();
  const [fileName, setFileName] = useState<string | null>(null);
  const uploadResume = useUploadResume();

  // Poll the profile while the resume is being parsed in the background.
  const profileQuery = useProfile({
    refetchInterval: (query) => {
      const status = query.state.data?.resumeParseStatus;
      return status === "queued" || status === "processing" ? 2000 : false;
    },
  });
  const profile = profileQuery.data;
  const parseStatus = profile?.resumeParseStatus ?? "none";
  const parsed = profile?.parsedResume ?? null;
  const preview = parsed ? summariseParsed(parsed) : null;

  useEffect(() => {
    if (parseStatus === "failed") {
      toast.error("Resume parsing failed. Please try uploading again.");
    }
  }, [parseStatus]);

  const handleFile = (file: File) => {
    setFileName(file.name);

    uploadResume.mutate(file, {
      onSuccess: () => {
        toast.success("Resume uploaded — analysing…");
        update({ resume: { fileName: file.name } });
        // Profile poll picks up resumeParseStatus → 'processing' → 'complete'
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to upload resume",
        );
        setFileName(null);
      },
    });
  };

  const handleContinue = () => {
    update({
      resume: {
        fileName: fileName ?? undefined,
        parsed: preview ?? undefined,
      },
    });
    router.push("/onboarding/schools");
  };

  const isUploading = uploadResume.isPending;
  const isAnalysing =
    parseStatus === "queued" || parseStatus === "processing";

  // Once the file has been accepted by the backend (s3Key persisted, or any
  // parse-status set by the upload service), the user is free to move on —
  // AI parsing finishes in the background and the parsed data is read by
  // later steps when it lands.
  const uploadSucceeded =
    !!profile?.resumeS3Key ||
    parseStatus === "queued" ||
    parseStatus === "processing" ||
    parseStatus === "complete";

  const showDropzone = !uploadSucceeded && !isUploading;
  const continueDisabled = isUploading;

  return (
    <OnboardingShell>
      <WizardStepCard
        icon={<Upload size={20} />}
        iconColor="green"
        title="Resume Upload"
        onBack={() => router.push("/onboarding/profile")}
        onContinue={handleContinue}
        continueDisabled={continueDisabled}
      >
        {showDropzone ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-[14px] border-2 border-dashed transition-colors hover:bg-[#fafaff]"
            style={{
              borderColor: "#d9d9d9",
              padding: "48px 24px",
              background: "white",
            }}
          >
            <FileText size={42} className="mb-3" style={{ color: "#5450d8" }} />
            <span
              style={{
                fontFamily: inter,
                fontSize: "14px",
                fontWeight: 500,
                color: "#222c44",
              }}
            >
              Click to upload your resume
            </span>
            <span
              className="mt-1"
              style={{ fontFamily: inter, fontSize: "12px", color: "#9999a5" }}
            >
              PDF or DOC, max 5MB · optional, you can do this later
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </button>
        ) : isUploading ? (
          <div
            className="flex flex-col items-center justify-center rounded-[14px] border-2 border-dashed"
            style={{
              borderColor: "#d9d9d9",
              padding: "48px 24px",
              background: "white",
            }}
          >
            <Loader2
              size={42}
              className="mb-3 animate-spin"
              style={{ color: "#5450d8" }}
            />
            <span
              style={{
                fontFamily: inter,
                fontSize: "14px",
                fontWeight: 500,
                color: "#222c44",
              }}
            >
              Uploading…
            </span>
          </div>
        ) : (
          <>
            <div
              className="flex items-center gap-2 rounded-[12px] px-4 py-3"
              style={{ background: "#dcf5e8" }}
            >
              <Check size={16} style={{ color: "#22c55e" }} />
              <span
                style={{
                  fontFamily: inter,
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#15803d",
                }}
              >
                {fileName ?? "Resume"} uploaded
              </span>
            </div>

            {preview ? (
              <div
                className="rounded-[14px] border p-4"
                style={{ borderColor: "#ececf5", background: "#fafafe" }}
              >
                <div
                  className="mb-2"
                  style={{
                    fontFamily: sora,
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#222c44",
                  }}
                >
                  Parsed Preview
                </div>
                <ParsedRow label="Education" value={preview.education} />
                <ParsedRow label="Experience" value={preview.experience} />
                <ParsedRow label="Skills" value={preview.skills} />
              </div>
            ) : isAnalysing ? (
              <div
                className="flex items-center gap-2 rounded-[14px] border p-4"
                style={{ borderColor: "#ececf5", background: "#fafafe" }}
              >
                <Loader2
                  size={16}
                  className="animate-spin"
                  style={{ color: "#5450d8" }}
                />
                <span
                  style={{
                    fontFamily: inter,
                    fontSize: "13px",
                    color: "#272727",
                  }}
                >
                  Analysing your resume in the background — you can continue.
                </span>
              </div>
            ) : null}
          </>
        )}
      </WizardStepCard>
    </OnboardingShell>
  );
}

function ParsedRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 py-1">
      <span
        style={{
          fontFamily: inter,
          fontSize: "13px",
          color: "#9999a5",
          minWidth: "84px",
        }}
      >
        {label}:
      </span>
      <span
        style={{
          fontFamily: inter,
          fontSize: "13px",
          color: "#272727",
        }}
      >
        {value}
      </span>
    </div>
  );
}
