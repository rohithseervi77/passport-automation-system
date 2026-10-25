import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllSystemSettings, setSystemSetting } from "@/lib/systemSettings";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const settings = await getAllSystemSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Fetch settings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { key, value, description } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "key and value are required." }, { status: 400 });
    }

    const updated = await setSystemSetting(
      key,
      String(value),
      admin.admin?.adminCode || admin.username,
      description
    );

    await logAuditEvent({
      userId: admin.id,
      action: "SYSTEM_SETTING_UPDATED",
      entityId: key,
      details: { key, value, updatedBy: admin.admin?.adminCode },
    });

    return NextResponse.json({
      message: `Setting '${key}' updated successfully.`,
      setting: updated,
    });
  } catch (error) {
    console.error("Update setting error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
