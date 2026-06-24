"use client";

/**
 * Module-scoped store for the single continuous video recording that spans
 * the entire diagnostic flow (intro → Q1 → … → Q10 → submit).
 *
 * Why module-scoped rather than React state: in App-Router Next.js the
 * `[questionIndex]/page.tsx` component unmounts every time the user navigates
 * to the next question. A component-level `useState` (or `useCamera`) would
 * therefore lose its `MediaStream` and `MediaRecorder` between questions —
 * the camera light would blink off and the recording chunks would be
 * discarded. By owning the recorder at module scope we keep one continuous
 * stream alive across all navigations, attaching it to whichever `<video>`
 * element is currently mounted.
 *
 * Subscribers re-render via `useSyncExternalStore` in the consumer hook.
 */

export type DiagnosticVideoStatus =
  | "idle"
  | "requesting"
  | "recording"
  | "stopped"
  | "error";

export interface DiagnosticVideoSnapshot {
  status: DiagnosticVideoStatus;
  error: string | null;
  /** Seconds since recording started; ticks while status === "recording". */
  elapsed: number;
  /** Final File handle, only set once `stop()` finishes. */
  recordedFile: File | null;
}

function pickVideoMimeType(): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  for (const t of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) {
      return t;
    }
  }
  return "video/webm";
}

let stream: MediaStream | null = null;
let recorder: MediaRecorder | null = null;
let chunks: Blob[] = [];
let timer: ReturnType<typeof setInterval> | null = null;
let videoEl: HTMLVideoElement | null = null;

let snapshot: DiagnosticVideoSnapshot = {
  status: "idle",
  error: null,
  elapsed: 0,
  recordedFile: null,
};

const listeners = new Set<() => void>();

function emit(next: Partial<DiagnosticVideoSnapshot>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((l) => l());
}

function bindStreamToCurrentVideoEl() {
  if (!videoEl || !stream) return;
  if (videoEl.srcObject === stream) return;
  videoEl.srcObject = stream;
  videoEl.muted = true;
  videoEl.playsInline = true;
  void videoEl.play().catch(() => {
    /* element may not be ready yet — caller re-binds on ref */
  });
}

export const diagnosticVideoStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot(): DiagnosticVideoSnapshot {
    return snapshot;
  },

  getServerSnapshot(): DiagnosticVideoSnapshot {
    return snapshot;
  },

  /**
   * Hand the persistent stream to a freshly-mounted `<video>` element. Pass
   * `null` on unmount so we don't leak a reference.
   */
  attachVideoElement(el: HTMLVideoElement | null) {
    videoEl = el;
    bindStreamToCurrentVideoEl();
  },

  async start(): Promise<void> {
    if (snapshot.status === "recording" || snapshot.status === "requesting") {
      return;
    }

    diagnosticVideoStore.reset({ keepError: false });
    emit({ status: "requesting", error: null });

    try {
      const fresh = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      stream = fresh;
      bindStreamToCurrentVideoEl();

      const mime = pickVideoMimeType();
      // Container MIME without codec parameters. We give MediaRecorder the
      // full codec-qualified MIME so it knows how to encode, but stamp the
      // resulting Blob / File with the plain container MIME (`video/webm`).
      // Multipart-form parsers occasionally choke on the comma inside
      // `codecs=vp9,opus`, which manifests downstream as a magic-byte
      // mismatch on the server.
      const cleanMime = mime.split(";")[0] || mime;
      const r = new MediaRecorder(fresh, { mimeType: mime });
      r.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      r.onstop = () => {
        const blob = new Blob(chunks, { type: cleanMime });
        const ext = cleanMime.includes("mp4") ? "mp4" : "webm";
        const file = new File([blob], `diagnostic.${ext}`, { type: cleanMime });
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
        emit({ status: "stopped", recordedFile: file });
      };
      r.start(1000);
      recorder = r;

      const startedAt = Date.now();
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        emit({ elapsed: Math.floor((Date.now() - startedAt) / 1000) });
      }, 1000);

      emit({ status: "recording", elapsed: 0, recordedFile: null });
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access and try again."
          : err instanceof DOMException && err.name === "NotFoundError"
            ? "No camera found. Please connect a camera and try again."
            : "Failed to access camera. Please check your device settings.";
      emit({ status: "error", error: message });
    }
  },

  /**
   * Stop the recorder and return the final File. Idempotent — calling twice
   * yields the same File. Resolves once the `onstop` event has fired.
   */
  async stop(): Promise<File | null> {
    if (snapshot.status === "stopped" && snapshot.recordedFile) {
      return snapshot.recordedFile;
    }
    if (!recorder || recorder.state === "inactive") {
      // Already stopped or never started.
      return snapshot.recordedFile;
    }

    return new Promise<File | null>((resolve) => {
      const r = recorder!;
      const originalOnStop = r.onstop;
      r.onstop = (ev) => {
        if (typeof originalOnStop === "function") {
          (originalOnStop as (e: Event) => void).call(r, ev);
        }
        // `snapshot.recordedFile` is set inside the original onstop above.
        // Release the MediaStream so the browser's camera/mic indicator goes
        // off as soon as the user stops, before we kick off the upload.
        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
          stream = null;
        }
        if (videoEl) {
          videoEl.srcObject = null;
        }
        recorder = null;
        resolve(snapshot.recordedFile);
      };
      try {
        r.stop();
      } catch {
        resolve(snapshot.recordedFile);
      }
    });
  },

  /**
   * Tear everything down and return to idle. Used when the user backs out to
   * the intro or completes the flow.
   */
  reset(opts: { keepError?: boolean } = {}) {
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch {
        /* ignore */
      }
    }
    recorder = null;

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    if (videoEl) {
      videoEl.srcObject = null;
    }
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    chunks = [];

    snapshot = {
      status: "idle",
      error: opts.keepError ? snapshot.error : null,
      elapsed: 0,
      recordedFile: null,
    };
    listeners.forEach((l) => l());
  },
};
