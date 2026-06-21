export function CortexLogo() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="7" r="2.4" fill="#fff" />
      <circle cx="18" cy="6" r="2.1" fill="#fff" opacity=".85" />
      <circle cx="12" cy="13" r="2.4" fill="#fff" />
      <circle cx="7" cy="19" r="2.1" fill="#fff" opacity=".7" />
      <circle cx="18" cy="17" r="2.1" fill="#fff" opacity=".85" />
      <path
        d="M6 7 12 13M18 6 12 13M12 13 7 19M12 13 18 17"
        stroke="#fff"
        strokeWidth="1.2"
        opacity=".55"
      />
    </svg>
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
