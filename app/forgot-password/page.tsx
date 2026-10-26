"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [rateLimited, setRateLimited] = useState(false);
  const [resetUrl, setResetUrl] = useState("");
  const [actionLink, setActionLink] = useState("");

  // For development debugging only
  const [debugToken, setDebugToken] = useState("");
  const router = useRouter();

  async function handleForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");
    setDebugToken("");
    setResetUrl("");
    setActionLink("");
    setRateLimited(false);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setMessage(data.message || "A reset link has been dispatched.");
      if (data.rateLimited) {
        setRateLimited(true);
      }
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
      if (data.actionLink) {
        setActionLink(data.actionLink);
      }
      if (data.simulatedToken) {
        setDebugToken(data.simulatedToken);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold">
              PAS
            </div>
            <div>
              <h1 className="font-bold">Passport Automation System</h1>
              <p className="text-xs text-slate-400">Account Recovery</p>
            </div>
          </Link>
          <Link href="/login" className="text-sm text-blue-400 hover:text-blue-300">
            Back to login
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="flex min-h-[calc(100vh-81px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h2 className="mt-2 text-3xl font-bold">Forgot Password</h2>
            <p className="mt-2 text-sm text-slate-400">
              Enter your registered email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form
            onSubmit={handleForgot}
            className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl"
          >
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {message && (
              <div
                className={`rounded-lg border px-4 py-3 text-xs leading-relaxed ${
                  rateLimited
                    ? "border-amber-500/50 bg-amber-950/40 text-amber-200"
                    : "border-emerald-800 bg-emerald-950/50 text-emerald-300"
                }`}
              >
                <div className="font-semibold mb-1 flex items-center gap-1.5">
                  {rateLimited ? "⚠️ Hourly Mail Quota Reached (Free Tier)" : "✉️ Reset Link Dispatched"}
                </div>
                <p>{message}</p>
                {!rateLimited && (
                  <p className="mt-2 text-[11px] text-emerald-400/80">
                    * If you do not see the email in your inbox within 1–2 minutes, please inspect your{" "}
                    <strong>Spam / Junk</strong> folder.
                  </p>
                )}
              </div>
            )}

            {resetUrl && (
              <div className="rounded-xl border border-blue-500/40 bg-blue-950/30 p-4 text-xs text-blue-200">
                <div className="font-semibold text-white flex items-center gap-2 mb-1.5">
                  <span>⚡ Instant Password Reset</span>
                </div>
                <p className="text-[11px] text-blue-300 mb-3">
                  You can immediately update your password now without waiting for email delivery.
                </p>
                <a
                  href={resetUrl}
                  className="block w-full text-center rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500 shadow-md"
                >
                  Open Password Reset Form →
                </a>
              </div>
            )}

            {debugToken && !resetUrl && (
              <div className="mt-4 p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 text-xs text-amber-200 break-words">
                <p className="font-bold uppercase tracking-wider mb-2">Simulated Email (Dev Only)</p>
                <p>A reset link was generated.</p>
                <button
                  type="button"
                  onClick={() => router.push(`/reset-password?token=${debugToken}`)}
                  className="mt-3 block w-full text-center rounded-lg bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-700"
                >
                  Simulate Email Click (Reset Password)
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
