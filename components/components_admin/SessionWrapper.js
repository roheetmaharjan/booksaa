"use client";
import { SessionProvider } from "@/lib/auth-client";

export default function SessionWrapper({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
