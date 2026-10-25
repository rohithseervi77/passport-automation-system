"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): string | null {
  return localStorage.getItem("pas_cookie_consent");
}

function getServerSnapshot(): string {
  return "server_hydrating";
}

export default function CookieBanner() {
  const [localDismissed, setLocalDismissed] = useState(false);
  const storedConsent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function handleAccept(type: "all" | "essential") {
    localStorage.setItem("pas_cookie_consent", type);
    setLocalDismissed(true);
  }

  if (storedConsent === "server_hydrating" || storedConsent !== null || localDismissed) return null;

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAccept("essential")}
            className="px-3 py-1 text-[11px] font-semibold text-slate-300 hover:text-white rounded-lg border border-slate-700 hover:bg-slate-800 transition"
          >
            Essential Only
          </button>
          <button
            onClick={() => handleAccept("all")}
            className="px-3.5 py-1 text-[11px] font-bold text-slate-950 bg-blue-400 hover:bg-blue-300 rounded-lg shadow-sm transition"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
