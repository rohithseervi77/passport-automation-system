"use client";

import { useState } from "react";
import Link from "next/link";

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
        body: JSON.stringify({ applicationId, dob }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to find application");
        setLoading(false);
        return;
      }

      setResult(data);
    } catch (err) {
      console.error("Track error:", err);
      setError("Failed to connect to tracking server");
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  const statusOrder = [
    "DRAFT",
    "SUBMITTED",
    "APPOINTMENT_SCHEDULED",
    "UNDER_OFFICER_VERIFICATION",
    "POLICE_VERIFICATION_PENDING",
    "POLICE_CLEARED",
    "APPROVED",
    "PASSPORT_ISSUED",
    "PASSPORT_DISPATCHED",
  ];

  const currentStatus = result?.application?.status || "";
  const currentIndex = statusOrder.indexOf(currentStatus);
  const isRejected = currentStatus === "REJECTED";

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-16">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-50 print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold">
              PAS
            </div>
            <div>
              <h1 className="font-bold text-base">Passport Automation System</h1>
              <p className="text-xs text-slate-400">Public Verification & Status Tracker</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold hover:bg-slate-900 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold hover:bg-blue-700 transition"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 print:hidden">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Official Citizen Service • Module 5: Check Status
          </p>
          <h2 className="mt-2 text-3xl font-bold">Track Application Status</h2>
          <p className="mt-1 text-sm text-slate-400">
            Enter your Application Reference Number and Date of Birth to check live processing milestones.
          </p>
        </div>

        {/* Tracking Search Form */}
        <form
          onSubmit={handleTrack}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl mb-8 print:hidden"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Application Reference Number
              </label>
              <input
                type="text"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="e.g. PAS-2026-782115"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Date of Birth (as per application)
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none"
                required
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-300">
              ✗ {error}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-600/30"
            >
              {loading ? "Searching..." : "Track Application →"}
            </button>
          </div>
        </form>

        {/* Tracking Results Card */}
        {result && (
          <div className="space-y-6">
            {/* Header / Summary Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Applicant Name
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-0.5">
                    {result.applicant.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Application ID: <span className="font-mono text-blue-400">{result.application.applicationId}</span> • Type: {result.application.passportType}
                  </p>
                </div>

                <div className="text-left sm:text-right flex flex-col items-start sm:items-end gap-2">
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
                    {result.application.status.replace(/_/g, " ")}
                  </span>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="print:hidden rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition flex items-center gap-1.5"
                  >
                    <span>🖨️</span> Print Status Acknowledgement
                  </button>
                </div>
              </div>

              {/* Passport Issued Details (if issued) */}
              {result.application.passport && (
                <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-950/20 p-5">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                    <span className="text-xs font-bold text-amber-300 uppercase">
                      🛂 Issued Passport Booklet Details
                    </span>
                    <span className="rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                      {result.application.passport.dispatchStatus}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Passport Number</span>
                      <span className="font-mono font-bold text-white text-base">
                        {result.application.passport.passportNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Issue Date</span>
                      <span className="font-semibold text-slate-200">
                        {new Date(result.application.passport.issueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Expiry Date</span>
                      <span className="font-semibold text-amber-300">
                        {new Date(result.application.passport.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Speed Post AWB</span>
                      <span className="font-mono font-bold text-cyan-300">
                        IN{result.application.passport.passportNumber}SP
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Milestones Timeline */}
              <div className="mt-8">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">
                  Processing Milestones Progression
                </h4>

                <div className="space-y-5 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800">
                  {result.stages.map((stg: any, idx: number) => {
                    const stageIndex = statusOrder.indexOf(stg.key);
                    const isCompleted = currentIndex >= stageIndex && !isRejected;
                    const isCurrent = currentStatus === stg.key;

                    let dot = "bg-slate-800 border-slate-700 text-slate-500";
                    if (isCompleted) dot = "bg-emerald-600 border-emerald-400 text-white";
                    else if (isCurrent) dot = "bg-blue-600 border-blue-400 text-white animate-pulse";

                    return (
                      <div key={stg.key} className="relative flex items-start gap-4 pl-1">
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${dot}`}
                        >
                          {isCompleted ? "✓" : idx + 1}
                        </div>
                        <div className="flex-1 rounded-xl border border-slate-800/60 bg-slate-950/60 p-3.5">
                          <div className="flex items-center justify-between">
                            <h5 className={`text-xs font-semibold ${isCompleted || isCurrent ? "text-white" : "text-slate-500"}`}>
                              {stg.label}
                            </h5>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">
                              {isCurrent ? "IN PROGRESS" : isCompleted ? "DONE" : "PENDING"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{stg.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
