import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applicant = await prisma.applicant.findUnique({
      where: { userId },
      include: {
        applications: {
          orderBy: { id: "desc" },
          take: 1,
          include: { appointment: true },
        },
      },
    });

    if (!applicant || !applicant.applications[0] || !applicant.applications[0].appointment) {
      return NextResponse.json(
        { error: "No active appointment found to reschedule." },
        { status: 404 }
      );
    }

    const application = applicant.applications[0];
    const appointment = application.appointment!;

    // Max 3 reschedules allowed under passport regulations
    if (appointment.rescheduleCount >= 3) {
      return NextResponse.json(
        { error: "Maximum reschedule limit (3 attempts) reached for this application." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { newDate, newSlot, reason = "Applicant request" } = body;

    if (!newDate || !newSlot) {
      return NextResponse.json(
        { error: "newDate and newSlot are required." },
        { status: 400 }
      );
    }

    const parsedDate = new Date(newDate);

    // 1. Archive the previous appointment in AppointmentHistory
    await prisma.appointmentHistory.create({
      data: {
        appointmentId: appointment.id,
        applicationId: application.id,
        previousDate: appointment.date,
        previousSlot: appointment.timeSlot,
        newDate: parsedDate,
        newSlot,
        location: appointment.location,
        reason,
        rescheduledBy: applicant.name,
      },
    });

    // 2. Update the existing Appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        date: parsedDate,
        timeSlot: newSlot,
        rescheduleCount: appointment.rescheduleCount + 1,
        status: "RESCHEDULED",
      },
    });

    // 3. Create Notification for citizen
    await prisma.notification.create({
      data: {
        userId,
        title: "Appointment Rescheduled",
        message: `Your appointment for ARN ${application.applicationId} has been rescheduled to ${parsedDate.toLocaleDateString("en-IN")} at ${newSlot} (${appointment.location}).`,
        type: "SUCCESS",
      },
    });

    // 4. Audit Log
    await logAuditEvent({
      userId,
      action: "APPOINTMENT_RESCHEDULED",
      entityId: appointment.appointmentId,
      details: {
        applicationId: application.applicationId,
        previousDate: appointment.date,
        newDate: parsedDate,
        newSlot,
        rescheduleCount: appointment.rescheduleCount + 1,
      },
    });

    return NextResponse.json({
      message: "Appointment rescheduled successfully.",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Reschedule appointment error:", error);
    return NextResponse.json({ error: "Failed to reschedule appointment." }, { status: 500 });
  }
}
