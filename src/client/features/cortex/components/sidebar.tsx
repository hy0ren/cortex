"use client";

import type { PatientRecord, Encounter, AuthUser } from "@/data/contracts";
import type { CortexScreen, NavStyle } from "../model/types";
import { patientAgeAndSex, patientInitials } from "../model/history-view";
import { CortexLogo } from "./icons";

type SidebarProps = {
  patient: PatientRecord | null;
  encounter?: Encounter | null;
  onNavigate: (screen: CortexScreen) => void;
  navStyle: (key: CortexScreen) => NavStyle;
  user?: AuthUser | null;
  onSwitchPatient?: () => void;
};

function NavItem({
  label,
  style,
  onClick,
  icon,
  pulse,
}: {
  label: string;
  style: NavStyle;
  onClick: () => void;
  icon: React.ReactNode;
  pulse?: boolean;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="cortex-nav-item"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "11px 12px",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        fontSize: "var(--text-sm)",
        fontWeight: 500,
        background: style.bg,
        color: style.col,
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 8,
          bottom: 8,
          width: 2.5,
          borderRadius: 2,
          background: style.bar,
        }}
      />
      {icon}
      {label}
      {pulse && (
        <span
          style={{
            marginLeft: "auto",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#2F5BD0",
            animation: "pulse-dot 1.4s ease-in-out infinite",
          }}
        />
      )}
    </div>
  );
}

export function Sidebar({ patient, encounter, onNavigate, navStyle, user, onSwitchPatient }: SidebarProps) {
  const initials = patient ? patientInitials(patient.demographics.name) : "—";
  const name = patient?.demographics.name ?? "No patient loaded";
  const meta = patient ? patientAgeAndSex(patient) : "Select a session";

  const doctorName = user?.displayName || "Lena Okafor";
  const doctorInitials = (doctorName
    .replace(/^(Dr\.|Dr)\s+/i, "")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("") || "LO").toUpperCase();

  const formattedDoctorName = doctorName.toLowerCase().startsWith("dr.")
    ? doctorName
    : `Dr. ${doctorName}`;
  return (
    <aside
      style={{
        width: 244,
        flex: "none",
        background: "var(--cortex-nav)",
        display: "flex",
        flexDirection: "column",
        color: "#c9d2de",
      }}
    >
      <div style={{ padding: "var(--space-5) var(--space-5) var(--space-4)", display: "flex", alignItems: "center", gap: 11 }}>
        <CortexLogo size={32} />
        <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, letterSpacing: "-.01em", color: "#fff", lineHeight: 1 }}>
          Cortex
        </div>
      </div>

      <div style={{ padding: "var(--space-3)", display: "flex", flexDirection: "column", gap: 2 }}>
        <NavItem
          label="New session"
          style={navStyle("intake")}
          onClick={() => onNavigate("intake")}
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          }
        />
        <NavItem
          label="Pipeline"
          style={navStyle("pipeline")}
          onClick={() => onNavigate("pipeline")}
          pulse
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="12" r="2.2" />
              <circle cx="18" cy="6" r="2.2" />
              <circle cx="18" cy="18" r="2.2" />
              <path d="M8 11 16 7M8 13l8 4" />
            </svg>
          }
        />
        <NavItem
          label="Report editor"
          style={navStyle("report")}
          onClick={() => onNavigate("report")}
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 3h7l4 4v14H7z" />
              <path d="M14 3v4h4M10 12h5M10 16h5" />
            </svg>
          }
        />
        <NavItem
          label="Patient history"
          style={navStyle("history")}
          onClick={() => onNavigate("history")}
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4" />
              <path d="M12 8v4l3 2" />
            </svg>
          }
        />
      </div>

      <div style={{ marginTop: 18, padding: "0 12px" }}>
        <div
          style={{
            padding: "11px 12px",
            borderRadius: 9,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#1C2738",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 600,
                color: "#9FC9C2",
                flex: "none",
              }}
            >
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#E7ECF3",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {name}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "#6B7789",
                  marginTop: 1,
                }}
              >
                {meta}
              </div>
            </div>
          </div>
        </div>
        {encounter && (
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => window.open(`/patient/${encounter.id}`, "_blank")}
              className="w-full text-left flex items-center justify-between text-xs font-medium text-cortex-fg-subtle hover:text-cortex-fg px-2 py-1.5 rounded-cortex-sm hover:bg-cortex-border-soft transition-colors"
            >
              <span>Open Patient Intake Form</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </button>
          </div>
        )}
        <div style={{ marginTop: encounter ? 4 : 12 }}>
          <button
            onClick={onSwitchPatient}
            className="w-full text-left flex items-center justify-between text-xs font-medium text-cortex-fg-subtle hover:text-cortex-fg px-2 py-1.5 rounded-cortex-sm hover:bg-cortex-border-soft transition-colors"
          >
            <span>Switch Patient</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16V4m0 0L3 8m4-4l4 4m9 4v12m0 0l-4-4m4 4l4-4" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ marginTop: "auto", padding: "var(--space-4) var(--space-4)", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 11px",
            borderRadius: "var(--radius-sm)",
            background: "rgba(14,156,137,0.12)",
            border: "1px solid rgba(14,156,137,0.28)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3fbfac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "#5ccdbb" }}>Synthetic data · No PHI</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: "var(--space-4)",
            paddingTop: "var(--space-3)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "linear-gradient(140deg,#3C4A60,#1C2738)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10.5,
              fontWeight: 600,
              color: "#C9D2DE",
              flex: "none",
            }}
          >
            {doctorInitials}
          </div>
          <div style={{ minWidth: 0, lineHeight: 1.25 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#D6DCE5",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {formattedDoctorName}
            </div>
            <div style={{ fontSize: 10, color: "#6B7789" }}>Clinical Neuropsychologist</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
