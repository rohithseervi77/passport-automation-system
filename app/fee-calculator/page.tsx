"use client";

import React, { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { 
  Calculator, 
  Info, 
  CheckCircle2, 
  ArrowRight, 
  CreditCard, 
  HelpCircle,
  ShieldAlert,
  FileText,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { calculatePassportFee, FeeCalculationParams } from "@/lib/feeSchedule";

export default function FeeCalculatorPage() {
  const [serviceType, setServiceType] = useState<"FRESH" | "REISSUE" | "LOST_DAMAGED" | "PCC">("FRESH");
  const [quota, setQuota] = useState<"NORMAL" | "TATKAAL">("NORMAL");
  const [age, setAge] = useState<number>(25);
  const [bookletType, setBookletType] = useState<"36_PAGES" | "60_PAGES">("36_PAGES");

  // Calculate using centralized statutory engine
  const calculation = useMemo(() => {
    return calculatePassportFee({
      serviceType,
      applicationCategory: quota,
      bookletType: serviceType === "PCC" ? "NA" : bookletType,
      age: Math.max(0, Math.min(120, Number(age) || 0)),
      isLostOrDamaged: serviceType === "LOST_DAMAGED",
    });
  }, [serviceType, quota, bookletType, age]);

  function setPresetAge(presetAge: number) {
    setAge(presetAge);
  }

  function handleReset() {
    setServiceType("FRESH");
    setQuota("NORMAL");
    setAge(25);
    setBookletType("36_PAGES");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16 flex flex-col justify-between">
      <div>
        <Navbar role="APPLICANT" userName="Citizen Portal" />

        {/* Hero Section */}
        <div className="bg-[#002B49] text-white py-10 px-4 sm:px-6 border-b border-blue-900">
          <div className="mx-auto max-w-5xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-800/80 text-blue-200 text-xs font-semibold mb-2 border border-blue-700/60">
              <Calculator className="w-3.5 h-3.5 text-amber-300" />
              Statutory Fee Schedule • Effective 1 July 2026
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Passport Fee Estimator & Breakdown
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-blue-200/90 max-w-2xl leading-relaxed">
              Calculates the official statutory passport application fees, Tatkaal expedited surcharges, and
              concessions based on Gazette of India Notification G.S.R. 516(E) dated 25 June 2026.
            </p>
          </div>
        </div>

        {/* Gazette Notification Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-xs text-amber-950">
          <div className="mx-auto max-w-5xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-amber-500 text-white text-[10px] font-bold uppercase shadow-2xs">
                Gazette G.S.R. 516(E)
              </span>
              <span>
                Statutory revision effective <strong>1 July 2026</strong> under Section 24 of Passports Act, 1967.
              </span>
            </div>
            <a
              href="https://www.passportindia.gov.in/psp/Notification"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-900 font-bold hover:underline shrink-0"
            >
              Verify Gazette Reference
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Parameters Form (Left Column, 7 cols) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Select Application Parameters
                </h2>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-blue-900 font-semibold hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Defaults
                </button>
              </div>

              {/* 1. Service Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  1. Service Required
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "FRESH", label: "Fresh Passport", sub: "First-time applicant" },
                    { id: "REISSUE", label: "Re-issue / Renew", sub: "Expired / Exhausted" },
                    { id: "LOST_DAMAGED", label: "Lost / Damaged", sub: "Replacement booklet" },
                    { id: "PCC", label: "PCC Certificate", sub: "Police clearance" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setServiceType(s.id as any)}
                      className={`p-3 rounded-xl border text-left transition shadow-2xs ${
                        serviceType === s.id
                          ? "bg-blue-950 text-white border-blue-950 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-bold text-xs block">{s.label}</span>
                      <span className={`text-[10px] block mt-0.5 ${serviceType === s.id ? "text-blue-200" : "text-slate-400"}`}>
                        {s.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Applicant Age Category */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    2. Applicant Age (Years)
                  </label>
                  <span className="text-[11px] font-bold text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {age <= 8
                      ? "Child (≤ 8 Yrs — 10% Discount)"
                      : age < 18
                      ? "Minor (9–17 Yrs)"
                      : age >= 60
                      ? "Senior Citizen (≥ 60 Yrs — 10% Discount)"
                      : "Adult (18–59 Yrs)"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(Math.max(0, Math.min(120, parseInt(e.target.value, 10) || 0)))}
                    className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 flex-1">
                    {[
                      { label: "Child (5)", val: 5 },
                      { label: "Minor (15)", val: 15 },
                      { label: "Adult (28)", val: 28 },
                      { label: "Senior (65)", val: 65 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setPresetAge(p.val)}
                        className={`px-2.5 py-1.5 rounded-md border text-xs font-semibold transition ${
                          age === p.val
                            ? "bg-blue-100 text-blue-900 border-blue-300"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {serviceType === "FRESH" && (age <= 8 || age >= 60) && (
                  <p className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    Eligible for 10% statutory concession on basic fresh application fee.
                  </p>
                )}
                {serviceType === "REISSUE" && (age <= 8 || age >= 60) && (
                  <p className="mt-2 text-[11px] text-slate-500 italic">
                    * Note: 10% concession applies only to Fresh passport applications, not Re-issues.
                  </p>
                )}
              </div>

              {/* 3. Processing Scheme (Normal vs Tatkaal) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  3. Processing Scheme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setQuota("NORMAL")}
                    className={`p-3 rounded-xl border text-left transition shadow-2xs ${
                      quota === "NORMAL"
                        ? "bg-blue-950 text-white border-blue-950 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold text-xs block">Normal Quota</span>
                    <span className={`text-[10px] block mt-0.5 ${quota === "NORMAL" ? "text-blue-200" : "text-slate-400"}`}>
                      Standard processing & police scrutiny
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={serviceType === "PCC"}
                    onClick={() => setQuota("TATKAAL")}
                    className={`p-3 rounded-xl border text-left transition shadow-2xs ${
                      serviceType === "PCC"
                        ? "opacity-50 cursor-not-allowed bg-slate-100 border-slate-200"
                        : quota === "TATKAAL"
                        ? "bg-blue-950 text-white border-blue-950 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold text-xs block">Tatkaal Fast-Track</span>
                    <span className={`text-[10px] block mt-0.5 ${quota === "TATKAAL" ? "text-blue-200" : "text-slate-400"}`}>
                      {serviceType === "PCC" ? "Not applicable for PCC" : "Priority dispatch & fast-track"}
                    </span>
                  </button>
                </div>
              </div>

              {/* 4. Booklet Size */}
              {serviceType !== "PCC" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    4. Passport Booklet Size
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBookletType("36_PAGES")}
                      className={`p-3 rounded-xl border text-left transition shadow-2xs ${
                        bookletType === "36_PAGES"
                          ? "bg-blue-950 text-white border-blue-950 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-bold text-xs block">Standard 36 Pages</span>
                      <span className={`text-[10px] block mt-0.5 ${bookletType === "36_PAGES" ? "text-blue-200" : "text-slate-400"}`}>
                        Standard citizen travel requirements
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={age < 18}
                      onClick={() => setBookletType("60_PAGES")}
                      className={`p-3 rounded-xl border text-left transition shadow-2xs ${
                        age < 18
                          ? "opacity-50 cursor-not-allowed bg-slate-100 border-slate-200"
                          : bookletType === "60_PAGES"
                          ? "bg-blue-950 text-white border-blue-950 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-bold text-xs block">Frequent Traveler 60 Pages</span>
                      <span className={`text-[10px] block mt-0.5 ${bookletType === "60_PAGES" ? "text-blue-200" : "text-slate-400"}`}>
                        {age < 18 ? "Jumbo booklet adult-only" : "Jumbo booklet for heavy travelers"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Calculation Breakdown & Action (Right Column, 5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white border-2 border-blue-950 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Statutory Estimate
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                    Official GSR 516(E)
                  </span>
                </div>

                {/* Big Total Fee Amount */}
                <div className="text-center py-2">
                  <span className="text-xs text-slate-500 block font-medium">Estimated Application Amount</span>
                  <div className="text-4xl sm:text-5xl font-black text-blue-950 tracking-tight mt-1">
                    ₹{calculation.totalFee.toLocaleString("en-IN")}
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    (Statutory Fee Inclusive of all applicable surcharges)
                  </span>
                </div>

                {/* Line Item Breakdown */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                  {calculation.breakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className={item.isDeduction ? "text-emerald-700 font-semibold" : "text-slate-600"}>
                        {item.label}
                      </span>
                      <span className={`font-mono font-bold ${item.isDeduction ? "text-emerald-700" : "text-slate-900"}`}>
                        {item.isDeduction ? `– ₹${item.amount.toLocaleString("en-IN")}` : `₹${item.amount.toLocaleString("en-IN")}`}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-sm text-slate-900">
                    <span>Total Prescribed Fee</span>
                    <span className="font-mono text-blue-950">₹{calculation.totalFee.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Discount Banner if applicable */}
                {calculation.isDiscountEligible && calculation.discountReason && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                    <span className="font-bold block mb-0.5">✓ Concession Applied:</span>
                    <p className="text-[11px] leading-relaxed text-emerald-800">
                      {calculation.discountReason}
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-2">
                  <Link
                    href="/applicant/application"
                    className="w-full py-3 px-4 rounded-xl bg-blue-950 text-white font-bold text-xs hover:bg-blue-900 transition shadow-xs flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Apply Online</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Statutory Legal Notice Card */}
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-blue-950" />
                  Statutory Reference Details
                </div>
                <div className="space-y-1 text-[11px] leading-relaxed">
                  <p>• <strong>Notification:</strong> {calculation.gazetteReference}</p>
                  <p>• <strong>Effective From:</strong> {calculation.effectiveDate}</p>
                  <p>• <strong>Last Verified:</strong> {calculation.lastVerifiedDate}</p>
                  <p className="pt-1 text-slate-500 italic">
                    Educational Simulation: This tool calculates illustrative amounts conforming to the Gazette schedule and is not a request for real government funds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-12">
        <p>Passport Automation System (PAS) • Academic Software Architecture & Workflow Simulation</p>
      </footer>
    </main>
  );
}
