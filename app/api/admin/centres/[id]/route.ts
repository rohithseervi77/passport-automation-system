import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const { id } = await params;
    const centreId = parseInt(id, 10);
    if (isNaN(centreId)) {
      return NextResponse.json({ error: "Invalid centre ID" }, { status: 400 });
    }

    const body = await req.json();
    const {
      name,
      type,
      address,
      locality,
      city,
      district,
      state,
      pinCode,
      associatedRpo,
      operatingHours,
      status,
      dailyCapacity,
      slotCapacity,
    } = body;

    const updated = await prisma.passportCenter.update({
      where: { id: centreId },
      data: {
        ...(name && { name: name.trim() }),
        ...(type && { type }),
        ...(address && { address: address.trim() }),
        ...(locality !== undefined && { locality: locality ? locality.trim() : null }),
        ...(city && { city: city.trim() }),
        ...(district && { district: district.trim() }),
        ...(state && { state: state.trim() }),
        ...(pinCode && { pinCode: pinCode.trim() }),
        ...(associatedRpo && { associatedRpo: associatedRpo.trim() }),
        ...(operatingHours && { operatingHours: operatingHours.trim() }),
        ...(status && { status }),
        ...(dailyCapacity !== undefined && { dailyCapacity: parseInt(dailyCapacity, 10) }),
        ...(slotCapacity !== undefined && { slotCapacity: parseInt(slotCapacity, 10) }),
      },
    });

    await logAuditEvent({
      userId: admin.id,
      action: "UPDATE_CENTRE",
      entityId: updated.centerCode,
      details: {
        targetType: "PASSPORT_CENTRE",
        name: updated.name,
        status: updated.status,
        dailyCapacity: updated.dailyCapacity,
      },
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, center: updated });
  } catch (error: any) {
    console.error("Admin centre PATCH error:", error);
    return NextResponse.json({ error: "Failed to update passport centre", details: error?.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const { id } = await params;
    const centreId = parseInt(id, 10);
    if (isNaN(centreId)) {
      return NextResponse.json({ error: "Invalid centre ID" }, { status: 400 });
    }

    // Rather than hard-deleting and risking orphaned references, set status to TEMPORARILY_CLOSED
    const centre = await prisma.passportCenter.update({
      where: { id: centreId },
      data: { status: "TEMPORARILY_CLOSED" },
    });

    await logAuditEvent({
      userId: admin.id,
      action: "CLOSE_CENTRE",
      entityId: centre.centerCode,
      details: {
        targetType: "PASSPORT_CENTRE",
        name: centre.name,
        previousStatus: centre.status,
      },
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, message: `Centre ${centre.centerCode} marked as TEMPORARILY_CLOSED.` });
  } catch (error: any) {
    console.error("Admin centre DELETE error:", error);
    return NextResponse.json({ error: "Failed to close passport centre", details: error?.message }, { status: 500 });
  }
}
