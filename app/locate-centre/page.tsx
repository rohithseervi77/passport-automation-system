"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  MapPin,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  Filter,
  Layers,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface PassportCenter {
  id: number;
  centerCode: string;
  name: string;
  type: string;
  address: string;
  locality?: string | null;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  associatedRpo: string;
  operatingHours: string;
  status: string;
  dailyCapacity: number;
  slotCapacity: number;
  supportsTatkaal: boolean;
  normalAvailability: "AVAILABLE" | "LIMITED" | "FULL";
  normalEarliest: string;
  normalSlotsLeft: number;
  tatkaalAvailability: "AVAILABLE" | "LIMITED" | "FULL" | "UNAVAILABLE";
  tatkaalEarliest: string;
  tatkaalSlotsLeft: number;
}

export default function LocateCentrePage() {
  const [centres, setCentres] = useState<PassportCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filters
  const [selectedRPO, setSelectedRPO] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL"); // ALL, PSK, POPSK
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuota, setSelectedQuota] = useState<"NORMAL" | "TATKAAL">("NORMAL");

  const [rpoList, setRpoList] = useState<string[]>([
    "ALL",
    "RPO Chennai",
    "RPO Bengaluru",
    "RPO Delhi",
    "RPO Mumbai",
    "RPO Hyderabad",
  ]);

  const fetchCentres = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (selectedRPO !== "ALL") params.set("rpo", selectedRPO);
      if (selectedType !== "ALL") params.set("type", selectedType);
      params.set("quota", selectedQuota);

      const res = await fetch(`/api/centres?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch centres");

      const data = await res.json();
      setCentres(data.centres || []);
      if (data.filterOptions?.rpos) {
        setRpoList(["ALL", ...data.filterOptions.rpos]);
      }
    } catch (err: any) {
      console.error("Locator error:", err);
      setError("Unable to load latest passport centre database. Showing cached records.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedRPO, selectedType, selectedQuota]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCentres();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchCentres]);

  function copyAddress(center: PassportCenter) {
    const text = `${center.name}, ${center.address}, ${center.city}, ${center.state} - ${center.pinCode}`;
    navigator.clipboard.writeText(text);
    setCopiedCode(center.centerCode);
    setTimeout(() => setCopiedCode(null), 2500);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <Navbar role="APPLICANT" userName="Citizen Portal" />

      {/* Tricolor Government Border Bar */}
      <div className="h-1 w-full bg-linear-to-r from-orange-500 via-white to-green-600" />

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
            Locate your nearest Passport Seva Kendra (PSK) or Post Office PSK (POPSK) across all Regional Passport Offices
            and inspect real-time simulated appointment availability.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Academic Simulation Notice */}
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Academic Simulation Notice</p>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              The appointment slots and centre metrics displayed below are simulated educational data designed to model
              official Ministry of External Affairs PSK/POPSK workflows. Official portal references:{" "}
              <a
                href="https://www.passportindia.gov.in/psp/News"
                target="_blank"
                rel="noreferrer"
                className="font-bold underline hover:text-amber-950 inline-flex items-center gap-1"
              >
                Passport Seva Official Portal <ExternalLink className="w-3 h-3" />
              </a>
              .
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* RPO Filter */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Regional Passport Office (RPO) Jurisdiction
              </label>
              <select
                value={selectedRPO}
                onChange={(e) => setSelectedRPO(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
              >
                {rpoList.map((rpo) => (
                  <option key={rpo} value={rpo}>
                    {rpo === "ALL" ? "All RPOs (India)" : rpo}
                  </option>
                ))}
              </select>
            </div>

            {/* PIN Code / City Search */}
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Search by City, District, PIN Code, or Locality
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 600093, Saligramam, New Delhi, Bengaluru..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Quota View Toggle */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quota Category</label>
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
                  Normal Quota
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
                  Tatkaal Quota
                </button>
              </div>
            </div>
          </div>

          {/* Sub-tabs: Centre Type Filter */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-500 font-medium">Centre Type:</span>
              <button
                onClick={() => setSelectedType("ALL")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  selectedType === "ALL"
                    ? "bg-blue-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Centres
              </button>
              <button
                onClick={() => setSelectedType("PSK")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  selectedType === "PSK"
                    ? "bg-blue-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                PSK (Passport Seva Kendra)
              </button>
              <button
                onClick={() => setSelectedType("POPSK")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  selectedType === "POPSK"
                    ? "bg-blue-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                POPSK (Post Office PSK)
              </button>
            </div>

            <div className="text-[11px] text-slate-500">
              Slots refresh daily at <strong>12:00 PM (Normal)</strong> & <strong>02:00 PM (Tatkaal)</strong>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between text-xs text-slate-500 pb-3">
          <span>Showing {centres.length} Verified Passport Seva Centres</span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available
            </span>
            <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Limited
            </span>
            <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Quota Full / N/A
            </span>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-xs">
              <Building2 className="w-8 h-8 text-blue-900 animate-pulse mx-auto mb-2" />
              <p className="font-semibold text-slate-700 text-sm">Querying National Centre Registry...</p>
              <p className="text-xs text-slate-400 mt-1">Retrieving live capacity metrics and earliest slot dates.</p>
            </div>
          ) : centres.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-xs">
              <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-sm">No Passport Centres matched your search.</p>
              <p className="text-xs text-slate-400 mt-1">
                Try selecting "All RPOs" or clearing the PIN code / locality search bar.
              </p>
            </div>
          ) : (
            centres.map((centre) => {
              const isTatkaal = selectedQuota === "TATKAAL";
              const availability = isTatkaal ? centre.tatkaalAvailability : centre.normalAvailability;
              const earliest = isTatkaal ? centre.tatkaalEarliest : centre.normalEarliest;
              const slotsLeft = isTatkaal ? centre.tatkaalSlotsLeft : centre.normalSlotsLeft;
              const isCopied = copiedCode === centre.centerCode;

              return (
                <div
                  key={centre.id}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {centre.centerCode}
                      </span>
                      <span className="font-bold text-base text-slate-900">{centre.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                          centre.type === "PSK"
                            ? "bg-blue-100 text-blue-900"
                            : centre.type === "POPSK"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-purple-100 text-purple-900"
                        }`}
                      >
                        {centre.type}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 font-mono">
                        ({centre.associatedRpo})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{centre.address}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono pt-1">
                      <span>PIN: <strong>{centre.pinCode}</strong></span>
                      <span>•</span>
                      <span>City: <strong>{centre.city}</strong> ({centre.state})</span>
                      <span>•</span>
                      <span>Capacity: <strong>{centre.dailyCapacity}</strong>/day</span>
                      <span>•</span>
                      <span className="text-slate-400">{centre.operatingHours}</span>
                    </div>

                    {isTatkaal && centre.type === "POPSK" && (
                      <div className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 mt-2">
                        <strong>Notice:</strong> Post Office Passport Seva Kendras (POPSKs) process Normal quota
                        applications only. For Tatkaal appointments, please select a full-service PSK.
                      </div>
                    )}
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
                        {availability} {availability !== "UNAVAILABLE" && `(${slotsLeft} Slots Left)`}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/applicant/appointment?location=${encodeURIComponent(centre.name)}&quota=${selectedQuota}`}
                        className="px-4 py-2.5 rounded-lg bg-blue-950 text-white hover:bg-blue-900 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>Book Slot</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => copyAddress(centre)}
                        className="px-3 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition inline-flex items-center justify-center gap-1"
                        title="Copy full physical address"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Copy Address</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Operational Guidelines Footer Card */}
        <div className="mt-12 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            Citizen Guidelines for PSK / POPSK Appointment Visits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 leading-relaxed">
            <div className="border-l-2 border-blue-600 pl-3">
              <h3 className="font-semibold text-slate-900 mb-1">Mandatory Prior Appointment</h3>
              <p>
                Walk-ins are strictly prohibited except for prescribed humanitarian emergencies. All applicants must
                carry a printed Appointment Confirmation Slip and payment receipt.
              </p>
            </div>
            <div className="border-l-2 border-blue-600 pl-3">
              <h3 className="font-semibold text-slate-900 mb-1">Reporting Time Protocol</h3>
              <p>
                Applicants must report to the PSK exactly <strong>15 minutes prior</strong> to the scheduled batch time.
                Early entry is restricted to prevent waiting lounge congestion.
              </p>
            </div>
            <div className="border-l-2 border-blue-600 pl-3">
              <h3 className="font-semibold text-slate-900 mb-1">Original Physical Documents</h3>
              <p>
                Bring original Aadhaar card, proof of date of birth, proof of address, educational certificates (for
                Non-ECR eligibility), and current passport (for re-issue applications).
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
