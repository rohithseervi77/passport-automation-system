"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, X, ExternalLink } from "lucide-react";

export default function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [acceptedType, setAcceptedType] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    // Clear legacy persistent localStorage consent so it always asks again on every visit
    try {
      localStorage.removeItem("pas_cookie_consent");
      localStorage.removeItem("pas_privacy_consent");
    } catch {
      // ignore
    }

    // Listen for manual trigger to reopen consent prompt
    function handleOpenPrompt() {
      setDismissed(false);
      setAcceptedType(null);
    }

    window.addEventListener("pas_open_privacy_prompt", handleOpenPrompt);
    return () => window.removeEventListener("pas_open_privacy_prompt", handleOpenPrompt);
  }, []);

  function handleAccept(type: "all" | "essential") {
    setAcceptedType(type);
    // Dismiss for the current active navigation session
    setTimeout(() => {
      setDismissed(true);
    }, 450);
  }

  // Avoid SSR hydration mismatch
  if (!mounted) return null;

  // When dismissed during this session, show a small discreet reopen pill in bottom-left so user can easily reopen at any time
  if (dismissed) {
    return (
      <button
        type="button"
        onClick={() => {
          setDismissed(false);
          setAcceptedType(null);
        }}
        className="fixed bottom-20 md:bottom-4 left-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-900/90 px-3 py-1 text-[11px] font-medium text-slate-300 shadow-lg backdrop-blur-md hover:bg-slate-800 hover:text-white transition"
        title="Review Privacy Policy and Citizen Consent"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
        <span>Privacy Preferences</span>
      </button>
    );
  }

  return (
    <div
      role="region"
      aria-label="Privacy Policy and Citizen Data Consent"
      className="fixed bottom-16 md:bottom-5 left-4 right-4 md:left-auto md:right-5 z-50 max-w-md rounded-2xl border border-slate-700/80 bg-slate-900/98 p-5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300 text-slate-200"
    >
      {/* Top Header & Alert Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-900/60 text-blue-400 border border-blue-700/50">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800/60">
              DPDP Act, 2023 Statutory Compliance
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight mt-0.5">
              Privacy Policy & Citizen Data Consent
            </h4>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition"
          aria-label="Dismiss privacy consent prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description */}
      <p className="mt-2.5 text-[11px] sm:text-xs leading-relaxed text-slate-300">
        The Passport Automation System (MEA) requires your consent to securely process passport application records, verify identity proofs, and maintain essential session security tokens in compliance with the Digital Personal Data Protection (DPDP) Act, 2023.
      </p>

      {/* Acceptance confirmation feedback */}
      {acceptedType && (
        <div className="mt-2.5 p-2 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[11px] flex items-center gap-1.5 animate-in fade-in duration-200">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Consent preference recorded ({acceptedType === "all" ? "Accept All" : "Essential Only"}).</span>
        </div>
      )}

      {/* Footer Links & Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-[11px]">
          <Link
            href="/privacy"
            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2"
          >
            <span>Read Privacy Policy</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <Link
            href="/terms"
            className="text-slate-400 hover:text-slate-300"
          >
            Terms
          </Link>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => handleAccept("essential")}
            className="px-3 py-1.5 text-[11px] font-semibold text-slate-300 hover:text-white rounded-lg border border-slate-700 hover:bg-slate-800 transition"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={() => handleAccept("all")}
            className="px-3.5 py-1.5 text-[11px] font-bold text-slate-950 bg-blue-400 hover:bg-blue-300 rounded-lg shadow-sm transition active:scale-95"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
