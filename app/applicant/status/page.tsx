"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  HelpCircle, 
  Truck, 
  FileText, 
  ShieldCheck, 
  Building2, 
  Printer, 
  Send,
  Calendar,
  Compass
} from "lucide-react";

export default function ApplicantStatusPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  // Clarification response state
  const [clarificationText, setClarificationText] = useState("");
  const [submittingClarification, setSubmittingClarification] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/applicant/status");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to load status:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  async function handleSendClarification(e: React.FormEvent) {
    e.preventDefault();
    if (!clarificationText.trim()) return;
    setSubmittingClarification(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/applicant/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clarificationResponse: clarificationText }),
      });
      const resJson = await res.json();
      if (!res.ok) {
        setError(resJson.error || "Failed to submit clarification response");
        return;
      }
      setMessage(resJson.message || "Clarification submitted successfully.");
      setClarificationText("");
      await fetchStatus();
    } catch (err) {
      console.error("Clarification error:", err);
      setError("Failed to connect to server");
    } finally {
      setSubmittingClarification(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-600">Connecting to National Passport Tracking Network...</p>
        </div>
      </main>
    );
  }

  const app = data?.application;
  const applicant = data?.applicant;
  const currentMeta = data?.currentMeta;
  const milestones = data?.milestones || [];
  const currentStatus = app?.status || "DRAFT";

  // Map status to milestone index (1 to 8)
  const milestoneStage = currentMeta?.stage || 1;
  const isClarificationNeeded = currentStatus === "CLARIFICATION_REQUIRED";
  const isRejected = currentStatus === "REJECTED";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans">
      <Navbar
        role="APPLICANT"
        userName={applicant?.name || "Applicant"}
        badgeLabel={app?.applicationId ? `ARN: ${app.applicationId}` : "PAS"}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 print:hidden">
          <Link href="/applicant/dashboard" className="hover:text-blue-900 hover:underline">
            Applicant Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Track Application Status</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 mb-8 print:hidden">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5" />
              Real-time Passport Processing Tracker
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Application Lifecycle & Status
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Synchronized with Regional Passport Office (RPO) and District Police Headquarters.
            </p>
          </div>

          {app?.applicationId && (
            <div className="mt-4 sm:mt-0 p-3 bg-white border border-slate-200 rounded-lg text-right shadow-sm">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Application Reference Number</div>
              <div className="text-base font-bold font-mono text-blue-950">{app.applicationId}</div>
            </div>
          )}
        </div>

        {/* Notifications */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice</p>
              <p className="text-xs text-emerald-700 mt-0.5">{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {!app ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
            <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-800">No application found to track</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
              You currently do not have any submitted or draft passport applications in the system.
            </p>
            <Link
              href="/applicant/application"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-950 text-white text-sm font-semibold rounded-md hover:bg-blue-900 transition"
            >
              Start New Passport Application →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Primary Current Status Banner */}
            <div className={`rounded-xl border p-6 shadow-sm ${
              isRejected
                ? "bg-rose-50 border-rose-300"
                : isClarificationNeeded
                ? "bg-amber-50 border-amber-300"
                : currentStatus === "DISPATCHED" || currentStatus === "PASSPORT_DISPATCHED"
                ? "bg-emerald-50 border-emerald-300"
                : "bg-white border-slate-200"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Current Application Status
                  </span>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                      isRejected
                        ? "bg-rose-600 text-white"
                        : isClarificationNeeded
                        ? "bg-amber-600 text-white"
                        : currentStatus.includes("DISPATCH") || currentStatus.includes("APPROVED")
                        ? "bg-emerald-700 text-white"
                        : "bg-blue-900 text-white"
                    }`}>
                      {currentMeta?.label || currentStatus.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-slate-500">
                      Last Updated: {new Date(app.updatedAt || app.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mt-2 font-medium">
                    {currentMeta?.description || "Application is undergoing administrative processing."}
                  </p>
                </div>

                <div className="text-left sm:text-right text-xs text-slate-500 space-y-1 shrink-0">
                  <div>ARN: <span className="font-mono font-bold text-slate-900">{app.applicationId}</span></div>
                  <div>Category: <span className="font-semibold text-slate-800">{app.applicationCategory || "NORMAL"} ({app.serviceType || "FRESH"})</span></div>
                  <div>RPO: <span className="font-semibold text-slate-800">{app.rpoLocation || "RPO Chennai"}</span></div>
                </div>
              </div>
            </div>

            {/* Clarification Alert & Response Form */}
            {isClarificationNeeded && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-amber-950 text-base">Action Required: Clarification Requested by Passport Officer</h3>
                    <p className="text-xs text-amber-800 mt-1">
                      The reviewing officer has flagged an issue or discrepancy in your submitted particulars / documents. Please provide your clarification response below.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white border border-amber-200 rounded-lg text-xs text-slate-800 mb-4">
                  <span className="font-bold text-amber-950 block mb-0.5">Officer Query / Discrepancy Notice:</span>
                  <p className="italic">{app.clarificationReason || "Discrepancy noted in applicant address proof or identity credentials. Please clarify."}</p>
                </div>

                <form onSubmit={handleSendClarification} className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Your Explanation / Clarification Response:
                  </label>
                  <textarea
                    rows={3}
                    value={clarificationText}
                    onChange={(e) => setClarificationText(e.target.value)}
                    placeholder="Provide detailed explanation or clarification regarding the officer's query..."
                    required
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-600 bg-white"
                  ></textarea>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Your response will immediately appear on the reviewing Passport Officer's console.
                    </span>
                    <button
                      type="submit"
                      disabled={submittingClarification}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-amber-700 text-white text-xs font-bold rounded-lg hover:bg-amber-800 disabled:opacity-50 transition shadow-sm"
                    >
                      {submittingClarification ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting Response...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Transmit Clarification to Officer
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Passport Dispatch Card (if issued/dispatched) */}
            {app.passport && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  Passport Dispatch & Booklet Particulars
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white p-4 rounded-lg border border-emerald-200 text-xs">
                  <div>
                    <span className="text-slate-500 block">Passport Booklet Number:</span>
                    <span className="font-mono font-bold text-slate-900 text-base">{app.passport.passportNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date of Issue:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(app.passport.issueDate).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date of Expiry:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(app.passport.expiryDate).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">India Post Tracking ID:</span>
                    <span className="font-mono font-bold text-blue-900 text-sm">
                      {app.passport.trackingNumber || `IN${app.passport.passportNumber}TRK`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 8-Milestone Visual Stepper Progress Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
                End-to-End Passport Issuance Lifecycle
              </h2>

              <div className="relative">
                {/* Horizontal progress stepper for larger screens */}
                <div className="hidden md:grid grid-cols-8 gap-2 relative">
                  {milestones.map((m: any, idx: number) => {
                    const stepNum = idx + 1;
                    const isCompleted = milestoneStage > stepNum;
                    const isCurrent = milestoneStage === stepNum;

                    return (
                      <div key={m.key} className="text-center relative">
                        {/* Connecting line */}
                        {idx < milestones.length - 1 && (
                          <div
                            className={`absolute top-4 left-1/2 w-full h-1 -z-0 ${
                              milestoneStage > stepNum ? "bg-emerald-600" : "bg-slate-200"
                            }`}
                          ></div>
                        )}

                        {/* Step circle */}
                        <div
                          className={`relative z-10 w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs transition ${
                            isCompleted
                              ? "bg-emerald-600 text-white shadow-sm"
                              : isCurrent
                              ? isRejected
                                ? "bg-rose-600 text-white ring-4 ring-rose-100"
                                : "bg-blue-900 text-white ring-4 ring-blue-100"
                              : "bg-white border-2 border-slate-300 text-slate-400"
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                        </div>

                        {/* Label */}
                        <div className="mt-2.5">
                          <p className={`text-[11px] font-bold leading-tight ${
                            isCurrent ? "text-blue-950" : isCompleted ? "text-slate-900" : "text-slate-400"
                          }`}>
                            {m.label}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-snug hidden lg:block">
                            {m.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Vertical progression for mobile screens */}
                <div className="md:hidden space-y-4">
                  {milestones.map((m: any, idx: number) => {
                    const stepNum = idx + 1;
                    const isCompleted = milestoneStage > stepNum;
                    const isCurrent = milestoneStage === stepNum;

                    return (
                      <div key={m.key} className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                            isCompleted
                              ? "bg-emerald-600 text-white"
                              : isCurrent
                              ? "bg-blue-900 text-white"
                              : "border-2 border-slate-300 text-slate-400"
                          }`}
                        >
                          {isCompleted ? "✓" : stepNum}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isCurrent ? "text-blue-950" : "text-slate-700"}`}>
                            {m.label}
                          </p>
                          <p className="text-[11px] text-slate-500">{m.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Audit History Log (Chronological State Transitions) */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Official Application Status History ({app.history?.length || 0})
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Immutable statutory ledger of status transitions and officer observations.
                  </p>
                </div>
              </div>

              {(!app.history || app.history.length === 0) ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Application recorded. Status history entries will appear as scrutiny progresses.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">From Status</th>
                        <th className="p-3">To Status</th>
                        <th className="p-3">Actor Role</th>
                        <th className="p-3">Officer Remarks / Summary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {app.history.map((h: any) => (
                        <tr key={h.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                            {new Date(h.changedAt).toLocaleString("en-IN", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </td>
                          <td className="p-3">
                            <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                              {h.fromStatus}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-mono text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded text-[11px] font-bold">
                              {h.toStatus}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-700">{h.role || "SYSTEM"}</td>
                          <td className="p-3 text-slate-600 max-w-xs">{h.remarks || "State progressed normally"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
