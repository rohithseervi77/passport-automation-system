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
        await prisma.document.updateMany({
          where: { applicationId: application.id },
          data: { fileStatus: "VERIFIED" },
        });

        // E.g. transition DRAFT -> SUBMITTED -> DOCUMENT_REVIEW -> DOCUMENT_VERIFIED
        // The frontend might pass the app in various states. Let's force it if it's currently SUBMITTED.
        // Actually, just use the service. But for simplicity, we assume the frontend ensures current state.
        try {
          updatedApplication = await transitionApplicationStatus(application.id, "DOCUMENT_VERIFIED", user.id, remarks);
        } catch (e: any) {
          return NextResponse.json({ error: e.message }, { status: 400 });
        }
        break;
      }

      case "INITIATE_POLICE": {
        try {
          updatedApplication = await transitionApplicationStatus(application.id, "POLICE_VERIFICATION_PENDING", user.id, remarks);
        } catch (e: any) {
          return NextResponse.json({ error: e.message }, { status: 400 });
        }
        break;
      }

      case "APPROVE": {
        try {
          updatedApplication = await transitionApplicationStatus(application.id, "APPROVED", user.id, remarks);
        } catch (e: any) {
          return NextResponse.json({ error: e.message }, { status: 400 });
        }
        break;
      }

      case "REJECT": {
        try {
          updatedApplication = await transitionApplicationStatus(application.id, "REJECTED", user.id, remarks);
        } catch (e: any) {
          return NextResponse.json({ error: e.message }, { status: 400 });
        }
        break;
      }

      case "REQUEST_CORRECTION": {
        await prisma.document.updateMany({
          where: { applicationId: application.id },
          data: { fileStatus: "REJECTED" },
        });

        try {
          updatedApplication = await transitionApplicationStatus(application.id, "DOCUMENT_CORRECTION_REQUIRED", user.id, remarks || "Documents rejected, correction required");
        } catch (e: any) {
          return NextResponse.json({ error: e.message }, { status: 400 });
        }
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

        try {
          updatedApplication = await transitionApplicationStatus(application.id, "PASSPORT_PRINTING", user.id, remarks);
        } catch (e: any) {
          return NextResponse.json({ error: e.message }, { status: 400 });
        }
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

        try {
          updatedApplication = await transitionApplicationStatus(application.id, "PASSPORT_DISPATCHED", user.id, remarks);
        } catch (e: any) {
          return NextResponse.json({ error: e.message }, { status: 400 });
        }
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
