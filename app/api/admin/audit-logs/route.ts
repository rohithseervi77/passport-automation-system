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
    const actionFilter = searchParams.get("action");
    const searchQuery = searchParams.get("q") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 25;

    const where: any = {};

    if (actionFilter && actionFilter !== "ALL") {
      where.action = actionFilter;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      where.OR = [
        { action: { contains: q } },
        { entityId: { contains: q } },
        { details: { contains: q } },
        { user: { email: { contains: q } } },
        { user: { username: { contains: q } } },
      ];
    }

    const [logs, totalCount, actionTypes] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        distinct: ["action"],
        select: { action: true },
        take: 30,
      }),
    ]);

    return NextResponse.json({
      logs,
      actionTypes: actionTypes.map((a) => a.action),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Audit logs error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
