import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const { id } = await props.params;
    const noticeIdInt = parseInt(id, 10);
    if (isNaN(noticeIdInt)) {
      return NextResponse.json({ error: "Invalid notice ID." }, { status: 400 });
    }

    const body = await req.json();
    const {
      title,
      summary,
      content,
      category,
      priority,
      status,
      isPinned,
      region,
      affectedCentre,
      sourceLabel,
      sourceUrl,
      attachmentName,
      effectiveDate,
      expiryDate,
    } = body;

    const existing = await prisma.notice.findUnique({
      where: { id: noticeIdInt },
    });

    if (!existing) {
      return NextResponse.json({ error: "Notice not found." }, { status: 404 });
    }

    const updated = await prisma.notice.update({
      where: { id: noticeIdInt },
      data: {
        title: title ? title.trim() : undefined,
        summary: summary ? summary.trim() : undefined,
        content: content ? content.trim() : undefined,
        category: category || undefined,
        priority: priority || undefined,
        status: status || undefined,
        isPinned: typeof isPinned === "boolean" ? isPinned : undefined,
        region: region !== undefined ? region?.trim() || null : undefined,
        affectedCentre: affectedCentre !== undefined ? affectedCentre?.trim() || null : undefined,
        sourceLabel: sourceLabel !== undefined ? sourceLabel?.trim() || null : undefined,
        sourceUrl: sourceUrl !== undefined ? sourceUrl?.trim() || null : undefined,
        attachmentName: attachmentName !== undefined ? attachmentName?.trim() || null : undefined,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        lastEditedBy: admin.username || "System Administrator",
      },
    });

    await logAuditEvent({
      userId: admin.id,
      action: "NOTICE_UPDATED",
      entityId: updated.noticeId,
      details: { title: updated.title, status: updated.status, priority: updated.priority },
    });

    return NextResponse.json({ message: "Notice updated successfully.", notice: updated });
  } catch (error) {
    console.error("Admin notice PUT error:", error);
    return NextResponse.json({ error: "Failed to update notice." }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const { id } = await props.params;
    const noticeIdInt = parseInt(id, 10);
    if (isNaN(noticeIdInt)) {
      return NextResponse.json({ error: "Invalid notice ID." }, { status: 400 });
    }

    const existing = await prisma.notice.findUnique({
      where: { id: noticeIdInt },
    });

    if (!existing) {
      return NextResponse.json({ error: "Notice not found." }, { status: 404 });
    }

    // Safe archival rather than hard deletion to maintain audit trail
    const archived = await prisma.notice.update({
      where: { id: noticeIdInt },
      data: {
        status: "ARCHIVED",
        lastEditedBy: admin.username || "System Administrator",
      },
    });

    await logAuditEvent({
      userId: admin.id,
      action: "NOTICE_ARCHIVED",
      entityId: existing.noticeId,
      details: { title: existing.title },
    });

    return NextResponse.json({ message: "Notice archived successfully.", notice: archived });
  } catch (error) {
    console.error("Admin notice DELETE error:", error);
    return NextResponse.json({ error: "Failed to archive notice." }, { status: 500 });
  }
}
