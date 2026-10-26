import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
  // Always prioritize the pooled connection string (PgBouncer port 6543) in serverless production
  const connectionString =
    process.env.DATABASE_URL &&
    (process.env.DATABASE_URL.startsWith("postgres://") ||
      process.env.DATABASE_URL.startsWith("postgresql://"))
      ? process.env.DATABASE_URL
      : process.env.DIRECT_URL &&
        (process.env.DIRECT_URL.startsWith("postgres://") ||
          process.env.DIRECT_URL.startsWith("postgresql://"))
      ? process.env.DIRECT_URL
      : "postgresql://postgres:postgres@127.0.0.1:5432/passport_db";

  const pool =
    globalForPrisma.pgPool ||
    new Pool({
      connectionString,
      // In serverless production, keep pool small (1-2 per lambda) to prevent max client exhaustion
      max: process.env.NODE_ENV === "production" ? 1 : 5,
      idleTimeoutMillis: 15000,
      connectionTimeoutMillis: 10000,
      ssl:
        connectionString.includes("supabase.co") ||
        connectionString.includes("supabase.com")
          ? { rejectUnauthorized: false }
          : undefined,
    });

  // Prevent idle connection error crashes
  pool.on("error", (err) => {
    console.error("PostgreSQL Pool unexpected client error:", err);
  });

  // Cache pool on globalThis across all environments to reuse across warm lambdas
  globalForPrisma.pgPool = pool;

  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ adapter });

  globalForPrisma.prisma = client;
  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
