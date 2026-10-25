"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  FileText, 
  User, 
  ShieldCheck, 
  Building2, 
  Truck, 
  Printer, 
  ChevronRight, 
  Send,
  Eye,
  Filter,
  CheckSquare,
  Square
} from "lucide-react";
import { getStatusMeta } from "@/lib/fsm";

interface OfficerDashboardClientProps {
  initialOfficer: any;
}

export default function OfficerDashboardClient({ initialOfficer }: OfficerDashboardClientProps) {
  const router = useRouter();
  const [officer, setOfficer] = useState<any>(initialOfficer);
  const [applications, setApplications] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    total: 0,
    pendingScrutiny: 0,
    inPolice: 0,
    policeCleared: 0,
    approved: 0,
    dispatched: 0,
    clarification: 0,
  });

  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterQuota, setFilterQuota] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Loading & notification states
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Modal dialog states for actions that require reasons
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [clarificationReason, setClarificationReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Scrutiny 6-point checklist
  const [checklist, setChecklist] = useState({
    identityVerified: false,
    dobVerified: false,
    addressVerified: false,
    familyContactVerified: false,
    declarationsVerified: false,
    policeCleared: false,
  });

  async function fetchApplications() {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filterStatus !== "ALL") query.append("status", filterStatus);
      if (filterQuota !== "ALL") query.append("quota", filterQuota);
      if (search.trim()) query.append("q", search.trim());
      query.append("page", page.toString());

      const res = await fetch(`/api/officer/applications?${query.toString()}`);
      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.officer) setOfficer(data.officer);
      setApplications(data.applications || []);
      if (data.metrics) setMetrics(data.metrics);
      setTotalPages(data.totalPages || 1);

      // Keep selected app synchronized
      if (selectedApp) {
        const found = (data.applications || []).find((a: any) => a.id === selectedApp.id);
        if (found) {
          setSelectedApp(found);
        }
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplications();
  }, [filterStatus, filterQuota, page]);

  function handleSelectApplication(app: any) {
    setSelectedApp(app);
    // Parse existing checklist if available
    if (app.officerChecklist) {
      try {
        setChecklist(JSON.parse(app.officerChecklist));
      } catch (e) {
        // default checklist
      }
    } else {
      // Auto-check basic points based on state
      const hasPoliceClear = app.policeReports?.some((r: any) => r.clearanceStatus === "CLEARED");
      setChecklist({
        identityVerified: true,
        dobVerified: true,
        addressVerified: true,
        familyContactVerified: true,
        declarationsVerified: !app.hasCriminalRecord,
        policeCleared: Boolean(hasPoliceClear),
      });
    }
  }

  async function executeAction(action: string, extraData?: { reason?: string; remarks?: string }) {
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
          checklist,
          reason: extraData?.reason,
          remarks: extraData?.remarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Action could not be executed.");
        setActionLoading(false);
        return;
      }

      setMessage(data.message || `Action '${action}' executed successfully!`);
      setShowClarificationModal(false);
      setShowRejectModal(false);
      setClarificationReason("");
      setRejectionReason("");
      await fetchApplications();
    } catch (err) {
      console.error("Scrutiny action error:", err);
      setError("Failed to execute scrutiny action. Please verify network connection.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans">
      <Navbar
        role="OFFICER"
        userName={officer?.officerId ? `Officer (${officer.officerId})` : "Passport Officer"}
        badgeLabel={officer ? officer.branchLocation : "Regional Office"}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* Top Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                Official RPO Scrutiny Console
              </span>
              <span className="text-xs text-slate-500">
                Jurisdiction: {officer?.branchLocation || "Central Division - RPO Chennai"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Passport Officer Adjudication Console
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged in as Officer ID: <span className="font-mono font-bold text-blue-950">{officer?.officerId || "OFF-CENTRAL"}</span> • Delegated Authority under Passports Act, 1967
            </p>
          </div>

          <button
            onClick={fetchApplications}
            disabled={loading}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Queue
          </button>
        </div>

        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Records</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{metrics.total}</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-blue-800 block">Pending Scrutiny</span>
            <span className="text-2xl font-extrabold text-blue-950 mt-1 block">{metrics.pendingScrutiny}</span>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-purple-800 block">In Police Enquiry</span>
            <span className="text-2xl font-extrabold text-purple-950 mt-1 block">{metrics.inPolice}</span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Police Cleared</span>
            <span className="text-2xl font-extrabold text-emerald-950 mt-1 block">{metrics.policeCleared}</span>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">Clarification</span>
            <span className="text-2xl font-extrabold text-amber-950 mt-1 block">{metrics.clarification}</span>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-teal-800 block">Approved/Dispatched</span>
            <span className="text-2xl font-extrabold text-teal-950 mt-1 block">{metrics.dispatched}</span>
          </div>
        </div>

        {/* Feedback Messages */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Filters & Search Row */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            {[
              { key: "ALL", label: "All" },
              { key: "SUBMITTED", label: "Submitted" },
              { key: "APPOINTMENT_BOOKED", label: "Appointment Booked" },
              { key: "POLICE_VERIFICATION_PENDING", label: "Police Enquiry" },
              { key: "POLICE_VERIFICATION_COMPLETED", label: "Police Cleared" },
              { key: "CLARIFICATION_REQUIRED", label: "Clarification" },
              { key: "APPROVED", label: "Approved" },
              { key: "DISPATCHED", label: "Dispatched" },
              { key: "REJECTED", label: "Rejected" },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => { setFilterStatus(f.key); setPage(1); }}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  filterStatus === f.key
                    ? "bg-blue-950 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") fetchApplications(); }}
                placeholder="Search ARN / Name..."
                className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900 w-48 sm:w-60"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <button
              onClick={fetchApplications}
              className="px-3 py-1.5 bg-blue-950 text-white rounded-lg text-xs font-semibold hover:bg-blue-900"
            >
              Search
            </button>
          </div>
        </div>

        {/* Main Split: Left Applications Table (7 cols) + Right Scrutiny Drawer (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Applications Table */}
          <div className={`${selectedApp ? "lg:col-span-7" : "lg:col-span-12"} transition-all`}>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Application Scrutiny Queue ({applications.length})
                </span>
                <span className="text-[11px] text-slate-500">Page {page} of {totalPages}</span>
              </div>

              {applications.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  No passport applications found matching the selected filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                      <tr>
                        <th className="p-3">ARN / Date</th>
                        <th className="p-3">Applicant Name</th>
                        <th className="p-3">Quota</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Police Report</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {applications.map((app) => {
                        const meta = getStatusMeta(app.status as any);
                        const isSelected = selectedApp?.id === app.id;
                        const policeClear = app.policeReports?.[0]?.clearanceStatus;

                        return (
                          <tr
                            key={app.id}
                            onClick={() => handleSelectApplication(app)}
                            className={`cursor-pointer transition ${
                              isSelected ? "bg-blue-50/80 font-medium" : "hover:bg-slate-50"
                            }`}
                          >
                            <td className="p-3">
                              <span className="font-mono font-bold text-blue-950 block">{app.applicationId}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(app.submissionDate || app.createdAt).toLocaleDateString("en-IN")}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-slate-900 block">
                                {app.givenName ? `${app.givenName} ${app.surname || ""}` : app.applicant?.name}
                              </span>
                              <span className="text-[10px] text-slate-500">{app.presentCity || "Chennai"}, {app.presentState || "Tamil Nadu"}</span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                app.applicationCategory === "TATKAAL"
                                  ? "bg-amber-100 text-amber-900"
                                  : "bg-slate-100 text-slate-700"
                              }`}>
                                {app.applicationCategory || "NORMAL"}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                app.status === "APPROVED" || app.status.includes("DISPATCH")
                                  ? "bg-emerald-100 text-emerald-900"
                                  : app.status === "REJECTED"
                                  ? "bg-rose-100 text-rose-900"
                                  : app.status === "CLARIFICATION_REQUIRED"
                                  ? "bg-amber-100 text-amber-900"
                                  : "bg-blue-100 text-blue-900"
                              }`}>
                                {meta.label}
                              </span>
                            </td>
                            <td className="p-3">
                              {policeClear === "CLEARED" ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  ✓ Cleared
                                </span>
                              ) : policeClear === "ADVERSE" ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                  ✗ Adverse
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Pending</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleSelectApplication(app); }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-950 text-white rounded text-[11px] font-semibold hover:bg-blue-900"
                              >
                                Review <ChevronRight className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-slate-600">Page {page} of {totalPages}</span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Scrutiny Drawer */}
          {selectedApp && (
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border-2 border-blue-900/30 rounded-xl shadow-md p-5 relative">
                {/* Drawer Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                      Active Scrutiny Dossier
                    </span>
                    <h2 className="text-base font-bold text-slate-900">
                      {selectedApp.givenName ? `${selectedApp.givenName} ${selectedApp.surname || ""}` : selectedApp.applicant?.name}
                    </h2>
                    <span className="font-mono text-xs font-bold text-blue-950 block mt-0.5">
                      ARN: {selectedApp.applicationId}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1 rounded"
                  >
                    ✕ Close
                  </button>
                </div>

                {/* Status Bar */}
                <div className="my-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Current Lifecycle State</span>
                    <span className="font-bold text-blue-950 text-xs">{selectedApp.status}</span>
                  </div>
                  <span className="text-[11px] text-slate-600 font-medium">
                    {selectedApp.applicationCategory} • {selectedApp.bookletType === "60_PAGES" ? "60 Pgs" : "36 Pgs"}
                  </span>
                </div>

                {/* Particulars Tabs / Content */}
                <div className="space-y-4 text-xs max-h-[460px] overflow-y-auto pr-1">
                  {/* Personal & Identity */}
                  <div className="border border-slate-200 rounded-lg p-3 bg-white">
                    <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5 text-blue-950">
                      <User className="w-3.5 h-3.5" /> 1. Personal & Identity Particulars
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div><span className="text-slate-500">Gender:</span> <strong>{selectedApp.gender || "Not specified"}</strong></div>
                      <div>
                        <span className="text-slate-500">DOB:</span>{" "}
                        <strong>{selectedApp.dob ? new Date(selectedApp.dob).toLocaleDateString("en-IN") : "N/A"}</strong>
                      </div>
                      <div><span className="text-slate-500">Place of Birth:</span> <strong>{selectedApp.placeOfBirth || "N/A"}</strong></div>
                      <div><span className="text-slate-500">Citizenship:</span> <strong>{selectedApp.citizenship || "By Birth"}</strong></div>
                      <div><span className="text-slate-500">PAN Card:</span> <strong className="font-mono">{selectedApp.pan || "N/A"}</strong></div>
                      <div><span className="text-slate-500">Aadhaar (UIDAI):</span> <strong className="font-mono">{selectedApp.aadhaarNumber ? `•••• •••• ${selectedApp.aadhaarNumber.slice(-4)}` : "Verified"}</strong></div>
                    </div>
                  </div>

                  {/* Family Particulars */}
                  <div className="border border-slate-200 rounded-lg p-3 bg-white">
                    <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5 text-blue-950">
                      <User className="w-3.5 h-3.5" /> 2. Family & Emergency Contacts
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div><span className="text-slate-500">Father:</span> <strong>{selectedApp.fatherName || "N/A"}</strong></div>
                      <div><span className="text-slate-500">Mother:</span> <strong>{selectedApp.motherName || "N/A"}</strong></div>
                      <div><span className="text-slate-500">Spouse:</span> <strong>{selectedApp.spouseName || "N/A"}</strong></div>
                      <div><span className="text-slate-500">Emergency Mobile:</span> <strong className="font-mono">{selectedApp.emergencyMobile || selectedApp.applicant?.phone}</strong></div>
                    </div>
                  </div>

                  {/* Address & Police Jurisdiction */}
                  <div className="border border-slate-200 rounded-lg p-3 bg-white">
                    <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5 text-blue-950">
                      <Building2 className="w-3.5 h-3.5" /> 3. Residential Address & Jurisdiction
                    </h3>
                    <p className="text-[11px] text-slate-800">
                      {selectedApp.presentAddressLine1 || selectedApp.applicant?.address || "Address on record"}, {selectedApp.presentCity || "Chennai"}, {selectedApp.presentState || "Tamil Nadu"} - <strong className="font-mono">{selectedApp.presentPinCode || "600001"}</strong>
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Local Police Station: <strong>{selectedApp.policeStation || "Central Division Police Station"}</strong>
                    </p>
                  </div>

                  {/* Uploaded Supporting Documents */}
                  <div className="border border-slate-200 rounded-lg p-3 bg-white">
                    <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5 text-blue-950">
                      <FileText className="w-3.5 h-3.5" /> 4. Uploaded Supporting Documents ({selectedApp.documents?.length || 0})
                    </h3>
                    {(!selectedApp.documents || selectedApp.documents.length === 0) ? (
                      <p className="text-[11px] text-slate-400">No documents attached.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {selectedApp.documents.map((d: any) => (
                          <div key={d.id} className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                            <div>
                              <span className="font-semibold text-slate-800 block">{d.documentType}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{d.fileName || "scan.pdf"}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              d.fileStatus === "VERIFIED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {d.fileStatus || "UPLOADED"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Police Enquiry Report */}
                  <div className="border border-slate-200 rounded-lg p-3 bg-white">
                    <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5 text-blue-950">
                      <ShieldCheck className="w-3.5 h-3.5" /> 5. Police Enquiry Report
                    </h3>
                    {(!selectedApp.policeReports || selectedApp.policeReports.length === 0) ? (
                      <p className="text-[11px] text-slate-500">
                        Police background enquiry has not been submitted yet for this application.
                      </p>
                    ) : (
                      <div className="space-y-2 text-[11px]">
                        {selectedApp.policeReports.map((pr: any) => (
                          <div key={pr.id} className="p-2.5 rounded bg-slate-50 border border-slate-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono text-[10px] text-slate-500">{pr.reportId}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                pr.clearanceStatus === "CLEARED" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                              }`}>
                                {pr.clearanceStatus}
                              </span>
                            </div>
                            <p className="text-slate-700 italic">"{pr.remarks || "No remarks noted."}"</p>
                            {pr.adverseReason && (
                              <p className="text-rose-700 font-bold mt-1">Adverse Reason: {pr.adverseReason}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Declarations Check */}
                  <div className="border border-slate-200 rounded-lg p-3 bg-white">
                    <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5 text-blue-950">
                      <ShieldCheck className="w-3.5 h-3.5" /> 6. Statutory Declarations
                    </h3>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span>Criminal Proceedings Declaration:</span>
                        <strong className={selectedApp.hasCriminalRecord ? "text-rose-600" : "text-emerald-700"}>
                          {selectedApp.hasCriminalRecord ? "YES (Flagged)" : "CLEAN (None)"}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Lost/Damaged Passport History:</span>
                        <strong>{selectedApp.hasLostPassport ? "YES" : "None"}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Clarification status if active */}
                  {selectedApp.clarificationReason && (
                    <div className="border border-amber-300 rounded-lg p-3 bg-amber-50 text-[11px]">
                      <span className="font-bold text-amber-900 block mb-1">Previous Clarification Query:</span>
                      <p className="text-amber-800">{selectedApp.clarificationReason}</p>
                      {selectedApp.clarificationResponse ? (
                        <div className="mt-2 p-2 bg-white rounded border border-amber-200 text-slate-800">
                          <span className="font-bold text-slate-900 block text-[10px] uppercase">Applicant's Response:</span>
                          <p>{selectedApp.clarificationResponse}</p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-amber-700 italic mt-1">Awaiting citizen written reply...</p>
                      )}
                    </div>
                  )}

                  {/* 6-Point Scrutiny Checklist */}
                  <div className="border-2 border-slate-300 rounded-lg p-3 bg-slate-50">
                    <h3 className="font-bold text-slate-900 text-xs mb-2">
                      Statutory 6-Point Verification Checklist
                    </h3>
                    <div className="space-y-1.5 text-[11px]">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.identityVerified}
                          onChange={(e) => setChecklist({ ...checklist, identityVerified: e.target.checked })}
                          className="rounded text-blue-950 focus:ring-blue-900"
                        />
                        <span>1. Identity Particulars match UIDAI / Photo ID</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.dobVerified}
                          onChange={(e) => setChecklist({ ...checklist, dobVerified: e.target.checked })}
                          className="rounded text-blue-950 focus:ring-blue-900"
                        />
                        <span>2. Date of Birth verified against Municipal / School records</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.addressVerified}
                          onChange={(e) => setChecklist({ ...checklist, addressVerified: e.target.checked })}
                          className="rounded text-blue-950 focus:ring-blue-900"
                        />
                        <span>3. Residential Address verified within RPO jurisdiction</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.familyContactVerified}
                          onChange={(e) => setChecklist({ ...checklist, familyContactVerified: e.target.checked })}
                          className="rounded text-blue-950 focus:ring-blue-900"
                        />
                        <span>4. Family credentials & Emergency contacts authenticated</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.declarationsVerified}
                          onChange={(e) => setChecklist({ ...checklist, declarationsVerified: e.target.checked })}
                          className="rounded text-blue-950 focus:ring-blue-900"
                        />
                        <span>5. Clean statutory declarations under Section 6 of Passports Act</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.policeCleared}
                          onChange={(e) => setChecklist({ ...checklist, policeCleared: e.target.checked })}
                          className="rounded text-blue-950 focus:ring-blue-900"
                        />
                        <span>6. Police Enquiry Report verified & clean clearance confirmed</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Scrutiny Decision Action Controls */}
                <div className="pt-4 mt-4 border-t border-slate-200 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Officer Adjudication Controls
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => executeAction("VERIFY_DOCS")}
                      className="py-2 px-3 bg-white border border-slate-300 text-slate-800 rounded text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 shadow-xs"
                    >
                      ✓ Verify Documents
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => executeAction("INITIATE_POLICE")}
                      className="py-2 px-3 bg-purple-50 border border-purple-300 text-purple-900 rounded text-xs font-semibold hover:bg-purple-100 disabled:opacity-50 shadow-xs"
                    >
                      🛡 Initiate Police
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => setShowClarificationModal(true)}
                      className="py-2 px-3 bg-amber-50 border border-amber-300 text-amber-900 rounded text-xs font-semibold hover:bg-amber-100 disabled:opacity-50 shadow-xs"
                    >
                      ⚠ Clarification
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => setShowRejectModal(true)}
                      className="py-2 px-3 bg-rose-50 border border-rose-300 text-rose-800 rounded text-xs font-semibold hover:bg-rose-100 disabled:opacity-50 shadow-xs"
                    >
                      ✗ Reject File
                    </button>
                  </div>

                  <div className="pt-1 space-y-2">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => executeAction("APPROVE")}
                      className="w-full py-2.5 px-3 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Grant Statutory Passport Approval
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => executeAction("ISSUE_PASSPORT")}
                        className="py-2 px-3 bg-blue-900 text-white rounded text-xs font-semibold hover:bg-blue-950 disabled:opacity-50 flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Booklet
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => executeAction("DISPATCH_PASSPORT")}
                        className="py-2 px-3 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-950 disabled:opacity-50 flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Dispatch Speed Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Clarification Request */}
        {showClarificationModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-300">
              <h3 className="font-bold text-slate-900 text-base mb-1">Request Clarification from Applicant</h3>
              <p className="text-xs text-slate-500 mb-4">
                Enter the specific discrepancy or query. The applicant will be notified on their dashboard to provide an explanation.
              </p>

              <textarea
                rows={4}
                value={clarificationReason}
                onChange={(e) => setClarificationReason(e.target.value)}
                placeholder="Specify the discrepancy in address proof, DOB record, or name mismatch..."
                className="w-full p-3 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
              ></textarea>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowClarificationModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!clarificationReason.trim() || actionLoading}
                  onClick={() => executeAction("REQUEST_CLARIFICATION", { reason: clarificationReason })}
                  className="px-4 py-2 bg-amber-700 text-white rounded-md text-xs font-bold hover:bg-amber-800 disabled:opacity-50 shadow-xs"
                >
                  Transmit Notice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Rejection Reason */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-rose-300">
              <h3 className="font-bold text-rose-900 text-base mb-1">Reject Passport Application</h3>
              <p className="text-xs text-slate-500 mb-4">
                Under Section 5(2) and Section 6 of the Passports Act, 1967, a formal statutory reason is mandatory when refusing passport issuance.
              </p>

              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for refusal (e.g. Adverse Police Report of ongoing trial, false declaration of identity)..."
                className="w-full p-3 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
              ></textarea>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!rejectionReason.trim() || actionLoading}
                  onClick={() => executeAction("REJECT", { reason: rejectionReason })}
                  className="px-4 py-2 bg-rose-700 text-white rounded-md text-xs font-bold hover:bg-rose-800 disabled:opacity-50 shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
