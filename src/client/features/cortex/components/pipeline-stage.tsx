import type { ReactNode } from "react";
import { ConnectorArrow } from "./icons";

export type AgentVariant = "done" | "running" | "queued" | "flagged";

type AgentCardProps = {
  step: string;
  name: string;
  role: string;
  summary: ReactNode;
  footer: string;
  status: string;
  variant?: AgentVariant;
};

const VARIANT_STYLES: Record<
  AgentVariant,
  {
    surface: string;
    border: string;
    badgeColor: string;
    badgeBg: string;
    statusColor: string;
    dotColor: string;
    nameColor: string;
    roleColor: string;
    summaryColor: string;
    footerColor: string;
    footerBorder: string;
    shadow: string;
    pulse: boolean;
    ring: boolean;
  }
> = {
  queued: {
    surface: "var(--cortex-surface-muted)",
    border: "1px dashed var(--cortex-border-stronger)",
    badgeColor: "var(--cortex-fg-ghost)",
    badgeBg: "var(--cortex-border-soft)",
    statusColor: "var(--cortex-fg-ghost)",
    dotColor: "#c2c9d4",
    nameColor: "var(--cortex-fg-muted)",
    roleColor: "var(--cortex-fg-disabled)",
    summaryColor: "var(--cortex-fg-faint)",
    footerColor: "#b6bfca",
    footerBorder: "var(--cortex-border-soft)",
    shadow: "var(--shadow-1)",
    pulse: false,
    ring: false,
  },
  running: {
    surface: "var(--cortex-surface)",
    border: "1.5px solid var(--cortex-blue)",
    badgeColor: "var(--cortex-blue)",
    badgeBg: "var(--cortex-blue-tint)",
    statusColor: "var(--cortex-blue)",
    dotColor: "var(--cortex-blue)",
    nameColor: "var(--cortex-ink)",
    roleColor: "var(--cortex-fg-faint)",
    summaryColor: "var(--cortex-fg-muted)",
    footerColor: "#5a6fb0",
    footerBorder: "#ebeff8",
    shadow: "var(--shadow-2)",
    pulse: true,
    ring: true,
  },
  done: {
    surface: "var(--cortex-surface)",
    border: "1px solid var(--cortex-border)",
    badgeColor: "var(--cortex-teal-dark)",
    badgeBg: "var(--cortex-teal-tint)",
    statusColor: "var(--cortex-teal-dark)",
    dotColor: "var(--cortex-teal)",
    nameColor: "var(--cortex-ink)",
    roleColor: "var(--cortex-fg-faint)",
    summaryColor: "var(--cortex-fg-muted)",
    footerColor: "var(--cortex-fg-disabled)",
    footerBorder: "var(--cortex-border-soft)",
    shadow: "var(--shadow-1)",
    pulse: false,
    ring: false,
  },
  flagged: {
    surface: "var(--cortex-verify-bg)",
    border: "1px solid var(--cortex-verify-border)",
    badgeColor: "var(--cortex-verify)",
    badgeBg: "#f3e4c4",
    statusColor: "var(--cortex-verify)",
    dotColor: "var(--cortex-verify)",
    nameColor: "var(--cortex-ink)",
    roleColor: "var(--cortex-verify)",
    summaryColor: "var(--cortex-ink-4)",
    footerColor: "var(--cortex-verify)",
    footerBorder: "var(--cortex-verify-border)",
    shadow: "var(--shadow-1)",
    pulse: false,
    ring: false,
  },
};

export function AgentCard({ step, name, role, summary, footer, status, variant = "done" }: AgentCardProps) {
  const v = VARIANT_STYLES[variant];

  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 200,
        background: v.surface,
        border: v.border,
        borderRadius: "var(--radius-lg)",
        padding: "20px 20px 18px",
        display: "flex",
        flexDirection: "column",
        boxShadow: v.shadow,
        animation: v.ring ? "ring 2s ease-out infinite" : undefined,
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="font-mono"
          style={{
            fontSize: "var(--text-xs)",
            letterSpacing: "var(--tracking-mono-tight)",
            color: v.badgeColor,
            background: v.badgeBg,
            padding: "3px 7px",
            borderRadius: "var(--radius-xs)",
          }}
        >
          {step}
        </span>
        <span
          className="flex items-center gap-1.5"
          style={{ fontSize: 11, fontWeight: variant === "running" ? 700 : 600, color: v.statusColor }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: v.dotColor,
              animation: v.pulse ? "pulse-dot 1.3s infinite" : undefined,
            }}
          />
          {status}
        </span>
      </div>
      <div
        style={{
          fontSize: "var(--text-lg)",
          fontWeight: 700,
          color: v.nameColor,
          marginTop: "var(--space-3)",
          letterSpacing: "-.01em",
        }}
      >
        {name}
      </div>
      <div
        className="font-mono uppercase"
        style={{
          fontSize: "var(--text-xs)",
          letterSpacing: "var(--tracking-mono-wide)",
          color: v.roleColor,
          marginTop: 3,
        }}
      >
        {role}
      </div>
      <p
        style={{
          fontSize: "var(--text-sm)",
          lineHeight: 1.55,
          color: v.summaryColor,
          margin: "var(--space-3) 0 0",
          flex: 1,
        }}
      >
        {summary}
      </p>
      <div
        className="font-mono"
        style={{
          fontSize: "var(--text-xs)",
          color: v.footerColor,
          marginTop: "var(--space-3)",
          paddingTop: "var(--space-2)",
          borderTop: `1px solid ${v.footerBorder}`,
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
      <div style={{ flex: "0 0 30px", alignSelf: "center", height: 2, background: "var(--cortex-border-strong)", position: "relative", overflow: "visible" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg,transparent,var(--cortex-blue),transparent)",
            backgroundSize: "55% 100%",
            animation: "flow 1.5s linear infinite",
          }}
        />
        <ConnectorArrow color="var(--cortex-blue)" />
      </div>
    );
  }

  const color = done ? "var(--cortex-teal)" : "#cdd3db";
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
