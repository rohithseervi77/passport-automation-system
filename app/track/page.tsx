"use client";

import { useState } from "react";
import Link from "next/link";
import AcademicDisclaimer from "@/components/AcademicDisclaimer";
import { 
  Search, 
  Compass, 
  CheckCircle2, 
  Clock, 
  Printer, 
  AlertCircle, 
  Truck, 
  Calendar,
  Lock,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function PublicTrackPage() {
  const [applicationId, setApplicationId] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState("");

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: applicationId.trim(), dob }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to locate application record.");
        setLoading(false);
        return;
      }

      setResult(data);
    } catch (err) {
      console.error("Track error:", err);
      setError("Failed to connect to tracking server. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  const milestones = [
    "Application Submitted",
    "Fee Payment Reconciled",
    "Appointment & Biometrics",
    "Document Verification",
    "Police Enquiry In Progress",
    "Officer Final Scrutiny",
    "Passport Approved & Printed",
    "Dispatched via Speed Post",
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans">
      {/* Tricolor Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>
      <AcademicDisclaimer />

      {/* Public Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 print:hidden shadow-xs">
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
              <p className="text-xs text-slate-500">Public Application Status & Dispatch Tracker</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-md border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
            >
              Portal Login
            </Link>
            <Link
              href="/register"
              className="px-3.5 py-1.5 rounded-md bg-blue-950 text-white font-semibold hover:bg-blue-900 transition shadow-xs"
            >
              Citizen Register
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <div className="mb-8 print:hidden">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            Citizen Self-Service Module
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Track Passport Application Status
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Check the live processing milestone, police enquiry clearance, and India Post dispatch details using your 15-character Application Reference Number (ARN).
          </p>
        </div>

        {/* Search Query Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-8 print:hidden">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-7">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Application Reference Number (ARN) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value.toUpperCase())}
                  placeholder="e.g. PAS202610250001"
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-900 uppercase"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Date of Birth <span className="text-slate-400 font-normal">(Optional Verification)</span>
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Privacy Protected: Sensitive citizen addresses & Aadhaar are masked on public channels.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-950 text-white text-sm font-semibold rounded-lg hover:bg-blue-900 disabled:opacity-50 transition shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Searching Records...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Track Application
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Demo helper quick-fill buttons */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Quick Demo ARNs:</span>
            {["PAS202610250001", "PAS202610250002", "PAS202610250003"].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setApplicationId(code)}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition"
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Lookup Notice</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Tracking Results Card */}
        {result && (
          <div className="bg-white border-2 border-slate-300 rounded-xl shadow-md p-6 sm:p-8 space-y-6">
            {/* Slip Header */}
            <div className="border-b-2 border-slate-800 pb-5 text-center">
              <div className="inline-block px-3 py-1 bg-blue-900 text-white text-xs font-bold uppercase tracking-wider rounded mb-2">
                Passport Automation System • Public Status Ledger
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase">
                Application Status Record
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Official Real-Time Progress Acknowledgement
              </p>
            </div>

            {/* Top Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">ARN:</span>
                <span className="font-mono font-bold text-blue-950 text-sm">{result.applicationId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Applicant Name:</span>
                <span className="font-semibold text-slate-900 text-sm">{result.maskedName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Service Quota:</span>
                <span className="font-medium text-slate-800">{result.serviceType} • {result.applicationCategory}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Regional Office:</span>
                <span className="font-medium text-slate-800">{result.rpoLocation || "RPO Chennai"}</span>
              </div>
            </div>

            {/* Current Status Highlight */}
            <div className="p-5 rounded-lg border border-blue-200 bg-blue-50/70">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Current Processing Stage
                </span>
                <span className="px-3 py-0.5 rounded-full bg-blue-900 text-white text-xs font-bold uppercase">
                  {result.statusLabel}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-800 leading-relaxed">
                {result.statusDescription}
              </p>
              {result.appointmentDate && (
                <div className="mt-3 pt-3 border-t border-blue-200/60 text-xs text-blue-950 font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-900" />
                  <span>
                    Biometric Appointment Scheduled: {new Date(result.appointmentDate).toLocaleDateString("en-IN", {
                      dateStyle: "medium"
                    })} at {result.appointmentLocation}
                  </span>
                </div>
              )}
            </div>

            {/* India Post Speed Post Dispatch Banner (if applicable) */}
            {result.trackingNumber && (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  Speed Post Dispatch Tracking Particulars
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 text-slate-800">
                  <div>
                    <span className="text-slate-500 block">Article Consignment Tracking Number:</span>
                    <span className="font-mono font-bold text-sm text-emerald-950">{result.trackingNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Passport Booklet Number:</span>
                    <span className="font-mono font-bold text-slate-900">{result.passportNumber || "Dispatched"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 8-Stage Milestone Progress Indicator */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                Milestone Progress
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {milestones.map((m, idx) => {
                  const stepNum = idx + 1;
                  const isCompleted = result.stageNumber >= stepNum;
                  const isCurrent = result.stageNumber === stepNum;

                  return (
                    <div
                      key={m}
                      className={`p-3 rounded-lg border text-left transition ${
                        isCurrent
                          ? "border-blue-900 bg-blue-50/80 ring-1 ring-blue-900"
                          : isCompleted
                          ? "border-emerald-200 bg-emerald-50/50"
                          : "border-slate-200 bg-slate-50/50 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] font-bold text-slate-500">Step {stepNum}</span>
                        {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      </div>
                      <p className={`font-semibold text-xs leading-tight ${isCurrent ? "text-blue-950" : isCompleted ? "text-slate-900" : "text-slate-500"}`}>
                        {m}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Public Timeline Events */}
            {result.publicTimeline && result.publicTimeline.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Chronological Milestone Log
                </h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200 text-xs">
                  {result.publicTimeline.map((item: any, i: number) => (
                    <div key={i} className="p-3 flex items-center justify-between bg-slate-50/40">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-900" />
                        <span className="font-semibold text-slate-900">{item.label}</span>
                      </div>
                      <span className="text-slate-500 font-mono">
                        {new Date(item.date).toLocaleDateString("en-IN", {
                          dateStyle: "medium"
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 print:hidden">
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-50 transition shadow-xs"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                Print Status Summary
              </button>

              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-950 text-white text-xs font-semibold rounded-md hover:bg-blue-900 transition shadow-xs"
              >
                Sign In to Full Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Academic Disclaimer */}
        <div className="mt-12 text-center text-xs text-slate-400 print:hidden">
          <p>
            Passport Automation System (PAS) • Academic Software Engineering Demonstration Platform.
          </p>
          <p className="mt-0.5">
            This simulator is not connected to or affiliated with the Government of India Ministry of External Affairs.
          </p>
        </div>
      </div>
    </main>
  );
}
