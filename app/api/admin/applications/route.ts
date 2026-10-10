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
      include: { admin: true },
    });

    if (!user || user.role !== "ADMIN" || !user.admin) {
      return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
    }

    // Get URL parameters for pagination/filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    const where = status && status !== "ALL" ? { status } : {};

    const [applications, totalCount] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          applicant: true,
          officer: true,
          statusHistory: {
            orderBy: { changedAt: 'desc' },
            take: 1
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Admin applications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
