"use client";

import { FormEvent, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState<string | null>(searchParams.get("token"));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Read token from query params or Supabase hash fragment if redirected
  useEffect(() => {
    const queryToken = searchParams.get("token");
    if (queryToken) {
      setToken(queryToken);
      setError(null);
      return;
    }

    // Check hash parameters if Supabase Auth redirected directly (#access_token=...&type=recovery)
    if (typeof window !== "undefined" && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const type = hashParams.get("type");
      if (accessToken && type === "recovery") {
        setToken(accessToken);
        setError(null);
        return;
      }
    }

    if (!token && !queryToken) {
      setError("This password reset link is invalid. Please request a new password reset link.");
    }
  }, [searchParams, token]);

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setMessage("");

    if (!token) {
      setError("This password reset link is invalid. Please request a new password reset link.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify your confirmation password.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "This password reset link is invalid or has expired.");
        setLoading(false);
        return;
      }

      setMessage(data.message || "Password has been successfully updated. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Unable to connect to the authentication server. Please check your network connection.");
      setLoading(false);
    }
  }

  const isInvalidLink =
    error &&
    (error.includes("invalid") || error.includes("expired") || error.includes("already been used"));

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-900/40 text-blue-300 border border-blue-700/50 text-xs font-semibold mb-2">
          <Lock className="w-3.5 h-3.5" />
          Secure Password Reset
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Reset Your Password</h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter and confirm your new account credentials below.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-xl">
        {error && (
          <div className="mb-5 rounded-lg border border-red-800/80 bg-red-950/40 p-4 text-xs text-red-300">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-semibold text-red-200">{error}</p>
                {isInvalidLink && (
                  <Link
                    href="/forgot-password"
                    className="inline-flex items-center gap-1 font-bold text-red-200 hover:text-white underline"
                  >
                    Request a new password reset link
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-lg border border-emerald-800 bg-emerald-950/40 p-4 text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{message}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition focus:border-blue-500 disabled:opacity-50"
              required
              disabled={!token || message !== ""}
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition focus:border-blue-500 disabled:opacity-50"
              required
              disabled={!token || message !== ""}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !token || message !== "" || !!isInvalidLink}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  Update Password
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Citizen & Official Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-sm">
              PAS
            </div>
            <div>
              <h1 className="font-bold text-sm text-white">Passport Automation System</h1>
              <p className="text-[11px] text-slate-400">Account Recovery Portal</p>
            </div>
          </Link>
          <Link href="/login" className="text-xs font-semibold text-blue-400 hover:text-blue-300">
            Back to login →
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <Suspense fallback={<p className="text-xs text-slate-400">Verifying secure reset token...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        <p>© 2026 Passport Automation System • Academic Workflow Simulation</p>
      </footer>
    </main>
  );
}
