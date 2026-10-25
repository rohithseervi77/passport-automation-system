import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("status") || "ALL"; // ALL, PENDING, ACCEPTED, EXPIRED

    const now = new Date();
    let whereClause: any = {};

    if (filter === "PENDING") {
      whereClause = { isAccepted: false, expiresAt: { gt: now } };
    } else if (filter === "ACCEPTED") {
      whereClause = { isAccepted: true };
    } else if (filter === "EXPIRED") {
      whereClause = { isAccepted: false, expiresAt: { lte: now } };
    }

    const invitations = await prisma.adminInvitation.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const counts = {
      total: await prisma.adminInvitation.count(),
      pending: await prisma.adminInvitation.count({ where: { isAccepted: false, expiresAt: { gt: now } } }),
      accepted: await prisma.adminInvitation.count({ where: { isAccepted: true } }),
      expired: await prisma.adminInvitation.count({ where: { isAccepted: false, expiresAt: { lte: now } } }),
    };

    return NextResponse.json({ invitations, counts });
  } catch (error) {
    console.error("Fetch invitations error:", error);
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
    const { email, role = "ADMIN" } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser && existingUser.role === "ADMIN") {
      return NextResponse.json({ error: "An administrator with this email address already exists." }, { status: 409 });
    }

    // Generate cryptographically secure token
    const token = crypto.randomBytes(32).toString("hex");
    // 48 hours validity
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const invitation = await prisma.adminInvitation.create({
      data: {
        token,
        email: email.trim().toLowerCase(),
        role: "ADMIN",
        invitedBy: admin.admin?.adminCode || admin.username,
        expiresAt,
      },
    });

    await logAuditEvent({
      userId: admin.id,
      action: "ADMIN_INVITATION_CREATED",
      entityId: email,
      details: { invitedBy: admin.admin?.adminCode, expiresAt },
    });

    return NextResponse.json(
      {
        message: "Administrator invitation created successfully.",
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
          invitationLink: `/admin/invitation/accept?token=${token}`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create invitation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
