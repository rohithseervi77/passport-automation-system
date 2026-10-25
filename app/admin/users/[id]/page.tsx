"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import {
  User,
  Shield,
  FileText,
  Activity,
  History,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

export default function AdminUserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const userId = resolvedParams.id;

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) {
        setError("User account not found.");
        return;
      }
      const json = await res.json();
      setData(json.user);
    } catch (err) {
      console.error(err);
      setError("Network error loading user details.");
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  async function handleStatusAction(action: "SUSPEND" | "ACTIVATE" | "UNLOCK") {
    if (
      action === "SUSPEND" &&
      !confirm("Are you sure you want to suspend this account? All active sessions will be invalidated.")
    ) {
      return;
    }

    setActionLoading(true);
    setActionMessage("");
    setError("");

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: "Administrative status update" }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setError(resData.error || "Status update failed.");
        return;
      }

      setActionMessage(resData.message);
      await fetchUser();
    } catch {
      setError("Failed to execute account status action.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <AdminShell pageTitle="User Profile Inspection">
        <div className="py-20 text-center text-slate-500 text-xs">
          Loading detailed administrative record...
        </div>
      </AdminShell>
    );
  }

  if (!data) {
    return (
      <AdminShell pageTitle="User Not Found">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-white">User Record Not Found</h3>
          <p className="text-xs text-slate-400">The requested identity does not exist in the PAS registry.</p>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to User Directory</span>
          </Link>
        </div>
      </AdminShell>
    );
  }

  const user = data;
  const applicant = user.applicant;
  const officer = user.passportOfficer;
  const police = user.police;
  const admin = user.admin;
  const apps = applicant?.applications || [];
  const logins = user.loginHistories || [];
  const auditLogs = user.auditLogs || [];

  return (
    <AdminShell
      pageTitle={`User Profile: ${applicant?.name || user.username} (#${user.id})`}
      pageSubtitle="Administrative scrutiny of identity attributes, authorization standing, and lifecycle activity."
    >
      <div className="space-y-6">
        {/* Back Link & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to User Directory</span>
          </Link>

          <div className="flex items-center gap-2">
            {user.isActive ? (
              <button
                onClick={() => handleStatusAction("SUSPEND")}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition"
              >
                Suspend Account
              </button>
            ) : (
              <button
                onClick={() => handleStatusAction("ACTIVATE")}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition"
              >
                Reactivate Account
              </button>
            )}

            {user.lockedUntil && new Date(user.lockedUntil) > new Date() && (
              <button
                onClick={() => handleStatusAction("UNLOCK")}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition"
              >
                Unlock Account
              </button>
            )}

            <Link
              href="/admin/roles"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Modify Role</span>
            </Link>
          </div>
        </div>

        {actionMessage && (
          <div className="p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Primary Attribute Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity & Account Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <span>Identity Profile</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Full Name</span>
                <span className="text-white font-bold text-sm">{applicant?.name || user.username}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Primary Email</span>
                <span className="text-slate-300 font-mono">{user.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">System Username</span>
                <span className="text-slate-300 font-mono">@{user.username}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Supabase Auth ID</span>
                <span className="text-slate-400 font-mono text-[11px] truncate block">
                  {user.authUserId || "Unlinked / Offline"}
                </span>
              </div>
            </div>
          </div>

          {/* Authorization & Role Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Authorization Standing</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Assigned Role</span>
                <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold border uppercase bg-blue-950 text-blue-300 border-blue-600/40 mt-1">
                  {user.role}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Account Status</span>
                <span className="inline-flex items-center gap-1.5 mt-1 font-semibold text-xs">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      user.isActive ? "bg-emerald-400" : "bg-rose-400"
                    }`}
                  />
                  <span className={user.isActive ? "text-emerald-400" : "text-rose-400"}>
                    {user.isActive ? "ACTIVE & AUTHORIZED" : "SUSPENDED"}
                  </span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Role Attributes</span>
                <p className="text-slate-300 text-[11px] mt-0.5 font-mono">
                  {admin && `Admin Code: ${admin.adminCode}`}
                  {officer && `Officer ID: ${officer.officerId} (${officer.branchLocation})`}
                  {police && `Badge: ${police.badgeNumber} (Station: ${police.stationCode})`}
                  {applicant && `Applicant ID: ${applicant.applicantId}`}
                  {!admin && !officer && !police && !applicant && "Standard Identity"}
                </p>
              </div>
            </div>
          </div>

          {/* Security & Access Telemetry */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Access Telemetry</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Account Created</span>
                <span className="text-slate-300">
                  {new Date(user.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Last Successful Login</span>
                <span className="text-slate-300">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("en-IN") : "Never"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Consecutive Failed Logins</span>
                <span className="text-slate-300 font-mono">{user.failedLoginAttempts || 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Lockout Expiration</span>
                <span className="text-slate-300">
                  {user.lockedUntil && new Date(user.lockedUntil) > new Date()
                    ? new Date(user.lockedUntil).toLocaleTimeString("en-IN")
                    : "No active lockout"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Associated with User */}
        {apps.length > 0 && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Passport Applications ({apps.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {apps.map((a: any) => (
                <div
                  key={a.id}
                  className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-mono font-bold text-white text-sm block">
                      {a.applicationId}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {a.serviceType} • {a.applicationCategory} • {a.rpoLocation}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Submitted: {a.submissionDate ? new Date(a.submissionDate).toLocaleDateString() : "Draft"}
                    </span>
                  </div>
                  <div className="text-right space-y-2">
                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      {a.status}
                    </span>
                    <div>
                      <Link
                        href={`/admin/applications/${a.applicationId}`}
                        className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:underline"
                      >
                        <span>Inspect Application</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Login History */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <span>Recent Authentication History (Zero Passwords Stored)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2">Outcome</th>
                  <th className="px-3 py-2">Timestamp</th>
                  <th className="px-3 py-2">IP Address</th>
                  <th className="px-3 py-2">Device / Client</th>
                  <th className="px-3 py-2">Session Identifier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {logins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                      No authentication history logged for this user.
                    </td>
                  </tr>
                ) : (
                  logins.map((l: any) => (
                    <tr key={l.id}>
                      <td className="px-3 py-2.5">
                        {l.success ? (
                          <span className="text-emerald-400 font-semibold text-[11px]">SUCCESS</span>
                        ) : (
                          <span className="text-rose-400 font-semibold text-[11px]">FAILED</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-slate-400">
                        {new Date(l.loginTime).toLocaleString("en-IN")}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-slate-400">
                        {l.ipAddress || "Internal"}
                      </td>
                      <td className="px-3 py-2.5 text-slate-400 text-[11px] truncate max-w-xs">
                        {l.userAgent || "Web Client"}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[10px] text-slate-500 truncate max-w-xs">
                        {l.sessionId || "N/A"}
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
