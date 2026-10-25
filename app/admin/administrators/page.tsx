"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import {
  ShieldCheck,
  UserPlus,
  RefreshCw,
  Mail,
  Calendar,
  Clock,
  KeyRound,
  Shield,
  ExternalLink,
} from "lucide-react";

export default function AdminAdministratorsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/administrators");
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setAdmins(data.administrators || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  return (
    <AdminShell
      pageTitle="System Administrators Directory"
      pageSubtitle="Management of authorized administrative identities, active nodes, and invitation status."
    >
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Active Platform Administrators</h2>
            <p className="text-xs text-slate-400">
              Total {admins.length} administrator account(s) authorized for system-wide governance.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchAdmins}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/admin/invitations"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Generate Invitation</span>
            </Link>
          </div>
        </div>

        {/* Administrators Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 py-12 text-center text-xs text-slate-500">
              Loading administrator nodes...
            </div>
          ) : (
            admins.map((a) => (
              <div
                key={a.id}
                className={`bg-slate-950 border rounded-xl p-5 space-y-4 shadow-sm ${
                  a.isSelf ? "border-amber-500/50 bg-amber-950/10" : "border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-white">{a.username}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/40">
                        {a.adminCode}
                      </span>
                      {a.isSelf && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900 text-blue-300 font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs text-slate-400 block">{a.email}</span>
                  </div>

                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      a.isActive
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-600/40"
                        : "bg-rose-950 text-rose-400 border border-rose-600/40"
                    }`}
                  >
                    {a.isActive ? "ACTIVE" : "SUSPENDED"}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Provisioned</span>
                    <span className="text-slate-300">{new Date(a.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Audit Events</span>
                    <span className="text-slate-300 font-mono">{a.auditLogCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Logins</span>
                    <span className="text-slate-300 font-mono">{a.loginCount}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    Last session: {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString("en-IN") : "Never"}
                  </span>
                  <Link
                    href={`/admin/users/${a.id}`}
                    className="text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminShell>
  );
}
