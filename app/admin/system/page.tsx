"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import {
  Cpu,
  Database,
  HardDrive,
  ShieldCheck,
  Activity,
  RefreshCw,
  Server,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from "lucide-react";

export default function AdminSystemHealthPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pinging, setPinging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/system/health");
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch system telemetry");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to reach health monitoring subsystem");
    } finally {
      setLoading(false);
    }
  }, [router]);

  async function handleRecheck() {
    setPinging(true);
    await fetchHealth();
    setPinging(false);
  }

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  function formatUptime(seconds: number = 0) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(" ");
  }

  return (
    <AdminShell pageTitle="System Health & Infrastructure" pageSubtitle="Live engine diagnostics, database connectivity, and telemetry">
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${data?.systemStatus === "OPERATIONAL" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800">System Telemetry Engine</h2>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  data?.systemStatus === "OPERATIONAL" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${data?.systemStatus === "OPERATIONAL" ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
                  {data?.systemStatus || "CHECKING"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Last checked: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : "Pending"}
              </p>
            </div>
          </div>
          <button
            onClick={handleRecheck}
            disabled={pinging || loading}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${pinging || loading ? "animate-spin" : ""}`} />
            Run Diagnostics Ping
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 3 Core Services Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Database */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                  <Database className="w-5 h-5" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  data?.services?.database?.status === "HEALTHY" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                }`}>
                  {data?.services?.database?.status || "UNKNOWN"}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Relational Database</h3>
              <p className="text-xs text-slate-500 mt-1">{data?.services?.database?.provider || "PostgreSQL"}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Query Ping Latency</span>
              <span className="font-mono font-semibold text-slate-800">
                {data?.services?.database?.latencyMs !== undefined ? `${data.services.database.latencyMs} ms` : "--"}
              </span>
            </div>
          </div>

          {/* Storage */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                  <HardDrive className="w-5 h-5" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  data?.services?.storage?.configured ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {data?.services?.storage?.configured ? "CONFIGURED" : "FALLBACK"}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Document Vault Storage</h3>
              <p className="text-xs text-slate-500 mt-1">{data?.services?.storage?.provider || "Supabase Storage"}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Security Access Mode</span>
              <span className="font-semibold text-emerald-700">AES-256 Signed URLs</span>
            </div>
          </div>

          {/* Authentication */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                  {data?.services?.authentication?.status || "ACTIVE"}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Identity & Access Auth</h3>
              <p className="text-xs text-slate-500 mt-1">{data?.services?.authentication?.provider || "Supabase Auth"}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Database Passwords</span>
              <span className="font-semibold text-emerald-700">0 Stored (Zero-Leak)</span>
            </div>
          </div>
        </div>

        {/* Runtime & Server Telemetry */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-800">Server & Environment Specifications</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">PID: Node.js worker</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="p-4">
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>Node.js Engine</span>
              </div>
              <div className="text-sm font-mono font-bold text-slate-900">{data?.runtime?.nodeVersion || "--"}</div>
            </div>
            <div className="p-4">
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Platform / Arch</span>
              </div>
              <div className="text-sm font-mono font-bold text-slate-900">
                {data?.runtime?.platform ? `${data.runtime.platform} (${data.runtime.architecture})` : "--"}
              </div>
            </div>
            <div className="p-4">
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Process Uptime</span>
              </div>
              <div className="text-sm font-mono font-bold text-slate-900">
                {data?.uptimeSeconds !== undefined ? formatUptime(data.uptimeSeconds) : "--"}
              </div>
            </div>
            <div className="p-4">
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>RSS Memory Usage</span>
              </div>
              <div className="text-sm font-mono font-bold text-slate-900">
                {data?.runtime?.memoryUsageMb ? `${data.runtime.memoryUsageMb} MB` : "--"}
              </div>
            </div>
          </div>
        </div>

        {/* Security & Architecture Guarantees */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Architectural Guarantees & Compliance Checklist
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-2.5 bg-white p-3.5 rounded-lg border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Zero Password Storage Architecture</p>
                <p className="text-slate-500 mt-0.5">
                  Citizen and administrator passwords or bcrypt hashes are never saved or queryable in the PostgreSQL schema.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-white p-3.5 rounded-lg border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Short-Lived Ephemeral Signed URLs</p>
                <p className="text-slate-500 mt-0.5">
                  Citizen documents are kept in private Supabase Storage buckets and inspected exclusively via 5-minute signed links.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-white p-3.5 rounded-lg border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Strict Server-Side Session Enforcement</p>
                <p className="text-slate-500 mt-0.5">
                  All administrative endpoints and pages invoke <code className="text-slate-700 bg-slate-100 px-1 rounded">requireAdmin()</code> before delivering data.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-white p-3.5 rounded-lg border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Complete Audit Trail Logging</p>
                <p className="text-slate-500 mt-0.5">
                  Every status override, role elevation, document preview, and settings update is permanently logged in <code className="text-slate-700 bg-slate-100 px-1 rounded">AuditLog</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
