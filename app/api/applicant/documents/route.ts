import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
        applications: {
          orderBy: { id: "desc" },
          take: 1,
          include: {
            documents: true,
          },
        },
      },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    const application = applicant.applications[0];
    return NextResponse.json({
      applicant,
      documents: application?.documents || [],
      applicationId: application?.applicationId || null,
      status: application?.status || null,
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
    // If no application exists, create a draft application first
    if (!application) {
      const newAppId = `PAS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      application = await prisma.application.create({
        data: {
          applicationId: newAppId,
          passportType: "REGULAR (36 Pages)",
          status: "DRAFT",
          applicantId: applicant.id,
        },
      });
    }

    const body = await req.json();
    const { documentType, fileUrl } = body;

    if (!documentType) {
      return NextResponse.json({ error: "Document type is required" }, { status: 400 });
    }

    const docId = `DOC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const newDoc = await prisma.document.create({
      data: {
        docId,
        documentType,
        fileStatus: "UPLOADED",
        fileUrl: fileUrl || `/uploads/${documentType.toLowerCase().replace(/\s+/g, "_")}.pdf`,
        applicationId: application.id,
      },
    });

    // Unhappy Path: If the officer rejected documents and asked for correction,
    // re-uploading should push it back to DOCUMENT_REVIEW via the FSM.
    import { transitionApplicationStatus } from "@/lib/applicationService";
    let updatedStatus = application.status;
    if (application.status === "DOCUMENT_CORRECTION_REQUIRED") {
      try {
        const updatedApp = await transitionApplicationStatus(application.id, "DOCUMENT_REVIEW", userId, "Applicant uploaded corrected documents");
        updatedStatus = updatedApp.status;
      } catch (fsmError) {
        console.error("Failed to transition application after document re-upload", fsmError);
      }
    }

    return NextResponse.json({
      message: "Document uploaded successfully",
      document: newDoc,
      status: updatedStatus
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
