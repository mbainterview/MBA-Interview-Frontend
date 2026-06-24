"use client";

import { useCallback, useSyncExternalStore } from "react";
import { diagnosticVideoStore } from "@/lib/diagnostic-video-store";

/**
 * Consumer hook for the persistent diagnostic-video recorder. The recorder
 * itself lives at module scope (see `diagnostic-video-store.ts`) so it
 * survives navigation between question pages — this hook only subscribes a
 * component to its current snapshot.
 */
export function useDiagnosticVideo() {
  const snapshot = useSyncExternalStore(
    diagnosticVideoStore.subscribe,
    diagnosticVideoStore.getSnapshot,
    diagnosticVideoStore.getServerSnapshot,
  );

  // Ref callback that pipes the persistent MediaStream into whichever
  // `<video>` element is currently rendered. Spread on the element as
  // `<video ref={attachVideo} ... />`.
  const attachVideo = useCallback((el: HTMLVideoElement | null) => {
    diagnosticVideoStore.attachVideoElement(el);
  }, []);

  return {
    status: snapshot.status,
    error: snapshot.error,
    elapsed: snapshot.elapsed,
    recordedFile: snapshot.recordedFile,
    attachVideo,
    start: diagnosticVideoStore.start,
    stop: diagnosticVideoStore.stop,
    reset: diagnosticVideoStore.reset,
  };
}
