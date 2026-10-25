"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

function InvitationAcceptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [invitationData, setInvitationData] = useState<any | null>(null);
  const [tokenError, setTokenError] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setTokenError("Missing administrative invitation token.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/admin/invitations/accept?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (data.valid) {
          setValid(true);
          setInvitationData(data);
          setUsername(data.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_"));
        } else {
          setTokenError(data.error || "Invalid or expired invitation token.");
        }
      } catch {
        setTokenError("Network error validating invitation token.");
      } finally {
        setLoading(false);
      }
    }
    validateToken();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setSubmitError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setSubmitError("Password must be at least 8 characters long.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/admin/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Failed to set up administrator account.");
        setSubmitting(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setSubmitError("Network error completing account setup.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        Validating administrative invitation token...
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
        <div className="h-12 w-12 rounded-full bg-rose-950 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Invalid or Expired Invitation</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {tokenError || "This administrative invitation is invalid, has already been consumed, or has expired after 48 hours."}
        </p>
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
        >
          <span>Return to Admin Login</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
      <div className="text-center space-y-1.5">
        <div className="h-12 w-12 rounded-xl bg-blue-900/60 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto mb-2">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white">Administrator Account Setup</h1>
        <p className="text-xs text-slate-400">
          Invited by <strong className="text-white">{invitationData.invitedBy}</strong> to assume an Administrator node.
        </p>
      </div>

      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
        <span className="text-[10px] text-slate-500 uppercase font-mono block">Designated Official Email</span>
        <span className="font-mono text-white font-bold block">{invitationData.email}</span>
        <span className="text-[10px] text-amber-400 font-mono block">Role: ADMIN (Privileged Node)</span>
      </div>

      {submitError && (
        <div className="p-3.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Admin Username
          </label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin_chennai_hq"
              required
              className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Set Security Password (Min 8 Characters)
          </label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs mt-2"
        >
          {submitting ? "Provisioning Administrative Account..." : "Accept & Initialize Account"}
        </button>
      </form>
    </div>
  );
}

export default function AdminAcceptInvitationPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      <Suspense fallback={<div className="text-slate-400 text-xs">Loading invitation gateway...</div>}>
        <InvitationAcceptContent />
      </Suspense>
    </main>
  );
}
