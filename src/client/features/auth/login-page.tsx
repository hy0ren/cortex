"use client";

import { FolderOpen, LogIn } from "lucide-react";
import type { RuntimeCapabilities } from "@/data/contracts";
import { CortexLogo } from "@/client/features/cortex/components/icons";
import { Button } from "@/client/components/ui/button";

type LoginPageProps = {
  capabilities: RuntimeCapabilities | null;
  loading: boolean;
  error: string | null;
  onGoogleSignIn: () => Promise<void>;
  onEnterDemo: () => Promise<void>;
};

export function LoginPage({
  capabilities,
  loading,
  error,
  onGoogleSignIn,
  onEnterDemo,
}: LoginPageProps) {
  const googleConfigured = capabilities?.firebase === "configured";
  const demoAvailable = capabilities?.demoAuth === true;

  return (
    <>
      <style>{`
        @keyframes login-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.08); }
          66% { transform: translate(-25px, 20px) scale(0.95); }
        }
        @keyframes login-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-50px, 30px) scale(1.1); }
          70% { transform: translate(35px, -20px) scale(0.92); }
        }
        @keyframes login-drift-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          30% { transform: translate(30px, 40px) scale(1.06); }
          65% { transform: translate(-40px, -25px) scale(0.97); }
        }
        @keyframes card-glow {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
      `}</style>
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "var(--space-6)",
          background: "var(--cortex-nav)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated mesh orbs */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{
            position: "absolute", width: "60vw", height: "60vw", maxWidth: 700, maxHeight: 700,
            borderRadius: "50%", top: "-15%", left: "-10%",
            background: "radial-gradient(circle, rgba(14,156,137,0.22) 0%, transparent 70%)",
            animation: "login-drift-1 18s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", width: "50vw", height: "50vw", maxWidth: 600, maxHeight: 600,
            borderRadius: "50%", bottom: "-20%", right: "-8%",
            background: "radial-gradient(circle, rgba(47,91,208,0.2) 0%, transparent 70%)",
            animation: "login-drift-2 22s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", width: "35vw", height: "35vw", maxWidth: 420, maxHeight: 420,
            borderRadius: "50%", top: "40%", left: "55%",
            background: "radial-gradient(circle, rgba(14,156,137,0.12) 0%, transparent 70%)",
            animation: "login-drift-3 26s ease-in-out infinite",
          }} />
          {/* Fine grid overlay */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }} />
        </div>

        <section
          aria-labelledby="login-title"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 420,
            background: "rgba(255,255,255,0.97)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-7)",
            boxShadow: "0 32px 100px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        >
          {/* Glowing top-edge accent */}
          <div aria-hidden="true" style={{
            position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
            background: "linear-gradient(90deg, transparent, rgba(14,156,137,0.7), rgba(47,91,208,0.5), transparent)",
            borderRadius: "0 0 4px 4px",
            animation: "card-glow 4s ease-in-out infinite",
          }} />
        <div className="flex items-center gap-2.5" style={{ marginBottom: "var(--space-7)" }}>
          <CortexLogo size={42} />
          <div
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              color: "var(--cortex-ink)",
            }}
          >
            Cortex
          </div>
        </div>

        <h1
          id="login-title"
          style={{ margin: 0, fontSize: "var(--text-2xl)", color: "var(--cortex-ink)" }}
        >
          Welcome back
        </h1>
        <p
          style={{
            margin: "var(--space-2) 0 var(--space-6)",
            color: "var(--cortex-fg-subtle)",
            fontSize: "var(--text-md)",
            lineHeight: 1.5,
          }}
        >
          Sign in with Google.
        </p>

        <Button
          type="button"
          variant="cortex-primary"
          disabled={loading || !googleConfigured}
          onClick={() => void onGoogleSignIn()}
          style={{ width: "100%", height: 44 }}
        >
          <LogIn aria-hidden="true" />
          {loading ? "Signing in…" : "Continue with Google"}
        </Button>

        {!googleConfigured && (
          <p
            role="status"
            style={{
              margin: "var(--space-3) 0 0",
              color: "var(--cortex-fg-faint)",
              fontSize: "var(--text-xs)",
              lineHeight: 1.5,
              textAlign: "center",
            }}
          >
            Google sign-in will be available when Firebase is configured.
          </p>
        )}

        {demoAvailable && (
          <>
            <div
              className="flex items-center gap-3"
              aria-hidden="true"
              style={{ margin: "var(--space-5) 0" }}
            >
              <span style={{ height: 1, flex: 1, background: "var(--cortex-border)" }} />
              <span
                className="font-mono"
                style={{
                  color: "var(--cortex-fg-faint)",
                  fontSize: 9.5,
                  letterSpacing: "var(--tracking-mono-wide)",
                }}
              >
                GUEST ACCESS
              </span>
              <span style={{ height: 1, flex: 1, background: "var(--cortex-border)" }} />
            </div>

            <Button
              type="button"
              variant="cortex-secondary"
              disabled={loading}
              onClick={() => void onEnterDemo()}
              style={{ width: "100%", height: 44 }}
            >
              <FolderOpen aria-hidden="true" />
              Explore as Guest Clinician
            </Button>
            <p
              style={{
                margin: "var(--space-3) 0 0",
                color: "var(--cortex-fg-faint)",
                fontSize: "var(--text-xs)",
                lineHeight: 1.5,
                textAlign: "center",
              }}
            >
              Experience the complete workspace offline. No Google account required.
            </p>
          </>
        )}

        {error && (
          <div
            role="alert"
            style={{
              color: "#a8423a",
              background: "#faeae8",
              borderRadius: "var(--radius-sm)",
              padding: "9px 11px",
              fontSize: "var(--text-xs)",
              marginTop: "var(--space-4)",
            }}
          >
            {error}
          </div>
        )}

      </section>
      </main>
    </>
  );
}
