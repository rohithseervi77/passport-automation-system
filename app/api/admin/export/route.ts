import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const entity = searchParams.get("type"); // users, applications, logins, audit

    let csvContent = "";
    let filename = `pas_export_${entity}_${Date.now()}.csv`;

    if (entity === "users") {
      const users = await prisma.user.findMany({
        take: 1000,
        orderBy: { createdAt: "desc" },
        include: { applicant: true, admin: true, passportOfficer: true, police: true },
      });

      const header = ["User ID", "Username", "Email", "Role", "Account Status", "Created Date", "Last Login"];
      const rows = users.map((u) => [
        u.id,
        `"${u.username}"`,
        `"${u.email}"`,
        u.role,
        u.isActive ? "ACTIVE" : "SUSPENDED",
        u.createdAt.toISOString(),
        u.lastLoginAt ? u.lastLoginAt.toISOString() : "Never",
      ]);

      csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    } else if (entity === "applications") {
      const apps = await prisma.application.findMany({
        take: 1000,
        orderBy: { createdAt: "desc" },
        include: { applicant: true },
      });

      const header = ["ARN", "Applicant Name", "Service Type", "Category", "Status", "RPO Location", "Created Date"];
      const rows = apps.map((a) => [
        a.applicationId,
        `"${a.applicant?.name || a.givenName || 'N/A'}"`,
        a.serviceType,
        a.applicationCategory,
        a.status,
        `"${a.rpoLocation}"`,
        a.createdAt.toISOString(),
      ]);

      csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    } else if (entity === "logins") {
      const logins = await prisma.loginHistory.findMany({
        take: 1000,
        orderBy: { loginTime: "desc" },
      });

      const header = ["Session ID", "Email", "Role", "Success", "Login Time", "Logout Time", "IP Address"];
      const rows = logins.map((l) => [
        l.sessionId || "N/A",
        `"${l.email}"`,
        l.role || "N/A",
        l.success ? "SUCCESS" : "FAILED",
        l.loginTime.toISOString(),
        l.logoutTime ? l.logoutTime.toISOString() : "Active",
        `"${l.ipAddress || 'Internal'}"`,
      ]);

      csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    } else if (entity === "audit") {
      const logs = await prisma.auditLog.findMany({
        take: 1000,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { username: true, email: true } } },
      });

      const header = ["Log ID", "Actor Username", "Action", "Entity ID", "Timestamp"];
      const rows = logs.map((l) => [
        l.id,
        `"${l.user?.username || 'SYSTEM'}"`,
        `"${l.action}"`,
        `"${l.entityId || 'N/A'}"`,
        l.createdAt.toISOString(),
      ]);

      csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    } else {
      return NextResponse.json({ error: "Invalid export type. Supported: users, applications, logins, audit." }, { status: 400 });
    }

    // Log export
    await logAuditEvent({
      userId: admin.id,
      action: "ADMIN_DATA_EXPORTED",
      entityId: entity,
      details: { exportType: entity, adminCode: admin.admin?.adminCode },
    });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
