"use client";

import { FormEvent, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Captcha, CaptchaRef } from "@/components/Captcha";
import { AttentionNotice } from "@/components/AttentionNotice";

export default function LoginPage() {
  const router = useRouter();
  const captchaRef = useRef<CaptchaRef | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function fillCredentials(user: string, pass: string) {
    setUsername(user);
    setPassword(pass);
    setError("");
    setCaptchaError("");
    // Automatically synchronize captcha for seamless one-click demo testing
    const currentCode = captchaRef.current?.getCode();
    if (currentCode) {
      setCaptchaInput(currentCode);
    }
  }

  function handleClear() {
    setUsername("");
    setPassword("");
    setCaptchaInput("");
    setCaptchaError("");
    setError("");
    captchaRef.current?.refresh();
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setCaptchaError("");

    // 1. Verify CAPTCHA challenge
    if (!captchaRef.current?.isValid()) {
      setCaptchaError("Enter the characters shown in the image correctly.");
      captchaRef.current?.refresh();
      setCaptchaInput("");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login credentials could not be authenticated.");
        captchaRef.current?.refresh();
        setCaptchaInput("");
        setLoading(false);
        return;
      }

      // Redirect according to role
      if (data.user.role === "APPLICANT") {
        router.push("/applicant/dashboard");
      } else if (data.user.role === "OFFICER") {
        router.push("/officer/dashboard");
      } else if (data.user.role === "POLICE") {
        router.push("/police/dashboard");
      } else if (data.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        setError("Unknown role assigned to user account.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to authentication server. Please check your network.");
      captchaRef.current?.refresh();
      setCaptchaInput("");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      {/* Tricolor Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-950 text-white font-bold text-sm shadow-xs">
              PAS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 tracking-tight">Passport Automation System</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold uppercase">Academic</span>
              </div>
              <p className="text-xs text-slate-500">Government Service Workflow Simulation</p>
            </div>
          </Link>

          <Link
            href="/register"
            className="text-xs font-semibold text-blue-950 hover:underline"
          >
            New Citizen Registration →
          </Link>
        </div>
      </header>

      {/* Main Login Form Section */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 text-xs font-semibold mb-2">
              <Lock className="w-3.5 h-3.5" />
              Role-Based Authentication
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Sign in to Passport Portal</h1>
            <p className="text-xs text-slate-500 mt-1">
              Access your Citizen Application, RPO Officer Terminal, or Police Enquiry Roster.
            </p>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/70 p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-950 mb-2 flex items-center justify-between">
              <span>⚡ One-Click Demo Credentials:</span>
              <span className="text-[10px] text-slate-500 font-normal">Click any role to autofill</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials("applicant_demo", "Applicant@123")}
                className="py-1.5 px-2 rounded-md bg-white border border-blue-200 text-[11px] font-semibold text-blue-950 hover:bg-blue-100 transition shadow-2xs text-center"
              >
                👤 Applicant
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("officer_demo", "Officer@123")}
                className="py-1.5 px-2 rounded-md bg-white border border-blue-200 text-[11px] font-semibold text-blue-950 hover:bg-blue-100 transition shadow-2xs text-center"
              >
                🧑‍💼 Officer
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("police_demo", "Police@123")}
                className="py-1.5 px-2 rounded-md bg-white border border-blue-200 text-[11px] font-semibold text-blue-950 hover:bg-blue-100 transition shadow-2xs text-center"
              >
                👮 Police
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("admin_demo", "Admin@123")}
                className="py-1.5 px-2 rounded-md bg-purple-100 border border-purple-300 text-[11px] font-bold text-purple-950 hover:bg-purple-200 transition shadow-2xs text-center"
              >
                🛡️ Admin
              </button>
            </div>
            <div className="mt-2.5 pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-600">Need dedicated admin gateway?</span>
              <Link href="/admin/login" className="font-bold text-purple-900 hover:text-purple-700 underline flex items-center gap-1">
                Go to Dedicated Admin Portal →
              </Link>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Username / Login ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[11px] text-blue-900 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* CAPTCHA Challenge */}
            <div className="pt-2 border-t border-slate-100">
              <Captcha
                ref={captchaRef}
                value={captchaInput}
                onChange={(val) => {
                  setCaptchaInput(val);
                  setCaptchaError("");
                }}
                error={captchaError}
              />
            </div>

            {/* Action Buttons: Clear & Sign In */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleClear}
                className="w-1/3 py-2.5 px-4 bg-white border-2 border-blue-950 text-blue-950 font-bold text-xs rounded-lg hover:bg-slate-100 transition shadow-2xs"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-4 bg-blue-950 text-white font-bold text-xs rounded-lg hover:bg-blue-900 disabled:opacity-50 transition shadow-2xs flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In to Portal
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Don't have an account yet?{" "}
                <Link href="/register" className="font-semibold text-blue-950 hover:underline">
                  Register as a Citizen
                </Link>
              </p>
            </div>
          </form>

          {/* Attention & Alert Notice */}
          <AttentionNotice className="mt-6" />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <p>Passport Automation System (PAS) • Academic Software Engineering Project</p>
      </footer>
    </main>
  );
}
