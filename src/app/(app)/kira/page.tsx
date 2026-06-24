"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Video, Clock, Mic, Play, Loader2 } from "lucide-react";
import { useKiraConfiguration, useStartKiraSession } from "@/services/kira.service";
import { toast } from "sonner";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

export default function KiraIntroPage() {
  const router = useRouter();
  const startSession = useStartKiraSession();
  const { data: config } = useKiraConfiguration();
  const prepSeconds = config?.prepTimeSeconds ?? 30;
  const respSeconds = config?.responseTimeSeconds ?? 60;

  const handleStart = () => {
    startSession.mutate(
      config?.interviewLength ? { promptCount: config.interviewLength } : {},
      {
        onSuccess: (session) => {
          router.push(`/kira/session/${session.id}`);
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : "Failed to start session",
          );
        },
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <Link
        href="/dashboard"
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
          className="w-full max-w-110 rounded-[24px] bg-white p-8"
          style={{ boxShadow: "0 20px 60px rgba(15, 11, 56, 0.08)" }}
        >
          <div className="flex flex-col items-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-white"
              style={{ background: "#5450d8" }}
            >
              <Video size={22} />
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
              Kira Video Essay Practice
            </h1>
            <p
              className="mt-2 text-center"
              style={{
                fontFamily: inter,
                fontSize: "14px",
                color: "#9ea1c5",
                maxWidth: "320px",
              }}
            >
              Practice the Kira Talent assessment format used by top MBA
              programs.
            </p>
          </div>

          <div
            className="mt-6 rounded-[14px] border p-4"
            style={{ borderColor: "#ececf5" }}
          >
            <h3
              className="mb-3"
              style={{
                fontFamily: sora,
                fontSize: "14px",
                fontWeight: 700,
                color: "#222c44",
              }}
            >
              How it works:
            </h3>
            <Item
              icon={<Clock size={14} style={{ color: "#5450d8" }} />}
              bold={`${prepSeconds} seconds`}
              text="to read and think"
            />
            <Item
              icon={<Mic size={14} style={{ color: "#5450d8" }} />}
              bold={`${respSeconds} seconds`}
              text="to record your answer"
            />
            <Item
              icon={<Play size={14} style={{ color: "#5450d8" }} />}
              text="Recording stops automatically"
            />
          </div>

          <button
            type="button"
            onClick={handleStart}
            disabled={startSession.isPending}
            className="mt-6 w-full rounded-[14px] transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{
              background: "#5450d8",
              color: "white",
              padding: "16px 24px",
              fontFamily: inter,
              fontSize: "15px",
              fontWeight: 600,
              border: "none",
              cursor: startSession.isPending ? "not-allowed" : "pointer",
            }}
          >
            {startSession.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Creating Session...
              </span>
            ) : (
              "Start Kira Practice"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Item({
  icon,
  bold,
  text,
}: {
  icon: React.ReactNode;
  bold?: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      {icon}
      <span style={{ fontFamily: inter, fontSize: "13px", color: "#272727" }}>
        {bold && <strong>{bold}</strong>} {text}
      </span>
    </div>
  );
}
