import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transitionApplicationStatus } from "@/lib/applicationService";

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
      return NextResponse.json({ error: "Access denied. Passport Officer privileges required." }, { status: 403 });
    }

    const officer = user.passportOfficer;
    const body = await req.json();
    const { applicationId, action, remarks, reason, checklist } = body;

    if (!applicationId || !action) {
      return NextResponse.json({ error: "applicationId and action are required." }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { applicationId },
      include: {
        documents: true,
        appointment: true,
        passport: true,
        policeReports: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found in RPO records." }, { status: 404 });
    }

    // Save checklist if provided
    if (checklist) {
      await prisma.application.update({
        where: { id: application.id },
        data: {
          officerChecklist: JSON.stringify(checklist),
          officerId: officer.id,
        },
      });
    }

    let updatedApplication;

    switch (action) {
      case "VERIFY_DOCS": {
        // Mark documents as verified
        await prisma.document.updateMany({
          where: { applicationId: application.id },
          data: { fileStatus: "VERIFIED" },
        });

        updatedApplication = await transitionApplicationStatus(
          application.id,
          "DOCUMENT_VERIFIED",
          user.id,
          remarks || "All uploaded supporting documents verified by Verifying Officer at Counter B."
        );
        break;
      }

      case "INITIATE_POLICE": {
        updatedApplication = await transitionApplicationStatus(
          application.id,
          "POLICE_VERIFICATION_PENDING",
          user.id,
          remarks || `Police background & address enquiry initiated with ${application.policeStation || "Local Police Station"}.`
        );
        break;
      }

      case "REQUEST_CLARIFICATION": {
        if (!reason || !reason.trim()) {
          return NextResponse.json({ error: "A specific clarification reason is mandatory." }, { status: 400 });
        }

        await prisma.application.update({
          where: { id: application.id },
          data: {
            clarificationReason: reason.trim(),
            clarificationRequestedAt: new Date(),
            clarificationResponse: null,
            clarificationRespondedAt: null,
          },
        });

        updatedApplication = await transitionApplicationStatus(
          application.id,
          "CLARIFICATION_REQUIRED",
          user.id,
          `Clarification requested: ${reason.trim()}`
        );
        break;
      }

      case "APPROVE": {
        updatedApplication = await transitionApplicationStatus(
          application.id,
          "APPROVED",
          user.id,
          remarks || "Application scrutinized and granted final approval by Granting Officer."
        );
        break;
      }

      case "ISSUE_PASSPORT": {
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

        updatedApplication = await transitionApplicationStatus(
          application.id,
          "PRINTING",
          user.id,
          remarks || `Passport booklet generated with Number ${passportNumber}. Sent for high-security laser printing.`
        );
        break;
      }

      case "DISPATCH_PASSPORT": {
        if (!application.passport) {
          // If passport record doesn't exist, generate one first
          const randomNum = Math.floor(1000000 + Math.random() * 9000000);
          const passportNumber = `P${randomNum}`;
          const issueDate = new Date();
          const expiryDate = new Date();
          expiryDate.setFullYear(expiryDate.getFullYear() + 10);
          const trackingNumber = `IN${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${Math.floor(1000 + Math.random() * 9000)}`;

          await prisma.passport.create({
            data: {
              passportNumber,
              issueDate,
              expiryDate,
              dispatchStatus: "DISPATCHED",
              trackingNumber,
              applicationId: application.id,
              officerId: officer.id,
            },
          });
        } else {
          const trackingNumber = `IN${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${Math.floor(1000 + Math.random() * 9000)}`;
          await prisma.passport.update({
            where: { id: application.passport.id },
            data: {
              dispatchStatus: "DISPATCHED",
              trackingNumber,
            },
          });
        }

        updatedApplication = await transitionApplicationStatus(
          application.id,
          "DISPATCHED",
          user.id,
          remarks || "Passport booklet dispatched via India Post Speed Post service."
        );
        break;
      }

      case "REJECT": {
        if (!reason || !reason.trim()) {
          return NextResponse.json({ error: "A statutory rejection reason is mandatory." }, { status: 400 });
        }

        await prisma.application.update({
          where: { id: application.id },
          data: {
            rejectionReason: reason.trim(),
          },
        });

        updatedApplication = await transitionApplicationStatus(
          application.id,
          "REJECTED",
          user.id,
          `Application rejected under Passports Act, 1967: ${reason.trim()}`
        );
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown scrutiny action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({
      message: `Action '${action}' recorded successfully!`,
      application: updatedApplication,
    });
  } catch (error: any) {
    console.error("Officer action error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
