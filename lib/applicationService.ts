import { prisma } from "./prisma";
import { canTransition, ApplicationStatus } from "./fsm";

export async function transitionApplicationStatus(
  applicationId: number,
  newStatus: ApplicationStatus,
  changedById: number,
  remarks?: string
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new Error("Application not found.");
  }

  const currentStatus = application.status;

  if (!canTransition(currentStatus, newStatus)) {
    throw new Error(`Illegal state transition from ${currentStatus} to ${newStatus}`);
  }

  // Use a transaction to guarantee atomic state update and history logging
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
        remarks: remarks || `Transitioned to ${newStatus}`,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: changedById,
        action: "STATUS_TRANSITION",
        entityId: application.applicationId,
        details: JSON.stringify({ from: currentStatus, to: newStatus }),
      }
    })
  ]);

  return updatedApp;
}
