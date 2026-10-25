"use client";

import React, { useState } from "react";
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
  FileText
} from "lucide-react";

export default function FeeCalculatorPage() {
  const [service, setService] = useState("FRESH"); // FRESH, REISSUE, PCC
  const [quota, setQuota] = useState("NORMAL"); // NORMAL, TATKAAL
  const [ageGroup, setAgeGroup] = useState("ADULT"); // MINOR, ADULT, SENIOR
  const [bookletType, setBookletType] = useState("36_PAGES"); // 36_PAGES, 60_PAGES

  // Calculation Logic
  let baseFee = 1500;
  let tatkaalFee = 0;
  let description = "Standard Adult Passport (36 Pages) - 10 Years Validity";

  if (service === "PCC") {
    baseFee = 500;
    description = "Police Clearance Certificate (PCC)";
  } else if (ageGroup === "MINOR") {
    baseFee = 1000;
    description = "Minor Passport (36 Pages) - 5 Years Validity / till age 18";
  } else {
    if (bookletType === "60_PAGES") {
      baseFee = 2000;
      description = "Frequent Traveler Passport (60 Pages) - 10 Years Validity";
    } else {
      baseFee = 1500;
      description = "Standard Adult Passport (36 Pages) - 10 Years Validity";
    }
  }

  if (service !== "PCC" && quota === "TATKAAL") {
    tatkaalFee = 2000;
  }

  const totalFee = baseFee + tatkaalFee;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <Navbar role="APPLICANT" userName="Citizen Portal" />

      {/* Header */}
      <div className="bg-[#002B49] text-white py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-800/80 text-blue-200 text-xs font-semibold mb-2">
            <Calculator className="w-3.5 h-3.5" />
            Statutory Fee Estimator
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Passport Fee Calculator
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-blue-200 max-w-xl">
            Simulate and estimate passport application charges based on service category, age group, and urgency.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {/* Academic Disclaimer Callout */}
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Educational Demo Calculation</p>
            <p className="mt-0.5 text-amber-800">
              The figures below reflect simulated educational schedules inspired by passport fee structures. They do not constitute official statutory demand notes by the Government of India.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column (7) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
              Application Parameters
            </h2>

            {/* Service Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                1. Select Service Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "FRESH", label: "Fresh Passport" },
                  { id: "REISSUE", label: "Re-issue" },
                  { id: "PCC", label: "PCC" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setService(s.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition text-center ${
                      service === s.id
                        ? "bg-blue-900 text-white border-blue-900 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quota Selection */}
            {service !== "PCC" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  2. Processing Urgency (Quota)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "NORMAL", label: "Normal Scheme", desc: "Standard PSK queue & dispatch" },
                    { id: "TATKAAL", label: "Tatkaal Scheme", desc: "Express priority dispatch (+₹2,000)" },
                  ].map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setQuota(q.id)}
                      className={`p-3 rounded-lg text-left border transition ${
                        quota === q.id
                          ? "bg-blue-50 border-blue-900 text-blue-950 shadow-xs ring-1 ring-blue-900"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="font-bold text-xs block">{q.label}</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{q.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Age Group */}
            {service !== "PCC" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  3. Applicant Age Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "MINOR", label: "Minor (< 18 yrs)" },
                    { id: "ADULT", label: "Adult (18–60 yrs)" },
                    { id: "SENIOR", label: "Senior (60+ yrs)" },
                  ].map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAgeGroup(a.id)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition text-center ${
                        ageGroup === a.id
                          ? "bg-blue-900 text-white border-blue-900 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Booklet Pages */}
            {service !== "PCC" && ageGroup !== "MINOR" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  4. Booklet Size (Pages)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "36_PAGES", label: "36 Pages Booklet", desc: "Recommended for regular travelers" },
                    { id: "60_PAGES", label: "60 Pages Booklet", desc: "For frequent international flyers (+₹500)" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBookletType(b.id)}
                      className={`p-3 rounded-lg text-left border transition ${
                        bookletType === b.id
                          ? "bg-blue-50 border-blue-900 text-blue-950 shadow-xs ring-1 ring-blue-900"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="font-bold text-xs block">{b.label}</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{b.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Breakdown & Summary Column (5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 mb-4">
                Fee Breakdown
              </h2>

              <div className="space-y-3 text-xs mb-6">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600">Base Application Fee:</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">₹{baseFee.toLocaleString("en-IN")}</span>
                </div>

                {tatkaalFee > 0 && (
                  <div className="flex items-center justify-between py-1 text-amber-900 bg-amber-50 p-2 rounded">
                    <span>Tatkaal Priority Charge:</span>
                    <span className="font-bold font-mono text-sm">+₹{tatkaalFee.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex items-center justify-between py-1 text-slate-400">
                  <span>DigiLocker Convenience Fee:</span>
                  <span className="font-bold text-emerald-700 font-mono">₹0 (Free)</span>
                </div>

                <div className="pt-3 border-t-2 border-slate-900 flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">Total Payable Amount:</span>
                  <span className="font-extrabold text-xl text-blue-950 font-mono">
                    ₹{totalFee.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1 mb-6">
                <p className="font-bold text-slate-800">Selected Description:</p>
                <p>{description} under {quota} processing quota.</p>
              </div>

              <div className="space-y-2">
                <Link
                  href={`/applicant/application?service=${service}&quota=${quota}&pages=${bookletType}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-950 text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition shadow-sm"
                >
                  <span>Apply with This Configuration</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/services"
                  className="w-full flex items-center justify-center py-2 px-4 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
                >
                  View All Services
                </Link>
              </div>
            </div>

            {/* Payment Modes Accepted */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-900" />
                Accepted Simulation Modes:
              </span>
              <ul className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
                <li>• UPI (GPay, PhonePe, BHIM)</li>
                <li>• SBI Internet Banking</li>
                <li>• Visa / MasterCard / RuPay</li>
                <li>• SBI Bank Challan Slip</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
