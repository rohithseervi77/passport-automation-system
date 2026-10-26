import { NextResponse } from "next/server";
import { calculatePassportFee, FeeCalculationParams } from "@/lib/feeSchedule";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      serviceType = "FRESH",
      applicationCategory = "NORMAL",
      bookletType = "36_PAGES",
      age = 25,
      isLostOrDamaged = false,
    } = body;

    const parsedAge = Math.max(0, Math.min(120, parseInt(age, 10) || 0));

    const result = calculatePassportFee({
      serviceType,
      applicationCategory,
      bookletType,
      age: parsedAge,
      isLostOrDamaged: Boolean(isLostOrDamaged),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Fee calculate error:", error);
    return NextResponse.json({ error: "Failed to calculate passport fee." }, { status: 400 });
  }
}
