import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getCurrentSession();

    if (session?.sessionId) {
      // Record logout timestamp in login_history
      await prisma.loginHistory.updateMany({
        where: {
          sessionId: session.sessionId,
          logoutTime: null,
        },
        data: {
          logoutTime: new Date(),
        },
      });
    }

    const response = NextResponse.json({
      message: "Logout successful.",
    });

    response.cookies.set("pas_session", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    const response = NextResponse.json({ message: "Logout completed." });
    response.cookies.set("pas_session", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });
    return response;
  }
}
