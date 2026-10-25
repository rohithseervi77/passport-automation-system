import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "asc" },
      include: {
        admin: true,
        _count: {
          select: {
            auditLogs: true,
            loginHistories: true,
          },
        },
      },
    });

    const formatted = admins.map((a) => ({
      id: a.id,
      username: a.username,
      email: a.email,
      adminCode: a.admin?.adminCode || "ADM-SYS",
      isActive: a.isActive,
      lastLoginAt: a.lastLoginAt,
      createdAt: a.createdAt,
      auditLogCount: a._count.auditLogs,
      loginCount: a._count.loginHistories,
      isSelf: a.id === admin.id,
    }));

    return NextResponse.json({
      administrators: formatted,
      totalCount: formatted.length,
    });
  } catch (error) {
    console.error("Administrators list error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
