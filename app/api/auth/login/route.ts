import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { username, password } = body;

    // 1. Check required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 },
      );
    }

    // 2. Find the user
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        applicant: true,
        passportOfficer: true,
        police: true,
      },
    });

    // 3. Check whether user exists
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    }

    // 4. Check if account is locked
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account has been suspended. Please contact administration." },
        { status: 403 },
      );
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json(
        { error: `Account locked due to too many failed attempts. Try again after ${user.lockedUntil.toLocaleTimeString()}.` },
        { status: 403 },
      );
    }

    // 5. Compare entered password with hashed password
    const passwordMatches = await bcrypt.compare(password, user.password);

    // 6. Reject incorrect password and handle lockouts
    if (!passwordMatches) {
      const newFailedAttempts = user.failedLoginAttempts + 1;
      let lockedUntil = null;

      if (newFailedAttempts >= 5) {
        // Lock for 15 minutes
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailedAttempts,
          lockedUntil,
        },
      });

      // Audit Log for failed login
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "LOGIN_FAILED",
          details: JSON.stringify({ reason: "Invalid password", attempt: newFailedAttempts }),
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        }
      });

      return NextResponse.json(
        { error: lockedUntil ? "Too many failed attempts. Account locked for 15 minutes." : "Invalid username or password." },
        { status: 401 },
      );
    }

    // 7. Reset failed login attempts on success
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    }

    // 8. Create login session
    const sessionToken = await createSessionToken(user.id);

    // Audit Log for successful login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN_SUCCESS",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      }
    });

    // 9. Create response
    const response = NextResponse.json(
      {
        message: "Login successful.",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          applicantId: user.applicant?.applicantId ?? null,
          officerId: user.passportOfficer?.officerId ?? null,
          stationCode: user.police?.stationCode ?? null,
        },
      },
      { status: 200 },
    );

    // 10. Store session token in an HTTP-only cookie
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
      {
        error: "Something went wrong during login.",
      },
      { status: 500 },
    );
  }
}
