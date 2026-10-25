"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import {
  Shield,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Eye,
  X,
} from "lucide-react";

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Inspector modal
  const [inspectLog, setInspectLog] = useState<any | null>(null);

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (actionFilter !== "ALL") query.append("action", actionFilter);
      if (search.trim()) query.append("q", search.trim());
      query.append("page", page.toString());

      const res = await fetch(`/api/admin/audit-logs?${query.toString()}`);
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setLogs(data.logs || []);
      setActionTypes(data.actionTypes || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.totalCount || 0);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, search, page, router]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  return (
    <AdminShell
      pageTitle="Central Administrative Security Audit Trail"
      pageSubtitle="Cryptographically immutable record of administrative decisions, role adjustments, and security state modifications."
    >
      <div className="space-y-5">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Security Audit Events</h2>
            <p className="text-xs text-slate-400">
              Total {totalCount} events logged under permanent administrative oversight.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchAuditLogs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <a
              href="/api/admin/export?type=audit"
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by action, target entity ID, actor username, or reason..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-auto"
          >
            <option value="ALL">All Audit Actions</option>
            {actionTypes.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>

        {/* Audit Log Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Action Event</th>
                  <th className="px-4 py-3">Target Entity</th>
                  <th className="px-4 py-3">Actor / Authority</th>
                  <th className="px-4 py-3">Summary Details</th>
                  <th className="px-4 py-3">Logged Timestamp</th>
                  <th className="px-4 py-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      Loading security audit events...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      No audit events match search filters.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/50 transition">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                        {log.action}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {log.entityId || "SYSTEM"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white font-medium block">
                          {log.user?.username || "SYSTEM"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Role: {log.user?.role || "AUTO"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 truncate max-w-xs font-mono text-[11px]">
                        {log.details || "No additional metadata recorded."}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(log.createdAt).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setInspectLog(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>Inspect</span>
                        </button>
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

      {/* Log Details Modal */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setInspectLog(null)}
          />
          <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Audit Event Scrutiny</h3>
              </div>
              <button
                onClick={() => setInspectLog(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Action Event</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {inspectLog.action}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Target Entity ID</span>
                <span className="font-mono text-slate-200">{inspectLog.entityId || "N/A"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Actor Credentials</span>
                <span className="text-slate-200">
                  {inspectLog.user?.username || "SYSTEM"} ({inspectLog.user?.email || "internal"})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Logged Timestamp</span>
                <span className="text-slate-200">
                  {new Date(inspectLog.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Metadata Payload</span>
                <pre className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-slate-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {inspectLog.details || "No details payload attached."}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
