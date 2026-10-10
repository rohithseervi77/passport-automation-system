import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
    }

    if (resetRecord.isUsed) {
      return NextResponse.json({ error: "This reset token has already been used." }, { status: 400 });
    }

    if (resetRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: "This reset token has expired." }, { status: 400 });
    }

    if (!resetRecord.user.isActive) {
      return NextResponse.json({ error: "Account is suspended." }, { status: 403 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user and mark token as used
    // Use a transaction to ensure both happen together safely
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: {
          password: hashedPassword,
          failedLoginAttempts: 0, // Unlock account if it was locked
          lockedUntil: null,
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { isUsed: true },
      }),
      prisma.auditLog.create({
        data: {
          userId: resetRecord.userId,
          action: "PASSWORD_CHANGED",
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        }
      })
    ]);

    return NextResponse.json({ message: "Password has been successfully reset." }, { status: 200 });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
