"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import {
  Users,
  FileText,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  UserCheck,
  UserPlus,
  RefreshCw,
  Download,
  ArrowRight,
  TrendingUp,
  Shield,
  KeyRound,
  ExternalLink,
  Database,
  Bell,
  Building2,
  Calculator,
  BookOpen,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/stats");
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) {
        setError("Failed to load administrative metrics.");
        return;
      }
      const json = await res.json();
      setData(json);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Network error loading administrative statistics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const users = data?.users || {};
  const apps = data?.applications || {};
  const security = data?.security || {};
  const recentLogs = data?.recentAuditLogs || [];
  const recentApps = data?.recentApplications || [];

  return (
    <AdminShell
      pageTitle="Executive Administration Dashboard"
      pageSubtitle="Comprehensive operational overview of citizen applications, authority workflows, and platform security."
    >
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">System Operational Overview</h2>
          <p className="text-xs text-slate-400">
            Real-time aggregate telemetry synchronized from the core PostgreSQL engine.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <a
            href="/api/admin/export?type=applications"
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </a>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Primary Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <div className="h-8 w-8 rounded-lg bg-blue-900/40 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white font-mono">
              {loading ? "..." : users.total ?? 0}
            </span>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+{users.newWeek ?? 0} new this week</span>
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{users.applicants ?? 0} Citizens</span>
            <span>{users.officers ?? 0} Officers</span>
            <span>{users.police ?? 0} Police</span>
          </div>
        </div>

        {/* Total Applications */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Applications</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-900/40 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white font-mono">
              {loading ? "..." : apps.total ?? 0}
            </span>
            <p className="text-[11px] text-indigo-300 mt-1">
              {apps.policePending ?? 0} awaiting Police Enquiry
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{apps.submitted ?? 0} Submitted</span>
            <span>{apps.approved ?? 0} Approved</span>
            <span>{apps.dispatched ?? 0} Dispatched</span>
          </div>
        </div>

        {/* Active Logins & Sessions */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Security & Sessions</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white font-mono">
              {loading ? "..." : security.activeSessions ?? 0}
            </span>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Concurrent Sessions</span>
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>{security.loginsToday ?? 0} Logins Today</span>
            <span className="text-rose-400">{security.failedLoginsToday ?? 0} Failed Attempts</span>
          </div>
        </div>

        {/* System Administration */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Administrators</span>
            <div className="h-8 w-8 rounded-lg bg-amber-900/40 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white font-mono">
              {loading ? "..." : users.admins ?? 1}
            </span>
            <p className="text-[11px] text-amber-400 mt-1">
              Protected Least-Privilege Nodes
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <Link href="/admin/administrators" className="text-blue-400 hover:underline">
              Manage Admins →
            </Link>
            <Link href="/admin/invitations" className="text-amber-400 hover:underline">
              Invite →
            </Link>
          </div>
        </div>
      </div>

      {/* Application Lifecycle Pipeline Breakdown */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Application Pipeline Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Distribution of applications through canonical passport service stages.
            </p>
          </div>
          <Link
            href="/admin/applications"
            className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View Full Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-center space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">DRAFT</span>
            <span className="text-lg font-bold text-slate-300 font-mono">{apps.draft ?? 0}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-center space-y-1">
            <span className="text-[10px] font-bold uppercase text-blue-400 block">SUBMITTED</span>
            <span className="text-lg font-bold text-blue-300 font-mono">{apps.submitted ?? 0}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-center space-y-1">
            <span className="text-[10px] font-bold uppercase text-indigo-400 block">APPT BOOKED</span>
            <span className="text-lg font-bold text-indigo-300 font-mono">{apps.appointmentBooked ?? 0}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-center space-y-1">
            <span className="text-[10px] font-bold uppercase text-amber-400 block">POLICE ENQUIRY</span>
            <span className="text-lg font-bold text-amber-300 font-mono">{apps.policePending ?? 0}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-center space-y-1">
            <span className="text-[10px] font-bold uppercase text-emerald-400 block">APPROVED</span>
            <span className="text-lg font-bold text-emerald-300 font-mono">{apps.approved ?? 0}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-center space-y-1">
            <span className="text-[10px] font-bold uppercase text-teal-400 block">DISPATCHED</span>
            <span className="text-lg font-bold text-teal-300 font-mono">{apps.dispatched ?? 0}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-center space-y-1">
            <span className="text-[10px] font-bold uppercase text-rose-400 block">REJECTED</span>
            <span className="text-lg font-bold text-rose-300 font-mono">{apps.rejected ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Database-Driven System Summary (Section 30) */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                PostgreSQL Departmental Database Registry State
              </h3>
              <p className="text-xs text-slate-400">
                Live database counts queried dynamically across departmental records.
              </p>
            </div>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-mono">
            Single Source of Truth
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* News & Public Notices */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-blue-400" />
                Public Notices
              </span>
              <Link href="/admin/notices" className="text-blue-400 hover:underline text-[11px]">
                Manage →
              </Link>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {data?.databaseSummary?.notices?.total ?? 0}
              </span>
              <span className="text-xs text-slate-400">total in DB</span>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Published Live:</span>
                <strong className="text-emerald-400">{data?.databaseSummary?.notices?.published ?? 0}</strong>
              </div>
              <div className="flex justify-between">
                <span>Drafts / Archived:</span>
                <span className="text-slate-300">
                  {data?.databaseSummary?.notices?.draft ?? 0} / {data?.databaseSummary?.notices?.archived ?? 0}
                </span>
              </div>
              {data?.databaseSummary?.notices?.byYear && data.databaseSummary.notices.byYear.length > 0 && (
                <div className="pt-1 flex flex-wrap gap-1">
                  {data.databaseSummary.notices.byYear.map((ys: any) => (
                    <span key={ys.year} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-purple-300">
                      {ys.year}: {ys.count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Statutory Services */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                Statutory Services
              </span>
              <Link href="/services" target="_blank" className="text-emerald-400 hover:underline text-[11px]">
                Directory →
              </Link>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {data?.databaseSummary?.servicesTotal ?? 13}
              </span>
              <span className="text-xs text-slate-400">services in DB</span>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              Citizen core workflows, diplomatic passports, LoC permits, and annexures.
            </div>
          </div>

          {/* Passport Centres */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                Passport Centres
              </span>
              <Link href="/admin/centres" className="text-indigo-400 hover:underline text-[11px]">
                Manage →
              </Link>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {data?.databaseSummary?.centresTotal ?? 10}
              </span>
              <span className="text-xs text-slate-400">active PSKs / POPSKs</span>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              National network with dynamic capacity allocation and earliest slot dates.
            </div>
          </div>

          {/* Statutory Fees */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                Fee Schedules
              </span>
              <Link href="/admin/fees" className="text-amber-400 hover:underline text-[11px]">
                Inspect →
              </Link>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {data?.databaseSummary?.feesTotal ?? 13}
              </span>
              <span className="text-xs text-slate-400">GSR 516(E) tiers</span>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              Official statutory rates effective 1 July 2026 with 10% concession rules.
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications Feed */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Recent Citizen Applications
              </h3>
            </div>
            <Link href="/admin/applications" className="text-xs text-blue-400 hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentApps.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No recent application records found.</p>
            ) : (
              recentApps.map((a: any) => (
                <div
                  key={a.id}
                  className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{a.applicationId}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-500/30">
                        {a.serviceType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {a.applicant?.name || a.givenName || "Citizen"} • {a.rpoLocation}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="inline-block text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      {a.status}
                    </span>
                    <p className="text-[10px] text-slate-500">
                      {new Date(a.updatedAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Administrative Audit Events */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Real-Time Security Audit Trail
              </h3>
            </div>
            <Link href="/admin/audit-logs" className="text-xs text-blue-400 hover:underline">
              Full log
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No security audit logs recorded yet.</p>
            ) : (
              recentLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex items-start justify-between text-xs space-x-3 hover:border-slate-700 transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-emerald-400">
                        {log.action}
                      </span>
                      {log.entityId && (
                        <span className="text-[10px] font-mono text-slate-400">
                          [{log.entityId}]
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Actor: {log.user?.username || "SYSTEM"} ({log.user?.role || "AUTO"})
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 mt-0.5">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
