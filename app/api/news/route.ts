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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const where: any = {
      status: "PUBLISHED",
    };

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
      ];
    }

    const [notices, total, categories, regionsData] = await Promise.all([
      prisma.notice.findMany({
        where,
        orderBy: [
          { isPinned: "desc" },
          { publishedAt: "desc" },
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
    ]);

    const regions = Array.from(new Set(regionsData.map((r) => r.region).filter(Boolean)));

    return NextResponse.json({
      notices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      categories,
      regions,
    });
  } catch (error) {
    console.error("Public news API error:", error);
    return NextResponse.json({ error: "Failed to load public notices." }, { status: 500 });
  }
}
