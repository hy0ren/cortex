"use client";

import type { CortexScreen as Screen } from "./model/types";
import type { CortexWorkspace } from "./model/use-cortex-workspace";
import { HistoryScreen } from "./screens/history-screen";
import { IntakeScreen } from "./screens/intake-screen";
import { PipelineScreen } from "./screens/pipeline-screen";
import { ReportScreen } from "./screens/report-screen";

type CortexScreenProps = {
  workspace: CortexWorkspace;
  onNavigate: (screen: Screen) => void;
};

export function CortexScreen({ workspace, onNavigate }: CortexScreenProps) {
  if (!workspace.isReady || !workspace.patient || !workspace.draft) {
    return <div style={{ flex: 1, display: "grid", placeItems: "center", color: "#647082" }}>Loading secure workspace…</div>;
  }

  switch (workspace.screen) {
    case "intake":
      return (
        <IntakeScreen
          patient={workspace.patient}
          uploads={workspace.uploads}
          busy={workspace.busy}
          onUpload={workspace.uploadFile}
          onTranscribe={workspace.transcribeFile}
          onGenerate={workspace.startPipeline}
          onSaveDraft={workspace.saveDraft}
        />
      );
    case "report":
      return (
        <ReportScreen
          flags={workspace.flags}
          draft={workspace.draft}
          patient={workspace.patient}
          busy={workspace.busy}
          onResolveFlag={workspace.resolveFlag}
          onOpenExplain={workspace.openExplanation}
          onFinalize={workspace.finalizeDraft}
        />
      );
    case "history":
      return (
        <HistoryScreen
          onGoReport={() => onNavigate("report")}
          onCompare={() => workspace.openExplanation()}
          onOpenEncounter={() => onNavigate("report")}
        />
      );
    case "pipeline":
      return (
        <PipelineScreen
          run={workspace.pipeline}
          busy={workspace.busy}
          onTogglePause={workspace.togglePipeline}
          onGoReport={() => onNavigate("report")}
          onStart={workspace.startPipeline}
        />
      );
  }
}
