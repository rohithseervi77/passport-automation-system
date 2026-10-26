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
    const search = searchParams.get("search")?.trim() || "";
    const type = searchParams.get("type")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const state = searchParams.get("state")?.trim() || "";

    const where: any = {};
    if (type && type !== "ALL") where.type = type;
    if (status && status !== "ALL") where.status = status;
    if (state && state !== "ALL") where.state = state;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { centerCode: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { district: { contains: search, mode: "insensitive" } },
        { state: { contains: search, mode: "insensitive" } },
        { pinCode: { contains: search } },
        { associatedRpo: { contains: search, mode: "insensitive" } },
      ];
    }

    const centres = await prisma.passportCenter.findMany({
      where,
      orderBy: [
        { status: "asc" },
        { state: "asc" },
        { city: "asc" },
        { name: "asc" },
      ],
    });

    // Statistics
    const all = await prisma.passportCenter.findMany({
      select: { type: true, status: true, dailyCapacity: true, state: true, associatedRpo: true },
    });

    const totalCentres = all.length;
    const activeCentres = all.filter((c) => c.status === "ACTIVE").length;
    const pskCount = all.filter((c) => c.type === "PSK").length;
    const popskCount = all.filter((c) => c.type === "POPSK").length;
    const totalCapacity = all.reduce((acc, c) => acc + (c.dailyCapacity || 0), 0);
    const states = Array.from(new Set(all.map((c) => c.state))).sort();
    const rpos = Array.from(new Set(all.map((c) => c.associatedRpo))).sort();

    return NextResponse.json({
      centres,
      stats: {
        totalCentres,
        activeCentres,
        pskCount,
        popskCount,
        totalCapacity,
      },
      states,
      rpos,
    });
  } catch (error: any) {
    console.error("Admin centres GET error:", error);
    return NextResponse.json({ error: "Failed to load passport centres" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const {
      centerCode,
      name,
      type = "PSK",
      address,
      locality,
      city,
      district,
      state,
      pinCode,
      associatedRpo,
      operatingHours = "09:00 AM - 05:00 PM (Monday to Friday)",
      status = "ACTIVE",
      dailyCapacity = 250,
      slotCapacity = 20,
    } = body;

    if (!centerCode || !name || !city || !state || !pinCode || !associatedRpo || !address) {
      return NextResponse.json(
        { error: "Missing required fields (centerCode, name, city, state, pinCode, associatedRpo, address)" },
        { status: 400 }
      );
    }

    const existing = await prisma.passportCenter.findUnique({
      where: { centerCode: centerCode.trim().toUpperCase() },
    });

    if (existing) {
      return NextResponse.json({ error: `Centre code ${centerCode} already exists.` }, { status: 409 });
    }

    const newCenter = await prisma.passportCenter.create({
      data: {
        centerCode: centerCode.trim().toUpperCase(),
        name: name.trim(),
        type,
        address: address.trim(),
        locality: locality?.trim() || null,
        city: city.trim(),
        district: district?.trim() || city.trim(),
        state: state.trim(),
        pinCode: pinCode.trim(),
        associatedRpo: associatedRpo.trim(),
        operatingHours: operatingHours.trim(),
        status,
        dailyCapacity: parseInt(dailyCapacity, 10) || 250,
        slotCapacity: parseInt(slotCapacity, 10) || 20,
        isDemo: true,
      },
    });

    await logAuditEvent({
      userId: admin.id,
      action: "CREATE_CENTRE",
      entityId: newCenter.centerCode,
      details: {
        targetType: "PASSPORT_CENTRE",
        name: newCenter.name,
        city: newCenter.city,
        state: newCenter.state,
        dailyCapacity: newCenter.dailyCapacity,
      },
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, center: newCenter });
  } catch (error: any) {
    console.error("Admin centres POST error:", error);
    return NextResponse.json({ error: "Failed to create centre", details: error?.message }, { status: 500 });
  }
}
