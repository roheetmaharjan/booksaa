"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EmailVerification({ email, mode, mockCode, onBack, onVerify, onResend, loading, error }) {
  const [code, setCode] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendSeconds, setResendSeconds] = useState(30);

  useEffect(() => {
    if (resendSeconds === 0) return undefined;
    const timer = setTimeout(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearTimeout(timer);
  }, [resendSeconds]);

  const handleResend = async () => {
    setResending(true);
    setResendMessage("");
    try {
      await onResend();
      setCode("");
      setResendSeconds(30);
      setResendMessage("A new verification code has been sent.");
    } catch {
      setResendMessage("");
    } finally {
      setResending(false);
    }
  };

  return (
    <form
      className="mx-auto w-full max-w-xl space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onVerify(code);
      }}
    >
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Verify your email</h1>
        <p className="mt-1 text-sm text-slate-500">Enter the six-digit code sent to <strong>{email}</strong>.</p>
      </div>

      {mode === "development-mock" && (
        <div role="status" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Development-only mock verification is active because SMTP is not configured. Use code <strong className="font-mono">{mockCode}</strong>. This mode is disabled in production.
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="guest-otp">Six-digit code</Label>
        <Input
          id="guest-otp"
          name="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          minLength={6}
          maxLength={6}
          required
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          className="max-w-48 text-center font-mono text-lg tracking-[0.4em]"
        />
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {resendMessage && <p role="status" className="text-sm text-emerald-700">{resendMessage}</p>}

      <div className="flex items-center justify-between">
        <Button type="button" variant="link" className="px-0" disabled={resending || loading || resendSeconds > 0} onClick={handleResend}>
          {resending ? "Sending..." : resendSeconds > 0 ? `Resend code (${resendSeconds}s)` : "Resend code"}
        </Button>
        <Button type="button" variant="link" className="px-0" disabled={resending || loading} onClick={onBack}>
          Change details
        </Button>
      </div>

      <div className="flex justify-end border-t border-slate-200 pt-5">
        <Button type="submit" disabled={loading || resending || code.length !== 6}>
          {loading ? "Verifying..." : "Verify and continue"}
        </Button>
      </div>
    </form>
  );
}
