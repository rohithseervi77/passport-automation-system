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
      include: { police: true },
    });

    if (!user || user.role !== "POLICE" || !user.police) {
      return NextResponse.json({ error: "Access denied. Police Authority credentials required." }, { status: 403 });
    }

    const police = user.police;
    const { searchParams } = new URL(req.url);
    const filterStatus = searchParams.get("status") || "ALL";
    const searchQuery = searchParams.get("q") || "";

    const whereClause: any = {
      status: {
        notIn: ["CANCELLED", "EXPIRED"],
      },
    };

    if (filterStatus === "PENDING") {
      whereClause.status = "POLICE_VERIFICATION_PENDING";
    } else if (filterStatus === "CLEARED") {
      whereClause.policeReports = {
        some: { clearanceStatus: "CLEARED" },
      };
    } else if (filterStatus === "ADVERSE") {
      whereClause.policeReports = {
        some: { clearanceStatus: "ADVERSE" },
      };
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      whereClause.OR = [
        { applicationId: { contains: q } },
        { givenName: { contains: q } },
        { surname: { contains: q } },
        { applicant: { name: { contains: q } } },
        { policeStation: { contains: q } },
      ];
    }

    const enquiries = await prisma.application.findMany({
      where: whereClause,
      orderBy: { id: "desc" },
      include: {
        applicant: true,
        documents: true,
        policeReports: {
          orderBy: { id: "desc" },
          include: {
            police: true,
          },
        },
      },
    });

    // Counts for police tabs
    const [allCount, pendingCount, clearedCount, adverseCount] = await Promise.all([
      prisma.application.count({ where: { status: { notIn: ["CANCELLED", "EXPIRED"] } } }),
      prisma.application.count({ where: { status: "POLICE_VERIFICATION_PENDING" } }),
      prisma.policeReport.count({ where: { clearanceStatus: "CLEARED" } }),
      prisma.policeReport.count({ where: { clearanceStatus: "ADVERSE" } }),
    ]);

    return NextResponse.json({
      police,
      enquiries,
      counts: {
        total: allCount,
        pending: pendingCount,
        cleared: clearedCount,
        adverse: adverseCount,
      },
    });
  } catch (error) {
    console.error("Police fetch enquiries error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
