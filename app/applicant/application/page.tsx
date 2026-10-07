"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ApplicantApplicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [applicant, setApplicant] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);

  // Form Fields
  const [applicationCategory, setApplicationCategory] = useState("Fresh Passport");
  const [passportType, setPassportType] = useState("REGULAR (36 Pages)");
  const [validityPeriod, setValidityPeriod] = useState("10 Years (Standard Adult)");
  const [gender, setGender] = useState("Male");
  const [maritalStatus, setMaritalStatus] = useState("Single");
  const [placeOfBirth, setPlaceOfBirth] = useState("Central City");
  const [qualification, setQualification] = useState("Graduate & Above");
  const [employmentType, setEmploymentType] = useState("Private Sector");
  const [aadhaarNumber, setAadhaarNumber] = useState("•••• •••• 9102");
  const [panNumber, setPanNumber] = useState("ABCDE1234F");

  // Family details
  const [fatherName, setFatherName] = useState("Dev Sharma");
  const [motherName, setMotherName] = useState("Sunita Sharma");
  const [spouseName, setSpouseName] = useState("");

  // Address & Police Jurisdiction
  const [policeStation, setPoliceStation] = useState("Central Division Police Station (PS-CENTRAL)");
  const [pinCode, setPinCode] = useState("110001");
  const [emergencyContactName, setEmergencyContactName] = useState("Guardian / Kin");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("+91 98765 43210");
  const [agreeDeclaration, setAgreeDeclaration] = useState(true);
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchApp() {
      try {
        const res = await fetch("/api/applicant/application");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.applicant) {
          setApplicant(data.applicant);
          if (data.applicant.address) {
            setAddress(data.applicant.address);
          }
        }
        if (data.application) {
          setApplication(data.application);
          if (data.application.passportType) setPassportType(data.application.passportType);
        }
      } catch (err) {
        console.error("Failed to load application:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchApp();
  }, [router]);

  async function handleSave(action: "DRAFT" | "SUBMIT") {
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/applicant/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passportType,
          action,
          address,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save application");
        setSubmitting(false);
        return;
      }

      setApplication(data.application);
      setMessage(
        action === "SUBMIT"
          ? "Application submitted successfully! Please proceed to upload required documents and pay statutory fee."
          : "Draft saved successfully! You can resume editing anytime."
      );
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to connect to server");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">Loading passport application form...</p>
      </main>
    );
  }

  const isSubmitted = application && application.status !== "DRAFT";

  const steps = [
    { num: 1, title: "Service & Type", desc: "Booklet choice" },
    { num: 2, title: "Applicant Details", desc: "Identity & IDs" },
    { num: 3, title: "Family Particulars", desc: "Parents / Guardian" },
    { num: 4, title: "Address & Police", desc: "Jurisdiction" },
    { num: 5, title: "Review & Submit", desc: "Declaration" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-16">
      <Navbar
        role="APPLICANT"
        userName={applicant?.name || "Applicant"}
        badgeLabel={`ID: ${applicant?.applicantId || "PAS"}`}
      />

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/applicant/dashboard"
              className="text-xs text-blue-400 hover:text-blue-300 mb-1.5 inline-block font-medium"
            >
              ← Back to Dashboard
            </Link>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Passport Application Portal (Form No. 1)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Statutory e-Form under the Passports Act, 1967 • Ministry of External Affairs
            </p>
          </div>

          {application && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Application ARN
              </span>
              <span className="font-mono text-xs font-bold text-blue-400">
                {application.applicationId}
              </span>
            </div>
          )}
        </div>

        {/* Stepper Navigation */}
        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg">
          <div className="grid grid-cols-5 gap-2 text-center">
            {steps.map((s) => {
              const isDone = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <button
                  type="button"
                  key={s.num}
                  onClick={() => setCurrentStep(s.num)}
                  className={`p-2 rounded-xl transition flex flex-col items-center ${
                    isCurrent
                      ? "bg-blue-600/20 border border-blue-500/50 text-blue-300"
                      : isDone
                      ? "text-emerald-400 hover:bg-slate-800"
                      : "text-slate-500 hover:bg-slate-800/50"
                  }`}
                >
                  <span
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                      isCurrent
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                        : isDone
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isDone ? "✓" : s.num}
                  </span>
                  <span className="text-[11px] font-semibold hidden sm:block">{s.title}</span>
                  <span className="text-[9px] text-slate-500 hidden md:block">{s.desc}</span>
                </button>
              );
            })}
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

        {/* Form Container */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 shadow-2xl space-y-6">
          {/* Step 1: Passport Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-base font-bold border-b border-slate-800 pb-3 flex items-center gap-2 text-white">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  1
                </span>
                Passport Application Type & Booklet Selection
              </h3>

              <div className="grid gap-5 md:grid-cols-2 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1.5">
                    Application Category
                  </label>
                  <select
                    disabled={isSubmitted}
                    value={applicationCategory}
                    onChange={(e) => setApplicationCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                  >
                    <option>Fresh Passport</option>
                    <option>Re-issue / Renewal of Passport</option>
                    <option>Diplomatic / Official Passport</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1.5">
                    Type of Application Scheme & Booklet
                  </label>
                  <select
                    disabled={isSubmitted}
                    value={passportType}
                    onChange={(e) => setPassportType(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                  >
                    <option>REGULAR (36 Pages) - Standard ₹1,500</option>
                    <option>JUMBO BOOKLET (60 Pages) - ₹2,000</option>
                    <option>TATKAAL SCHEME (Fast-Track 36 Pages) - ₹3,500</option>
                    <option>DIPLOMATIC (Official Exempt)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1.5">
                    Validity Requirement
                  </label>
                  <select
                    disabled={isSubmitted}
                    value={validityPeriod}
                    onChange={(e) => setValidityPeriod(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                  >
                    <option>10 Years (Standard Adult)</option>
                    <option>5 Years / Up to 18 Years (Minor)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1.5">
                    Employment Status
                  </label>
                  <select
                    disabled={isSubmitted}
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                  >
                    <option>Private Sector</option>
                    <option>Government / PSU</option>
                    <option>Self Employed / Business</option>
                    <option>Student</option>
                    <option>Homemaker</option>
                    <option>Retired</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Applicant Identity */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-base font-bold border-b border-slate-800 pb-3 flex items-center gap-2 text-white">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  2
                </span>
                Applicant Particulars & National IDs
              </h3>

              <div className="grid gap-5 md:grid-cols-2 text-xs">
                <div>
                  <label className="block font-medium text-slate-400 mb-1">
                    Given Full Name (as per Birth / Aadhaar)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={applicant?.name || ""}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-xs text-slate-300 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-400 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="text"
                    disabled
                    value={applicant?.dob ? new Date(applicant.dob).toLocaleDateString() : ""}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-xs text-slate-300 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Place of Birth (Village / Town / City)
                  </label>
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={placeOfBirth}
                    onChange={(e) => setPlaceOfBirth(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    disabled={isSubmitted}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Transgender</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Educational Qualification
                  </label>
                  <select
                    disabled={isSubmitted}
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                  >
                    <option>Graduate & Above (ECNR Eligible)</option>
                    <option>10th Standard & Above (ECNR Eligible)</option>
                    <option>Between 8th and 9th Standard</option>
                    <option>Below 8th Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Aadhaar Number (12-Digit)
                  </label>
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Family Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-base font-bold border-b border-slate-800 pb-3 flex items-center gap-2 text-white">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  3
                </span>
                Family & Legal Guardian Particulars
              </h3>

              <div className="grid gap-5 md:grid-cols-2 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Father's Given Name
                  </label>
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="Father's Full Name"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Mother's Given Name
                  </label>
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    placeholder="Mother's Full Name"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Marital Status
                  </label>
                  <select
                    disabled={isSubmitted}
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                  >
                    <option>Single</option>
                    <option>Married</option>
                    <option>Divorced</option>
                    <option>Widow / Widower</option>
                  </select>
                </div>

                {maritalStatus === "Married" && (
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">
                      Spouse's Full Name
                    </label>
                    <input
                      type="text"
                      disabled={isSubmitted}
                      value={spouseName}
                      onChange={(e) => setSpouseName(e.target.value)}
                      placeholder="Spouse Name"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Address & Police Jurisdiction */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-base font-bold border-b border-slate-800 pb-3 flex items-center gap-2 text-white">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  4
                </span>
                Present Residential Address & Police Jurisdiction
              </h3>

              <div className="grid gap-5 md:grid-cols-2 text-xs">
                <div className="md:col-span-2">
                  <label className="block font-medium text-slate-300 mb-1">
                    Residential Address (For Police Site Enquiry & Speed Post Dispatch)
                  </label>
                  <textarea
                    disabled={isSubmitted}
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your complete residential address"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Police Station Jurisdiction
                  </label>
                  <select
                    disabled={isSubmitted}
                    value={policeStation}
                    onChange={(e) => setPoliceStation(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                  >
                    <option>Central Division Police Station (PS-CENTRAL)</option>
                    <option>North District Police Station (PS-NORTH)</option>
                    <option>South Division Police Station (PS-SOUTH)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    PIN / Postal Code
                  </label>
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    disabled={isSubmitted}
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Emergency Phone Number
                  </label>
                  <input
                    type="tel"
                    disabled={isSubmitted}
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & Declaration */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-base font-bold border-b border-slate-800 pb-3 flex items-center gap-2 text-white">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  5
                </span>
                Application Summary Review & Citizen Declaration
              </h3>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Applicant</span>
                    <span className="font-semibold text-white">{applicant?.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Scheme</span>
                    <span className="font-semibold text-blue-300">{passportType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Police Jurisdiction</span>
                    <span className="font-semibold text-emerald-300">{policeStation.split(" ")[0]}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Status</span>
                    <span className="font-semibold text-amber-300">{application?.status || "Draft"}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-300">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeDeclaration}
                    onChange={(e) => setAgreeDeclaration(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="leading-relaxed text-[11px] text-slate-400">
                    I declare that I am a citizen of India by birth/descent. I have not lost, surrendered, or been deprived of citizenship. The statements made in this application are true, complete, and accurate to the best of my knowledge under the Passports Act, 1967.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Stepper Wizard Footer Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
                >
                  ← Previous Step
                </button>
              )}
              {currentStep < 5 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="rounded-lg bg-slate-800 border border-slate-700 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
                >
                  Next Step →
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!isSubmitted ? (
                <>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSave("DRAFT")}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Draft"}
                  </button>

                  <button
                    type="button"
                    disabled={submitting || !agreeDeclaration}
                    onClick={() => handleSave("SUBMIT")}
                    className="rounded-lg bg-blue-600 px-6 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-600/30"
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-emerald-400 font-medium">
                    ✓ Submitted ({application.status})
                  </span>
                  <Link
                    href="/applicant/documents"
                    className="rounded-lg bg-amber-600 px-5 py-2 text-xs font-bold text-white hover:bg-amber-700 transition"
                  >
                    Proceed to Documents Hub →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
