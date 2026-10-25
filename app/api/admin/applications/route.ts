import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const serviceType = searchParams.get("serviceType");
    const quota = searchParams.get("quota");
    const searchQuery = searchParams.get("q") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 20;

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (serviceType && serviceType !== "ALL") {
      where.serviceType = serviceType;
    }

    if (quota && quota !== "ALL") {
      where.applicationCategory = quota;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      where.OR = [
        { applicationId: { contains: q } },
        { givenName: { contains: q } },
        { surname: { contains: q } },
        { applicant: { name: { contains: q } } },
      ];
    }

    const [applications, totalCount] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          applicant: true,
          officer: true,
          appointment: true,
          policeReports: {
            take: 1,
            orderBy: { id: "desc" },
          },
          statusHistory: {
            orderBy: { changedAt: "desc" },
            take: 1,
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Admin applications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
