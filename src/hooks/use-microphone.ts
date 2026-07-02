"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MicrophoneStatus =
  | "idle"
  | "requesting"
  | "previewing"
  | "recording"
  | "stopped"
  | "error";

interface UseMicrophoneOptions {
  mimeType?: string;
}

interface UseMicrophoneReturn {
  status: MicrophoneStatus;
  error: string | null;
  /** 0..1 instantaneous RMS-ish level for a visual meter. */
  level: number;
  startMicrophone: () => Promise<void>;
  startRecording: () => void;
  stopRecording: () => File | null;
  stopMicrophone: () => void;
  recordedFile: File | null;
  elapsed: number;
}

function getPreferredMimeType(): string {
  // Safari iOS does NOT support audio/webm — it can only record audio/mp4.
  // Chrome/Firefox prefer audio/webm with Opus.
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg",
  ];
  for (const t of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) {
      return t;
    }
  }
  return "audio/webm";
}

/**
 * Audio-only recording lifecycle with permission handling, browser-tab mic
 * indicator hygiene, and a coarse level meter for the UI. Sibling of
 * `useCamera` — same status state machine, different media constraints.
 */
export function useMicrophone(options: UseMicrophoneOptions = {}): UseMicrophoneReturn {
  const { mimeType } = options;

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const meterRafRef = useRef<number | null>(null);

  const [status, setStatus] = useState<MicrophoneStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0);

  const stopMicrophone = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (meterRafRef.current !== null) {
      cancelAnimationFrame(meterRafRef.current);
      meterRafRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try {
        recorderRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    recorderRef.current = null;

    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch {
        /* ignore */
      }
      analyserRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        void audioCtxRef.current.close();
      } catch {
        /* ignore */
      }
      audioCtxRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setStatus("idle");
    setElapsed(0);
    setLevel(0);
  }, []);

  const startMeter = useCallback((stream: MediaStream) => {
    const Ctx =
      typeof window !== "undefined"
        ? (window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext)
        : undefined;
    if (!Ctx) return;
    const ctx = new Ctx();
    audioCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.fftSize);
    const tick = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteTimeDomainData(data);
      // RMS over the window, normalised 0..1
      let sumSquares = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sumSquares += v * v;
      }
      const rms = Math.sqrt(sumSquares / data.length);
      // Scale a bit so even a quiet voice produces a visible meter.
      setLevel(Math.min(1, rms * 2.4));
      meterRafRef.current = requestAnimationFrame(tick);
    };
    meterRafRef.current = requestAnimationFrame(tick);
  }, []);

  const startMicrophone = useCallback(async () => {
    try {
      stopMicrophone();
      setStatus("requesting");
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      streamRef.current = stream;
      startMeter(stream);

      setStatus("previewing");
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone permission denied. Please allow microphone access and try again."
          : err instanceof DOMException && err.name === "NotFoundError"
            ? "No microphone found. Please connect a microphone and try again."
            : "Failed to access microphone. Please check your device settings.";
      setError(message);
      setStatus("error");
    }
  }, [startMeter, stopMicrophone]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    // Fully tear down any previous recorder before starting a new one so its
    // trailing flush can't bleed into this recording.
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try { recorderRef.current.stop(); } catch { /* ignore */ }
    }

    setRecordedFile(null);
    setElapsed(0);

    const selectedMime = mimeType ?? getPreferredMimeType();
    // Stamp the Blob/File with the bare container MIME (`audio/webm`) so
    // multipart uploads don't carry codec parameters. Multer's parser is
    // tolerant of `audio/webm;codecs=opus` (single codec, no comma) but we
    // mirror the video path's behavior for safety + consistency.
    const cleanMime = selectedMime.split(";")[0] || selectedMime;
    const recorder = new MediaRecorder(streamRef.current, { mimeType: selectedMime });

    // Bind chunks to THIS recorder via a closure-local array. The final
    // `ondataavailable` from a stopped recorder fires asynchronously and could
    // otherwise land at index 0 of the next recording's buffer (see
    // use-camera.ts) — corrupting the container header. Per-recorder arrays
    // keep each recording's bytes self-contained.
    const chunks: Blob[] = [];
    chunksRef.current = chunks;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: cleanMime });
      const ext = cleanMime.includes("mp4")
        ? "mp4"
        : cleanMime.includes("ogg")
          ? "ogg"
          : "webm";
      const file = new File([blob], `recording.${ext}`, { type: cleanMime });
      setRecordedFile(file);
      setStatus("stopped");
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    recorder.start(1000);
    recorderRef.current = recorder;
    setStatus("recording");

    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, [mimeType]);

  const stopRecording = useCallback((): File | null => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    if (chunksRef.current.length > 0) {
      const selectedMime = mimeType ?? getPreferredMimeType();
      const cleanMime = selectedMime.split(";")[0] || selectedMime;
      const blob = new Blob(chunksRef.current, { type: cleanMime });
      const ext = cleanMime.includes("mp4")
        ? "mp4"
        : cleanMime.includes("ogg")
          ? "ogg"
          : "webm";
      const file = new File([blob], `recording.${ext}`, { type: cleanMime });
      setRecordedFile(file);
      setStatus("stopped");
      return file;
    }
    return null;
  }, [mimeType]);

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        try {
          recorderRef.current.stop();
        } catch {
          /* ignore */
        }
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (meterRafRef.current !== null) {
        cancelAnimationFrame(meterRafRef.current);
        meterRafRef.current = null;
      }
      if (analyserRef.current) {
        try {
          analyserRef.current.disconnect();
        } catch {
          /* ignore */
        }
        analyserRef.current = null;
      }
      if (audioCtxRef.current) {
        try {
          void audioCtxRef.current.close();
        } catch {
          /* ignore */
        }
        audioCtxRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return {
    status,
    error,
    level,
    startMicrophone,
    startRecording,
    stopRecording,
    stopMicrophone,
    recordedFile,
    elapsed,
  };
}
