import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const state = searchParams.get("state")?.trim() || "";
    const city = searchParams.get("city")?.trim() || "";
    const rpo = searchParams.get("rpo")?.trim() || "";
    const type = searchParams.get("type")?.trim() || "";
    const pinCode = searchParams.get("pinCode")?.trim() || "";
    const quota = searchParams.get("quota")?.trim() || "NORMAL"; // NORMAL | TATKAAL

    // Build Prisma where clause
    const where: any = {
      status: "ACTIVE",
    };

    if (type && type !== "ALL") {
      where.type = type;
    }

    if (state && state !== "ALL") {
      where.state = state;
    }

    if (city && city !== "ALL") {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (rpo && rpo !== "ALL") {
      where.associatedRpo = rpo;
    }

    if (pinCode) {
      where.pinCode = { startsWith: pinCode };
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { centerCode: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { district: { contains: q, mode: "insensitive" } },
        { state: { contains: q, mode: "insensitive" } },
        { pinCode: { contains: q } },
        { associatedRpo: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
      ];
    }

    const centres = await prisma.passportCenter.findMany({
      where,
      orderBy: [
        { state: "asc" },
        { city: "asc" },
        { name: "asc" },
      ],
    });

    // Also get distinct states and RPOs for filter dropdowns
    const allCentres = await prisma.passportCenter.findMany({
      where: { status: "ACTIVE" },
      select: { state: true, associatedRpo: true, city: true },
    });

    const uniqueStates = Array.from(new Set(allCentres.map((c) => c.state))).sort();
    const uniqueRpos = Array.from(new Set(allCentres.map((c) => c.associatedRpo))).sort();

    // Enrich centres with live educational availability status
    // POPSKs do not support Tatkaal quota per Ministry guidelines
    const enriched = centres.map((c) => {
      const isPopsk = c.type === "POPSK";
      const supportsTatkaal = !isPopsk;

      // Realistic earliest appointment date simulation
      const today = new Date();
      const normalDate = new Date(today);
      normalDate.setDate(today.getDate() + 2); // 2 days ahead
      if (normalDate.getDay() === 0) normalDate.setDate(normalDate.getDate() + 1); // Skip Sunday
      if (normalDate.getDay() === 6) normalDate.setDate(normalDate.getDate() + 2); // Skip Saturday

      const tatkaalDate = new Date(today);
      tatkaalDate.setDate(today.getDate() + 1); // Next working day
      if (tatkaalDate.getDay() === 0) tatkaalDate.setDate(tatkaalDate.getDate() + 1);
      if (tatkaalDate.getDay() === 6) tatkaalDate.setDate(tatkaalDate.getDate() + 2);

      const normalSlotsLeft = Math.max(12, Math.floor(c.dailyCapacity * 0.18));
      const tatkaalSlotsLeft = supportsTatkaal ? Math.max(4, Math.floor(c.dailyCapacity * 0.05)) : 0;

      return {
        ...c,
        supportsTatkaal,
        normalAvailability: normalSlotsLeft > 15 ? "AVAILABLE" : normalSlotsLeft > 0 ? "LIMITED" : "FULL",
        normalEarliest: normalDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        normalSlotsLeft,
        tatkaalAvailability: !supportsTatkaal ? "UNAVAILABLE" : tatkaalSlotsLeft > 5 ? "AVAILABLE" : tatkaalSlotsLeft > 0 ? "LIMITED" : "FULL",
        tatkaalEarliest: supportsTatkaal ? tatkaalDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A",
        tatkaalSlotsLeft,
      };
    });

    return NextResponse.json({
      success: true,
      total: enriched.length,
      centres: enriched,
      filterOptions: {
        states: uniqueStates,
        rpos: uniqueRpos,
      },
      disclaimer: "Academic Simulation — Capacity and earliest appointment dates simulated for educational demonstration.",
    });
  } catch (error: any) {
    console.error("Fetch centres error:", error);
    return NextResponse.json(
      { error: "Failed to fetch passport centres", details: error?.message },
      { status: 500 }
    );
  }
}
