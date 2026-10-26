"use client";

import React, { useState, useEffect } from "react";
import AdminShell from "@/components/AdminShell";
import { CreditCard, Search, FileText, CheckCircle2, ExternalLink, ShieldCheck, RefreshCw } from "lucide-react";

interface FeeSchedule {
  id: number;
  serviceType: string;
  applicationCategory: string;
  bookletType: string;
  minAge: number;
  maxAge: number;
  isLostOrDamaged: boolean;
  normalFee: number;
  tatkaalFee: number | null;
  discountPercentage: number;
  effectiveFrom: string;
  gazetteReference: string;
  description: string | null;
  isActive: boolean;
}

export default function AdminFeesPage() {
  const [schedules, setSchedules] = useState<FeeSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");

  async function loadFees() {
    setLoading(true);
    try {
      const res = await fetch("/api/fees");
      if (res.ok) {
        const data = await res.json();
        setSchedules(data.schedules || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFees();
  }, []);

  const filtered = schedules.filter((s) => {
    const matchesType = filterType === "ALL" || s.serviceType === filterType;
    const matchesSearch =
      !search ||
      s.description?.toLowerCase().includes(search.toLowerCase()) ||
      s.serviceType.toLowerCase().includes(search.toLowerCase()) ||
      s.bookletType.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <AdminShell
      pageTitle="Statutory Fee Schedule Registry"
      pageSubtitle="Official passport application fee matrices, Tatkaal rates, and concessions under Gazette G.S.R. 516(E)."
    >
      <div className="space-y-6">
        {/* Gazette Banner */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-900/60 text-purple-300 border border-purple-700/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white block">Official Gazette of India Notification G.S.R. 516(E)</span>
              <span className="text-slate-400 text-[11px]">
                Effective Date: <strong>1 July 2026</strong> • Governed by Section 24, Passports Act 1967
              </span>
            </div>
          </div>
          <a
            href="https://www.passportindia.gov.in/psp/Notification"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700 text-slate-200 hover:text-white hover:bg-slate-600 text-xs font-semibold"
          >
            Verify Official Notification
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search service, booklet size, description..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Services</option>
              <option value="FRESH">Fresh Passport</option>
              <option value="REISSUE">Re-issue / Renew</option>
              <option value="LOST_DAMAGED">Lost / Damaged</option>
              <option value="PCC">PCC</option>
            </select>
          </div>

          <button
            onClick={loadFees}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Registry
          </button>
        </div>

        {/* Fee Schedules Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-800/50 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Service & Description</th>
                  <th className="py-3 px-4">Booklet</th>
                  <th className="py-3 px-4">Age Bracket</th>
                  <th className="py-3 px-4">Normal Fee</th>
                  <th className="py-3 px-4">Tatkaal Total</th>
                  <th className="py-3 px-4">Concession</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Loading statutory schedules...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No fee schedules found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-700/20 transition">
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-bold text-white text-xs">{s.serviceType}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{s.description}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                          {s.bookletType}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {s.minAge === 0 && s.maxAge === 8
                          ? "Child (≤ 8 yrs)"
                          : s.minAge === 9 && s.maxAge === 17
                          ? "Minor (9–17 yrs)"
                          : s.minAge === 18 && s.maxAge === 59
                          ? "Adult (18–59 yrs)"
                          : s.minAge >= 60
                          ? "Senior (≥ 60 yrs)"
                          : "All Ages"}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-white">
                        ₹{s.normalFee.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-amber-300">
                        {s.tatkaalFee ? `₹${s.tatkaalFee.toLocaleString("en-IN")}` : "N/A"}
                      </td>

                      <td className="py-3 px-4">
                        {s.discountPercentage > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[10px]">
                            {s.discountPercentage}% Discount
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Enforced
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
