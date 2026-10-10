import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      username,
      email,
      password,
      role = "APPLICANT",
      name,
      dob,
      address,
      branchLocation,
      officerId,
      stationCode,
      badgeNumber,
    } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required." },
        { status: 400 },
      );
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already exists." },
        { status: 409 },
      );
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already exists." },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let createdUser;

    if (role === "OFFICER") {
      const offId = officerId || `OFF-${Date.now().toString().slice(-6)}`;
      const existingOfficer = await prisma.passportOfficer.findUnique({
        where: { officerId: offId },
      });
      if (existingOfficer) {
        return NextResponse.json(
          { error: "Officer ID already in use. Please choose another." },
          { status: 409 },
        );
      }

      createdUser = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: "OFFICER",
          passportOfficer: {
            create: {
              officerId: offId,
              branchLocation: branchLocation || "RPO Headquarters - Regional Processing Office",
            },
          },
        },
        include: {
          passportOfficer: true,
        },
      });

      return NextResponse.json(
        {
          message: "Passport Officer registration successful.",
          userId: createdUser.id,
          role: "OFFICER",
          officerId: createdUser.passportOfficer?.officerId,
        },
        { status: 201 },
      );
    } else if (role === "POLICE") {
      const badge = badgeNumber || `POL-${Date.now().toString().slice(-6)}`;
      const existingPolice = await prisma.police.findUnique({
        where: { badgeNumber: badge },
      });
      if (existingPolice) {
        return NextResponse.json(
          { error: "Badge number already in use. Please choose another." },
          { status: 409 },
        );
      }

      createdUser = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: "POLICE",
          police: {
            create: {
              stationCode: stationCode || "PS-CENTRAL",
              badgeNumber: badge,
            },
          },
        },
        include: {
          police: true,
        },
      });

      return NextResponse.json(
        {
          message: "Police Officer registration successful.",
          userId: createdUser.id,
          role: "POLICE",
          badgeNumber: createdUser.police?.badgeNumber,
          stationCode: createdUser.police?.stationCode,
        },
        { status: 201 },
      );
    } else {
      // APPLICANT
      if (!name || !dob || !address) {
        return NextResponse.json(
          { error: "Full name, date of birth, and residential address are required for applicant registration." },
          { status: 400 },
        );
      }

      createdUser = await prisma.user.create({
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

      await prisma.auditLog.create({
        data: {
          userId: createdUser.id,
          action: "REGISTER_SUCCESS",
          details: JSON.stringify({ role: "APPLICANT" }),
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        }
      });

      return NextResponse.json(
        {
          message: "Applicant registration successful.",
          userId: createdUser.id,
          role: "APPLICANT",
          applicantId: createdUser.applicant?.applicantId,
        },
        { status: 201 },
      );
    }
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
