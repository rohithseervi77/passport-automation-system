export type ApplicationStatus = 
  | "DRAFT"
  | "SUBMITTED"
  | "PAYMENT_PENDING"
  | "PAYMENT_PROCESSING"
  | "PAYMENT_FAILED"
  | "PAYMENT_COMPLETED"
  | "APPOINTMENT_PENDING"
  | "APPOINTMENT_BOOKED"
  | "APPOINTMENT_SCHEDULED"
  | "APPOINTMENT_COMPLETED"
  | "DOCUMENT_REVIEW"
  | "DOCUMENT_VERIFICATION"
  | "DOCUMENT_CORRECTION_REQUIRED"
  | "DOCUMENT_VERIFIED"
  | "UNDER_OFFICER_VERIFICATION"
  | "OFFICER_REVIEW"
  | "POLICE_VERIFICATION_PENDING"
  | "POLICE_VERIFICATION_ASSIGNED"
  | "POLICE_VERIFICATION_IN_PROGRESS"
  | "POLICE_VERIFICATION_COMPLETED"
  | "POLICE_VERIFICATION_FAILED"
  | "POLICE_CLEARED"
  | "CLARIFICATION_REQUIRED"
  | "FINAL_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PRINTING"
  | "PASSPORT_PRINTING"
  | "PASSPORT_ISSUED"
  | "DISPATCHED"
  | "PASSPORT_DISPATCHED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "ON_HOLD"
  | "EXPIRED";

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  DRAFT: [
    "SUBMITTED",
    "PAYMENT_PENDING",
    "CANCELLED",
  ],
  SUBMITTED: [
    "PAYMENT_PENDING",
    "PAYMENT_COMPLETED",
    "APPOINTMENT_PENDING",
    "APPOINTMENT_BOOKED",
    "DOCUMENT_VERIFICATION",
    "DOCUMENT_REVIEW",
    "POLICE_VERIFICATION_PENDING",
    "REJECTED",
    "CANCELLED",
  ],
  PAYMENT_PENDING: [
    "PAYMENT_PROCESSING",
    "PAYMENT_COMPLETED",
    "PAYMENT_FAILED",
    "CANCELLED",
    "EXPIRED",
  ],
  PAYMENT_PROCESSING: [
    "PAYMENT_COMPLETED",
    "PAYMENT_FAILED",
  ],
  PAYMENT_FAILED: [
    "PAYMENT_PROCESSING",
    "PAYMENT_PENDING",
    "PAYMENT_COMPLETED",
    "CANCELLED",
  ],
  PAYMENT_COMPLETED: [
    "APPOINTMENT_PENDING",
    "APPOINTMENT_BOOKED",
    "APPOINTMENT_SCHEDULED",
    "DOCUMENT_VERIFICATION",
    "DOCUMENT_REVIEW",
    "POLICE_VERIFICATION_PENDING",
    "REJECTED",
  ],
  APPOINTMENT_PENDING: [
    "APPOINTMENT_BOOKED",
    "APPOINTMENT_SCHEDULED",
    "DOCUMENT_VERIFICATION",
    "CANCELLED",
    "REJECTED",
  ],
  APPOINTMENT_BOOKED: [
    "APPOINTMENT_PENDING",
    "APPOINTMENT_COMPLETED",
    "DOCUMENT_VERIFICATION",
    "DOCUMENT_REVIEW",
    "POLICE_VERIFICATION_PENDING",
    "CANCELLED",
    "REJECTED",
  ],
  APPOINTMENT_SCHEDULED: [
    "APPOINTMENT_BOOKED",
    "APPOINTMENT_COMPLETED",
    "DOCUMENT_VERIFICATION",
    "DOCUMENT_REVIEW",
    "UNDER_OFFICER_VERIFICATION",
    "POLICE_VERIFICATION_PENDING",
    "CANCELLED",
  ],
  APPOINTMENT_COMPLETED: [
    "DOCUMENT_VERIFICATION",
    "DOCUMENT_REVIEW",
    "UNDER_OFFICER_VERIFICATION",
    "OFFICER_REVIEW",
    "POLICE_VERIFICATION_PENDING",
    "REJECTED",
  ],
  DOCUMENT_VERIFICATION: [
    "DOCUMENT_VERIFIED",
    "POLICE_VERIFICATION_PENDING",
    "POLICE_VERIFICATION_IN_PROGRESS",
    "OFFICER_REVIEW",
    "CLARIFICATION_REQUIRED",
    "DOCUMENT_CORRECTION_REQUIRED",
    "REJECTED",
    "ON_HOLD",
  ],
  DOCUMENT_REVIEW: [
    "DOCUMENT_VERIFIED",
    "DOCUMENT_VERIFICATION",
    "POLICE_VERIFICATION_PENDING",
    "CLARIFICATION_REQUIRED",
    "DOCUMENT_CORRECTION_REQUIRED",
    "REJECTED",
    "ON_HOLD",
  ],
  DOCUMENT_CORRECTION_REQUIRED: [
    "DOCUMENT_VERIFICATION",
    "DOCUMENT_REVIEW",
    "CANCELLED",
  ],
  DOCUMENT_VERIFIED: [
    "POLICE_VERIFICATION_PENDING",
    "POLICE_VERIFICATION_IN_PROGRESS",
    "OFFICER_REVIEW",
    "APPROVED",
    "REJECTED",
  ],
  UNDER_OFFICER_VERIFICATION: [
    "DOCUMENT_VERIFIED",
    "POLICE_VERIFICATION_PENDING",
    "OFFICER_REVIEW",
    "CLARIFICATION_REQUIRED",
    "APPROVED",
    "REJECTED",
  ],
  POLICE_VERIFICATION_PENDING: [
    "POLICE_VERIFICATION_ASSIGNED",
    "POLICE_VERIFICATION_IN_PROGRESS",
    "POLICE_VERIFICATION_COMPLETED",
    "POLICE_CLEARED",
    "POLICE_VERIFICATION_FAILED",
    "CLARIFICATION_REQUIRED",
    "REJECTED",
  ],
  POLICE_VERIFICATION_ASSIGNED: [
    "POLICE_VERIFICATION_IN_PROGRESS",
    "POLICE_VERIFICATION_COMPLETED",
    "POLICE_CLEARED",
    "POLICE_VERIFICATION_FAILED",
    "CLARIFICATION_REQUIRED",
    "REJECTED",
  ],
  POLICE_VERIFICATION_IN_PROGRESS: [
    "POLICE_VERIFICATION_COMPLETED",
    "POLICE_CLEARED",
    "POLICE_VERIFICATION_FAILED",
    "CLARIFICATION_REQUIRED",
    "OFFICER_REVIEW",
    "REJECTED",
  ],
  POLICE_VERIFICATION_COMPLETED: [
    "OFFICER_REVIEW",
    "FINAL_REVIEW",
    "APPROVED",
    "CLARIFICATION_REQUIRED",
    "REJECTED",
  ],
  POLICE_CLEARED: [
    "OFFICER_REVIEW",
    "FINAL_REVIEW",
    "APPROVED",
    "CLARIFICATION_REQUIRED",
    "REJECTED",
  ],
  POLICE_VERIFICATION_FAILED: [
    "OFFICER_REVIEW",
    "CLARIFICATION_REQUIRED",
    "REJECTED",
  ],
  CLARIFICATION_REQUIRED: [
    "DOCUMENT_VERIFICATION",
    "DOCUMENT_REVIEW",
    "POLICE_VERIFICATION_IN_PROGRESS",
    "OFFICER_REVIEW",
    "SUBMITTED",
    "REJECTED",
  ],
  OFFICER_REVIEW: [
    "APPROVED",
    "CLARIFICATION_REQUIRED",
    "POLICE_VERIFICATION_PENDING",
    "REJECTED",
    "ON_HOLD",
    "PRINTING",
    "PASSPORT_PRINTING",
  ],
  FINAL_REVIEW: [
    "APPROVED",
    "CLARIFICATION_REQUIRED",
    "REJECTED",
    "ON_HOLD",
  ],
  APPROVED: [
    "PRINTING",
    "PASSPORT_PRINTING",
    "PASSPORT_ISSUED",
  ],
  PRINTING: [
    "DISPATCHED",
    "PASSPORT_DISPATCHED",
    "DELIVERED",
  ],
  PASSPORT_PRINTING: [
    "PASSPORT_ISSUED",
    "PASSPORT_DISPATCHED",
    "DISPATCHED",
  ],
  PASSPORT_ISSUED: [
    "PASSPORT_DISPATCHED",
    "DISPATCHED",
    "DELIVERED",
  ],
  DISPATCHED: [
    "DELIVERED",
    "COMPLETED",
  ],
  PASSPORT_DISPATCHED: [
    "DELIVERED",
    "COMPLETED",
  ],
  DELIVERED: [
    "COMPLETED",
  ],
  ON_HOLD: [
    "DOCUMENT_VERIFICATION",
    "OFFICER_REVIEW",
    "REJECTED",
    "CANCELLED",
  ],
  REJECTED: [
    "SUBMITTED",
    "CLARIFICATION_REQUIRED",
    "OFFICER_REVIEW",
    "CANCELLED",
  ],
  CANCELLED: [],
  EXPIRED: [],
  COMPLETED: [],
};

