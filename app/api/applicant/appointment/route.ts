import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transitionApplicationStatus } from "@/lib/applicationService";

// GET appointment details for logged-in applicant
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applicant = await prisma.applicant.findUnique({
      where: { userId },
      include: {
        user: true,
        applications: {
          orderBy: { id: "desc" },
          take: 1,
          include: {
            appointment: true,
            payments: {
              where: { status: "SUCCESS" },
              orderBy: { id: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    const application = applicant.applications[0];
    const isPaymentCompleted = (application?.payments && application.payments.length > 0) || 
      ["PAYMENT_COMPLETED", "APPOINTMENT_PENDING", "APPOINTMENT_BOOKED", "APPOINTMENT_SCHEDULED", "DOCUMENT_VERIFICATION", "POLICE_VERIFICATION_PENDING", "APPROVED"].includes(application?.status || "");

    return NextResponse.json({
      applicant: {
        name: applicant.name,
        email: applicant.user.email,
        phone: application?.emergencyMobile || "N/A",
      },
      application: application ? {
        id: application.id,
        applicationId: application.applicationId,
        serviceType: application.serviceType,
        applicationCategory: application.applicationCategory,
        bookletType: application.bookletType,
        rpoLocation: application.rpoLocation,
        status: application.status,
        givenName: application.givenName,
        surname: application.surname,
      } : null,
      appointment: application?.appointment || null,
      isPaymentCompleted,
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
            payments: { where: { status: "SUCCESS" } },
          },
        },
      },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    const application = applicant.applications[0];
    if (!application) {
      return NextResponse.json({ error: "No active application found. Please complete application first." }, { status: 400 });
    }

    const isPaid = (application.payments && application.payments.length > 0) || 
      ["PAYMENT_COMPLETED", "APPOINTMENT_PENDING", "APPOINTMENT_BOOKED", "APPOINTMENT_SCHEDULED", "DOCUMENT_VERIFICATION"].includes(application.status);

    if (!isPaid) {
      return NextResponse.json({ 
        error: "Statutory passport fee payment is mandatory before booking an appointment. Please complete payment first." 
      }, { status: 402 });
    }

    const body = await req.json();
    const { date, timeSlot, location, quota } = body;

    if (!date || !timeSlot) {
      return NextResponse.json({ error: "Appointment date and time slot are required." }, { status: 400 });
    }

    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return NextResponse.json({ error: "Invalid appointment date." }, { status: 400 });
    }

    const selectedLocation = location || "Regional Passport Seva Kendra (PSK) Chennai - Saligramam";
    const selectedQuota = quota || application.applicationCategory || "NORMAL";

    let appointment;
    if (application.appointment) {
      // Rescheduling existing slot
      if (application.appointment.rescheduleCount >= 3) {
        return NextResponse.json({ 
          error: "Maximum reschedule limit (3 times) reached. Further slot modifications require visiting RPO helpdesk." 
        }, { status: 400 });
      }

      appointment = await prisma.appointment.update({
        where: { id: application.appointment.id },
        data: {
          date: appointmentDate,
          timeSlot,
          location: selectedLocation,
          quota: selectedQuota,
          status: "BOOKED",
          rescheduleCount: application.appointment.rescheduleCount + 1,
        },
      });

      // Status update
      try {
        await transitionApplicationStatus(
          application.id,
          "APPOINTMENT_BOOKED",
          userId,
          `Appointment rescheduled to ${appointmentDate.toLocaleDateString("en-IN")} (${timeSlot}) at ${selectedLocation}.`
        );
      } catch (e: any) {
        console.warn("Transition warning:", e.message);
      }
    } else {
      // Create fresh appointment
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const appointmentId = `APT${dateStr}${randomSuffix}`;

      appointment = await prisma.appointment.create({
        data: {
          appointmentId,
          location: selectedLocation,
          quota: selectedQuota,
          date: appointmentDate,
          timeSlot,
          status: "BOOKED",
          rescheduleCount: 0,
          applicationId: application.id,
        },
      });

      try {
        await transitionApplicationStatus(
          application.id,
          "APPOINTMENT_BOOKED",
          userId,
          `Appointment confirmed for ${appointmentDate.toLocaleDateString("en-IN")} (${timeSlot}) at ${selectedLocation}.`
        );
      } catch (e: any) {
        console.warn("Transition warning:", e.message);
      }
    }

    return NextResponse.json({
      message: "Appointment confirmed successfully! Please download and print your Appointment Slip.",
      appointment,
    });
  } catch (error) {
    console.error("Booking error:", error);
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
          include: { appointment: true },
        },
      },
    });

    const application = applicant?.applications[0];
    if (!application || !application.appointment) {
      return NextResponse.json({ error: "No active appointment to cancel." }, { status: 404 });
    }

    await prisma.appointment.update({
      where: { id: application.appointment.id },
      data: { status: "CANCELLED" },
    });

    try {
      await transitionApplicationStatus(
        application.id,
        "APPOINTMENT_PENDING",
        userId,
        "Appointment slot cancelled by applicant. Slot released."
      );
    } catch (e: any) {
      console.warn("Transition warning:", e.message);
    }

    return NextResponse.json({ message: "Appointment cancelled. You may schedule a new slot anytime." });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
