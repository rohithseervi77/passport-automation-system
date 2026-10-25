"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import {
  FileText,
  User,
  MapPin,
  Calendar,
  Building2,
  ShieldCheck,
  Clock,
  ArrowLeft,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Truck,
  Eye,
  X,
} from "lucide-react";

export default function AdminApplicationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("APPROVED");
  const [overrideReason, setOverrideReason] = useState("");
  const [submittingOverride, setSubmittingOverride] = useState(false);
  const [message, setMessage] = useState("");

  // Document viewer modal
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  const fetchApplication = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`);
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) {
        setError("Application not found.");
        return;
      }
      const json = await res.json();
      setData(json.application);
      if (json.application) {
        setNewStatus(json.application.status);
      }
    } catch (err) {
      console.error(err);
      setError("Network error loading application particulars.");
    } finally {
      setLoading(false);
    }
  }, [applicationId, router]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  async function handleStatusOverride(e: React.FormEvent) {
    e.preventDefault();
    if (!overrideReason.trim()) {
      alert("A specific administrative reason is mandatory for status override.");
      return;
    }

    setSubmittingOverride(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStatus,
          reason: overrideReason.trim(),
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setError(resData.error || "Override execution failed.");
        setSubmittingOverride(false);
        return;
      }

      setMessage(resData.message);
      setOverrideModalOpen(false);
      setOverrideReason("");
      await fetchApplication();
    } catch {
      setError("Failed to execute administrative status override.");
    } finally {
      setSubmittingOverride(false);
    }
  }

  if (loading) {
    return (
      <AdminShell pageTitle="Application Deep Scrutiny">
        <div className="py-20 text-center text-slate-500 text-xs">
          Loading application record and verification metadata...
        </div>
      </AdminShell>
    );
  }

  if (!data) {
    return (
      <AdminShell pageTitle="Application Not Found">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-white">Application Record Not Found</h3>
          <p className="text-xs text-slate-400">No application matches reference {applicationId}.</p>
          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Application Pipeline</span>
          </Link>
        </div>
      </AdminShell>
    );
  }

  const app = data;
  const applicant = app.applicant;
  const appointment = app.appointment;
  const policeReport = app.policeReports?.[0];
  const passport = app.passport;
  const documents = app.documents || [];
  const history = app.statusHistory || [];

  return (
    <AdminShell
      pageTitle={`Application Scrutiny: ${app.applicationId}`}
      pageSubtitle="Administrative dossier: applicant particulars, physical appointments, police reports, and documents."
    >
      <div className="space-y-6">
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Applications</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOverrideModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Administrative Status Override</span>
            </button>
          </div>
        </div>

        {message && (
          <div className="p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Top Summary Banner */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="font-mono font-extrabold text-xl text-white">
                {app.applicationId}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-bold uppercase bg-blue-900/40 text-blue-300 border border-blue-500/30">
                {app.serviceType}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                {app.applicationCategory}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Applicant: <strong className="text-white">{applicant?.name || `${app.givenName || ''} ${app.surname || ''}`.trim()}</strong> • RPO Jurisdiction: {app.rpoLocation}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                Workflow Status
              </span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold border uppercase bg-slate-900 text-slate-200 border-slate-700 mt-1">
                {app.status}
              </span>
            </div>
          </div>
        </div>

        {/* Three Columns: Applicant Details, Appointment, Police */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Applicant Particulars */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <span>Personal Particulars</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Given Name</span>
                <span className="text-slate-200 font-semibold">{app.givenName || applicant?.name || "N/A"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Surname</span>
                <span className="text-slate-200">{app.surname || "N/A"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">DOB</span>
                  <span className="text-slate-200">
                    {app.dob ? new Date(app.dob).toLocaleDateString("en-IN") : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Gender</span>
                  <span className="text-slate-200">{app.gender || "N/A"}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Present Address</span>
                <span className="text-slate-300 text-[11px] block leading-relaxed">
                  {app.permanentAddress || applicant?.address || "Address on record"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Emergency Mobile</span>
                <span className="text-slate-200 font-mono">{app.emergencyMobile || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Column 2: PSK Appointment */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>PSK Appointment Status</span>
            </h3>

            {appointment ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Appointment ID</span>
                  <span className="font-mono text-indigo-300 font-bold">{appointment.appointmentId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Selected PSK Centre</span>
                  <span className="text-slate-200">{appointment.location}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Date</span>
                    <span className="text-slate-200 font-bold">
                      {new Date(appointment.date).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Slot</span>
                    <span className="text-slate-200">{appointment.timeSlot}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Reschedules Used</span>
                  <span className="text-slate-300">{appointment.rescheduleCount} of 3 allowed</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No physical PSK appointment booked yet.
              </div>
            )}
          </div>

          {/* Column 3: Police Verification */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Police Verification Outcome</span>
            </h3>

            {policeReport ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Report Number</span>
                  <span className="font-mono text-emerald-300 font-bold">{policeReport.reportId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Clearance Status</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${
                      policeReport.clearanceStatus === "CLEARED"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-600/40"
                        : "bg-rose-950 text-rose-300 border-rose-600/40"
                    }`}
                  >
                    {policeReport.clearanceStatus}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Jurisdictional Station</span>
                  <span className="text-slate-200">{policeReport.stationCode}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Enquiry Remarks</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed italic bg-slate-900 p-2 rounded border border-slate-800">
                    "{policeReport.remarks}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                Police verification has not yet submitted a clearance report.
              </div>
            )}
          </div>
        </div>

        {/* Supporting Documents Section */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Supporting Verification Documents ({documents.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Short-Lived Signed URLs (300s TTL)
            </span>
          </div>

          {documents.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No documents attached to this application.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-white block truncate">{doc.documentType}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                        doc.verificationStatus === "VERIFIED"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-700/40"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {doc.verificationStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{doc.fileName}</p>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : "N/A"}
                    </span>
                    {doc.signedUrl && (
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Document</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Lifecycle History Timeline */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Workflow Progression Timeline</span>
          </h3>

          <div className="space-y-3">
            {history.map((h: any, idx: number) => (
              <div
                key={h.id || idx}
                className="flex items-start gap-3 text-xs border-l-2 border-slate-800 pl-4 relative"
              >
                <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white uppercase text-[11px]">{h.toStatus}</span>
                    {h.fromStatus && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        (from {h.fromStatus})
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px]">{h.remarks || "Status updated"}</p>
                  <p className="text-[10px] text-slate-500">
                    By: {h.performedBy || "System Automation"} • Role: {h.role || "SYSTEM"}
                  </p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {new Date(h.changedAt).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Administrative Status Override Modal */}
      {overrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setOverrideModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Administrative Status Override</h3>
              </div>
              <button
                onClick={() => setOverrideModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Administrative status overrides modify the operational pipeline directly. Every override is permanently logged in the central security audit log.
            </p>

            <form onSubmit={handleStatusOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Target Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="PAYMENT_COMPLETED">PAYMENT_COMPLETED</option>
                  <option value="APPOINTMENT_BOOKED">APPOINTMENT_BOOKED</option>
                  <option value="DOCUMENT_VERIFICATION">DOCUMENT_VERIFICATION</option>
                  <option value="POLICE_VERIFICATION_PENDING">POLICE_VERIFICATION_PENDING</option>
                  <option value="POLICE_VERIFICATION_COMPLETED">POLICE_VERIFICATION_COMPLETED</option>
                  <option value="OFFICER_REVIEW">OFFICER_REVIEW</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="PRINTING">PRINTING</option>
                  <option value="DISPATCHED">DISPATCHED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="CLARIFICATION_REQUIRED">CLARIFICATION_REQUIRED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Administrative Reason (Mandatory)
                </label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Detail the statutory or operational reason for this override..."
                  rows={3}
                  required
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOverride}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  {submittingOverride ? "Recording Override..." : "Confirm & Execute Override"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Inspector Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setPreviewDoc(null)}
          />
          <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {previewDoc.documentType}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono truncate">{previewDoc.fileName}</p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto bg-slate-900/50 flex items-center justify-center min-h-[350px]">
              {previewDoc.mimeType?.startsWith("image/") ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewDoc.signedUrl}
                  alt={previewDoc.fileName}
                  className="max-h-[60vh] max-w-full rounded border border-slate-800 object-contain shadow-lg"
                />
              ) : (
                <div className="text-center space-y-4 py-8">
                  <FileText className="w-12 h-12 text-blue-400 mx-auto" />
                  <div>
                    <p className="text-xs font-bold text-white">Encrypted PDF Verification Document</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                      Short-lived cryptographic URL active. You can inspect the document in a secure external viewer.
                    </p>
                  </div>
                  <a
                    href={previewDoc.signedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs"
                  >
                    <span>Open in Secure Document Viewer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
