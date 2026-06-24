"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Video, Loader2 } from "lucide-react";
import { useSchool } from "@/services/schools.service";
import {
  useInterviewConfiguration,
  useStartSession,
} from "@/services/interview.service";
import { toast } from "sonner";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

export default function MockInterviewStartPage() {
  return (
    <Suspense fallback={null}>
      <MockInterviewStartInner />
    </Suspense>
  );
}

function MockInterviewStartInner() {
  const router = useRouter();
  const params = useSearchParams();

  const schoolId = params.get("schoolId") ?? "";
  const type = params.get("type") ?? "general";

  const explicitLength = params.get("length");
  const parsedExplicit = explicitLength !== null ? Number(explicitLength) : null;
  const hasExplicitLength =
    parsedExplicit !== null && Number.isFinite(parsedExplicit) && parsedExplicit > 0;

  const school = useSchool(schoolId);
  const { data: interviewConfig } = useInterviewConfiguration(schoolId || null);
  const startSession = useStartSession();

  // Precedence for displayed + sent question count:
  //   1. explicit ?length= URL param (legacy links)
  //   2. admin AI Interview config (school-specific row or General row)
  //   3. sensible default (8)
  const questions = hasExplicitLength
    ? (parsedExplicit as number)
    : (interviewConfig?.interviewLength ?? 8);

  const handleBegin = () => {
    if (type === "school" && !schoolId) {
      toast.error("No school selected");
      return;
    }
    startSession.mutate(
      {
        ...(schoolId ? { schoolId } : {}),
        questionCount: questions,
      },
      {
        onSuccess: (session) => {
          router.push(`/mock-interview/session/${session.id}`);
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to start session");
        },
      },
    );
  };

  const schoolName = school.data?.name;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <Link
        href="/mock-interview"
        className="inline-flex items-center gap-1.5"
        style={{
          fontFamily: inter,
          fontSize: "18px",
          color: "#868686",
          lineHeight: 1.4,
        }}
      >
        <ArrowLeft size={14} />
        Back
      </Link>

      <div className="mt-6 flex justify-center">
        <div
          className="w-full max-w-[485px] rounded-[20px] bg-white px-8 py-11"
          style={{ boxShadow: "0 20px 60px rgba(15, 11, 56, 0.08)" }}
        >
          <div className="flex flex-col items-center">
            <div
              className="flex h-[82px] w-[82px] items-center justify-center rounded-[41px] text-white"
              style={{ background: "#5450d8" }}
            >
              <Video size={40} />
            </div>
            <h1
              className="mt-6 text-center"
              style={{
                fontFamily: sora,
                fontSize: "32px",
                fontWeight: 600,
                color: "#222c44",
                lineHeight: 1.3,
              }}
            >
              Interview Instructions
            </h1>
            {schoolName && (
              <p
                className="mt-1 text-center"
                style={{
                  fontFamily: inter,
                  fontSize: "14px",
                  color: "#9ea1c5",
                }}
              >
                {schoolName}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <InfoRow label="Questions" value={String(questions).padStart(2, "0")} />
            <InfoRow label="Time per question" value="90 seconds" />
            <InfoRow label="Mode" value="Video Recording" />
          </div>

          <button
            type="button"
            onClick={handleBegin}
            disabled={startSession.isPending}
            className="mt-10 w-full rounded-[16px] transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{
              background: "#5450d8",
              color: "white",
              padding: "18px 32px",
              fontFamily: inter,
              fontSize: "20px",
              fontWeight: 500,
              border: "none",
              cursor: startSession.isPending ? "not-allowed" : "pointer",
            }}
          >
            {startSession.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Starting...
              </span>
            ) : (
              "Begin Interview"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center justify-between border-b py-4"
      style={{ borderColor: "#bebebe" }}
    >
      <span
        style={{
          fontFamily: sora,
          fontSize: "18px",
          fontWeight: 600,
          color: "#272727",
          letterSpacing: "-0.36px",
          lineHeight: "30px",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: inter,
          fontSize: "18px",
          fontWeight: 500,
          color: "#868686",
          letterSpacing: "-0.36px",
          lineHeight: "28px",
        }}
      >
        {value}
      </span>
    </div>
  );
}
