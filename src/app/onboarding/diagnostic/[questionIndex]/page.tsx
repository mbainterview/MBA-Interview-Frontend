"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mic, Type as TypeIcon, Video as VideoIcon } from "lucide-react";
import { toast } from "sonner";
import { DIAGNOSTIC_QUESTIONS } from "@/data/diagnostic-questions";
import { useOnboardingDraft } from "@/hooks/use-onboarding-draft";
import { useMicrophone } from "@/hooks/use-microphone";
import { useDiagnosticVideo } from "@/hooks/use-diagnostic-video";
import {
  useSubmitAndComplete,
  useTranscribeRecording,
  useUploadRecording,
  type BulkAnswerItem,
} from "@/services/interview.service";
import { useCompleteOnboarding } from "@/services/profile.service";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

type ResponseMode = "text" | "audio" | "video";

const TIMER_SECONDS = 90;

export default function DiagnosticQuestionPage() {
  const params = useParams<{ questionIndex: string }>();
  const router = useRouter();
  const { draft, update, clear } = useOnboardingDraft();

  const index = Math.max(
    1,
    Math.min(DIAGNOSTIC_QUESTIONS.length, Number(params?.questionIndex ?? 1)),
  );
  const question = DIAGNOSTIC_QUESTIONS[index - 1];
  const isLast = index === DIAGNOSTIC_QUESTIONS.length;
  const sessionId = draft.diagnostic?.sessionId;

  // The user picked one response modality on the intro screen — it applies to
  // every question for this diagnostic and cannot be changed mid-flow.
  const mode: ResponseMode = draft.diagnostic?.mode ?? "text";

  const previousRecordingKey =
    draft.diagnostic?.answersMeta?.[index]?.recordingKey;
  const previousAnswer = draft.diagnostic?.answers?.[index] ?? "";

  const [textAnswer, setTextAnswer] = useState(previousAnswer);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const [recordingKey, setRecordingKey] = useState<string | null>(
    previousRecordingKey ?? null,
  );
  // `transcript` mirrors the displayed text in audio/video mode so the user
  // can see (and edit) what the backend transcribed before they advance.
  const [transcript, setTranscript] = useState<string>(
    mode !== "text" ? previousAnswer : "",
  );
  const autoStopFiredRef = useRef(false);

  const mic = useMicrophone();
  const diagnosticVideo = useDiagnosticVideo();
  const transcribe = useTranscribeRecording(sessionId ?? "");
  const submitAndComplete = useSubmitAndComplete(sessionId ?? "");
  const uploadRecording = useUploadRecording(sessionId ?? "");
  const completeOnboarding = useCompleteOnboarding();

  const isTranscribing = transcribe.isPending;

  // Bounce back to the intro if the user landed here without an active session
  // OR without having picked a response mode (e.g. opened a question URL
  // directly, or sessionStorage was cleared mid-onboarding).
  useEffect(() => {
    if (!sessionId || !draft.diagnostic?.mode) {
      router.replace("/onboarding/diagnostic");
    }
  }, [sessionId, draft.diagnostic?.mode, router]);

  // Reset per-question state when navigating between questions. Mode itself
  // is fixed for the whole session, so we never touch it here.
  useEffect(() => {
    setSecondsLeft(TIMER_SECONDS);
    autoStopFiredRef.current = false;

    const restoredKey = draft.diagnostic?.answersMeta?.[index]?.recordingKey;
    const restoredAnswer = draft.diagnostic?.answers?.[index] ?? "";

    setTextAnswer(restoredAnswer);
    setTranscript(mode === "audio" ? restoredAnswer : "");
    setRecordingKey(restoredKey ?? null);

    // Tear down any per-question audio capture. The session-wide video
    // recorder is intentionally NOT touched — it persists across navigation.
    mic.stopMicrophone();

    // We only care about index changes; `mode` is stable across questions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Countdown.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  // Audio mode: auto-stop the per-question microphone recording when the 90 s
  // timer hits 0. (Video mode runs one continuous recording managed by the
  // module-scoped store — its lifecycle ends only on final submit.)
  useEffect(() => {
    if (secondsLeft > 0) return;
    if (autoStopFiredRef.current) return;

    if (mode === "audio" && mic.status === "recording") {
      autoStopFiredRef.current = true;
      handleStopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  // Release the microphone if the user navigates away mid-onboarding. The
  // diagnostic video recorder is owned at module scope and outlives this
  // component, so we don't tear it down here — that happens on final submit.
  useEffect(() => {
    return () => {
      mic.stopMicrophone();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCapture = async () => {
    if (mode === "audio") {
      await mic.startMicrophone();
      // Immediately begin recording once permission is granted — matches the
      // "Tap to record" → "Recording…" affordance.
      if (mic.error) return;
      mic.startRecording();
    }
    // Video mode has no per-question capture — recording is already running
    // continuously from the intro screen.
  };

  const handleStopRecording = async () => {
    if (mode !== "audio") return;
    const file = mic.stopRecording();
    if (!file || !sessionId) return;

    try {
      const result = await transcribe.mutateAsync(file);
      setTranscript(result.transcript);
      setRecordingKey(result.recordingKey);
      if (!result.transcript) {
        toast.warning(
          "We couldn't hear any speech in that recording. Your file is saved, but re-record for the best feedback.",
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(
        "We couldn't transcribe your recording. Please try again or switch to text.",
      );
    } finally {
      mic.stopMicrophone();
    }
  };

  const handleReRecord = () => {
    setRecordingKey(null);
    setTranscript("");
    setSecondsLeft(TIMER_SECONDS);
    autoStopFiredRef.current = false;
    void startCapture();
  };

  const canAdvance = useMemo(() => {
    if (isSubmittingAll || isTranscribing) return false;
    if (mode === "text") return textAnswer.trim().length > 0;
    if (mode === "audio") return recordingKey !== null;
    // Video mode: one continuous recording covers every question. The user
    // can always advance — we just want them to spend ~90 s answering on
    // camera before clicking Next.
    return diagnosticVideo.status === "recording" || diagnosticVideo.status === "stopped";
  }, [
    isSubmittingAll,
    isTranscribing,
    mode,
    textAnswer,
    recordingKey,
    diagnosticVideo.status,
  ]);

  const handleNext = async () => {
    if (!sessionId || !canAdvance) return;

    // For video mode, every turn shares the same session-level recording and
    // there's no per-turn transcript. We persist a placeholder so the bulk-
    // submit DTO (which requires non-empty answers) doesn't reject the
    // request — the actual signal lives in the uploaded session video.
    const answerText =
      mode === "text"
        ? textAnswer.trim()
        : mode === "audio"
          ? transcript.trim()
          : "[Video response]";
    const meta =
      mode === "text"
        ? { mode: "text" as const }
        : mode === "audio"
          ? { mode: "audio" as const, recordingKey: recordingKey ?? undefined }
          : { mode: "video" as const };

    const nextAnswers = {
      ...(draft.diagnostic?.answers ?? {}),
      [index]: answerText,
    };
    const nextMeta = {
      ...(draft.diagnostic?.answersMeta ?? {}),
      [index]: meta,
    };

    if (!isLast) {
      update({
        diagnostic: {
          ...(draft.diagnostic ?? {}),
          sessionId,
          answers: nextAnswers,
          answersMeta: nextMeta,
        },
      });
      router.push(`/onboarding/diagnostic/${index + 1}`);
      return;
    }

    // ── Final question: complete the session ───────────────────────────────

    setIsSubmittingAll(true);

    // In video mode, stop the single continuous recording before submitting
    // so the user's camera light goes off as soon as they tap Submit.
    let sessionVideoFile: File | null = null;
    if (mode === "video") {
      sessionVideoFile = await diagnosticVideo.stop();
    }

    const payload: BulkAnswerItem[] = Object.keys(nextAnswers)
      .map((k) => Number(k))
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b)
      .map((qIdx) => {
        const text = nextAnswers[qIdx] ?? "";
        const m = nextMeta[qIdx];
        const item: BulkAnswerItem = {
          turnIndex: qIdx - 1,
          answer: text.trim() || "[Video response]",
        };
        if (m?.mode && m.mode !== "text") item.responseMode = m.mode;
        if (m?.recordingKey) item.recordingKey = m.recordingKey;
        return item;
      });

    if (payload.length > 0) {
      try {
        await submitAndComplete.mutateAsync({ answers: payload });
      } catch {
        /* non-fatal — still mark onboarding complete locally */
      }
    }

    // Upload the full session video AFTER the session has been transitioned
    // to COMPLETED by /submit-and-complete — the /recording endpoint
    // explicitly requires that state.
    if (mode === "video" && sessionVideoFile) {
      try {
        await uploadRecording.mutateAsync(sessionVideoFile);
      } catch (err) {
        // We've already marked the session complete; surface the failure but
        // don't block the user from continuing.
        console.error(err);
        toast.error(
          "We saved your answers but couldn't upload your video. Our team will follow up.",
        );
      }
    }

    try {
      await completeOnboarding.mutateAsync();
    } catch {
      /* server may not have the endpoint yet — non-fatal */
    }

    update({
      diagnostic: {
        ...(draft.diagnostic ?? {}),
        sessionId,
        answers: nextAnswers,
        answersMeta: nextMeta,
        completedAt: new Date().toISOString(),
      },
    });

    // Belt-and-suspenders: release any lingering MediaStream tracks now that
    // we're done with the diagnostic, even if `stop()` raced or threw.
    diagnosticVideo.reset();
    clear();
    router.push("/dashboard");
    setIsSubmittingAll(false);
  };

  const isUploading = uploadRecording.isPending;
  const isBusy = isSubmittingAll || isTranscribing || isUploading;

  // ── Rendering helpers ─────────────────────────────────────────────────────

  const audioPreviewUrl = useMemo(
    () =>
      mode === "audio" && mic.recordedFile
        ? URL.createObjectURL(mic.recordedFile)
        : null,
    [mode, mic.recordedFile],
  );

  // Revoke object URLs on change.
  useEffect(() => {
    return () => {
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    };
  }, [audioPreviewUrl]);

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center px-4 py-12"
      style={{ background: "#eef0ff" }}
    >
      <div
        className="w-full max-w-260 rounded-[24px] bg-white p-8 lg:p-10"
        style={{ boxShadow: "0 20px 60px rgba(15, 11, 56, 0.10)" }}
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left — question prompt */}
          <div className="flex flex-col justify-center">
            <span
              style={{
                fontFamily: inter,
                fontSize: "13px",
                color: "#9999a5",
              }}
            >
              Question {index}
            </span>
            <h2
              className="mt-2"
              style={{
                fontFamily: sora,
                fontSize: "24px",
                fontWeight: 700,
                color: "#222c44",
                lineHeight: 1.35,
              }}
            >
              {question.prompt}
            </h2>
          </div>

          {/* Right — response panel */}
          <div className="flex flex-col">
            <div className="mb-3 flex items-center justify-between">
              <ModeIndicator mode={mode} />
              <span
                style={{
                  fontFamily: inter,
                  fontSize: "13px",
                  color: "#9999a5",
                }}
              >
                Question {index} of {DIAGNOSTIC_QUESTIONS.length}
              </span>
            </div>

            <div
              className="border-t pt-4"
              style={{ borderColor: "#ececf5" }}
            />

            {mode === "video" && (
              <VideoModeContinuous
                attachVideo={diagnosticVideo.attachVideo}
                status={diagnosticVideo.status}
                elapsed={diagnosticVideo.elapsed}
                error={diagnosticVideo.error}
                isLast={isLast}
                onRetryStart={diagnosticVideo.start}
              />
            )}

            {mode === "audio" && (
              <AudioMode
                status={mic.status}
                elapsed={mic.elapsed}
                error={mic.error}
                level={mic.level}
                previewUrl={audioPreviewUrl}
                recordingKey={recordingKey}
                isTranscribing={isTranscribing}
                onStart={startCapture}
                onStop={handleStopRecording}
                onReRecord={handleReRecord}
                transcript={transcript}
                onTranscriptChange={setTranscript}
              />
            )}

            {mode === "text" && (
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your answer…"
                className="w-full resize-none focus:border-[#5450d8] focus:outline-none"
                style={{
                  minHeight: "200px",
                  borderRadius: "14px",
                  border: "1px solid #d9d9d9",
                  padding: "16px",
                  fontFamily: inter,
                  fontSize: "14px",
                  color: "#272727",
                  background: "white",
                }}
              />
            )}

            {/* Timer */}
            <div className="mt-4 flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full border"
                style={{
                  borderColor: "#f97316",
                  color: "#f97316",
                  fontFamily: inter,
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                {Math.max(0, secondsLeft)}
              </span>
              <span
                style={{
                  fontFamily: inter,
                  fontSize: "13px",
                  color: "#9999a5",
                }}
              >
                seconds remaining
              </span>
            </div>
          </div>
        </div>

        {/* Footer action */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance}
            className="rounded-[14px] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: "#5450d8",
              color: "white",
              padding: "14px 28px",
              fontFamily: inter,
              fontSize: "15px",
              fontWeight: 500,
              border: "none",
              cursor: !canAdvance ? "not-allowed" : "pointer",
            }}
          >
            {isBusy
              ? isTranscribing
                ? "Transcribing…"
                : isUploading
                  ? "Uploading video…"
                  : "Submitting…"
              : isLast
                ? "Submit & Go to Dashboard"
                : "Next Question"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Read-only mode indicator (mode is chosen once on the intro screen) ────

function ModeIndicator({ mode }: { mode: ResponseMode }) {
  const Icon =
    mode === "text" ? TypeIcon : mode === "audio" ? Mic : VideoIcon;
  const label =
    mode === "text"
      ? "Text response"
      : mode === "audio"
        ? "Audio response"
        : "Video response";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1.5"
      style={{
        background: "#5450d8",
        color: "white",
        fontFamily: inter,
        fontSize: "13px",
        fontWeight: 500,
      }}
      aria-label={`Response mode: ${label}`}
    >
      <Icon size={14} />
      {label}
    </span>
  );
}

// ─── Mode-specific subcomponents ───────────────────────────────────────────

interface VideoModeContinuousProps {
  attachVideo: (el: HTMLVideoElement | null) => void;
  status: "idle" | "requesting" | "recording" | "stopped" | "error";
  elapsed: number;
  error: string | null;
  isLast: boolean;
  onRetryStart: () => Promise<void>;
}

/**
 * Live-preview-only video panel for the diagnostic. There is exactly one
 * MediaRecorder running for the entire 10-question flow (owned at module
 * scope by `diagnosticVideoStore`); each per-question screen just shows the
 * persistent stream and a small recording indicator. No per-question stop /
 * re-record / transcribe UI here — those interactions belong to the final
 * Submit button.
 */
function VideoModeContinuous({
  attachVideo,
  status,
  elapsed,
  error,
  isLast,
  onRetryStart,
}: VideoModeContinuousProps) {
  if (status === "error") {
    return (
      <PermissionError
        icon={<VideoIcon size={32} className="text-red-500" />}
        message={
          error ??
          "We couldn't access your camera. Please grant permission and try again."
        }
        onRetry={() => {
          void onRetryStart();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative aspect-video overflow-hidden rounded-[14px]"
        style={{ background: "#1f2937" }}
      >
        <video
          ref={attachVideo}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover"
        />
        {status === "recording" && (
          <span
            className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-red-500 px-2 py-1"
            style={{ fontSize: "10px", color: "white" }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            REC · {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, "0")}
          </span>
        )}
        {(status === "idle" || status === "requesting") && (
          <div className="absolute inset-0 flex items-center justify-center">
            <VideoIcon size={42} className="text-white/30" />
          </div>
        )}
      </div>
      <p
        style={{
          fontFamily: inter,
          fontSize: "12px",
          color: "#5b5b6b",
          lineHeight: 1.5,
        }}
      >
        {isLast
          ? "Recording continues — tap Submit when you're done to upload your full session video."
          : "Recording continues — answer the question, then tap Next. Your camera stays on for every question."}
      </p>
    </div>
  );
}

interface AudioModeProps {
  status: ReturnType<typeof useMicrophone>["status"];
  elapsed: number;
  level: number;
  error: string | null;
  previewUrl: string | null;
  recordingKey: string | null;
  isTranscribing: boolean;
  onStart: () => void;
  onStop: () => void;
  onReRecord: () => void;
  transcript: string;
  onTranscriptChange: (next: string) => void;
}

function AudioMode({
  status,
  elapsed,
  level,
  error,
  previewUrl,
  recordingKey,
  isTranscribing,
  onStart,
  onStop,
  onReRecord,
  transcript,
  onTranscriptChange,
}: AudioModeProps) {
  if (status === "error") {
    return (
      <PermissionError
        icon={<Mic size={32} className="text-red-500" />}
        message={
          error ??
          "We couldn't access your microphone. Please grant permission and try again."
        }
        onRetry={onStart}
      />
    );
  }

  if (recordingKey && previewUrl) {
    return (
      <div className="flex flex-col gap-3">
        <audio src={previewUrl} controls className="w-full" />
        <TranscriptEditor
          value={transcript}
          onChange={onTranscriptChange}
          placeholder="Transcript will appear here…"
        />
        <button
          type="button"
          onClick={onReRecord}
          className="self-start rounded-[10px] px-3 py-1.5"
          style={{
            background: "#edecfd",
            color: "#5450d8",
            fontFamily: inter,
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          Re-record
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex aspect-video items-center justify-center rounded-[14px]"
        style={{ background: "#f3f1ff" }}
      >
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onStart}
            disabled={isTranscribing || status === "recording"}
            className="flex h-16 w-16 items-center justify-center rounded-full transition-transform hover:scale-105 disabled:opacity-60"
            style={{
              background: status === "recording" ? "#dc2626" : "#5450d8",
            }}
            aria-label={
              status === "recording" ? "Recording" : "Start recording"
            }
          >
            {status === "recording" ? (
              <span className="h-4 w-4 rounded-sm bg-white" />
            ) : (
              <Mic size={26} className="text-white" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <LevelMeter level={level} active={status === "recording"} />
            <span
              style={{ fontFamily: inter, fontSize: "12px", color: "#5b5b6b" }}
            >
              {status === "recording"
                ? `Recording · ${elapsed}s`
                : status === "previewing"
                  ? "Microphone ready"
                  : isTranscribing
                    ? "Transcribing…"
                    : "Tap to record"}
            </span>
          </div>
          {status === "recording" && (
            <button
              type="button"
              onClick={onStop}
              className="rounded-[10px] px-3.5 py-1.5"
              style={{
                background: "#dc2626",
                color: "white",
                fontFamily: inter,
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              Stop
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function LevelMeter({ level, active }: { level: number; active: boolean }) {
  const pct = Math.max(0, Math.min(1, level)) * 100;
  return (
    <div
      className="h-1.5 w-24 overflow-hidden rounded-full"
      style={{ background: "rgba(84, 80, 216, 0.18)" }}
    >
      <div
        className="h-full transition-[width] duration-75"
        style={{
          width: active ? `${pct}%` : "0%",
          background: active ? "#5450d8" : "transparent",
        }}
      />
    </div>
  );
}

interface TranscriptEditorProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}

function TranscriptEditor({
  value,
  onChange,
  placeholder,
}: TranscriptEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full resize-none focus:border-[#5450d8] focus:outline-none"
      style={{
        minHeight: "100px",
        borderRadius: "14px",
        border: "1px solid #d9d9d9",
        padding: "12px",
        fontFamily: inter,
        fontSize: "13px",
        color: "#272727",
        background: "white",
      }}
    />
  );
}

interface PermissionErrorProps {
  icon: React.ReactNode;
  message: string;
  onRetry: () => void;
}

function PermissionError({ icon, message, onRetry }: PermissionErrorProps) {
  return (
    <div
      className="flex aspect-video flex-col items-center justify-center gap-3 rounded-[14px] p-4 text-center"
      style={{ background: "#fff3f3", border: "1px solid #fecaca" }}
    >
      {icon}
      <p
        style={{
          fontFamily: inter,
          fontSize: "13px",
          color: "#7f1d1d",
          maxWidth: "320px",
        }}
      >
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-[10px] px-3.5 py-1.5"
        style={{
          background: "#5450d8",
          color: "white",
          fontFamily: inter,
          fontSize: "13px",
          fontWeight: 500,
        }}
      >
        Try again
      </button>
    </div>
  );
}
