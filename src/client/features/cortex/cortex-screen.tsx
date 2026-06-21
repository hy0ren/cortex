import type { CortexScreen as Screen, GliaFlag } from "./model/types";
import { HistoryScreen } from "./screens/history-screen";
import { IntakeScreen } from "./screens/intake-screen";
import { PipelineScreen } from "./screens/pipeline-screen";
import { ReportScreen } from "./screens/report-screen";

type CortexScreenProps = {
  screen: Screen;
  flags: GliaFlag[];
  onNavigate: (screen: Screen) => void;
  onResolveFlag: (id: string) => void;
  onOpenExplain: () => void;
};

export function CortexScreen({
  screen,
  flags,
  onNavigate,
  onResolveFlag,
  onOpenExplain,
}: CortexScreenProps) {
  switch (screen) {
    case "intake":
      return <IntakeScreen onGoPipeline={() => onNavigate("pipeline")} />;
    case "report":
      return (
        <ReportScreen
          flags={flags}
          onResolveFlag={onResolveFlag}
          onOpenExplain={onOpenExplain}
        />
      );
    case "history":
      return <HistoryScreen onGoReport={() => onNavigate("report")} />;
    case "pipeline":
      return <PipelineScreen onGoReport={() => onNavigate("report")} />;
  }
}
