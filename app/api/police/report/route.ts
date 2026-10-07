import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      return NextResponse.json({ error: "Access denied. Police role required." }, { status: 403 });
    }

    const police = user.police;
    const body = await req.json();
    const { applicationId, clearanceStatus, remarks } = body;

    if (!applicationId || !clearanceStatus) {
      return NextResponse.json({ error: "applicationId and clearanceStatus are required." }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { applicationId },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const reportId = `REP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const report = await prisma.policeReport.create({
      data: {
        reportId,
        clearanceStatus,
        remarks: remarks || (clearanceStatus === "CLEARED" ? "Physical verification completed. Clean record." : "Adverse report recorded."),
        applicationId: application.id,
        policeId: police.id,
      },
    });

    // Update application status based on clearance
    const nextStatus = clearanceStatus === "CLEARED" ? "POLICE_CLEARED" : "REJECTED";

    const updatedApp = await prisma.application.update({
      where: { id: application.id },
      data: {
        status: nextStatus,
      },
    });

    return NextResponse.json({
      message: "Police clearance report submitted successfully.",
      report,
      application: updatedApp,
    });
  } catch (error) {
    console.error("Submit police report error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
