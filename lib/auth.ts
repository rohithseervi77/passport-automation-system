import { SignJWT, jwtVerify } from "jose";

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET is not defined.");
}

const secretKey = new TextEncoder().encode(secret);

export async function createSessionToken(userId: number) {
  return await new SignJWT({
    userId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    return {
      userId: Number(payload.userId),
    };
  } catch {
    return null;
  }
}
import { cookies } from "next/headers";

export async function getCurrentUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("pas_session")?.value;

  if (!token) {
    return null;
  }

  const session = await verifySessionToken(token);

  return session?.userId ?? null;
}
