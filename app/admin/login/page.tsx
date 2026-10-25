"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Terminal,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootstrapAvailable, setBootstrapAvailable] = useState(false);

  // Check if bootstrap is available (0 admins)
  useEffect(() => {
    async function checkBootstrap() {
      try {
        const res = await fetch("/api/admin/bootstrap");
        if (res.ok) {
          const data = await res.json();
          setBootstrapAvailable(data.isBootstrapAvailable);
        }
      } catch {
        // Fallback
      }
    }
    checkBootstrap();
  }, []);

  function fillDemo() {
    setUsername("admin_demo");
    setPassword("Admin@123");
    setError("");
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Administrative authentication failed.");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Network or server connection failed. Please retry.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      {/* Top Banner */}
      <div className="bg-slate-900 border-b border-slate-800 text-[11px] px-4 py-2 flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="font-mono text-slate-300">PAS RESTRICTED AREA — AUTHORIZED PERSONNEL ONLY</span>
        </div>
        <Link href="/" className="hover:text-white transition text-xs flex items-center gap-1">
          <span>Exit to Public Portal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-900/60 border border-blue-500/40 text-blue-400 mb-2 shadow-inner">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Administration Control Center
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Secure authentication gateway for System Administrators and National Passport Operations Officers.
            </p>
          </div>

          {/* Quick Demo Credentials for Evaluation */}
          <div className="rounded-xl border border-blue-500/30 bg-blue-950/40 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                Administrative Evaluation Account
              </span>
              <button
                type="button"
                onClick={fillDemo}
                className="text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded transition"
              >
                Autofill Credentials
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px]">USERNAME</span>
                <span className="text-white font-bold">admin_demo</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">PASSWORD</span>
                <span className="text-white font-bold">Admin@123</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Bootstrap Notification (if available) */}
          {bootstrapAvailable && (
            <div className="p-3.5 rounded-lg bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-start justify-between gap-2">
              <div>
                <p className="font-bold">Initial Setup Available</p>
                <p className="text-[11px] text-amber-300/80 mt-0.5">
                  No administrator account exists yet. You can perform the one-time bootstrap setup.
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const res = await fetch("/api/admin/bootstrap", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      username: "admin_demo",
                      email: "admin.system@pas.gov.in",
                      password: "Admin@123",
                    }),
                  });
                  if (res.ok) {
                    fillDemo();
                    alert("Admin bootstrap succeeded. Credentials loaded.");
                  }
                }}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-bold shrink-0"
              >
                Bootstrap Now
              </button>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleLogin}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin_demo"
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Master Security Key / Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md mt-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>

          {/* Security Assurance Footer */}
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>End-to-End Cryptographic Session Protection (AES-256 + jose JWT)</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-3 text-center text-[11px] text-slate-400">
        Passport Automation System (PAS) • Administrative Management Hierarchy • Academic Demonstration
      </footer>
    </main>
  );
}
