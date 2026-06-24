"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, VideoOff } from "lucide-react";
import {
  useKiraConfiguration,
  useKiraSession,
  useUploadKiraResponse,
} from "@/services/kira.service";
import { useCamera } from "@/hooks/use-camera";
import { toast } from "sonner";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

type Phase = "prep" | "record";

export default function KiraSessionPage() {
  const params = useParams<{ questionIndex: string }>();
  const router = useRouter();

  const sessionId = params?.questionIndex ?? "";
  const { data: session, isLoading: sessionLoading } = useKiraSession(sessionId);
  const { data: kiraConfig } = useKiraConfiguration();
  const uploadResponse = useUploadKiraResponse(sessionId);

  const {
    videoRef,
    status: cameraStatus,
    error: cameraError,
    startCamera,
    startRecording,
    stopRecording,
    stopCamera,
  } = useCamera();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("prep");
  const [prepLeft, setPrepLeft] = useState(30);
  const [recordLeft, setRecordLeft] = useState(60);

  const response = session?.responses?.[currentIndex];
  const promptText = response?.prompt?.text ?? "Loading question...";
  const prepSeconds =
    kiraConfig?.prepTimeSeconds ?? response?.prompt?.prepTimeSeconds ?? 30;
  const recordSeconds =
    kiraConfig?.responseTimeSeconds ??
    response?.prompt?.responseTimeSeconds ??
    60;
  const total = session?.promptCount ?? 0;
  const displayIndex = currentIndex + 1;
  const isLast = displayIndex === total;

  // Start camera on mount + guarantee teardown on unmount or tab close.
  // Mirrors the mock-interview session page so navigating away (browser back,
  // sidebar Link, tab close) reliably stops the camera light + microphone.
  useEffect(() => {
    startCamera();
    const onBeforeUnload = () => {
      stopCamera();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset timers when currentIndex or session data changes
  useEffect(() => {
    setPhase("prep");
    setPrepLeft(prepSeconds);
    setRecordLeft(recordSeconds);
  }, [currentIndex, prepSeconds, recordSeconds]);

  // Prep countdown
  useEffect(() => {
    if (phase !== "prep") return;
    if (prepLeft <= 0) {
      setPhase("record");
      return;
    }
    const timer = setInterval(() => setPrepLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [phase, prepLeft]);

  // Start recording when phase switches to record and camera is ready
  useEffect(() => {
    if (phase === "record" && (cameraStatus === "previewing" || cameraStatus === "stopped")) {
      startRecording();
    }
  }, [phase, cameraStatus, startRecording]);

  // Record countdown -- auto-stops at 0 (Kira format)
  useEffect(() => {
    if (phase !== "record") return;
    if (recordLeft <= 0) {
      goNext();
      return;
    }
    const timer = setInterval(() => setRecordLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, recordLeft]);

  const goNext = () => {
    // Stop the current recording but KEEP the camera stream alive so the next
    // question can record immediately. Tearing the camera down here (and never
    // restarting it) is what left question 2+ stuck on "Starting camera...".
    // The stream is released on unmount via the cleanup effect (covers the
    // final question's navigation to results, browser back, and tab close).
    const recordedFile = stopRecording();

    const fileToUpload =
      recordedFile ??
      new File([], "recording.webm", { type: "video/webm" });

    if (response) {
      uploadResponse.mutate(
        {
          responseId: response.id,
          file: fileToUpload,
          durationSeconds: recordSeconds - recordLeft,
        },
        {
          onSuccess: () => {
            if (isLast || currentIndex + 1 >= total) {
              router.push(`/kira/results?sessionId=${sessionId}`);
            } else {
              setCurrentIndex((prev) => prev + 1);
            }
          },
          onError: (error) => {
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to upload response",
            );
          },
        },
      );
    } else {
      if (isLast || currentIndex + 1 >= total) {
        router.push(`/kira/results?sessionId=${sessionId}`);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  if (sessionLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-6 py-20">
        <Loader2 size={32} className="animate-spin" style={{ color: "#5450d8" }} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div
        className="rounded-[24px] bg-white p-8 lg:p-10"
        style={{ boxShadow: "0 20px 60px rgba(15, 11, 56, 0.08)" }}
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Left -- question prompt */}
          <div className="flex flex-col justify-center">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-white"
              style={{
                background: "#5450d8",
                fontFamily: inter,
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              {String(displayIndex).padStart(2, "0")}
            </div>
            <h2
              className="mt-5"
              style={{
                fontFamily: sora,
                fontSize: "28px",
                fontWeight: 700,
                color: "#222c44",
                lineHeight: 1.3,
              }}
            >
              {promptText}
            </h2>
          </div>

          {/* Right -- recording panel */}
          <div className="flex flex-col">
            <div className="mb-3 flex items-center justify-between">
              <span
                style={{
                  fontFamily: sora,
                  fontSize: "16px",
                  fontWeight: 700,
                  color: phase === "prep" ? "#9ea1c5" : "#222c44",
                  opacity: phase === "prep" ? 0.5 : 1,
                }}
              >
                Kira Practice
              </span>
              <span
                style={{
                  fontFamily: inter,
                  fontSize: "13px",
                  color: "#9ea1c5",
                  opacity: phase === "prep" ? 0.5 : 1,
                }}
              >
                Question {displayIndex} of {total}
              </span>
            </div>

            <div
              className="border-t pt-4"
              style={{ borderColor: "#ececf5" }}
            />

            <div
              className="relative flex aspect-video items-center justify-center overflow-hidden rounded-[14px]"
              style={{ background: "#1f2937" }}
            >
              {/* Live camera feed */}
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  transform: "scaleX(-1)",
                  display:
                    cameraStatus === "previewing" ||
                    cameraStatus === "recording" ||
                    cameraStatus === "stopped"
                      ? "block"
                      : "none",
                }}
              />

              {/* Camera error state */}
              {cameraStatus === "error" && (
                <div className="flex flex-col items-center gap-2 px-4 text-center">
                  <VideoOff size={36} className="text-white/40" />
                  <p
                    style={{
                      fontFamily: inter,
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    {cameraError}
                  </p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="mt-1 rounded-lg px-3 py-1.5 text-white transition-opacity hover:opacity-90"
                    style={{
                      background: "#5450d8",
                      fontFamily: inter,
                      fontSize: "12px",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Loading state */}
              {(cameraStatus === "idle" || cameraStatus === "requesting") && (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={28} className="animate-spin text-white/40" />
                  <span
                    style={{
                      fontFamily: inter,
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    Starting camera...
                  </span>
                </div>
              )}

              {/* Prep overlay */}
              {phase === "prep" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                  <PrepRing seconds={prepLeft} total={prepSeconds} />
                  <div
                    className="mt-3"
                    style={{
                      fontFamily: sora,
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {prepLeft}s
                  </div>
                  <div
                    style={{
                      fontFamily: inter,
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    Get Ready...
                  </div>
                </div>
              )}

              {/* Recording indicator */}
              {phase === "record" && cameraStatus === "recording" && (
                <span
                  className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1"
                  style={{
                    background: "rgba(15, 11, 56, 0.6)",
                    color: "white",
                    fontFamily: inter,
                    fontSize: "11px",
                    fontWeight: 500,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full"
                    style={{ background: "#ef4444" }}
                  />
                  Rec
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full border"
                  style={{
                    borderColor: "#f97316",
                    color: "#f97316",
                    fontFamily: inter,
                    fontSize: "11px",
                    fontWeight: 600,
                    opacity: phase === "prep" ? 0.5 : 1,
                  }}
                >
                  {phase === "record" ? recordLeft : recordSeconds}
                </span>
                <span
                  style={{
                    fontFamily: inter,
                    fontSize: "13px",
                    color: "#9ea1c5",
                    opacity: phase === "prep" ? 0.5 : 1,
                  }}
                >
                  seconds remaining
                </span>
              </div>

              <button
                type="button"
                onClick={goNext}
                disabled={phase === "prep" || uploadResponse.isPending}
                className="rounded-[10px] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: "#5450d8",
                  color: "white",
                  padding: "10px 18px",
                  fontFamily: inter,
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                  cursor: phase === "prep" ? "not-allowed" : "pointer",
                }}
              >
                {uploadResponse.isPending ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 size={13} className="animate-spin" />
                    Uploading...
                  </span>
                ) : isLast ? (
                  "Submit"
                ) : (
                  "Next Question"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrepRing({ seconds, total }: { seconds: number; total: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = ((total - seconds) / total) * circumference;

  return (
    <svg width="76" height="76" viewBox="0 0 76 76">
      <circle
        cx="38"
        cy="38"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="3"
        strokeDasharray="2 4"
      />
      <circle
        cx="38"
        cy="38"
        r={radius}
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeDasharray={`${progress} ${circumference - progress}`}
        strokeDashoffset={circumference / 4}
        transform="rotate(-90 38 38)"
      />
    </svg>
  );
}
