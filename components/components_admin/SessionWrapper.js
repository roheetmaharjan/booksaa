// filepath: d:\My Works\project\aiila\app\components\SessionWrapper.js
"use client";
import { SessionProvider } from "next-auth/react";

export default function SessionWrapper({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}