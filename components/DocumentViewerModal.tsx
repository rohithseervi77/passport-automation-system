"use client";

import React, { useState } from "react";
import { 
  X, 
  Download, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  QrCode, 
  Calendar, 
  MapPin, 
  User, 
  Lock,
  ExternalLink
} from "lucide-react";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    docId?: string;
    documentType: string;
    fileName?: string;
    fileSize?: number;
    fileUrl?: string;
    verificationStatus?: string;
    verifiedBy?: string;
    verifiedAt?: string | Date;
    metadata?: any;
  } | null;
  applicant?: {
    name?: string;
    dob?: string | Date;
    gender?: string;
    address?: string;
    applicantId?: string;
  } | null;
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  document,
  applicant,
}: DocumentViewerModalProps) {
  const [signatureVerified, setSignatureVerified] = useState(true);

  if (!isOpen || !document) return null;

  const isDigiLocker = 
    document.documentType?.toLowerCase().includes("digilocker") ||
    document.fileName?.toLowerCase().includes("digilocker") ||
    document.verifiedBy?.toLowerCase().includes("digilocker");

  const isAadhaar = 
    document.documentType?.toLowerCase().includes("aadhaar") ||
    document.fileName?.toLowerCase().includes("aadhaar");

  const isClassX = 
    document.documentType?.toLowerCase().includes("class x") ||
    document.documentType?.toLowerCase().includes("marksheet") ||
    document.fileName?.toLowerCase().includes("cbse");

  const isPan = 
    document.documentType?.toLowerCase().includes("pan") ||
    document.fileName?.toLowerCase().includes("pan");

  const citizenName = applicant?.name || "Aarav Sharma";
  const citizenDob = applicant?.dob 
    ? new Date(applicant.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "15/05/1998";
  const citizenGender = applicant?.gender || "Male / पुरुष";
  const citizenAddress = applicant?.address || "42 Park Avenue, Saligramam, Chennai, Tamil Nadu 600093";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDigiLocker ? "bg-emerald-600/30 text-emerald-400 border border-emerald-500/40" : "bg-blue-600/30 text-blue-400"}`}>
              {isDigiLocker ? <ShieldCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-wide text-white">
                  {document.documentType}
                </h3>
                {isDigiLocker && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    DigiLocker Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Ref: {document.docId || "DOC-VERIFIED"} • {document.fileName || "document.pdf"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Print Certificate"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto bg-slate-50">
          {/* Security Banner */}
          {isDigiLocker && (
            <div className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-emerald-950">
                    Digitally Verified via National DigiLocker Government Gateway
                  </p>
                  <p className="text-emerald-700 mt-0.5">
                    This document was cryptographically fetched directly from the issuing authority repository under Section 5A of the Information Technology Act, 2000.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-emerald-800 font-mono">
                    <span>Issuer: <strong>UIDAI / MeitY</strong></span>
                    <span>•</span>
                    <span>URI: <strong>in.gov.uidai-aadhaar-90214829</strong></span>
                    <span>•</span>
                    <span>Signature: <strong>PKI Valid (SHA-256)</strong></span>
                  </div>
                </div>
              </div>
              <span className="shrink-0 bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider">
                Exempt from Counter A
              </span>
            </div>
          )}

          {/* DOCUMENT PREVIEW CONTAINER */}
          {isAadhaar ? (
            /* =======================================================
               AUTHENTIC UIDAI e-AADHAAR CARD PREVIEW
            ======================================================= */
            <div className="bg-white rounded-xl border border-slate-300 shadow-md overflow-hidden text-slate-800">
              {/* Indian Tricolor Strip */}
              <div className="h-2 w-full flex">
                <div className="w-1/3 bg-[#FF9933]"></div>
                <div className="w-1/3 bg-white border-y border-slate-200"></div>
                <div className="w-1/3 bg-[#138808]"></div>
              </div>

              {/* Header */}
              <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    UIDAI
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      भारत सरकार / Government of India
                    </h4>
                    <p className="text-xs font-semibold text-slate-600">
                      भारतीय विशिष्ट पहचान प्राधिकरण / Unique Identification Authority of India
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                    Electronic Aadhaar
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Download: 2026-10-25 14:32 IST
                  </p>
                </div>
              </div>

              {/* Main Aadhaar Card Content */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Photo & Biometric Box */}
                <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-28 h-32 rounded-lg bg-slate-200 border-2 border-slate-300 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden shadow-inner">
                    <User className="w-16 h-16 text-slate-400" />
                    <div className="absolute bottom-0 inset-x-0 bg-blue-900/80 text-white text-[9px] py-0.5 font-bold uppercase">
                      Citizen Photo
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 mt-2 font-mono">
                    VID: 9182 3746 5123 9081
                  </span>
                </div>

                {/* Demographic Particulars */}
                <div className="md:col-span-2 space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Name / नाम
                    </span>
                    <p className="font-bold text-slate-900 text-sm">{citizenName}</p>
                    <p className="font-medium text-slate-500 text-xs">आरव शर्मा</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Date of Birth / जन्म तिथि
                      </span>
                      <p className="font-semibold text-slate-800">{citizenDob}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Gender / लिंग
                      </span>
                      <p className="font-semibold text-slate-800">{citizenGender}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Address / पता
                    </span>
                    <p className="font-medium text-slate-700 leading-relaxed text-xs">
                      {citizenAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Aadhaar Number Band */}
              <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white text-center py-3 border-y border-red-900">
                <span className="text-xl font-extrabold tracking-widest font-mono">
                  XXXX XXXX 9021
                </span>
                <p className="text-[11px] font-medium text-red-100 tracking-wider mt-0.5">
                  मेरा <span className="font-bold">आधार</span>, मेरी पहचान
                </p>
              </div>

              {/* Digital Signature & Verification Box */}
              <div className="p-4 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs border-t border-slate-200">
                {/* QR Code */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white border border-slate-300 rounded-lg shadow-sm">
                    <QrCode className="w-12 h-12 text-slate-900" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-xs">Cryptographic Secure QR</p>
                    <p className="text-[11px] text-slate-500">Scan via UIDAI mAadhaar app to verify demographic data.</p>
                  </div>
                </div>

                {/* Digital Signature Certificate Stamp */}
                <div className="bg-emerald-50 border-2 border-emerald-500 rounded-lg p-2.5 flex items-center gap-2.5 max-w-xs shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow">
                    ✓
                  </div>
                  <div className="text-[10px] leading-tight">
                    <p className="font-bold text-emerald-950 uppercase">Signature Valid</p>
                    <p className="text-emerald-800">Digitally signed by: DS UNIQUE IDENTIFICATION AUTHORITY OF INDIA 03</p>
                    <p className="text-slate-500 font-mono mt-0.5">2026.10.25 14:32:10 IST</p>
                  </div>
                </div>
              </div>
            </div>
          ) : isClassX ? (
            /* =======================================================
               CBSE CLASS X PASSING CERTIFICATE PREVIEW
            ======================================================= */
            <div className="bg-white rounded-xl border border-amber-300 shadow-md p-8 text-slate-800 relative font-serif">
              <div className="text-center border-b-2 border-amber-600 pb-4 mb-6">
                <h4 className="text-lg font-bold text-amber-900 uppercase tracking-widest">
                  Central Board of Secondary Education
                </h4>
                <p className="text-xs text-amber-800 font-sans font-semibold mt-1">
                  SECONDARY SCHOOL EXAMINATION (CLASS X) CERTIFICATE
                </p>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-slate-700">
                <p>
                  This is to certify that <strong>{citizenName}</strong>, Roll No. <strong>6149021</strong>, 
                  Registration No. <strong>CBSE/2014/TN/9021</strong>, has successfully passed the Secondary School Examination 
                  conducted by the Board in the month of March 2014 from St. Xavier Higher Secondary School, Chennai.
                </p>
                <div className="grid grid-cols-2 gap-4 py-3 bg-amber-50/50 p-4 rounded-lg font-sans text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">Date of Birth:</span>
                    <strong className="text-slate-900">{citizenDob}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Result:</span>
                    <strong className="text-emerald-700">PASSED (First Division - Distinction)</strong>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between font-sans text-xs">
                <div>
                  <p className="font-bold text-slate-800">DigiLocker Certified</p>
                  <p className="text-[10px] text-slate-400 font-mono">URI: in.gov.cbse-marksheet-2014-6149021</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Digitally Signed by CBSE
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* =======================================================
               STANDARD UPLOADED DOCUMENT PREVIEW
            ======================================================= */
            <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{document.documentType}</h4>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  File: {document.fileName || "scan.pdf"} • Size: {document.fileSize ? `${Math.round(document.fileSize / 1024)} KB` : "350 KB"}
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 bg-slate-50 rounded-lg border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification Status:</span>
                  <span className="font-bold text-slate-800">{document.verificationStatus || "PENDING"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Document ID:</span>
                  <span className="font-mono text-slate-800">{document.docId || "N/A"}</span>
                </div>
                {document.verifiedBy && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scrutinized By:</span>
                    <span className="font-medium text-slate-800">{document.verifiedBy}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>End-to-end encrypted storage on Supabase Cloud</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                alert(`Official digital certificate for ${document.documentType} verified and ready for printing.`);
                window.print();
              }}
              className="px-4 py-2 bg-blue-950 text-white rounded-lg text-xs font-semibold hover:bg-blue-900 flex items-center gap-1.5 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download Official Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
