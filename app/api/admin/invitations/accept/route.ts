import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAuthSignUp } from "@/lib/supabase";
import { createSessionToken } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false, error: "Invitation token is required." }, { status: 400 });
    }

    const invitation = await prisma.adminInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json({ valid: false, error: "Invalid invitation token." }, { status: 404 });
    }

    if (invitation.isAccepted) {
      return NextResponse.json({ valid: false, error: "This administrative invitation has already been accepted and consumed." }, { status: 410 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: "This administrative invitation has expired. Please request a new invitation." }, { status: 410 });
    }

    return NextResponse.json({
      valid: true,
      email: invitation.email,
      role: invitation.role,
      invitedBy: invitation.invitedBy,
      expiresAt: invitation.expiresAt,
    });
  } catch (error) {
    console.error("Validate token error:", error);
    return NextResponse.json({ valid: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, username, password } = body;

    if (!token || !username || !password) {
      return NextResponse.json(
        { error: "Invitation token, username, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // 1. Verify invitation token
    const invitation = await prisma.adminInvitation.findUnique({
      where: { token },
    });

    if (!invitation || invitation.isAccepted || invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitation token is invalid, expired, or has already been consumed." },
        { status: 400 }
      );
    }

    // 2. Check for existing username or email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: invitation.email }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this username or email address already exists." },
        { status: 409 }
      );
    }

    // 3. Register user with Supabase Auth
    const authResult = await supabaseAuthSignUp({
      email: invitation.email,
      password,
      role: "ADMIN",
      username,
    });

    if (authResult.error && !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || "Failed to provision identity in Supabase Auth." },
        { status: 400 }
      );
    }

    const authUserId = authResult.user?.id || null;
    const adminCode = `ADM-HQ-${Math.floor(100 + Math.random() * 900)}`;

    // 4. Atomically create User, Admin record and consume invitation
    const [newUser] = await prisma.$transaction([
      prisma.user.create({
        data: {
          authUserId,
          username,
          email: invitation.email,
          role: "ADMIN",
          admin: {
            create: {
              adminCode,
            },
          },
        },
        include: {
          admin: true,
        },
      }),
      prisma.adminInvitation.update({
        where: { id: invitation.id },
        data: {
          isAccepted: true,
          acceptedAt: new Date(),
        },
      }),
    ]);

    // 5. Audit Log
    await logAuditEvent({
      userId: newUser.id,
      action: "ADMIN_INVITATION_ACCEPTED",
      entityId: adminCode,
      details: { email: invitation.email, invitedBy: invitation.invitedBy },
    });

    // 6. Issue session and log in new admin
    const sessionId = crypto.randomUUID();
    await prisma.loginHistory.create({
      data: {
        authUserId,
        email: newUser.email,
        role: "ADMIN",
        success: true,
        loginTime: new Date(),
        sessionId,
      },
    });

    const sessionToken = await createSessionToken({
      userId: newUser.id,
      authUserId,
      role: "ADMIN",
      sessionId,
    });

    const response = NextResponse.json(
      {
        message: "Administrator account setup complete. Welcome to the PAS Administration Center.",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: "ADMIN",
          adminCode,
        },
      },
      { status: 201 }
    );

    response.cookies.set("pas_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Accept invitation error:", error);
    return NextResponse.json({ error: "Something went wrong while setting up administrator account." }, { status: 500 });
  }
}
