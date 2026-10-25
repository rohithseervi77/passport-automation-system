import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAuthResetPassword } from "@/lib/supabase";
import { logAuditEvent } from "@/lib/audit";
import crypto from "crypto";

export const dynamic = "force-dynamic";

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
      return NextResponse.json(
        {
          message:
            "If that email is registered in our records, a secure password reset link has been dispatched.",
        },
        { status: 200 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account is suspended." }, { status: 403 });
    }

    // 1. Dispatch password reset via Supabase Auth
    await supabaseAuthResetPassword(email);

    // 2. Track token expiration for web flow compatibility
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

    await logAuditEvent({
      userId: user.id,
      action: "PASSWORD_RESET_REQUESTED",
      entityId: user.authUserId || user.email,
    });

    return NextResponse.json(
      {
        message:
          "If that email is registered in our records, a secure password reset link has been dispatched.",
        ...(process.env.NODE_ENV !== "production" ? { simulatedToken: token } : {}),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
