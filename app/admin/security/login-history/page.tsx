"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
} from "lucide-react";

export default function AdminLoginHistoryPage() {
  const router = useRouter();
  const [logins, setLogins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, SUCCESS, FAILED
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogins = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter !== "ALL") query.append("status", statusFilter);
      if (roleFilter !== "ALL") query.append("role", roleFilter);
      if (search.trim()) query.append("q", search.trim());
      query.append("page", page.toString());

      const res = await fetch(`/api/admin/login-history?${query.toString()}`);
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setLogins(data.logins || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.totalCount || 0);
    } catch (err) {
      console.error("Failed to load logins:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, roleFilter, search, page, router]);

  useEffect(() => {
    fetchLogins();
  }, [fetchLogins]);

  return (
    <AdminShell
      pageTitle="Authentication & Login Telemetry"
      pageSubtitle="Immutable audit trail of all citizen and authority access attempts (Zero passwords stored or viewable)."
    >
      <div className="space-y-5">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Login History Audit</h2>
            <p className="text-xs text-slate-400">
              Total {totalCount} authentication attempts registered across all authority boundaries.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchLogins}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <a
              href="/api/admin/export?type=logins"
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by email, authUserId, or IP address..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Outcomes</option>
              <option value="SUCCESS">Successful Logins</option>
              <option value="FAILED">Failed Attempts</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="APPLICANT">Applicant</option>
              <option value="OFFICER">Officer</option>
              <option value="POLICE">Police</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3">User Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Login Timestamp</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Client / User Agent</th>
                  <th className="px-4 py-3">Session Identifier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                      Loading authentication logs...
                    </td>
                  </tr>
                ) : logins.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                      No authentication history records found.
                    </td>
                  </tr>
                ) : (
                  logins.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-900/50 transition">
                      <td className="px-4 py-3">
                        {l.success ? (
                          <span className="inline-flex items-center gap-1 font-bold text-[11px] text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>SUCCESS</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-[11px] text-rose-400">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>FAILED</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-200">{l.email}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase bg-slate-900 text-slate-400 border border-slate-800">
                          {l.role || "UNKNOWN"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(l.loginTime).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                        {l.ipAddress || "Internal Gateway"}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px] truncate max-w-xs">
                        {l.userAgent || "Web Client"}
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-500 truncate max-w-xs">
                        {l.sessionId || "N/A"}
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
