"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [consentGiven, setConsentGiven] = useState(true);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("pas_cookie_consent");
    if (!stored) {
      setConsentGiven(false);
    }
  }, []);

  function handleAccept(type: "all" | "essential") {
    localStorage.setItem("pas_cookie_consent", type);
    setConsentGiven(true);
  }

  if (!mounted || consentGiven) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-16 md:bottom-5 left-4 right-4 md:left-auto md:right-5 z-50 max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">🍪</span>
        <div className="flex-1 space-y-1">
          <h4 className="text-xs font-bold text-white tracking-tight">
            Privacy & Cookie Preferences
          </h4>
          <p className="text-[11px] leading-relaxed text-slate-400">
            We use essential security cookies and session tokens to maintain your verified session and protect citizen records in compliance with the DPDP Act.
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <Link
          href="/privacy"
          className="text-[11px] font-medium text-blue-400 hover:text-blue-300 underline"
        >
          Privacy Policy
        </Link>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleAccept("essential")}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700 transition"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={() => handleAccept("all")}
            className="rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 shadow-sm shadow-blue-600/30 transition"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
