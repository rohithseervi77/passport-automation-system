"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import {
  KeyRound,
  Shield,
  Search,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
} from "lucide-react";

export default function AdminRolesPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [targetRole, setTargetRole] = useState("OFFICER");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(search)}&limit=30`);
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load user roster.");
    } finally {
      setLoading(false);
    }
  }, [search, router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleRoleChange(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    if (!reason.trim()) {
      alert("A specific administrative reason is required for role reassignment.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newRole: targetRole,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Role modification failed.");
        return;
      }

      setMessage(data.message);
      setSelectedUser(null);
      setReason("");
      await fetchUsers();
    } catch {
      setError("Network or server error during role modification.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminShell
      pageTitle="Role Assignment & Privilege Hierarchy"
      pageSubtitle="Strict least-privilege administration. Control access levels for Citizens, Officers, Police, and Administrators."
    >
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Role Management Console</h2>
            <p className="text-xs text-slate-400">
              Modify operational clearances across administrative and field authority roles.
            </p>
          </div>

          <button
            onClick={fetchUsers}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Roster</span>
          </button>
        </div>

        {message && (
          <div className="p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter identity by username, email, name, or officer/badge ID..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* User Role Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">User & Contact</th>
                <th className="px-4 py-3">Current Role</th>
                <th className="px-4 py-3">Account Standing</th>
                <th className="px-4 py-3 text-right">Assign New Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                    Loading role records...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                    No users match search.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/50 transition">
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <span className="font-bold text-white block">{u.displayName}</span>
                        <span className="font-mono text-[11px] text-slate-400 block">{u.email}</span>
                        <span className="text-[10px] text-slate-500 font-mono">@{u.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase bg-blue-950 text-blue-300 border-blue-600/40">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {u.isActive ? (
                        <span className="text-emerald-400 text-xs">Active</span>
                      ) : (
                        <span className="text-rose-400 text-xs">Suspended</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setTargetRole(u.role === "ADMIN" ? "OFFICER" : "ADMIN");
                          setReason("");
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Reassign Role</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setSelectedUser(null)}
          />
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Reassign Account Role</h3>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
              <p className="text-slate-400">Target User: <strong className="text-white">{selectedUser.displayName}</strong></p>
              <p className="text-slate-400">Email: <span className="font-mono text-slate-300">{selectedUser.email}</span></p>
              <p className="text-slate-400">Current Role: <span className="font-bold text-amber-300">{selectedUser.role}</span></p>
            </div>

            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200">
              Notice: Reassigning role automatically revokes all existing active sessions for this user, requiring fresh authentication with the newly designated privileges.
            </div>

            <form onSubmit={handleRoleChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Select New Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ADMIN">ADMIN (System Administrator)</option>
                  <option value="OFFICER">OFFICER (Passport Processing Officer)</option>
                  <option value="POLICE">POLICE (Enquiry & Field Verification Authority)</option>
                  <option value="APPLICANT">APPLICANT (Citizen User)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Administrative Reason (Mandatory)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State the departmental order or reason for this role assignment..."
                  rows={2}
                  required
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                >
                  {submitting ? "Updating Role..." : "Confirm Role Change"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
