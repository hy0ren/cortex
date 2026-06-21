"use client";

type TopBarProps = {
  listening: boolean;
  onToggleListen: () => void;
};

export function TopBar({ listening, onToggleListen }: TopBarProps) {
  return (
    <>
      <header
        style={{
          height: 58,
          flex: "none",
          background: "rgba(245,246,248,0.86)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #E5E8ED",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "#E3EDF0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              color: "#0B7E70",
              flex: "none",
            }}
          >
            EH
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1b2735" }}>Eleanor M. Hayes</div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#8A95A3" }}>·</span>
          <span style={{ fontSize: 13, color: "#647082" }}>Comprehensive Neuropsychological Evaluation</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#A6B0BD", marginLeft: 2 }}>
            18 Jun 2026
          </span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div
            role="button"
            tabIndex={0}
            onClick={onToggleListen}
            onKeyDown={(e) => e.key === "Enter" && onToggleListen()}
            className="cortex-teal-outline"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 34,
              padding: "0 13px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12.5,
              fontWeight: 600,
              border: "1px solid #DCE0E7",
              background: listening ? "#0E9C89" : "#fff",
              color: listening ? "#04251F" : "#5A6675",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
            Hands‑free
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              height: 34,
              padding: "0 12px",
              borderRadius: 8,
              background: "#fff",
              border: "1px solid #E5E8ED",
              fontSize: 12,
              fontWeight: 600,
              color: "#0B7E70",
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#0E9C89" }} />
            HIPAA‑safe mode
          </div>
          <button
            type="button"
            className="cortex-btn-hover"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: "1px solid #E5E8ED",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#5A6675",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
            </svg>
          </button>
        </div>
      </header>

      {listening && (
        <div
          style={{
            flex: "none",
            background: "#062E29",
            color: "#9FE3D7",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "9px 24px",
            fontSize: 12.5,
          }}
        >
          <span style={{ display: "inline-flex", gap: 3 }}>
            {[0, 0.2, 0.4].map((delay) => (
              <span
                key={delay}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#43C9B4",
                  animation: "dots 1s infinite",
                  animationDelay: `${delay}s`,
                }}
              />
            ))}
          </span>
          <span style={{ fontWeight: 600, color: "#CFF3EC" }}>Listening…</span>
          <span style={{ color: "#6FBFB1" }}>
            try &ldquo;open test results&rdquo;, &ldquo;flag this paragraph&rdquo;, or &ldquo;read summary to patient&rdquo;
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={onToggleListen}
            onKeyDown={(e) => e.key === "Enter" && onToggleListen()}
            style={{
              marginLeft: "auto",
              cursor: "pointer",
              fontWeight: 600,
              color: "#9FE3D7",
              border: "1px solid rgba(159,227,215,.3)",
              padding: "3px 10px",
              borderRadius: 6,
            }}
          >
            Stop
          </span>
        </div>
      )}
    </>
  );
}
