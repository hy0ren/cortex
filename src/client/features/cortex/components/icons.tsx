import Image from "next/image";

export function CortexLogo({ size = 30 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        display: "block",
        position: "relative",
        overflow: "hidden",
        borderRadius: Math.max(6, Math.round(size * 0.24)),
        background: "#fff",
        boxShadow: "inset 0 0 0 1px rgba(16,26,39,.06)",
      }}
    >
      <Image
        src="/cortex-logo.png"
        alt=""
        width={1254}
        height={1254}
        priority
        style={{
          position: "absolute",
          width: "190%",
          height: "190%",
          maxWidth: "none",
          left: "-45%",
          top: "-45%",
          objectFit: "cover",
        }}
      />
    </span>
  );
}

export function CheckIcon({ color = "currentColor", size = 14 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

export function ArrowRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ConnectorArrow({ color }: { color: string }) {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill={color} style={{ position: "absolute", right: -3, top: -4 }}>
      <path d="M8 5l8 7-8 7z" />
    </svg>
  );
}
