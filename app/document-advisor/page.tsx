"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import AcademicDisclaimer from "@/components/AcademicDisclaimer";
import Link from "next/link";
import { 
  FileCheck2, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  FileText,
  User,
  Sparkles
} from "lucide-react";

export default function DocumentAdvisorPage() {
  const [service, setService] = useState("FRESH"); // FRESH, REISSUE, PCC
  const [ageGroup, setAgeGroup] = useState("ADULT"); // MINOR, ADULT
  const [hasDigiLocker, setHasDigiLocker] = useState(true);
  const [isNonEcr, setIsNonEcr] = useState(true);
  const [reissueReason, setReissueReason] = useState("EXPIRED");

  // Dynamic Document Requirements
  const docsList = [];

  // 1. Proof of Identity (POI)
  if (hasDigiLocker) {
    docsList.push({
      category: "Proof of Identity (POI)",
      status: "DIGILOCKER_SATISFIED",
      document: "Aadhaar Card (UIDAI Electronic DigiLocker Pull)",
      mandatory: true,
      note: "Cryptographically verified via National Gateway. Physical checking at Counter A is waived.",
    });
  } else {
    docsList.push({
      category: "Proof of Identity (POI)",
      status: "REQUIRED",
      document: "Aadhaar Card / Voter ID Card / PAN Card / Driving Licence",
      mandatory: true,
      note: "Original and self-attested photocopy required for inspection at Counter B.",
    });
  }

  // 2. Proof of Present Residential Address (POA)
  if (hasDigiLocker) {
    docsList.push({
      category: "Proof of Present Address (POA)",
      status: "DIGILOCKER_SATISFIED",
      document: "Aadhaar Card (UIDAI Registered Address)",
      mandatory: true,
      note: "Address automatically extracted and validated from Aadhaar demographic vault.",
    });
  } else {
    docsList.push({
      category: "Proof of Present Address (POA)",
      status: "REQUIRED",
      document: "Water / Electricity Bill (last 3 months) / Scheduled Bank Passbook with Photo / Rent Agreement",
      mandatory: true,
      note: "Must show applicant's name and exact residential address matching application form.",
    });
  }

  // 3. Proof of Date of Birth (DOB)
  if (ageGroup === "MINOR") {
    docsList.push({
      category: "Proof of Date of Birth (DOB)",
      status: "REQUIRED",
      document: "Municipal Birth Certificate / Registrar of Births & Deaths",
      mandatory: true,
      note: "Mandatory for all minor applicants under the Passports Act.",
    });
  } else if (hasDigiLocker) {
    docsList.push({
      category: "Proof of Date of Birth (DOB)",
      status: "DIGILOCKER_SATISFIED",
      document: "e-Aadhaar / DigiLocker CBSE Class X Passing Certificate",
      mandatory: true,
      note: "Verified electronically against central educational board repository.",
    });
  } else {
    docsList.push({
      category: "Proof of Date of Birth (DOB)",
      status: "REQUIRED",
      document: "Birth Certificate / School Transfer Certificate / 10th Standard Marksheet",
      mandatory: true,
      note: "Must show exact date of birth matching personal particulars.",
    });
  }

  // 4. Non-ECR Proof (Emigration Check Not Required)
  if (ageGroup === "ADULT" && isNonEcr) {
    docsList.push({
      category: "Non-ECR Category Qualification",
      status: hasDigiLocker ? "DIGILOCKER_SATISFIED" : "REQUIRED",
      document: "Matriculation / 10th Standard Passing Certificate or Degree Certificate",
      mandatory: false,
      note: "Exempts citizen from emigration clearance when traveling for employment abroad.",
    });
  }

  // 5. Minor Parent Consent (Annexure D / C)
  if (ageGroup === "MINOR") {
    docsList.push({
      category: "Parental Declaration (Annexure D)",
      status: "REQUIRED",
      document: "Declaration by Parents / Guardian on Plain Paper with Signatures",
      mandatory: true,
      note: "Copies of both parents' valid Indian passports must be submitted.",
    });
  }

  // 6. Re-issue specifics
  if (service === "REISSUE") {
    if (reissueReason === "LOST" || reissueReason === "DAMAGED") {
      docsList.push({
        category: "Loss / Damage Documentation",
        status: "REQUIRED",
        document: "Police FIR / Incident Report + Affidavit in Annexure F",
        mandatory: true,
        note: "Required to document circumstances of lost or mutilated passport booklet.",
      });
    } else {
      docsList.push({
        category: "Previous Passport Records",
        status: "REQUIRED",
        document: "Old Passport Booklet (First 2 & Last 2 Pages Scanned Copy)",
        mandatory: true,
        note: "Original booklet must be presented at Counter B for physical cancellation stamp.",
      });
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <AcademicDisclaimer />
      <Navbar role="APPLICANT" userName="Citizen Portal" />

      {/* Header */}
      <div className="bg-[#002B49] text-white py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-800/80 text-blue-200 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Statutory Document Advisor
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Intelligent Document Checklist
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-blue-200 max-w-xl">
            Answer a few quick questions to receive a tailored, customized statutory document checklist for your passport visit.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Question controls (5) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
              Your Profile Parameters
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Applying For
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-900"
              >
                <option value="FRESH">Fresh Passport (First Time)</option>
                <option value="REISSUE">Re-issue of Existing Passport</option>
                <option value="PCC">Police Clearance Certificate (PCC)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Applicant Age Group
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-900"
              >
                <option value="ADULT">Adult (18 Years and Above)</option>
                <option value="MINOR">Minor (Below 18 Years)</option>
              </select>
            </div>

            {service === "REISSUE" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Re-issue
                </label>
                <select
                  value={reissueReason}
                  onChange={(e) => setReissueReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-900"
                >
                  <option value="EXPIRED">Validity Expired / Expiring Within 1 Year</option>
                  <option value="EXHAUSTED">Visa Pages Exhausted</option>
                  <option value="LOST">Lost / Stolen Passport</option>
                  <option value="DAMAGED">Damaged / Mutilated Passport</option>
                  <option value="CHANGE_ADDRESS">Change of Residential Address</option>
                </select>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDigiLocker}
                  onChange={(e) => setHasDigiLocker(e.target.checked)}
                  className="rounded text-blue-900 focus:ring-blue-900"
                />
                <span className="text-xs font-semibold text-slate-800">
                  I have an active DigiLocker account (Recommended)
                </span>
              </label>
              <p className="text-[11px] text-slate-400 pl-6 leading-tight">
                Importing e-Aadhaar waives physical document checking at Counter A.
              </p>

              <label className="flex items-center gap-2.5 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={isNonEcr}
                  onChange={(e) => setIsNonEcr(e.target.checked)}
                  className="rounded text-blue-900 focus:ring-blue-900"
                />
                <span className="text-xs font-semibold text-slate-800">
                  I hold 10th standard pass or higher degree (Non-ECR)
                </span>
              </label>
            </div>

            <div className="pt-4">
              <Link
                href="/applicant/documents"
                className="w-full py-2.5 px-4 bg-blue-950 text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Go to Document Locker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Checklist Output Column (7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Your Statutory Document Checklist ({docsList.length} Items)
                  </h2>
                </div>
                {hasDigiLocker && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    DigiLocker Fast-Track
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {docsList.map((item, idx) => {
                  const isDigi = item.status === "DIGILOCKER_SATISFIED";

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition ${
                        isDigi
                          ? "bg-emerald-50/60 border-emerald-300"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            {item.category}
                          </span>
                          {item.mandatory && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                              Mandatory
                            </span>
                          )}
                        </div>

                        {isDigi ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            DigiLocker Waived
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded shrink-0">
                            Physical Copy
                          </span>
                        )}
                      </div>

                      <p className="font-semibold text-xs text-slate-800 mt-1">
                        {item.document}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {item.note}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Counter A Exemption Summary */}
              {hasDigiLocker && (
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Fast-Track Paperless Processing Active</p>
                    <p className="text-emerald-800 text-[11px] mt-0.5">
                      Because you are utilizing DigiLocker verification, you do not need to carry physical photocopies of identity, address, and date of birth proofs to Counter A.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
