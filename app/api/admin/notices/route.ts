import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (priority && priority !== "ALL") {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
        { noticeId: { contains: search, mode: "insensitive" } },
        { region: { contains: search, mode: "insensitive" } },
      ];
    }

    const [notices, total, categories] = await Promise.all([
      prisma.notice.findMany({
        where,
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.notice.count({ where }),
      prisma.noticeCategory.findMany({ orderBy: { displayOrder: "asc" } }),
    ]);

    return NextResponse.json({
      notices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      categories,
    });
  } catch (error) {
    console.error("Admin notices GET error:", error);
    return NextResponse.json({ error: "Failed to load notices." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      summary,
      content,
      category,
      priority = "NORMAL",
      status = "PUBLISHED",
      isPinned = false,
      region,
      affectedCentre,
      sourceLabel,
      sourceUrl,
      attachmentName,
      effectiveDate,
      expiryDate,
    } = body;

    if (!title || !summary || !content || !category) {
      return NextResponse.json({ error: "Title, summary, content, and category are required." }, { status: 400 });
    }

    const generatedSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const noticeCount = await prisma.notice.count();
    const noticeId = `NOT-2026-${String(noticeCount + 1).padStart(3, "0")}`;

    const newNotice = await prisma.notice.create({
      data: {
        noticeId,
        slug: generatedSlug,
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        category,
        priority,
        status,
        isPinned: Boolean(isPinned),
        isSimulated: true,
        region: region?.trim() || null,
        affectedCentre: affectedCentre?.trim() || null,
        sourceLabel: sourceLabel?.trim() || "Passport Seva Directorate / Ministry of External Affairs",
        sourceUrl: sourceUrl?.trim() || "https://www.passportindia.gov.in/psp/News",
        attachmentName: attachmentName?.trim() || null,
        author: admin.username || "System Administrator",
        publishedAt: status === "PUBLISHED" ? new Date() : new Date(),
        effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
    });

    await logAuditEvent({
      userId: admin.id,
      action: "NOTICE_CREATED",
      entityId: newNotice.noticeId,
      details: { title: newNotice.title, category: newNotice.category, status: newNotice.status },
    });

    return NextResponse.json({ message: "Notice published successfully.", notice: newNotice }, { status: 201 });
  } catch (error: any) {
    console.error("Admin notices POST error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A notice with this slug or title already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create notice." }, { status: 500 });
  }
}
