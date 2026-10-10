import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transitionApplicationStatus } from "@/lib/applicationService";

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
    const idempotencyKey = req.headers.get("idempotency-key");

    if (!idempotencyKey) {
      return NextResponse.json({ error: "Idempotency-Key header is required." }, { status: 400 });
    }

    // Check if we already processed this exact payment to prevent double charging
    const existingPayment = await prisma.payment.findFirst({
      where: { transactionId: idempotencyKey }
    });

    if (existingPayment && existingPayment.status === "SUCCESS") {
      return NextResponse.json({
        message: "Payment already processed (Idempotency Hit).",
        transaction: existingPayment,
      });
    }

    // Generate Transaction ID based on idempotency key for uniqueness
    const txnId = idempotencyKey;

    // Simulate Payment Gateway Random Failure (Unhappy Path)
    const isNetworkFailure = Math.random() < 0.1; // 10% chance
    if (isNetworkFailure) {
      await prisma.payment.create({
        data: {
          transactionId: txnId,
          amount: amount || 1500,
          paymentMethod: paymentMethod || "Credit/Debit Card",
          status: "FAILED",
          applicationId: application.id,
        }
      });
      return NextResponse.json({ error: "Payment Gateway Timeout. Please try again." }, { status: 502 });
    }

    let payment;
    try {
      payment = await prisma.payment.create({
        data: {
          transactionId: txnId,
          amount: amount || 1500,
          paymentMethod: paymentMethod || "Credit/Debit Card",
          status: "SUCCESS",
          applicationId: application.id,
        }
      });

      if (application.status === "PAYMENT_PENDING" || application.status === "SUBMITTED" || application.status === "DRAFT") {
        await transitionApplicationStatus(application.id, "PAYMENT_COMPLETED", userId, "Payment successful");
      }
    } catch (e: any) {
      console.error("Payment transaction error", e);
      return NextResponse.json({ error: "Failed to save payment record." }, { status: 500 });
    }

    return NextResponse.json({
      message: "Payment processed and confirmed successfully!",
      transaction: payment,
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
