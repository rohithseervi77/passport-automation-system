"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ApplicantApplicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applicant, setApplicant] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);

  // Form states
  const [passportType, setPassportType] = useState("REGULAR (36 Pages)");
  const [validityPeriod, setValidityPeriod] = useState("10 Years");
  const [applicationCategory, setApplicationCategory] = useState("Fresh Passport");
  const [employmentType, setEmploymentType] = useState("Private");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
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
        }
        if (data.application) {
          setApplication(data.application);
          setPassportType(data.application.passportType || "REGULAR (36 Pages)");
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
          ? "Application submitted successfully! Please proceed to upload documents and book an appointment."
          : "Draft saved successfully!"
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
        <p className="text-slate-400">Loading application details...</p>
      </main>
    );
  }

  const isSubmitted = application && application.status !== "DRAFT";

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-16">
      <Navbar
        role="APPLICANT"
        userName={applicant?.name || "Applicant"}
        badgeLabel={`ID: ${applicant?.applicantId}`}
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
            <h2 className="text-3xl font-bold">Passport Application Form</h2>
            <p className="text-sm text-slate-400 mt-1">
              Apply for a fresh passport or renew existing passport credentials.
            </p>
          </div>

          {application && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Application ID
              </span>
              <span className="font-mono text-sm font-semibold text-blue-400">
                {application.applicationId}
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

        {/* Form sections */}
        <div className="space-y-6">
          {/* Section 1: Passport Type */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
            <h3 className="text-lg font-semibold border-b border-slate-800 pb-3 mb-5 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">
                1
              </span>
              Passport & Booklet Preference
            </h3>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Applying For
                </label>
                <select
                  disabled={isSubmitted}
                  value={applicationCategory}
                  onChange={(e) => setApplicationCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none"
                >
                  <option>Fresh Passport</option>
                  <option>Re-issue / Renewal of Passport</option>
                  <option>Diplomatic / Official Passport</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Passport Type & Booklet Size
                </label>
                <select
                  disabled={isSubmitted}
                  value={passportType}
                  onChange={(e) => setPassportType(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none"
                >
                  <option>REGULAR (36 Pages)</option>
                  <option>JUMBO BOOKLET (60 Pages)</option>
                  <option>TATKAAL SCHEME (Fast-Track 36 Pages)</option>
                  <option>DIPLOMATIC (Official)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Validity Required
                </label>
                <select
                  disabled={isSubmitted}
                  value={validityPeriod}
                  onChange={(e) => setValidityPeriod(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none"
                >
                  <option>10 Years (Standard Adult)</option>
                  <option>5 Years / Up to 18 Years (Minor)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Employment Type
                </label>
                <select
                  disabled={isSubmitted}
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none"
                >
                  <option>Private</option>
                  <option>Government / PSU</option>
                  <option>Self Employed</option>
                  <option>Student</option>
                  <option>Homemaker</option>
                  <option>Retired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Applicant Personal Details (From Registered Record) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
            <h3 className="text-lg font-semibold border-b border-slate-800 pb-3 mb-5 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">
                2
              </span>
              Applicant Identity & Address (Verified via Profile)
            </h3>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled
                  value={applicant?.name || ""}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-300 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Date of Birth
                </label>
                <input
                  type="text"
                  disabled
                  value={
                    applicant?.dob
                      ? new Date(applicant.dob).toLocaleDateString()
                      : ""
                  }
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-300 cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Residential Address (for Police Verification & Dispatch)
                </label>
                <textarea
                  disabled
                  rows={2}
                  value={applicant?.address || ""}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-300 cursor-not-allowed resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Contact */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
            <h3 className="text-lg font-semibold border-b border-slate-800 pb-3 mb-5 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">
                3
              </span>
              Emergency Contact Information
            </h3>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  disabled={isSubmitted}
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="e.g. Guardian / Next of Kin"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Emergency Phone Number
                </label>
                <input
                  type="tel"
                  disabled={isSubmitted}
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <Link
              href="/applicant/dashboard"
              className="text-sm text-slate-400 hover:text-white"
            >
              Cancel & Return
            </Link>

            <div className="flex items-center gap-3">
              {!isSubmitted ? (
                <>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSave("DRAFT")}
                    className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Draft"}
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSave("SUBMIT")}
                    className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-600/30"
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-emerald-400 font-medium">
                    Application is submitted ({application.status})
                  </span>
                  <Link
                    href="/applicant/documents"
                    className="rounded-lg bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition"
                  >
                    Next: Upload Documents →
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
