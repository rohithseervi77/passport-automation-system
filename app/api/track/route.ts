import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStatusMeta } from "@/lib/fsm";

function maskName(fullName: string): string {
  if (!fullName) return "A*******t";
  return fullName
    .split(" ")
    .map((word) => {
      if (word.length <= 2) return word;
      return word[0] + "*".repeat(word.length - 2) + word[word.length - 1];
    })
    .join(" ");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { applicationId, dob } = body;

    if (!applicationId || !applicationId.trim()) {
      return NextResponse.json(
        { error: "Application Reference Number (ARN) is required." },
        { status: 400 }
      );
    }

    const application = await prisma.application.findUnique({
      where: {
        applicationId: applicationId.trim(),
      },
      include: {
        applicant: true,
        appointment: true,
        passport: true,
        statusHistory: {
          orderBy: { changedAt: "asc" },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "No passport application found matching the provided Application Reference Number (ARN)." },
        { status: 404 }
      );
    }

    // Optional DOB validation
    if (dob && dob.trim()) {
      const inputDob = new Date(dob).toISOString().split("T")[0];
      const appDob = application.dob ? new Date(application.dob).toISOString().split("T")[0] : null;
      const userDob = application.applicant.dob ? new Date(application.applicant.dob).toISOString().split("T")[0] : null;

      if (appDob && inputDob !== appDob && inputDob !== userDob) {
        return NextResponse.json(
          { error: "Date of Birth does not match department records for this Application Reference Number." },
          { status: 401 }
        );
      }
    }

    const fullName = application.givenName 
      ? `${application.givenName} ${application.surname || ""}`.trim()
      : application.applicant.name;

    const maskedName = maskName(fullName);
    const meta = getStatusMeta(application.status as any);

    // Filter public-safe milestone timeline
    const publicTimeline = (application.statusHistory || []).map((h: any) => ({
      status: h.toStatus,
      date: h.changedAt,
      label: getStatusMeta(h.toStatus as any).label,
    }));

    return NextResponse.json({
      applicationId: application.applicationId,
      maskedName,
      serviceType: application.serviceType,
      applicationCategory: application.applicationCategory,
      rpoLocation: application.rpoLocation,
      submissionDate: application.submissionDate || application.createdAt,
      currentStatus: application.status,
      statusLabel: meta.label,
      statusDescription: meta.desc,
      stageNumber: meta.stageIndex + 1,
      badgeColor: meta.badgeClass,
      appointmentDate: application.appointment?.status === "BOOKED" ? application.appointment.date : null,
      appointmentLocation: application.appointment?.status === "BOOKED" ? application.appointment.location : null,
      passportNumber: application.passport ? `P${application.passport.passportNumber.slice(1, 3)}****${application.passport.passportNumber.slice(-2)}` : null,
      trackingNumber: application.passport?.trackingNumber || (application.status.includes("DISPATCH") ? `IN${application.applicationId.slice(-6)}TRK` : null),
      publicTimeline,
    });
  } catch (error) {
    console.error("Public track error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
