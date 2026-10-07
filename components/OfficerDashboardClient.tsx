"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

interface OfficerDashboardClientProps {
  initialOfficer: any;
}

export default function OfficerDashboardClient({ initialOfficer }: OfficerDashboardClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [officer, setOfficer] = useState<any>(initialOfficer);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function fetchApplications() {
    try {
      const query = new URLSearchParams();
      if (filterStatus !== "ALL") query.append("status", filterStatus);
      if (search) query.append("q", search);

      const res = await fetch(`/api/officer/applications?${query.toString()}`);
      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.officer) setOfficer(data.officer);
      setApplications(data.applications || []);
      if (selectedApp) {
        const updated = (data.applications || []).find((a: any) => a.id === selectedApp.id);
        if (updated) setSelectedApp(updated);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    }
  }

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  async function handleAction(action: string) {
    if (!selectedApp) return;
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/officer/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApp.applicationId,
          action,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Action failed");
        setActionLoading(false);
        return;
      }

      setMessage(`Action '${action}' executed successfully!`);
      await fetchApplications();
    } catch (err) {
      console.error("Action error:", err);
      setError("Failed to connect to server");
    } finally {
      setActionLoading(false);
    }
  }

  // Calculate metrics
  const totalCount = applications.length;
  const pendingOfficer = applications.filter(
    (a) => a.status === "SUBMITTED" || a.status === "APPOINTMENT_SCHEDULED"
  ).length;
  const inPolice = applications.filter(
    (a) => a.status === "POLICE_VERIFICATION_PENDING"
  ).length;
  const readyApproval = applications.filter((a) => a.status === "POLICE_CLEARED").length;
  const issuedDispatched = applications.filter(
    (a) => a.status === "PASSPORT_ISSUED" || a.status === "PASSPORT_DISPATCHED"
  ).length;

  const statusColorMap: Record<string, string> = {
    DRAFT: "bg-slate-800 text-slate-400 border-slate-700",
    SUBMITTED: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    APPOINTMENT_SCHEDULED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    UNDER_OFFICER_VERIFICATION: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    POLICE_VERIFICATION_PENDING: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    POLICE_CLEARED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    REJECTED: "bg-red-500/10 text-red-400 border-red-500/30",
    PASSPORT_ISSUED: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    PASSPORT_DISPATCHED: "bg-emerald-400/20 text-emerald-300 border-emerald-400/40",
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-16">
      <Navbar
        role="OFFICER"
        userName="Passport Officer"
        badgeLabel={officer ? officer.branchLocation : "Regional Office"}
      />

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Authority Operations • Verification & Issuance Console
            </p>
            <h2 className="mt-1 text-3xl font-bold">
              Passport Officer Dashboard
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Officer ID: {officer?.officerId || "OFF-CENTRAL"} • Branch: {officer?.branchLocation || "Central Division"}
            </p>
          </div>

          <button
            onClick={fetchApplications}
            className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
          >
            ↻ Refresh Applications
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Total in System</p>
            <p className="text-2xl font-bold text-white mt-1">{totalCount}</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-[11px] font-semibold text-blue-400 uppercase">Needs Verification</p>
            <p className="text-2xl font-bold text-blue-300 mt-1">{pendingOfficer}</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-[11px] font-semibold text-purple-400 uppercase">In Police Enquiry</p>
            <p className="text-2xl font-bold text-purple-300 mt-1">{inPolice}</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-[11px] font-semibold text-emerald-400 uppercase">Ready for Approval</p>
            <p className="text-2xl font-bold text-emerald-300 mt-1">{readyApproval}</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-[11px] font-semibold text-teal-400 uppercase">Issued & Dispatched</p>
            <p className="text-2xl font-bold text-teal-300 mt-1">{issuedDispatched}</p>
          </div>
        </div>

        {/* Notifications */}
        {message && (
          <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-sm text-emerald-300">
            ✓ {message}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-300">
            ✗ {error}
          </div>
        )}

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              "ALL",
              "SUBMITTED",
              "APPOINTMENT_SCHEDULED",
              "UNDER_OFFICER_VERIFICATION",
              "POLICE_VERIFICATION_PENDING",
              "POLICE_CLEARED",
              "APPROVED",
              "PASSPORT_ISSUED",
              "PASSPORT_DISPATCHED",
            ].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filterStatus === st
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                {st.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search by ID or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchApplications()}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-amber-500"
            />
            <button
              onClick={fetchApplications}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              Search
            </button>
          </div>
        </div>

        {/* Main Content Grid: Applications List & Selected Application Details */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Applications Table (Left 7 Cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Passport Applications ({applications.length})
              </h3>
              <span className="text-[11px] text-slate-400">
                Click an application to inspect & process
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-sm">No applications found in this status filter.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 max-h-[600px] overflow-y-auto">
                {applications.map((app) => {
                  const isSelected = selectedApp?.id === app.id;
                  const badge = statusColorMap[app.status] || "bg-slate-800 text-slate-400";

                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className={`p-4 cursor-pointer transition flex items-center justify-between hover:bg-slate-800/60 ${
                        isSelected ? "bg-amber-500/10 border-l-4 border-amber-500" : ""
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">
                            {app.applicationId}
                          </span>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge}`}>
                            {app.status.replace(/_/g, " ")}
                          </span>
                        </div>

                        <p className="text-xs font-medium text-slate-200">
                          {app.applicant?.name} • {app.passportType}
                        </p>

                        <p className="text-[11px] text-slate-500">
                          Docs: {app.documents?.length || 0} • Appt: {app.appointment ? "Scheduled" : "None"} • Reports: {app.policeReports?.length || 0}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-amber-400 font-semibold">
                          View Details →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Application Details & Action Panel (Right 5 Cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            {!selectedApp ? (
              <div className="py-24 text-center text-slate-500">
                <p className="text-4xl mb-3">🔍</p>
                <h4 className="text-base font-semibold text-slate-400">
                  Select an Application
                </h4>
                <p className="text-xs mt-1 max-w-xs mx-auto">
                  Select any passport application from the list to inspect applicant documents, initiate police clearance, approve, or issue passport.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header info */}
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-amber-400">
                      {selectedApp.applicationId}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                        statusColorMap[selectedApp.status] || "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {selectedApp.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-2">
                    {selectedApp.applicant?.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    DOB: {new Date(selectedApp.applicant?.dob).toLocaleDateString()} • {selectedApp.passportType}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Address: {selectedApp.applicant?.address}
                  </p>
                </div>

                {/* Attached Documents section */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                    <span>Uploaded Documents ({selectedApp.documents?.length || 0})</span>
                  </h4>

                  {selectedApp.documents?.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No documents attached yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-36 overflow-y-auto">
                      {selectedApp.documents.map((doc: any) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs"
                        >
                          <div>
                            <span className="font-medium text-white block">
                              {doc.documentType}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {doc.docId}
                            </span>
                          </div>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                              doc.fileStatus === "VERIFIED"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                            }`}
                          >
                            {doc.fileStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Police Reports section */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Police Clearance Report
                  </h4>
                  {selectedApp.policeReports?.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                      {selectedApp.status === "POLICE_VERIFICATION_PENDING"
                        ? "Enquiry is currently pending with local Police station."
                        : "Police enquiry has not been initiated yet."}
                    </p>
                  ) : (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-emerald-400">
                          Clearance: {selectedApp.policeReports[0].clearanceStatus}
                        </span>
                        <span className="font-mono text-slate-400 text-[10px]">
                          {selectedApp.policeReports[0].reportId}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-1">
                        Remarks: {selectedApp.policeReports[0].remarks || "Verification clear."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Passport details (if issued) */}
                {selectedApp.passport && (
                  <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-4">
                    <span className="text-[10px] uppercase font-bold text-teal-400 block">
                      Issued Passport Record
                    </span>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div>
                        <span className="text-slate-400 block">Passport Number</span>
                        <span className="font-mono font-bold text-white">
                          {selectedApp.passport.passportNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Dispatch Status</span>
                        <span className="font-semibold text-emerald-300">
                          {selectedApp.passport.dispatchStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Officer Action Workflow Buttons */}
                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
                    Officer Operations (UML Action Flow)
                  </h4>

                  {/* 1. Verify Documents */}
                  {(selectedApp.status === "SUBMITTED" ||
                    selectedApp.status === "APPOINTMENT_SCHEDULED") && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleAction("VERIFY_DOCS")}
                      className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 transition disabled:opacity-50"
                    >
                      {actionLoading ? "Processing..." : "1. Verify Documents & Authenticity"}
                    </button>
                  )}

                  {/* 2. Forward to Police Enquiry */}
                  {selectedApp.status === "UNDER_OFFICER_VERIFICATION" && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleAction("INITIATE_POLICE")}
                      className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-purple-700 transition disabled:opacity-50"
                    >
                      {actionLoading ? "Processing..." : "2. Forward for Police Enquiry"}
                    </button>
                  )}

                  {/* 3. Approve Application */}
                  {selectedApp.status === "POLICE_CLEARED" && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleAction("APPROVE")}
                        className="rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                      >
                        3. Approve Application
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleAction("REJECT")}
                        className="rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {/* 4. Issue Passport Booklet */}
                  {selectedApp.status === "APPROVED" && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleAction("ISSUE_PASSPORT")}
                      className="w-full rounded-lg bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 transition disabled:opacity-50"
                    >
                      {actionLoading ? "Generating Passport..." : "4. Issue Passport Booklet (Print)"}
                    </button>
                  )}

                  {/* 5. Dispatch Passport */}
                  {selectedApp.status === "PASSPORT_ISSUED" && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleAction("DISPATCH_PASSPORT")}
                      className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      {actionLoading ? "Dispatching..." : "5. Dispatch via Speed Post"}
                    </button>
                  )}

                  {selectedApp.status === "PASSPORT_DISPATCHED" && (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 text-center text-xs text-emerald-300">
                      ✓ Passport has been successfully dispatched to applicant address.
                    </div>
                  )}

                  {selectedApp.status === "REJECTED" && (
                    <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-center text-xs text-red-300">
                      ✗ Application has been rejected.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
