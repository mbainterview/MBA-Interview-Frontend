"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Target,
  Briefcase,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Clock,
  Loader2,
} from "lucide-react";
import { useSchools } from "@/services/schools.service";
import { cn } from "@/lib/utils";

type InterviewType = "school" | "general" | "custom";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

interface TypeOption {
  id: InterviewType;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
}

const TYPES: TypeOption[] = [
  {
    id: "school",
    title: "School-Specific Interview",
    description: "Tailored to your target school's style",
    icon: <Target size={18} />,
    iconBg: "#22c55e",
  },
  {
    id: "general",
    title: "General MBA Interview",
    description: "Common MBA behavioral questions",
    icon: <Briefcase size={18} />,
    iconBg: "#eab308",
  },
  {
    id: "custom",
    title: "Custom Interview",
    description: "Customize topics and difficulty",
    icon: <SettingsIcon size={18} />,
    iconBg: "#f97316",
  },
];

export default function MockInterviewPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<InterviewType>("school");
  const schools = useSchools();

  const handleTypeClick = (type: InterviewType) => {
    setSelected(type);
    if (type === "general") {
      router.push("/mock-interview/start?type=general");
    } else if (type === "custom") {
      router.push("/mock-interview/custom");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <h1
        style={{
          fontFamily: sora,
          fontSize: "28px",
          fontWeight: 600,
          color: "#222c44",
          lineHeight: 1.3,
        }}
      >
        Mock Interview
      </h1>
      <p
        className="mt-1"
        style={{ fontFamily: inter, fontSize: "16px", color: "#808080", lineHeight: 1.4 }}
      >
        Choose your interview type to begin
      </p>

      {/* Type cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        {TYPES.map((type) => {
          const isSelected = selected === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => handleTypeClick(type.id)}
              className="relative flex flex-col gap-5 rounded-[20px] border p-6 text-left transition-all"
              style={{
                background: "white",
                borderColor: isSelected ? "#5450d8" : "transparent",
                boxShadow: isSelected
                  ? "0 10px 30px rgba(84, 80, 216, 0.10)"
                  : "0 4px 14px rgba(15, 11, 56, 0.05)",
                minHeight: "190px",
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-white"
                  style={{ background: type.iconBg }}
                >
                  {type.icon}
                </div>
                {isSelected && (
                  <ChevronDown size={20} style={{ color: "#5450d8" }} />
                )}
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: sora,
                    fontSize: "24px",
                    fontWeight: 600,
                    color: "#272727",
                    lineHeight: 1.25,
                    letterSpacing: "-0.48px",
                  }}
                >
                  {type.title}
                </h3>
                <p
                  className="mt-2"
                  style={{
                    fontFamily: inter,
                    fontSize: "18px",
                    fontWeight: 500,
                    color: "#868686",
                    lineHeight: 1.55,
                    letterSpacing: "-0.36px",
                  }}
                >
                  {type.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* School list — only visible when School-Specific is selected */}
      {selected === "school" && (
        <div
          className="mt-8 rounded-[20px] bg-white p-6"
          style={{ boxShadow: "0 4px 14px rgba(15, 11, 56, 0.05)" }}
        >
          {schools.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2
                size={24}
                className="animate-spin"
                style={{ color: "#5450d8" }}
              />
              <span
                className="ml-2"
                style={{
                  fontFamily: inter,
                  fontSize: "14px",
                  color: "#9ea1c5",
                }}
              >
                Loading schools...
              </span>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {schools.data?.data?.map((school) => (
                <li key={school.id}>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/mock-interview/start?type=school&schoolId=${school.id}`,
                      )
                    }
                    className={cn(
                      "flex w-full items-center justify-between rounded-[20px] px-8 py-6 text-left transition-colors hover:brightness-[0.98]",
                    )}
                    style={{ background: "#f4f4fe" }}
                  >
                    <div className="flex flex-col gap-3">
                      <span
                        style={{
                          fontFamily: sora,
                          fontSize: "20px",
                          fontWeight: 600,
                          color: "#272727",
                          letterSpacing: "-0.4px",
                        }}
                      >
                        {school.name}
                      </span>
                      <div className="flex items-center gap-4">
                        <span
                          className="flex items-center gap-2"
                          style={{
                            fontFamily: inter,
                            fontSize: "16px",
                            color: "#868686",
                          }}
                        >
                          <MessageSquare size={20} style={{ color: "#22c55e" }} />
                          {(school.interviewConfig as any)?.questionCount ?? 8} questions
                        </span>
                        <span
                          className="flex items-center gap-2"
                          style={{
                            fontFamily: inter,
                            fontSize: "16px",
                            color: "#868686",
                          }}
                        >
                          <Clock size={20} style={{ color: "#eab308" }} />
                          {(school.interviewConfig as any)?.perQuestionTimeLimitSeconds ?? 90}s each
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={24} style={{ color: "#5450d8" }} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
