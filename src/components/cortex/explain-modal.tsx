"use client";

type ExplainModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ExplainModal({ open, onClose }: ExplainModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(11,18,32,0.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 560,
          maxWidth: "100%",
          background: "#fff",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            background: "linear-gradient(140deg,#0E9C89,#0B7E70)",
            padding: "24px 26px",
            color: "#fff",
            position: "relative",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              letterSpacing: ".12em",
              opacity: 0.85,
              marginBottom: 8,
            }}
          >
            PLAIN‑LANGUAGE · READ ALOUD
          </div>
          <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-.01em" }}>
            For Eleanor — what today&apos;s results mean
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18 }}>
            <button
              type="button"
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#fff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flex: "none",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0B7E70">
                <path d="M7 5l12 7-12 7z" />
              </svg>
            </button>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 2, height: 30 }}>
              {[40, 75, 55, 90, 50, 70, 35, 60].map((h, i) => (
                <span
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    background: i === 3 ? "#fff" : "rgba(255,255,255,.6)",
                    borderRadius: 2,
                    animation: "wave 1s infinite",
                    animationDelay: `${i * 0.12}s`,
                  }}
                />
              ))}
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, opacity: 0.9 }}>0:48</span>
          </div>
        </div>
        <div style={{ padding: "24px 26px" }}>
          <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "#2b3542", margin: "0 0 14px" }}>
            Most parts of your thinking are working well — your problem‑solving, language, and reasoning are right where we&apos;d expect for your age.
          </p>
          <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "#2b3542", margin: "0 0 14px" }}>
            The main thing we noticed is <b>memory for new information</b>. Remembering things after a short delay was harder than the rest, and that&apos;s the part we want to keep an eye on.
          </p>
          <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "#2b3542", margin: 0 }}>
            This isn&apos;t a final diagnosis on its own. The next step is a follow‑up with your neurologist, and we&apos;ll check again in about a year to see how things are going.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 18,
              paddingTop: 16,
              borderTop: "1px solid #EEF0F3",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#93A0B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span style={{ fontSize: 11.5, color: "#8A95A3", flex: 1 }}>
              Generated from the final report · simplified to ~6th‑grade reading level for patient understanding.
            </span>
            <button
              type="button"
              onClick={onClose}
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "#fff",
                background: "#0E9C89",
                border: "none",
                borderRadius: 8,
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
