"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  HelpCircle,
  PhoneCall,
  Mail,
  FileQuestion,
  ChevronDown,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  MapPin,
  Calculator,
  Search,
  MessageSquare,
} from "lucide-react";

export default function HelpCentrePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "FEES",
      q: "What are the revised passport application fees under Gazette Notification G.S.R. 516(E)?",
      a: "Effective 1 July 2026, the statutory fee for a Fresh/Re-issue Normal Adult Passport (36 Pages, 10-year validity) is ₹2,500. A 60-page Jumbo booklet is ₹3,500. For Tatkaal applications, an additional surcharge of ₹2,500 applies (Total ₹5,000 for 36 pages; ₹6,000 for 60 pages). Minor applications (under 18 years) are ₹1,750 Normal and ₹4,250 Tatkaal. A 10% statutory concession applies to fresh applications for minors aged up to 8 years and senior citizens aged 60+.",
    },
    {
      category: "APPOINTMENTS",
      q: "How many times can I reschedule my PSK appointment?",
      a: "In accordance with Ministry rules, applicants are permitted to reschedule their booked appointment up to a maximum of 3 times within 1 year of application submission. Cancellations or reschedulings must be completed at least 24 hours prior to the booked slot time.",
    },
    {
      category: "TATKAAL",
      q: "When are Tatkaal appointment slots released daily?",
      a: "Tatkaal quota appointment slots are released daily at exactly 02:00 PM on working days for the subsequent working day. Normal quota appointment slots refresh daily at 12:00 PM (Noon). Note that Tatkaal appointments are strictly processed at designated Passport Seva Kendras (PSKs) and are not processed at Post Office PSKs (POPSKs).",
    },
    {
      category: "DOCUMENTS",
      q: "What mandatory original documents must I carry to the PSK appointment?",
      a: "You must carry the printed Appointment Confirmation Letter, electronic fee payment receipt, proof of date of birth (e.g. Birth Certificate, School Leaving Certificate), proof of present address (e.g. Aadhaar Card, Water/Electricity Bill, Bank Passbook), and Non-ECR proof (Matriculation Certificate or higher degree) if applicable. For re-issue, bring your current/expired passport.",
    },
    {
      category: "POLICE",
      q: "How does the Police Verification process work?",
      a: "Once your application passes document verification at the PSK, electronic verification orders are automatically transmitted to the concerned District Police Commissioner / Superintendent of Police office. A designated police enquiry officer from your local police station will conduct address verification and character record scrutiny. You can track this stage in real-time using our Public Tracker.",
    },
    {
      category: "GRIEVANCES",
      q: "How do I file a grievance if my passport processing is delayed?",
      a: "If your application has exceeded the citizen charter turnaround time without updates, navigate to the Grievances section in your citizen dashboard or the public Grievance Desk (/grievance). Submit a ticket with your ARN and delay details. A nodal officer will investigate and post an official resolution within 5 working days.",
    },
    {
      category: "POPSK",
      q: "What is the difference between a PSK and a POPSK?",
      a: "Passport Seva Kendras (PSKs) are large, full-service technology centres managed jointly with service partners providing Normal, Tatkaal, PCC, and complex services. Post Office Passport Seva Kendras (POPSKs) are localized citizen service facilities established in collaboration with the Department of Posts in smaller districts, processing Normal passport and PCC applications only.",
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat = activeCategory === "ALL" || faq.category === activeCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <Navbar role="APPLICANT" userName="Citizen Portal" />

      {/* Tricolor Border */}
      <div className="h-1 w-full bg-linear-to-r from-orange-500 via-white to-green-600" />

      {/* Hero */}
      <div className="bg-[#002B49] text-white py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-800/80 text-blue-200 text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            Citizen Helpdesk & Official Guidance Centre
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            How can we assist you with your passport?
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-blue-200 max-w-2xl leading-relaxed">
            Find immediate answers regarding statutory fee structures, appointment scheduling, document checklists,
            police verification timelines, and grievance escalation.
          </p>

          {/* Search Box */}
          <div className="mt-6 max-w-xl relative">
            <input
              type="text"
              placeholder="Search frequently asked questions, fees, Tatkaal rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-slate-900 text-xs font-medium placeholder-slate-400 focus:outline-hidden shadow-lg"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {/* Academic Simulation Banner */}
        <div className="mb-8 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Academic Software Engineering Project</p>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              This Passport Automation System (PAS) is an educational full-stack simulation modeled on Ministry of
              External Affairs (CPV Division) public workflows. Official government portal:{" "}
              <a
                href="https://www.passportindia.gov.in"
                target="_blank"
                rel="noreferrer"
                className="font-bold underline hover:text-amber-950 inline-flex items-center gap-1"
              >
                www.passportindia.gov.in <ExternalLink className="w-3 h-3" />
              </a>
              .
            </p>
          </div>
        </div>

        {/* Quick Self-Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Link
            href="/fee-calculator"
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-700 hover:shadow-md transition group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center mb-3 group-hover:bg-blue-900 group-hover:text-white transition">
              <Calculator className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-slate-900 group-hover:text-blue-900">Fee Calculator</h2>
            <p className="text-[11px] text-slate-500 mt-1">
              Calculate exact statutory fees under Gazette G.S.R. 516(E) rates.
            </p>
          </Link>

          <Link
            href="/locate-centre"
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-700 hover:shadow-md transition group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center mb-3 group-hover:bg-emerald-900 group-hover:text-white transition">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">Centre Locator</h2>
            <p className="text-[11px] text-slate-500 mt-1">
              Locate 10+ regional PSK/POPSK centres with simulated slot availability.
            </p>
          </Link>

          <Link
            href="/document-advisor"
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-700 hover:shadow-md transition group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-900 flex items-center justify-center mb-3 group-hover:bg-purple-900 group-hover:text-white transition">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-slate-900 group-hover:text-purple-900">Document Advisor</h2>
            <p className="text-[11px] text-slate-500 mt-1">
              Interactive document checklist for Fresh, Reissue, Minor, and ECR.
            </p>
          </Link>

          <Link
            href="/grievance"
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-700 hover:shadow-md transition group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-900 flex items-center justify-center mb-3 group-hover:bg-rose-900 group-hover:text-white transition">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-slate-900 group-hover:text-rose-900">Grievance Desk</h2>
            <p className="text-[11px] text-slate-500 mt-1">
              Submit feedback, register processing delay tickets, and track status.
            </p>
          </Link>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-blue-900" />
                Frequently Asked Questions (Citizen Guidance)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory policies, operating procedures, and citizen entitlements.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {["ALL", "FEES", "APPOINTMENTS", "TATKAAL", "DOCUMENTS", "POLICE", "GRIEVANCES", "POPSK"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                      activeCategory === cat
                        ? "bg-blue-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-100 mt-4">
            {filteredFaqs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No questions found matching your search. Try resetting the category filter.
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="py-4">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full text-left flex items-start justify-between gap-4 group"
                    >
                      <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-900 transition flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] flex items-center justify-center shrink-0 font-mono">
                          {idx + 1}
                        </span>
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                          isOpen ? "rotate-180 text-blue-900" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="mt-2.5 text-xs text-slate-600 leading-relaxed pl-7 border-l-2 border-blue-900 ml-2.5">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Simulated Citizen Support Numbers */}
        <div className="mt-8 bg-linear-to-r from-blue-950 to-slate-900 text-white rounded-xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold flex items-center gap-2 text-white">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              National Passport Citizen Support Helpline
            </h3>
            <p className="text-xs text-blue-200">
              Toll-Free Educational Assistance: <strong>1800-258-1800</strong> (08:00 AM – 10:00 PM IST)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/grievance"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
            >
              Open Grievance Desk
            </Link>
            <Link
              href="/track"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition"
            >
              Track Application
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
