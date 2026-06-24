"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, VideoOff, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  useSession,
  useSendHeartbeat,
  useUploadRecording,
  useCompleteSession,
} from "@/services/interview.service";
import { useCamera } from "@/hooks/use-camera";
import { toast } from "sonner";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

const TIMER_SECONDS = 60;

function formatTime(seconds: number) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function MockInterviewSessionPage() {
  return (
    <Suspense fallback={null}>
      <SessionInner />
    </Suspense>
  );
}

function SessionInner() {
  const params = useParams<{ questionIndex: string }>();
  const router = useRouter();

  const sessionId = params?.questionIndex ?? "";

  const session = useSession(sessionId);
  const sendHeartbeat = useSendHeartbeat(sessionId);
  const uploadRecording = useUploadRecording(sessionId);
  const completeSession = useCompleteSession(sessionId);

  const {
    videoRef,
    status: cameraStatus,
    error: cameraError,
    startCamera,
    startRecording,
    stopRecording,
    stopCamera,
    elapsed,
  } = useCamera();

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [isRecording, setIsRecording] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const activeRef = useRef(true);

  // Start camera on mount + guarantee teardown on unmount or tab close.
  // The hook itself also self-cleans on unmount, but the page-level guard
  // covers any consumer-side timers (activeRef) and gives the browser a
  // synchronous chance to release the device before navigation completes.
  useEffect(() => {
    if (activeRef.current) {
      startCamera();
    }
    const onBeforeUnload = () => {
      activeRef.current = false;
      stopCamera();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      activeRef.current = false;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sessionData = session.data;
  const plannedQuestions = sessionData?.plannedQuestions ?? [];
  const turns = sessionData?.turns ?? [];

  // For general/custom sessions, questions come from AI-generated turns
  const hasPlannedQuestions = plannedQuestions.length > 0;
  const defaultQuestionCount = 5;
  const total = hasPlannedQuestions
    ? plannedQuestions.length
    : sessionData?.totalQuestions || defaultQuestionCount;

  // Get current question text — from planned questions or from turns
  const questionText = hasPlannedQuestions
    ? plannedQuestions[currentQuestionIdx]?.text ?? ""
    : turns[currentQuestionIdx]?.aiQuestion ?? "";

  const isLastQuestion = currentQuestionIdx >= total - 1;

  // Only show "Loading questions..." if no questions available at all
  const isWaitingForQuestions =
    !!sessionData && !questionText && !session.isLoading;

  // Start recording once camera is ready (continuous recording)
  useEffect(() => {
    if (activeRef.current && cameraStatus === "previewing" && !isRecording) {
      startRecording();
      setIsRecording(true);
    }
  }, [cameraStatus, isRecording, startRecording]);

  // Reset timer when question changes
  useEffect(() => {
    setSecondsLeft(TIMER_SECONDS);
  }, [currentQuestionIdx]);

  // Countdown timer — auto-advance when time runs out
  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!isCompleting) handleNext();
      return;
    }
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  // Heartbeat every 30s
  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(() => {
      sendHeartbeat.mutate();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleBack = useCallback(() => {
    activeRef.current = false;
    stopCamera();
    window.location.href = "/mock-interview";
  }, [stopCamera]);

  const handleNext = () => {
    if (isCompleting) return;

    if (isLastQuestion) {
      // Last question — show confirmation before completing
      setShowConfirm(true);
      return;
    }

    // All questions (school or general) are pre-loaded — navigate locally
    setCurrentQuestionIdx((prev) => prev + 1);
  };

  const handleComplete = () => {
    setIsCompleting(true);

    // Stop the continuous recording and get the full video
    const fullVideo = stopRecording();
    stopCamera();
    setIsRecording(false);

    // Mark session as completed
    completeSession.mutate(undefined, {
      onSuccess: () => {
        // Upload the full interview video
        if (fullVideo && fullVideo.size > 0) {
          uploadRecording.mutate(fullVideo, {
            onSettled: () => {
              router.push(`/mock-interview/results?sessionId=${sessionId}`);
            },
          });
        } else {
          router.push(`/mock-interview/results?sessionId=${sessionId}`);
        }
      },
      onError: (error: Error) => {
        setIsCompleting(false);
        toast.error(error.message || "Failed to complete session");
      },
    });
  };

  if (session.isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-6 py-20">
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: "#5450d8" }}
        />
        <span
          className="ml-3"
          style={{ fontFamily: inter, fontSize: "15px", color: "#9ea1c5" }}
        >
          Loading session...
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <div
        className="rounded-[20px] bg-white overflow-hidden"
        style={{ boxShadow: "0 20px 60px rgba(15, 11, 56, 0.08)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left — question */}
          <div className="flex flex-col justify-center p-10">
            <div
              className="flex h-[60px] w-[60px] items-center justify-center rounded-full text-white"
              style={{
                background: "#5450d8",
                fontFamily: inter,
                fontSize: "24px",
                fontWeight: 600,
              }}
            >
              {String(currentQuestionIdx + 1).padStart(2, "0")}
            </div>

            {isWaitingForQuestions ? (
              <div className="mt-8 flex items-center gap-3">
                <Loader2
                  size={28}
                  className="animate-spin"
                  style={{ color: "#5450d8" }}
                />
                <span
                  style={{
                    fontFamily: inter,
                    fontSize: "18px",
                    color: "#868686",
                  }}
                >
                  Loading questions...
                </span>
              </div>
            ) : (
              <h2
                className="mt-8"
                style={{
                  fontFamily: sora,
                  fontSize: "44px",
                  fontWeight: 600,
                  color: "#272727",
                  lineHeight: 1.3,
                  letterSpacing: "-0.88px",
                }}
              >
                {questionText}
              </h2>
            )}
          </div>

          {/* Right — recording panel */}
          <div className="flex flex-col p-8">
            <div
              className="rounded-[20px] border p-6"
              style={{ borderColor: "#eeeeee" }}
            >
              <div className="flex items-center justify-between">
                <span
                  style={{
                    fontFamily: sora,
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#272727",
                    lineHeight: 1.3,
                  }}
                >
                  Mock Interview
                </span>
                <span
                  style={{
                    fontFamily: inter,
                    fontSize: "20px",
                    color: "#868686",
                    lineHeight: 1.3,
                  }}
                >
                  Question {currentQuestionIdx + 1} of {total}
                </span>
              </div>

              <div
                className="mt-4 border-t"
                style={{ borderColor: "#eeeeee" }}
              />

              <div
                className="relative mt-4 flex aspect-video items-center justify-center overflow-hidden rounded-[30px]"
                style={{ background: "#d9d9d9" }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{
                    transform: "scaleX(-1)",
                    display:
                      cameraStatus === "previewing" || cameraStatus === "recording"
                        ? "block"
                        : "none",
                  }}
                />

                {cameraStatus === "error" && (
                  <div className="flex flex-col items-center gap-2 px-4 text-center">
                    <VideoOff size={36} className="text-gray-400" />
                    <p style={{ fontFamily: inter, fontSize: "13px", color: "#868686" }}>
                      {cameraError}
                    </p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="mt-1 rounded-lg px-3 py-1.5 text-white transition-opacity hover:opacity-90"
                      style={{ background: "#5450d8", fontFamily: inter, fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer" }}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {(cameraStatus === "idle" || cameraStatus === "requesting") && (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={28} className="animate-spin text-gray-400" />
                    <span style={{ fontFamily: inter, fontSize: "12px", color: "#868686" }}>
                      Starting camera...
                    </span>
                  </div>
                )}

                {/* Recording indicator */}
                {isRecording && (
                  <span
                    className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border px-2.5 py-2"
                    style={{
                      background: "rgba(255, 255, 255, 0.4)",
                      borderColor: "rgba(255, 255, 255, 0.4)",
                      backdropFilter: "blur(9px)",
                      fontFamily: inter,
                      fontSize: "10px",
                    }}
                  >
                    <span className="h-3.5 w-3.5 rounded-full" style={{ background: "#fc5a33" }} />
                    <span style={{ color: "#fc5a33" }}>Rec</span>
                    <span style={{ color: "#272727" }}>{formatTime(elapsed)}</span>
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-[20px] border"
                    style={{
                      borderColor: "#fc5a33",
                      background: "rgba(252, 90, 51, 0.1)",
                      fontFamily: inter,
                      fontSize: "16px",
                      color: "#fc5a33",
                      lineHeight: 1.3,
                    }}
                  >
                    {secondsLeft}
                  </div>
                  <span style={{ fontFamily: inter, fontSize: "16px", color: "#868686", lineHeight: 1.3 }}>
                    seconds remaining
                  </span>
                </div>

                {isRecording && (
                  <span
                    className="flex items-center gap-2 rounded-[10px] px-4 py-2"
                    style={{ background: "rgba(252, 90, 51, 0.1)", fontFamily: inter, fontSize: "14px", fontWeight: 500, color: "#fc5a33" }}
                  >
                    <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: "#fc5a33" }} />
                    Recording
                  </span>
                )}
              </div>
            </div>

            {/* Footer actions */}
            <div className="mt-6 flex justify-end gap-5">
              <button
                type="button"
                onClick={handleBack}
                className="rounded-[16px] border transition-colors"
                style={{
                  borderColor: "#5450d8",
                  background: "white",
                  color: "#5450d8",
                  padding: "16px 31px",
                  fontFamily: inter,
                  fontSize: "20px",
                  fontWeight: 500,
                  cursor: "pointer",
                  width: "200px",
                  textAlign: "center",
                  lineHeight: "18px",
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={isCompleting || !questionText}
                className="rounded-[16px] transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{
                  background: "#5450d8",
                  color: "white",
                  padding: "18px 32px",
                  fontFamily: inter,
                  fontSize: "20px",
                  fontWeight: 500,
                  border: "none",
                  cursor: isCompleting ? "not-allowed" : "pointer",
                  width: "200px",
                  textAlign: "center",
                  lineHeight: "28px",
                }}
              >
                {isCompleting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Finishing...
                  </span>
                ) : isLastQuestion ? (
                  "Submit"
                ) : (
                  "Next"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Submission Confirmation */}
      <Dialog
        open={showConfirm}
        onOpenChange={(open) => {
          if (!isCompleting) setShowConfirm(open);
        }}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-[420px]">
          <div className="flex flex-col items-center px-4 py-6">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "#eef0ff" }}
            >
              <AlertCircle size={28} style={{ color: "#5450d8" }} />
            </div>
            <h2
              className="mt-4"
              style={{
                fontFamily: sora,
                fontSize: "20px",
                fontWeight: 700,
                color: "#222c44",
              }}
            >
              Submit Interview?
            </h2>
            <p
              className="mt-2 text-center"
              style={{
                fontFamily: inter,
                fontSize: "14px",
                color: "#9ea1c5",
                lineHeight: 1.6,
              }}
            >
              You are about to submit your interview recording for AI analysis.
              This action cannot be undone.
            </p>
            <div className="mt-6 flex w-full gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isCompleting}
                className="flex-1 rounded-[12px] border transition-colors hover:bg-[#f5f4ff] disabled:opacity-60"
                style={{
                  borderColor: "#5450d8",
                  background: "white",
                  color: "#5450d8",
                  padding: "12px 0",
                  fontFamily: inter,
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: isCompleting ? "not-allowed" : "pointer",
                }}
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  handleComplete();
                }}
                disabled={isCompleting}
                className="flex-1 rounded-[12px] transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{
                  background: "#5450d8",
                  color: "white",
                  padding: "12px 0",
                  fontFamily: inter,
                  fontSize: "14px",
                  fontWeight: 600,
                  border: "none",
                  cursor: isCompleting ? "not-allowed" : "pointer",
                }}
              >
                {isCompleting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Yes, Submit"
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
