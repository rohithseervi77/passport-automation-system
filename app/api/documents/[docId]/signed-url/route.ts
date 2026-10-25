import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDocumentSignedUrl } from "@/lib/supabase";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { docId } = await params;

    if (!docId) {
      return NextResponse.json({ error: "docId is required" }, { status: 400 });
    }

    const doc = await prisma.document.findUnique({
      where: { docId },
      include: {
        application: {
          include: {
            applicant: true,
            officer: true,
            policeReports: true,
          },
        },
      },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Role-based Access Control (RBAC) & Application Ownership
    let isAuthorized = false;

    if (user.role === "APPLICANT") {
      isAuthorized = doc.application.applicant.userId === user.id;
    } else if (user.role === "OFFICER") {
      // Passport officers can view applications in their operational queue
      isAuthorized = Boolean(user.passportOfficer);
    } else if (user.role === "POLICE") {
      // Police personnel can inspect supporting documents for background verification
      isAuthorized = Boolean(user.police);
    } else if (user.role === "ADMIN") {
      isAuthorized = Boolean(user.admin);
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Access denied. You do not have permission to view this document." },
        { status: 403 }
      );
    }

    // Generate short-lived signed URL (expires in 5 minutes)
    const signedUrl = await createDocumentSignedUrl(doc.storagePath || doc.fileUrl, 300);

    // Audit log document view
    await logAuditEvent({
      userId: user.id,
      action: "DOCUMENT_VIEWED",
      entityId: doc.docId,
      details: {
        role: user.role,
        applicationId: doc.application.applicationId,
        documentType: doc.documentType,
        fileName: doc.fileName,
      },
    });

    return NextResponse.json({
      docId: doc.docId,
      fileName: doc.fileName,
      mimeType: doc.mimeType || "application/pdf",
      documentType: doc.documentType,
      verificationStatus: doc.verificationStatus,
      signedUrl,
      expiresInSeconds: 300,
    });
  } catch (error) {
    console.error("Fetch signed URL error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
