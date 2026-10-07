import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { username, email, password, name, dob, address } = body;

    if (!username || !email || !password || !name || !dob || !address) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }

    const existingUsername = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already exists." },
        { status: 409 },
      );
    }

    const existingEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already exists." },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: "APPLICANT",

        applicant: {
          create: {
            applicantId: `APP-${Date.now()}`,
            name,
            dob: new Date(dob),
            address,
          },
        },
      },

      include: {
        applicant: true,
      },
    });

    return NextResponse.json(
      {
        message: "Registration successful.",
        userId: user.id,
        applicantId: user.applicant?.applicantId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong during registration.",
      },
      { status: 500 },
    );
  }
}
