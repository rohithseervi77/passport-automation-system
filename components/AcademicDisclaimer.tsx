"use client";

import React, { useState } from "react";
import { AlertTriangle, Globe } from "lucide-react";
import { translations, Language } from "@/lib/i18n";

export default function AcademicDisclaimer() {
  const [lang, setLang] = useState<Language>("en");
  const t = translations[lang];

  return (
    <div className="bg-slate-900 text-slate-300 text-[11px] border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3" />
            Academic Simulation
          </span>
          <span className="text-slate-300 line-clamp-1 sm:line-clamp-none">
            {t.academicNotice}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] shrink-0 font-medium">
          <Globe className="w-3 h-3 text-slate-400" />
          <div className="flex items-center gap-1 bg-slate-800 rounded px-1 py-0.5 border border-slate-700">
            <button
              onClick={() => setLang("en")}
              className={`px-1.5 py-0.5 rounded transition ${
                lang === "en" ? "bg-blue-900 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang("hi")}
              className={`px-1.5 py-0.5 rounded transition ${
                lang === "hi" ? "bg-blue-900 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLang("ta")}
              className={`px-1.5 py-0.5 rounded transition ${
                lang === "ta" ? "bg-blue-900 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              தமிழ்
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
