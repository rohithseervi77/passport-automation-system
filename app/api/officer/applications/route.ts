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
      return NextResponse.json({ error: "Access denied. Passport Officer privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const quotaFilter = searchParams.get("quota");
    const searchQuery = searchParams.get("q");

    const page = parseInt(searchParams.get("page") || "1");
    const limit = 15;

    const whereClause: any = {};
    if (statusFilter && statusFilter !== "ALL") {
      whereClause.status = statusFilter;
    }
    if (quotaFilter && quotaFilter !== "ALL") {
      whereClause.applicationCategory = quotaFilter;
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim();
      whereClause.OR = [
        { applicationId: { contains: q } },
        { givenName: { contains: q } },
        { surname: { contains: q } },
        { applicant: { name: { contains: q } } },
      ];
    }

    const [applicationsList, totalCount] = await Promise.all([
      prisma.application.findMany({
        where: whereClause,
        orderBy: { id: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          applicant: true,
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
            take: 10,
          },
        },
      }),
      prisma.application.count({ where: whereClause }),
    ]);

    const applications = applicationsList.map((app) => ({
      ...app,
      history: app.statusHistory,
    }));

    // Metric summaries
    const [allCount, pendingScrutinyCount, inPoliceCount, clearedCount, approvedCount, dispatchedCount, clarificationCount] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({
        where: {
          status: { in: ["SUBMITTED", "PAYMENT_COMPLETED", "APPOINTMENT_BOOKED", "DOCUMENT_VERIFICATION", "DOCUMENT_REVIEW", "DOCUMENT_VERIFIED"] },
        },
      }),
      prisma.application.count({
        where: { status: "POLICE_VERIFICATION_PENDING" },
      }),
      prisma.application.count({
        where: { status: "POLICE_VERIFICATION_COMPLETED" },
      }),
      prisma.application.count({
        where: { status: "APPROVED" },
      }),
      prisma.application.count({
        where: { status: { in: ["PRINTING", "DISPATCHED", "PASSPORT_PRINTING", "PASSPORT_ISSUED", "PASSPORT_DISPATCHED"] } },
      }),
      prisma.application.count({
        where: { status: "CLARIFICATION_REQUIRED" },
      }),
    ]);

    return NextResponse.json({
      officer: user.passportOfficer,
      applications,
      metrics: {
        total: allCount,
        pendingScrutiny: pendingScrutinyCount,
        inPolice: inPoliceCount,
        policeCleared: clearedCount,
        approved: approvedCount,
        dispatched: dispatchedCount,
        clarification: clarificationCount,
      },
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    console.error("Officer fetch applications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
