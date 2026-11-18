"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: event.currentTarget.elements.password.value,
          confirmPassword: event.currentTarget.elements.confirmPassword.value,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error || "Unable to reset the password.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Unable to reset the password. Please try again.");
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
        {success ? (
          <>
            <h1 className="mb-3 text-3xl font-bold text-slate-900">Password updated</h1>
            <p className="mb-6 text-slate-600">You can now log in with your new password.</p>
            <Link
              href="/auth/login"
              className="flex h-12 w-full items-center justify-center rounded-md bg-primary px-5 py-2 font-semibold text-slate-800"
            >
              Go to login
            </Link>
          </>
        ) : (
          <>
            <h1 className="mb-2 text-3xl font-bold text-slate-900">Reset password</h1>
            <p className="mb-6 text-slate-600">Choose a new password for your account.</p>
            {!token ? (
              <p role="alert" className="text-sm text-red-600">
                This password reset link is invalid or has expired. Request a new link to continue.
              </p>
            ) : (
              <form onSubmit={handleSubmit}>
                <label htmlFor="password" className="mb-2 block text-slate-800">
                  New password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  required
                  className="mb-4 h-12 w-full rounded border px-3 text-slate-900 focus:border-primary focus:ring-primary"
                />
                <label htmlFor="confirmPassword" className="mb-2 block text-slate-800">
                  Retype new password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  required
                  className="mb-5 h-12 w-full rounded border px-3 text-slate-900 focus:border-primary focus:ring-primary"
                />
                {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-md bg-primary px-5 py-2 font-semibold text-slate-800 disabled:opacity-60"
                >
                  {loading ? "Updating..." : "Reset password"}
                </button>
              </form>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
