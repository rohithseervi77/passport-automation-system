"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  Trash2, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  XCircle,
  FileCheck2,
  FolderOpen,
  Sparkles,
  Eye
} from "lucide-react";
import DigiLockerModal from "@/components/DigiLockerModal";
import DocumentViewerModal from "@/components/DocumentViewerModal";

export default function ApplicantDocumentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [applicant, setApplicant] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  // Modals
  const [isDigiLockerOpen, setIsDigiLockerOpen] = useState(false);
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<any>(null);

  // Selected upload particulars
  const [selectedType, setSelectedType] = useState("Proof of Identity (Aadhaar Card)");
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [simulatedFileName, setSimulatedFileName] = useState("aadhaar_card_scan.pdf");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const requiredCategories = [
    {
      category: "Proof of Identity (POI)",
      options: [
        "Proof of Identity (Aadhaar Card)",
        "Proof of Identity (Voter ID Card)",
        "Proof of Identity (PAN Card)",
        "Proof of Identity (Driving Licence)",
      ],
      mandatory: true,
      description: "Government-issued photo identification proof.",
    },
    {
      category: "Proof of Present Residential Address (POA)",
      options: [
        "Proof of Address (Aadhaar Card)",
        "Proof of Address (Electricity / Water Bill - Last 3 Months)",
        "Proof of Address (Scheduled Bank Passbook with Photo)",
        "Proof of Address (Registered Rent Agreement)",
      ],
      mandatory: true,
      description: "Valid document establishing continuous residential occupancy.",
    },
    {
      category: "Proof of Date of Birth (DOB)",
      options: [
        "Proof of Date of Birth (Municipal Birth Certificate)",
        "Proof of Date of Birth (10th Standard School Marksheet)",
        "Proof of Date of Birth (PAN Card)",
        "Proof of Date of Birth (Aadhaar Card)",
      ],
      mandatory: true,
      description: "Official record authenticating date and place of birth.",
    },
    {
      category: "Previous Passport Records (For Re-issue Applications)",
      options: [
        "Previous Passport (First 2 & Last 2 Pages Scanned Copy)",
        "Previous Passport (ECR / Non-ECR Observation Page)",
      ],
      mandatory: false,
      description: "Mandatory only if applying under the Re-issue of Passport category.",
    },
  ];

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/applicant/documents");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setApplicant(data.applicant);
      setDocuments(data.documents || []);
      setApplication(data.application);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setUploading(true);

    try {
      const fileName = customFile ? customFile.name : simulatedFileName;
      const fileSize = customFile ? customFile.size : 1024 * 380;

      // File size validation (Max 5MB)
      if (fileSize > 5 * 1024 * 1024) {
        setError("File size exceeds statutory maximum of 5MB. Please compress your document.");
        setUploading(false);
        return;
      }

      const res = await fetch("/api/applicant/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: selectedType,
          fileName,
          fileSize,
          fileUrl: `/uploads/${fileName}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to upload document");
        setUploading(false);
        return;
      }

      setMessage(`Document '${selectedType}' uploaded successfully.`);
      setCustomFile(null);
      await fetchDocuments();
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to connect to document repository");
    } finally {
      setUploading(false);
    }
  }

  function handleOpenDigiLocker() {
    setError("");
    setMessage("");
    setIsDigiLockerOpen(true);
  }

  function handleDigiLockerSuccess() {
    setMessage(
      "e-Aadhaar and official certificates successfully imported and verified via DigiLocker Government Gateway! Physical Counter A scrutiny is now waived."
    );
    fetchDocuments();
  }

  async function handleDelete(docId: string) {
    if (!confirm("Are you sure you want to remove this uploaded document?")) return;
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/applicant/documents?docId=${docId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to delete document");
        return;
      }
      setMessage("Document removed successfully.");
      await fetchDocuments();
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete document");
    }
  }

  const hasDigiLockerAadhaar = documents.some(
    (d) =>
      d.documentType?.includes("DigiLocker") ||
      d.verifiedBy === "DIGILOCKER_UIDAI_GATEWAY" ||
      d.fileName?.toLowerCase().includes("digilocker")
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-600">Loading Document Verification Locker...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans">
      <Navbar
        role="APPLICANT"
        userName={applicant?.name || "Applicant"}
        badgeLabel={application?.applicationId ? `ARN: ${application.applicationId}` : "PAS"}
      />

      {/* DigiLocker Interactive Gateway Modal */}
      <DigiLockerModal
        isOpen={isDigiLockerOpen}
        onClose={() => setIsDigiLockerOpen(false)}
        onSuccess={handleDigiLockerSuccess}
        applicant={applicant}
      />

      {/* Document Inspection & e-Aadhaar Viewer Modal */}
      <DocumentViewerModal
        isOpen={isDocViewerOpen}
        onClose={() => setIsDocViewerOpen(false)}
        document={viewingDoc}
        applicant={applicant}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/applicant/dashboard" className="hover:text-blue-900 hover:underline">
            Applicant Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Supporting Documents</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 text-xs font-semibold mb-2">
              <FolderOpen className="w-3.5 h-3.5" />
              Document Verification Repository
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Upload & Manage Supporting Documents
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Upload self-attested photocopies of identity, address, and date-of-birth proofs required for scrutiny by the Passport Officer.
            </p>
          </div>

          {application?.applicationId && (
            <div className="mt-4 sm:mt-0 text-left sm:text-right bg-white p-3 rounded-lg border border-slate-200 shadow-sm shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Active Application Reference
              </span>
              <span className="font-mono font-bold text-blue-950 text-sm">{application.applicationId}</span>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs">
                <span className="text-slate-500">{application.serviceType}</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {application.status}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Messages */}
        {message && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Success</p>
              <p className="mt-0.5">{message}</p>
            </div>
            <button onClick={() => setMessage("")} className="text-emerald-500 hover:text-emerald-800">
              &times;
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Error</p>
              <p className="mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError("")} className="text-rose-500 hover:text-rose-800">
              &times;
            </button>
          </div>
        )}

        {/* Main Grid: Upload Controls (5) vs Uploaded List (7) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upload Box & DigiLocker Gateway (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* DigiLocker Sync Card */}
            <div className="bg-gradient-to-br from-[#002B49] via-blue-900 to-indigo-950 text-white rounded-xl p-5 shadow-sm border border-blue-800/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <ShieldCheck className="w-24 h-24 text-white" />
              </div>

              <div className="flex items-center gap-2 mb-2 relative z-10">
                <span className="px-2 py-0.5 rounded bg-blue-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  DigiLocker Integration
                </span>
                {hasDigiLockerAadhaar && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                    Connected
                  </span>
                )}
              </div>
              <h3 className="font-bold text-base relative z-10">Instant Paperless Verification</h3>
              <p className="text-xs text-blue-200 mt-1 mb-4 leading-relaxed relative z-10">
                Import cryptographically verified Aadhaar and educational certificates directly from your DigiLocker account to bypass physical document scrutiny at Counter B.
              </p>

              <button
                type="button"
                onClick={handleOpenDigiLocker}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white text-blue-950 rounded-lg text-xs font-bold hover:bg-blue-50 transition shadow relative z-10 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {hasDigiLockerAadhaar ? "Open DigiLocker / Manage Certificates" : "Fetch e-Aadhaar from DigiLocker"}
              </button>
            </div>

            {/* Standard Manual Upload Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Upload New Document
              </h2>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Document Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setSimulatedFileName(`${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  >
                    {requiredCategories.map((cat) => (
                      <optgroup key={cat.category} label={cat.category}>
                        {cat.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Choose File (PDF, JPG, PNG - Max 5MB)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setCustomFile(e.target.files[0]);
                        setSimulatedFileName(e.target.files[0].name);
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Selected: {customFile ? customFile.name : simulatedFileName}
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-950 text-white rounded-lg text-xs font-semibold hover:bg-blue-900 disabled:opacity-50 transition shadow-sm cursor-pointer"
                  >
                    {uploading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Uploading & Verifying Checksum...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        Upload Document
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Document Guidelines Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
              <p className="font-bold flex items-center gap-1.5 mb-1 text-amber-800">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                Statutory Guidelines:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-amber-800">
                <li>Uploaded scans must be crisp, legible, and uncropped.</li>
                <li>Applicant signature / thumb-print is required on self-attested photocopies.</li>
                <li>Submission of forged/fabricated documents is punishable under Section 12 of the Passports Act, 1967.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Uploaded Documents Table (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Uploaded Document Records ({documents.length})
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Live status synchronized with Regional Passport Officer verification terminal.
                  </p>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No supporting documents uploaded yet</p>
                  <p className="text-xs text-slate-400 mt-0.5 max-w-xs mx-auto">
                    Please import verified certificates via DigiLocker or upload required proofs using the form on the left.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {documents.map((doc) => {
                    const isVerified = doc.fileStatus === "VERIFIED" || doc.verificationStatus === "VERIFIED";
                    const isRejected = doc.fileStatus === "REJECTED" || doc.verificationStatus === "REJECTED";
                    const isPending = !isVerified && !isRejected;

                    const isDigiLockerDoc =
                      doc.documentType?.includes("DigiLocker") ||
                      doc.verifiedBy === "DIGILOCKER_UIDAI_GATEWAY" ||
                      doc.fileName?.toLowerCase().includes("digilocker");

                    return (
                      <div key={doc.docId || doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900">{doc.documentType}</span>
                            
                            {isDigiLockerDoc && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                DigiLocker Verified
                              </span>
                            )}

                            {isVerified && !isDigiLockerDoc && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                                <XCircle className="w-3 h-3" />
                                Correction Required
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                                <Clock className="w-3 h-3" />
                                Under Scrutiny
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                            <span>ID: {doc.docId}</span>
                            <span>•</span>
                            <span>{doc.fileName || "document_scan.pdf"}</span>
                            <span>•</span>
                            <span>{doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : "320 KB"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setViewingDoc(doc);
                              setIsDocViewerOpen(true);
                            }}
                            className="p-1.5 px-2.5 rounded-lg border border-blue-900/30 text-blue-950 bg-blue-50/50 hover:bg-blue-100 hover:text-blue-900 text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                            title="Inspect Document"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-900" />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(doc.docId)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium inline-flex items-center gap-1 transition cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Statutory Checklist Progress Tracker */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Statutory Document Checklist Fulfillment
                </h2>
                {hasDigiLockerAadhaar && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Counter A Waived
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {requiredCategories.map((cat, idx) => {
                  // If DigiLocker Aadhaar is imported, it satisfies POI, POA, and DOB
                  const isSatisfiedByDigiLocker =
                    hasDigiLockerAadhaar &&
                    (cat.category.includes("POI") || cat.category.includes("POA") || cat.category.includes("DOB"));

                  const hasUploaded =
                    isSatisfiedByDigiLocker ||
                    documents.some((d) =>
                      cat.options.some((opt) => d.documentType?.includes(opt) || d.documentType?.includes(cat.category.split(" ")[2]))
                    );

                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                      {hasUploaded ? (
                        <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0 mt-0.5"></div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${hasUploaded ? "text-slate-900" : "text-slate-600"}`}>
                              {cat.category}
                            </span>
                            {cat.mandatory && (
                              <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                Mandatory
                              </span>
                            )}
                          </div>
                          {isSatisfiedByDigiLocker && (
                            <span className="text-[10px] font-bold text-emerald-700">
                              Verified via DigiLocker
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{cat.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
