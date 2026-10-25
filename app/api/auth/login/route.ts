import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";
import { supabaseAuthSignIn } from "@/lib/supabase";
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

    // 1. Check required credentials
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    // 2. Locate user profile by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
      include: {
        applicant: true,
        passportOfficer: true,
        police: true,
      },
    });

    if (!user) {
      // Record failed login event in LoginHistory (NO password stored)
      await prisma.loginHistory.create({
        data: {
          authUserId: null,
          email: username,
          role: "UNKNOWN",
          success: false,
          ipAddress,
          userAgent,
        },
      });

      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // 3. Check account suspension
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account has been suspended. Please contact administration." },
        { status: 403 }
      );
    }

    // 4. Check lockout state
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json(
        {
          error: `Account locked due to consecutive failed attempts. Try again after ${user.lockedUntil.toLocaleTimeString()}.`,
        },
        { status: 403 }
      );
    }

    // 5. Authenticate via Supabase Auth (Zero passwords handled by application database)
    const authResult = await supabaseAuthSignIn({
      email: user.email,
      password,
    });

    // 6. Handle authentication failure
    if (authResult.error || !authResult.user) {
      const newFailedAttempts = user.failedLoginAttempts + 1;
      let lockedUntil: Date | null = null;

      if (newFailedAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailedAttempts,
          lockedUntil,
        },
      });

      // Track failed attempt in LoginHistory (NEVER stores the password)
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

      return NextResponse.json(
        {
          error: lockedUntil
            ? "Too many failed attempts. Account locked for 15 minutes."
            : "Invalid username or password.",
        },
        { status: 401 }
      );
    }

    // 7. Successful login: synchronize authUserId if newly issued
    const authUserId = authResult.user.id;
    if (!user.authUserId || user.authUserId !== authUserId) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          authUserId,
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
        },
      });
    } else if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    // 8. Generate session identifier
    const sessionId = crypto.randomUUID();

    // 9. Record successful event in LoginHistory
    await prisma.loginHistory.create({
      data: {
        authUserId,
        email: user.email,
        role: user.role,
        success: true,
        loginTime: new Date(),
        ipAddress,
        userAgent,
        sessionId,
      },
    });

    // 10. Issue session JWT
    const sessionToken = await createSessionToken({
      userId: user.id,
      authUserId,
      role: user.role,
      sessionId,
    });

    // 11. Create secure response
    const response = NextResponse.json(
      {
        message: "Login successful.",
        user: {
          id: user.id,
          authUserId,
          username: user.username,
          email: user.email,
          role: user.role,
          applicantId: user.applicant?.applicantId ?? null,
          officerId: user.passportOfficer?.officerId ?? null,
          stationCode: user.police?.stationCode ?? null,
        },
      },
      { status: 200 }
    );

    // 12. Store session in HTTP-only Secure cookie
    response.cookies.set("pas_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong during login." },
      { status: 500 }
    );
  }
}
