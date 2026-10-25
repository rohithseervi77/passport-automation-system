import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transitionApplicationStatus } from "@/lib/applicationService";
import { getStatusMeta } from "@/lib/fsm";

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
            documents: true,
            appointment: true,
            policeReports: {
              orderBy: { id: "desc" },
              include: {
                police: true,
              },
            },
            passport: true,
            officer: true,
            statusHistory: {
              orderBy: { changedAt: "desc" },
              take: 20,
            },
          },
        },
      },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    const application = applicant.applications[0] || null;

    // Canonical 8 milestone progression stages
    const milestones = [
      { key: "SUBMITTED", label: "Application Submitted", desc: "Particulars recorded & ARN allocated" },
      { key: "PAYMENT_COMPLETED", label: "Fee Payment", desc: "Statutory fee reconciled" },
      { key: "APPOINTMENT_BOOKED", label: "Appointment & Biometrics", desc: "PSK slot & photo/fingerprints captured" },
      { key: "DOCUMENT_VERIFICATION", label: "Document Scrutiny", desc: "Original credentials verified by Verifying Officer" },
      { key: "POLICE_VERIFICATION_PENDING", label: "Police Verification", desc: "Local station background enquiry conducted" },
      { key: "OFFICER_REVIEW", label: "Officer Decision", desc: "Granting officer final assessment" },
      { key: "APPROVED", label: "Passport Approved", desc: "Clearance granted for booklet printing" },
      { key: "DISPATCHED", label: "Dispatched", desc: "Booklet printed & handed over to India Post" },
    ];

    const currentMeta = application ? getStatusMeta(application.status as any) : null;

    return NextResponse.json({
      applicant: {
        name: applicant.name,
        email: applicant.user.email,
        phone: application?.emergencyMobile || "N/A",
      },
      application: application ? {
        ...application,
        history: application.statusHistory,
      } : null,
      currentMeta: currentMeta ? {
        ...currentMeta,
        stage: currentMeta.stageIndex + 1,
      } : null,
      milestones,
    });
  } catch (error) {
    console.error("Fetch status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: applicant responds to clarification request
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
        },
      },
    });

    const application = applicant?.applications[0];
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const body = await req.json();
    const { clarificationResponse } = body;

    if (!clarificationResponse || !clarificationResponse.trim()) {
      return NextResponse.json({ error: "Clarification response explanation cannot be empty." }, { status: 400 });
    }

    await prisma.application.update({
      where: { id: application.id },
      data: {
        clarificationResponse: clarificationResponse.trim(),
        clarificationRespondedAt: new Date(),
      },
    });

    // Advance status back to OFFICER_REVIEW
    try {
      await transitionApplicationStatus(
        application.id,
        "OFFICER_REVIEW",
        userId,
        `Applicant provided clarification response: "${clarificationResponse.trim().substring(0, 80)}..."`
      );
    } catch (e: any) {
      console.warn("Status transition notice:", e.message);
    }

    return NextResponse.json({
      message: "Clarification response recorded successfully and forwarded to the Passport Officer for re-scrutiny.",
    });
  } catch (error) {
    console.error("Clarification response error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
