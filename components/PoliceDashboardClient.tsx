"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

interface PoliceDashboardClientProps {
  initialPolice: any;
}

export default function PoliceDashboardClient({ initialPolice }: PoliceDashboardClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [police, setPolice] = useState<any>(initialPolice);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [clearanceStatus, setClearanceStatus] = useState("CLEARED");
  const [remarks, setRemarks] = useState(
    "Physical verification conducted at given residential address. Neighbor inquiries clear, no criminal record found."
  );
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function fetchEnquiries() {
    try {
      const res = await fetch("/api/police/enquiries");
      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.police) setPolice(data.police);
      setEnquiries(data.enquiries || []);
      if (selectedEnquiry) {
        const updated = (data.enquiries || []).find((e: any) => e.id === selectedEnquiry.id);
        if (updated) setSelectedEnquiry(updated);
      }
    } catch (err) {
      console.error("Failed to load enquiries:", err);
    }
  }

  useEffect(() => {
    fetchEnquiries();
  }, []);

  async function handleSubmitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEnquiry) return;
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/police/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedEnquiry.applicationId,
          clearanceStatus,
          remarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit police report");
        setSubmitting(false);
        return;
      }

      setMessage("Police Clearance Report submitted successfully!");
      await fetchEnquiries();
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to connect to server");
    } finally {
      setSubmitting(false);
    }
  }

  const pendingCount = enquiries.filter(
    (e) => e.status === "POLICE_VERIFICATION_PENDING"
  ).length;
  const completedCount = enquiries.filter(
    (e) => e.policeReports && e.policeReports.length > 0
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-16">
      <Navbar
        role="POLICE"
        userName="Police Authority"
        badgeLabel={`Station: ${police?.stationCode || "PS-CENTRAL"} • Badge: ${police?.badgeNumber || "POL-90210"}`}
      />

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Law Enforcement Authority • Background Verification Console
            </p>
            <h2 className="mt-1 text-3xl font-bold">
              Police Enquiry Dashboard
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Station Code: {police?.stationCode} • Badge ID: {police?.badgeNumber}
            </p>
          </div>

          <button
            onClick={fetchEnquiries}
            className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
          >
            ↻ Refresh Enquiries
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-[11px] font-semibold text-purple-400 uppercase">
              Pending Physical Enquiries
            </p>
            <p className="text-3xl font-bold text-purple-300 mt-1">{pendingCount}</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-[11px] font-semibold text-emerald-400 uppercase">
              Completed Clearance Reports
            </p>
            <p className="text-3xl font-bold text-emerald-300 mt-1">{completedCount}</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">
              Assigned Jurisdiction
            </p>
            <p className="text-base font-bold text-white mt-1">
              Central Police Station Area
            </p>
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

        {/* Main Grid: Enquiries Queue & Report Submission */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Enquiries Queue (Left 6 Cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Assigned Passport Enquiries ({enquiries.length})
              </h3>
              <span className="text-[11px] text-slate-400">Select to inspect</span>
            </div>

            {enquiries.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <p className="text-3xl mb-2">👮</p>
                <p className="text-sm">No pending enquiries at this time.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 max-h-[500px] overflow-y-auto">
                {enquiries.map((enq) => {
                  const isSelected = selectedEnquiry?.id === enq.id;
                  const isPending = enq.status === "POLICE_VERIFICATION_PENDING";

                  return (
                    <div
                      key={enq.id}
                      onClick={() => setSelectedEnquiry(enq)}
                      className={`p-4 cursor-pointer transition flex items-center justify-between hover:bg-slate-800/60 ${
                        isSelected ? "bg-emerald-500/10 border-l-4 border-emerald-500" : ""
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">
                            {enq.applicationId}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                              isPending
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            }`}
                          >
                            {isPending ? "ENQUIRY PENDING" : "REPORT SUBMITTED"}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-200">
                          {enq.applicant?.name}
                        </p>

                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          📍 {enq.applicant?.address}
                        </p>
                      </div>

                      <span className="text-xs text-emerald-400 font-semibold">
                        Inspect →
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Verification Form (Right 6 Cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            {!selectedEnquiry ? (
              <div className="py-20 text-center text-slate-500">
                <p className="text-4xl mb-3">🔍</p>
                <h4 className="text-base font-semibold text-slate-400">
                  Select an Enquiry
                </h4>
                <p className="text-xs mt-1 max-w-xs mx-auto">
                  Select an application from the queue to verify residence, conduct background checks, and submit the clearance report.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-5">
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      {selectedEnquiry.applicationId}
                    </span>
                    <span className="text-xs text-slate-400">
                      DOB: {new Date(selectedEnquiry.applicant?.dob).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {selectedEnquiry.applicant?.name}
                  </h3>
                  <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs">
                    <span className="text-slate-500 uppercase font-bold block text-[10px]">
                      Verification Address
                    </span>
                    <p className="text-slate-200 mt-0.5">{selectedEnquiry.applicant?.address}</p>
                  </div>
                </div>

                {/* Existing Report Display if already submitted */}
                {selectedEnquiry.policeReports?.length > 0 && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase">
                        Submitted Clearance Report
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {selectedEnquiry.policeReports[0].reportId}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white mt-2">
                      Clearance: {selectedEnquiry.policeReports[0].clearanceStatus}
                    </p>
                    <p className="text-xs text-slate-300 mt-1">
                      {selectedEnquiry.policeReports[0].remarks}
                    </p>
                  </div>
                )}

                {/* Form controls */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Clearance Decision
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setClearanceStatus("CLEARED")}
                      className={`rounded-xl border p-3 text-center text-xs font-bold transition ${
                        clearanceStatus === "CLEARED"
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-500/20"
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                      }`}
                    >
                      ✓ Grant Clearance (CLEARED)
                    </button>
                    <button
                      type="button"
                      onClick={() => setClearanceStatus("ADVERSE")}
                      className={`rounded-xl border p-3 text-center text-xs font-bold transition ${
                        clearanceStatus === "ADVERSE"
                          ? "border-red-500 bg-red-500/20 text-red-300 shadow-md shadow-red-500/20"
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                      }`}
                    >
                      ✗ Adverse Report (ADVERSE)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Enquiry Findings & Official Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500 resize-none"
                    placeholder="Provide details of residential enquiry, neighbor verification, criminal checks..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50 shadow-lg shadow-emerald-600/30"
                >
                  {submitting ? "Submitting Report..." : "Submit Police Clearance Report"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
