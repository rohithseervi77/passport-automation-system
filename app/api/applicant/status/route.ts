import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    const application = applicant.applications[0] || null;

    // Define canonical status progression timeline
    const stages = [
      { key: "DRAFT", label: "Draft Application", desc: "Application created by applicant" },
      { key: "SUBMITTED", label: "Application Submitted", desc: "Submitted with required details" },
      { key: "APPOINTMENT_SCHEDULED", label: "Appointment Booked", desc: "Slot booked for document verification" },
      { key: "UNDER_OFFICER_VERIFICATION", label: "Officer Verification", desc: "Passport Officer verifying documents" },
      { key: "POLICE_VERIFICATION_PENDING", label: "Police Enquiry", desc: "Forwarded to local Police Station for background check" },
      { key: "POLICE_CLEARED", label: "Police Clearance Granted", desc: "Clearance report submitted by Police authority" },
      { key: "APPROVED", label: "Application Approved", desc: "Passport Officer approved the application" },
      { key: "PASSPORT_ISSUED", label: "Passport Issued", desc: "Passport printed and booklet generated" },
      { key: "PASSPORT_DISPATCHED", label: "Passport Dispatched", desc: "Dispatched via Speed Post tracking" },
    ];

    return NextResponse.json({
      applicant,
      application,
      stages,
    });
  } catch (error) {
    console.error("Fetch status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
