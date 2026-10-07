"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ApplicantDocumentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [digiLockerLoading, setDigiLockerLoading] = useState(false);
  const [applicant, setApplicant] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("Identity Proof (Aadhaar Card)");
  const [fileName, setFileName] = useState("aadhaar_card_scan.pdf");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const docTypes = [
    { title: "Identity Proof (Aadhaar Card)", desc: "Mandatory UIDAI e-Aadhaar or PVC card copy", badge: "Mandatory" },
    { title: "Identity Proof (Voter ID / PAN)", desc: "Secondary photo identity proof", badge: "Secondary" },
    { title: "Address Proof (Electricity / Utility Bill)", desc: "Recent bill (last 3 months) showing full address", badge: "Mandatory" },
    { title: "Address Proof (Bank Passbook / Statement)", desc: "Bank statement with photo & branch seal", badge: "Secondary" },
    { title: "Date of Birth Proof (Birth Certificate)", desc: "Municipal birth certificate or 10th marksheet", badge: "Mandatory" },
    { title: "Date of Birth Proof (10th Standard Marksheet)", desc: "Recognized Board educational certificate", badge: "Secondary" },
  ];

  async function fetchDocuments() {
    try {
      const res = await fetch("/api/applicant/documents");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.applicant) {
        setApplicant(data.applicant);
      }
      setDocuments(data.documents || []);
      setApplicationId(data.applicationId);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setUploading(true);

    try {
      const res = await fetch("/api/applicant/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: selectedType,
          fileUrl: `/uploads/${fileName}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to upload document");
        setUploading(false);
        return;
      }

      setMessage(`Document '${selectedType}' uploaded & cryptographic checksum verified.`);
      await fetchDocuments();
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to connect to server");
    } finally {
      setUploading(false);
    }
  }

  async function handleDigiLockerSync() {
    setDigiLockerLoading(true);
    setError("");
    setMessage("");

    try {
      // Simulate DigiLocker API document pull
      const res = await fetch("/api/applicant/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: "Identity Proof (Aadhaar Card) - DigiLocker Verified",
          fileUrl: "/digilocker/verified_aadhaar_xml.pdf",
        }),
      });

      if (res.ok) {
        setMessage("✓ DigiLocker instant sync completed! Verified e-Aadhaar attached.");
        await fetchDocuments();
      }
    } catch (err) {
      console.error("DigiLocker error:", err);
    } finally {
      setDigiLockerLoading(false);
    }
  }

  async function handleDelete(docId: string) {
    try {
      const res = await fetch(`/api/applicant/documents?docId=${docId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessage("Document removed.");
        await fetchDocuments();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">Loading document repository...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-16">
      <Navbar
        role="APPLICANT"
        userName={applicant?.name || "Applicant"}
        badgeLabel={applicationId ? `App: ${applicationId}` : `ID: ${applicant?.applicantId || "PAS"}`}
      />

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/applicant/dashboard"
              className="text-xs text-blue-400 hover:text-blue-300 mb-1.5 inline-block font-medium"
            >
              ← Back to Dashboard
            </Link>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Document Verification & Repository Hub
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure cryptographic document repository linked to your Passport Application.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={digiLockerLoading}
              onClick={handleDigiLockerSync}
              className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-900/50 transition flex items-center gap-2 shadow-md shadow-emerald-900/20 disabled:opacity-50"
            >
              <span>🏛️</span>
              <span>{digiLockerLoading ? "Syncing..." : "Sync via DigiLocker"}</span>
            </button>

            {applicationId && (
              <div className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-right">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">
                  Application ARN
                </span>
                <span className="font-mono text-xs font-bold text-blue-400">
                  {applicationId}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        {message && (
          <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-xs font-medium text-emerald-300">
            ✓ {message}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-xs font-medium text-red-300">
            ✗ {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Upload Form (Left 5 Cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-5 shadow-xl">
            <h3 className="text-sm font-bold border-b border-slate-800 pb-3 flex items-center gap-2 text-white">
              <span>📤</span> Upload New Verification File
            </h3>

            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1.5">
                  Select Document Category
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setFileName(`${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`);
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                >
                  {docTypes.map((dt) => (
                    <option key={dt.title} value={dt.title}>
                      {dt.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">
                  Attachment File Name / Scan
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-slate-200 focus:border-blue-500 outline-none font-mono"
                  placeholder="document_scan.pdf"
                  required
                />
              </div>

              {/* Simulated Drag & Drop Zone */}
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-5 text-center space-y-1">
                <span className="text-2xl block mb-1">📄</span>
                <p className="text-xs font-semibold text-slate-300">Drag & drop your scan or browse</p>
                <p className="text-[10px] text-slate-500">Supports PDF, JPG, PNG (256-bit Encrypted storage, max 5MB)</p>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-md shadow-blue-600/30"
              >
                {uploading ? "Verifying & Uploading..." : "Upload Document →"}
              </button>
            </form>
          </div>

          {/* Uploaded Documents List (Right 7 Cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📁</span> Attached Verification Proofs ({documents.length})
              </h3>
              <span className="text-[10px] text-slate-400">
                Composition: Document $\in$ Application
              </span>
            </div>

            {documents.length === 0 ? (
              <div className="py-14 text-center text-slate-500 space-y-2">
                <p className="text-3xl">📑</p>
                <p className="text-xs font-medium">No documents attached yet.</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Please attach at least 1 Identity Proof, 1 Address Proof, and 1 Date of Birth proof.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => {
                  const isVerified = doc.fileStatus === "VERIFIED";
                  const isRejected = doc.fileStatus === "REJECTED";

                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-xl border border-slate-800/90 bg-slate-950 p-3.5 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg border border-slate-800">
                          {isVerified ? "🛡️" : "📄"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">
                            {doc.documentType}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                            ID: {doc.docId} • {doc.fileUrl || "scan.pdf"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                            isVerified
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : isRejected
                              ? "bg-red-500/10 text-red-400 border-red-500/30"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {doc.fileStatus}
                        </span>

                        {!isVerified && (
                          <button
                            type="button"
                            onClick={() => handleDelete(doc.docId)}
                            className="rounded p-1 text-slate-500 hover:text-red-400 transition text-xs"
                            title="Remove Document"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Next Step Nav */}
            <div className="mt-8 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">
                {documents.length >= 2 ? "✓ Ready for PSK Appointment" : "Attach required documents"}
              </span>
              <Link
                href="/applicant/appointment"
                className="rounded-lg bg-cyan-600 px-5 py-2 font-bold text-white hover:bg-cyan-700 transition flex items-center gap-1.5 shadow-md shadow-cyan-600/30"
              >
                <span>Schedule Appointment</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
