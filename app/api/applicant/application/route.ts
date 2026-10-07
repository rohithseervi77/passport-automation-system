import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET current applicant's application
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
            documents: true,
            appointment: true,
            policeReports: {
              include: {
                police: true,
              },
            },
            passport: true,
            officer: true,
          },
        },
      },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Applicant profile not found" }, { status: 404 });
    }

    const application = applicant.applications[0] || null;

    return NextResponse.json({
      applicant,
      application,
    });
  } catch (error) {
    console.error("Fetch application error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST create, update or submit application
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

    if (!applicant) {
      return NextResponse.json({ error: "Applicant profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { passportType, action } = body;

    if (!passportType) {
      return NextResponse.json({ error: "Passport type is required" }, { status: 400 });
    }

    const isSubmit = action === "SUBMIT";
    const existingApp = applicant.applications[0];

    // If an application already exists in DRAFT state, we can update it or submit it
    if (existingApp && (existingApp.status === "DRAFT" || !isSubmit)) {
      const updated = await prisma.application.update({
        where: { id: existingApp.id },
        data: {
          passportType,
          status: isSubmit ? "SUBMITTED" : "DRAFT",
          submissionDate: isSubmit ? new Date() : existingApp.submissionDate,
        },
        include: {
          documents: true,
          appointment: true,
          policeReports: true,
          passport: true,
        },
      });

      return NextResponse.json({
        message: isSubmit ? "Application submitted successfully" : "Draft saved successfully",
        application: updated,
      });
    }

    // Otherwise create a new application
    const newAppId = `PAS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newApplication = await prisma.application.create({
      data: {
        applicationId: newAppId,
        passportType,
        status: isSubmit ? "SUBMITTED" : "DRAFT",
        submissionDate: isSubmit ? new Date() : null,
        applicantId: applicant.id,
      },
      include: {
        documents: true,
        appointment: true,
        policeReports: true,
        passport: true,
      },
    });

    return NextResponse.json({
      message: isSubmit ? "Application submitted successfully" : "Draft saved successfully",
      application: newApplication,
    });
  } catch (error) {
    console.error("Save application error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
