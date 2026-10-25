import { prisma } from "./prisma";
import { headers } from "next/headers";

export interface AuditEventOptions {
  userId?: number | null;
  action: string;
  entityId?: string | null;
  details?: Record<string, any> | string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Universal server-side audit logger for Passport Automation System.
 * Records state transitions, document actions, approvals, logins, and verifications.
 */
export async function logAuditEvent(options: AuditEventOptions) {
  try {
    let clientIp = options.ipAddress || null;
    let clientAgent = options.userAgent || null;

    try {
      const headerList = await headers();
      if (!clientIp) {
        clientIp =
          headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          headerList.get("x-real-ip") ||
          null;
      }
      if (!clientAgent) {
        clientAgent = headerList.get("user-agent") || null;
      }
    } catch {
      // Background or script execution context
    }

    const detailsStr = options.details
      ? typeof options.details === "string"
        ? options.details
        : JSON.stringify(options.details)
      : null;

    const auditEntry = await prisma.auditLog.create({
      data: {
        userId: options.userId ?? null,
        action: options.action,
        entityId: options.entityId ?? null,
        details: detailsStr,
        ipAddress: clientIp,
        userAgent: clientAgent,
      },
    });

    return auditEntry;
  } catch (error) {
    console.warn("[AuditLogger] Failed to create audit log record:", error);
    return null;
  }
}
