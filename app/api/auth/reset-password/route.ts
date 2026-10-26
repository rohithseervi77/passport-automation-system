import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAuthUpdatePassword } from "@/lib/supabase";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "This password reset link is invalid. Please request a new password reset link." },
        { status: 400 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: "New password is required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: "This password reset link is invalid. Please request a new password reset link." },
        { status: 400 }
      );
    }

    if (resetRecord.isUsed) {
      return NextResponse.json(
        { error: "This password reset link has already been used. Please request a new one." },
        { status: 400 }
      );
    }

    if (resetRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This password reset link has expired. Please request a new password reset link." },
        { status: 400 }
      );
    }

    if (!resetRecord.user.isActive) {
      return NextResponse.json(
        { error: "Your account is currently suspended. Please contact portal administration." },
        { status: 403 }
      );
    }

    // 1. Update password securely in Supabase Auth (Zero passwords stored in PostgreSQL)
    if (resetRecord.user.authUserId) {
      const updateResult = await supabaseAuthUpdatePassword(resetRecord.user.authUserId, newPassword);
      if (updateResult.error) {
        return NextResponse.json({ error: updateResult.error }, { status: 500 });
      }
    }

    // 2. Consume token, reset failed attempts, and revoke old active sessions for security
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { isUsed: true },
      }),
      prisma.loginHistory.updateMany({
        where: {
          authUserId: resetRecord.user.authUserId,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
        },
      }),
    ]);

    await logAuditEvent({
      userId: resetRecord.userId,
      action: "PASSWORD_CHANGED",
      entityId: resetRecord.user.authUserId || resetRecord.user.email,
      details: { method: "RESET_LINK" },
    });

    return NextResponse.json(
      { message: "Password has been successfully updated. Redirecting to login..." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
