import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { applicationId, dob } = body;

    if (!applicationId || !dob) {
      return NextResponse.json(
        { error: "Application Reference ID and Date of Birth are required." },
        { status: 400 }
      );
    }

    const application = await prisma.application.findUnique({
      where: {
        applicationId: applicationId.trim(),
      },
      include: {
        applicant: true,
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
    });

    if (!application) {
      return NextResponse.json(
        { error: "No application found with the provided Reference ID." },
        { status: 404 }
      );
    }

    // Verify date of birth matching
    const inputDob = new Date(dob).toISOString().split("T")[0];
    const recordDob = new Date(application.applicant.dob).toISOString().split("T")[0];

    if (inputDob !== recordDob) {
      return NextResponse.json(
        { error: "Date of Birth does not match records for this Application ID." },
        { status: 401 }
      );
    }

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
      application,
      applicant: {
        name: application.applicant.name,
        applicantId: application.applicant.applicantId,
        dob: application.applicant.dob,
        address: application.applicant.address,
      },
      stages,
    });
  } catch (error) {
    console.error("Public track error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
