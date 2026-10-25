"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  KeyRound, 
  CheckCircle2, 
  ArrowRight, 
  FileCheck, 
  RefreshCw,
  Building,
  AlertCircle
} from "lucide-react";

interface DigiLockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (importedDocs: any[]) => void;
  applicant?: {
    name?: string;
    dob?: string | Date;
    gender?: string;
    address?: string;
  } | null;
}

export default function DigiLockerModal({
  isOpen,
  onClose,
  onSuccess,
  applicant,
}: DigiLockerModalProps) {
  // Step 1: Login, Step 2: OTP, Step 3: Consent & Document Select, Step 4: Syncing, Step 5: Complete
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form states
  const [aadhaarOrMobile, setAadhaarOrMobile] = useState("XXXX-XXXX-9021");
  const [securityPin, setSecurityPin] = useState("123456");
  const [otp, setOtp] = useState("482910");
  const [otpTimer, setOtpTimer] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStageText, setSyncStageText] = useState("Connecting to UIDAI Gateway...");

  // Document selection
  const [selectedDocs, setSelectedDocs] = useState<{
    aadhaar: boolean;
    classX: boolean;
    pan: boolean;
  }>({
    aadhaar: true,
    classX: true,
    pan: false,
  });

  const citizenName = applicant?.name || "Aarav Sharma";

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, otpTimer]);

  if (!isOpen) return null;

  // Handle Login Step 1
  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!aadhaarOrMobile || !securityPin) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
      setOtpTimer(30);
    }, 700);
  }

  // Handle OTP Step 2
  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otp) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(3);
    }, 800);
  }

  // Handle Sync Step 3 -> 4 -> 5
  async function handleImport() {
    setStep(4);
    setSyncProgress(15);
    setSyncStageText("Connecting to National e-Governance Division (NeGD) Gateway...");

    setTimeout(() => {
      setSyncProgress(45);
      setSyncStageText("Validating UIDAI PKI Digital Signatures...");
    }, 700);

    setTimeout(() => {
      setSyncProgress(80);
      setSyncStageText("Retrieving cryptographically verified certificates...");
    }, 1400);

    setTimeout(async () => {
      try {
        // Send request to PAS DigiLocker Import API
        const res = await fetch("/api/digilocker/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selectedCertificates: selectedDocs,
            aadhaarNumber: "XXXX-XXXX-9021",
            citizenName,
          }),
        });

        const data = await res.json();
        setSyncProgress(100);
        setSyncStageText("Verification Complete!");
        setStep(5);

        if (data.documents) {
          onSuccess(data.documents);
        }
      } catch (err) {
        console.error("Import error:", err);
        setStep(3);
        alert("Failed to connect to DigiLocker API gateway. Please retry.");
      }
    }, 2100);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* DigiLocker Brand Top Header */}
        <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center p-1 shadow-sm">
              <ShieldCheck className="w-7 h-7 text-[#0072CE]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wide text-white">DigiLocker</span>
                <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                  Govt Gateway
                </span>
              </div>
              <p className="text-[10px] text-blue-200">
                Towards Paperless Governance • Ministry of Electronics & IT (MeitY)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indian Tricolor Strip */}
        <div className="h-1.5 w-full flex">
          <div className="w-1/3 bg-[#FF9933]"></div>
          <div className="w-1/3 bg-white"></div>
          <div className="w-1/3 bg-[#138808]"></div>
        </div>

        {/* Breadcrumb Stepper */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span className={step >= 1 ? "text-blue-900 font-bold" : ""}>1. Sign In</span>
          <span>→</span>
          <span className={step >= 2 ? "text-blue-900 font-bold" : ""}>2. 2FA OTP</span>
          <span>→</span>
          <span className={step >= 3 ? "text-blue-900 font-bold" : ""}>3. Authorize</span>
          <span>→</span>
          <span className={step >= 5 ? "text-emerald-700 font-bold" : ""}>4. Verified</span>
        </div>

        {/* STEP 1: AUTHENTICATION */}
        {step === 1 && (
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Sign in to your DigiLocker Account
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Passport Seva Kendra requests secure access to your verified repository.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                Aadhaar Number or Registered Mobile
              </label>
              <input
                type="text"
                value={aadhaarOrMobile}
                onChange={(e) => setAadhaarOrMobile(e.target.value)}
                placeholder="Enter 12-digit Aadhaar / Mobile"
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Pre-filled with citizen credentials for seamless simulation.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                6-Digit Security PIN
              </label>
              <input
                type="password"
                maxLength={6}
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value)}
                placeholder="••••••"
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-xs font-medium tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
              <span className="text-[10px] text-emerald-700 font-medium mt-1 block">
                Demo Security PIN: 123456
              </span>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 flex items-start gap-2">
              <Lock className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <span>
                Your credentials are encrypted using 256-bit TLS protocol directly with the Government DigiLocker gateway.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#002B49] text-white rounded-lg text-xs font-bold hover:bg-[#003b66] transition flex items-center justify-center gap-2 shadow"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying Credentials...
                </>
              ) : (
                <>
                  Sign In to DigiLocker
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 2-FACTOR OTP VERIFICATION */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="p-6 space-y-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2 text-[#002B49]">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Two-Factor Aadhaar OTP
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                A 6-digit OTP has been sent to Aadhaar-linked mobile ending in <strong>******4589</strong>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 text-center">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="482910"
                required
                className="w-full px-3 py-3 border-2 border-blue-900 rounded-lg text-center text-lg font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                <span>Simulation Demo Code: <strong>482910</strong></span>
                {otpTimer > 0 ? (
                  <span>Resend in {otpTimer}s</span>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => setOtpTimer(30)}
                    className="text-blue-900 font-bold hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#002B49] text-white rounded-lg text-xs font-bold hover:bg-[#003b66] transition flex items-center justify-center gap-2 shadow"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Validating OTP...
                </>
              ) : (
                <>
                  Verify OTP & Proceed
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: CONSENT & DOCUMENT SELECTION */}
        {step === 3 && (
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Authorized Issued Certificates
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                The following digitally signed records were retrieved from your Government DigiLocker account. Select documents to attach to your passport application:
              </p>
            </div>

            <div className="space-y-3">
              {/* Document 1: UIDAI e-Aadhaar */}
              <label className="p-3.5 border-2 border-emerald-500 bg-emerald-50/50 rounded-xl flex items-start gap-3 cursor-pointer hover:bg-emerald-50 transition">
                <input
                  type="checkbox"
                  checked={selectedDocs.aadhaar}
                  onChange={(e) => setSelectedDocs({ ...selectedDocs, aadhaar: e.target.checked })}
                  className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      Aadhaar Card (UIDAI)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white uppercase">
                      Recommended
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    Issuer: <strong>Unique Identification Authority of India</strong>
                  </p>
                  <p className="text-emerald-800 font-medium text-[11px] mt-1">
                    ✓ Valid for Proof of Identity (POI), Present Address (POA), and Date of Birth (DOB).
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span>Aadhaar: XXXX-XXXX-9021</span>
                    <span>•</span>
                    <span>DigiLocker URI: in.gov.uidai-aadhaar</span>
                  </div>
                </div>
              </label>

              {/* Document 2: CBSE Class X Certificate */}
              <label className="p-3.5 border border-slate-200 bg-slate-50/50 rounded-xl flex items-start gap-3 cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={selectedDocs.classX}
                  onChange={(e) => setSelectedDocs({ ...selectedDocs, classX: e.target.checked })}
                  className="mt-1 rounded text-blue-900 focus:ring-blue-900"
                />
                <div className="text-xs flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      Class X Passing Certificate & Marksheet
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                      Non-ECR Proof
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    Issuer: <strong>Central Board of Secondary Education (CBSE)</strong>
                  </p>
                  <p className="text-blue-900 font-medium text-[11px] mt-1">
                    ✓ Valid for Non-ECR Category & Municipal Date of Birth proof.
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span>Roll: 6149021 (Passing Year: 2014)</span>
                    <span>•</span>
                    <span>URI: in.gov.cbse-marksheet</span>
                  </div>
                </div>
              </label>

              {/* Document 3: PAN Card */}
              <label className="p-3.5 border border-slate-200 bg-slate-50/50 rounded-xl flex items-start gap-3 cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={selectedDocs.pan}
                  onChange={(e) => setSelectedDocs({ ...selectedDocs, pan: e.target.checked })}
                  className="mt-1 rounded text-blue-900 focus:ring-blue-900"
                />
                <div className="text-xs flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      PAN Verification Record (ITD)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      Optional
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    Issuer: <strong>Income Tax Department (ITD) / NSDL</strong>
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span>PAN: ABCDE1234F</span>
                    <span>•</span>
                    <span>URI: in.gov.pan-verification</span>
                  </div>
                </div>
              </label>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Counter A Exemption:</strong> Importing UIDAI e-Aadhaar waives physical document checking at Regional Passport Office Counter A.
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 px-4 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={!selectedDocs.aadhaar && !selectedDocs.classX && !selectedDocs.pan}
                className="w-2/3 py-2.5 px-4 bg-[#002B49] text-white rounded-lg text-xs font-bold hover:bg-[#003b66] disabled:opacity-50 transition flex items-center justify-center gap-2 shadow"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Authorize & Fetch from DigiLocker
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REAL-TIME NATIONAL GATEWAY VERIFICATION ANIMATION */}
        {step === 4 && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-blue-50 text-[#002B49] rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Connecting to National e-Governance Gateway...
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {syncStageText}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${syncProgress}%` }}
              ></div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              SHA-256 Checksum Validation • Section 5A IT Act 2000
            </div>
          </div>
        )}

        {/* STEP 5: SUCCESSFUL IMPORT CONFIRMATION */}
        {step === 5 && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                National Gateway Sync Successful
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">
                Documents Verified & Linked
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                Your <strong>UIDAI e-Aadhaar</strong> and educational certificates have been cryptographically verified and attached to your passport application.
              </p>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Verification Source:</span>
                <span className="font-bold text-emerald-950">DigiLocker / UIDAI Gateway</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Counter A Status:</span>
                <span className="font-bold text-emerald-700">Physical Verification Bypassed</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Digital Seal:</span>
                <span className="font-mono text-emerald-900">PKI VALID (SHA-256)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition shadow"
            >
              Return to Document Locker
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
