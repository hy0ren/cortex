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
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "var(--space-6)",
        background:
          "radial-gradient(circle at 20% 10%, rgba(14,156,137,.15), transparent 35%), var(--cortex-nav)",
      }}
    >
      <section
        aria-labelledby="login-title"
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--cortex-surface)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-7)",
          boxShadow: "0 28px 80px rgba(0,0,0,.34)",
        }}
      >
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
  );
}
