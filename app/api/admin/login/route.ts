import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";
import { supabaseAuthSignIn } from "@/lib/supabase";
import { logAuditEvent } from "@/lib/audit";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    // 1. Locate user record
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
      include: {
        admin: true,
      },
    });

    if (!user) {
      await prisma.loginHistory.create({
        data: {
          authUserId: null,
          email: username,
          role: "ADMIN_ATTEMPT",
          success: false,
          ipAddress,
          userAgent,
        },
      });

      return NextResponse.json(
        { error: "Invalid administrative credentials." },
        { status: 401 }
      );
    }

    // 2. Strict Role Verification: MUST be ADMIN role with Admin profile
    if (user.role !== "ADMIN" || !user.admin) {
      await prisma.loginHistory.create({
        data: {
          authUserId: user.authUserId,
          email: user.email,
          role: user.role,
          success: false,
          ipAddress,
          userAgent,
        },
      });

      await logAuditEvent({
        userId: user.id,
        action: "UNAUTHORIZED_ADMIN_LOGIN_ATTEMPT",
        entityId: user.email,
        details: { attemptedRole: user.role },
      });

      return NextResponse.json(
        { error: "Access denied. This account does not possess administrative privileges." },
        { status: 403 }
      );
    }

    // 3. Check suspension
    if (!user.isActive) {
      return NextResponse.json(
        { error: "This administrator account has been suspended. Please contact headquarters." },
        { status: 403 }
      );
    }

    // 4. Check temporary lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json(
        {
          error: `Administrative access locked due to failed attempts. Try again after ${user.lockedUntil.toLocaleTimeString()}.`,
        },
        { status: 403 }
      );
    }

    // 5. Authenticate credentials via Supabase Auth (Zero passwords in DB)
    const authResult = await supabaseAuthSignIn({
      email: user.email,
      password,
    });

    if (authResult.error || !authResult.user) {
      const newFailed = user.failedLoginAttempts + 1;
      let lockedUntil: Date | null = null;
      if (newFailed >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailed,
          lockedUntil,
        },
      });

      await prisma.loginHistory.create({
        data: {
          authUserId: user.authUserId,
          email: user.email,
          role: "ADMIN",
          success: false,
          ipAddress,
          userAgent,
        },
      });

      return NextResponse.json(
        {
          error: lockedUntil
            ? "Too many failed administrative attempts. Account locked for 15 minutes."
            : "Invalid administrative credentials.",
        },
        { status: 401 }
      );
    }

    // 6. Synchronize authUserId & reset failed attempts
    const authUserId = authResult.user.id;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        authUserId,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    const sessionId = crypto.randomUUID();

    // 7. Record Login History
    await prisma.loginHistory.create({
      data: {
        authUserId,
        email: user.email,
        role: "ADMIN",
        success: true,
        loginTime: new Date(),
        ipAddress,
        userAgent,
        sessionId,
      },
    });

    // 8. Audit log admin login
    await logAuditEvent({
      userId: user.id,
      action: "ADMIN_LOGIN",
      entityId: user.admin.adminCode,
      details: { adminCode: user.admin.adminCode, email: user.email },
    });

    // 9. Issue signed session JWT
    const sessionToken = await createSessionToken({
      userId: user.id,
      authUserId,
      role: "ADMIN",
      sessionId,
    });

    const response = NextResponse.json({
      message: "Administrator authenticated successfully.",
      user: {
        id: user.id,
        authUserId,
        username: user.username,
        email: user.email,
        role: "ADMIN",
        adminCode: user.admin.adminCode,
      },
    });

    response.cookies.set("pas_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Something went wrong during administrative authentication." },
      { status: 500 }
    );
  }
}
