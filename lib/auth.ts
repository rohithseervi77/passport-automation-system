import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const secret = process.env.AUTH_SECRET || "passport-automation-system-super-secret-key-32-chars";
const secretKey = new TextEncoder().encode(secret);

export interface SessionPayload {
  userId: number;
  authUserId?: string | null;
  role?: string;
  sessionId?: string | null;
}

/**
 * Creates a cryptographically signed JWT session token.
 * Contains no sensitive passwords.
 */
export async function createSessionToken(payload: number | SessionPayload) {
  const data: SessionPayload =
    typeof payload === "number" ? { userId: payload } : payload;

  return await new SignJWT({
    userId: data.userId,
    authUserId: data.authUserId || null,
    role: data.role || "APPLICANT",
    sessionId: data.sessionId || null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

/**
 * Verifies a JWT session token.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    return {
      userId: Number(payload.userId),
      authUserId: (payload.authUserId as string) || null,
      role: (payload.role as string) || "APPLICANT",
      sessionId: (payload.sessionId as string) || null,
    };
  } catch {
    return null;
  }
}

/**
 * Retrieves the current session's database user ID.
 */
export async function getCurrentUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("pas_session")?.value;

  if (!token) {
    return null;
  }

  const session = await verifySessionToken(token);
  return session?.userId ?? null;
}

/**
 * Retrieves current session payload (including authUserId & sessionId).
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("pas_session")?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session) return null;

  // Check if session has been revoked by an administrator
  if (session.sessionId) {
    try {
      const revoked = await prisma.loginHistory.findFirst({
        where: { sessionId: session.sessionId, isRevoked: true },
      });
      if (revoked) return null;
    } catch {
      // Fallback
    }
  }

  return session;
}

/**
 * Retrieves current authenticated user record with relations.
 * Guaranteed to never return passwords (passwords reside strictly in Supabase Auth).
 */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  if (!session?.userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        applicant: true,
        passportOfficer: true,
        police: true,
        admin: true,
      },
    });

    if (!user || !user.isActive) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Enforces role-based authorization server-side.
 */
export async function requireUserWithRole(allowedRoles: string[]) {
  const user = await getCurrentUser();
  if (!user || !user.isActive) {
    return null;
  }
  if (!allowedRoles.includes(user.role)) {
    return null;
  }
  return user;
}

/**
 * Enforces strictly ADMIN role authorization server-side.
 * Returns the authenticated Admin User or null if unauthorized.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isActive) return null;
  if (user.role !== "ADMIN" || !user.admin) return null;
  return user;
}
