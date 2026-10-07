import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { passportOfficer: true },
    });

    if (!user || user.role !== "OFFICER") {
      return NextResponse.json({ error: "Access denied. Officer role required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const searchQuery = searchParams.get("q");

    const whereClause: any = {};
    if (statusFilter && statusFilter !== "ALL") {
      whereClause.status = statusFilter;
    }
    if (searchQuery) {
      whereClause.OR = [
        { applicationId: { contains: searchQuery } },
        { applicant: { name: { contains: searchQuery } } },
      ];
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      orderBy: { id: "desc" },
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

    return NextResponse.json({
      officer: user.passportOfficer,
      applications,
    });
  } catch (error) {
    console.error("Officer fetch applications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
