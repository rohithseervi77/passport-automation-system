"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { 
  FileText, 
  Clock, 
  ShieldCheck, 
  Award, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  BookOpen
} from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      id: "FRESH",
      title: "Fresh Passport",
      category: "CITIZEN_SERVICE",
      badge: "Standard Processing",
      badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
      description: "For Indian citizens applying for a passport for the very first time. Standard issuance for adults (10 years) or minors (5 years / age 18).",
      features: [
        "Choice of 36 or 60 pages booklet",
        "Standard verification via PSK / POPSK and local Police Station",
        "DigiLocker fast-track document scrutiny enabled",
        "Standard Turnaround: 15–20 working days",
      ],
      link: "/applicant/application?service=FRESH",
      fee: "₹1,500 (36p) / ₹2,000 (60p)",
      isAvailable: true,
    },
    {
      id: "REISSUE",
      title: "Re-issue of Passport",
      category: "CITIZEN_SERVICE",
      badge: "Existing Holders",
      badgeColor: "bg-indigo-100 text-indigo-900 border-indigo-200",
      description: "For citizens holding an existing passport that has expired, is expiring within 1 year, pages exhausted, lost, damaged, or requires change in personal particulars.",
      features: [
        "Retain previous passport number history",
        "Update present residential address, spouse name, or surname",
        "Police verification exempted if within validity period",
        "Standard Turnaround: 7–15 working days",
      ],
      link: "/applicant/application?service=REISSUE",
      fee: "₹1,500 (36p) / ₹2,000 (60p)",
      isAvailable: true,
    },
    {
      id: "TATKAAL",
      title: "Tatkaal Passport",
      category: "EXPEDITED_SERVICE",
      badge: "Express Priority",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
      description: "Expedited passport issuance for urgent overseas travel. Includes dedicated Tatkaal appointment quota and pre-police verification dispatch.",
      features: [
        "Priority appointment booking at PSK",
        "Dispatched within 1–3 working days of PSK visit",
        "Requires Tatkaal Undertaking (Annexure F) & 3 specific identity proofs",
        "Post-police verification workflow",
      ],
      link: "/applicant/application?service=FRESH&quota=TATKAAL",
      fee: "₹3,500 (Base ₹1,500 + Tatkaal ₹2,000)",
      isAvailable: true,
    },
    {
      id: "PCC",
      title: "Police Clearance Certificate (PCC)",
      category: "CLEARANCE_SERVICE",
      badge: "Emigration / Visa",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-200",
      description: "Issued to Indian passport holders who have applied for residential status, employment, long-term visa, or immigration to a foreign country.",
      features: [
        "Verification by jurisdictional Police Commissionerate",
        "Pre-requisite: Valid Indian Passport with minimum 6 months validity",
        "Recognized by foreign embassies and consulates worldwide",
        "Standard Turnaround: 10–14 working days",
      ],
      link: "/applicant/application?service=PCC",
      fee: "₹500 Flat Fee",
      isAvailable: true,
    },
    {
      id: "DIPLOMATIC",
      title: "Diplomatic / Official Passport",
      category: "DEMO_SERVICE",
      badge: "Demo Simulation Only",
      badgeColor: "bg-slate-200 text-slate-700 border-slate-300",
      description: "Issued exclusively to designated government officials, diplomats, and Members of Parliament traveling abroad on official state business.",
      features: [
        "Maroon booklet (Diplomatic) or White booklet (Official)",
        "Requires Ministry of External Affairs CPV Division authorization",
        "DEMO: For academic demonstration only",
      ],
      link: "#",
      fee: "Exempted / Demo",
      isAvailable: false,
    },
    {
      id: "IDENTITY_CERT",
      title: "Identity Certificate (IC)",
      category: "DEMO_SERVICE",
      badge: "Demo Simulation Only",
      badgeColor: "bg-slate-200 text-slate-700 border-slate-300",
      description: "Issued to Tibetan refugees and other stateless persons residing in India for overseas travel purposes.",
      features: [
        "Issued by Regional Passport Office with MHA political clearance",
        "Yellow cover booklet",
        "DEMO: For academic demonstration only",
      ],
      link: "#",
      fee: "Demo Reference",
      isAvailable: false,
    },
    {
      id: "SURRENDER",
      title: "Surrender / Renunciation Certificate",
      category: "DEMO_SERVICE",
      badge: "Demo Simulation Only",
      badgeColor: "bg-slate-200 text-slate-700 border-slate-300",
      description: "For Indian citizens who have acquired foreign citizenship and must formally surrender their Indian passport under the Indian Citizenship Act, 1955.",
      features: [
        "Certificate of Renunciation of Indian Citizenship",
        "Physical booklet cancellation with stamp",
        "DEMO: For academic demonstration only",
      ],
      link: "#",
      fee: "Demo Reference",
      isAvailable: false,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <Navbar role="APPLICANT" userName="Citizen Portal" />

      {/* Hero Header */}
      <div className="bg-[#002B49] text-white py-12 px-4 sm:px-6 border-b border-blue-950">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-800/80 text-blue-200 text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            Service Portfolio & Statutory Catalog
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Passport & Consular Services
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
            Select the appropriate passport or clearance category below to initiate your application. All workflows are backed by secure end-to-end database tracking.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold">
            <Link
              href="/fee-calculator"
              className="px-4 py-2 rounded-lg bg-white text-blue-950 hover:bg-blue-50 transition shadow-sm flex items-center gap-1.5"
            >
              <span>Interactive Fee Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/document-advisor"
              className="px-4 py-2 rounded-lg bg-blue-800/60 text-white border border-blue-700 hover:bg-blue-800 transition flex items-center gap-1.5"
            >
              <span>Intelligent Document Advisor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Services Grid */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Passport Categories ({services.filter((s) => s.isAvailable).length} Available)
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Standard Application Flow: Select &rarr; Wizard &rarr; Documents &rarr; Appointment
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
          {services
            .filter((s) => s.isAvailable)
            .map((svc) => (
              <div
                key={svc.id}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${svc.badgeColor}`}
                    >
                      {svc.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {svc.fee}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {svc.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {svc.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Online Submission + PSK Appointment
                  </span>
                  <Link
                    href={svc.link}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-950 text-white hover:bg-blue-900 text-xs font-bold transition shadow-sm"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
        </div>

        {/* Specialized / Demo Services Section */}
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Specialized & Academic Demonstration Services
          </h2>
          <p className="text-xs text-slate-500">
            These statutory categories are demonstrated for informational structure and are clearly marked as DEMO.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services
            .filter((s) => !s.isAvailable)
            .map((svc) => (
              <div
                key={svc.id}
                className="bg-slate-100/70 border border-slate-200 rounded-xl p-5 text-slate-600 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {svc.badge}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-800 mb-1">
                    {svc.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    {svc.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 text-[11px] text-amber-800 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-700" />
                  <span>Academic demonstration only</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
