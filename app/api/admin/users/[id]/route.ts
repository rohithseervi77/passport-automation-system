import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        applicant: {
          include: {
            applications: {
              orderBy: { id: "desc" },
              include: {
                documents: true,
                appointment: true,
                policeReports: true,
                passport: true,
              },
            },
          },
        },
        passportOfficer: {
          include: {
            assignedApplications: { take: 5, orderBy: { id: "desc" } },
          },
        },
        police: {
          include: {
            reports: { take: 5, orderBy: { id: "desc" } },
          },
        },
        admin: true,
        loginHistories: {
          orderBy: { loginTime: "desc" },
          take: 10,
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        authUserId: user.authUserId,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        failedLoginAttempts: user.failedLoginAttempts,
        lockedUntil: user.lockedUntil,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        applicant: user.applicant,
        passportOfficer: user.passportOfficer,
        police: user.police,
        admin: user.admin,
        loginHistories: user.loginHistories,
        auditLogs: user.auditLogs,
      },
    });
  } catch (error) {
    console.error("User details error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID." }, { status: 400 });
    }

    const body = await req.json();
    const { action, reason } = body;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Safeguard: cannot suspend yourself
    if (admin.id === targetUser.id && (action === "SUSPEND" || action === "DEACTIVATE")) {
      return NextResponse.json(
        { error: "Administrative self-suspension is prohibited. Another administrator must perform this action." },
        { status: 400 }
      );
    }

    let updatedIsActive = targetUser.isActive;
    let actionLabel = "";

    if (action === "SUSPEND" || action === "DEACTIVATE") {
      updatedIsActive = false;
      actionLabel = "ACCOUNT_SUSPENDED";
    } else if (action === "ACTIVATE") {
      updatedIsActive = true;
      actionLabel = "ACCOUNT_ACTIVATED";
    } else if (action === "UNLOCK") {
      // Clear failed login lockout
      await prisma.user.update({
        where: { id: userId },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
      actionLabel = "ACCOUNT_UNLOCKED";
    } else {
      return NextResponse.json({ error: "Invalid status update action." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: updatedIsActive,
      },
    });

    // Revoke all active sessions for the user if suspended
    if (!updatedIsActive && targetUser.authUserId) {
      await prisma.loginHistory.updateMany({
        where: { authUserId: targetUser.authUserId, logoutTime: null },
        data: { logoutTime: new Date(), isRevoked: true },
      });
    }

    await logAuditEvent({
      userId: admin.id,
      action: actionLabel,
      entityId: targetUser.email,
      details: {
        targetUserId: targetUser.id,
        targetEmail: targetUser.email,
        reason: reason || "Administrative action",
      },
    });

    return NextResponse.json({
      message: `User account status updated: ${actionLabel}`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
