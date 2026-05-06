"use client";

import { useEffect, useRef, useCallback } from "react";

interface Props {
  submissionId: string;
  enabled:      boolean;
}

type EventType =
  | "EXAM_STARTED"
  | "FACE_MISSING"
  | "MULTIPLE_FACES"
  | "TAB_BLUR"
  | "FULLSCREEN_EXIT"
  | "COPY_ATTEMPT"
  | "EXAM_SUBMITTED";

export default function ProctoringOverlay({ submissionId, enabled }: Props) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track when the last face-missing event was fired to avoid flooding
  const lastFaceEvent = useRef<number>(0);
  const faceApiLoaded = useRef(false);

  const sendEvent = useCallback(
    async (type: EventType, metadata?: Record<string, unknown>) => {
      try {
        await fetch("/api/proctoring/events", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ submissionId, type, metadata }),
        });
      } catch {
        // silently ignore network errors during exams
      }
    },
    [submissionId]
  );

  useEffect(() => {
    if (!enabled) return;

    sendEvent("EXAM_STARTED");

    // ── Tab/window visibility ────────────────────────────────────────────────
    const handleVisibility = () => {
      if (document.hidden) sendEvent("TAB_BLUR");
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // ── Copy/paste detection ─────────────────────────────────────────────────
    const handleCopy = () => sendEvent("COPY_ATTEMPT");
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCopy);

    // ── Fullscreen exit ──────────────────────────────────────────────────────
    const handleFullscreen = () => {
      if (!document.fullscreenElement) sendEvent("FULLSCREEN_EXIT");
    };
    document.addEventListener("fullscreenchange", handleFullscreen);

    // Request fullscreen on start
    document.documentElement.requestFullscreen?.().catch(() => {});

    // ── Camera + face-api.js ─────────────────────────────────────────────────
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        await loadFaceApi();
        startDetection();
      } catch {
        // Camera access denied — still log the attempt but don't crash
        sendEvent("FACE_MISSING", { reason: "camera_denied" });
      }
    }

    async function loadFaceApi() {
      if (faceApiLoaded.current) return;
      try {
        // Dynamically import to keep SSR clean
        const faceapi = await import("@vladmandic/face-api");
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        ]);
        faceApiLoaded.current = true;
      } catch {
        // Models not found — proctoring degrades gracefully
      }
    }

    function startDetection() {
      intervalRef.current = setInterval(async () => {
        if (!videoRef.current || !canvasRef.current || !faceApiLoaded.current) return;
        try {
          const faceapi = await import("@vladmandic/face-api");
          const detections = await faceapi.detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
          );

          const now = Date.now();
          const DEBOUNCE = 10_000; // 10 seconds between face-missing alerts

          if (detections.length === 0) {
            if (now - lastFaceEvent.current > DEBOUNCE) {
              lastFaceEvent.current = now;
              sendEvent("FACE_MISSING", { confidence: 0 });
            }
          } else if (detections.length > 1) {
            if (now - lastFaceEvent.current > DEBOUNCE) {
              lastFaceEvent.current = now;
              sendEvent("MULTIPLE_FACES", { faceCount: detections.length });
            }
          }
        } catch {
          // Detection errors are non-fatal
        }
      }, 3000); // check every 3 seconds
    }

    startCamera();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCopy);
      document.removeEventListener("fullscreenchange", handleFullscreen);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    };
  }, [enabled, sendEvent]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative w-36 h-24 bg-black rounded-xl overflow-hidden border-2 border-sky-400 shadow-lg">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
        />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute top-1 left-1">
          <span className="flex items-center gap-1 text-[10px] text-white bg-red-500 px-1.5 py-0.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </span>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 text-center mt-1">Proctoring active</p>
    </div>
  );
}
