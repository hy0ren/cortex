"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AuthSession,
  GliaFlag,
  PipelineRun,
  ReportWorkspace,
  UploadedAsset,
} from "@/data/contracts";
import { apiRequest } from "@/client/lib/api-client";
import type { CortexScreen, NavStyle } from "./types";

/** Minimal shape of the Web Speech API's SpeechRecognition — not in lib.dom.d.ts. */
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

const VOICE_SUPPORTED =
  typeof window !== "undefined" &&
  Boolean((window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition);

export const VOICE_COMMANDS = [
  { phrase: "open test results", description: "Jump to the report's Test Results section" },
  { phrase: "read summary to patient", description: "Open the plain-language explanation for the patient" },
  { phrase: "go to pipeline", description: "Switch to the pipeline view" },
] as const;

export function useCortexWorkspace(session: AuthSession) {
  const [screen, setScreen] = useState<CortexScreen>("pipeline");
  const [listening, setListening] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [workspace, setWorkspace] = useState<ReportWorkspace | null>(null);
  const [pipeline, setPipeline] = useState<PipelineRun | null>(null);
  const [uploads, setUploads] = useState<UploadedAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const refreshWorkspace = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams(window.location.search);
    const encounterId = params.get("encounterId");
    const query = encounterId ? `?encounterId=${encounterId}` : "";
    const result = await apiRequest<{ workspace: ReportWorkspace | null }>(`/api/workspace${query}`);
    setWorkspace(result.workspace);
    if (result.workspace) {
      setPipeline(result.workspace.pipeline);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshWorkspace().catch((error) => {
      setMessage(error instanceof Error ? error.message : "Unable to load workspace");
    });
  }, [refreshWorkspace]);

  useEffect(() => {
    if (!pipeline || pipeline.phase !== "running") return;
    const bandMode = workspace?.capabilities.band === "configured" && Boolean(pipeline.bandRoomId);

    const timer = window.setInterval(() => {
      if (bandMode) {
        apiRequest<{ run: PipelineRun }>(`/api/pipeline/${pipeline.id}`)
          .then(({ run }) => {
            setPipeline(run);
            if (run.phase === "complete") {
              setMessage("Report generation complete. Glia review is ready.");
              refreshWorkspace().catch(() => undefined);
            }
          })
          .catch((error) => setMessage(error instanceof Error ? error.message : "Pipeline update failed"));
        return;
      }

      apiRequest<{ run: PipelineRun }>(`/api/pipeline/${pipeline.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "advance" }),
      })
        .then(({ run }) => {
          setPipeline(run);
          if (run.phase === "complete") {
            setMessage("Report generation complete. Glia review is ready.");
            refreshWorkspace().catch(() => undefined);
          }
        })
        .catch((error) => setMessage(error instanceof Error ? error.message : "Pipeline update failed"));
    }, 1400);
    return () => window.clearInterval(timer);
  }, [pipeline, refreshWorkspace, workspace?.capabilities.band]);

  useEffect(() => {
    if (!listening || !VOICE_SUPPORTED) return;

    const Recognition = ((window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike })
      .SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition)!;
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const lastIndex = event.results.length - 1;
      const transcript = event.results[lastIndex]?.[0]?.transcript?.toLowerCase().trim() ?? "";
      if (!transcript) return;

      if (transcript.includes("open test results")) {
        setScreen("report");
        window.requestAnimationFrame(() => {
          window.setTimeout(() => {
            document.getElementById("section-test-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 150);
        });
        setMessage("Voice command: opened Test Results.");
      } else if (transcript.includes("read summary")) {
        setExplainOpen(true);
        setMessage("Voice command: opened patient summary.");
      } else if (transcript.includes("go to pipeline") || transcript.includes("open pipeline")) {
        setScreen("pipeline");
        setMessage("Voice command: switched to pipeline.");
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognition.start();
    };

    recognitionRef.current = recognition;
    recognition.start();

    return () => {
      recognitionRef.current = null;
      recognition.onend = null;
      recognition.stop();
    };
  }, [listening]);

  const navStyle = useCallback(
    (key: CortexScreen): NavStyle => {
      const active = screen === key;
      return {
        bg: active ? "rgba(255,255,255,0.07)" : "transparent",
        bar: active ? "#0E9C89" : "transparent",
        col: active ? "#FFFFFF" : "#909BAA",
      };
    },
    [screen]
  );

  const runAction = useCallback(async <T,>(
    action: () => Promise<T>,
    successMessage: string
  ): Promise<T | null> => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await action();
      setMessage(successMessage);
      return result;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action failed");
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  const startPipeline = useCallback(async () => {
    if (!workspace) return;
    const result = await runAction(
      () => apiRequest<{ run: PipelineRun }>("/api/pipeline", {
        method: "POST",
        body: JSON.stringify({
          patientId: workspace.patient.id,
          draftId: workspace.draft.id,
          encounterId: workspace.encounter?.id,
        }),
      }),
      "Pipeline started."
    );
    if (result) {
      setPipeline(result.run);
      setScreen("pipeline");
    }
  }, [runAction, workspace]);

  const togglePipeline = useCallback(async () => {
    if (!pipeline) return;
    const action = pipeline.phase === "paused" ? "resume" : "pause";
    const result = await runAction(
      () => apiRequest<{ run: PipelineRun }>(`/api/pipeline/${pipeline.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      }),
      action === "pause" ? "Pipeline paused." : "Pipeline resumed."
    );
    if (result) setPipeline(result.run);
  }, [pipeline, runAction]);

  const saveDraft = useCallback(async () => {
    if (!workspace) return;
    await runAction(
      () => apiRequest(`/api/drafts/${workspace.draft.id}`, {
        method: "PATCH",
        body: JSON.stringify({ sections: workspace.draft.sections }),
      }),
      "Draft saved."
    );
  }, [runAction, workspace]);

  const saveDraftSections = useCallback(async (sections: Record<string, string>) => {
    if (!workspace) return;
    await runAction(
      () => apiRequest(`/api/drafts/${workspace.draft.id}`, {
        method: "PATCH",
        body: JSON.stringify({ sections }),
      }),
      "Draft saved."
    );
  }, [runAction, workspace]);

  const finalizeDraft = useCallback(async () => {
    if (!workspace) return;
    const result = await runAction(
      () => apiRequest<{ draft: ReportWorkspace["draft"] }>(`/api/drafts/${workspace.draft.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "finalized" }),
      }),
      "Report finalized."
    );
    if (result) setWorkspace({ ...workspace, draft: result.draft });
  }, [runAction, workspace]);

  const resolveFlag = useCallback(async (id: string, resolution: "confirmed" | "dismissed") => {
    if (!workspace) return;
    const result = await runAction(
      () => apiRequest<{ draft: ReportWorkspace["draft"] }>(`/api/drafts/${workspace.draft.id}`, {
        method: "PATCH",
        body: JSON.stringify({ flagId: id, flagResolution: resolution }),
      }),
      resolution === "confirmed" ? "Flag confirmed and cleared." : "Flag dismissed."
    );
    if (result) {
      setWorkspace({
        ...workspace,
        draft: result.draft,
        flags: workspace.flags.filter((flag) => flag.id !== id),
      });
    }
  }, [runAction, workspace]);

  const uploadFile = useCallback(async (file: File) => {
    const form = new FormData();
    form.set("file", file);
    if (workspace?.encounter) {
      form.set("encounterId", workspace.encounter.id);
    }
    const result = await runAction(
      () => apiRequest<{ asset: UploadedAsset }>("/api/uploads", {
        method: "POST",
        body: form,
      }),
      `${file.name} attached.`
    );
    if (result) setUploads((current) => [...current, result.asset]);
  }, [runAction, workspace]);

  const transcribeFile = useCallback(async (file: File): Promise<string> => {
    const form = new FormData();
    form.set("file", file);
    if (workspace?.encounter) {
      form.set("encounterId", workspace.encounter.id);
    }
    const result = await runAction(
      () => apiRequest<{ result: { transcript: string }; mode: "configured" | "demo" }>("/api/transcribe", {
        method: "POST",
        body: form,
      }),
      "Visit audio transcribed."
    );
    return result?.result.transcript ?? "";
  }, [runAction]);

  const exportReport = useCallback(() => {
    const article = document.querySelector("[data-report-document]");
    if (!article) return;
    const blob = new Blob([article.textContent ?? ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "cortex-neuropsychological-report.txt";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Report exported.");
  }, []);

  const flags = useMemo<GliaFlag[]>(() => workspace?.flags ?? [], [workspace?.flags]);
  const patient = workspace?.patient ?? null;
  const encounter = workspace?.encounter ?? null;
  const draft = workspace?.draft ?? null;
  const isReady = Boolean(workspace);

  return useMemo(() => ({
    session,
    screen,
    loading,
    navigate: setScreen,
    listening,
    voiceSupported: VOICE_SUPPORTED,
    toggleListening: () => setListening((current) => !current),
    explainOpen,
    openExplanation: () => setExplainOpen(true),
    closeExplanation: () => setExplainOpen(false),
    flags,
    patient,
    encounter,
    draft,
    pipeline,
    uploads,
    busy,
    message,
    clearMessage: () => setMessage(null),
    isReady,
    resolveFlag,
    navStyle,
    startPipeline,
    togglePipeline,
    saveDraft,
    saveDraftSections,
    finalizeDraft,
    uploadFile,
    transcribeFile,
    exportReport,
    refreshWorkspace,
  }), [
    busy, draft, encounter, explainOpen, exportReport, finalizeDraft, flags, isReady,
    listening, loading, message, navStyle, patient, pipeline, refreshWorkspace,
    resolveFlag, saveDraft, saveDraftSections, screen, session, startPipeline, togglePipeline,
    transcribeFile, uploadFile, uploads,
  ]);
}

export type CortexWorkspace = ReturnType<typeof useCortexWorkspace>;
