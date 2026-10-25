"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import AcademicDisclaimer from "@/components/AcademicDisclaimer";
import Link from "next/link";
import { 
  Building2, 
  Clock, 
  UserCheck, 
  Fingerprint, 
  Camera, 
  FileCheck2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Award
} from "lucide-react";

export default function PskSimulationPage() {
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);
  const [applicant, setApplicant] = useState<any>(null);
  const [appointment, setAppointment] = useState<any>(null);

  // Simulation Stages:
  // 1: ARRIVAL & TOKEN GENERATION
  // 2: COUNTER A (Biometrics, Photo & DigiLocker Bypass)
  // 3: COUNTER B (Verification & Physical Scrutiny)
  // 4: COUNTER C (Granting Officer Decision)
  // 5: COMPLETED
  const [simStage, setSimStage] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [tokenNumber, setTokenNumber] = useState<string>("N-42");
  const [queuePosition, setQueuePosition] = useState<number>(3);
  const [estimatedWait, setEstimatedWait] = useState<number>(12); // minutes
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/applicant/application");
      if (res.ok) {
        const data = await res.json();
        setApplicant(data.applicant);
        setApplication(data.application);
        setAppointment(data.application?.appointment);

        // Pre-configure token based on Quota
        const isTatkaal = data.application?.applicationCategory === "TATKAAL";
        const prefix = isTatkaal ? "T" : "N";
        setTokenNumber(`${prefix}-${Math.floor(10 + Math.random() * 89)}`);
      }
    } catch (e) {
      console.error("Failed to load application data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const hasDigiLocker = application?.documents?.some(
    (d: any) => d.documentType?.includes("DigiLocker") || d.verifiedBy?.includes("DIGILOCKER")
  );

  // Transition stage handler
  async function advanceStage(nextStage: 2 | 3 | 4 | 5) {
    setProcessing(true);

    setTimeout(async () => {
      setProcessing(false);
      setSimStage(nextStage);

      if (nextStage === 2) {
        setStatusMessage("Citizen arrived at PSK. Token scanned and assigned to Counter A-04.");
        setQueuePosition(2);
        setEstimatedWait(6);
      } else if (nextStage === 3) {
        setStatusMessage("Biometrics, photo & digital signature captured. Proceeding to Verification Counter B.");
        setQueuePosition(1);
        setEstimatedWait(3);
      } else if (nextStage === 4) {
        setStatusMessage("Document inspection completed. Application forwarded to Granting Officer at Counter C.");
        setQueuePosition(0);
        setEstimatedWait(1);
      } else if (nextStage === 5) {
        // Update application status to POLICE_VERIFICATION_PENDING or DOCUMENT_VERIFIED
        setStatusMessage("Statutory Granting Decision approved! Application dispatched to local Police Station for background enquiry.");
        try {
          await fetch("/api/applicant/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              newStatus: "POLICE_VERIFICATION_PENDING",
              remarks: "Simulated PSK Visit completed successfully at Counter C.",
            }),
          });
        } catch (_) {}
      }
    }, 1000);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 font-semibold">Loading PSK Visit Simulator...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <AcademicDisclaimer />
      <Navbar role="APPLICANT" userName={applicant?.name || "Applicant"} />

      {/* Header */}
      <div className="bg-[#002B49] text-white py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-800/80 text-blue-200 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            Educational Appointment Day Simulation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Passport Seva Kendra (PSK) Visit Simulation
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-blue-200 max-w-2xl">
            Experience the step-by-step physical appointment workflow: Token Issuance &rarr; Counter A (Biometrics) &rarr; Counter B (Document Verification) &rarr; Counter C (Granting Decision).
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {/* Academic Simulation Banner */}
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">PSK Process Simulation (Educational Demo)</p>
            <p className="mt-0.5 text-amber-800">
              This interactive module demonstrates the in-person PSK workflow. It does not replace or control actual queues at physical government Passport Seva Kendras.
            </p>
          </div>
        </div>

        {/* Live Token & Centre Status Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Token Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Your Electronic Token
            </span>
            <div className="text-4xl font-extrabold text-blue-950 font-mono tracking-wider py-1">
              {tokenNumber}
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
              {application?.applicationCategory === "TATKAAL" ? "Tatkaal Express Queue" : "Normal Citizen Queue"}
            </span>
          </div>

          {/* Current Counter */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Current Designated Station
            </span>
            <div className="text-2xl font-extrabold text-slate-900 py-2">
              {simStage === 1 && "Entry & Security Gate"}
              {simStage === 2 && "Counter A (Biometrics)"}
              {simStage === 3 && "Counter B (Document Verification)"}
              {simStage === 4 && "Counter C (Granting Officer)"}
              {simStage === 5 && "Exit / Process Complete"}
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Location: {appointment?.location || "Chennai PSK (Saligramam)"}
            </span>
          </div>

          {/* Queue & Waiting Time */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Estimated Waiting Time
            </span>
            <div className="text-2xl font-extrabold text-emerald-700 py-2 flex items-center justify-center gap-1.5">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>{simStage === 5 ? "0 Mins" : `~${estimatedWait} Minutes`}</span>
            </div>
            <span className="text-xs text-slate-500">
              {simStage === 5 ? "All counters cleared" : `${queuePosition} citizens ahead in queue`}
            </span>
          </div>
        </div>

        {/* Workflow Progression Stepper */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-8 border-b pb-4">
            <span className={simStage >= 1 ? "text-blue-950 font-bold" : ""}>1. Arrival & Token</span>
            <span>&rarr;</span>
            <span className={simStage >= 2 ? "text-blue-950 font-bold" : ""}>2. Counter A (Biometrics)</span>
            <span>&rarr;</span>
            <span className={simStage >= 3 ? "text-blue-950 font-bold" : ""}>3. Counter B (Documents)</span>
            <span>&rarr;</span>
            <span className={simStage >= 4 ? "text-blue-950 font-bold" : ""}>4. Counter C (Granting)</span>
            <span>&rarr;</span>
            <span className={simStage >= 5 ? "text-emerald-700 font-bold" : ""}>5. Exit</span>
          </div>

          {/* STAGE 1: ARRIVAL */}
          {simStage === 1 && (
            <div className="text-center max-w-md mx-auto space-y-4 py-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Welcome to Regional Passport Seva Kendra
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Applicant <strong>{applicant?.name || "Aarav Sharma"}</strong> has arrived with Appointment Slip for ARN <strong>{application?.applicationId || "PAS-2026-XXXX"}</strong>.
              </p>

              {hasDigiLocker && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center gap-2 text-left">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>DigiLocker Fast-Track:</strong> e-Aadhaar pre-verified. Counter A will waive manual physical paper inspection.
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => advanceStage(2)}
                disabled={processing}
                className="w-full py-3 px-4 bg-blue-950 text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2 shadow"
              >
                {processing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Scan Appointment QR & Enter Counter A</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STAGE 2: COUNTER A */}
          {simStage === 2 && (
            <div className="max-w-lg mx-auto space-y-6 py-4">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full">
                  Service Executive Terminal A-04
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Citizen Biometrics & Photographic Capture
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Capturing live biometric fingerprints, iris scans, and ICAO-standard facial photo.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                  <Camera className="w-8 h-8 text-blue-900 mx-auto" />
                  <span className="text-xs font-bold text-slate-800 block">Live Photo</span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    ICAO 9303 Compliant
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                  <Fingerprint className="w-8 h-8 text-blue-900 mx-auto" />
                  <span className="text-xs font-bold text-slate-800 block">10-Fingerprint Scan</span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Quality Score: 98%
                  </span>
                </div>
              </div>

              {hasDigiLocker ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    DigiLocker Demographic Synchronization:
                  </p>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Aadhaar particulars cryptographically confirmed. Physical xerox collection bypassed.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700">
                  <p className="font-semibold">Physical Scrutiny:</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Original documents collected for verification by Verification Officer at Counter B.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => advanceStage(3)}
                disabled={processing}
                className="w-full py-3 px-4 bg-blue-950 text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2 shadow"
              >
                {processing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Complete Counter A & Proceed to Counter B</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STAGE 3: COUNTER B */}
          {simStage === 3 && (
            <div className="max-w-lg mx-auto space-y-6 py-4">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                  Verification Officer Terminal B-02
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Document Scrutiny & Cross-Verification
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Government official verifying original educational marksheets, address proofs, and nationality documents.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Identity Proof (Aadhaar / Voter):</span>
                  <span className="font-bold text-emerald-700">VERIFIED ✓</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Present Address Proof:</span>
                  <span className="font-bold text-emerald-700">VERIFIED ✓</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Municipal Date of Birth Proof:</span>
                  <span className="font-bold text-emerald-700">VERIFIED ✓</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600">Court / Criminal Check (Section 6(2)):</span>
                  <span className="font-bold text-emerald-700">NO ADVERSE RECORD ✓</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => advanceStage(4)}
                disabled={processing}
                className="w-full py-3 px-4 bg-blue-950 text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2 shadow"
              >
                {processing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Recommend for Granting & Send to Counter C</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STAGE 4: COUNTER C */}
          {simStage === 4 && (
            <div className="max-w-lg mx-auto space-y-6 py-4">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-full">
                  Granting Officer Terminal C-01
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Statutory Passport Granting Decision
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Senior Assistant Passport Officer (APO) exercising statutory powers under Passports Act, 1967.
                </p>
              </div>

              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-purple-950">
                  <Award className="w-4 h-4 text-purple-700" />
                  <span>Granting Decision Review:</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  All biometric traits, demographic declarations, and supporting records found complete and genuine. Police verification request will be transmitted electronically to <strong>{application?.policeStation || "Local Jurisdiction Police"}</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => advanceStage(5)}
                disabled={processing}
                className="w-full py-3 px-4 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition flex items-center justify-center gap-2 shadow"
              >
                {processing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Grant Passport & Issue Police Verification Request</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STAGE 5: COMPLETED */}
          {simStage === 5 && (
            <div className="text-center max-w-md mx-auto space-y-6 py-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  PSK Visit Successfully Concluded
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  Passport Granted — Awaiting Police Clearance
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Your physical verification visit has been completed successfully. Your application status is now updated to <strong>POLICE_VERIFICATION_PENDING</strong>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Token Number:</span>
                  <span className="font-mono font-bold text-slate-900">{tokenNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Next Action:</span>
                  <span className="font-semibold text-blue-900">Police Background Enquiry</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Station:</span>
                  <span className="font-medium text-slate-800">{application?.policeStation || "Central Police Station"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/applicant/status"
                  className="w-1/2 py-2.5 px-4 bg-blue-950 text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition flex items-center justify-center gap-1.5 shadow"
                >
                  <span>Track Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/applicant/dashboard"
                  className="w-1/2 py-2.5 px-4 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
