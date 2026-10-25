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

    // Status breakdown
    const statusCounts = await prisma.application.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    // Service type breakdown
    const serviceCounts = await prisma.application.groupBy({
      by: ["serviceType"],
      _count: { serviceType: true },
    });

    // Category / Quota breakdown
    const quotaCounts = await prisma.application.groupBy({
      by: ["applicationCategory"],
      _count: { applicationCategory: true },
    });

    // Police clearance distribution
    const policeClearanceCounts = await prisma.policeReport.groupBy({
      by: ["clearanceStatus"],
      _count: { clearanceStatus: true },
    });

    // Officer workloads
    const officerWorkloads = await prisma.passportOfficer.findMany({
      include: {
        user: { select: { username: true, email: true } },
        _count: {
          select: {
            assignedApplications: true,
            passports: true,
          },
        },
      },
      take: 10,
    });

    // Police Station workloads
    const policeWorkloads = await prisma.police.findMany({
      include: {
        _count: {
          select: {
            reports: true,
          },
        },
      },
      take: 10,
    });

    return NextResponse.json({
      statusDistribution: statusCounts.map((s) => ({ status: s.status, count: s._count.status })),
      serviceDistribution: serviceCounts.map((s) => ({ service: s.serviceType, count: s._count.serviceType })),
      quotaDistribution: quotaCounts.map((q) => ({ quota: q.applicationCategory, count: q._count.applicationCategory })),
      policeClearanceDistribution: policeClearanceCounts.map((p) => ({
        clearanceStatus: p.clearanceStatus,
        count: p._count.clearanceStatus,
      })),
      officerWorkloads: officerWorkloads.map((o) => ({
        officerId: o.officerId,
        name: o.user.username,
        assignedApps: o._count.assignedApplications,
        passportsIssued: o._count.passports,
      })),
      policeWorkloads: policeWorkloads.map((p) => ({
        badgeNumber: p.badgeNumber,
        stationCode: p.stationCode,
        reportsFiled: p._count.reports,
      })),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
