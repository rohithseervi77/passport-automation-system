import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    // Applications that either need police enquiry or have already had a report submitted
    const enquiries = await prisma.application.findMany({
      where: {
        OR: [
          { status: "POLICE_VERIFICATION_PENDING" },
          { policeReports: { some: {} } },
        ],
      },
      orderBy: { id: "desc" },
      include: {
        applicant: true,
        documents: true,
        policeReports: {
          include: {
            police: true,
          },
        },
      },
    });

    return NextResponse.json({
      police,
      enquiries,
    });
  } catch (error) {
    console.error("Police fetch enquiries error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
