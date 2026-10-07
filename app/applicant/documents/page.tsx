"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ApplicantDocumentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [applicant, setApplicant] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("Identity Proof (Aadhaar Card)");
  const [fileName, setFileName] = useState("aadhaar_card_scan.pdf");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const docTypes = [
    "Identity Proof (Aadhaar Card)",
    "Identity Proof (Voter ID / PAN)",
    "Address Proof (Electricity / Utility Bill)",
    "Address Proof (Bank Passbook / Statement)",
    "Date of Birth Proof (Birth Certificate)",
    "Date of Birth Proof (10th Standard Marksheet)",
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

      setMessage(`Document '${selectedType}' attached successfully!`);
      await fetchDocuments();
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to connect to server");
    } finally {
      setUploading(false);
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
        <p className="text-slate-400">Loading documents...</p>
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

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/applicant/dashboard"
              className="text-xs text-blue-400 hover:text-blue-300 mb-2 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <h2 className="text-3xl font-bold">Document Verification Hub</h2>
            <p className="text-sm text-slate-400 mt-1">
              Upload mandatory verification documents required for Officer and Police clearance.
            </p>
          </div>

          {applicationId && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Linked Application
              </span>
              <span className="font-mono text-sm font-semibold text-blue-400">
                {applicationId}
              </span>
            </div>
          )}
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

        <div className="grid gap-8 md:grid-cols-3">
          {/* Upload Form (Left Column) */}
          <div className="md:col-span-1 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-base font-semibold border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
              <span>📤</span> Upload New Document
            </h3>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Document Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setFileName(`${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`);
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                >
                  {docTypes.map((dt) => (
                    <option key={dt} value={dt}>
                      {dt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  File Attachment (Simulated PDF/Scan)
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-blue-500 outline-none font-mono"
                  placeholder="document_scan.pdf"
                  required
                />
              </div>

              <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/50 p-3 text-center">
                <p className="text-[11px] text-slate-400">
                  Accepted formats: PDF, JPEG, PNG (Max 5MB)
                </p>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
              >
                {uploading ? "Attaching..." : "Upload Document"}
              </button>
            </form>
          </div>

          {/* Uploaded Documents List (Right Column) */}
          <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-base font-semibold border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>📁</span> Attached Documents ({documents.length})
              </span>
              <span className="text-xs text-slate-400 font-normal">
                Composition: Document $\in$ Application
              </span>
            </h3>

            {documents.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <p className="text-3xl mb-2">📑</p>
                <p className="text-sm font-medium">No documents attached yet.</p>
                <p className="text-xs mt-1">
                  Upload at least 1 Identity Proof, 1 Address Proof, and 1 DOB Proof.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => {
                  const statusColors: Record<string, string> = {
                    UPLOADED: "bg-blue-500/10 text-blue-400 border-blue-500/30",
                    VERIFIED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                    REJECTED: "bg-red-500/10 text-red-400 border-red-500/30",
                  };

                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-lg">
                          📄
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">
                            {doc.documentType}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">
                            ID: {doc.docId} • {doc.fileUrl || "file.pdf"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                            statusColors[doc.fileStatus] || "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {doc.fileStatus}
                        </span>

                        {doc.fileStatus !== "VERIFIED" && (
                          <button
                            type="button"
                            onClick={() => handleDelete(doc.docId)}
                            className="rounded p-1 text-slate-500 hover:text-red-400 transition"
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
            <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end gap-3">
              <Link
                href="/applicant/appointment"
                className="rounded-lg bg-cyan-600 px-5 py-2 text-xs font-semibold hover:bg-cyan-700 transition flex items-center gap-2"
              >
                <span>Next: Schedule Appointment</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
