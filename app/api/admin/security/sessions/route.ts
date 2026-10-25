import { NextResponse } from "next/server";
import { requireAdmin, getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const currentSession = await getCurrentSession();

    // Active sessions: logged in within last 48 hours without logout or revocation
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const activeSessions = await prisma.loginHistory.findMany({
      where: {
        success: true,
        logoutTime: null,
        isRevoked: false,
        loginTime: { gte: twoDaysAgo },
      },
      orderBy: { loginTime: "desc" },
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    const formatted = activeSessions.map((s) => ({
      id: s.id,
      sessionId: s.sessionId,
      email: s.email,
      role: s.role,
      user: s.user,
      loginTime: s.loginTime,
      ipAddress: s.ipAddress || "Internal Gateway",
      userAgent: s.userAgent || "Standard Browser Client",
      isCurrent: s.sessionId === currentSession?.sessionId,
    }));

    return NextResponse.json({
      sessions: formatted,
      totalActive: formatted.length,
    });
  } catch (error) {
    console.error("Active sessions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const currentSession = await getCurrentSession();
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
    }

    // Safety: warn if revoking current session
    const isCurrent = sessionId === currentSession?.sessionId;

    await prisma.loginHistory.updateMany({
      where: { sessionId },
      data: {
        logoutTime: new Date(),
        isRevoked: true,
      },
    });

    await logAuditEvent({
      userId: admin.id,
      action: "ADMIN_REVOKED_SESSION",
      entityId: sessionId,
      details: {
        revokedBy: admin.admin?.adminCode,
        isCurrentSession: isCurrent,
      },
    });

    return NextResponse.json({
      message: "Session successfully revoked. Associated tokens are now invalid.",
      sessionId,
      isCurrentSession: isCurrent,
    });
  } catch (error) {
    console.error("Revoke session error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
