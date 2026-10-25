"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import {
  FileCheck2,
  Search,
  Filter,
  Eye,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileText,
  Lock,
} from "lucide-react";

export default function AdminDocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Inspector modal
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter !== "ALL") query.append("status", statusFilter);
      if (search.trim()) query.append("q", search.trim());
      query.append("page", page.toString());

      const res = await fetch(`/api/admin/documents?${query.toString()}`);
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setDocuments(data.documents || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.totalCount || 0);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page, router]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  async function handleInspect(docId: string) {
    setInspectLoading(true);
    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId }),
      });
      const data = await res.json();
      if (res.ok) {
        setPreviewDoc(data);
      } else {
        alert(data.error || "Failed to inspect document.");
      }
    } catch {
      alert("Error requesting secure signed URL.");
    } finally {
      setInspectLoading(false);
    }
  }

  return (
    <AdminShell
      pageTitle="Verification Document Registry"
      pageSubtitle="Scrutiny of supporting identity, date of birth, and residential credentials across applications."
    >
      <div className="space-y-5">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Supporting Document Vault</h2>
            <p className="text-xs text-slate-400">
              Total {totalCount} verification credentials registered under short-lived encrypted signed URLs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchDocuments}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Document ID, File Name, or ARN (e.g. DOC-..., APP-...)"
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full md:w-auto"
          >
            <option value="ALL">All Verification Statuses</option>
            <option value="PENDING">Pending Verification</option>
            <option value="VERIFIED">Verified Credentials</option>
            <option value="REJECTED">Rejected Documents</option>
          </select>
        </div>

        {/* Documents Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Document ID & Type</th>
                  <th className="px-4 py-3">File Name & Size</th>
                  <th className="px-4 py-3">Associated ARN</th>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Verification</th>
                  <th className="px-4 py-3">Upload Date</th>
                  <th className="px-4 py-3 text-right">Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                      Loading verification documents...
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                      No documents found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-900/50 transition">
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-white block">{doc.docId}</span>
                        <span className="text-[11px] text-slate-400 block">{doc.documentType}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-slate-300 font-mono text-[11px] block truncate max-w-xs">
                          {doc.fileName || "document.pdf"}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-blue-400 font-bold">
                        <Link
                          href={`/admin/applications/${doc.application?.applicationId}`}
                          className="hover:underline"
                        >
                          {doc.application?.applicationId}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {doc.application?.applicant?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            doc.verificationStatus === "VERIFIED"
                              ? "bg-emerald-950 text-emerald-300 border-emerald-600/40"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {doc.verificationStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">
                        {new Date(doc.uploadedAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleInspect(doc.docId)}
                          disabled={inspectLoading}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing Page {page} of {totalPages} ({totalCount} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

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
                  Document Preview (Audited Inspection)
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
                    <p className="text-xs font-bold text-white">Private Supporting Document</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                      Short-lived cryptographic signed URL generated. Access logged to the central security audit trail.
                    </p>
                  </div>
                  <a
                    href={previewDoc.signedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs"
                  >
                    <span>Open in Encrypted Viewer</span>
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
