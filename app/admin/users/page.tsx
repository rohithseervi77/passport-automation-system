"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import {
  Users,
  Search,
  Filter,
  Shield,
  UserCheck,
  UserX,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Download,
  KeyRound,
  RefreshCw,
} from "lucide-react";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (roleFilter !== "ALL") query.append("role", roleFilter);
      if (statusFilter !== "ALL") query.append("status", statusFilter);
      if (search.trim()) query.append("q", search.trim());
      query.append("page", page.toString());

      const res = await fetch(`/api/admin/users?${query.toString()}`);
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.totalCount || 0);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, search, page, router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function getRoleBadge(role: string) {
    switch (role) {
      case "ADMIN":
        return "bg-amber-950/80 text-amber-300 border-amber-600/40";
      case "OFFICER":
        return "bg-blue-950/80 text-blue-300 border-blue-600/40";
      case "POLICE":
        return "bg-emerald-950/80 text-emerald-300 border-emerald-600/40";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  }

  return (
    <AdminShell
      pageTitle="User Directory & Authorization Roster"
      pageSubtitle="Administrative view of all registered identities, assigned roles, and security standing."
    >
      <div className="space-y-5">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">System User Accounts</h2>
            <p className="text-xs text-slate-400">
              Total {totalCount} registered accounts across all departmental jurisdictions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchUsers}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <a
              href="/api/admin/export?type=users"
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, username, or officer/badge ID..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="APPLICANT">Applicants</option>
              <option value="OFFICER">Passport Officers</option>
              <option value="POLICE">Police Personnel</option>
              <option value="ADMIN">Administrators</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Accounts</option>
              <option value="SUSPENDED">Suspended Accounts</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">User & Contact</th>
                  <th className="px-4 py-3">Assigned Role</th>
                  <th className="px-4 py-3">Account Standing</th>
                  <th className="px-4 py-3">Activity</th>
                  <th className="px-4 py-3">Registered Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      Loading user accounts...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      No user accounts match the selected search criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/50 transition">
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white block">{u.displayName}</span>
                          <span className="font-mono text-[11px] text-slate-400 block">{u.email}</span>
                          <span className="text-[10px] text-slate-500 font-mono">ID: #{u.id} • @{u.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getRoleBadge(
                            u.role
                          )}`}
                        >
                          {u.role}
                        </span>
                        {u.roleDetails?.adminCode && (
                          <span className="block font-mono text-[10px] text-amber-400/90 mt-0.5">
                            {u.roleDetails.adminCode}
                          </span>
                        )}
                        {u.roleDetails?.officerId && (
                          <span className="block font-mono text-[10px] text-blue-400/90 mt-0.5">
                            {u.roleDetails.officerId}
                          </span>
                        )}
                        {u.roleDetails?.badgeNumber && (
                          <span className="block font-mono text-[10px] text-emerald-400/90 mt-0.5">
                            Badge: {u.roleDetails.badgeNumber}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                            <span>Suspended</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="block text-slate-300">
                          {u.applicationCount} Application(s)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {u.loginCount} Logins recorded
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-2">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                        >
                          <span>Profile</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing Page {page} of {totalPages} ({totalCount} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
