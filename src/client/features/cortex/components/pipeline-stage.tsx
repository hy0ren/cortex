import type { ReactNode } from "react";
import { ConnectorArrow } from "./icons";

type AgentCardProps = {
  step: string;
  name: string;
  role: string;
  summary: ReactNode;
  footer: string;
  status: string;
  variant?: "done" | "running" | "queued";
};

export function AgentCard({
  step,
  name,
  role,
  summary,
  footer,
  status,
  variant = "done",
}: AgentCardProps) {
  const isRunning = variant === "running";
  const isQueued = variant === "queued";
  const stepColor = isRunning || step === "03" ? "#2F5BD0" : isQueued ? "#93A0B0" : "#0B7E70";
  const stepBg = isRunning || step === "03" ? "#E9EEFB" : isQueued ? "#EEF0F3" : "#E3F4F0";

  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 184,
        background: isQueued ? "#FBFCFD" : "#fff",
        border: isRunning ? "1.5px solid #2F5BD0" : isQueued ? "1px dashed #D5DAE1" : "1px solid #E5E8ED",
        borderRadius: 13,
        padding: "16px 16px 14px",
        display: "flex",
        flexDirection: "column",
        boxShadow: isRunning ? "0 6px 22px rgba(47,91,208,.12)" : "0 1px 2px rgba(16,26,39,.03)",
        animation: isRunning ? "ring 2s ease-out infinite" : undefined,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: ".08em",
            color: stepColor,
            background: stepBg,
            padding: "3px 7px",
            borderRadius: 5,
          }}
        >
          {step}
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontWeight: isRunning ? 700 : 600,
            color: isQueued ? "#93A0B0" : isRunning ? "#2F5BD0" : "#0B7E70",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: isQueued ? "#C2C9D4" : isRunning ? "#2F5BD0" : "#0E9C89",
              animation: isRunning ? "pulse-dot 1.3s infinite" : undefined,
            }}
          />
          {status}
        </span>
      </div>
      <div
        style={{
          fontSize: 16.5,
          fontWeight: 700,
          color: isQueued ? "#6B7686" : "#101a27",
          marginTop: 12,
          letterSpacing: "-.01em",
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: ".06em",
          textTransform: "uppercase",
          color: isQueued ? "#A6B0BD" : "#93A0B0",
          marginTop: 3,
        }}
      >
        {role}
      </div>
      <p
        style={{
          fontSize: 12,
          lineHeight: 1.5,
          color: isQueued ? "#8A95A3" : "#56616F",
          margin: "11px 0 0",
          flex: 1,
        }}
      >
        {summary}
      </p>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: isRunning ? "#5A6FB0" : isQueued ? "#B6BFCA" : "#A6B0BD",
          marginTop: 12,
          paddingTop: 10,
          borderTop: `1px solid ${isRunning ? "#EBEFF8" : "#EEF0F3"}`,
        }}
      >
        {footer}
      </div>
    </div>
  );
}

export function PipelineConnector({
  done = true,
  animated = false,
}: {
  done?: boolean;
  animated?: boolean;
}) {
  if (animated) {
    return (
      <div style={{ flex: "0 0 30px", alignSelf: "center", height: 2, background: "#D8DEE6", position: "relative", overflow: "visible" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg,transparent,#2F5BD0,transparent)",
            backgroundSize: "55% 100%",
            animation: "flow 1.5s linear infinite",
          }}
        />
        <ConnectorArrow color="#2F5BD0" />
      </div>
    );
  }

  const color = done ? "#0E9C89" : "#CDD3DB";
  return (
    <div
      style={{
        flex: "0 0 30px",
        alignSelf: "center",
        height: done ? 2 : 0,
        background: done ? color : undefined,
        borderTop: done ? undefined : `2px dashed ${color}`,
        position: "relative",
      }}
    >
      <ConnectorArrow color={color} />
    </div>
  );
}
