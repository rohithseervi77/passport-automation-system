import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { createDocumentSignedUrl } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const { id } = await params;
    const appId = parseInt(id);

    const application = await prisma.application.findFirst({
      where: isNaN(appId) ? { applicationId: id } : { OR: [{ id: appId }, { applicationId: id }] },
      include: {
        applicant: {
          include: { user: true },
        },
        documents: true,
        appointment: {
          include: {
            history: { orderBy: { rescheduledAt: "desc" } },
          },
        },
        policeReports: {
          orderBy: { id: "desc" },
          include: { police: true },
        },
        passport: true,
        officer: true,
        statusHistory: {
          orderBy: { changedAt: "desc" },
        },
        payments: {
          orderBy: { id: "desc" },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    // Generate short-lived signed URLs for documents
    const documentsWithUrls = await Promise.all(
      application.documents.map(async (doc) => {
        let signedUrl: string | null = null;
        if (doc.storagePath) {
          signedUrl = await createDocumentSignedUrl(doc.storagePath, 300);
        } else if (doc.fileUrl) {
          signedUrl = doc.fileUrl;
        }
        return {
          ...doc,
          signedUrl,
        };
      })
    );

    return NextResponse.json({
      application: {
        ...application,
        documents: documentsWithUrls,
      },
    });
  } catch (error) {
    console.error("Admin application details error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const { id } = await params;
    const appId = parseInt(id);

    const application = await prisma.application.findFirst({
      where: isNaN(appId) ? { applicationId: id } : { OR: [{ id: appId }, { applicationId: id }] },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const body = await req.json();
    const { newStatus, reason } = body;

    if (!newStatus || !reason || !reason.trim()) {
      return NextResponse.json(
        { error: "Both 'newStatus' and a mandatory administrative 'reason' are required." },
        { status: 400 }
      );
    }

    const previousStatus = application.status;

    // Execute atomic update
    const [updatedApp] = await prisma.$transaction([
      prisma.application.update({
        where: { id: application.id },
        data: {
          status: newStatus,
          updatedAt: new Date(),
        },
      }),
      prisma.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          fromStatus: previousStatus,
          toStatus: newStatus,
          remarks: `Administrative override: ${reason.trim()}`,
          performedBy: `${admin.username} (${admin.admin?.adminCode})`,
          role: "ADMIN",
          changedById: admin.id,
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: admin.id,
          action: "ADMIN_STATUS_OVERRIDE",
          entityId: application.applicationId,
          details: JSON.stringify({
            previousStatus,
            newStatus,
            reason: reason.trim(),
            adminCode: admin.admin?.adminCode,
          }),
        },
      }),
    ]);

    return NextResponse.json({
      message: `Application status administratively updated to ${newStatus}.`,
      application: updatedApp,
    });
  } catch (error) {
    console.error("Admin status override error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
