"use client";

import { FormEvent, useState } from "react";
import type { RuntimeCapabilities } from "@/data/contracts";
import { CortexLogo } from "@/client/features/cortex/components/icons";

type LoginPageProps = {
  capabilities: RuntimeCapabilities | null;
  loading: boolean;
  error: string | null;
  onSignIn: (email: string, password: string) => Promise<void>;
};

export function LoginPage({ capabilities, loading, error, onSignIn }: LoginPageProps) {
  const [email, setEmail] = useState("lena.okafor@cortex.local");
  const [password, setPassword] = useState("cortex-demo");

  async function submit(event: FormEvent) {
    event.preventDefault();
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

        <h1 style={{ margin: 0, fontSize: 24, color: "#101a27" }}>Welcome back</h1>
        <p style={{ margin: "7px 0 24px", color: "#647082", fontSize: 13.5, lineHeight: 1.5 }}>
          Sign in to open your secure neuropsychology workspace.
        </p>

        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#3A4654", marginBottom: 7 }}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          style={{ width: "100%", height: 44, border: "1px solid #DCE0E7", borderRadius: 9, padding: "0 12px", fontSize: 14, marginBottom: 16 }}
        />
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#3A4654", marginBottom: 7 }}>Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={{ width: "100%", height: 44, border: "1px solid #DCE0E7", borderRadius: 9, padding: "0 12px", fontSize: 14 }}
        />

        {error && <div role="alert" style={{ color: "#A8423A", background: "#FAEAE8", borderRadius: 8, padding: "9px 11px", fontSize: 12, marginTop: 14 }}>{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="cortex-teal-btn"
          style={{ width: "100%", height: 44, marginTop: 20, border: 0, borderRadius: 10, background: "#0E9C89", color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "wait" : "pointer", opacity: loading ? .7 : 1 }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid #EEF0F3", fontSize: 11.5, color: "#8A95A3", lineHeight: 1.5 }}>
          {capabilities?.firebase === "configured"
            ? "Firebase authentication is connected. Server sessions are protected by an HTTP-only cookie."
            : "Demo authentication is active until Firebase credentials are added. Any valid email and 6+ character password works."}
        </div>
      </form>
    </main>
  );
}
