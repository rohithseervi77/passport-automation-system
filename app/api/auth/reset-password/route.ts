import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAuthUpdatePassword } from "@/lib/supabase";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required." },
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
        { error: "Invalid or expired reset token." },
        { status: 400 }
      );
    }

    if (resetRecord.isUsed) {
      return NextResponse.json(
        { error: "This reset token has already been used." },
        { status: 400 }
      );
    }

    if (resetRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This reset token has expired." },
        { status: 400 }
      );
    }

    if (!resetRecord.user.isActive) {
      return NextResponse.json({ error: "Account is suspended." }, { status: 403 });
    }

    // 1. Update password in Supabase Auth (ZERO passwords stored in application DB)
    if (resetRecord.user.authUserId) {
      await supabaseAuthUpdatePassword(resetRecord.user.authUserId, newPassword);
    }

    // 2. Clear lockout flags & consume token
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
    ]);

    await logAuditEvent({
      userId: resetRecord.userId,
      action: "PASSWORD_CHANGED",
      entityId: resetRecord.user.authUserId || resetRecord.user.email,
    });

    return NextResponse.json(
      { message: "Password has been successfully updated via Supabase Auth." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
