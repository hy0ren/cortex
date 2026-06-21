"use client";

import { useCallback, useState } from "react";
import type { CortexScreen, GliaFlag, NavStyle } from "./types";
import { INITIAL_FLAGS } from "./mock-data";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { PipelineScreen } from "./screens/pipeline-screen";
import { IntakeScreen } from "./screens/intake-screen";
import { ReportScreen } from "./screens/report-screen";
import { HistoryScreen } from "./screens/history-screen";
import { ExplainModal } from "./explain-modal";

export function CortexApp() {
  const [screen, setScreen] = useState<CortexScreen>("pipeline");
  const [listening, setListening] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const [flags, setFlags] = useState<GliaFlag[]>(INITIAL_FLAGS);

  const navStyle = useCallback(
    (key: CortexScreen): NavStyle => {
      const on = screen === key;
      return {
        bg: on ? "rgba(255,255,255,0.07)" : "transparent",
        bar: on ? "#0E9C89" : "transparent",
        col: on ? "#FFFFFF" : "#909BAA",
      };
    },
    [screen]
  );

  const resolveFlag = (id: string) => {
    setFlags((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden", background: "#F5F6F8" }}>
      <Sidebar screen={screen} onNavigate={setScreen} navStyle={navStyle} />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#F5F6F8" }}>
        <TopBar listening={listening} onToggleListen={() => setListening((v) => !v)} />

        {screen === "pipeline" && <PipelineScreen onGoReport={() => setScreen("report")} />}
        {screen === "intake" && <IntakeScreen onGoPipeline={() => setScreen("pipeline")} />}
        {screen === "report" && (
          <ReportScreen
            flags={flags}
            onResolveFlag={resolveFlag}
            onOpenExplain={() => setExplainOpen(true)}
          />
        )}
        {screen === "history" && <HistoryScreen onGoReport={() => setScreen("report")} />}
      </main>

      <ExplainModal open={explainOpen} onClose={() => setExplainOpen(false)} />
    </div>
  );
}
