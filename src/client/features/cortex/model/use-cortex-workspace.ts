"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AuthSession,
  GliaFlag,
  PipelineRun,
  ReportWorkspace,
  UploadedAsset,
} from "@/data/contracts";
import { apiRequest } from "@/client/lib/api-client";
import type { CortexScreen, NavStyle } from "./types";

export function useCortexWorkspace(session: AuthSession) {
  const [screen, setScreen] = useState<CortexScreen>("pipeline");
  const [listening, setListening] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const [workspace, setWorkspace] = useState<ReportWorkspace | null>(null);
  const [pipeline, setPipeline] = useState<PipelineRun | null>(null);
  const [uploads, setUploads] = useState<UploadedAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refreshWorkspace = useCallback(async () => {
    const result = await apiRequest<{ workspace: ReportWorkspace }>("/api/workspace");
    setWorkspace(result.workspace);
    setPipeline(result.workspace.pipeline);
  }, []);

  useEffect(() => {
    refreshWorkspace().catch((error) => {
      setMessage(error instanceof Error ? error.message : "Unable to load workspace");
    });
  }, [refreshWorkspace]);

  useEffect(() => {
    if (!pipeline || pipeline.phase !== "running") return;
    const timer = window.setInterval(() => {
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
  }, [pipeline, refreshWorkspace]);

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

  const resolveFlag = useCallback(async (id: string) => {
    if (!workspace) return;
    const result = await runAction(
      () => apiRequest<{ draft: ReportWorkspace["draft"] }>(`/api/drafts/${workspace.draft.id}`, {
        method: "PATCH",
        body: JSON.stringify({ flagId: id }),
      }),
      "Review item cleared."
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
    const result = await runAction(
      () => apiRequest<{ asset: UploadedAsset }>("/api/uploads", {
        method: "POST",
        body: form,
      }),
      `${file.name} attached.`
    );
    if (result) setUploads((current) => [...current, result.asset]);
  }, [runAction]);

  const transcribeFile = useCallback(async (file: File): Promise<string> => {
    const form = new FormData();
    form.set("file", file);
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
  const draft = workspace?.draft ?? null;
  const isReady = Boolean(workspace);

  return useMemo(() => ({
    session,
    screen,
    navigate: setScreen,
    listening,
    toggleListening: () => setListening((current) => !current),
    explainOpen,
    openExplanation: () => setExplainOpen(true),
    closeExplanation: () => setExplainOpen(false),
    flags,
    patient,
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
    finalizeDraft,
    uploadFile,
    transcribeFile,
    exportReport,
    refreshWorkspace,
  }), [
    busy, draft, explainOpen, exportReport, finalizeDraft, flags, isReady,
    listening, message, navStyle, patient, pipeline, refreshWorkspace,
    resolveFlag, saveDraft, screen, session, startPipeline, togglePipeline,
    transcribeFile, uploadFile, uploads,
  ]);
}

export type CortexWorkspace = ReturnType<typeof useCortexWorkspace>;
