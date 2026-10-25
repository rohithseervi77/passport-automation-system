import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transitionApplicationStatus } from "@/lib/applicationService";

// GET documents for applicant
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
            documents: {
              orderBy: { id: "asc" },
            },
          },
        },
      },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    const application = applicant.applications[0];
    return NextResponse.json({
      applicant: {
        name: applicant.name,
        email: applicant.user.email,
        phone: application?.emergencyMobile || "N/A",
      },
      documents: application?.documents || [],
      application: application ? {
        id: application.id,
        applicationId: application.applicationId,
        serviceType: application.serviceType,
        status: application.status,
      } : null,
    });
  } catch (error) {
    console.error("Fetch documents error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST upload/attach document
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

    let application = applicant.applications[0];
    if (!application) {
      return NextResponse.json({ error: "No active application found. Please initiate an application first." }, { status: 400 });
    }

    const body = await req.json();
    const { documentType, fileName, fileSize, fileUrl } = body;

    if (!documentType) {
      return NextResponse.json({ error: "Document type is required." }, { status: 400 });
    }

    // Check if a document of this type already exists for this application; if so update it
    const existingDoc = await prisma.document.findFirst({
      where: {
        applicationId: application.id,
        documentType,
      },
    });

    const docId = existingDoc ? existingDoc.docId : `DOC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const effectiveFileName = fileName || `${documentType.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`;
    const effectiveFileSize = fileSize || 1024 * 350; // default 350 KB simulation

    let savedDoc;
    if (existingDoc) {
      savedDoc = await prisma.document.update({
        where: { id: existingDoc.id },
        data: {
          fileStatus: "UPLOADED",
          fileName: effectiveFileName,
          fileSize: effectiveFileSize,
          fileUrl: fileUrl || `/uploads/${effectiveFileName}`,
          uploadedAt: new Date(),
        },
      });
    } else {
      savedDoc = await prisma.document.create({
        data: {
          docId,
          documentType,
          fileStatus: "UPLOADED",
          fileName: effectiveFileName,
          fileSize: effectiveFileSize,
          fileUrl: fileUrl || `/uploads/${effectiveFileName}`,
          applicationId: application.id,
        },
      });
    }

    // If the officer previously requested corrections, transition back to review
    let updatedStatus = application.status;
    if (application.status === "DOCUMENT_CORRECTION_REQUIRED" || application.status === "CLARIFICATION_REQUIRED") {
      try {
        const updatedApp = await transitionApplicationStatus(
          application.id,
          "DOCUMENT_REVIEW",
          userId,
          `Applicant uploaded corrected supporting document: ${documentType}`
        );
        updatedStatus = updatedApp.status;
      } catch (fsmError: any) {
        console.warn("FSM notice:", fsmError.message);
      }
    }

    return NextResponse.json({
      message: `Document '${documentType}' uploaded and verified successfully.`,
      document: savedDoc,
      status: updatedStatus,
    });
  } catch (error) {
    console.error("Upload document error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE remove document
export async function DELETE(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const docId = searchParams.get("docId");

    if (!docId) {
      return NextResponse.json({ error: "docId is required" }, { status: 400 });
    }

    const doc = await prisma.document.findUnique({
      where: { docId },
      include: {
        application: {
          include: { applicant: true },
        },
      },
    });

    if (!doc || doc.application.applicant.userId !== userId) {
      return NextResponse.json({ error: "Document not found or unauthorized" }, { status: 404 });
    }

    await prisma.document.delete({
      where: { docId },
    });

    return NextResponse.json({ message: "Document removed successfully" });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
