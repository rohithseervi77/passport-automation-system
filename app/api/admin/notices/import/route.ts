import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Simple robust CSV parser handling quotes and commas
function parseCSV(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let currentLine = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
      currentLine += char;
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      if (currentLine.trim()) lines.push(currentLine.trim());
      currentLine = "";
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) lines.push(currentLine.trim());
  if (lines.length < 2) return [];

  const parseRow = (line: string): string[] => {
    const values: string[] = [];
    let curVal = "";
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === "," && !inQuotes) {
        values.push(curVal.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
        curVal = "";
      } else {
        curVal += c;
      }
    }
    values.push(curVal.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
    return values;
  };

  const headers = parseRow(lines[0]).map((h) => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];

  for (let k = 1; k < lines.length; k++) {
    const vals = parseRow(lines[k]);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = vals[idx] || "";
    });
    rows.push(obj);
  }

  return rows;
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { rawData, format = "json", commit = false } = body;

    if (!rawData) {
      return NextResponse.json({ error: "Missing data payload for import." }, { status: 400 });
    }

    let rawRows: any[] = [];
    if (format === "csv") {
      if (typeof rawData !== "string") {
        return NextResponse.json({ error: "CSV data must be provided as text string." }, { status: 400 });
      }
      rawRows = parseCSV(rawData);
    } else {
      rawRows = Array.isArray(rawData) ? rawData : (typeof rawData === "string" ? JSON.parse(rawData) : []);
    }

    if (rawRows.length === 0) {
      return NextResponse.json({ error: "No records found in import payload." }, { status: 400 });
    }

    // Existing slugs and IDs for duplicate prevention
    const existingNotices = await prisma.notice.findMany({
      select: { slug: true, noticeId: true },
    });
    const existingSlugs = new Set(existingNotices.map((n) => n.slug));
    const existingIds = new Set(existingNotices.map((n) => n.noticeId));

    const validRows: any[] = [];
    const invalidRows: { row: number; item: any; errors: string[] }[] = [];

    rawRows.forEach((row, index) => {
      const errors: string[] = [];
      const title = row.title?.trim();
      const summary = row.summary?.trim() || title;
      const content = row.content?.trim() || summary || title;
      const category = row.category?.trim() || "Public Notices, Advisories & Circulars";
      const priority = ["NORMAL", "IMPORTANT", "CRITICAL"].includes(row.priority?.toUpperCase())
        ? row.priority.toUpperCase()
        : "NORMAL";
      const status = ["PUBLISHED", "DRAFT", "ARCHIVED", "SCHEDULED"].includes(row.status?.toUpperCase())
        ? row.status.toUpperCase()
        : "PUBLISHED";

      if (!title || title.length < 5) {
        errors.push("Title is required and must be at least 5 characters.");
      }

      // Validate Published Date
      let publishedAt: Date = new Date();
      if (row.publishedat || row.publishedAt || row.date) {
        const d = new Date(row.publishedat || row.publishedAt || row.date);
        if (isNaN(d.getTime())) {
          errors.push("Invalid date format for publication date.");
        } else {
          publishedAt = d;
        }
      }

      const year = publishedAt.getFullYear();
      let slug = row.slug?.trim() ? slugify(row.slug) : slugify(title || "notice");
      if (existingSlugs.has(slug)) {
        slug = `${slug}-${year}-${Math.floor(100 + Math.random() * 900)}`;
      }

      let noticeId = row.noticeid || row.noticeId;
      if (!noticeId || existingIds.has(noticeId)) {
        const rand = Math.floor(100 + Math.random() * 900);
        noticeId = `NOT-${year}-${rand}`;
      }

      if (errors.length > 0) {
        invalidRows.push({ row: index + 1, item: row, errors });
      } else {
        existingSlugs.add(slug);
        existingIds.add(noticeId);

        validRows.push({
          noticeId,
          slug,
          title,
          summary,
          content,
          category,
          priority,
          status,
          isPinned: row.ispinned === "true" || row.isPinned === true,
          isSimulated: true,
          publishedAt,
          effectiveDate: row.effectivedate ? new Date(row.effectivedate) : publishedAt,
          region: row.region?.trim() || "All India",
          affectedCentre: row.affectedcentre || row.affectedCentre || null,
          sourceLabel: row.sourcelabel || row.sourceLabel || row.source || "Official Gazette / Press Bulletin",
          sourceUrl: row.sourceurl || row.sourceUrl || "https://www.passportindia.gov.in/psp/News",
          author: admin.email || "Admin Import Desk",
        });
      }
    });

    // If Dry Run / Preview Only
    if (!commit) {
      return NextResponse.json({
        success: true,
        previewOnly: true,
        totalSubmitted: rawRows.length,
        validCount: validRows.length,
        invalidCount: invalidRows.length,
        validSample: validRows.slice(0, 5),
        invalidRows,
      });
    }

    // Execute Commit inside Transaction
    if (validRows.length === 0) {
      return NextResponse.json(
        { error: "No valid rows to commit.", invalidRows },
        { status: 400 }
      );
    }

    const createdRecords = await prisma.$transaction(
      validRows.map((item) =>
        prisma.notice.create({
          data: item,
        })
      )
    );

    await logAuditEvent({
      userId: admin.id,
      action: "IMPORT_NOTICES",
      entityId: `BATCH-${Date.now()}`,
      details: {
        totalSubmitted: rawRows.length,
        importedCount: createdRecords.length,
        failedCount: invalidRows.length,
        format,
      },
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      committed: true,
      importedCount: createdRecords.length,
      failedCount: invalidRows.length,
      invalidRows,
      message: `Successfully imported ${createdRecords.length} records into the database.`,
    });
  } catch (error: any) {
    console.error("Notice import error:", error);
    return NextResponse.json(
      { error: "Import processing failed.", details: error?.message },
      { status: 500 }
    );
  }
}
