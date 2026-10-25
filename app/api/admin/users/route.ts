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
    const roleFilter = searchParams.get("role");
    const statusFilter = searchParams.get("status"); // ALL, ACTIVE, SUSPENDED
    const searchQuery = searchParams.get("q") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 15;

    const whereClause: any = {};

    if (roleFilter && roleFilter !== "ALL") {
      whereClause.role = roleFilter;
    }

    if (statusFilter === "ACTIVE") {
      whereClause.isActive = true;
    } else if (statusFilter === "SUSPENDED") {
      whereClause.isActive = false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      whereClause.OR = [
        { username: { contains: q } },
        { email: { contains: q } },
        { applicant: { name: { contains: q } } },
        { passportOfficer: { officerId: { contains: q } } },
        { police: { badgeNumber: { contains: q } } },
        { admin: { adminCode: { contains: q } } },
      ];
    }

    const [usersList, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          applicant: {
            include: {
              applications: {
                select: { id: true, applicationId: true, status: true },
              },
            },
          },
          passportOfficer: true,
          police: true,
          admin: true,
          _count: {
            select: {
              loginHistories: true,
              notifications: true,
            },
          },
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const users = usersList.map((u) => {
      let displayName = u.username;
      if (u.applicant?.name) displayName = u.applicant.name;
      const appCount = u.applicant?.applications?.length || 0;

      return {
        id: u.id,
        authUserId: u.authUserId,
        username: u.username,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        displayName,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
        applicationCount: appCount,
        loginCount: u._count.loginHistories,
        roleDetails: {
          applicantId: u.applicant?.applicantId || null,
          officerId: u.passportOfficer?.officerId || null,
          badgeNumber: u.police?.badgeNumber || null,
          stationCode: u.police?.stationCode || null,
          adminCode: u.admin?.adminCode || null,
        },
      };
    });

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
