"use client";

import { FormEvent, useState } from "react";
import type { RuntimeCapabilities } from "@/data/contracts";
import { CortexLogo } from "@/client/features/cortex/components/icons";
import { Button } from "@/client/components/ui/button";

type LoginPageProps = {
  capabilities: RuntimeCapabilities | null;
  loading: boolean;
  error: string | null;
  onSignIn: (email: string, password: string) => Promise<void>;
  onRegister: (displayName: string, email: string, password: string) => Promise<void>;
};

export function LoginPage({ capabilities, loading, error, onSignIn, onRegister }: LoginPageProps) {
  const [mode, setMode] = useState<"sign-in" | "register">("sign-in");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("lena.okafor@cortex.local");
  const [password, setPassword] = useState("cortex-demo");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (mode === "register") {
      if (password !== confirmPassword) {
        setFormError("Passwords do not match");
        return;
      }
      await onRegister(displayName, email, password).catch(() => undefined);
      return;
    }
    await onSignIn(email, password).catch(() => undefined);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "var(--space-6)",
        background: "radial-gradient(circle at 20% 10%, rgba(14,156,137,.15), transparent 35%), var(--cortex-nav)",
      }}
    >
      <form
        onSubmit={submit}
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
          <div style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", background: "linear-gradient(140deg,var(--cortex-teal),var(--cortex-blue))", display: "grid", placeItems: "center" }}>
            <CortexLogo />
          </div>
          <div>
            <div style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--cortex-ink)" }}>Cortex</div>
            <div className="font-mono" style={{ fontSize: 9.5, letterSpacing: "var(--tracking-mono-wide)", color: "var(--cortex-fg-faint)" }}>
              CLINICIAN WORKSPACE
            </div>
          </div>
        </div>

        <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", color: "var(--cortex-ink)" }}>
          {mode === "register" ? "Create your account" : "Welcome back"}
        </h1>
        <p style={{ margin: "var(--space-2) 0 var(--space-6)", color: "var(--cortex-fg-subtle)", fontSize: "var(--text-md)", lineHeight: 1.5 }}>
          {mode === "register"
            ? "Set up your clinician workspace. You’ll be signed in immediately."
            : "Sign in to open your secure neuropsychology workspace."}
        </p>

        {mode === "register" && (
          <>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--cortex-ink-4)", marginBottom: "var(--space-2)" }}>Full name</label>
            <input
              type="text"
              required
              autoComplete="name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              style={{ width: "100%", height: 44, border: "1px solid var(--cortex-border-strong)", borderRadius: "var(--radius-md)", padding: "0 12px", fontSize: "var(--text-base)", marginBottom: "var(--space-4)" }}
            />
          </>
        )}
        <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--cortex-ink-4)", marginBottom: "var(--space-2)" }}>Email</label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          style={{ width: "100%", height: 44, border: "1px solid var(--cortex-border-strong)", borderRadius: "var(--radius-md)", padding: "0 12px", fontSize: "var(--text-base)", marginBottom: "var(--space-4)" }}
        />
        <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--cortex-ink-4)", marginBottom: "var(--space-2)" }}>Password</label>
        <input
          type="password"
          required
          minLength={mode === "register" ? 8 : 6}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={{ width: "100%", height: 44, border: "1px solid var(--cortex-border-strong)", borderRadius: "var(--radius-md)", padding: "0 12px", fontSize: "var(--text-base)" }}
        />

        {mode === "register" && (
          <>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--cortex-ink-4)", margin: "var(--space-4) 0 var(--space-2)" }}>Confirm password</label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              style={{ width: "100%", height: 44, border: "1px solid var(--cortex-border-strong)", borderRadius: "var(--radius-md)", padding: "0 12px", fontSize: "var(--text-base)" }}
            />
          </>
        )}

        {(formError || error) && (
          <div role="alert" style={{ color: "#a8423a", background: "#faeae8", borderRadius: "var(--radius-sm)", padding: "9px 11px", fontSize: "var(--text-xs)", marginTop: "var(--space-4)" }}>
            {formError ?? error}
          </div>
        )}

        <Button type="submit" variant="cortex-primary" disabled={loading} style={{ width: "100%", height: 44, marginTop: "var(--space-5)" }}>
          {loading
            ? mode === "register" ? "Creating account…" : "Signing in…"
            : mode === "register" ? "Create account" : "Sign in"}
        </Button>

        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setMode((current) => (current === "sign-in" ? "register" : "sign-in"));
            setFormError(null);
            setConfirmPassword("");
            if (mode === "sign-in") {
              setEmail("");
              setPassword("");
            }
          }}
          style={{
            width: "100%",
            marginTop: "var(--space-3)",
            border: 0,
            background: "transparent",
            color: "var(--cortex-teal-dark)",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {mode === "register" ? "Already have an account? Sign in" : "New to Cortex? Create an account"}
        </button>

        <div style={{ marginTop: "var(--space-5)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--cortex-border-soft)", fontSize: "var(--text-xs)", color: "var(--cortex-fg-faint)", lineHeight: 1.5 }}>
          {capabilities?.firebase === "configured"
            ? "Firebase authentication is connected. Accounts use Firebase identity with a protected Cortex server session."
            : "Development accounts use securely hashed passwords and move to Firebase automatically once it is configured."}
        </div>
      </form>
    </main>
  );
}
