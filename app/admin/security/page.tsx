"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import {
  Shield,
  Lock,
  Activity,
  History,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export default function AdminSecurityCenterPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSecurityStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setStats(data.security);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchSecurityStats();
  }, [fetchSecurityStats]);

  return (
    <AdminShell
      pageTitle="National Platform Security Center"
      pageSubtitle="Continuous compliance monitoring, access telemetry, session controls, and authentication hygiene."
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Concurrent Sessions
              </span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-3xl font-extrabold text-white font-mono">
              {loading ? "..." : stats?.activeSessions ?? 0}
            </span>
            <p className="text-[11px] text-emerald-400">Cryptographically active tokens</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Successful Logins Today
              </span>
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-3xl font-extrabold text-white font-mono">
              {loading ? "..." : stats?.loginsToday ?? 0}
            </span>
            <p className="text-[11px] text-blue-400">Identity assertions reconciled</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Failed Attempts (24h)
              </span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <span className="text-3xl font-extrabold text-rose-400 font-mono">
              {loading ? "..." : stats?.failedLoginsToday ?? 0}
            </span>
            <p className="text-[11px] text-slate-400">Automatic rate limiting triggered at 5 attempts</p>
          </div>
        </div>

        {/* Security Pillars Overview */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Architecture Security Compliance Posture
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs text-white">Zero Passwords in Application Database</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                All password hashes and master credentials are completely isolated within Supabase Auth. The core application database stores strictly metadata, UUIDs, and business state.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs text-white">Private Storage Bucket & Short-Lived URLs</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Citizen documents reside in a private Supabase Storage bucket (`passport-documents`). Documents can only be retrieved via server-authorized, 300-second signed URLs.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs text-white">Server-Side Least-Privilege Authorization</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every administrative endpoint strictly verifies `requireAdmin()` on the server. Client-side checks only regulate presentation; all mutations require server validation.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs text-white">Cryptographic Session Revocation</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Administrators can inspect all concurrent logins and revoke any session instantly. Revoked session tokens are blocked immediately upon the next server request.
              </p>
            </div>
          </div>
        </div>

        {/* Security Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/security/login-history"
            className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-5 rounded-xl block space-y-2 transition"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">Login History</span>
              <History className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xs text-slate-400">
              Audit all citizen and officer authentication attempts with IP, user-agent, and timestamp details.
            </p>
          </Link>

          <Link
            href="/admin/security/sessions"
            className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-5 rounded-xl block space-y-2 transition"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">Active Sessions</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400">
              Monitor currently active sessions and revoke unauthorized or compromised tokens.
            </p>
          </Link>

          <Link
            href="/admin/audit-logs"
            className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-5 rounded-xl block space-y-2 transition"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">Central Audit Trail</span>
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xs text-slate-400">
              Query the full immutable log of role changes, document inspections, and application status overrides.
            </p>
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
