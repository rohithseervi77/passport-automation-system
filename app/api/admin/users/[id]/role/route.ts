import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(
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
    const { newRole, reason } = body;

    const VALID_ROLES = ["ADMIN", "OFFICER", "POLICE", "APPLICANT"];
    if (!newRole || !VALID_ROLES.includes(newRole)) {
      return NextResponse.json({ error: "Invalid role specified. Permitted roles: ADMIN, OFFICER, POLICE, APPLICANT." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        admin: true,
        passportOfficer: true,
        police: true,
        applicant: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (targetUser.role === newRole) {
      return NextResponse.json({ message: "User already holds the requested role." });
    }

    // Safeguard 1: Prevent accidental self-demotion
    if (admin.id === targetUser.id && newRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Administrative self-demotion is prevented. Another administrator must modify your role." },
        { status: 400 }
      );
    }

    // Safeguard 2: Prevent removing the LAST remaining active administrator
    if (targetUser.role === "ADMIN" && newRole !== "ADMIN") {
      const activeAdminCount = await prisma.user.count({
        where: { role: "ADMIN", isActive: true },
      });
      if (activeAdminCount <= 1) {
        return NextResponse.json(
          { error: "Operation prohibited: Cannot demote the final active Administrator in the system." },
          { status: 400 }
        );
      }
    }

    const oldRole = targetUser.role;

    // Execute atomic role transformation with required sub-profiles
    await prisma.$transaction(async (tx) => {
      // 1. Create sub-profile for new role if not already existing
      if (newRole === "ADMIN" && !targetUser.admin) {
        await tx.admin.create({
          data: {
            adminCode: `ADM-HQ-${Math.floor(100 + Math.random() * 900)}`,
            userId: targetUser.id,
          },
        });
      } else if (newRole === "OFFICER" && !targetUser.passportOfficer) {
        await tx.passportOfficer.create({
          data: {
            officerId: `OFF-RPO-${Math.floor(1000 + Math.random() * 9000)}`,
            branchLocation: "RPO Headquarters",
            userId: targetUser.id,
          },
        });
      } else if (newRole === "POLICE" && !targetUser.police) {
        await tx.police.create({
          data: {
            badgeNumber: `POL-IND-${Math.floor(1000 + Math.random() * 9000)}`,
            stationCode: "PS-CENTRAL",
            userId: targetUser.id,
          },
        });
      } else if (newRole === "APPLICANT" && !targetUser.applicant) {
        await tx.applicant.create({
          data: {
            applicantId: `APP-${Date.now().toString().slice(-6)}`,
            name: targetUser.username,
            dob: new Date("1995-01-01"),
            address: "Passport Seva Jurisdiction",
            userId: targetUser.id,
          },
        });
      }

      // 2. Update user's role
      await tx.user.update({
        where: { id: targetUser.id },
        data: { role: newRole },
      });

      // 3. Invalidate active sessions to force re-authentication with new privileges
      if (targetUser.authUserId) {
        await tx.loginHistory.updateMany({
          where: { authUserId: targetUser.authUserId, logoutTime: null },
          data: { logoutTime: new Date(), isRevoked: true },
        });
      }
    });

    // 4. Audit Log
    await logAuditEvent({
      userId: admin.id,
      action: "USER_ROLE_CHANGED",
      entityId: targetUser.email,
      details: {
        targetUserId: targetUser.id,
        targetEmail: targetUser.email,
        oldRole,
        newRole,
        reason: reason || "Administrative role adjustment",
      },
    });

    return NextResponse.json({
      message: `User role successfully changed from ${oldRole} to ${newRole}. Existing sessions were invalidated for security.`,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        oldRole,
        newRole,
      },
    });
  } catch (error) {
    console.error("Change user role error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
