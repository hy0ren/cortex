"use client";

import { LoginPage } from "@/client/features/auth/login-page";
import { useAuth } from "@/client/features/auth/use-auth";
import { CortexApp } from "./cortex-app";

export function CortexRoot() {
  const auth = useAuth();

  if (!auth.session) {
    return (
      <LoginPage
        capabilities={auth.capabilities}
        loading={auth.loading}
        error={auth.error}
        onSignIn={auth.signIn}
      />
    );
  }

  return <CortexApp session={auth.session} onSignOut={auth.signOut} />;
}
