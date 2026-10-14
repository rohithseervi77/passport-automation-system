"use client";

import React, { useState } from "react";
import Link from "next/link";
import PassportCover, { PassportType } from "@/components/PassportCover";

export default function PassportIndexExplorer() {
  const [selectedType, setSelectedType] = useState<PassportType>("REGULAR");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"SPECS" | "MOBILITY" | "SECURITY">("SPECS");

  // Sample destinations mobility data for Indian Passport
  const destinations = [
    { country: "Thailand", code: "TH", status: "Visa-Free", duration: "30 Days", region: "Asia" },
    { country: "Malaysia", code: "MY", status: "Visa-Free", duration: "30 Days", region: "Asia" },
    { country: "Maldives", code: "MV", status: "Visa on Arrival", duration: "30 Days", region: "Asia" },
    { country: "Mauritius", code: "MU", status: "Visa-Free", duration: "90 Days", region: "Africa" },
    { country: "Nepal", code: "NP", status: "Freedom of Movement", duration: "Permanent", region: "Asia" },
    { country: "Bhutan", code: "BT", status: "Freedom of Movement", duration: "Permit Entry", region: "Asia" },
    { country: "Sri Lanka", code: "LK", status: "Visa on Arrival", duration: "30 Days", region: "Asia" },
    { country: "Kenya", code: "KE", status: "Electronic Travel Auth", duration: "90 Days", region: "Africa" },
    { country: "Seychelles", code: "SC", status: "Visa on Arrival", duration: "30 Days", region: "Africa" },
    { country: "Indonesia", code: "ID", status: "e-VOA / VOA", duration: "30 Days", region: "Asia" },
    { country: "United Arab Emirates", code: "AE", status: "Visa on Arrival (US/UK visa holders)", duration: "14 Days", region: "Middle East" },
    { country: "United Kingdom", code: "GB", status: "Visa Required", duration: "Standard Visa", region: "Europe" },
    { country: "United States", code: "US", status: "Visa Required", duration: "B1/B2 Interview", region: "Americas" },
    { country: "Schengen Area", code: "EU", status: "Visa Required", duration: "Short Stay", region: "Europe" },
    { country: "Japan", code: "JP", status: "eVisa Available", duration: "90 Days", region: "Asia" },
  ];

  const filteredDestinations = destinations.filter(d =>
    d.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const passportTypeData = {
    REGULAR: {
      title: "Ordinary Citizen Passport",
      category: "Type 'P' (Personal)",
      color: "Deep Navy Blue",
      target: "All Eligible Citizens of the Republic of India",
      validity: "10 Years (5 Years for Minors)",
      pages: "36 Pages Standard / 60 Pages Jumbo",
      fee: "₹1,500 Standard • ₹2,000 Jumbo",
      chip: "64KB Contactless Microchip with Biometrics",
      description: "Standard sovereign travel document issued to ordinary Indian citizens for general international travel, tourism, higher education, and commerce.",
    },
    OFFICIAL: {
      title: "Official Government Passport",
      category: "Type 'S' (Service)",
      color: "Arctic White Cover",
      target: "Government Officers, Armed Forces & Official Delegates",
      validity: "Up to 5 Years / Duration of Official Deputation",
      pages: "36 Pages",
      fee: "Statutory Exempted (Official Sanction)",
      chip: "High-Security Cryptographic Chip with Encrypted Delegation Credentials",
      description: "Issued exclusively to individuals representing the Indian Government on official sovereign business abroad with consular protocol courtesies.",
    },
    DIPLOMATIC: {
      title: "Diplomatic Passport",
      category: "Type 'D' (Diplomatic)",
      color: "Imperial Maroon / Burgundy Cover",
      target: "Ambassadors, Ministers, Diplomats & High Commissioners",
      validity: "5 Years or Term of Diplomatic Assignment",
      pages: "60 Pages High-Capacity",
      fee: "Ministerial Protocol Grant",
      chip: "Diplomatic Immunity Encoding under the Vienna Convention",
      description: "Top-tier sovereign passport issued to diplomatic corps, Members of Parliament, and high-ranking dignitaries entitled to international diplomatic immunity.",
    },
  }[selectedType];

  return (
    <section id="passport-explorer" className="border-t border-slate-800 bg-gradient-to-b from-slate-950 via-[#060c18] to-slate-950 py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300 mb-3">
              <span>🌐</span> Official Passport Index & Booklet Registry
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Sovereign Passport Explorer
            </h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Explore official Indian e-Passport covers, global mobility metrics, biometric chip architecture, and booklet specifications governed under The Passports Act, 1967.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl shrink-0">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mobility Score</p>
              <p className="text-2xl font-black text-amber-400">62</p>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Visa-Free / VOA</p>
              <p className="text-2xl font-black text-emerald-400">62 Destinations</p>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">World Reach</p>
              <p className="text-2xl font-black text-blue-400">31%</p>
            </div>
          </div>
        </div>

        {/* Passport Type Selector Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-10 pb-4 border-b border-slate-800/80">
          <button
            type="button"
            onClick={() => setSelectedType("REGULAR")}
            className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              selectedType === "REGULAR"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/40"
                : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-[#0a1835] border border-blue-400" />
            <span>Ordinary Citizen (Type P)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType("OFFICIAL")}
            className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              selectedType === "OFFICIAL"
                ? "bg-slate-200 text-slate-950 shadow-lg shadow-white/20 border border-white"
                : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-white border border-slate-400" />
            <span>Official Government (Type S)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType("DIPLOMATIC")}
            className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              selectedType === "DIPLOMATIC"
                ? "bg-red-800 text-amber-200 shadow-lg shadow-red-900/40 border border-red-500/50"
                : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-[#4a0815] border border-amber-400" />
            <span>Diplomatic (Type D)</span>
          </button>
        </div>

        {/* Main Interactive Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: 3D Physical Passport Booklet Display */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-3xl border border-slate-800/90 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-900/50 shadow-2xl relative overflow-hidden group">
            {/* Ambient Backlight Glow */}
            <div
              className={`absolute -inset-10 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700 ${
                selectedType === "DIPLOMATIC"
                  ? "bg-red-600"
                  : selectedType === "OFFICIAL"
                  ? "bg-slate-100"
                  : "bg-blue-600"
              }`}
            />

            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-6">
              Interactive 3D Cover • Tilt to inspect gold foil
            </p>

            <PassportCover type={selectedType} size="lg" interactive={true} />

            <div className="mt-8 text-center space-y-1">
              <span className="text-xs font-bold text-amber-400 font-mono">
                {passportTypeData.category}
              </span>
              <h3 className="text-xl font-bold text-white">
                {passportTypeData.title}
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {passportTypeData.description}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3 w-full max-w-xs">
              <Link
                href="/register"
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-center text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition"
              >
                Apply for this Booklet →
              </Link>
              <Link
                href="/track"
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                🔍 Track
              </Link>
            </div>
          </div>

          {/* Right Column: Dynamic Deep-Dive Tabs (Specs, Mobility, Security) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("SPECS")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === "SPECS"
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📋 Booklet Specifications
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("MOBILITY")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === "MOBILITY"
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ✈️ Global Visa Mobility (62)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("SECURITY")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === "SECURITY"
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🛡️ Biometric Security Architecture
              </button>
            </div>

            {/* Tab 1: Booklet Specifications */}
            {activeTab === "SPECS" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Target Eligibility</p>
                    <p className="text-sm font-bold text-white">{passportTypeData.target}</p>
                    <p className="text-xs text-slate-500">Under the Passports Act, 1967</p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Validity Period</p>
                    <p className="text-sm font-bold text-white">{passportTypeData.validity}</p>
                    <p className="text-xs text-slate-500">Subject to police clearance renewal</p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Booklet Capacity</p>
                    <p className="text-sm font-bold text-white">{passportTypeData.pages}</p>
                    <p className="text-xs text-slate-500">B7 standard (88 × 125 mm)</p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Statutory Govt Fee</p>
                    <p className="text-sm font-bold text-amber-300 font-mono">{passportTypeData.fee}</p>
                    <p className="text-xs text-slate-500">Card, UPI or NetBanking</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
                    Microchip & RFID Integration
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {passportTypeData.chip}. Conforms to ICAO Doc 9303 standards with Public Key Infrastructure (PKI) digital signatures, ensuring seamless biometric e-Gate clearance at international airport border control terminals worldwide.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Global Visa Mobility Explorer */}
            {activeTab === "MOBILITY" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search destination country (e.g. Thailand, UAE, Maldives)..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    Showing {filteredDestinations.length} destinations
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
                    <thead className="bg-slate-950 sticky top-0 z-10 text-slate-400 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Destination</th>
                        <th className="px-4 py-3">Region</th>
                        <th className="px-4 py-3">Visa Access</th>
                        <th className="px-4 py-3">Max Stay</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredDestinations.map((d, i) => {
                        let statusColor = "bg-blue-500/10 text-blue-400 border-blue-500/30";
                        if (d.status.includes("Visa-Free") || d.status.includes("Freedom")) {
                          statusColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                        } else if (d.status.includes("Arrival") || d.status.includes("eVisa")) {
                          statusColor = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                        } else if (d.status.includes("Required")) {
                          statusColor = "bg-slate-800 text-slate-400 border-slate-700";
                        }

                        return (
                          <tr key={i} className="hover:bg-slate-800/30 transition">
                            <td className="px-4 py-3 font-semibold text-white flex items-center gap-2">
                              <span className="font-mono text-[10px] text-slate-500">{d.code}</span>
                              <span>{d.country}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-400">{d.region}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusColor}`}>
                                {d.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-300">{d.duration}</td>
                          </tr>
                        );
                      })}
                      {filteredDestinations.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-xs">
                            No matching destination found. Try another query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Biometric Security Architecture */}
            {activeTab === "SECURITY" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200 text-xs">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
                  <div className="text-2xl">🔒</div>
                  <h4 className="font-bold text-white text-sm">Polycarbonate Data Page</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Laser-engraved citizen photograph, biographical details, and MLZ zone fused into an indestructible multi-layer substrate to completely eliminate delamination tampering.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
                  <div className="text-2xl">⚡</div>
                  <h4 className="font-bold text-white text-sm">Embedded Contactless RFID</h4>
                  <p className="text-slate-400 leading-relaxed">
                    64KB embedded memory storing high-resolution facial biometrics, fingerprint templates, and digital signature certificates issued by the National Public Key Directory (NPKD).
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
                  <div className="text-2xl">👁️</div>
                  <h4 className="font-bold text-white text-sm">Ghost Image & Variable Ink</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Optically Variable Ink (OVI) that shifts hues under tilted angles, combined with translucent secondary ghost portraiture visible only under specific ultraviolet wavelengths.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
                  <div className="text-2xl">🛡️</div>
                  <h4 className="font-bold text-white text-sm">ICAO Doc 9303 Compliance</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Strict adherence to International Civil Aviation Organization standards, interoperable across automated border gates at 1,200+ international airports globally.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
