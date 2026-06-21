"use client";

import type { AuthSession } from "@/data/contracts";
import { Sidebar } from "./components/sidebar";
import { TopBar } from "./components/top-bar";
import { ExplainModal } from "./components/explain-modal";
import { CortexScreen } from "./cortex-screen";
import { useCortexWorkspace } from "./model/use-cortex-workspace";
import { GlobeLoader } from "@/client/components/ui/globe-loader";
import { PatientSelectionScreen } from "./screens/patient-selection-screen";

type CortexAppProps = {
  session: AuthSession;
  onSignOut: () => Promise<void>;
};

export function CortexApp({ session, onSignOut }: CortexAppProps) {
  const workspace = useCortexWorkspace(session);

  if (workspace.loading) {
    return <GlobeLoader label="Loading Cortex..." />;
  }

  if (!workspace.isReady || !workspace.patient) {
    return <PatientSelectionScreen />;
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden", background: "#F5F6F8" }}>
      <Sidebar
        patient={workspace.patient}
        encounter={workspace.encounter}
        onNavigate={workspace.navigate}
        navStyle={workspace.navStyle}
      />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#F5F6F8" }}>
        <TopBar
          listening={workspace.listening}
          voiceSupported={workspace.voiceSupported}
          onToggleListen={workspace.toggleListening}
          onExport={workspace.exportReport}
          onSignOut={onSignOut}
          user={session.user}
          patient={workspace.patient}
          encounter={workspace.encounter}
        />
        <CortexScreen
          workspace={workspace}
          onNavigate={workspace.navigate}
        />
      </main>

      <ExplainModal
        open={workspace.explainOpen}
        onClose={workspace.closeExplanation}
        patientFirstName={workspace.patient?.demographics.name.split(" ")[0]}
        summaryText={workspace.draft?.sections?.summary ?? undefined}
      />
      {workspace.message && (
        <button
          type="button"
          onClick={workspace.clearMessage}
          style={{
            position: "fixed",
            right: 22,
            bottom: 22,
            zIndex: 80,
            border: "1px solid #CFE4DF",
            borderRadius: 10,
            background: "#F3FBF9",
            color: "#0B6B60",
            padding: "11px 14px",
            boxShadow: "0 8px 28px rgba(16,26,39,.14)",
            cursor: "pointer",
            fontSize: 12.5,
          }}
        >
          {workspace.message}
        </button>
      )}
    </div>
  );
}
