"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: event.currentTarget.elements.email.value,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error || "Unable to send the password reset email.");
        return;
      }

      setMessage("A password reset link has been sent to your email address.");
    } catch {
      setError("Unable to send the password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#062B3D] px-6 py-12">
      <div className="mb-10">
        <Image src="/logo_white.png" width={140} height={40} alt="Booksaa" className="h-[26px] w-auto" />
      </div>
      <section className="w-full max-w-[440px] rounded-2xl bg-white px-7 py-8 shadow-sm">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Forgot password?</h1>
        <p className="mb-6 text-slate-600">
          Enter your email address and we&apos;ll send you a link to reset it.
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email" className="mb-2 block text-slate-800">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mb-5 h-12 w-full rounded border px-3 text-slate-900 focus:border-primary focus:ring-primary"
          />
          {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
          {message && <p role="status" className="mb-4 text-sm text-green-700">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-md bg-primary px-5 py-2 font-semibold text-slate-800 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <p className="mt-6 text-center">
          <Link href="/auth/login" className="font-semibold text-slate-800 underline">
            Back to login
          </Link>
        </p>
      </section>
    </main>
  );
}
