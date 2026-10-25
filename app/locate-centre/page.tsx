"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import AcademicDisclaimer from "@/components/AcademicDisclaimer";
import Link from "next/link";
import { 
  MapPin, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Building2, 
  ArrowRight,
  Filter,
  ShieldCheck
} from "lucide-react";

export default function LocateCentrePage() {
  const [selectedRPO, setSelectedRPO] = useState("ALL");
  const [pinCodeQuery, setPinCodeQuery] = useState("");
  const [selectedQuota, setSelectedQuota] = useState("NORMAL"); // NORMAL, TATKAAL

  const rpoList = [
    "ALL",
    "RPO Chennai",
    "RPO Bangalore",
    "RPO Delhi",
    "RPO Mumbai",
    "RPO Hyderabad",
    "RPO Kolkata",
  ];

  const centres = [
    {
      id: "PSK-CHN-01",
      name: "Passport Seva Kendra — Saligramam",
      rpo: "RPO Chennai",
      type: "PSK",
      address: "Claret Complex, Arcot Road, Saligramam, Chennai, Tamil Nadu 600093",
      pinCode: "600093",
      workingHours: "09:00 AM – 05:00 PM (Monday to Friday)",
      normalAvailability: "AVAILABLE",
      normalEarliest: "28-Oct-2026",
      normalSlotsLeft: 42,
      tatkaalAvailability: "AVAILABLE",
      tatkaalEarliest: "27-Oct-2026",
      tatkaalSlotsLeft: 12,
      counters: 18,
    },
    {
      id: "PSK-CHN-02",
      name: "Passport Seva Kendra — Aminjikarai",
      rpo: "RPO Chennai",
      type: "PSK",
      address: "No. 15, Nelson Manickam Road, Aminjikarai, Chennai, Tamil Nadu 600029",
      pinCode: "600029",
      workingHours: "09:00 AM – 05:00 PM (Monday to Friday)",
      normalAvailability: "LIMITED",
      normalEarliest: "29-Oct-2026",
      normalSlotsLeft: 8,
      tatkaalAvailability: "FULL",
      tatkaalEarliest: "31-Oct-2026",
      tatkaalSlotsLeft: 0,
      counters: 14,
    },
    {
      id: "POPSK-CHN-03",
      name: "Post Office PSK — Tambaram",
      rpo: "RPO Chennai",
      type: "POPSK",
      address: "Head Post Office Building, GST Road, Tambaram, Chennai 600045",
      pinCode: "600045",
      workingHours: "09:30 AM – 04:30 PM (Monday to Friday)",
      normalAvailability: "AVAILABLE",
      normalEarliest: "30-Oct-2026",
      normalSlotsLeft: 24,
      tatkaalAvailability: "UNAVAILABLE", // POPSKs generally do not support Tatkaal
      tatkaalEarliest: "N/A",
      tatkaalSlotsLeft: 0,
      counters: 4,
    },
    {
      id: "PSK-BLR-01",
      name: "Passport Seva Kendra — Lalbagh",
      rpo: "RPO Bangalore",
      type: "PSK",
      address: "Prestige Sigma, 3 Hosur Road, Richmond Town, Bangalore, Karnataka 560027",
      pinCode: "560027",
      workingHours: "09:00 AM – 05:00 PM (Monday to Friday)",
      normalAvailability: "AVAILABLE",
      normalEarliest: "28-Oct-2026",
      normalSlotsLeft: 35,
      tatkaalAvailability: "AVAILABLE",
      tatkaalEarliest: "27-Oct-2026",
      tatkaalSlotsLeft: 15,
      counters: 20,
    },
    {
      id: "PSK-DEL-01",
      name: "Passport Seva Kendra — Connaught Place",
      rpo: "RPO Delhi",
      type: "PSK",
      address: "Herald House, 5A Bahadur Shah Zafar Marg, ITO, New Delhi 110002",
      pinCode: "110002",
      workingHours: "09:00 AM – 05:00 PM (Monday to Friday)",
      normalAvailability: "LIMITED",
      normalEarliest: "30-Oct-2026",
      normalSlotsLeft: 6,
      tatkaalAvailability: "AVAILABLE",
      tatkaalEarliest: "28-Oct-2026",
      tatkaalSlotsLeft: 9,
      counters: 22,
    },
    {
      id: "PSK-HYD-01",
      name: "Passport Seva Kendra — Begumpet",
      rpo: "RPO Hyderabad",
      type: "PSK",
      address: "KUMAR Prime, SP Road, Begumpet, Hyderabad, Telangana 500003",
      pinCode: "500003",
      workingHours: "09:00 AM – 05:00 PM (Monday to Friday)",
      normalAvailability: "AVAILABLE",
      normalEarliest: "28-Oct-2026",
      normalSlotsLeft: 50,
      tatkaalAvailability: "AVAILABLE",
      tatkaalEarliest: "27-Oct-2026",
      tatkaalSlotsLeft: 18,
      counters: 16,
    },
    {
      id: "PSK-MUM-01",
      name: "Passport Seva Kendra — Lower Parel",
      rpo: "RPO Mumbai",
      type: "PSK",
      address: "Trade World, C Wing, Kamala Mills Compound, Lower Parel, Mumbai 400013",
      pinCode: "400013",
      workingHours: "09:00 AM – 05:00 PM (Monday to Friday)",
      normalAvailability: "AVAILABLE",
      normalEarliest: "29-Oct-2026",
      normalSlotsLeft: 28,
      tatkaalAvailability: "LIMITED",
      tatkaalEarliest: "28-Oct-2026",
      tatkaalSlotsLeft: 4,
      counters: 24,
    },
  ];

  const filteredCentres = centres.filter((c) => {
    const matchesRpo = selectedRPO === "ALL" || c.rpo === selectedRPO;
    const matchesPin =
      !pinCodeQuery.trim() ||
      c.pinCode.includes(pinCodeQuery.trim()) ||
      c.address.toLowerCase().includes(pinCodeQuery.toLowerCase().trim()) ||
      c.name.toLowerCase().includes(pinCodeQuery.toLowerCase().trim());
    return matchesRpo && matchesPin;
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <AcademicDisclaimer />
      <Navbar role="APPLICANT" userName="Citizen Portal" />

      {/* Hero Header */}
      <div className="bg-[#002B49] text-white py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-800/80 text-blue-200 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            Passport Seva Kendra (PSK / POPSK) Locator
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Locate Passport Centre & Slot Availability
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-blue-200 max-w-2xl">
            Locate your nearest Passport Seva Kendra (PSK) or Post Office PSK (POPSK) and check real-time simulated appointment availability.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Sample Data Callout */}
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Sample / Demo Appointment Availability</p>
            <p className="mt-0.5 text-amber-800">
              The appointment slots and centre metrics displayed below are simulated educational data for software engineering demonstration. They do not reserve appointments at actual government PSKs.
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Regional Passport Office (RPO)
            </label>
            <select
              value={selectedRPO}
              onChange={(e) => setSelectedRPO(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-900"
            >
              {rpoList.map((rpo) => (
                <option key={rpo} value={rpo}>
                  {rpo}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Search by PIN Code or Locality
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. 600093, Saligramam, Tambaram..."
                value={pinCodeQuery}
                onChange={(e) => setPinCodeQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-900"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quota View
            </label>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedQuota("NORMAL")}
                className={`py-1.5 rounded transition ${
                  selectedQuota === "NORMAL"
                    ? "bg-white text-blue-950 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setSelectedQuota("TATKAAL")}
                className={`py-1.5 rounded transition ${
                  selectedQuota === "TATKAAL"
                    ? "bg-white text-blue-950 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tatkaal
              </button>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
            <span>Showing {filteredCentres.length} Passport Seva Centres</span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available
              </span>
              <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Limited
              </span>
              <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Full
              </span>
            </div>
          </div>

          {filteredCentres.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
              <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-sm">No Passport Centres matched your search.</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing the PIN code or selecting 'ALL' RPOs.</p>
            </div>
          ) : (
            filteredCentres.map((centre) => {
              const isTatkaal = selectedQuota === "TATKAAL";
              const availability = isTatkaal ? centre.tatkaalAvailability : centre.normalAvailability;
              const earliest = isTatkaal ? centre.tatkaalEarliest : centre.normalEarliest;
              const slotsLeft = isTatkaal ? centre.tatkaalSlotsLeft : centre.normalSlotsLeft;

              return (
                <div
                  key={centre.id}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-900">{centre.name}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-bold">
                        {centre.type}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 font-mono">
                        ({centre.rpo})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{centre.address}</span>
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                      <span>PIN: <strong>{centre.pinCode}</strong></span>
                      <span>•</span>
                      <span>{centre.counters} Citizen Counters</span>
                      <span>•</span>
                      <span>{centre.workingHours}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Earliest {selectedQuota} Slot
                      </span>
                      <div className="flex items-center md:justify-end gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-bold text-sm text-slate-900">{earliest}</span>
                      </div>
                      <span
                        className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          availability === "AVAILABLE"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : availability === "LIMITED"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-rose-100 text-rose-800 border border-rose-300"
                        }`}
                      >
                        {availability} ({slotsLeft} Slots)
                      </span>
                    </div>

                    <Link
                      href={`/applicant/appointment?location=${encodeURIComponent(centre.name)}&quota=${selectedQuota}`}
                      className="px-4 py-2.5 rounded-lg bg-blue-950 text-white hover:bg-blue-900 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Book Slot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
