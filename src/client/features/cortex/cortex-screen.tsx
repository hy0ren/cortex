"use client";

import { GlobeLoader } from "@/client/components/ui/globe-loader";
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
    return <GlobeLoader label="Loading..." showBackground={false} />;
  }

  switch (workspace.screen) {
    case "intake":
      return (
        <IntakeScreen
          patient={workspace.patient}
          encounter={workspace.encounter}
          uploads={workspace.uploads}
          busy={workspace.busy}
          onUpload={workspace.uploadFile}
          onTranscribe={workspace.transcribeFile}
          onSaveTranscript={workspace.saveTranscript}
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
          encounter={workspace.encounter}
          busy={workspace.busy}
          onResolveFlag={workspace.resolveFlag}
          onOpenExplain={workspace.openExplanation}
          onFinalize={workspace.finalizeDraft}
          onSaveSections={workspace.saveDraftSections}
        />
      );
    case "history":
      return (
        <HistoryScreen
          patient={workspace.patient}
          draft={workspace.draft}
          onGoReport={() => onNavigate("report")}
        />
      );
    case "pipeline":
      return (
        <PipelineScreen
          run={workspace.pipeline}
          draft={workspace.draft}
          flags={workspace.flags}
          busy={workspace.busy}
          onTogglePause={workspace.togglePipeline}
          onGoReport={() => onNavigate("report")}
          onStart={workspace.startPipeline}
        />
      );
  }
}
