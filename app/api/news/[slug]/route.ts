import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params;

    if (!slug) {
      return NextResponse.json({ error: "Notice slug is required." }, { status: 400 });
    }

    const notice = await prisma.notice.findUnique({
      where: { slug },
    });

    if (!notice || notice.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Notice not found or no longer active." }, { status: 404 });
    }

    // Fetch up to 3 related notices from the same category
    const relatedNotices = await prisma.notice.findMany({
      where: {
        category: notice.category,
        slug: { not: notice.slug },
        status: "PUBLISHED",
      },
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        priority: true,
        publishedAt: true,
        region: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
    });

    return NextResponse.json({ notice, relatedNotices });
  } catch (error) {
    console.error("Notice detail API error:", error);
    return NextResponse.json({ error: "Failed to load announcement detail." }, { status: 500 });
  }
}
