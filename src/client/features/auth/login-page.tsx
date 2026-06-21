"use client";

import { FormEvent, useState } from "react";
import type { RuntimeCapabilities } from "@/data/contracts";
import { CortexLogo } from "@/client/features/cortex/components/icons";

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
        padding: 24,
        background:
          "radial-gradient(circle at 20% 10%, rgba(14,156,137,.15), transparent 35%), #0B1220",
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 18,
          padding: 32,
          boxShadow: "0 28px 80px rgba(0,0,0,.34)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 28 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(140deg,#0E9C89,#2F5BD0)", display: "grid", placeItems: "center" }}>
            <CortexLogo />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#101a27" }}>Cortex</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: ".13em", color: "#8A95A3" }}>CLINICIAN WORKSPACE</div>
          </div>
        </div>

        <h1 style={{ margin: 0, fontSize: 24, color: "#101a27" }}>
          {mode === "register" ? "Create your account" : "Welcome back"}
        </h1>
        <p style={{ margin: "7px 0 24px", color: "#647082", fontSize: 13.5, lineHeight: 1.5 }}>
          {mode === "register"
            ? "Set up your clinician workspace. You’ll be signed in immediately."
            : "Sign in to open your secure neuropsychology workspace."}
        </p>

        {mode === "register" && (
          <>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#3A4654", marginBottom: 7 }}>Full name</label>
            <input
              type="text"
              required
              autoComplete="name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              style={{ width: "100%", height: 44, border: "1px solid #DCE0E7", borderRadius: 9, padding: "0 12px", fontSize: 14, marginBottom: 16 }}
            />
          </>
        )}
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#3A4654", marginBottom: 7 }}>Email</label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          style={{ width: "100%", height: 44, border: "1px solid #DCE0E7", borderRadius: 9, padding: "0 12px", fontSize: 14, marginBottom: 16 }}
        />
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#3A4654", marginBottom: 7 }}>Password</label>
        <input
          type="password"
          required
          minLength={mode === "register" ? 8 : 6}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={{ width: "100%", height: 44, border: "1px solid #DCE0E7", borderRadius: 9, padding: "0 12px", fontSize: 14 }}
        />

        {mode === "register" && (
          <>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#3A4654", margin: "16px 0 7px" }}>Confirm password</label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              style={{ width: "100%", height: 44, border: "1px solid #DCE0E7", borderRadius: 9, padding: "0 12px", fontSize: 14 }}
            />
          </>
        )}

        {(formError || error) && <div role="alert" style={{ color: "#A8423A", background: "#FAEAE8", borderRadius: 8, padding: "9px 11px", fontSize: 12, marginTop: 14 }}>{formError ?? error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="cortex-teal-btn"
          style={{ width: "100%", height: 44, marginTop: 20, border: 0, borderRadius: 10, background: "#0E9C89", color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "wait" : "pointer", opacity: loading ? .7 : 1 }}
        >
          {loading
            ? mode === "register" ? "Creating account…" : "Signing in…"
            : mode === "register" ? "Create account" : "Sign in"}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setMode((current) => current === "sign-in" ? "register" : "sign-in");
            setFormError(null);
            setConfirmPassword("");
            if (mode === "sign-in") {
              setEmail("");
              setPassword("");
            }
          }}
          style={{
            width: "100%",
            marginTop: 12,
            border: 0,
            background: "transparent",
            color: "#0B7E70",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {mode === "register"
            ? "Already have an account? Sign in"
            : "New to Cortex? Create an account"}
        </button>

        <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid #EEF0F3", fontSize: 11.5, color: "#8A95A3", lineHeight: 1.5 }}>
          {capabilities?.firebase === "configured"
            ? "Firebase authentication is connected. Accounts use Firebase identity with a protected Cortex server session."
            : "Development accounts use securely hashed passwords and move to Firebase automatically once it is configured."}
        </div>
      </form>
    </main>
  );
}
