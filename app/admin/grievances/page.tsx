"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import {
  HelpCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
  X,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function AdminGrievancesPage() {
  const router = useRouter();
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [openCount, setOpenCount] = useState(0);
  const [inReviewCount, setInReviewCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);

  // Active ticket for resolution modal
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState("RESOLVED");
  const [resolutionNote, setResolutionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (statusFilter !== "ALL") q.append("status", statusFilter);
      if (categoryFilter !== "ALL") q.append("category", categoryFilter);
      if (search.trim()) q.append("search", search.trim());

      const res = await fetch(`/api/admin/grievances?${q.toString()}`);
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load grievances");
      const data = await res.json();
      setGrievances(data.grievances || []);
      setOpenCount(data.openCount || 0);
      setInReviewCount(data.inReviewCount || 0);
      setResolvedCount(data.resolvedCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, search, router]);

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  async function handleResolveSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeTicket) return;
    setSubmitting(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/grievances", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: activeTicket.ticketId,
          status: resolutionStatus,
          response: resolutionNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update grievance ticket");

      setActionMessage("Grievance updated successfully.");
      setTimeout(() => {
        setActiveTicket(null);
        setActionMessage(null);
        fetchGrievances();
      }, 1200);
    } catch (err: any) {
      setActionMessage(err.message || "Failed to resolve ticket");
    } finally {
      setSubmitting(false);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "OPEN":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">OPEN</span>;
      case "IN_REVIEW":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">IN REVIEW</span>;
      case "RESPONDED":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">RESPONDED</span>;
      case "RESOLVED":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">RESOLVED</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  }

  return (
    <AdminShell pageTitle="Citizen Grievances & Support" pageSubtitle="Triage complaints, inquiries, and application appeals">
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Total Tickets</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{grievances.length}</h3>
            </div>
            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-lg">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-rose-600 uppercase">Open / Pending</p>
              <h3 className="text-2xl font-bold text-rose-700 mt-1">{openCount}</h3>
            </div>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-600 uppercase">Under Review</p>
              <h3 className="text-2xl font-bold text-amber-700 mt-1">{inReviewCount}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase">Resolved</p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-1">{resolvedCount}</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Ticket ID, subject, username, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="RESPONDED">Responded</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="ALL">All Categories</option>
              <option value="DELAYED_PROCESSING">Delayed Processing</option>
              <option value="APPOINTMENT_ISSUE">Appointment Issue</option>
              <option value="POLICE_VERIFICATION">Police Verification</option>
              <option value="DOCUMENT_ISSUE">Document Issue</option>
              <option value="OTHER">Other</option>
            </select>
            <button
              onClick={() => fetchGrievances()}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Applicant / User</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted At</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                      Loading grievances registry...
                    </td>
                  </tr>
                ) : grievances.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No grievance tickets found matching current criteria.
                    </td>
                  </tr>
                ) : (
                  grievances.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{g.ticketId}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{g.user?.username || "Citizen"}</div>
                        <div className="text-[11px] text-slate-400">{g.user?.email}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {g.category.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-slate-800 font-medium" title={g.subject}>
                        {g.subject}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(g.status)}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(g.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setActiveTicket(g);
                            setResolutionStatus(g.status === "OPEN" ? "IN_REVIEW" : g.status);
                            setResolutionNote(g.response || "");
                          }}
                          className="px-2.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded text-xs font-semibold transition-colors"
                        >
                          Review & Respond
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review & Respond Modal */}
        {activeTicket && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Resolve Citizen Grievance</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{activeTicket.ticketId}</p>
                </div>
                <button
                  onClick={() => setActiveTicket(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Applicant:</span>
                    <span className="font-semibold text-slate-800">{activeTicket.user?.username} ({activeTicket.user?.email})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category:</span>
                    <span className="font-semibold text-slate-800">{activeTicket.category.replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Status:</span>
                    <span>{getStatusBadge(activeTicket.status)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Subject:</span>
                    <p className="font-semibold text-slate-900 bg-white p-2 rounded border border-slate-200">{activeTicket.subject}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Citizen Statement:</span>
                    <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200 whitespace-pre-wrap">{activeTicket.description}</p>
                  </div>
                </div>

                <form onSubmit={handleResolveSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Update Status</label>
                    <select
                      value={resolutionStatus}
                      onChange={(e) => setResolutionStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="OPEN">OPEN (Needs Attention)</option>
                      <option value="IN_REVIEW">IN REVIEW (Investigating)</option>
                      <option value="RESPONDED">RESPONDED (Awaiting Citizen reply)</option>
                      <option value="RESOLVED">RESOLVED (Action Complete)</option>
                      <option value="CLOSED">CLOSED (Dismissed / Solved)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Official Response / Resolution Directive</label>
                    <textarea
                      rows={4}
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      placeholder="Enter the official administrative response, instructions, or resolution details sent to the citizen..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  {actionMessage && (
                    <div className="p-3 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {actionMessage}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTicket(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {submitting ? "Updating..." : "Save Resolution"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
