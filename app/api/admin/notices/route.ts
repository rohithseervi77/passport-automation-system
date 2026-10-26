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
    const yearParam = searchParams.get("year");
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

    if (yearParam && yearParam !== "ALL") {
      const yr = parseInt(yearParam, 10);
      if (!isNaN(yr)) {
        where.publishedAt = {
          gte: new Date(Date.UTC(yr, 0, 1)),
          lte: new Date(Date.UTC(yr, 11, 31, 23, 59, 59, 999)),
        };
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
        { noticeId: { contains: search, mode: "insensitive" } },
        { region: { contains: search, mode: "insensitive" } },
        { sourceLabel: { contains: search, mode: "insensitive" } },
      ];
    }

    const [notices, total, categories, publishedCount, draftCount, archivedCount, yearStats] = await Promise.all([
      prisma.notice.findMany({
        where,
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.notice.count({ where }),
      prisma.noticeCategory.findMany({ orderBy: { displayOrder: "asc" } }),
      prisma.notice.count({ where: { status: "PUBLISHED" } }),
      prisma.notice.count({ where: { status: "DRAFT" } }),
      prisma.notice.count({ where: { status: "ARCHIVED" } }),
      prisma.$queryRaw<{ year: number; count: number }[]>`
        SELECT EXTRACT(YEAR FROM "publishedAt")::int as year, count(*)::int as count
        FROM "Notice"
        WHERE "publishedAt" IS NOT NULL
        GROUP BY EXTRACT(YEAR FROM "publishedAt")
        ORDER BY year DESC
      `,
    ]);

    return NextResponse.json({
      notices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      categories,
      stats: {
        publishedCount,
        draftCount,
        archivedCount,
        yearStats: yearStats || [],
      },
    });
  } catch (error) {
    console.error("Admin notices GET error:", error);
    return NextResponse.json({ error: "Failed to load notices from database." }, { status: 500 });
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
      region = "All India",
      affectedCentre = null,
      sourceLabel = "Ministry of External Affairs",
      sourceUrl = "https://www.passportindia.gov.in/psp/News",
      attachmentName = null,
      publishedAt = null,
      effectiveDate = null,
      expiryDate = null,
    } = body;

    if (!title || !summary || !content || !category) {
      return NextResponse.json(
        { error: "Title, summary, full content, and category are required." },
        { status: 400 }
      );
    }

    const pubDate = publishedAt ? new Date(publishedAt) : new Date();
    const year = pubDate.getFullYear();
    const cleanSlug = slug
      ? slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-")
      : title.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");

    // Check slug uniqueness
    const existing = await prisma.notice.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      return NextResponse.json(
        { error: "A notice with this slug or title already exists in the database." },
        { status: 409 }
      );
    }

    const randNum = Math.floor(100 + Math.random() * 900);
    const noticeId = `NOT-${year}-${randNum}`;

    const newNotice = await prisma.notice.create({
      data: {
        noticeId,
        slug: cleanSlug,
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        category,
        priority,
        status,
        isPinned: Boolean(isPinned),
        isSimulated: true,
        publishedAt: pubDate,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : pubDate,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        region,
        affectedCentre,
        sourceLabel,
        sourceUrl,
        attachmentName,
        author: admin.email || "Admin Desk",
      },
    });

    await logAuditEvent({
      userId: admin.id,
      action: "CREATE_NOTICE",
      entityId: newNotice.noticeId,
      details: {
        title: newNotice.title,
        status: newNotice.status,
        category: newNotice.category,
        publishedAt: newNotice.publishedAt,
      },
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, notice: newNotice });
  } catch (error: any) {
    console.error("Admin notices POST error:", error);
    return NextResponse.json({ error: "Failed to create notice in database." }, { status: 500 });
  }
}
