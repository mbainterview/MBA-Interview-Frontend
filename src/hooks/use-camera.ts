"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraStatus =
  | "idle"
  | "requesting"
  | "previewing"
  | "recording"
  | "stopped"
  | "error";

interface UseCameraOptions {
  mimeType?: string;
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  error: string | null;
  startCamera: () => Promise<void>;
  startRecording: () => void;
  stopRecording: () => File | null;
  stopCamera: () => void;
  recordedFile: File | null;
  elapsed: number;
}

function getPreferredMimeType(): string {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  for (const t of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
  }
  return "video/webm";
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const { mimeType } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const stopCamera = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try { recorderRef.current.stop(); } catch { /* ignore */ }
    }
    recorderRef.current = null;

    // Kill stream from ref
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // Also kill whatever the <video> element holds (catches orphaned streams)
    if (videoRef.current) {
      const vs = videoRef.current.srcObject as MediaStream | null;
      if (vs) {
        vs.getTracks().forEach((t) => t.stop());
      }
      videoRef.current.srcObject = null;
    }

    setStatus("idle");
    setElapsed(0);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      // Kill any previous stream first
      stopCamera();

      setStatus("requesting");
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }

      setStatus("previewing");
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access and try again."
          : err instanceof DOMException && err.name === "NotFoundError"
            ? "No camera found. Please connect a camera and try again."
            : "Failed to access camera. Please check your device settings.";
      setError(message);
      setStatus("error");
    }
  }, [stopCamera]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    // Make sure any previous recorder is fully torn down before we spin up a
    // new one, so its trailing flush can't interfere with this recording.
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try { recorderRef.current.stop(); } catch { /* ignore */ }
    }

    setRecordedFile(null);
    setElapsed(0);

    const selectedMime = mimeType ?? getPreferredMimeType();

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: selectedMime,
    });

    // Strip codec parameters when stamping the Blob/File MIME so multipart
    // uploads don't carry `video/webm;codecs=vp9,opus` — the comma trips
    // some upstream parsers and causes the server-side magic-byte check to
    // fail on an otherwise-valid WebM body.
    const cleanMime = selectedMime.split(";")[0] || selectedMime;

    // Bind the chunk buffer to THIS recorder via a closure-local array. When a
    // recorder is stopped, the browser fires one last `ondataavailable` (the
    // encoder flush) asynchronously — which can arrive after the next question
    // has already started recording. Pushing to `chunksRef.current` (read at
    // push time) let that trailing, header-less chunk land at index 0 of the
    // next recording's buffer, so its blob no longer began with the WebM EBML
    // header and the server's magic-byte check rejected it ("Invalid file
    // format — expected WebM or MP4 video"). Writing to a per-recorder array
    // makes each recording's bytes self-contained.
    const chunks: Blob[] = [];
    chunksRef.current = chunks;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: cleanMime });
      const ext = cleanMime.includes("mp4") ? "mp4" : "webm";
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
      const ext = cleanMime.includes("mp4") ? "mp4" : "webm";
      const file = new File([blob], `recording.${ext}`, { type: cleanMime });
      setRecordedFile(file);
      setStatus("stopped");
      return file;
    }
    return null;
  }, [mimeType]);

  // Belt-and-suspenders unmount cleanup. Covers cases where the consumer
  // navigates away without calling stopCamera() — e.g. browser back/forward,
  // Next.js client-side route change, tab close. The MediaStream tracks are
  // what actually keep the camera light + microphone indicator on.
  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        try { recorderRef.current.stop(); } catch { /* ignore */ }
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return {
    videoRef,
    status,
    error,
    startCamera,
    startRecording,
    stopRecording,
    stopCamera,
    recordedFile,
    elapsed,
  };
}
