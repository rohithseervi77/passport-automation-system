import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { passportOfficer: true },
    });

    if (!user || user.role !== "OFFICER" || !user.passportOfficer) {
      return NextResponse.json({ error: "Access denied. Officer role required." }, { status: 403 });
    }

    const officer = user.passportOfficer;
    const body = await req.json();
    const { applicationId, action, remarks } = body;

    if (!applicationId || !action) {
      return NextResponse.json({ error: "applicationId and action are required." }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { applicationId },
      include: {
        documents: true,
        appointment: true,
        passport: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    let updatedApplication;

    switch (action) {
      case "VERIFY_DOCS": {
        // Mark all uploaded documents as VERIFIED
        await prisma.document.updateMany({
          where: { applicationId: application.id },
          data: { fileStatus: "VERIFIED" },
        });

        updatedApplication = await prisma.application.update({
          where: { id: application.id },
          data: {
            status: "UNDER_OFFICER_VERIFICATION",
            officerId: officer.id,
          },
          include: { documents: true, appointment: true, passport: true },
        });
        break;
      }

      case "INITIATE_POLICE": {
        updatedApplication = await prisma.application.update({
          where: { id: application.id },
          data: {
            status: "POLICE_VERIFICATION_PENDING",
            officerId: officer.id,
          },
          include: { documents: true, appointment: true, passport: true },
        });
        break;
      }

      case "APPROVE": {
        updatedApplication = await prisma.application.update({
          where: { id: application.id },
          data: {
            status: "APPROVED",
            officerId: officer.id,
          },
          include: { documents: true, appointment: true, passport: true },
        });
        break;
      }

      case "REJECT": {
        updatedApplication = await prisma.application.update({
          where: { id: application.id },
          data: {
            status: "REJECTED",
            officerId: officer.id,
          },
          include: { documents: true, appointment: true, passport: true },
        });
        break;
      }

      case "ISSUE_PASSPORT": {
        // Generate Passport entity
        const randomNum = Math.floor(1000000 + Math.random() * 9000000);
        const passportNumber = `P${randomNum}`;
        const issueDate = new Date();
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 10);

        if (application.passport) {
          await prisma.passport.update({
            where: { id: application.passport.id },
            data: {
              passportNumber,
              issueDate,
              expiryDate,
              dispatchStatus: "PRINTED",
              officerId: officer.id,
            },
          });
        } else {
          await prisma.passport.create({
            data: {
              passportNumber,
              issueDate,
              expiryDate,
              dispatchStatus: "PRINTED",
              applicationId: application.id,
              officerId: officer.id,
            },
          });
        }

        updatedApplication = await prisma.application.update({
          where: { id: application.id },
          data: {
            status: "PASSPORT_ISSUED",
            officerId: officer.id,
          },
          include: { documents: true, appointment: true, passport: true },
        });
        break;
      }

      case "DISPATCH_PASSPORT": {
        if (!application.passport) {
          return NextResponse.json({ error: "Cannot dispatch: Passport not issued yet." }, { status: 400 });
        }

        await prisma.passport.update({
          where: { id: application.passport.id },
          data: {
            dispatchStatus: "DISPATCHED",
          },
        });

        updatedApplication = await prisma.application.update({
          where: { id: application.id },
          data: {
            status: "PASSPORT_DISPATCHED",
            officerId: officer.id,
          },
          include: { documents: true, appointment: true, passport: true },
        });
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({
      message: `Action ${action} completed successfully`,
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Officer action error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
