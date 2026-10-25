import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

// Helper to generate unique Grievance Ticket ID: GRV-YYYY-XXXXX
function generateTicketId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `GRV-${year}-${rand}`;
}

// GET all grievances for current user (or all grievances if officer/admin)
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let grievances;
    if (user.role === "OFFICER" || user.role === "ADMIN") {
      // Staff view: see all tickets
      grievances = await prisma.grievance.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { username: true, email: true },
          },
        },
      });
    } else {
      // Citizen view: see own tickets
      grievances = await prisma.grievance.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ grievances });
  } catch (error) {
    console.error("Fetch grievances error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST create a new grievance ticket
export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { category, subject, description, attachmentUrl } = body;

    if (!category || !subject || !description) {
      return NextResponse.json(
        { error: "Category, subject, and description are required." },
        { status: 400 }
      );
    }

    const ticketId = generateTicketId();

    const grievance = await prisma.grievance.create({
      data: {
        ticketId,
        category,
        subject,
        description,
        attachmentUrl,
        status: "OPEN",
        userId,
      },
    });

    await logAuditEvent({
      userId,
      action: "GRIEVANCE_LODGED",
      entityId: ticketId,
      details: { category, subject },
    });

    return NextResponse.json({
      message: "Grievance ticket created successfully.",
      grievance,
    });
  } catch (error) {
    console.error("Create grievance error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH respond to or close a grievance (Officer / Admin)
export async function PATCH(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, username: true },
    });

    if (!user || (user.role !== "OFFICER" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Forbidden: Only authorized passport officers can resolve grievances." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { ticketId, status, response } = body;

    if (!ticketId || !status) {
      return NextResponse.json({ error: "ticketId and status are required." }, { status: 400 });
    }

    const updated = await prisma.grievance.update({
      where: { ticketId },
      data: {
        status,
        response: response || undefined,
        respondedAt: response ? new Date() : undefined,
        respondedBy: response ? user.username : undefined,
      },
    });

    await logAuditEvent({
      userId,
      action: "GRIEVANCE_RESPONDED",
      entityId: ticketId,
      details: { status, response },
    });

    return NextResponse.json({
      message: "Grievance updated successfully.",
      grievance: updated,
    });
  } catch (error) {
    console.error("Update grievance error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
