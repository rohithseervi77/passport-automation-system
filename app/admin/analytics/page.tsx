"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  ShieldCheck,
  RefreshCw,
  FileText,
  AlertCircle,
  Building2,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const statusDist = data?.statusDistribution || [];
  const serviceDist = data?.serviceDistribution || [];
  const quotaDist = data?.quotaDistribution || [];
  const policeDist = data?.policeClearanceDistribution || [];
  const officerWorkloads = data?.officerWorkloads || [];
  const policeWorkloads = data?.policeWorkloads || [];

  const maxStatusCount = Math.max(...statusDist.map((s: any) => s.count), 1);

  return (
    <AdminShell
      pageTitle="National Telemetry & Service Analytics"
      pageSubtitle="Aggregated statistical distribution of passport applications, officer throughput, and police enquiry SLAs."
    >
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">System Performance Metrics</h2>
            <p className="text-xs text-slate-400">
              Computed statistical breakdown of application demand and processing bottlenecks.
            </p>
          </div>

          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Recalculate Metrics</span>
          </button>
        </div>

        {/* Application Status Volume Breakdown (Custom Visual Bar Chart) */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Application Volume by Canonical Workflow State</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Live DB Totals</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Aggregating telemetry...</div>
          ) : statusDist.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No applications on record.</div>
          ) : (
            <div className="space-y-3 pt-2">
              {statusDist.map((s: any) => {
                const percentage = Math.round((s.count / maxStatusCount) * 100);
                return (
                  <div key={s.status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-300 font-semibold">{s.status}</span>
                      <span className="font-mono text-slate-400 font-bold">{s.count} Apps</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Two-Column Grid: Services and Quotas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service Types */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Service Type Demand</span>
            </h3>

            <div className="space-y-3">
              {serviceDist.map((s: any) => (
                <div
                  key={s.service}
                  className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-white uppercase">{s.service}</span>
                  <span className="font-mono font-bold text-indigo-400 text-sm">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quotas */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Scheme Allocation (Normal vs Tatkaal)</span>
            </h3>

            <div className="space-y-3">
              {quotaDist.map((q: any) => (
                <div
                  key={q.quota}
                  className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-white uppercase">{q.quota}</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">{q.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Officer & Police Throughput */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Officer Workloads */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Passport Officer Scrutiny Workload</span>
            </h3>

            <div className="space-y-2.5">
              {officerWorkloads.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No officer assignments found.</p>
              ) : (
                officerWorkloads.map((o: any) => (
                  <div
                    key={o.officerId}
                    className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{o.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{o.officerId}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-blue-400 font-bold block">
                        {o.assignedApps} Assigned
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {o.passportsIssued} Passports Issued
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Police Station Throughput */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Police Verification Clearance SLA</span>
            </h3>

            <div className="space-y-2.5">
              {policeWorkloads.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No police report statistics logged.</p>
              ) : (
                policeWorkloads.map((p: any) => (
                  <div
                    key={p.badgeNumber}
                    className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">Station: {p.stationCode}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Badge: {p.badgeNumber}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-emerald-400 font-bold block">
                        {p.reportsFiled} Reports Cleared
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
