import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transitionApplicationStatus } from "@/lib/applicationService";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { police: true },
    });

    if (!user || user.role !== "POLICE" || !user.police) {
      return NextResponse.json({ error: "Access denied. Police Authority credentials required." }, { status: 403 });
    }

    const police = user.police;
    const body = await req.json();
    const { applicationId, clearanceStatus, remarks, adverseReason, stationCode } = body;

    if (!applicationId || !clearanceStatus) {
      return NextResponse.json({ error: "applicationId and clearanceStatus are required." }, { status: 400 });
    }

    // Hard Rule: Police Authority can only CLEAR, ADVERSE, PENDING, or CLARIFICATION_REQUIRED
    // Police must NEVER be able to grant or approve passport issuance
    const ALLOWED_POLICE_STATUSES = ["CLEAR", "CLEARED", "ADVERSE", "PENDING", "CLARIFICATION_REQUIRED"];
    if (!ALLOWED_POLICE_STATUSES.includes(clearanceStatus)) {
      return NextResponse.json({ 
        error: "Invalid police verification outcome. Permitted values are CLEAR, ADVERSE, PENDING, or CLARIFICATION_REQUIRED. Police Authority does not possess statutory authority to approve or grant passports." 
      }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { applicationId },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found in police enquiry registry." }, { status: 404 });
    }

    const normalizedClearance = clearanceStatus === "CLEAR" ? "CLEARED" : clearanceStatus;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const reportId = `PVR${dateStr}${Math.floor(1000 + Math.random() * 9000)}`;

    const report = await prisma.policeReport.create({
      data: {
        reportId,
        clearanceStatus: normalizedClearance,
        remarks: remarks || (normalizedClearance === "CLEARED" 
          ? "Physical residential enquiry conducted. Local residents interviewed. Clean CCTNS records with no adverse criminal history." 
          : "Adverse background report registered."),
        adverseReason: normalizedClearance === "ADVERSE" ? (adverseReason || "Adverse criminal background detected in police jurisdiction.") : null,
        stationCode: stationCode || police.stationCode || "PS-CENTRAL",
        verifiedAt: new Date(),
        applicationId: application.id,
        policeId: police.id,
      },
    });

    // Update application status based on police verification outcome
    // Police report transmits to Regional Passport Office for final Officer decision
    let nextStatus: import("@/lib/fsm").ApplicationStatus;
    if (normalizedClearance === "CLEARED" || normalizedClearance === "ADVERSE") {
      nextStatus = "POLICE_VERIFICATION_COMPLETED";
    } else if (normalizedClearance === "CLARIFICATION_REQUIRED") {
      nextStatus = "CLARIFICATION_REQUIRED";
    } else {
      nextStatus = "POLICE_VERIFICATION_PENDING";
    }

    await logAuditEvent({
      userId: user.id,
      action: "POLICE_VERIFICATION_SUBMITTED",
      entityId: application.applicationId,
      details: {
        reportId,
        clearanceStatus,
        stationCode: police.stationCode,
        adverseReason,
      },
    });

    let updatedApp;
    try {
      updatedApp = await transitionApplicationStatus(
        application.id,
        nextStatus,
        user.id,
        `Police verification report submitted: ${clearanceStatus}. Report ID: ${reportId}`
      );
    } catch (e: any) {
      console.warn("FSM notice:", e.message);
    }

    return NextResponse.json({
      message: clearanceStatus === "ADVERSE"
        ? "Adverse verification report registered. Application flagged to Passport Office."
        : "Police Clearance Certificate transmitted successfully to the Regional Passport Office!",
      report,
      application: updatedApp,
    });
  } catch (error) {
    console.error("Submit police report error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
