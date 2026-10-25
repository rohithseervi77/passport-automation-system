import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: any = {};
    if (status && status !== "ALL") where.status = status;
    if (category && category !== "ALL") where.category = category;
    if (search) {
      where.OR = [
        { ticketId: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { user: { username: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const grievances = await prisma.grievance.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });

    const openCount = await prisma.grievance.count({ where: { status: "OPEN" } });
    const inReviewCount = await prisma.grievance.count({ where: { status: "IN_REVIEW" } });
    const resolvedCount = await prisma.grievance.count({ where: { status: "RESOLVED" } });

    return NextResponse.json({
      grievances,
      openCount,
      inReviewCount,
      resolvedCount,
      totalCount: grievances.length,
    });
  } catch (error) {
    console.error("Admin grievances fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { ticketId, status, response } = body;

    if (!ticketId || !status) {
      return NextResponse.json({ error: "ticketId and status are required." }, { status: 400 });
    }

    const updated = await prisma.grievance.update({
      where: { ticketId },
      data: {
        status,
        response: response || undefined,
        respondedAt: response ? new Date() : undefined,
        respondedBy: `${admin.admin?.adminCode || admin.username} (ADMIN)`,
      },
    });

    await logAuditEvent({
      userId: admin.id,
      action: "ADMIN_GRIEVANCE_RESOLVED",
      entityId: ticketId,
      details: {
        status,
        responseSnippet: response ? response.substring(0, 100) : null,
        adminCode: admin.admin?.adminCode,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Ticket ${ticketId} updated to ${status}.`,
      grievance: updated,
    });
  } catch (error) {
    console.error("Admin grievance update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
