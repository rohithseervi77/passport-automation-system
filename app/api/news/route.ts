import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const priority = searchParams.get("priority")?.trim() || "";
    const region = searchParams.get("region")?.trim() || "";
    const yearParam = searchParams.get("year")?.trim() || "";
    const sortParam = searchParams.get("sort")?.trim() || "newest"; // newest | oldest
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    // Strict publication status check for public citizens
    const where: any = {
      status: "PUBLISHED",
    };

    // Filter by dynamic publication year
    if (yearParam && yearParam !== "ALL") {
      const year = parseInt(yearParam, 10);
      if (!isNaN(year)) {
        const startOfYear = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
        const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
        where.publishedAt = {
          gte: startOfYear,
          lte: endOfYear,
        };
      }
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (priority && priority !== "ALL") {
      where.priority = priority;
    }

    if (region && region !== "ALL") {
      where.region = { contains: region, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { region: { contains: search, mode: "insensitive" } },
        { affectedCentre: { contains: search, mode: "insensitive" } },
        { sourceLabel: { contains: search, mode: "insensitive" } },
      ];
    }

    const sortOrder = sortParam === "oldest" ? ("asc" as const) : ("desc" as const);

    // Concurrently fetch notices, total count, categories, distinct regions, and distinct years
    const [notices, total, categories, regionsData, distinctYearsResult] = await Promise.all([
      prisma.notice.findMany({
        where,
        select: {
          id: true,
          noticeId: true,
          slug: true,
          title: true,
          summary: true,
          content: true,
          category: true,
          priority: true,
          status: true,
          isPinned: true,
          isSimulated: true,
          publishedAt: true,
          effectiveDate: true,
          expiryDate: true,
          region: true,
          affectedCentre: true,
          sourceLabel: true,
          sourceUrl: true,
          attachmentName: true,
          attachmentUrl: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [
          { isPinned: "desc" },
          { publishedAt: sortOrder },
        ],
        skip,
        take: limit,
      }),
      prisma.notice.count({ where }),
      prisma.noticeCategory.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.notice.findMany({
        where: { status: "PUBLISHED", region: { not: null } },
        select: { region: true },
        distinct: ["region"],
      }),
      prisma.$queryRaw<{ year: number }[]>`
        SELECT DISTINCT EXTRACT(YEAR FROM "publishedAt")::int as year
        FROM "Notice"
        WHERE "status" = 'PUBLISHED' AND "publishedAt" IS NOT NULL
        ORDER BY year DESC
      `,
    ]);

    const regions = Array.from(new Set(regionsData.map((r) => r.region).filter(Boolean)));
    const years = (distinctYearsResult || [])
      .map((r) => r.year)
      .filter((y): y is number => typeof y === "number" && !isNaN(y));

    return NextResponse.json({
      success: true,
      notices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      years, // 100% database-derived distinct years
      categories,
      regions,
      disclaimer: "Academic Simulation — Public notices queried dynamically from PostgreSQL.",
    });
  } catch (error: any) {
    console.error("Public news API error:", error);
    return NextResponse.json(
      { error: "Failed to load public notices from database.", details: error?.message },
      { status: 500 }
    );
  }
}