export function canTransition(currentStatus: string, nextStatus: string): boolean {
  if (currentStatus === nextStatus) return true;
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(nextStatus);
}

export interface StatusMeta {
  label: string;
  desc: string;
  badgeClass: string;
  stageIndex: number; // 0 to 7
}

export function getStatusMeta(status: string): StatusMeta {
  switch (status) {
    case "DRAFT":
      return {
        label: "Draft",
        desc: "Application in progress by applicant",
        badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
        stageIndex: 0,
      };
    case "SUBMITTED":
      return {
        label: "Submitted",
        desc: "Application submitted. Awaiting payment.",
        badgeClass: "bg-blue-50 text-blue-800 border-blue-300",
        stageIndex: 1,
      };
    case "PAYMENT_PENDING":
    case "PAYMENT_PROCESSING":
      return {
        label: "Payment Pending",
        desc: "Online fee payment required to book appointment",
        badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
        stageIndex: 1,
      };
    case "PAYMENT_COMPLETED":
    case "APPOINTMENT_PENDING":
      return {
        label: "Payment Completed",
        desc: "Fee paid successfully. Please schedule PSK appointment.",
        badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-300",
        stageIndex: 1,
      };
    case "APPOINTMENT_BOOKED":
    case "APPOINTMENT_SCHEDULED":
      return {
        label: "Appointment Scheduled",
        desc: "Biometrics & physical verification scheduled at PSK",
        badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-300",
        stageIndex: 2,
      };
    case "APPOINTMENT_COMPLETED":
    case "DOCUMENT_VERIFICATION":
    case "DOCUMENT_REVIEW":
    case "UNDER_OFFICER_VERIFICATION":
      return {
        label: "Document Verification",
        desc: "PSK Officer verifying submitted physical documents",
        badgeClass: "bg-sky-50 text-sky-800 border-sky-300",
        stageIndex: 3,
      };
    case "DOCUMENT_VERIFIED":
      return {
        label: "Documents Verified",
        desc: "Verification complete. Forwarded for police enquiry.",
        badgeClass: "bg-teal-50 text-teal-800 border-teal-300",
        stageIndex: 3,
      };
    case "POLICE_VERIFICATION_PENDING":
    case "POLICE_VERIFICATION_ASSIGNED":
      return {
        label: "Police Verification Pending",
        desc: "Assigned to jurisdictional Police Station",
        badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
        stageIndex: 4,
      };
    case "POLICE_VERIFICATION_IN_PROGRESS":
      return {
        label: "Police Verification in Progress",
        desc: "Local police field enquiry being conducted",
        badgeClass: "bg-amber-100 text-amber-900 border-amber-400",
        stageIndex: 4,
      };
    case "POLICE_VERIFICATION_COMPLETED":
    case "POLICE_CLEARED":
      return {
        label: "Police Clearance Granted",
        desc: "Clear background verified. Under final officer scrutiny.",
        badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-300",
        stageIndex: 4,
      };
    case "POLICE_VERIFICATION_FAILED":
      return {
        label: "Police Verification Adverse",
        desc: "Adverse remarks noted during police enquiry",
        badgeClass: "bg-rose-50 text-rose-800 border-rose-300",
        stageIndex: 4,
      };
    case "CLARIFICATION_REQUIRED":
    case "DOCUMENT_CORRECTION_REQUIRED":
      return {
        label: "Clarification Required",
        desc: "Action required: Passport Office requested additional details",
        badgeClass: "bg-rose-100 text-rose-900 border-rose-400 font-semibold",
        stageIndex: 5,
      };
    case "OFFICER_REVIEW":
    case "FINAL_REVIEW":
      return {
        label: "Under Officer Review",
        desc: "Senior Passport Officer conducting final evaluation",
        badgeClass: "bg-purple-50 text-purple-800 border-purple-300",
        stageIndex: 5,
      };
    case "APPROVED":
      return {
        label: "Passport Approved",
        desc: "Application approved. Queued for secure booklet printing.",
        badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-400 font-semibold",
        stageIndex: 6,
      };
    case "PRINTING":
    case "PASSPORT_PRINTING":
    case "PASSPORT_ISSUED":
      return {
        label: "Passport Printing",
        desc: "Passport booklet being personalized and laser-engraved",
        badgeClass: "bg-cyan-50 text-cyan-800 border-cyan-300",
        stageIndex: 6,
      };
    case "DISPATCHED":
    case "PASSPORT_DISPATCHED":
      return {
        label: "Passport Dispatched",
        desc: "Handed over to India Post Speed Post for delivery",
        badgeClass: "bg-blue-100 text-blue-900 border-blue-400 font-semibold",
        stageIndex: 7,
      };
    case "DELIVERED":
    case "COMPLETED":
      return {
        label: "Delivered",
        desc: "Delivered successfully to applicant's registered address",
        badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-400 font-semibold",
        stageIndex: 7,
      };
    case "REJECTED":
      return {
        label: "Application Rejected",
        desc: "Application rejected by Passport Authority. Check remarks.",
        badgeClass: "bg-red-100 text-red-900 border-red-400 font-semibold",
        stageIndex: 5,
      };
    default:
      return {
        label: status.replace(/_/g, " "),
        desc: "Processing application",
        badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
        stageIndex: 1,
      };
  }
}
