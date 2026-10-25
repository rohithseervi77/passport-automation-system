"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import {
  FileText,
  Search,
  Filter,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Building2,
  ShieldCheck,
  Clock,
} from "lucide-react";

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [quotaFilter, setQuotaFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter !== "ALL") query.append("status", statusFilter);
      if (serviceFilter !== "ALL") query.append("serviceType", serviceFilter);
      if (quotaFilter !== "ALL") query.append("quota", quotaFilter);
      if (search.trim()) query.append("q", search.trim());
      query.append("page", page.toString());

      const res = await fetch(`/api/admin/applications?${query.toString()}`);
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setApplications(data.applications || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.totalCount || 0);
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, serviceFilter, quotaFilter, search, page, router]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  function getStatusClass(status: string) {
    if (status.includes("APPROVED") || status.includes("CLEARED") || status.includes("DISPATCH")) {
      return "bg-emerald-950/80 text-emerald-300 border-emerald-600/40";
    }
    if (status.includes("REJECT") || status.includes("ADVERSE")) {
      return "bg-rose-950/80 text-rose-300 border-rose-600/40";
    }
    if (status.includes("POLICE")) {
      return "bg-amber-950/80 text-amber-300 border-amber-600/40";
    }
    if (status.includes("APPOINTMENT") || status.includes("BOOKED")) {
      return "bg-indigo-950/80 text-indigo-300 border-indigo-600/40";
    }
    return "bg-slate-800 text-slate-300 border-slate-700";
  }

  return (
    <AdminShell
      pageTitle="Application Management & Workflow Pipeline"
      pageSubtitle="Comprehensive administrative tracking of all citizen passport applications across Indian RPO jurisdictions."
    >
      <div className="space-y-5">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Passport Applications</h2>
            <p className="text-xs text-slate-400">
              Total {totalCount} registered applications across all workflow lifecycle states.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchApplications}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <a
              href="/api/admin/export?type=applications"
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
              placeholder="Search by ARN (e.g. APP-..., PAS-...), applicant name, or city..."
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
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPOINTMENT_BOOKED">Appointment Booked</option>
              <option value="DOCUMENT_VERIFICATION">Document Verification</option>
              <option value="POLICE_VERIFICATION_PENDING">Police Verification</option>
              <option value="APPROVED">Approved</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Services</option>
              <option value="FRESH">Fresh Passport</option>
              <option value="REISSUE">Re-issue</option>
              <option value="PCC">Police Clearance Certificate</option>
            </select>

            <select
              value={quotaFilter}
              onChange={(e) => {
                setQuotaFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Quotas</option>
              <option value="NORMAL">Normal</option>
              <option value="TATKAAL">Tatkaal</option>
            </select>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">ARN & Applicant</th>
                  <th className="px-4 py-3">Service & Scheme</th>
                  <th className="px-4 py-3">Current Status</th>
                  <th className="px-4 py-3">Regional Office / PSK</th>
                  <th className="px-4 py-3">Submission Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      Loading passport applications...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      No applications found matching the selected parameters.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-900/50 transition">
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-white text-sm block">
                            {app.applicationId}
                          </span>
                          <span className="text-slate-300 font-medium block">
                            {app.applicant?.name || `${app.givenName || ''} ${app.surname || ''}`.trim() || "Applicant"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <span className="text-white font-semibold block">{app.serviceType}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase bg-slate-900 text-slate-400 border border-slate-800">
                            {app.applicationCategory} • {app.bookletType || "36 Pages"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusClass(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-slate-300 block">{app.rpoLocation}</span>
                        {app.appointment && (
                          <span className="text-[10px] text-indigo-400 font-mono block">
                            Appt: {new Date(app.appointment.date).toLocaleDateString("en-IN")}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">
                        {app.submissionDate
                          ? new Date(app.submissionDate).toLocaleDateString("en-IN")
                          : "Draft"}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-2">
                        <Link
                          href={`/admin/applications/${app.applicationId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                        >
                          <span>Manage</span>
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
