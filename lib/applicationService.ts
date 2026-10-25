import { prisma } from "./prisma";
import { canTransition } from "./fsm";

export async function transitionApplicationStatus(
  applicationId: number,
  newStatus: string,
  changedById: number,
  remarks?: string,
  performedBy?: string,
  role: string = "SYSTEM"
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      applicant: {
        include: { user: true },
      },
    },
  });

  if (!application) {
    throw new Error("Application not found.");
  }

  const currentStatus = application.status;

  if (currentStatus === newStatus) {
    return application;
  }

  if (!canTransition(currentStatus, newStatus)) {
    throw new Error(`Illegal state transition from ${currentStatus} to ${newStatus}`);
  }

  const performerName = performedBy || (role === "OFFICER" ? "Passport Officer" : role === "POLICE" ? "Police Authority" : "System Automation");

  // Notifications mapping
  const notificationTitles: Record<string, { title: string; message: string; type: string }> = {
    SUBMITTED: {
      title: "Application Submitted",
      message: `Your passport application ${application.applicationId} has been successfully submitted. Next step: Fee Payment.`,
      type: "SUCCESS",
    },
    PAYMENT_COMPLETED: {
      title: "Payment Received",
      message: `Application fee for ${application.applicationId} received successfully. Please schedule your PSK appointment.`,
      type: "SUCCESS",
    },
    APPOINTMENT_BOOKED: {
      title: "Appointment Confirmed",
      message: `Biometric & document verification appointment booked for ARN ${application.applicationId}.`,
      type: "INFO",
    },
    DOCUMENT_VERIFICATION: {
      title: "Documents Under Verification",
      message: `Your physical documents are undergoing verification at the Passport Seva Kendra.`,
      type: "INFO",
    },
    POLICE_VERIFICATION_PENDING: {
      title: "Police Verification Initiated",
      message: `Application ${application.applicationId} has been forwarded to the local police station for address and criminal check.`,
      type: "INFO",
    },
    POLICE_VERIFICATION_IN_PROGRESS: {
      title: "Police Field Enquiry Active",
      message: `Local Police Station has started the field verification for your application.`,
      type: "INFO",
    },
    POLICE_VERIFICATION_COMPLETED: {
      title: "Police Clearance Granted",
      message: `Police verification successfully completed with clear status for ARN ${application.applicationId}.`,
      type: "SUCCESS",
    },
    POLICE_CLEARED: {
      title: "Police Clearance Granted",
      message: `Police verification successfully completed with clear status for ARN ${application.applicationId}.`,
      type: "SUCCESS",
    },
    CLARIFICATION_REQUIRED: {
      title: "Clarification Requested",
      message: `The Passport Office requires additional clarification or documents for ARN ${application.applicationId}. Please check your dashboard.`,
      type: "ALERT",
    },
    APPROVED: {
      title: "Passport Approved",
      message: `Congratulations! Your passport application ${application.applicationId} has been approved and queued for booklet printing.`,
      type: "SUCCESS",
    },
    PRINTING: {
      title: "Passport Under Printing",
      message: `Your passport booklet is currently being personalized and laser-engraved.`,
      type: "INFO",
    },
    PASSPORT_PRINTING: {
      title: "Passport Under Printing",
      message: `Your passport booklet is currently being personalized and laser-engraved.`,
      type: "INFO",
    },
    DISPATCHED: {
      title: "Passport Dispatched",
      message: `Your passport has been dispatched via Speed Post. You can track delivery on India Post.`,
      type: "SUCCESS",
    },
    PASSPORT_DISPATCHED: {
      title: "Passport Dispatched",
      message: `Your passport has been dispatched via Speed Post. You can track delivery on India Post.`,
      type: "SUCCESS",
    },
    REJECTED: {
      title: "Application Rejected",
      message: `Application ${application.applicationId} could not be approved. Reason: ${remarks || "Eligibility criteria not met"}.`,
      type: "ALERT",
    },
  };

  // Perform transaction
  const [updatedApp] = await prisma.$transaction([
    prisma.application.update({
      where: { id: applicationId },
      data: { status: newStatus },
    }),
    prisma.applicationStatusHistory.create({
      data: {
        applicationId,
        fromStatus: currentStatus,
        toStatus: newStatus,
        changedById,
        performedBy: performerName,
        role,
        remarks: remarks || `Status changed from ${currentStatus} to ${newStatus}`,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: changedById,
        action: "STATUS_TRANSITION",
        entityId: application.applicationId,
        details: JSON.stringify({ from: currentStatus, to: newStatus, remarks }),
      },
    }),
    ...(application.applicant?.user?.id && notificationTitles[newStatus]
      ? [
          prisma.notification.create({
            data: {
              userId: application.applicant.user.id,
              title: notificationTitles[newStatus].title,
              message: notificationTitles[newStatus].message,
              type: notificationTitles[newStatus].type,
            },
          }),
        ]
      : []),
  ]);

  return updatedApp;
}
