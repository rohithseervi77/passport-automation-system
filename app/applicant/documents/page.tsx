"use client";

import { useState, useEffect } from "react";
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
  Download, 
  Clock, 
  XCircle,
  FileCheck2,
  FolderOpen
} from "lucide-react";

export default function ApplicantDocumentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [digiLockerLoading, setDigiLockerLoading] = useState(false);
  const [applicant, setApplicant] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);

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

  async function fetchDocuments() {
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
  }

  useEffect(() => {
    fetchDocuments();
  }, [router]);

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
          documentType: "Proof of Identity (Aadhaar Card) - DigiLocker Verified",
          fileName: "UIDAI_eAadhaar_DigiLocker_Verified.pdf",
          fileSize: 1024 * 412,
          fileUrl: "/digilocker/verified_aadhaar.pdf",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to pull from DigiLocker");
        return;
      }

      setMessage("e-Aadhaar successfully pulled and verified via DigiLocker Government Gateway!");
      await fetchDocuments();
    } catch (err) {
      console.error("DigiLocker error:", err);
      setError("Failed to establish secure connection with DigiLocker Gateway");
    } finally {
      setDigiLockerLoading(false);
    }
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
            <div className="mt-4 sm:mt-0 p-3 bg-white border border-slate-200 rounded-lg text-right shadow-sm">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Application Reference Number</div>
              <div className="text-base font-bold font-mono text-blue-950">{application.applicationId}</div>
            </div>
          )}
        </div>

        {/* Feedback Messages */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Success</p>
              <p className="text-xs text-emerald-700 mt-0.5">{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upload Box & DigiLocker Gateway (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* DigiLocker Sync Card */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-blue-800 text-[10px] font-bold uppercase tracking-wider">
                  DigiLocker Integration
                </span>
              </div>
              <h3 className="font-bold text-base">Instant Paperless Verification</h3>
              <p className="text-xs text-blue-200 mt-1 mb-4 leading-relaxed">
                Import cryptographically verified Aadhaar and educational certificates directly from your DigiLocker account to bypass physical document scrutiny at Counter B.
              </p>
              <button
                type="button"
                onClick={handleDigiLockerSync}
                disabled={digiLockerLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white text-blue-950 rounded-lg text-xs font-bold hover:bg-blue-50 transition shadow"
              >
                {digiLockerLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-blue-950 border-t-transparent rounded-full animate-spin"></div>
                    Connecting to DigiLocker API...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Fetch e-Aadhaar from DigiLocker
                  </>
                )}
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
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-950 text-white rounded-lg text-xs font-semibold hover:bg-blue-900 disabled:opacity-50 transition shadow-sm"
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
                    Please upload mandatory proofs of Identity, Address, and Date of Birth using the form on the left.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {documents.map((doc) => {
                    const isVerified = doc.fileStatus === "VERIFIED";
                    const isRejected = doc.fileStatus === "REJECTED";
                    const isPending = doc.fileStatus === "UPLOADED" || !doc.fileStatus;

                    return (
                      <div key={doc.docId || doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900">{doc.documentType}</span>
                            {isVerified && (
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
                            onClick={() => alert(`Simulated document view: ${doc.fileName || doc.documentType}`)}
                            className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-xs font-medium inline-flex items-center gap-1"
                            title="Preview Document"
                          >
                            <Download className="w-3.5 h-3.5" />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(doc.docId)}
                            className="p-1.5 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium inline-flex items-center gap-1"
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
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Statutory Document Checklist Fulfillment
              </h2>
              <div className="space-y-3">
                {requiredCategories.map((cat, idx) => {
                  const hasUploaded = documents.some((d) =>
                    cat.options.some((opt) => d.documentType?.includes(opt) || d.documentType?.includes(cat.category.split(" ")[2]))
                  );

                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                      {hasUploaded ? (
                        <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0 mt-0.5"></div>
                      )}
                      <div>
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
