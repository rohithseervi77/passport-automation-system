import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default async function ApplicantDashboard() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      applicant: {
        include: {
          applications: {
            orderBy: { id: "desc" },
            take: 1,
            include: {
              documents: true,
              appointment: true,
              policeReports: true,
              passport: true,
            },
          },
        },
      },
    },
  });

  if (!user || user.role !== "APPLICANT" || !user.applicant) {
    redirect("/login");
  }

  const applicant = user.applicant;
  const currentApp = applicant.applications[0] || null;

  // Status progression progress percentage
  const statusProgressMap: Record<string, { pct: number; label: string; desc: string }> = {
    DRAFT: { pct: 15, label: "Draft Application", desc: "Complete personal details & submit" },
    SUBMITTED: { pct: 35, label: "Application Submitted", desc: "Upload docs & schedule biometric slot" },
    APPOINTMENT_SCHEDULED: { pct: 50, label: "Appointment Booked", desc: "Report to Passport Seva Kendra" },
    UNDER_OFFICER_VERIFICATION: { pct: 65, label: "Officer Verification", desc: "Scrutinizing documents & identity" },
    POLICE_VERIFICATION_PENDING: { pct: 75, label: "Police Background Enquiry", desc: "Station verification in progress" },
    POLICE_CLEARED: { pct: 85, label: "Clearance Granted", desc: "Awaiting final Officer approval" },
    APPROVED: { pct: 90, label: "Approved for Printing", desc: "Passport booklet being generated" },
    PASSPORT_ISSUED: { pct: 95, label: "Passport Issued", desc: "Quality checked & handed to courier" },
    PASSPORT_DISPATCHED: { pct: 100, label: "Dispatched via Speed Post", desc: "Out for delivery to address" },
    REJECTED: { pct: 100, label: "Application Rejected", desc: "Review remarks from Passport Office" },
  };

  const currentStatusKey = currentApp ? currentApp.status : "NONE";
  const progressInfo = currentApp
    ? statusProgressMap[currentApp.status] || { pct: 30, label: currentApp.status, desc: "In progress" }
    : { pct: 0, label: "Not Started", desc: "Create a new passport application" };

  const verifiedDocsCount = currentApp?.documents?.filter((d) => d.fileStatus === "VERIFIED").length || 0;
  const totalDocsCount = currentApp?.documents?.length || 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-16">
      <Navbar
        role="APPLICANT"
        userName={applicant.name}
        badgeLabel={`ID: ${applicant.applicantId}`}
      />

      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome & Profile Summary */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                Citizen Portal
              </span>
              <span className="text-xs text-slate-400">Authenticated Session</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Welcome, {applicant.name}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Manage your passport lifecycle, biometrics, documents, statutory fees, and delivery tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Citizen Ref ID
              </span>
              <span className="font-mono text-xs font-semibold text-blue-400">
                {applicant.applicantId}
              </span>
            </div>
            <Link
              href="/track"
              className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition flex items-center gap-1.5"
            >
              <span>🔍</span> Public Tracker
            </Link>
          </div>
        </div>

        {/* Live Application Progression Card */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 p-6 md:p-8 shadow-2xl relative overflow-hidden mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Active Application Status
                </span>
                <span
                  className={`rounded-full border px-3 py-0.5 text-xs font-bold ${
                    currentApp?.status === "PASSPORT_DISPATCHED"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : currentApp?.status === "REJECTED"
                      ? "bg-red-500/20 text-red-300 border-red-500/40"
                      : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                  }`}
                >
                  {currentApp ? currentApp.status.replace(/_/g, " ") : "NO ACTIVE APPLICATION"}
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                {currentApp ? currentApp.applicationId : "Start Your Digital Passport Application"}
              </h3>

              <p className="text-xs text-slate-300">
                {currentApp
                  ? `Category: ${currentApp.passportType} • Current Step: ${progressInfo.label} (${progressInfo.desc})`
                  : "Begin your streamlined application process with online verification and biometric scheduling."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {currentApp ? (
                <>
                  <Link
                    href="/applicant/status"
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                  >
                    <span>Track Live Status</span>
                    <span>→</span>
                  </Link>
                  <Link
                    href="/applicant/payment"
                    className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition flex items-center justify-center gap-1.5"
                  >
                    <span>💳</span>
                    <span>Fee Receipt</span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/applicant/application"
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
                >
                  Start Application Now →
                </Link>
              )}
            </div>
          </div>

          {/* Real-time Progress Bar */}
          {currentApp && (
            <div className="mt-8 pt-6 border-t border-slate-800/80">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Overall Completion: {progressInfo.pct}%
                </span>
                <span className="text-slate-400 font-mono">{progressInfo.label}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 transition-all duration-1000 shadow-md shadow-blue-500/50"
                  style={{ width: `${progressInfo.pct}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* 4 Core Module Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Application */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between hover:border-blue-500/40 hover:bg-slate-900 transition group shadow-lg">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl text-blue-400 mb-4 group-hover:scale-110 transition">
                📝
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Module 3</span>
                <span className="text-[10px] text-slate-500">{currentApp ? "Saved" : "Pending"}</span>
              </div>
              <h4 className="text-base font-bold text-white">Application Details</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Booklet preference, applicant particulars, residential address, and next of kin.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">
                {currentApp ? "Review / Edit" : "Fill Form"}
              </span>
              <Link
                href="/applicant/application"
                className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-md shadow-blue-600/20"
              >
                Open →
              </Link>
            </div>
          </div>

          {/* Card 2: Documents */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between hover:border-amber-500/40 hover:bg-slate-900 transition group shadow-lg">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-2xl text-amber-400 mb-4 group-hover:scale-110 transition">
                📁
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Repository</span>
                <span className="text-[10px] text-slate-500">{totalDocsCount} Attached</span>
              </div>
              <h4 className="text-base font-bold text-white">Document Repository</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Upload Proof of Identity (Aadhaar), Address, and DOB proof for Officer authenticity checks.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">
                {verifiedDocsCount}/{totalDocsCount} Verified
              </span>
              <Link
                href="/applicant/documents"
                className="rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition shadow-md shadow-amber-600/20"
              >
                Upload →
              </Link>
            </div>
          </div>

          {/* Card 3: Appointment */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between hover:border-cyan-500/40 hover:bg-slate-900 transition group shadow-lg">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-2xl text-cyan-400 mb-4 group-hover:scale-110 transition">
                📅
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Module 4</span>
                <span className="text-[10px] text-slate-500">{currentApp?.appointment ? "Confirmed" : "Not Booked"}</span>
              </div>
              <h4 className="text-base font-bold text-white">PSK Appointment</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Schedule in-person biometric slot and print official acknowledgment slip with barcode.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">
                {currentApp?.appointment ? "Slip Ready" : "Select Slot"}
              </span>
              <Link
                href="/applicant/appointment"
                className="rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-cyan-700 transition shadow-md shadow-cyan-600/20"
              >
                Schedule →
              </Link>
            </div>
          </div>

          {/* Card 4: Fee Payment & Tracking */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between hover:border-emerald-500/40 hover:bg-slate-900 transition group shadow-lg">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl text-emerald-400 mb-4 group-hover:scale-110 transition">
                💳
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Finance & Track</span>
                <span className="text-[10px] text-slate-500">{currentApp?.passport ? "Passport Ready" : "Active"}</span>
              </div>
              <h4 className="text-base font-bold text-white">Fee & Dispatch</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Process statutory charges online, download GST invoice, and track Speed Post shipment.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">
                ₹1,500.00 / UPI / Card
              </span>
              <Link
                href="/applicant/payment"
                className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
              >
                Pay / Receipt →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
