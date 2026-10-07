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
        <p className="text-slate-400">Loading tracking status...</p>
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

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/applicant/dashboard"
              className="text-xs text-blue-400 hover:text-blue-300 mb-2 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <h2 className="text-3xl font-bold">Application Status & Tracking</h2>
            <p className="text-sm text-slate-400 mt-1">
              Real-time progression through Passport Officer review, Police enquiry, and issuance.
            </p>
          </div>

          {application && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Status Tracker
              </span>
              <span className="font-mono text-sm font-semibold text-emerald-400">
                {currentStatus.replace(/_/g, " ")}
              </span>
            </div>
          )}
        </div>

        {!application ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
            <p className="text-4xl mb-3">📋</p>
            <h3 className="text-xl font-bold">No active application found</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
              You have not submitted a passport application yet. Please start by completing your application form.
            </p>
            <Link
              href="/applicant/application"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold hover:bg-blue-700 transition"
            >
              Start Application Form
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Passport Card (Shown when passport is issued) */}
            {application.passport && (
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">
                  🛂
                </div>

                <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      PAS
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-amber-300">
                        Republic of India • Official Passport
                      </h3>
                      <p className="text-xs text-slate-400">
                        Passport Automation System Digitized Document
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
                    {application.passport.dispatchStatus}
                  </span>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Passport Number
                    </span>
                    <span className="font-mono text-lg font-bold text-white mt-1 block">
                      {application.passport.passportNumber}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Holder Name
                    </span>
                    <span className="text-sm font-semibold text-slate-200 mt-1 block">
                      {applicant.name}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Issue Date
                    </span>
                    <span className="text-sm font-semibold text-slate-200 mt-1 block">
                      {new Date(application.passport.issueDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Expiry Date
                    </span>
                    <span className="text-sm font-semibold text-amber-400 mt-1 block">
                      {new Date(application.passport.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Dispatch & Shipment Tracking */}
                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📦</span>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        Carrier: Speed Post India (Consignment)
                      </p>
                      <p className="text-[11px] font-mono text-slate-400">
                        AWB / Tracking No: IN{application.passport.passportNumber}SP
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-emerald-400 font-medium">
                      Status: {application.passport.dispatchStatus}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Destination: {applicant.address}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Alert */}
            {isRejected && (
              <div className="rounded-2xl border border-red-500/40 bg-red-950/30 p-6">
                <div className="flex items-center gap-3 text-red-400 font-bold text-lg">
                  <span>⚠️</span> Application Rejected
                </div>
                <p className="text-xs text-red-200 mt-2">
                  Your passport application was reviewed and rejected during official verification. Please contact the Regional Passport Office for clarification or submit a new application with rectified documentation.
                </p>
              </div>
            )}

            {/* Visual Workflow Timeline */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
              <h3 className="text-base font-semibold border-b border-slate-800 pb-4 mb-6 flex items-center justify-between">
                <span>📍 Lifecycle Workflow Progression</span>
                <span className="text-xs font-normal text-slate-400">
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

                      <div className="flex-1 rounded-xl border border-slate-800/60 bg-slate-950/50 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4
                            className={`text-sm font-semibold ${
                              isCompleted || isCurrent ? "text-white" : "text-slate-500"
                            }`}
                          >
                            {stg.label}
                          </h4>
                          <span
                            className={`text-[10px] font-mono uppercase ${
                              isCurrent
                                ? "text-blue-400 font-bold"
                                : isCompleted
                                ? "text-emerald-400"
                                : "text-slate-600"
                            }`}
                          >
                            {isCurrent ? "IN PROGRESS" : isCompleted ? "COMPLETED" : "PENDING"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{stg.desc}</p>

                        {/* Additional contextual notes for specific stages */}
                        {stg.key === "APPOINTMENT_SCHEDULED" && application.appointment && (
                          <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 text-xs text-cyan-300">
                            Slot: {new Date(application.appointment.date).toLocaleDateString()} at {application.appointment.timeSlot}
                          </div>
                        )}

                        {stg.key === "POLICE_CLEARED" && application.policeReports?.length > 0 && (
                          <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/90 p-2.5 text-xs text-emerald-300">
                            Clearance Status: {application.policeReports[0].clearanceStatus} • Remarks: {application.policeReports[0].remarks || "All background checks verified."}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick summary box */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400">Have questions about your application status?</p>
                <p className="text-sm font-medium text-white">Passport Seva Helpline: 1800-258-1800 (Toll Free)</p>
              </div>

              <Link
                href="/applicant/dashboard"
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
