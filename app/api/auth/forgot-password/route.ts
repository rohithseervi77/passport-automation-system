import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return 200 to prevent email enumeration attacks
      return NextResponse.json({ message: "If that email is in our database, we will send a password reset link to it." }, { status: 200 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account is suspended." }, { status: 403 });
    }

    // In a real app, delete existing tokens for this user first
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET_REQUESTED",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      }
    });

    // TODO: Send email using a service like SendGrid, Resend, etc.
    // For this simulation, we will just return success.
    console.log(`[SIMULATED EMAIL] Password reset token for ${email}: ${token}`);

    return NextResponse.json({
      message: "If that email is in our database, we will send a password reset link to it.",
      // Returning token in response ONLY for local testing purposes. 
      // In production, NEVER return this in the response body.
      ...(process.env.NODE_ENV !== "production" ? { simulatedToken: token } : {})
    }, { status: 200 });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
