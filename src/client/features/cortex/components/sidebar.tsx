"use client";

import type { CortexScreen, NavStyle } from "../model/types";
import { CortexLogo } from "./icons";

type SidebarProps = {
  onNavigate: (screen: CortexScreen) => void;
  navStyle: (key: CortexScreen) => NavStyle;
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
        padding: "9px 12px",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 13.5,
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

export function Sidebar({ onNavigate, navStyle }: SidebarProps) {
  return (
    <aside
      style={{
        width: 244,
        flex: "none",
        background: "#0B1220",
        display: "flex",
        flexDirection: "column",
        color: "#C9D2DE",
      }}
    >
      <div style={{ padding: "22px 20px 18px", display: "flex", alignItems: "center", gap: 11 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "linear-gradient(140deg,#0E9C89,#2F5BD0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
          }}
        >
          <CortexLogo />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-.01em", color: "#fff", lineHeight: 1 }}>
            Cortex
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9.5,
              letterSpacing: ".14em",
              color: "#5E6B7E",
              marginTop: 3,
            }}
          >
            NEUROPSYCH COPILOT
          </div>
        </div>
      </div>

      <div style={{ padding: "6px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9.5,
            letterSpacing: ".13em",
            color: "#4B576A",
            padding: "12px 12px 7px",
          }}
        >
          WORKSPACE
        </div>

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
            fontFamily: "var(--font-mono)",
            fontSize: 9.5,
            letterSpacing: ".13em",
            color: "#4B576A",
            padding: "8px 12px 9px",
          }}
        >
          ACTIVE PATIENT
        </div>
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
              EH
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
                Eleanor M. Hayes
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "#6B7789",
                  marginTop: 1,
                }}
              >
                69F · MRN SYN‑4471
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "auto", padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 10px",
            borderRadius: 7,
            background: "rgba(14,156,137,0.10)",
            border: "1px solid rgba(14,156,137,0.22)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3FBFAC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#5CCDBB" }}>Synthetic data · No PHI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 9, padding: "0 4px" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#5E6B7E" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" />
          </svg>
          <span style={{ fontSize: 10.5, color: "#6B7789" }}>PHI de‑identified on‑device</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 14,
            paddingTop: 13,
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
            LO
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
              Dr. Lena Okafor
            </div>
            <div style={{ fontSize: 10, color: "#6B7789" }}>Clinical Neuropsychologist</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
