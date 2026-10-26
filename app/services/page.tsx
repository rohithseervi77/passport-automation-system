"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  Zap,
  Globe2,
  FileCheck2,
  ScrollText,
  Compass,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  X,
  FileCode,
  AlertCircle,
  Building2,
  Search,
} from "lucide-react";

interface ServiceItem {
  id: string;
  title: string;
  category: "CITIZEN_CORE" | "SPECIALIZED" | "STATUTORY_PERMITS" | "LEGAL_ANNEXURES";
  badge: string;
  badgeColor: string;
  description: string;
  eligibility: string;
  applicantCategory: string;
  documentGuidance: string[];
  processOverview: string[];
  fee: string;
  annexures: string;
  link?: string;
  isSimulatedWorkflow: boolean;
  officialSourceUrl: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | "CITIZEN_CORE" | "SPECIALIZED" | "STATUTORY_PERMITS" | "LEGAL_ANNEXURES">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== "ALL") params.set("category", activeTab);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const res = await fetch(`/api/services?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load services from database");

      const data = await res.json();
      setServices(data.services || []);
    } catch (err: any) {
      console.error("Services fetch error:", err);
      setError("Unable to load services from the database.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchServices]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16 flex flex-col justify-between">
      <div>
        <Navbar role="APPLICANT" userName="Citizen Portal" />

        {/* Tricolor Government Border Bar */}
        <div className="h-1 w-full bg-linear-to-r from-orange-500 via-white to-green-600" />

        {/* Hero Section */}
        <div className="bg-[#002B49] text-white py-10 px-4 sm:px-6 border-b border-blue-900">
          <div className="mx-auto max-w-6xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-800/80 text-blue-200 text-xs font-semibold mb-2 border border-blue-700/60">
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              Consular, Passport & Visa Services Directory
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Catalogue of Passport & Statutory Travel Services
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-blue-200/90 max-w-2xl leading-relaxed">
              Explore the database-backed directory of citizen passport issuance workflows, specialized diplomatic
              and official documents, overseas consular services, statutory permits, and official legal annexures.
            </p>

            {/* Category Filter Tabs & Search */}
            <div className="mt-6 pt-4 border-t border-blue-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {[
                  { id: "ALL", label: `All Services (${services.length})` },
                  { id: "CITIZEN_CORE", label: "Citizen Core (Apply Online)" },
                  { id: "SPECIALIZED", label: "Specialized & Diplomatic" },
                  { id: "STATUTORY_PERMITS", label: "Permits & Overseas NRIs" },
                  { id: "LEGAL_ANNEXURES", label: "Legal Rules & Annexures" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                      activeTab === tab.id
                        ? "bg-white text-blue-950 shadow-xs"
                        : "bg-blue-900/60 text-blue-200 hover:bg-blue-800/80 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-blue-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search services, PCC, permits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-blue-900/70 border border-blue-700 text-white placeholder-blue-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={() => fetchServices()} className="underline font-bold text-red-900">
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="bg-white p-16 rounded-xl border border-slate-200 shadow-xs text-center">
              <BookOpen className="w-8 h-8 text-blue-900 animate-pulse mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Loading statutory services from database...</p>
              <p className="text-xs text-slate-400 mt-1">Querying PassportService registry.</p>
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white p-16 rounded-xl border border-slate-200 shadow-xs text-center">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No services found matching current filters.</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting the category filter or clearing search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition p-6 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${service.badgeColor}`}
                      >
                        {service.badge}
                      </span>
                      {service.isSimulatedWorkflow ? (
                        <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Online System
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                          Statutory Guidance
                        </span>
                      )}
                    </div>

                    <h2 className="text-base font-bold text-slate-900">{service.title}</h2>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{service.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                    <div className="text-[11px] text-slate-500 font-medium">
                      Fee: <strong className="text-slate-800">{service.fee}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedService(service)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
                      >
                        Guidance & Checklist
                      </button>

                      {service.link ? (
                        <Link
                          href={service.link}
                          className="px-3 py-1.5 rounded-lg bg-blue-950 text-white hover:bg-blue-900 text-xs font-semibold transition flex items-center gap-1 shadow-xs"
                        >
                          <span>Apply</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <a
                          href={service.officialSourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1"
                        >
                          <span>Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Service Guidance Modal */}
        {selectedService && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-100 text-blue-900">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedService.title}</h3>
                    <p className="text-[11px] text-slate-500">{selectedService.badge}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 text-xs text-slate-700">
                {/* Description & Eligibility */}
                <div className="space-y-3">
                  <p className="text-xs leading-relaxed text-slate-600">{selectedService.description}</p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">Citizen Eligibility:</span>
                    <p className="text-slate-600">{selectedService.eligibility}</p>
                  </div>
                </div>

                {/* Document Guidance */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                    Prescribed Document Checklist
                  </span>
                  <ul className="space-y-1.5 bg-blue-50/50 p-3.5 rounded-lg border border-blue-100">
                    {selectedService.documentGuidance.map((doc, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Step-by-step Process Overview */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                    Procedural Workflow & Scrutiny
                  </span>
                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    {selectedService.processOverview.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-900 text-white text-[10px] flex items-center justify-center shrink-0 font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-slate-700 leading-snug pt-0.5">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fee & Statutory Annexures */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <span className="font-bold text-amber-950 block text-[11px]">Statutory Fee</span>
                    <span className="text-amber-900 font-semibold">{selectedService.fee}</span>
                  </div>
                  <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block text-[11px]">Required Annexure</span>
                    <span className="text-slate-700">{selectedService.annexures}</span>
                  </div>
                </div>

                {/* Academic Notice */}
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p>
                    <strong>Academic Simulation:</strong> Core citizen workflows (Fresh, Re-issue, Tatkaal, PCC) are
                    fully operational within this simulation system. Specialized documents follow official Passport
                    Seva guidelines.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <a
                  href={selectedService.officialSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-900 font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>Official MEA Portal Reference</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedService(null)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Close
                  </button>
                  {selectedService.link && (
                    <Link
                      href={selectedService.link}
                      className="px-4 py-2 rounded-lg bg-blue-950 text-white hover:bg-blue-900 text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      <span>Proceed to Application</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
