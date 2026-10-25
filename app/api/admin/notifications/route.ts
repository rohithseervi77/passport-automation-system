import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const notifications = await prisma.notification.findMany({
      take: 50,
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

    const totalCount = await prisma.notification.count();
    const unreadCount = await prisma.notification.count({ where: { isRead: false } });

    return NextResponse.json({
      notifications,
      totalCount,
      unreadCount,
    });
  } catch (error) {
    console.error("Admin notifications fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { title, message, type = "INFO", targetRole } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required." }, { status: 400 });
    }

    // Determine target users
    const whereClause: any = { isActive: true };
    if (targetRole && targetRole !== "ALL") {
      whereClause.role = targetRole;
    }

    const recipients = await prisma.user.findMany({
      where: whereClause,
      select: { id: true },
    });

    if (recipients.length === 0) {
      return NextResponse.json({ message: "No active users found for the selected target audience.", count: 0 });
    }

    // Create notifications in batch
    await prisma.notification.createMany({
      data: recipients.map((u) => ({
        userId: u.id,
        title,
        message,
        type: ["INFO", "SUCCESS", "WARNING", "ALERT"].includes(type) ? type : "INFO",
        isRead: false,
      })),
    });

    await logAuditEvent({
      userId: admin.id,
      action: "ADMIN_BROADCAST_NOTIFICATION",
      entityId: `BROADCAST-${Date.now()}`,
      details: {
        title,
        targetRole: targetRole || "ALL",
        recipientsCount: recipients.length,
        adminCode: admin.admin?.adminCode,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Broadcast message sent to ${recipients.length} user(s).`,
      count: recipients.length,
    });
  } catch (error) {
    console.error("Admin broadcast notification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
