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

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallel aggregate queries
    const [
      totalUsers,
      activeUsers,
      applicantCount,
      officerCount,
      policeCount,
      adminCount,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      totalApplications,
      draftApps,
      submittedApps,
      policePendingApps,
      policeCompletedApps,
      appointmentBookedApps,
      approvedApps,
      dispatchedApps,
      rejectedApps,
      clarificationApps,
      loginsToday,
      failedLoginsToday,
      activeSessions,
      recentAuditLogs,
      recentApplications,
    ] = await Promise.all([
      // Users
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "APPLICANT" } }),
      prisma.user.count({ where: { role: "OFFICER" } }),
      prisma.user.count({ where: { role: "POLICE" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
      // Applications
      prisma.application.count(),
      prisma.application.count({ where: { status: "DRAFT" } }),
      prisma.application.count({ where: { status: "SUBMITTED" } }),
      prisma.application.count({ where: { status: "POLICE_VERIFICATION_PENDING" } }),
      prisma.application.count({ where: { status: "POLICE_VERIFICATION_COMPLETED" } }),
      prisma.application.count({ where: { status: "APPOINTMENT_BOOKED" } }),
      prisma.application.count({ where: { status: "APPROVED" } }),
      prisma.application.count({ where: { status: { in: ["PRINTING", "DISPATCHED", "PASSPORT_DISPATCHED", "PASSPORT_ISSUED"] } } }),
      prisma.application.count({ where: { status: "REJECTED" } }),
      prisma.application.count({ where: { status: "CLARIFICATION_REQUIRED" } }),
      // Security & Activity
      prisma.loginHistory.count({ where: { loginTime: { gte: todayStart }, success: true } }),
      prisma.loginHistory.count({ where: { loginTime: { gte: todayStart }, success: false } }),
      prisma.loginHistory.count({
        where: {
          success: true,
          logoutTime: null,
          isRevoked: false,
          loginTime: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
      // Recent audit logs
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          user: {
            select: { username: true, role: true, email: true },
          },
        },
      }),
      // Recent applications
      prisma.application.findMany({
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: {
          applicant: { select: { name: true } },
        },
      }),
    ]);

    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        applicants: applicantCount,
        officers: officerCount,
        police: policeCount,
        admins: adminCount,
        newToday: newUsersToday,
        newWeek: newUsersWeek,
        newMonth: newUsersMonth,
      },
      applications: {
        total: totalApplications,
        draft: draftApps,
        submitted: submittedApps,
        policePending: policePendingApps,
        policeCompleted: policeCompletedApps,
        appointmentBooked: appointmentBookedApps,
        approved: approvedApps,
        dispatched: dispatchedApps,
        rejected: rejectedApps,
        clarification: clarificationApps,
      },
      security: {
        loginsToday,
        failedLoginsToday,
        activeSessions,
      },
      recentAuditLogs,
      recentApplications,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
