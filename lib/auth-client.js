"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext({
  session: null,
  status: "loading",
  refreshSession: async () => null,
  setSession: () => undefined,
});

async function fetchSession() {
  const response = await fetch("/api/auth/session", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  return payload?.user ? payload : null;
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("loading");

  async function refreshSession() {
    setStatus("loading");
    try {
      const nextSession = await fetchSession();
      setSession(nextSession);
      setStatus(nextSession ? "authenticated" : "unauthenticated");
      return nextSession;
    } catch {
      setSession(null);
      setStatus("unauthenticated");
      return null;
    }
  }

  useEffect(() => {
    refreshSession();

    function handleAuthChanged() {
      refreshSession();
    }

    window.addEventListener("booksaa-auth-changed", handleAuthChanged);
    return () => {
      window.removeEventListener("booksaa-auth-changed", handleAuthChanged);
    };
  }, []);

  const value = useMemo(
    () => ({ session, status, refreshSession, setSession }),
    [session, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSession() {
  const { session, status } = useContext(AuthContext);
  return { data: session, status };
}

export async function signIn(_provider, options = {}) {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        identifier: options.identifier,
        password: options.password,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        error: payload?.error || "Invalid credentials.",
      };
    }

    window.dispatchEvent(new Event("booksaa-auth-changed"));
    return { ok: true, error: null };
  } catch {
    return {
      ok: false,
      error: "Unable to sign in right now.",
    };
  }
}

export async function signOut(options = {}) {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  }).catch(() => null);

  window.dispatchEvent(new Event("booksaa-auth-changed"));

  const callbackUrl = options.callbackUrl || "/auth/login";
  if (options.redirect === false) {
    return { url: callbackUrl };
  }

  window.location.assign(callbackUrl);
  return { url: callbackUrl };
}
