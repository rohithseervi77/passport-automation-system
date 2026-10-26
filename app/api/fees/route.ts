import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const schedules = await prisma.feeSchedule.findMany({
      where: { isActive: true },
      orderBy: [{ serviceType: "asc" }, { bookletType: "asc" }, { minAge: "asc" }],
    });

    return NextResponse.json({
      effectiveDate: "1 July 2026",
      gazetteReference: "G.S.R. 516(E) dated 25 June 2026",
      sourceUrl: "https://www.passportindia.gov.in/psp/Notification",
      lastVerifiedAt: new Date().toISOString(),
      schedules,
    });
  } catch (error) {
    console.error("Fee schedules GET error:", error);
    return NextResponse.json({ error: "Failed to load fee schedules." }, { status: 500 });
  }
}
