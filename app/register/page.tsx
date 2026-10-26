"use client";

import { FormEvent, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Lock, Mail, Building, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Captcha, CaptchaRef } from "@/components/Captcha";
import { AttentionNotice } from "@/components/AttentionNotice";

export default function RegisterPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const captchaRef = useRef<CaptchaRef | null>(null);

  const [role, setRole] = useState<"APPLICANT" | "OFFICER" | "POLICE">("APPLICANT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Applicant fields
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");

  // Officer fields
  const [branchLocation, setBranchLocation] = useState("RPO Central Processing Center - Chennai");
  const [officerId, setOfficerId] = useState("");

  // Police fields
  const [stationCode, setStationCode] = useState("PS-CENTRAL");
  const [badgeNumber, setBadgeNumber] = useState("");

  // Captcha fields
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  function handleClear() {
    formRef.current?.reset();
    setName("");
    setDob("");
    setAddress("");
    setOfficerId("");
    setBranchLocation("RPO Central Processing Center - Chennai");
    setStationCode("PS-CENTRAL");
    setBadgeNumber("");
    setCaptchaInput("");
    setCaptchaError("");
    setError("");
    setSuccess("");
    captchaRef.current?.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setCaptchaError("");

    // 1. Verify CAPTCHA challenge
    if (!captchaRef.current?.isValid()) {
      setCaptchaError("Enter the characters shown in the image correctly.");
      captchaRef.current?.refresh();
      setCaptchaInput("");
      return;
    }

    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const username = formData.get("username")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();

    const payload: any = {
      username,
      email,
      password,
      role,
    };

    if (role === "APPLICANT") {
      payload.name = name.trim();
      payload.dob = dob;
      payload.address = address.trim();
    } else if (role === "OFFICER") {
      payload.branchLocation = branchLocation.trim();
      payload.officerId = officerId.trim() || undefined;
    } else if (role === "POLICE") {
      payload.stationCode = stationCode.trim();
      payload.badgeNumber = badgeNumber.trim() || undefined;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Account registration failed.");
        captchaRef.current?.refresh();
        setCaptchaInput("");
        setLoading(false);
        return;
      }

      setSuccess("Account registered successfully! Redirecting to secure login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);
      setError("Unable to connect to registration server.");
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
              <p className="text-xs text-slate-500">Citizen Registration Portal</p>
            </div>
          </Link>

          <Link
            href="/login"
            className="text-xs font-semibold text-blue-950 hover:underline"
          >
            Already registered? Sign In →
          </Link>
        </div>
      </header>

      {/* Main Registration Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-lg">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Create Portal Account</h1>
            <p className="text-xs text-slate-500 mt-1">
              Select your role and provide account particulars to access passport digital services.
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button
              type="button"
              onClick={() => setRole("APPLICANT")}
              className={`py-2 px-3 rounded-lg border text-xs font-bold text-center transition ${
                role === "APPLICANT"
                  ? "bg-blue-950 text-white border-blue-950 shadow-xs"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              👤 Citizen Applicant
            </button>
            <button
              type="button"
              onClick={() => setRole("OFFICER")}
              className={`py-2 px-3 rounded-lg border text-xs font-bold text-center transition ${
                role === "OFFICER"
                  ? "bg-blue-950 text-white border-blue-950 shadow-xs"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              🧑‍💼 Passport Officer
            </button>
            <button
              type="button"
              onClick={() => setRole("POLICE")}
              className={`py-2 px-3 rounded-lg border text-xs font-bold text-center transition ${
                role === "POLICE"
                  ? "bg-blue-950 text-white border-blue-950 shadow-xs"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              👮 Police Authority
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-4"
          >
            {/* Account Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Username <span className="text-rose-600">*</span>
                </label>
                <input
                  name="username"
                  type="text"
                  placeholder="e.g. rohit_kumar"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address <span className="text-rose-600">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="e.g. citizen@example.com"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password <span className="text-rose-600">*</span>
              </label>
              <input
                name="password"
                type="password"
                placeholder="At least 8 characters"
                required
                minLength={8}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>

            {/* Role Specific Fields */}
            {role === "APPLICANT" && (
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Full Legal Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="As per School / Birth certificate"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Date of Birth <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Present Residential Address <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Door No, Street, City, State, PIN Code"
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900"
                  ></textarea>
                </div>
              </div>
            )}

            {role === "OFFICER" && (
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Officer Badge / Employee ID
                    </label>
                    <input
                      type="text"
                      value={officerId}
                      onChange={(e) => setOfficerId(e.target.value)}
                      placeholder="e.g. OFF-CHENNAI-01"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Branch / RPO Location
                    </label>
                    <input
                      type="text"
                      value={branchLocation}
                      onChange={(e) => setBranchLocation(e.target.value)}
                      placeholder="RPO Chennai - Rayala Towers"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {role === "POLICE" && (
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Station Code / Division
                    </label>
                    <input
                      type="text"
                      value={stationCode}
                      onChange={(e) => setStationCode(e.target.value)}
                      placeholder="e.g. PS-SALIGRAMAM"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Officer Designation / Badge No.
                    </label>
                    <input
                      type="text"
                      value={badgeNumber}
                      onChange={(e) => setBadgeNumber(e.target.value)}
                      placeholder="e.g. SI-4829"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CAPTCHA Challenge (Modeled on official Passport Seva portal) */}
            <div className="pt-3 border-t border-slate-100">
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

            {/* Action Buttons: Clear & Sign Up (Side-by-side as in official portal) */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleClear}
                className="w-1/2 py-2.5 px-4 bg-white border-2 border-blue-950 text-blue-950 font-bold text-xs rounded-lg hover:bg-slate-100 transition shadow-2xs flex items-center justify-center gap-1.5"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-2.5 px-4 bg-blue-950 text-white font-bold text-xs rounded-lg hover:bg-blue-900 disabled:opacity-50 transition shadow-2xs flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    Sign Up
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-600">
                Already have an Account?{" "}
                <Link href="/login" className="font-bold text-blue-950 hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </form>

          {/* Attention & Alert Notice (Modeled directly after official Passport Seva portal) */}
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
