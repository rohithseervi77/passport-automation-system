import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAuthResetPassword, supabaseAuthGenerateRecoveryLink } from "@/lib/supabase";
import { logAuditEvent } from "@/lib/audit";
import { getPasswordResetUrl } from "@/lib/url";
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

    // 1. Invalidate any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // 2. Generate a secure, single-use 64-char token (expires in 1 hour)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
        isUsed: false,
      },
    });

    // 3. Dispatch recovery email via Supabase Auth with production redirectTo
    const dispatchResult = await supabaseAuthResetPassword(email, token);
    const resetUrl = getPasswordResetUrl(token);

    const isRateLimited =
      !!dispatchResult.error &&
      (dispatchResult.error.toLowerCase().includes("rate limit") ||
        dispatchResult.error.toLowerCase().includes("over_email_send_rate_limit") ||
        dispatchResult.code === "over_email_send_rate_limit");

    let fallbackActionLink: string | undefined;
    if (isRateLimited) {
      console.warn(
        `[ForgotPassword] Supabase shared SMTP rate limit reached for ${email} (${dispatchResult.error}). Generating server-side recovery link.`
      );
      const genResult = await supabaseAuthGenerateRecoveryLink(email, token);
      fallbackActionLink = genResult.actionLink;
    }

    await logAuditEvent({
      userId: user.id,
      action: "PASSWORD_RESET_REQUESTED",
      entityId: user.authUserId || user.email,
    });

    return NextResponse.json(
      {
        message: isRateLimited
          ? "The shared authentication email provider has reached its hourly quota (max 3 emails/hour). An instant password reset link has been prepared for you below."
          : "If that email is registered in our records, a secure password reset link has been dispatched to your inbox (please also check your Spam/Junk folder).",
        rateLimited: isRateLimited,
        resetUrl,
        actionLink: fallbackActionLink,
        simulatedToken: token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
