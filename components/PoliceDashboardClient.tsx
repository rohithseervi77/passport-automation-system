"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MapPin, 
  User, 
  FileText, 
  Building, 
  Calendar,
  Send,
  Database,
  Users
} from "lucide-react";

interface PoliceDashboardClientProps {
  initialPolice: any;
}

export default function PoliceDashboardClient({ initialPolice }: PoliceDashboardClientProps) {
  const router = useRouter();
  const [police, setPolice] = useState<any>(initialPolice);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, cleared: 0, adverse: 0 });
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);

  // Field Verification Form States
  const [clearanceStatus, setClearanceStatus] = useState<"CLEARED" | "ADVERSE" | "CLARIFICATION_REQUIRED">("CLEARED");
  const [visitDate, setVisitDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [witness1, setWitness1] = useState("V. Ramanathan (Neighbor, Door No. 42)");
  const [witness2, setWitness2] = useState("M. Selvakumar (Society Secretary)");
  const [stayDuration, setStayDuration] = useState("4 Years (Continuous)");
  const [remarks, setRemarks] = useState(
    "Physical site verification conducted at residential address. Interacted with local residents and verified original Aadhaar/utility bills. CCTNS and local court records clean with no adverse criminal history."
  );
  const [adverseReason, setAdverseReason] = useState("");

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function fetchEnquiries() {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filterStatus !== "ALL") query.append("status", filterStatus);
      if (search.trim()) query.append("q", search.trim());

      const res = await fetch(`/api/police/enquiries?${query.toString()}`);
      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.police) setPolice(data.police);
      setEnquiries(data.enquiries || []);
      if (data.counts) setCounts(data.counts);

      if (selectedEnquiry) {
        const found = (data.enquiries || []).find((e: any) => e.id === selectedEnquiry.id);
        if (found) setSelectedEnquiry(found);
      }
    } catch (err) {
      console.error("Failed to load police enquiries:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEnquiries();
  }, [filterStatus]);

  function handleSelectEnquiry(enquiry: any) {
    setSelectedEnquiry(enquiry);
    if (enquiry.policeReports && enquiry.policeReports.length > 0) {
      const latest = enquiry.policeReports[0];
      setClearanceStatus(latest.clearanceStatus);
      setRemarks(latest.remarks || "");
      setAdverseReason(latest.adverseReason || "");
    } else {
      setClearanceStatus("CLEARED");
      setRemarks(
        "Physical site verification conducted at residential address. Interacted with local residents and verified original Aadhaar/utility bills. CCTNS and local court records clean with no adverse criminal history."
      );
      setAdverseReason("");
    }
  }

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
          remarks: clearanceStatus === "ADVERSE" ? (adverseReason || remarks) : remarks,
          adverseReason: clearanceStatus === "ADVERSE" ? adverseReason : null,
          stationCode: police?.stationCode || "PS-CENTRAL",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit police enquiry report.");
        setSubmitting(false);
        return;
      }

      setMessage(data.message || "Police verification report submitted successfully.");
      await fetchEnquiries();
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to connect to police verification server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans">
      <Navbar
        role="POLICE"
        userName={police?.officerName ? `Inspector ${police.officerName}` : "Police Authority"}
        badgeLabel={police?.stationCode ? `Station: ${police.stationCode}` : "District HQ"}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* Top Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                District Police Authority Portal
              </span>
              <span className="text-xs text-slate-500">
                Station Jurisdiction: {police?.stationCode || "PS-CENTRAL"} ({police?.district || "Chennai City Police"})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Police Verification & Background Enquiry Console
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verifying Officer: <span className="font-bold text-blue-950">{police?.officerName || "Special Branch Inspector"}</span> • Integrated with CCTNS Criminal Tracking Network
            </p>
          </div>

          <button
            onClick={fetchEnquiries}
            disabled={loading}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Roster
          </button>
        </div>

        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Jurisdiction Files</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{counts.total}</span>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-purple-800 block">Pending Verification</span>
            <span className="text-2xl font-extrabold text-purple-950 mt-1 block">{counts.pending}</span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Clearance Granted</span>
            <span className="text-2xl font-extrabold text-emerald-950 mt-1 block">{counts.cleared}</span>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-rose-800 block">Adverse Reports</span>
            <span className="text-2xl font-extrabold text-rose-950 mt-1 block">{counts.adverse}</span>
          </div>
        </div>

        {/* Notifications */}
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

        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Filter:</span>
            {[
              { key: "ALL", label: "All Cases" },
              { key: "PENDING", label: "Pending Field Enquiry" },
              { key: "CLEARED", label: "Cleared" },
              { key: "ADVERSE", label: "Adverse" },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilterStatus(f.key)}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
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
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") fetchEnquiries(); }}
              placeholder="Search ARN / Citizen / Station..."
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-900 w-56"
            />
            <button
              onClick={fetchEnquiries}
              className="px-3 py-1.5 bg-blue-950 text-white rounded-lg text-xs font-semibold hover:bg-blue-900"
            >
              Search
            </button>
          </div>
        </div>

        {/* Main Grid: Left Enquiries Queue (7 cols) + Right Verification Terminal (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Enquiries Table */}
          <div className={`${selectedEnquiry ? "lg:col-span-7" : "lg:col-span-12"} transition-all`}>
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Verification Roster ({enquiries.length})
                </span>
              </div>

              {enquiries.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  No police verification enquiries found matching current filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                      <tr>
                        <th className="p-3">ARN / Date</th>
                        <th className="p-3">Applicant Name</th>
                        <th className="p-3">Police Station</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {enquiries.map((e) => {
                        const isSelected = selectedEnquiry?.id === e.id;
                        const latestReport = e.policeReports?.[0];

                        return (
                          <tr
                            key={e.id}
                            onClick={() => handleSelectEnquiry(e)}
                            className={`cursor-pointer transition ${
                              isSelected ? "bg-blue-50/80 font-medium" : "hover:bg-slate-50"
                            }`}
                          >
                            <td className="p-3">
                              <span className="font-mono font-bold text-blue-950 block">{e.applicationId}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(e.createdAt).toLocaleDateString("en-IN")}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-slate-900 block">
                                {e.givenName ? `${e.givenName} ${e.surname || ""}` : e.applicant?.name}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate max-w-xs block">
                                {e.presentAddressLine1 || e.applicant?.address || "Address"}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="font-medium text-slate-700">{e.policeStation || "PS Central"}</span>
                            </td>
                            <td className="p-3">
                              {latestReport?.clearanceStatus === "CLEARED" ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                  ✓ Cleared
                                </span>
                              ) : latestReport?.clearanceStatus === "ADVERSE" ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                                  ✗ Adverse
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                                  Pending Enquiry
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={(ev) => { ev.stopPropagation(); handleSelectEnquiry(e); }}
                                className="px-2.5 py-1 bg-blue-950 text-white rounded text-[11px] font-semibold hover:bg-blue-900"
                              >
                                Conduct Enquiry
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right: Field Verification Terminal */}
          {selectedEnquiry && (
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border-2 border-blue-900/30 rounded-xl shadow-md p-5">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                      Police Field Enquiry Dossier
                    </span>
                    <h2 className="text-base font-bold text-slate-900">
                      {selectedEnquiry.givenName ? `${selectedEnquiry.givenName} ${selectedEnquiry.surname || ""}` : selectedEnquiry.applicant?.name}
                    </h2>
                    <span className="font-mono text-xs font-bold text-blue-950 block mt-0.5">
                      ARN: {selectedEnquiry.applicationId}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedEnquiry(null)}
                    className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1 rounded"
                  >
                    ✕ Close
                  </button>
                </div>

                {/* Citizen Details Summary */}
                <div className="my-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gender / DOB:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedEnquiry.gender || "M"} • {selectedEnquiry.dob ? new Date(selectedEnquiry.dob).toLocaleDateString("en-IN") : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Aadhaar (UIDAI):</span>
                    <span className="font-mono font-bold text-slate-900">
                      {selectedEnquiry.aadhaarNumber ? `•••• •••• ${selectedEnquiry.aadhaarNumber.slice(-4)}` : "Verified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Present Residential Address:</span>
                    <span className="font-medium text-slate-800">
                      {selectedEnquiry.presentAddressLine1 || selectedEnquiry.applicant?.address}, {selectedEnquiry.presentCity || "Chennai"}, {selectedEnquiry.presentState || "Tamil Nadu"} - {selectedEnquiry.presentPinCode || "600001"}
                    </span>
                  </div>
                </div>

                {/* CCTNS Automated Crime Check Simulation */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs mb-4">
                  <div className="flex items-center gap-1.5 font-bold text-blue-950 mb-1">
                    <Database className="w-3.5 h-3.5 text-blue-900" />
                    CCTNS Criminal Database Check (State Police Network):
                  </div>
                  <p className="text-[11px] text-blue-800">
                    Query against FIR database, Proclaimed Offenders list, and Warrant registry: <strong>ZERO ADVERSE MATCHES</strong>.
                  </p>
                </div>

                {/* Physical Field Verification Submission Form */}
                <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                      Clearance Recommendation <span className="text-rose-600">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setClearanceStatus("CLEARED")}
                        className={`p-2.5 rounded-lg border text-xs font-bold text-center transition ${
                          clearanceStatus === "CLEARED"
                            ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        ✓ Cleared
                      </button>

                      <button
                        type="button"
                        onClick={() => setClearanceStatus("ADVERSE")}
                        className={`p-2.5 rounded-lg border text-xs font-bold text-center transition ${
                          clearanceStatus === "ADVERSE"
                            ? "border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-600"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        ✗ Adverse
                      </button>

                      <button
                        type="button"
                        onClick={() => setClearanceStatus("CLARIFICATION_REQUIRED")}
                        className={`p-2.5 rounded-lg border text-xs font-bold text-center transition ${
                          clearanceStatus === "CLARIFICATION_REQUIRED"
                            ? "border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-600"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        ⚠ Clarification
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Field Visit Date</label>
                      <input
                        type="date"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Duration of Continuous Stay</label>
                      <input
                        type="text"
                        value={stayDuration}
                        onChange={(e) => setStayDuration(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Local Resident Witness 1</label>
                    <input
                      type="text"
                      value={witness1}
                      onChange={(e) => setWitness1(e.target.value)}
                      placeholder="Name, Address & Mobile of resident neighbor"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Local Resident Witness 2</label>
                    <input
                      type="text"
                      value={witness2}
                      onChange={(e) => setWitness2(e.target.value)}
                      placeholder="Name, Address & Mobile of resident neighbor"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>

                  {clearanceStatus === "ADVERSE" && (
                    <div>
                      <label className="block font-bold text-rose-800 mb-1">
                        Mandatory Adverse Particulars / Ongoing Cases
                      </label>
                      <textarea
                        rows={3}
                        value={adverseReason}
                        onChange={(e) => setAdverseReason(e.target.value)}
                        placeholder="Detail the registered FIR number, trial court chargesheet, or false address particulars..."
                        required
                        className="w-full p-2.5 border border-rose-300 rounded text-xs bg-rose-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      ></textarea>
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Inspector Verification Remarks / Observations
                    </label>
                    <textarea
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-900"
                    ></textarea>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2.5 px-4 bg-blue-950 text-white rounded-lg text-xs font-bold hover:bg-blue-900 disabled:opacity-50 transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      {submitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Transmitting Report to Passport Office...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Submit Official Police Verification Report
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
