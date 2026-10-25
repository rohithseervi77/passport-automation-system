import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { getStatusMeta } from "@/lib/fsm";
import { 
  FileText, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Search, 
  ArrowRight,
  HelpCircle,
  MapPin,
  Building2,
  Send,
  Upload,
  UserCheck
} from "lucide-react";

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
            include: {
              documents: true,
              appointment: true,
              policeReports: {
                orderBy: { id: "desc" },
                include: { police: true },
              },
              passport: true,
              officer: true,
              statusHistory: {
                orderBy: { changedAt: "desc" },
                take: 5,
              },
            },
          },
        },
      },
      notifications: {
        where: { isRead: false },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });

  if (!user || user.role !== "APPLICANT" || !user.applicant) {
    redirect("/login");
  }

  const applicant = user.applicant;
  const applications = applicant.applications || [];
  const currentApp = applications[0] || null;

  const statusMeta = currentApp ? getStatusMeta(currentApp.status) : null;

  // 8-stage Timeline definitions
  const timelineStages = [
    { key: "SUBMITTED", label: "Application Submitted", num: 1 },
    { key: "PAYMENT_COMPLETED", label: "Fee Payment", num: 2 },
    { key: "APPOINTMENT_BOOKED", label: "Appointment Booked", num: 3 },
    { key: "DOCUMENT_VERIFICATION", label: "Document Verification", num: 4 },
    { key: "POLICE_VERIFICATION_PENDING", label: "Police Verification", num: 5 },
    { key: "OFFICER_REVIEW", label: "Officer Review", num: 6 },
    { key: "APPROVED", label: "Approved & Printed", num: 7 },
    { key: "DISPATCHED", label: "Dispatched & Delivered", num: 8 },
  ];

  function getStageStatus(stageIndex: number, currentStageIndex: number, appStatus: string) {
    if (appStatus === "REJECTED") {
      if (stageIndex === currentStageIndex) return "rejected";
    }
    if (appStatus === "CLARIFICATION_REQUIRED") {
      if (stageIndex === currentStageIndex) return "clarification";
    }
    if (stageIndex < currentStageIndex) return "completed";
    if (stageIndex === currentStageIndex) return "active";
    return "upcoming";
  }

  const activeStageIndex = statusMeta ? statusMeta.stageIndex : -1;

  // Appointment info
  const appointmentInfo = currentApp?.appointment;
  // Police report info
  const policeReport = currentApp?.policeReports?.[0];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar role="APPLICANT" userName={applicant.name || user.username} />

      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* Welcome & Overview Header */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                Citizen Portal • Applicant ID: {applicant.applicantId}
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">
                Welcome, {applicant.name || user.username}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your passport applications, appointments, physical document records, and verification status.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/applicant/application"
                className="inline-flex items-center gap-2 rounded bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{currentApp ? "View / Edit Application" : "Start New Application"}</span>
              </Link>
              <Link
                href="/track"
                className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
              >
                <Search className="w-3.5 h-3.5 text-blue-900" />
                <span>Track By ARN</span>
              </Link>
            </div>
          </div>

          {/* Clarification Alert (if requested by Officer) */}
          {currentApp?.status === "CLARIFICATION_REQUIRED" && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-lg p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-rose-950 uppercase tracking-wide">
                    Action Required: Passport Officer Clarification Requested
                  </h3>
                  <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                    The Passport Officer has examined your application and requested the following clarification / document correction:
                  </p>
                  <div className="mt-2.5 p-3 rounded bg-white border border-rose-200 text-xs font-mono text-slate-800">
                    {currentApp.clarificationReason || "Please verify your uploaded address proof document and submit corrected details."}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Link
                      href="/applicant/application"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-700 text-white text-xs font-semibold hover:bg-rose-800 transition shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Respond & Update Application</span>
                    </Link>
                    <Link
                      href="/applicant/documents"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-rose-300 bg-white text-rose-800 text-xs font-semibold hover:bg-rose-100 transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Re-upload Documents</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Application Summary Card */}
          {currentApp ? (
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                    ARN
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
                      Application Reference Number
                    </span>
                    <span className="font-mono font-bold text-base text-slate-900">
                      {currentApp.applicationId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusMeta?.badgeClass}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    <span>{statusMeta?.label}</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    Type: <strong className="text-slate-800">{currentApp.serviceType} ({currentApp.applicationCategory})</strong>
                  </span>
                </div>
              </div>

              {/* Status Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 border-b border-slate-200 text-xs">
                <div className="p-3 rounded bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">Submitted On</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block text-sm">
                    {currentApp.submissionDate 
                      ? new Date(currentApp.submissionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                      : "Draft (Not submitted)"}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">RPO: {currentApp.rpoLocation || "RPO Chennai"}</span>
                </div>

                <div className="p-3 rounded bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">PSK Appointment</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block text-sm">
                    {appointmentInfo?.date 
                      ? new Date(appointmentInfo.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                      : "Not Scheduled"}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block truncate">
                    {appointmentInfo ? `${appointmentInfo.location} (${appointmentInfo.timeSlot})` : "Fee & appointment pending"}
                  </span>
                </div>

                <div className="p-3 rounded bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">Police Verification</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block text-sm">
                    {policeReport?.clearanceStatus || (
                      ["POLICE_VERIFICATION_PENDING", "POLICE_VERIFICATION_IN_PROGRESS"].includes(currentApp.status)
                        ? "Under Enquiry"
                        : ["POLICE_VERIFICATION_COMPLETED", "POLICE_CLEARED", "APPROVED", "PRINTING", "DISPATCHED"].includes(currentApp.status)
                        ? "Cleared"
                        : "Awaiting Schedule"
                    )}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block truncate">
                    Station: {currentApp.policeStation || "Central Division PS"}
                  </span>
                </div>

                <div className="p-3 rounded bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">Next Action Required</span>
                  <span className="font-semibold text-blue-900 mt-0.5 block text-sm">
                    {currentApp.status === "DRAFT" && "Submit Application"}
                    {currentApp.status === "SUBMITTED" && "Pay Application Fee"}
                    {currentApp.status === "PAYMENT_PENDING" && "Complete Payment"}
                    {currentApp.status === "PAYMENT_COMPLETED" && "Book PSK Slot"}
                    {currentApp.status === "APPOINTMENT_PENDING" && "Select PSK Slot"}
                    {currentApp.status === "APPOINTMENT_BOOKED" && "Visit PSK on Date"}
                    {currentApp.status === "DOCUMENT_VERIFICATION" && "In Officer Scrutiny"}
                    {currentApp.status === "POLICE_VERIFICATION_PENDING" && "Police Station Enquiry"}
                    {currentApp.status === "POLICE_VERIFICATION_IN_PROGRESS" && "Field Enquiry Underway"}
                    {currentApp.status === "CLARIFICATION_REQUIRED" && "Reply to Clarification"}
                    {currentApp.status === "OFFICER_REVIEW" && "Final Officer Review"}
                    {currentApp.status === "APPROVED" && "Printing in Progress"}
                    {currentApp.status === "PRINTING" && "Printing in Progress"}
                    {currentApp.status === "DISPATCHED" && "Courier Delivery Active"}
                    {currentApp.status === "DELIVERED" && "Passport Delivered"}
                    {currentApp.status === "REJECTED" && "Application Closed"}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Updated: {new Date(currentApp.updatedAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Horizontal Application Timeline */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-xs uppercase tracking-wide text-slate-900">
                    Application Milestone Timeline
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Current Stage: <strong className="text-blue-900">{statusMeta?.label}</strong>
                  </span>
                </div>

                <div className="overflow-x-auto pb-4">
                  <div className="flex items-center min-w-[760px] justify-between relative">
                    {/* Connecting line */}
                    <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

                    {timelineStages.map((stage, idx) => {
                      const state = getStageStatus(idx, activeStageIndex, currentApp.status);
                      return (
                        <div key={stage.key} className="flex flex-col items-center text-center w-24 relative z-10">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border-2 transition ${
                              state === "completed"
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : state === "active"
                                ? "bg-blue-900 border-blue-900 text-white ring-4 ring-blue-100"
                                : state === "clarification"
                                ? "bg-rose-600 border-rose-600 text-white ring-4 ring-rose-100"
                                : state === "rejected"
                                ? "bg-red-600 border-red-600 text-white"
                                : "bg-white border-slate-300 text-slate-400"
                            }`}
                          >
                            {state === "completed" ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <span>{stage.num}</span>
                            )}
                          </div>
                          <span className={`text-[11px] mt-2 font-medium leading-tight ${
                            state === "active" ? "text-blue-950 font-bold" :
                            state === "completed" ? "text-slate-800" :
                            state === "clarification" ? "text-rose-700 font-bold" :
                            "text-slate-400"
                          }`}>
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status Help description */}
                <div className="mt-2 p-3 bg-blue-50/60 rounded border border-blue-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-4 h-4 text-blue-900 shrink-0" />
                    <span><strong>Current status note:</strong> {statusMeta?.desc}</span>
                  </div>
                  {["SUBMITTED", "PAYMENT_PENDING"].includes(currentApp.status) && (
                    <Link
                      href="/applicant/payment"
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded font-bold transition shadow-xs"
                    >
                      Pay ₹1,500 Now →
                    </Link>
                  )}
                  {["PAYMENT_COMPLETED", "APPOINTMENT_PENDING"].includes(currentApp.status) && (
                    <Link
                      href="/applicant/appointment"
                      className="px-3 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded font-bold transition shadow-xs"
                    >
                      Book PSK Slot →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Empty state when applicant has no application */
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-900 mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">No Active Passport Application Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                You have not started or submitted a passport application yet. Click below to begin your standard Fresh or Re-issue passport application.
              </p>
              <Link
                href="/applicant/application"
                className="inline-flex items-center gap-2 rounded bg-blue-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-800 transition shadow-xs"
              >
                <span>Start New Application Wizard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Quick Dashboard Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. My Applications */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded bg-blue-50 text-blue-900">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-500">{applications.length} on file</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">My Applications</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Review personal particulars, family data, address entries, and preview your submitted ARN forms.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  href="/applicant/application"
                  className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Open Application Form</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 2. Appointments */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded bg-indigo-50 text-indigo-900">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {appointmentInfo ? appointmentInfo.status : "No Booking"}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">Appointments</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {appointmentInfo
                  ? `Scheduled on ${new Date(appointmentInfo.date).toLocaleDateString("en-IN")} at ${appointmentInfo.location}`
                  : "Book, check, or reschedule your physical biometric appointment at any regional PSK / POPSK centre."}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  href="/applicant/appointment"
                  className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Manage Appointment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 3. Documents */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded bg-teal-50 text-teal-900">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {currentApp?.documents?.length || 0} Attached
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">Documents Hub</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Upload and inspect mandatory verification files (Proof of Identity, Address Proof, and Birth Certificate).
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  href="/applicant/documents"
                  className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>View & Upload Files</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 4. Payment */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded bg-amber-50 text-amber-900">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-500">Simulated</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">Payment & Receipts</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Check prescribed government fees, perform mock online fee settlements, and download payment receipts.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  href="/applicant/payment"
                  className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Open Payment Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 5. Live Tracker */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded bg-sky-50 text-sky-900">
                  <Search className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-500">Public & In-Portal</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">Track Status</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Monitor comprehensive real-time processing milestones from PSK scrutiny to India Post Speed Post dispatch.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  href="/applicant/status"
                  className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Open Live Status View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 6. Help & FAQ */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded bg-purple-50 text-purple-900">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-500">Guidance</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">Help & Support</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Consult document requirements, eligibility criteria, Tatkaal rules, and PSK reporting instructions.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <a
                  href="/#faq"
                  className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Read Citizen FAQ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Recent Status History Log Table */}
          {currentApp?.statusHistory && currentApp.statusHistory.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-900" />
                <span>Recent Application Activity Log</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">Stage / Status</th>
                      <th className="py-2.5 px-3">Performed By</th>
                      <th className="py-2.5 px-3">Remarks / Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {currentApp.statusHistory.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono">
                          {new Date(h.changedAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-semibold text-slate-900">
                          {h.toStatus}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                          {h.performedBy || "System"} ({h.role || "SYSTEM"})
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {h.remarks || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
