"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import AcademicDisclaimer from "@/components/AcademicDisclaimer";
import Link from "next/link";
import { 
  HelpCircle, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  RefreshCw,
  PlusCircle,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

export default function GrievancePage() {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"MY_TICKETS" | "NEW_TICKET">("MY_TICKETS");

  // Form states
  const [category, setCategory] = useState("DELAYED_PROCESSING");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadGrievances() {
    try {
      const res = await fetch("/api/grievance");
      if (res.ok) {
        const data = await res.json();
        setGrievances(data.grievances || []);
      }
    } catch (e) {
      console.error("Failed to load grievances:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGrievances();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject || !description) return;
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/grievance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, subject, description, attachmentUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit grievance");
        return;
      }

      setMessage(`Grievance lodged successfully! Tracking Ticket ID: ${data.grievance.ticketId}`);
      setSubject("");
      setDescription("");
      setAttachmentUrl("");
      setActiveTab("MY_TICKETS");
      loadGrievances();
    } catch (e) {
      console.error("Grievance error:", e);
      setError("Failed to connect to grievance server.");
    } finally {
      setSubmitting(false);
    }
  }

  const categoryLabels: Record<string, string> = {
    DELAYED_PROCESSING: "Delayed Application Processing",
    APPOINTMENT_ISSUE: "Appointment Scheduling / Rescheduling Difficulty",
    POLICE_VERIFICATION: "Police Verification Delay / Adverse Report Dispute",
    DOCUMENT_ISSUE: "Document Scrutiny Clarification / Rejection Inquiry",
    PAYMENT_DISPUTE: "Payment Transaction Failure / Refund",
    OTHER: "General Inquiries & Feedback",
  };

  const statusBadges: Record<string, { label: string; class: string }> = {
    OPEN: { label: "Under Review", class: "bg-blue-100 text-blue-900 border-blue-200" },
    IN_REVIEW: { label: "Assigned to RPO Officer", class: "bg-amber-100 text-amber-900 border-amber-200" },
    RESPONDED: { label: "Officer Responded", class: "bg-purple-100 text-purple-900 border-purple-200" },
    RESOLVED: { label: "Resolved", class: "bg-emerald-100 text-emerald-900 border-emerald-200" },
    CLOSED: { label: "Closed", class: "bg-slate-100 text-slate-700 border-slate-200" },
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <AcademicDisclaimer />
      <Navbar role="APPLICANT" userName="Citizen Portal" />

      {/* Header */}
      <div className="bg-[#002B49] text-white py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-800/80 text-blue-200 text-xs font-semibold mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            Citizen Grievance Redressal & Support
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Feedback & Grievance Redressal Portal
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-blue-200 max-w-2xl">
            Lodge grievances regarding passport processing delays, appointment issues, or document scrutiny clarifications. All tickets are tracked with auditable resolution timelines.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {/* Messages */}
        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex-1 font-semibold">{message}</div>
            <button onClick={() => setMessage("")} className="text-emerald-500 hover:text-emerald-800">
              &times;
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="flex-1 font-semibold">{error}</div>
            <button onClick={() => setError("")} className="text-rose-500 hover:text-rose-800">
              &times;
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("MY_TICKETS")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "MY_TICKETS"
                ? "bg-blue-950 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>My Grievance Tickets ({grievances.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("NEW_TICKET")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "NEW_TICKET"
                ? "bg-blue-950 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Lodge New Grievance</span>
          </button>
        </div>

        {/* TAB 1: MY TICKETS LIST */}
        {activeTab === "MY_TICKETS" && (
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-900 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">Loading grievance records...</p>
              </div>
            ) : grievances.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-700 text-sm">No Grievances Lodged Yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  If you are experiencing issues with your passport appointment, document scrutiny, or police enquiry, click below to open a support ticket.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("NEW_TICKET")}
                  className="mt-4 px-4 py-2 rounded-lg bg-blue-950 text-white text-xs font-bold hover:bg-blue-900 transition"
                >
                  Lodge a Grievance
                </button>
              </div>
            ) : (
              grievances.map((g) => {
                const badge = statusBadges[g.status] || {
                  label: g.status,
                  class: "bg-slate-100 text-slate-700",
                };

                return (
                  <div
                    key={g.id}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-blue-950">{g.ticketId}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${badge.class}`}>
                            {badge.label}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{g.subject}</h4>
                      </div>

                      <div className="text-left sm:text-right text-[11px] text-slate-400 font-mono">
                        Lodged: {new Date(g.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Category: {categoryLabels[g.category] || g.category}
                      </span>
                      <p>{g.description}</p>
                    </div>

                    {/* Official Response if present */}
                    {g.response ? (
                      <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-purple-950">
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-purple-700" />
                            Official Passport Officer Response ({g.respondedBy || "RPO Grievance Cell"}):
                          </span>
                          <span className="text-[10px] font-mono font-normal text-purple-800">
                            {new Date(g.respondedAt).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                        <p className="text-slate-800 text-[11px] leading-relaxed pt-1">
                          {g.response}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 italic">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Assigned to Regional Passport Officer. Expected turnaround within 48 business hours.</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: NEW TICKET FORM */}
        {activeTab === "NEW_TICKET" && (
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-3 border-b border-slate-100 mb-6">
              Lodge Formal Grievance with Regional Passport Office
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. Grievance Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-900"
                >
                  <option value="DELAYED_PROCESSING">Delayed Application Processing beyond SLA</option>
                  <option value="APPOINTMENT_ISSUE">Appointment Scheduling / Rescheduling Difficulty</option>
                  <option value="POLICE_VERIFICATION">Police Verification Delay / Clarification Dispute</option>
                  <option value="DOCUMENT_ISSUE">Document Scrutiny Clarification / Rejection Inquiry</option>
                  <option value="PAYMENT_DISPUTE">Payment Transaction Failure / Deduction without Receipt</option>
                  <option value="OTHER">General Inquiries & Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. Subject / Brief Summary
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Police verification pending for over 14 days at Saligramam PS"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Detailed Description of Grievance
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Please state dates, ARN reference number, and specific details of your grievance..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-900"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  4. Supporting Document Reference / Link (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Appointment Slip Ref or Bank UTR number"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab("MY_TICKETS")}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-blue-950 text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition flex items-center gap-1.5 shadow"
                >
                  {submitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Grievance Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
