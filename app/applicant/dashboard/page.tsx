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

  const statusColorMap: Record<string, string> = {
    DRAFT: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    SUBMITTED: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    APPOINTMENT_SCHEDULED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    UNDER_OFFICER_VERIFICATION: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    POLICE_VERIFICATION_PENDING: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    POLICE_CLEARED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    REJECTED: "bg-red-500/10 text-red-400 border-red-500/30",
    PASSPORT_ISSUED: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    PASSPORT_DISPATCHED: "bg-emerald-400/20 text-emerald-300 border-emerald-400/40",
  };

  const statusBadge = currentApp
    ? statusColorMap[currentApp.status] || "bg-blue-500/10 text-blue-400 border-blue-500/30"
    : "bg-slate-800 text-slate-400 border-slate-700";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar
        role="APPLICANT"
        userName={applicant.name}
        badgeLabel={`ID: ${applicant.applicantId}`}
      />

      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Welcome & Profile Summary */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Applicant Portal • PAS System
            </p>
            <h2 className="mt-2 text-3xl font-bold">
              Welcome back, {applicant.name}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Track and manage all stages of your passport issuance workflow.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-slate-300">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Applicant ID</span>
              <span className="font-mono font-medium text-slate-200">{applicant.applicantId}</span>
            </div>
          </div>
        </div>

        {/* Current Application Status Card */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/30 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Active Application
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge}`}>
                  {currentApp ? currentApp.status.replace(/_/g, " ") : "NO ACTIVE APPLICATION"}
                </span>
              </div>

              <h3 className="mt-3 text-2xl font-bold">
                {currentApp ? currentApp.applicationId : "Ready to apply for a Passport?"}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                {currentApp
                  ? `Type: ${currentApp.passportType} • Submitted: ${currentApp.submissionDate ? new Date(currentApp.submissionDate).toLocaleDateString() : "Draft"}`
                  : "Start a fresh passport application by completing your details and uploading verification documents."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {currentApp ? (
                <Link
                  href="/applicant/status"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <span>Track Full Workflow</span>
                  <span>→</span>
                </Link>
              ) : (
                <Link
                  href="/applicant/application"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <span>Start New Application</span>
                  <span>+</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* 4 Core Action Hubs */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Application Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 flex flex-col justify-between hover:border-slate-700 transition">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl text-blue-400 mb-4">
                📝
              </div>
              <h3 className="text-lg font-semibold">1. Application Form</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Provide passport type, personal information, address, and submit for verification.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">
                {currentApp ? "Edit / Review" : "Fill Details"}
              </span>
              <Link
                href="/applicant/application"
                className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold hover:bg-blue-700 transition"
              >
                Open Form
              </Link>
            </div>
          </div>

          {/* Card 2: Documents */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 flex flex-col justify-between hover:border-slate-700 transition">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-2xl text-amber-400 mb-4">
                📄
              </div>
              <h3 className="text-lg font-semibold">2. Upload Documents</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Upload Identity Proof, Address Proof, and Date of Birth proof files for official verification.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">
                {currentApp?.documents?.length || 0} Attached
              </span>
              <Link
                href="/applicant/documents"
                className="rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold hover:bg-amber-700 transition text-white"
              >
                Manage Docs
              </Link>
            </div>
          </div>

          {/* Card 3: Appointment */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 flex flex-col justify-between hover:border-slate-700 transition">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-2xl text-cyan-400 mb-4">
                📅
              </div>
              <h3 className="text-lg font-semibold">3. Appointment</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Book slot at Passport Seva Kendra / Regional Office for biometric and document checks.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">
                {currentApp?.appointment ? "Slot Booked" : "Not Scheduled"}
              </span>
              <Link
                href="/applicant/appointment"
                className="rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-semibold hover:bg-cyan-700 transition text-white"
              >
                Schedule
              </Link>
            </div>
          </div>

          {/* Card 4: Status & Passport */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 flex flex-col justify-between hover:border-slate-700 transition">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl text-emerald-400 mb-4">
                🔎
              </div>
              <h3 className="text-lg font-semibold">4. Check Status</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Live status tracking: Officer review, Police enquiry, issuance, and Speed Post tracking.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">
                {currentApp?.passport ? "Passport Ready" : "In Progress"}
              </span>
              <Link
                href="/applicant/status"
                className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold hover:bg-emerald-700 transition text-white"
              >
                View Track
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
