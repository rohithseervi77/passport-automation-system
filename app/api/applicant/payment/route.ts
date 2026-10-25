import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transitionApplicationStatus } from "@/lib/applicationService";

// GET payment status and fee breakdown
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applicant = await prisma.applicant.findUnique({
      where: { userId },
      include: {
        user: true,
        applications: {
          orderBy: { id: "desc" },
          take: 1,
          include: {
            payments: {
              orderBy: { id: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Applicant profile not found" }, { status: 404 });
    }

    const application = applicant.applications[0];
    if (!application) {
      return NextResponse.json({ error: "No active passport application found" }, { status: 404 });
    }

    // Fee breakdown calculation
    // Base Fee: Normal 36 pages = Rs. 1500
    // 60 Pages booklet surcharge: + Rs. 500
    // Tatkaal surcharge: + Rs. 2000
    const isTatkaal = application.applicationCategory === "TATKAAL" || application.passportType?.includes("TATKAAL");
    const is60Pages = application.bookletType === "60_PAGES" || application.passportType?.includes("60");

    const baseFee = 1500;
    let additionalFee = 0;
    if (is60Pages) additionalFee += 500;
    if (isTatkaal) additionalFee += 2000;

    const totalAmount = baseFee + additionalFee;

    const latestPayment = application.payments?.[0] || null;

    return NextResponse.json({
      applicant: {
        name: applicant.name,
        email: applicant.user.email,
        phone: application.emergencyMobile || "N/A",
      },
      application: {
        id: application.id,
        applicationId: application.applicationId,
        serviceType: application.serviceType,
        applicationCategory: application.applicationCategory,
        bookletType: application.bookletType,
        passportType: application.passportType,
        rpoLocation: application.rpoLocation,
        status: application.status,
        givenName: application.givenName,
        surname: application.surname,
      },
      feeBreakdown: {
        baseFee,
        bookletSurcharge: is60Pages ? 500 : 0,
        tatkaalSurcharge: isTatkaal ? 2000 : 0,
        additionalFee,
        totalAmount,
        currency: "INR",
      },
      latestPayment,
    });
  } catch (error) {
    console.error("Fetch payment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST process payment simulation
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
      return NextResponse.json({ error: "Applicant profile not found" }, { status: 404 });
    }

    const application = applicant.applications[0];
    if (!application) {
      return NextResponse.json({ error: "No active application found" }, { status: 404 });
    }

    const body = await req.json();
    const { paymentMethod, amount, baseFee, additionalFee, paymentReference } = body;

    // Check if already paid
    const existingSuccessfulPayment = await prisma.payment.findFirst({
      where: {
        applicationId: application.id,
        status: "SUCCESS",
      },
    });

    if (existingSuccessfulPayment) {
      return NextResponse.json({
        message: "Fee payment has already been successfully completed for this application.",
        transaction: existingSuccessfulPayment,
      });
    }

    // Generate official-looking Transaction Reference: PAY + YYYYMMDD + 6 digits
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const txnId = `PAY${dateStr}${randomSuffix}`;

    const paidAmount = amount || 1500;
    const finalBaseFee = baseFee || 1500;
    const finalAdditionalFee = additionalFee || (paidAmount > 1500 ? paidAmount - 1500 : 0);

    const payment = await prisma.payment.create({
      data: {
        transactionId: txnId,
        amount: paidAmount,
        baseFee: finalBaseFee,
        additionalFee: finalAdditionalFee,
        status: "SUCCESS",
        paymentMethod: paymentMethod || "UPI",
        paymentReference: paymentReference || `MBI-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        applicationId: application.id,
      },
    });

    // Advance application status to PAYMENT_COMPLETED then APPOINTMENT_PENDING if valid
    try {
      if (application.status === "DRAFT" || application.status === "SUBMITTED" || application.status === "PAYMENT_PENDING") {
        await transitionApplicationStatus(
          application.id,
          "PAYMENT_COMPLETED",
          userId,
          `Statutory passport fee of ₹${paidAmount} paid successfully via ${paymentMethod || "UPI"}. Transaction ID: ${txnId}`
        );
        // Automatically allow appointment booking
        await transitionApplicationStatus(
          application.id,
          "APPOINTMENT_PENDING",
          userId,
          "Eligible for appointment slot selection at designated PSK / POPSK centre."
        );
      }
    } catch (e: any) {
      console.warn("Status transition notice:", e.message);
    }

    return NextResponse.json({
      message: "Statutory passport fee paid successfully! Appointment booking is now unlocked.",
      transaction: payment,
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
