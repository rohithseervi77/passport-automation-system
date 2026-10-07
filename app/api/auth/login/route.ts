import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { username, password } = body;

    // 1. Check required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 },
      );
    }

    // 2. Find the user
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        applicant: true,
        passportOfficer: true,
        police: true,
      },
    });

    // 3. Check whether user exists
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    }

    // 4. Compare entered password with hashed password
    const passwordMatches = await bcrypt.compare(password, user.password);

    // 5. Reject incorrect password
    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    }

    // 6. Create login session
    const sessionToken = await createSessionToken(user.id);

    // 7. Create response
    const response = NextResponse.json(
      {
        message: "Login successful.",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          applicantId: user.applicant?.applicantId ?? null,
          officerId: user.passportOfficer?.officerId ?? null,
          stationCode: user.police?.stationCode ?? null,
        },
      },
      { status: 200 },
    );

    // 8. Store session token in an HTTP-only cookie
    response.cookies.set("pas_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong during login.",
      },
      { status: 500 },
    );
  }
}
