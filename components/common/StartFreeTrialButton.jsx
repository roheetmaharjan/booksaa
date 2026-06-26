"use client";
import Link from "next/link"
export default function StartFreeTrialButton({
  planId,
  children = "Start Free Trial →",
  className = "",
}) {
  const href = `/business-signup?${new URLSearchParams({
    ...(planId ? { planId } : {}),
    professionals: "1",
    locations: "1",
  }).toString()}`;

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center bg-primary text-slate-900 font-semibold px-7 py-4 rounded-xl hover:opacity-90 transition ${className}`}
    >
      {children}
    </Link>
  );
}