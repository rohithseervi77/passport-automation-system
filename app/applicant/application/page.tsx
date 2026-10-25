"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  User, 
  Users, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldAlert, 
  UploadCloud, 
  CheckSquare, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Printer, 
  ExternalLink,
  Trash2,
  FileCheck
} from "lucide-react";

export default function ApplicantApplicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [applicant, setApplicant] = useState<any>(null);
  const [existingApp, setExistingApp] = useState<any>(null);
  const [submittedARN, setSubmittedARN] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Step 1: Passport Type
  const [serviceType, setServiceType] = useState("FRESH"); // FRESH, REISSUE
  const [applicationCategory, setApplicationCategory] = useState("NORMAL"); // NORMAL, TATKAAL
  const [bookletType, setBookletType] = useState("36_PAGES"); // 36_PAGES, 60_PAGES
  const [rpoLocation, setRpoLocation] = useState("RPO Chennai");

  // Step 2: Applicant Details
  const [givenName, setGivenName] = useState("");
  const [surname, setSurname] = useState("");
  const [dob, setDob] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [gender, setGender] = useState("Male");
  const [maritalStatus, setMaritalStatus] = useState("Single");
  const [citizenship, setCitizenship] = useState("By Birth");
  const [pan, setPan] = useState("");
  const [voterId, setVoterId] = useState("");
  const [employmentType, setEmploymentType] = useState("Private Sector");
  const [educationalQualification, setEducationalQualification] = useState("Graduate & Above");
  const [visibleIdentificationMark, setVisibleIdentificationMark] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");

  // Step 3: Family Details
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [spouseName, setSpouseName] = useState("");
  const [legalGuardianName, setLegalGuardianName] = useState("");

  // Step 4: Address Details
  const [presentAddressLine1, setPresentAddressLine1] = useState("");
  const [presentAddressLine2, setPresentAddressLine2] = useState("");
  const [presentCity, setPresentCity] = useState("");
  const [presentDistrict, setPresentDistrict] = useState("");
  const [presentState, setPresentState] = useState("Tamil Nadu");
  const [presentPinCode, setPresentPinCode] = useState("");
  const [policeStation, setPoliceStation] = useState("Central Division Police Station");
  const [isPermanentSame, setIsPermanentSame] = useState(true);
  const [permanentAddress, setPermanentAddress] = useState("");

  // Step 5: Emergency Contact
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("Parent");
  const [emergencyMobile, setEmergencyMobile] = useState("");
  const [emergencyEmail, setEmergencyEmail] = useState("");
  const [emergencyAddress, setEmergencyAddress] = useState("");

  // Step 6: Previous Passport (for Re-issue)
  const [hasPreviousPassport, setHasPreviousPassport] = useState(false);
  const [prevPassportNumber, setPrevPassportNumber] = useState("");
  const [prevIssueDate, setPrevIssueDate] = useState("");
  const [prevExpiryDate, setPrevExpiryDate] = useState("");
  const [prevPlaceOfIssue, setPrevPlaceOfIssue] = useState("");

  // Step 7: Other Details & Declarations
  const [hasCriminalRecord, setHasCriminalRecord] = useState(false);
  const [criminalRecordDetails, setCriminalRecordDetails] = useState("");
  const [hasPendingProceedings, setHasPendingProceedings] = useState(false);
  const [pendingProceedingsDetails, setPendingProceedingsDetails] = useState("");
  const [hasLostPassport, setHasLostPassport] = useState(false);
  const [lostPassportDetails, setLostPassportDetails] = useState("");

  // Step 8: Document Uploads
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: { name: string; size: string; status: string } }>({
    "Proof of Address": { name: "electricity_bill_utility.pdf", size: "1.4 MB", status: "Uploaded" },
    "Proof of Date of Birth": { name: "birth_certificate_municipal.pdf", size: "850 KB", status: "Uploaded" },
    "Identity Proof": { name: "aadhaar_card_front_back.pdf", size: "1.1 MB", status: "Uploaded" },
  });

  // Step 9: Declaration
  const [confirmedDeclaration, setConfirmedDeclaration] = useState(false);

  // Upgraded PAS Workflows: Minor, Re-issue reason, Tatkaal
  const [reissueReason, setReissueReason] = useState("EXPIRING_SOON");
  const [isMinor, setIsMinor] = useState(false);
  const [parentConsent, setParentConsent] = useState(false);

  // Clarification reply if required
  const [clarificationResponse, setClarificationResponse] = useState("");

  // Load existing application if available
  useEffect(() => {
    async function fetchApplicationData() {
      try {
        const res = await fetch("/api/applicant/application");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.applicant) {
          setApplicant(data.applicant);
          if (data.applicant.name) {
            const parts = data.applicant.name.split(" ");
            setGivenName(parts[0] || "");
            setSurname(parts.slice(1).join(" ") || "");
          }
          if (data.applicant.dob) {
            setDob(new Date(data.applicant.dob).toISOString().split("T")[0]);
          }
          if (data.applicant.address) {
            setPresentAddressLine1(data.applicant.address);
          }
        }
        if (data.application) {
          const app = data.application;
          setExistingApp(app);
          if (app.status !== "DRAFT") {
            setSubmittedARN(app.applicationId);
          }
          if (app.serviceType) setServiceType(app.serviceType);
          if (app.applicationCategory) setApplicationCategory(app.applicationCategory);
          if (app.bookletType) setBookletType(app.bookletType);
          if (app.rpoLocation) setRpoLocation(app.rpoLocation);
          if (app.givenName) setGivenName(app.givenName);
          if (app.surname) setSurname(app.surname);
          if (app.dob) setDob(new Date(app.dob).toISOString().split("T")[0]);
          if (app.gender) setGender(app.gender);
          if (app.placeOfBirth) setPlaceOfBirth(app.placeOfBirth);
          if (app.maritalStatus) setMaritalStatus(app.maritalStatus);
          if (app.citizenship) setCitizenship(app.citizenship);
          if (app.pan) setPan(app.pan);
          if (app.voterId) setVoterId(app.voterId);
          if (app.employmentType) setEmploymentType(app.employmentType);
          if (app.educationalQualification) setEducationalQualification(app.educationalQualification);
          if (app.visibleIdentificationMark) setVisibleIdentificationMark(app.visibleIdentificationMark);
          if (app.aadhaarNumber) setAadhaarNumber(app.aadhaarNumber);
          // Family
          if (app.fatherName) setFatherName(app.fatherName);
          if (app.motherName) setMotherName(app.motherName);
          if (app.spouseName) setSpouseName(app.spouseName);
          if (app.legalGuardianName) setLegalGuardianName(app.legalGuardianName);
          // Address
          if (app.presentAddressLine1) setPresentAddressLine1(app.presentAddressLine1);
          if (app.presentAddressLine2) setPresentAddressLine2(app.presentAddressLine2);
          if (app.presentCity) setPresentCity(app.presentCity);
          if (app.presentDistrict) setPresentDistrict(app.presentDistrict);
          if (app.presentState) setPresentState(app.presentState);
          if (app.presentPinCode) setPresentPinCode(app.presentPinCode);
          if (app.policeStation) setPoliceStation(app.policeStation);
          if (app.isPermanentSame !== undefined) setIsPermanentSame(app.isPermanentSame);
          if (app.permanentAddress) setPermanentAddress(app.permanentAddress);
          // Emergency
          if (app.emergencyName) setEmergencyName(app.emergencyName);
          if (app.emergencyRelationship) setEmergencyRelationship(app.emergencyRelationship);
          if (app.emergencyMobile) setEmergencyMobile(app.emergencyMobile);
          if (app.emergencyEmail) setEmergencyEmail(app.emergencyEmail);
          if (app.emergencyAddress) setEmergencyAddress(app.emergencyAddress);
          // Previous
          if (app.hasPreviousPassport) setHasPreviousPassport(app.hasPreviousPassport);
          if (app.prevPassportNumber) setPrevPassportNumber(app.prevPassportNumber);
          if (app.prevIssueDate) setPrevIssueDate(new Date(app.prevIssueDate).toISOString().split("T")[0]);
          if (app.prevExpiryDate) setPrevExpiryDate(new Date(app.prevExpiryDate).toISOString().split("T")[0]);
          if (app.prevPlaceOfIssue) setPrevPlaceOfIssue(app.prevPlaceOfIssue);
          // Declarations
          if (app.hasCriminalRecord !== undefined) setHasCriminalRecord(app.hasCriminalRecord);
          if (app.criminalRecordDetails) setCriminalRecordDetails(app.criminalRecordDetails);
          if (app.hasPendingProceedings !== undefined) setHasPendingProceedings(app.hasPendingProceedings);
          if (app.pendingProceedingsDetails) setPendingProceedingsDetails(app.pendingProceedingsDetails);
          if (app.hasLostPassport !== undefined) setHasLostPassport(app.hasLostPassport);
          if (app.lostPassportDetails) setLostPassportDetails(app.lostPassportDetails);
          if (app.confirmedDeclaration !== undefined) setConfirmedDeclaration(app.confirmedDeclaration);
          if (app.clarificationResponse) setClarificationResponse(app.clarificationResponse);
          // Resume saved draft step and upgraded attributes
          if (app.reissueReason) setReissueReason(app.reissueReason);
          if (app.isMinor !== undefined) setIsMinor(app.isMinor);
          if (app.parentConsent !== undefined) setParentConsent(app.parentConsent);
          if (app.draftStep && app.status === "DRAFT") {
            setCurrentStep(Math.min(Math.max(app.draftStep, 1), 9));
          }
        }
      } catch (err) {
        console.error("Load application error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchApplicationData();
  }, [router]);

  // Validation per step
  function validateStep(step: number): boolean {
    setError("");
    if (step === 1) {
      if (!serviceType || !applicationCategory || !bookletType) {
        setError("Please choose all service options before proceeding.");
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!givenName.trim() || givenName.trim().length < 2) {
        setError("Please enter a valid Given Name (at least 2 letters).");
        return false;
      }
      if (!dob) {
        setError("Date of Birth is required.");
        return false;
      }
      const birth = new Date(dob);
      if (isNaN(birth.getTime()) || birth >= new Date()) {
        setError("Date of Birth cannot be today or in the future.");
        return false;
      }
      if (!placeOfBirth.trim()) {
        setError("Place of Birth is required.");
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!fatherName.trim() && !motherName.trim() && !legalGuardianName.trim()) {
        setError("Please enter at least Father's or Mother's or Legal Guardian's name.");
        return false;
      }
      return true;
    }
    if (step === 4) {
      if (!presentAddressLine1.trim() || !presentCity.trim()) {
        setError("Present address line 1 and Village/Town/City are required.");
        return false;
      }
      const pinRegex = /^[1-9][0-9]{5}$/;
      if (!presentPinCode.trim() || !pinRegex.test(presentPinCode.trim())) {
        setError("Please enter a valid 6-digit Indian PIN code (e.g. 600001).");
        return false;
      }
      return true;
    }
    if (step === 5) {
      if (!emergencyName.trim()) {
        setError("Emergency contact person name is required.");
        return false;
      }
      const digits = emergencyMobile.replace(/\D/g, "");
      if (digits.length < 10) {
        setError("Please enter a valid 10-digit mobile number for emergency contact.");
        return false;
      }
      return true;
    }
    if (step === 6) {
      if (serviceType === "REISSUE") {
        if (!prevPassportNumber.trim()) {
          setError("Previous Passport Number is required for Re-issue applications.");
          return false;
        }
      }
      return true;
    }
    if (step === 7) {
      if (isMinor && !parentConsent) {
        setError("Parental consent (Annexure D undertaking) is mandatory for minor applicants.");
        return false;
      }
      return true;
    }
    if (step === 8) {
      if (!uploadedDocs["Proof of Address"] || !uploadedDocs["Identity Proof"]) {
        setError("Mandatory verification documents (Proof of Address & Identity) must be attached.");
        return false;
      }
      return true;
    }
    return true;
  }

  function handleNext() {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 9));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handlePrev() {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave(action: "SAVE_DRAFT" | "SUBMIT") {
    setError("");
    setMessage("");

    if (action === "SUBMIT") {
      if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4) || !validateStep(5) || !validateStep(6) || !validateStep(8)) {
        return;
      }
      if (!confirmedDeclaration) {
        setError("You must confirm and check the final verification declaration before submission.");
        return;
      }
      setSubmitting(true);
    } else {
      setSavingDraft(true);
    }

    try {
      const payload = {
        action,
        serviceType,
        applicationCategory,
        bookletType,
        rpoLocation,
        givenName,
        surname,
        gender,
        dob,
        placeOfBirth,
        maritalStatus,
        citizenship,
        pan,
        voterId,
        employmentType,
        educationalQualification,
        visibleIdentificationMark,
        aadhaarNumber,
        fatherName,
        motherName,
        spouseName,
        legalGuardianName,
        presentAddressLine1,
        presentAddressLine2,
        presentCity,
        presentDistrict,
        presentState,
        presentPinCode,
        policeStation,
        isPermanentSame,
        permanentAddress: isPermanentSame ? "" : permanentAddress,
        emergencyName,
        emergencyRelationship,
        emergencyMobile,
        emergencyEmail,
        emergencyAddress,
        hasPreviousPassport: hasPreviousPassport || serviceType === "REISSUE",
        prevPassportNumber,
        prevIssueDate,
        prevExpiryDate,
        prevPlaceOfIssue,
        hasCriminalRecord,
        criminalRecordDetails,
        hasPendingProceedings,
        pendingProceedingsDetails,
        hasLostPassport,
        lostPassportDetails,
        confirmedDeclaration,
        clarificationResponse,
        // Upgraded state fields
        draftStep: currentStep,
        reissueReason: serviceType === "REISSUE" ? reissueReason : null,
        isMinor,
        parentConsent,
      };

      const res = await fetch("/api/applicant/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to process application.");
        return;
      }

      if (action === "SUBMIT") {
        setSubmittedARN(data.arn);
        setMessage("Application successfully submitted! Your Application Reference Number (ARN) has been generated.");
      } else {
        setMessage("Draft saved successfully. You can return and complete it at any time.");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Submission error:", err);
      setError("Network error while connecting to application server.");
    } finally {
      setSubmitting(false);
      setSavingDraft(false);
    }
  }

  // File upload simulator
  function handleSimulatedFileUpload(docCategory: string, file: File | null) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit. Please upload a smaller document.");
      return;
    }
    const sizeStr = `${(file.size / 1024).toFixed(0)} KB`;
    setUploadedDocs((prev) => ({
      ...prev,
      [docCategory]: {
        name: file.name,
        size: sizeStr,
        status: "Uploaded",
      },
    }));
    setMessage(`Attached ${file.name} for ${docCategory}.`);
  }

  function handleRemoveDoc(docCategory: string) {
    setUploadedDocs((prev) => {
      const copy = { ...prev };
      delete copy[docCategory];
      return copy;
    });
  }

  const stepsList = [
    { num: 1, title: "Passport Type" },
    { num: 2, title: "Applicant Details" },
    { num: 3, title: "Family Details" },
    { num: 4, title: "Address Details" },
    { num: 5, title: "Emergency Contact" },
    { num: 6, title: "Previous Passport" },
    { num: 7, title: "Other Details" },
    { num: 8, title: "Documents" },
    { num: 9, title: "Preview & Submit" },
  ];

  const filledBlocks = Math.round((currentStep / 9) * 16);
  const asciiBar = "█".repeat(filledBlocks) + "░".repeat(16 - filledBlocks);
  const progressPercent = Math.round((currentStep / 9) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar role="APPLICANT" userName="Loading..." />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-900 border-r-transparent" />
            <p className="text-xs font-semibold text-slate-600">Loading passport application wizard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar role="APPLICANT" userName={applicant?.name || "Applicant"} />

      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-6">

          {/* Top Title Banner */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                Official Form 1 • Online Passport Application
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                Apply for Passport / Service Re-issue
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-step digital application wizard with verification, preview, and automatic ARN generation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSave("SAVE_DRAFT")}
                disabled={savingDraft || submitting}
                className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-blue-900" />
                <span>{savingDraft ? "Saving..." : "Save Draft"}</span>
              </button>
              <Link
                href="/applicant/dashboard"
                className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Submission Success Alert with ARN */}
          {submittedARN && (
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-lg p-6 shadow-xs text-slate-900">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-emerald-950">
                      Application Submitted Successfully
                    </h2>
                    <span className="font-mono text-xs font-bold px-3 py-1 rounded bg-emerald-200 text-emerald-900 border border-emerald-300">
                      ARN: {submittedARN}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    Your application has been registered into the central processing queue with initial status <strong>SUBMITTED</strong>. Please proceed to pay the fee and schedule your PSK biometric appointment.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <Link
                      href="/applicant/payment"
                      className="inline-flex items-center gap-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 text-xs font-bold shadow-xs transition"
                    >
                      <span>Proceed to Fee Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/track?arn=${submittedARN}`}
                      className="inline-flex items-center gap-2 rounded border border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-50 px-3.5 py-2 text-xs font-semibold shadow-xs transition"
                    >
                      <span>Public Application Tracker</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold shadow-xs transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Summary Slip</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Clarification Notice Banner if Status is CLARIFICATION_REQUIRED */}
          {existingApp?.status === "CLARIFICATION_REQUIRED" && (
            <div className="bg-rose-50 border border-rose-300 rounded-lg p-5 text-xs text-rose-950">
              <h3 className="font-bold text-sm text-rose-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-700" />
                <span>Passport Officer Clarification Remarks</span>
              </h3>
              <p className="mt-1 text-slate-800 font-mono bg-white p-3 rounded border border-rose-200">
                {existingApp.clarificationReason}
              </p>
              <div className="mt-3">
                <label className="block font-semibold text-slate-900 mb-1">
                  Your Response / Explanation to Passport Officer:
                </label>
                <textarea
                  value={clarificationResponse}
                  onChange={(e) => setClarificationResponse(e.target.value)}
                  rows={2}
                  placeholder="Explain any updated details or describe attached supporting evidence..."
                  className="w-full rounded border border-rose-300 p-2 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          )}

          {/* Notifications / Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-900 px-4 py-3 rounded text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
              <span>{error}</span>
            </div>
          )}
          {message && !submittedARN && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
              <span>{message}</span>
            </div>
          )}

          {/* Visual Application Progress Bar */}
          <div className="bg-slate-900 text-white rounded-lg p-3.5 border border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-slate-300">Application Progress:</span>
              <span className="font-mono text-emerald-400 font-bold tracking-widest text-sm bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {asciiBar}
              </span>
              <span className="font-bold text-amber-400">{progressPercent}%</span>
              <span className="text-slate-400 hidden sm:inline">
                (Step {currentStep} of 9 — {stepsList[currentStep - 1]?.title})
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isMinor && (
                <span className="bg-purple-900/80 text-purple-200 border border-purple-500/40 text-[10px] font-bold px-2 py-0.5 rounded">
                  Minor Applicant (&lt;18)
                </span>
              )}
              {applicationCategory === "TATKAAL" && (
                <span className="bg-amber-900/80 text-amber-200 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded">
                  ⚡ Tatkaal Priority
                </span>
              )}
              {serviceType === "REISSUE" && (
                <span className="bg-blue-900/80 text-blue-200 border border-blue-500/40 text-[10px] font-bold px-2 py-0.5 rounded">
                  Re-issue
                </span>
              )}
            </div>
          </div>

          {/* Wizard Step Progression Bar */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs overflow-x-auto">
            <div className="flex items-center min-w-[720px] justify-between">
              {stepsList.map((step) => {
                const isCurrent = currentStep === step.num;
                const isPassed = currentStep > step.num;
                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={() => {
                      if (step.num < currentStep || validateStep(currentStep)) {
                        setCurrentStep(step.num);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className={`flex items-center gap-2 text-xs font-semibold px-2 py-1.5 rounded transition ${
                      isCurrent
                        ? "bg-blue-900 text-white shadow-xs"
                        : isPassed
                        ? "text-emerald-700 hover:bg-emerald-50"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        isCurrent
                          ? "bg-white text-blue-900"
                          : isPassed
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isPassed ? "✓" : step.num}
                    </span>
                    <span className="whitespace-nowrap">{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wizard Body Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-xs">

            {/* STEP 1: PASSPORT TYPE */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-900" />
                    <span>Step 1 — Passport Type & Application Category</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select your service type, speed category, booklet capacity, and regional passport office jurisdiction.
                  </p>
                </div>

                {/* Service Type Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    1. Applying For
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label
                      onClick={() => setServiceType("FRESH")}
                      className={`cursor-pointer rounded-lg border p-4 text-xs flex flex-col justify-between transition ${
                        serviceType === "FRESH"
                          ? "border-blue-900 bg-blue-50/70 ring-1 ring-blue-900"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">Fresh Passport</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Standard</span>
                        </div>
                        <p className="text-slate-600 mt-2 leading-relaxed">
                          For citizens applying for an Indian passport for the very first time. No previous passport number required.
                        </p>
                      </div>
                    </label>

                    <label
                      onClick={() => setServiceType("REISSUE")}
                      className={`cursor-pointer rounded-lg border p-4 text-xs flex flex-col justify-between transition ${
                        serviceType === "REISSUE"
                          ? "border-blue-900 bg-blue-50/70 ring-1 ring-blue-900"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">Re-issue Passport</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">Renewal / Change</span>
                        </div>
                        <p className="text-slate-600 mt-2 leading-relaxed">
                          For citizens renewing an expired passport, replacing exhausted visa pages, or updating name/address.
                        </p>
                      </div>
                    </label>
                  </div>

                  {serviceType === "REISSUE" && (
                    <div className="mt-3 bg-amber-50/80 border border-amber-200 rounded-lg p-4 space-y-2">
                      <label className="block text-xs font-bold text-amber-950">
                        Reason for Re-issue of Passport *
                      </label>
                      <select
                        value={reissueReason}
                        onChange={(e) => setReissueReason(e.target.value)}
                        className="w-full rounded border border-amber-300 p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="EXPIRING_SOON">Validity Expired within 3 years / Due to Expire</option>
                        <option value="EXPIRED">Validity Expired more than 3 years ago</option>
                        <option value="PAGES_EXHAUSTED">Exhaustion of Pages in Booklet</option>
                        <option value="LOST">Lost / Stolen Passport Booklet (Requires Police Report)</option>
                        <option value="DAMAGED">Damaged / Mutilated Passport Booklet</option>
                        <option value="CHANGE_OF_ADDRESS">Change in Existing Personal Particulars (Name / Address / Marital Status)</option>
                        <option value="OTHER">Other Reasons</option>
                      </select>
                      <span className="text-[11px] text-amber-800 block">
                        Note: Existing old passport booklet must be surrendered for cancellation at the PSK counter during physical verification.
                      </span>
                    </div>
                  )}
                </div>

                {/* Application Scheme */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    2. Type of Application Category
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label
                      onClick={() => setApplicationCategory("NORMAL")}
                      className={`cursor-pointer rounded-lg border p-4 text-xs transition ${
                        applicationCategory === "NORMAL"
                          ? "border-blue-900 bg-blue-50/70 ring-1 ring-blue-900"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-sm text-slate-900">
                        <span>Normal Quota</span>
                        <span className="text-xs text-blue-900 font-mono">₹1,500 base</span>
                      </div>
                      <p className="text-slate-600 mt-1.5 leading-relaxed">
                        Standard processing timeframe (15–30 days). Standard police verification before dispatch.
                      </p>
                    </label>

                    <label
                      onClick={() => setApplicationCategory("TATKAAL")}
                      className={`cursor-pointer rounded-lg border p-4 text-xs transition ${
                        applicationCategory === "TATKAAL"
                          ? "border-blue-900 bg-blue-50/70 ring-1 ring-blue-900"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-sm text-slate-900">
                        <span className="text-amber-900">Tatkaal Fast-Track</span>
                        <span className="text-xs text-amber-900 font-mono font-bold">₹3,500 total</span>
                      </div>
                      <p className="text-slate-600 mt-1.5 leading-relaxed">
                        Expedited issuance (1–3 working days) for urgent international travel. Strict verification requirements.
                      </p>
                    </label>
                  </div>

                  {applicationCategory === "TATKAAL" && (
                    <div className="mt-3 bg-amber-50 border border-amber-300 rounded-lg p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Tatkaal Fast-Track Processing Notice:</span>
                        <p className="mt-0.5 text-amber-900 leading-relaxed">
                          Under the Tatkaal scheme, application review is expedited on a post-police verification basis. You will be required to submit Annexure F or 3 standard identity proofs at the PSK.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Booklet Type & RPO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      3. Type of Passport Booklet
                    </label>
                    <select
                      value={bookletType}
                      onChange={(e) => setBookletType(e.target.value)}
                      className="w-full rounded border border-slate-300 p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="36_PAGES">36 Pages (Standard Traveller — ₹1,500)</option>
                      <option value="60_PAGES">60 Pages (Frequent Flyer Jumbo Booklet — ₹2,000)</option>
                    </select>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      36 pages is recommended for tourists and students. 60 pages for frequent corporate flyers.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      4. Regional Passport Office (RPO) Jurisdiction
                    </label>
                    <select
                      value={rpoLocation}
                      onChange={(e) => setRpoLocation(e.target.value)}
                      className="w-full rounded border border-slate-300 p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="RPO Chennai">RPO Chennai (Tamil Nadu & Puducherry)</option>
                      <option value="RPO Bengaluru">RPO Bengaluru (Karnataka State)</option>
                      <option value="RPO Mumbai">RPO Mumbai (Maharashtra)</option>
                      <option value="RPO Delhi">RPO Delhi (NCR & Northern Division)</option>
                      <option value="RPO Kolkata">RPO Kolkata (West Bengal & North East)</option>
                    </select>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Determines the central adjudication office responsible for approval and courier dispatch.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: APPLICANT DETAILS */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-900" />
                    <span>Step 2 — Applicant Personal Particulars</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Provide exact legal names matching your municipal birth record or school matriculation marksheet.
                  </p>
                </div>

                {isMinor && (
                  <div className="bg-purple-50 border border-purple-300 rounded-lg p-3 text-xs text-purple-950 flex items-center gap-2.5">
                    <span className="font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded text-[10px] uppercase shrink-0">
                      Minor Applicant (&lt;18)
                    </span>
                    <span>
                      Applicant is under 18 years of age. Father/Mother/Guardian particulars are mandatory in Step 3 and Annexure D parental consent is required in Step 7.
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Given Name (First & Middle Name) *
                    </label>
                    <input
                      type="text"
                      value={givenName}
                      onChange={(e) => setGivenName(e.target.value)}
                      placeholder="e.g. Aarav"
                      className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Surname (Last Name)
                    </label>
                    <input
                      type="text"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      placeholder="e.g. Sharma"
                      className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={dob}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDob(val);
                        if (val) {
                          const birthDate = new Date(val);
                          if (!isNaN(birthDate.getTime())) {
                            const age = (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
                            setIsMinor(age < 18);
                          }
                        }
                      }}
                      className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gender *
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full rounded border border-slate-300 p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Transgender</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Place of Birth (Village / Town / City) *
                    </label>
                    <input
                      type="text"
                      value={placeOfBirth}
                      onChange={(e) => setPlaceOfBirth(e.target.value)}
                      placeholder="e.g. Chennai"
                      className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Marital Status *
                    </label>
                    <select
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value)}
                      className="w-full rounded border border-slate-300 p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Citizenship of India By
                    </label>
                    <select
                      value={citizenship}
                      onChange={(e) => setCitizenship(e.target.value)}
                      className="w-full rounded border border-slate-300 p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="By Birth">By Birth</option>
                      <option value="By Descent">By Descent</option>
                      <option value="By Registration / Naturalization">By Registration / Naturalization</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      PAN Card Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={pan}
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Employment Type
                    </label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      className="w-full rounded border border-slate-300 p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="Private Sector">Private Sector</option>
                      <option value="Government / PSU">Government / PSU</option>
                      <option value="Self Employed">Self Employed</option>
                      <option value="Student">Student</option>
                      <option value="Homemaker">Homemaker</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Educational Qualification
                    </label>
                    <select
                      value={educationalQualification}
                      onChange={(e) => setEducationalQualification(e.target.value)}
                      className="w-full rounded border border-slate-300 p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="Graduate & Above">Graduate & Above (ECNR Eligible)</option>
                      <option value="10th Pass & Above">10th Pass & Above</option>
                      <option value="Between 7th and 9th">Between 7th and 9th Standard</option>
                      <option value="Below 7th Standard">Below 7th Standard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Visible Distinguishing Mark
                    </label>
                    <input
                      type="text"
                      value={visibleIdentificationMark}
                      onChange={(e) => setVisibleIdentificationMark(e.target.value)}
                      placeholder="e.g. Mole on right cheek or scar on forehead"
                      className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Aadhaar Number (Simulated / Demo)
                    </label>
                    <input
                      type="text"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value)}
                      placeholder="XXXX-XXXX-9102"
                      className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: FAMILY DETAILS */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-900" />
                    <span>Step 3 — Family Particulars</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Parents and spouse names will be printed on the back page of the passport booklet.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Father&apos;s Given Name *
                    </label>
                    <input
                      type="text"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="e.g. Dev Sharma"
                      className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mother&apos;s Given Name *
                    </label>
                    <input
                      type="text"
                      value={motherName}
                      onChange={(e) => setMotherName(e.target.value)}
                      placeholder="e.g. Sunita Sharma"
                      className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Spouse&apos;s Given Name (If Married)
                    </label>
                    <input
                      type="text"
                      value={spouseName}
                      onChange={(e) => setSpouseName(e.target.value)}
                      placeholder="Leave blank if unmarried"
                      className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Legal Guardian&apos;s Name (Where Applicable)
                    </label>
                    <input
                      type="text"
                      value={legalGuardianName}
                      onChange={(e) => setLegalGuardianName(e.target.value)}
                      placeholder="Optional"
                      className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 uppercase"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: ADDRESS DETAILS */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-900" />
                    <span>Step 4 — Present & Permanent Residential Address</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Police verification will be routed to the jurisdiction matching your present address.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      House No. and Street Name (Line 1) *
                    </label>
                    <input
                      type="text"
                      value={presentAddressLine1}
                      onChange={(e) => setPresentAddressLine1(e.target.value)}
                      placeholder="e.g. Flat 402, Green Valley Apartments, 12th Cross"
                      className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Locality / Area / Landmark (Line 2)
                    </label>
                    <input
                      type="text"
                      value={presentAddressLine2}
                      onChange={(e) => setPresentAddressLine2(e.target.value)}
                      placeholder="e.g. Near Central Park Metro Station"
                      className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Village / Town / City *
                      </label>
                      <input
                        type="text"
                        value={presentCity}
                        onChange={(e) => setPresentCity(e.target.value)}
                        placeholder="e.g. Chennai"
                        className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        District *
                      </label>
                      <input
                        type="text"
                        value={presentDistrict}
                        onChange={(e) => setPresentDistrict(e.target.value)}
                        placeholder="e.g. Chennai District"
                        className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        State *
                      </label>
                      <select
                        value={presentState}
                        onChange={(e) => setPresentState(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                      >
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Kerala">Kerala</option>
                        <option value="West Bengal">West Bengal</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        PIN Code (6 Digits) *
                      </label>
                      <input
                        type="text"
                        value={presentPinCode}
                        onChange={(e) => setPresentPinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="600028"
                        maxLength={6}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jurisdictional Police Station *
                      </label>
                      <select
                        value={policeStation}
                        onChange={(e) => setPoliceStation(e.target.value)}
                        className="w-full rounded border border-slate-300 p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                      >
                        <option value="Central Division Police Station (PS-CENTRAL)">Central Division Police Station (PS-CENTRAL)</option>
                        <option value="South Zone Police Station (PS-SOUTH)">South Zone Police Station (PS-SOUTH)</option>
                        <option value="North Division Police Station (PS-NORTH)">North Division Police Station (PS-NORTH)</option>
                        <option value="Airport Sub-Division Police Station (PS-AIRPORT)">Airport Sub-Division Police Station (PS-AIRPORT)</option>
                      </select>
                    </div>
                  </div>

                  {/* Permanent Address Checkbox */}
                  <div className="pt-3 border-t border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                      <input
                        type="checkbox"
                        checked={isPermanentSame}
                        onChange={(e) => setIsPermanentSame(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                      />
                      <span>Permanent Address is identical to Present Residential Address</span>
                    </label>

                    {!isPermanentSame && (
                      <div className="mt-3">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Permanent Address Particulars *
                        </label>
                        <textarea
                          rows={2}
                          value={permanentAddress}
                          onChange={(e) => setPermanentAddress(e.target.value)}
                          placeholder="Provide full permanent address including district, state and PIN..."
                          className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: EMERGENCY CONTACT */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-blue-900" />
                    <span>Step 5 — Emergency Contact Particulars</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Individual to be contacted by diplomatic missions or authorities in case of an emergency abroad.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Emergency Contact Name *
                    </label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="e.g. Ramesh Sharma"
                      className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Relationship with Applicant *
                    </label>
                    <select
                      value={emergencyRelationship}
                      onChange={(e) => setEmergencyRelationship(e.target.value)}
                      className="w-full rounded border border-slate-300 p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="Parent">Parent</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Child">Child</option>
                      <option value="Relative / Friend">Relative / Friend</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number (10 Digits) *
                    </label>
                    <input
                      type="tel"
                      value={emergencyMobile}
                      onChange={(e) => setEmergencyMobile(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={emergencyEmail}
                      onChange={(e) => setEmergencyEmail(e.target.value)}
                      placeholder="emergency.contact@example.com"
                      className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Emergency Contact Address
                    </label>
                    <input
                      type="text"
                      value={emergencyAddress}
                      onChange={(e) => setEmergencyAddress(e.target.value)}
                      placeholder="Complete residential address of emergency contact person"
                      className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: PREVIOUS PASSPORT */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-900" />
                    <span>Step 6 — Previous Passport Details</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Required for passport re-issue, renewal, or if you previously held an official / diplomatic booklet.
                  </p>
                </div>

                {serviceType === "FRESH" ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h3 className="font-bold text-sm text-slate-900">No Previous Passport Required</h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      You are applying under the <strong>Fresh Passport</strong> scheme. You do not hold an existing Indian passport booklet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                      <strong>Re-issue Requirement:</strong> Please enter the particulars exactly as printed on the identity page of your previous passport booklet.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Previous Passport Booklet Number *
                        </label>
                        <input
                          type="text"
                          value={prevPassportNumber}
                          onChange={(e) => setPrevPassportNumber(e.target.value.toUpperCase())}
                          placeholder="e.g. Z1234567"
                          maxLength={8}
                          className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Place of Issue
                        </label>
                        <input
                          type="text"
                          value={prevPlaceOfIssue}
                          onChange={(e) => setPrevPlaceOfIssue(e.target.value)}
                          placeholder="e.g. RPO Chennai"
                          className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Date of Issue
                        </label>
                        <input
                          type="date"
                          value={prevIssueDate}
                          onChange={(e) => setPrevIssueDate(e.target.value)}
                          className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Date of Expiry
                        </label>
                        <input
                          type="date"
                          value={prevExpiryDate}
                          onChange={(e) => setPrevExpiryDate(e.target.value)}
                          className="w-full rounded border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 7: OTHER DETAILS & DECLARATIONS */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-blue-900" />
                    <span>Step 7 — Statutory Declarations & Background Information</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Academic-simulation statutory declarations required under Section 6 of the Passports Act, 1967.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Q1: Criminal Record */}
                  <div className="p-4 rounded border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-semibold text-slate-900 leading-relaxed">
                        1. Have you ever been convicted by a court in India for any offence involving moral turpitude or sentenced to imprisonment?
                      </p>
                      <div className="flex items-center gap-3 shrink-0">
                        <label className="flex items-center gap-1 cursor-pointer font-bold">
                          <input
                            type="radio"
                            name="criminalRecord"
                            checked={hasCriminalRecord}
                            onChange={() => setHasCriminalRecord(true)}
                          />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer font-bold">
                          <input
                            type="radio"
                            name="criminalRecord"
                            checked={!hasCriminalRecord}
                            onChange={() => setHasCriminalRecord(false)}
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>
                    {hasCriminalRecord && (
                      <input
                        type="text"
                        value={criminalRecordDetails}
                        onChange={(e) => setCriminalRecordDetails(e.target.value)}
                        placeholder="Provide case details, court name, and year of conviction..."
                        className="w-full rounded border border-slate-300 p-2 text-xs bg-white text-slate-900 mt-2"
                      />
                    )}
                  </div>

                  {/* Q2: Pending Proceedings */}
                  <div className="p-4 rounded border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-semibold text-slate-900 leading-relaxed">
                        2. Are there any pending criminal proceedings against you before any Court of Law in India?
                      </p>
                      <div className="flex items-center gap-3 shrink-0">
                        <label className="flex items-center gap-1 cursor-pointer font-bold">
                          <input
                            type="radio"
                            name="pendingProceedings"
                            checked={hasPendingProceedings}
                            onChange={() => setHasPendingProceedings(true)}
                          />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer font-bold">
                          <input
                            type="radio"
                            name="pendingProceedings"
                            checked={!hasPendingProceedings}
                            onChange={() => setHasPendingProceedings(false)}
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>
                    {hasPendingProceedings && (
                      <input
                        type="text"
                        value={pendingProceedingsDetails}
                        onChange={(e) => setPendingProceedingsDetails(e.target.value)}
                        placeholder="Provide Court name, FIR number, and current status of proceedings..."
                        className="w-full rounded border border-slate-300 p-2 text-xs bg-white text-slate-900 mt-2"
                      />
                    )}
                  </div>

                  {/* Q3: Lost Passport */}
                  <div className="p-4 rounded border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-semibold text-slate-900 leading-relaxed">
                        3. Have you ever applied for or been granted a passport that was reported lost, stolen, or damaged?
                      </p>
                      <div className="flex items-center gap-3 shrink-0">
                        <label className="flex items-center gap-1 cursor-pointer font-bold">
                          <input
                            type="radio"
                            name="lostPassport"
                            checked={hasLostPassport}
                            onChange={() => setHasLostPassport(true)}
                          />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer font-bold">
                          <input
                            type="radio"
                            name="lostPassport"
                            checked={!hasLostPassport}
                            onChange={() => setHasLostPassport(false)}
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>
                    {hasLostPassport && (
                      <input
                        type="text"
                        value={lostPassportDetails}
                        onChange={(e) => setLostPassportDetails(e.target.value)}
                        placeholder="Provide details of police complaint and circumstances..."
                        className="w-full rounded border border-slate-300 p-2 text-xs bg-white text-slate-900 mt-2"
                      />
                    )}
                  </div>

                  {/* Minor Applicant: Annexure D Undertaking */}
                  {isMinor && (
                    <div className="p-4 rounded border-2 border-purple-300 bg-purple-50/70 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <CheckSquare className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                          <p className="font-bold text-sm text-purple-950">
                            Annexure D — Parental / Legal Guardian Consent Declaration (Mandatory for Minors)
                          </p>
                          <p className="text-purple-900 leading-relaxed text-xs">
                            I/we, the parents/legal guardian of the minor applicant, solemnly affirm that the particulars given in this application are true and correct. I/we give our irrevocable consent to the issuance of an Indian passport to the minor.
                          </p>
                          <label className="flex items-center gap-2 font-bold text-purple-950 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              checked={parentConsent}
                              onChange={(e) => setParentConsent(e.target.checked)}
                              className="h-4 w-4 rounded border-purple-400 text-purple-900 focus:ring-purple-500"
                            />
                            <span>I/we confirm parental consent under Annexure D *</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tatkaal Applicant: Annexure F Undertaking */}
                  {applicationCategory === "TATKAAL" && (
                    <div className="p-4 rounded border border-amber-300 bg-amber-50/70 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-sm text-amber-950">
                            Annexure F — Tatkaal Scheme Expedited Processing Undertaking
                          </p>
                          <p className="text-amber-900 mt-1 leading-relaxed text-xs">
                            I confirm that I urgently require this passport under the Tatkaal scheme and affirm that no criminal proceedings or adverse reports are pending against me. I will submit Annexure F verification certificate or 3 prescribed standard identity proofs at the PSK.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 8: DOCUMENT CHECKLIST & ATTACHMENTS */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-blue-900" />
                    <span>Step 8 — Verification Document Checklist & Upload</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Attach electronic copies (PDF/JPG/PNG up to 5MB each) to speed up PSK scrutiny.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { category: "Proof of Address", desc: "Electricity bill, water bill, or bank passbook copy", mandatory: true },
                    { category: "Proof of Date of Birth", desc: "Municipal birth certificate or 10th standard marksheet", mandatory: true },
                    { category: "Identity Proof", desc: "UIDAI Aadhaar Card or Voter Identity Card copy", mandatory: true },
                    ...(serviceType === "REISSUE" ? [{ category: "Previous Passport", desc: "Scan of first and last pages of old booklet", mandatory: true }] : []),
                  ].map((doc) => {
                    const uploaded = uploadedDocs[doc.category];
                    return (
                      <div
                        key={doc.category}
                        className={`p-4 rounded border transition ${
                          uploaded ? "border-emerald-300 bg-emerald-50/50" : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{doc.category}</span>
                              {doc.mandatory && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                                  Mandatory
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{doc.desc}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {uploaded ? (
                              <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded border border-emerald-200 text-xs">
                                <FileCheck className="w-4 h-4 text-emerald-600" />
                                <span className="font-mono text-[11px] text-slate-700 truncate max-w-[150px]">
                                  {uploaded.name}
                                </span>
                                <span className="text-[10px] text-slate-400">({uploaded.size})</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDoc(doc.category)}
                                  className="text-red-500 hover:text-red-700 ml-1 p-0.5"
                                  title="Remove"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-xs">
                                <UploadCloud className="w-3.5 h-3.5" />
                                <span>Upload File</span>
                                <input
                                  type="file"
                                  accept=".pdf,.png,.jpg,.jpeg"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleSimulatedFileUpload(doc.category, e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 9: APPLICATION PREVIEW & FINAL VERIFICATION */}
            {currentStep === 9 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-blue-900" />
                      <span>Step 9 — Application Preview & Final Verification</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review all entered particulars carefully. Use the &quot;Edit&quot; button to revise any step before submitting.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-50"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Form Preview</span>
                  </button>
                </div>

                {/* Section Summary Panels */}
                <div className="space-y-4 text-xs">
                  {/* Service Section */}
                  <div className="p-4 rounded border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 font-bold text-slate-900">
                      <span>1. Service Details</span>
                      <button onClick={() => setCurrentStep(1)} className="text-blue-900 hover:underline flex items-center gap-1 text-[11px]">
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
                      <div><span className="text-slate-400 block">Service:</span> {serviceType} Passport</div>
                      <div><span className="text-slate-400 block">Category:</span> {applicationCategory}</div>
                      <div><span className="text-slate-400 block">Booklet:</span> {bookletType === "60_PAGES" ? "60 Pages" : "36 Pages"}</div>
                      <div><span className="text-slate-400 block">Jurisdiction:</span> {rpoLocation}</div>
                    </div>
                  </div>

                  {/* Personal Particulars */}
                  <div className="p-4 rounded border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 font-bold text-slate-900">
                      <span>2. Applicant Personal Details</span>
                      <button onClick={() => setCurrentStep(2)} className="text-blue-900 hover:underline flex items-center gap-1 text-[11px]">
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-700">
                      <div><span className="text-slate-400 block">Full Name:</span> <strong>{givenName} {surname}</strong></div>
                      <div><span className="text-slate-400 block">Date of Birth:</span> {dob || "—"}</div>
                      <div><span className="text-slate-400 block">Gender:</span> {gender}</div>
                      <div><span className="text-slate-400 block">Place of Birth:</span> {placeOfBirth || "—"}</div>
                      <div><span className="text-slate-400 block">Marital Status:</span> {maritalStatus}</div>
                      <div><span className="text-slate-400 block">PAN / Voter ID:</span> {pan || voterId || "Not provided"}</div>
                      <div><span className="text-slate-400 block">Employment:</span> {employmentType}</div>
                      <div><span className="text-slate-400 block">Education:</span> {educationalQualification}</div>
                      <div><span className="text-slate-400 block">Distinguishing Mark:</span> {visibleIdentificationMark || "None"}</div>
                    </div>
                  </div>

                  {/* Family Particulars */}
                  <div className="p-4 rounded border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 font-bold text-slate-900">
                      <span>3. Family Details</span>
                      <button onClick={() => setCurrentStep(3)} className="text-blue-900 hover:underline flex items-center gap-1 text-[11px]">
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-700">
                      <div><span className="text-slate-400 block">Father&apos;s Name:</span> {fatherName || "—"}</div>
                      <div><span className="text-slate-400 block">Mother&apos;s Name:</span> {motherName || "—"}</div>
                      <div><span className="text-slate-400 block">Spouse&apos;s Name:</span> {spouseName || "—"}</div>
                    </div>
                  </div>

                  {/* Address Particulars */}
                  <div className="p-4 rounded border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 font-bold text-slate-900">
                      <span>4. Address & Police Station</span>
                      <button onClick={() => setCurrentStep(4)} className="text-blue-900 hover:underline flex items-center gap-1 text-[11px]">
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                      <div>
                        <span className="text-slate-400 block">Present Residential Address:</span>
                        {presentAddressLine1}, {presentAddressLine2 && `${presentAddressLine2}, `}{presentCity}, {presentDistrict}, {presentState} - {presentPinCode}
                      </div>
                      <div>
                        <span className="text-slate-400 block">Police Jurisdiction:</span>
                        {policeStation}
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="p-4 rounded border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 font-bold text-slate-900">
                      <span>5. Emergency Contact</span>
                      <button onClick={() => setCurrentStep(5)} className="text-blue-900 hover:underline flex items-center gap-1 text-[11px]">
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-700">
                      <div><span className="text-slate-400 block">Name:</span> {emergencyName} ({emergencyRelationship})</div>
                      <div><span className="text-slate-400 block">Mobile:</span> {emergencyMobile}</div>
                      <div><span className="text-slate-400 block">Email:</span> {emergencyEmail || "—"}</div>
                    </div>
                  </div>

                  {/* Documents Attached */}
                  <div className="p-4 rounded border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 font-bold text-slate-900">
                      <span>6. Attached Verification Documents</span>
                      <button onClick={() => setCurrentStep(8)} className="text-blue-900 hover:underline flex items-center gap-1 text-[11px]">
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(uploadedDocs).map(([cat, doc]) => (
                        <span key={cat} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-200 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <strong>{cat}:</strong> {doc.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Final Declaration Checkbox */}
                  <div className="p-4 rounded-lg border-2 border-blue-900/30 bg-blue-50/50 space-y-3">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-900 leading-relaxed font-medium">
                      <input
                        type="checkbox"
                        checked={confirmedDeclaration}
                        onChange={(e) => setConfirmedDeclaration(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900 mt-0.5"
                      />
                      <span>
                        I confirm that the information entered by me is correct to the best of my knowledge and belief. I understand that making a false statement or concealing any material fact is punishable under the Passports Act, 1967.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="mt-8 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous Step</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSave("SAVE_DRAFT")}
                  disabled={savingDraft || submitting}
                  className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-blue-900" />
                  <span>{savingDraft ? "Saving..." : "Save Draft"}</span>
                </button>

                {currentStep < 9 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 rounded bg-blue-900 px-5 py-2 text-xs font-bold text-white hover:bg-blue-800 transition shadow-xs"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSave("SUBMIT")}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-xs disabled:opacity-50"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>{submitting ? "Submitting Application..." : "Final Verification & Submit Application"}</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
