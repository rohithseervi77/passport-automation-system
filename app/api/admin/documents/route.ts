import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { createDocumentSignedUrl } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status"); // ALL, PENDING, VERIFIED, REJECTED
    const typeFilter = searchParams.get("type");
    const searchQuery = searchParams.get("q") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 20;

    const where: any = {};

    if (statusFilter && statusFilter !== "ALL") {
      where.verificationStatus = statusFilter;
    }

    if (typeFilter && typeFilter !== "ALL") {
      where.documentType = { contains: typeFilter };
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      where.OR = [
        { docId: { contains: q } },
        { fileName: { contains: q } },
        { application: { applicationId: { contains: q } } },
        { application: { applicant: { name: { contains: q } } } },
      ];
    }

    const [documentsList, totalCount] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          application: {
            select: {
              id: true,
              applicationId: true,
              status: true,
              applicant: {
                select: { name: true, user: { select: { email: true } } },
              },
            },
          },
        },
        orderBy: { uploadedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.document.count({ where }),
    ]);

    return NextResponse.json({
      documents: documentsList,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Admin documents error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Log document inspection
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { docId } = body;

    if (!docId) {
      return NextResponse.json({ error: "docId is required." }, { status: 400 });
    }

    const doc = await prisma.document.findUnique({
      where: { docId },
      include: {
        application: true,
      },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const signedUrl = await createDocumentSignedUrl(doc.storagePath || doc.fileUrl, 300);

    // Audit log
    await logAuditEvent({
      userId: admin.id,
      action: "ADMIN_DOCUMENT_INSPECTED",
      entityId: doc.docId,
      details: {
        adminCode: admin.admin?.adminCode,
        applicationId: doc.application.applicationId,
        documentType: doc.documentType,
        fileName: doc.fileName,
      },
    });

    return NextResponse.json({
      docId: doc.docId,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
      signedUrl,
      expiresIn: 300,
    });
  } catch (error) {
    console.error("Admin document inspect error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
