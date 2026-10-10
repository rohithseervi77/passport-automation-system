import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET appointment for applicant
export async function GET() {
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
          include: {
            appointment: true,
          },
        },
      },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    const application = applicant.applications[0];
    return NextResponse.json({
      applicant,
      appointment: application?.appointment || null,
      applicationId: application?.applicationId || null,
      status: application?.status || null,
    });
  } catch (error) {
    console.error("Fetch appointment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST book / schedule appointment
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
          include: {
            appointment: true,
          },
        },
      },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    const application = applicant.applications[0];
    if (!application) {
      return NextResponse.json({ error: "Please create an application first before scheduling an appointment" }, { status: 400 });
    }

    const body = await req.json();
    const { date, timeSlot } = body;

    if (!date || !timeSlot) {
      return NextResponse.json({ error: "Date and time slot are required" }, { status: 400 });
    }

    const appointmentDate = new Date(date);
    const appointmentId = `APT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    let appointment;
    try {
      if (application.appointment) {
        // Update existing appointment
        appointment = await prisma.appointment.update({
          where: { id: application.appointment.id },
          data: {
            date: appointmentDate,
            timeSlot,
            status: "BOOKED",
          },
        });
      } else {
        // Create new appointment
        appointment = await prisma.appointment.create({
          data: {
            appointmentId,
            date: appointmentDate,
            timeSlot,
            status: "BOOKED",
            applicationId: application.id,
          },
        });
      }
    } catch (dbError: any) {
      if (dbError.code === "P2002") {
        return NextResponse.json(
          { error: "This time slot was just booked by someone else. Please choose another slot." },
          { status: 409 }
        );
      }
      throw dbError;
    }

    // Update application status to APPOINTMENT_BOOKED via FSM if it is currently eligible
    const { transitionApplicationStatus } = await import("@/lib/applicationService");
    let updatedApp: any = application;
    try {
      if (application.status === "APPOINTMENT_PENDING" || application.status === "PAYMENT_COMPLETED") {
        updatedApp = await transitionApplicationStatus(application.id, "APPOINTMENT_BOOKED", userId, "Applicant booked appointment");
      }
    } catch (fsmError) {
      console.log("FSM transition non-critical error:", fsmError);
    }

    return NextResponse.json({
      message: "Appointment scheduled successfully",
      appointment,
      status: updatedApp.status
    });
  } catch (error) {
    console.error("Schedule appointment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE cancel appointment
export async function DELETE() {
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
          include: {
            appointment: true,
          },
        },
      },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    const application = applicant.applications[0];
    if (!application || !application.appointment) {
      return NextResponse.json({ error: "No appointment found to cancel" }, { status: 404 });
    }

    await prisma.appointment.delete({
      where: { id: application.appointment.id },
    });

    return NextResponse.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
