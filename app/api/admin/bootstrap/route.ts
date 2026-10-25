import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAuthSignUp } from "@/lib/supabase";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    return NextResponse.json({
      isBootstrapAvailable: adminCount === 0,
      adminCount,
      message:
        adminCount === 0
          ? "System has no active administrator accounts. One-time setup is available."
          : "Admin bootstrap is disabled. Existing administrator accounts are active.",
    });
  } catch (error) {
    console.error("Bootstrap status check error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. One-time lock: verify that ZERO admins currently exist
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    if (adminCount > 0) {
      return NextResponse.json(
        {
          error:
            "Admin bootstrap is permanently disabled. An active Administrator account already exists. Please request an administrative invitation from an active administrator.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { username, email, password, adminCode } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required for initial administrator bootstrap." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // 2. Provision identity via Supabase Auth
    const authResult = await supabaseAuthSignUp({
      email,
      password,
      role: "ADMIN",
      username,
    });

    if (authResult.error && !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || "Supabase Auth registration failed." },
        { status: 400 }
      );
    }

    const authUserId = authResult.user?.id || null;
    const effectiveCode = adminCode || "ADM-HQ-001";

    // 3. Atomically create User + Admin record in application database
    const createdUser = await prisma.user.create({
      data: {
        authUserId,
        username,
        email,
        role: "ADMIN",
        admin: {
          create: {
            adminCode: effectiveCode,
          },
        },
      },
      include: {
        admin: true,
      },
    });

    // 4. Log audit event
    await logAuditEvent({
      userId: createdUser.id,
      action: "INITIAL_ADMIN_BOOTSTRAP",
      entityId: effectiveCode,
      details: { role: "ADMIN", username, email },
    });

    return NextResponse.json(
      {
        message: "Initial Administrator bootstrap completed successfully. You may now log in via /admin/login.",
        adminCode: effectiveCode,
        username,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bootstrap execution error:", error);
    return NextResponse.json({ error: "Something went wrong during bootstrap." }, { status: 500 });
  }
}
