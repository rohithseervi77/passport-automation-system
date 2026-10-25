import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status"); // SUCCESS, FAILED, ALL
    const roleFilter = searchParams.get("role");
    const searchQuery = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    const where: any = {};

    if (statusFilter === "SUCCESS") {
      where.success = true;
    } else if (statusFilter === "FAILED") {
      where.success = false;
    }

    if (roleFilter && roleFilter !== "ALL") {
      where.role = roleFilter;
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim();
      where.OR = [
        { email: { contains: q } },
        { authUserId: { contains: q } },
        { ipAddress: { contains: q } },
      ];
    }

    const [logins, totalCount, totalLogins, failedAttempts] = await Promise.all([
      prisma.loginHistory.findMany({
        where,
        orderBy: { loginTime: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.loginHistory.count({ where }),
      prisma.loginHistory.count(),
      prisma.loginHistory.count({ where: { success: false } }),
    ]);

    const successfulLogins = totalLogins - failedAttempts;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeSessions = await prisma.loginHistory.count({
      where: {
        success: true,
        logoutTime: null,
        loginTime: { gte: oneDayAgo },
      },
    });

    return NextResponse.json({
      logins,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      stats: {
        totalLogins,
        successfulLogins,
        failedAttempts,
        activeSessions,
      },
    });
  } catch (error) {
    console.error("Admin login history error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
