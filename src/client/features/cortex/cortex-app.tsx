"use client";

import { Sidebar } from "./components/sidebar";
import { TopBar } from "./components/top-bar";
import { ExplainModal } from "./components/explain-modal";
import { CortexScreen } from "./cortex-screen";
import { useCortexWorkspace } from "./model/use-cortex-workspace";

export function CortexApp() {
  const workspace = useCortexWorkspace();

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden", background: "#F5F6F8" }}>
      <Sidebar
        onNavigate={workspace.navigate}
        navStyle={workspace.navStyle}
      />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#F5F6F8" }}>
        <TopBar
          listening={workspace.listening}
          onToggleListen={workspace.toggleListening}
        />
        <CortexScreen
          screen={workspace.screen}
          flags={workspace.flags}
          onNavigate={workspace.navigate}
          onResolveFlag={workspace.resolveFlag}
          onOpenExplain={workspace.openExplanation}
        />
      </main>

      <ExplainModal
        open={workspace.explainOpen}
        onClose={workspace.closeExplanation}
      />
    </div>
  );
}
