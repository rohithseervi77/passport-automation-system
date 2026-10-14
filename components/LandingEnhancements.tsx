"use client";

import { useState } from "react";
import Link from "next/link";

export function TricolorRibbon() {
  return (
    <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-500 opacity-80" />
  );
}

export function PortalStats() {
  const stats = [
    { value: "3.4M+", label: "Passports Issued", sub: "Digital booklets issued", icon: "📘" },
    { value: "480+", label: "PSK Centers", sub: "Operational nationwide", icon: "🏛️" },
    { value: "99.4%", label: "Digital Verification", sub: "Automated OCR & scrutiny", icon: "⚡" },
    { value: "< 3 Weeks", label: "Doorstep Dispatch", sub: "Via India Post Speed Post", icon: "📦" },
  ];

  return (
    <div className="border-y border-slate-800 bg-slate-900/50 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 text-2xl shadow-inner">
                {s.icon}
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black tracking-tight text-white">{s.value}</p>
                <p className="text-xs font-semibold text-slate-300">{s.label}</p>
                <p className="text-[10px] text-slate-500 hidden sm:block">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WorkflowRoadmap() {
  const steps = [
    {
      num: "01",
      title: "Online Registration",
      desc: "Fill form with personal details, select booklet type (36 or 60 pages), and save drafts anytime.",
      badge: "Citizen Seva",
      icon: "📝",
    },
    {
      num: "02",
      title: "Docs & Appointment",
      desc: "Upload proof of identity, address, and DOB. Reserve your biometric slot at your nearest PSK.",
      badge: "Instant Slot",
      icon: "📁",
    },
    {
      num: "03",
      title: "PSK Biometrics",
      desc: "Visit the Seva Kendra for photo capture, digital fingerprints, and document verification by RPO Officers.",
      badge: "Physical Scrutiny",
      icon: "📷",
    },
    {
      num: "04",
      title: "Police Background Enquiry",
      desc: "Station personnel conduct residential verification and court record checks to issue clearance certificates.",
      badge: "Security Check",
      icon: "👮",
    },
    {
      num: "05",
      title: "Printing & Dispatch",
      desc: "Passport is printed, serialized with cryptographic security chips, and delivered via Speed Post.",
      badge: "Doorstep Delivery",
      icon: "🚀",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-14 text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400 border border-blue-500/30 bg-blue-500/10 px-3 py-1 rounded-full">
          The 5-Stage Digital Journey
        </span>
        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
          How Passport Seva Works
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          From online application to physical booklet delivery at your residence, fully digitized with real-time status tracking.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 relative">
        {steps.map((st, idx) => (
          <div
            key={idx}
            className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-slate-900 hover:shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                  {st.num}
                </span>
                <span className="text-2xl">{st.icon}</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-blue-300 transition">
                {st.title}
              </h3>
              <p className="text-xs leading-relaxed text-slate-400">
                {st.desc}
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-800/80">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                {st.badge}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CitizenFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "What documents are required to apply for a Fresh Indian Passport?",
      a: "Applicants need: (1) Proof of Date of Birth (Birth Certificate, Matriculation Certificate), (2) Proof of Residential Address (Aadhaar, Utility Bill, Bank Passbook, Rent Agreement), and (3) Identity Proof with photograph (Voter ID, PAN Card, Aadhaar).",
    },
    {
      q: "How does the Police Background Verification enquiry work?",
      a: "Once your documents are verified by the Passport Officer, your application is automatically forwarded to the local police station in your jurisdiction. Police personnel verify your residential continuity, verify you have no adverse criminal records, and submit their digital clearance report directly through the police authority portal.",
    },
    {
      q: "How can I track the live status of my application?",
      a: "You can track your application anytime using our Public Live Tracker by entering your Application Reference ID (e.g. PAS-2026-XXXXXX) and Date of Birth. The tracker provides real-time updates through all 9 lifecycle stages.",
    },
    {
      q: "What is the difference between Normal and Tatkaal schemes?",
      a: "Under the Normal scheme, passport issuance typically completes within 2 to 3 weeks following police verification. Under the Tatkaal scheme, verification is expedited with priority appointment slots and urgent booklet printing, often dispatched within 1 to 3 working days.",
    },
    {
      q: "Can I reschedule my Passport Seva Kendra (PSK) appointment?",
      a: "Yes, you can reschedule your booked biometric appointment up to two times within 12 calendar months of statutory fee payment from your citizen dashboard without paying additional fees.",
    },
  ];

  return (
    <section id="faq" className="border-t border-slate-800 bg-slate-900/40 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 border border-blue-500/30 bg-blue-500/10 px-3 py-1 rounded-full">
            Frequently Asked Questions
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight">
            Citizen Information & Guidance
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Clear answers to common questions about applications, police verification, and delivery.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-white hover:text-blue-300 transition"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{faq.q}</span>
                  <span className="text-blue-400 font-mono text-base shrink-0">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
