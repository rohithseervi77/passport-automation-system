import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const startDb = Date.now();
    let dbStatus = "HEALTHY";
    let dbLatencyMs = 0;

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - startDb;
    } catch (e: any) {
      dbStatus = "DEGRADED";
      dbLatencyMs = Date.now() - startDb;
    }

    const storageConfigured = isSupabaseConfigured();

    return NextResponse.json({
      systemStatus: dbStatus === "HEALTHY" ? "OPERATIONAL" : "DEGRADED",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || "development",
      runtime: {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      services: {
        database: {
          provider: "PostgreSQL (Supabase)",
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
        storage: {
          provider: "Supabase Storage (passport-documents bucket)",
          configured: storageConfigured,
          accessMode: "Private Signed URLs (AES-256)",
        },
        authentication: {
          provider: "Supabase Auth (Zero Database Passwords)",
          status: "ACTIVE",
          sessionAlgorithm: "HS256 (jose)",
        },
      },
    });
  } catch (error) {
    console.error("System health error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
