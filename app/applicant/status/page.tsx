"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ApplicantStatusPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applicant, setApplicant] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [stages, setStages] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/applicant/status");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setApplicant(data.applicant);
        setApplication(data.application);
        setStages(data.stages || []);
      } catch (err) {
        console.error("Failed to load status:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">Loading passport live tracking system...</p>
      </main>
    );
  }

  const currentStatus = application?.status || "DRAFT";

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

  const currentIndex = statusOrder.indexOf(currentStatus);
  const isRejected = currentStatus === "REJECTED";

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-16">
      <Navbar
        role="APPLICANT"
        userName={applicant?.name || "Applicant"}
        badgeLabel={application ? `App: ${application.applicationId}` : "PAS"}
      />

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <div>
            <Link
              href="/applicant/dashboard"
              className="text-xs text-blue-400 hover:text-blue-300 mb-1.5 inline-block font-medium"
            >
              ← Back to Dashboard
            </Link>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Real-time Passport Processing Tracker
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live lifecycle synchronization with RPO Officer Console & District Police Authority.
            </p>
          </div>

          {application && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-right">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">
                Current Stage
              </span>
              <span className="font-mono text-xs font-bold text-emerald-400">
                {currentStatus.replace(/_/g, " ")}
              </span>
            </div>
          )}
        </div>

        {!application ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-12 text-center shadow-xl">
            <p className="text-4xl mb-3">📋</p>
            <h3 className="text-lg font-bold text-white">No active application in system</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Please start by filling out your digital passport application form.
            </p>
            <Link
              href="/applicant/application"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
            >
              Start Application Form →
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Realistic Passport Booklet Card (When Passport is Generated/Issued) */}
            {application.passport && (
              <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 p-8 shadow-2xl relative overflow-hidden">
                {/* Hologram & National Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-5">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/40 text-2xl text-amber-300 shadow-inner">
                      🇮🇳
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                        Republic of India • e-Passport
                      </span>
                      <h3 className="text-lg font-extrabold text-white">
                        Official Standard Passport Booklet
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        ICAO 9303 Compliant Machine-Readable Travel Document
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/40 px-3.5 py-1 text-xs font-bold text-emerald-300">
                    {application.passport.dispatchStatus}
                  </span>
                </div>

                {/* Passport Particulars Grid */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-800/90 bg-slate-950/80 p-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Passport Number
                    </span>
                    <span className="font-mono text-xl font-extrabold text-amber-300 mt-1 block tracking-wider">
                      {application.passport.passportNumber}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-800/90 bg-slate-950/80 p-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Bearer / Holder Name
                    </span>
                    <span className="text-sm font-bold text-white mt-1 block">
                      {applicant.name}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-800/90 bg-slate-950/80 p-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Date of Issue
                    </span>
                    <span className="text-sm font-semibold text-slate-200 mt-1 block">
                      {new Date(application.passport.issueDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-800/90 bg-slate-950/80 p-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Date of Expiry (10 Yrs)
                    </span>
                    <span className="text-sm font-bold text-emerald-400 mt-1 block">
                      {new Date(application.passport.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Simulated MRZ Zone */}
                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-[11px] text-slate-400 tracking-widest overflow-x-auto select-none">
                  <p>P&lt;IND{applicant.name.toUpperCase().replace(/\s+/g, "&lt;")}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
                  <p>{application.passport.passportNumber}&lt;9IND9805152M3605158&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;8</p>
                </div>

                {/* Speed Post Live Shipment Tracker */}
                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📦</span>
                      <div>
                        <p className="text-xs font-bold text-white">
                          Speed Post India • Consignment Tracking
                        </p>
                        <p className="text-[11px] font-mono text-cyan-300">
                          Tracking AWB: IN{application.passport.passportNumber}SP
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-emerald-400">
                      Destination: {applicant.address}
                    </span>
                  </div>

                  {/* Consignment Checkpoints */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5">
                      <span className="text-emerald-400 font-bold block text-[10px]">1. BOOKED</span>
                      <span className="text-slate-300 text-[11px]">Central Security Press</span>
                    </div>
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5">
                      <span className="text-emerald-400 font-bold block text-[10px]">2. DISPATCHED</span>
                      <span className="text-slate-300 text-[11px]">National Sorting Hub</span>
                    </div>
                    <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-2.5">
                      <span className="text-blue-400 font-bold block text-[10px]">3. IN TRANSIT</span>
                      <span className="text-slate-300 text-[11px]">Regional PSK Hub</span>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5">
                      <span className="text-slate-400 font-bold block text-[10px]">4. DELIVERY</span>
                      <span className="text-slate-500 text-[11px]">Resident Signature</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Notice */}
            {isRejected && (
              <div className="rounded-2xl border border-red-500/40 bg-red-950/30 p-6 shadow-xl">
                <div className="flex items-center gap-3 text-red-400 font-bold text-base">
                  <span>⚠️</span> Application Rejected During Scrutiny
                </div>
                <p className="text-xs text-red-200 mt-2 leading-relaxed">
                  Your passport application was reviewed and rejected. Please review your submitted documents or report to the Regional Passport Office for clarification before filing a new application.
                </p>
              </div>
            )}

            {/* Visual Workflow Timeline */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 shadow-2xl">
              <h3 className="text-sm font-bold border-b border-slate-800 pb-4 mb-6 flex items-center justify-between text-white">
                <span>📍 Lifecycle Workflow Progression Timeline</span>
                <span className="text-[10px] font-mono text-slate-400">
                  Realization: Application realizes IStatusTracker
                </span>
              </h3>

              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
                {stages.map((stg, idx) => {
                  const stageIndex = statusOrder.indexOf(stg.key);
                  const isCompleted = currentIndex >= stageIndex && !isRejected;
                  const isCurrent = currentStatus === stg.key;

                  let dotColor = "bg-slate-800 border-slate-700 text-slate-500";
                  if (isCompleted) {
                    dotColor = "bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/30";
                  } else if (isCurrent) {
                    dotColor = "bg-blue-600 border-blue-400 text-white animate-pulse";
                  }

                  return (
                    <div key={stg.key} className="relative flex items-start gap-4 pl-2">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition ${dotColor}`}
                      >
                        {isCompleted ? "✓" : idx + 1}
                      </div>

                      <div className="flex-1 rounded-xl border border-slate-800/70 bg-slate-950/70 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4
                            className={`text-xs font-bold ${
                              isCompleted || isCurrent ? "text-white" : "text-slate-500"
                            }`}
                          >
                            {stg.label}
                          </h4>
                          <span
                            className={`text-[9px] font-mono uppercase font-bold ${
                              isCurrent
                                ? "text-blue-400"
                                : isCompleted
                                ? "text-emerald-400"
                                : "text-slate-600"
                            }`}
                          >
                            {isCurrent ? "IN PROGRESS" : isCompleted ? "COMPLETED" : "PENDING"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{stg.desc}</p>

                        {/* Additional contextual notes */}
                        {stg.key === "APPOINTMENT_SCHEDULED" && application.appointment && (
                          <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 text-xs text-cyan-300 flex items-center justify-between">
                            <span>Slot: {new Date(application.appointment.date).toLocaleDateString()} ({application.appointment.timeSlot})</span>
                            <span className="text-[10px] font-mono">ARN: {application.appointment.appointmentId}</span>
                          </div>
                        )}

                        {stg.key === "POLICE_CLEARED" && application.policeReports?.length > 0 && (
                          <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 text-xs text-emerald-300">
                            Clearance: {application.policeReports[0].clearanceStatus} • Remarks: {application.policeReports[0].remarks}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
