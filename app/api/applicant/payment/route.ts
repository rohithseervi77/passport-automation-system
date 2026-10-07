import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET payment status and fee structure
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applicant = await prisma.applicant.findUnique({
      where: { userId },
      include: {
        applications: {
          orderBy: { id: "desc" },
          take: 1,
        },
      },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    const application = applicant.applications[0];
    if (!application) {
      return NextResponse.json({ error: "No active application found" }, { status: 404 });
    }

    // Fee calculations based on passport type
    let feeAmount = 1500;
    if (application.passportType.includes("60 Pages") || application.passportType.includes("JUMBO")) {
      feeAmount = 2000;
    } else if (application.passportType.includes("TATKAAL")) {
      feeAmount = 3500;
    } else if (application.passportType.includes("DIPLOMATIC")) {
      feeAmount = 0;
    }

    return NextResponse.json({
      applicant,
      applicationId: application.applicationId,
      passportType: application.passportType,
      status: application.status,
      feeAmount,
      currency: "INR",
    });
  } catch (error) {
    console.error("Fetch payment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST process payment
export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applicant = await prisma.applicant.findUnique({
      where: { userId },
      include: {
        applications: {
          orderBy: { id: "desc" },
          take: 1,
        },
      },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    const application = applicant.applications[0];
    if (!application) {
      return NextResponse.json({ error: "No application found" }, { status: 404 });
    }

    const body = await req.json();
    const { paymentMethod, amount } = body;

    // Generate Transaction ID
    const txnId = `TXN-PAS-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();

    return NextResponse.json({
      message: "Payment processed and confirmed successfully!",
      transaction: {
        txnId,
        amount: amount || 1500,
        currency: "INR",
        paymentMethod: paymentMethod || "Credit/Debit Card",
        status: "SUCCESS",
        timestamp,
        applicationId: application.applicationId,
      },
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
