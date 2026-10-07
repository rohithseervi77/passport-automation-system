"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

interface PoliceDashboardClientProps {
  initialPolice: any;
}

export default function PoliceDashboardClient({ initialPolice }: PoliceDashboardClientProps) {
  const router = useRouter();
  const [police, setPolice] = useState<any>(initialPolice);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [clearanceStatus, setClearanceStatus] = useState("CLEARED");
  const [remarks, setRemarks] = useState(
    "Physical site verification conducted at residential address. Interacted with local residents. CCTNS & Court records clear with no adverse criminal history."
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

      setMessage("Police Clearance Certificate generated & transmitted to Passport Office!");
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
        userName={police?.badgeNumber ? `Officer (${police.badgeNumber})` : "Police Authority"}
        badgeLabel={`Station: ${police?.stationCode || "PS-CENTRAL"} • Badge: ${police?.badgeNumber || "POL-90210"}`}
      />

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Law Enforcement Portal
              </span>
              <span className="text-xs text-slate-400">Criminal & Intelligence Database Linked</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Police Background Verification Desk
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Station Code: <span className="font-mono text-emerald-300 font-bold">{police?.stationCode}</span> • Officer Badge ID: <span className="font-mono text-slate-200">{police?.badgeNumber}</span>
            </p>
          </div>

          <button
            onClick={fetchEnquiries}
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition shadow-sm"
          >
            ↻ Refresh Queue
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-5 shadow-lg">
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
              Pending Physical Enquiries
            </p>
            <p className="text-3xl font-extrabold text-purple-300 mt-1">{pendingCount}</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 shadow-lg">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Issued Clearance Certificates
            </p>
            <p className="text-3xl font-extrabold text-emerald-300 mt-1">{completedCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Assigned Police Jurisdiction
            </p>
            <p className="text-base font-bold text-white mt-1">
              Central Police Station Division
            </p>
          </div>
        </div>

        {/* Notifications */}
        {message && (
          <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-300">
            ✓ {message}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-xs font-semibold text-red-300">
            ✗ {error}
          </div>
        )}

        {/* Main Grid: Enquiries Queue & Report Submission */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Enquiries Queue (Left 6 Cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Assigned Verification Requests ({enquiries.length})
              </h3>
              <span className="text-[10px] text-slate-400">Select case to verify</span>
            </div>

            {enquiries.length === 0 ? (
              <div className="p-16 text-center text-slate-500 space-y-1">
                <p className="text-3xl">👮</p>
                <p className="text-xs font-medium">No pending cases in queue.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 max-h-[520px] overflow-y-auto">
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
                            className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                              isPending
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            }`}
                          >
                            {isPending ? "SITE CHECK PENDING" : "CLEARANCE TRANSMITTED"}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-slate-200">
                          {enq.applicant?.name}
                        </p>

                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          📍 {enq.applicant?.address}
                        </p>
                      </div>

                      <span className="text-xs text-emerald-400 font-bold">
                        Examine →
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Verification Form (Right 6 Cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            {!selectedEnquiry ? (
              <div className="py-24 text-center text-slate-500 space-y-2">
                <p className="text-4xl">🔍</p>
                <h4 className="text-sm font-bold text-slate-300">
                  Select Enquiry Case
                </h4>
                <p className="text-xs max-w-xs mx-auto text-slate-400">
                  Select an application from the queue to review residential address, conduct national criminal record checks, and transmit clearance report.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-5">
                <div className="border-b border-slate-800 pb-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      {selectedEnquiry.applicationId}
                    </span>
                    <span className="text-xs text-slate-400">
                      DOB: {new Date(selectedEnquiry.applicant?.dob).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedEnquiry.applicant?.name}
                  </h3>
                  <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs">
                    <span className="text-slate-500 uppercase font-bold block text-[10px]">
                      Site Verification Address
                    </span>
                    <p className="text-slate-200 mt-0.5">{selectedEnquiry.applicant?.address}</p>
                  </div>
                </div>

                {/* Automated Background Record Checks (UML Sequence Point 17-18) */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex items-center justify-between">
                    <span className="text-slate-400">CCTNS Criminal Database</span>
                    <span className="font-bold text-emerald-400 font-mono">NO RECORDS (CLEAR)</span>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex items-center justify-between">
                    <span className="text-slate-400">Court / Pending FIRs</span>
                    <span className="font-bold text-emerald-400 font-mono">NO PENDING FIR</span>
                  </div>
                </div>

                {/* Existing Report Display if already submitted */}
                {selectedEnquiry.policeReports?.length > 0 && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400 uppercase text-[10px]">
                        Transmitted Clearance Certificate
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {selectedEnquiry.policeReports[0].reportId}
                      </span>
                    </div>
                    <p className="font-semibold text-white">
                      Clearance: {selectedEnquiry.policeReports[0].clearanceStatus}
                    </p>
                    <p className="text-slate-300 text-[11px]">
                      {selectedEnquiry.policeReports[0].remarks}
                    </p>
                  </div>
                )}

                {/* Form controls */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Enquiry Clearance Decision
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setClearanceStatus("CLEARED");
                        setRemarks("Physical site verification conducted at residential address. Interacted with local residents. CCTNS & Court records clear with no adverse criminal history.");
                      }}
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
                      onClick={() => {
                        setClearanceStatus("ADVERSE");
                        setRemarks("Adverse record identified during field verification or address mismatch.");
                      }}
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
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Field Enquiry Findings & Official Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500 resize-none leading-relaxed"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50 shadow-lg shadow-emerald-600/30"
                >
                  {submitting ? "Transmitting Certificate..." : "Transmit Police Clearance Report →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
