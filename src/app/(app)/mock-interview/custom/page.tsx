"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sliders } from "lucide-react";
type DifficultyLevel = "beginner" | "intermediate" | "advanced";
type InterviewLength = 5 | 10 | 15;
type FollowUpDepth = "light" | "medium" | "deep";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

const labelStyle: React.CSSProperties = {
  fontFamily: sora,
  fontSize: "14px",
  fontWeight: 600,
  color: "#222c44",
};

function SegmentedGroup<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div
      className="inline-flex rounded-[12px] p-1"
      style={{ background: "#eef0ff" }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className="rounded-[10px] px-6 py-2.5 transition-colors"
            style={{
              background: active ? "#5450d8" : "transparent",
              color: active ? "white" : "#222c44",
              fontFamily: inter,
              fontSize: "14px",
              fontWeight: active ? 600 : 500,
              border: "none",
              cursor: "pointer",
              minWidth: "92px",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function CustomInterviewPage() {
  return (
    <Suspense fallback={null}>
      <CustomInterviewInner />
    </Suspense>
  );
}

function CustomInterviewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const schoolId = searchParams.get("schoolId") ?? "";

  const [difficulty, setDifficulty] =
    useState<DifficultyLevel>("intermediate");
  const [length, setLength] = useState<InterviewLength>(10);
  const [followUp, setFollowUp] = useState<FollowUpDepth>("light");

  const handleBegin = () => {
    const params = new URLSearchParams({
      type: "custom",
      difficulty,
      length: String(length),
      followUp,
      ...(schoolId ? { schoolId } : {}),
    });
    router.push(`/mock-interview/start?${params.toString()}`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <Link
        href="/mock-interview"
        className="inline-flex items-center gap-1.5"
        style={{
          fontFamily: inter,
          fontSize: "14px",
          color: "#5b5b6b",
        }}
      >
        <ArrowLeft size={14} />
        Back
      </Link>

      <div className="mt-6 flex justify-center">
        <div
          className="w-full max-w-130 rounded-[24px] bg-white p-8"
          style={{ boxShadow: "0 20px 60px rgba(15, 11, 56, 0.08)" }}
        >
          <div className="flex flex-col items-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-white"
              style={{ background: "#5450d8" }}
            >
              <Sliders size={22} />
            </div>
            <h1
              className="mt-4 text-center"
              style={{
                fontFamily: sora,
                fontSize: "24px",
                fontWeight: 700,
                color: "#222c44",
              }}
            >
              Interview Generation Rules
            </h1>
          </div>

          <div className="mt-7 flex flex-col gap-5">
            <div className="flex flex-col gap-2.5">
              <label style={labelStyle}>Difficulty Level</label>
              <SegmentedGroup<DifficultyLevel>
                value={difficulty}
                onChange={setDifficulty}
                options={[
                  { value: "beginner", label: "Beginner" },
                  { value: "intermediate", label: "Intermediate" },
                  { value: "advanced", label: "Advanced" },
                ]}
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label style={labelStyle}>Interview Length (Questions)</label>
              <SegmentedGroup<InterviewLength>
                value={length}
                onChange={setLength}
                options={[
                  { value: 5, label: "05" },
                  { value: 10, label: "10" },
                  { value: 15, label: "15" },
                ]}
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label style={labelStyle}>Follow-up Depth</label>
              <SegmentedGroup<FollowUpDepth>
                value={followUp}
                onChange={setFollowUp}
                options={[
                  { value: "light", label: "Light" },
                  { value: "medium", label: "Medium" },
                  { value: "deep", label: "Deep" },
                ]}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleBegin}
            className="mt-8 w-full rounded-[14px] transition-opacity hover:opacity-90"
            style={{
              background: "#5450d8",
              color: "white",
              padding: "16px 24px",
              fontFamily: inter,
              fontSize: "15px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Begin Interview
          </button>
        </div>
      </div>
    </div>
  );
}
