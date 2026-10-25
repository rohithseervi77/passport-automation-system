import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAuthSignUp } from "@/lib/supabase";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

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
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already exists." },
        { status: 409 }
      );
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already exists." },
        { status: 409 }
      );
    }

    // 1. Register identity in Supabase Auth (Zero passwords stored in application DB)
    const authResult = await supabaseAuthSignUp({
      email,
      password,
      role,
      username,
    });

    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || "Supabase Auth registration failed." },
        { status: 400 }
      );
    }

    const authUserId = authResult.user.id;
    let createdUser;

    if (role === "OFFICER") {
      const offId = officerId || `OFF-${Date.now().toString().slice(-6)}`;
      const existingOfficer = await prisma.passportOfficer.findUnique({
        where: { officerId: offId },
      });
      if (existingOfficer) {
        return NextResponse.json(
          { error: "Officer ID already in use. Please choose another." },
          { status: 409 }
        );
      }

      createdUser = await prisma.user.create({
        data: {
          authUserId,
          username,
          email,
          role: "OFFICER",
          passportOfficer: {
            create: {
              officerId: offId,
              branchLocation:
                branchLocation || "RPO Headquarters - Regional Processing Office",
            },
          },
        },
        include: {
          passportOfficer: true,
        },
      });

      await logAuditEvent({
        userId: createdUser.id,
        action: "OFFICER_REGISTERED",
        entityId: offId,
        details: { role: "OFFICER", authUserId },
      });

      return NextResponse.json(
        {
          message: "Passport Officer registration successful.",
          userId: createdUser.id,
          authUserId,
          role: "OFFICER",
          officerId: createdUser.passportOfficer?.officerId,
        },
        { status: 201 }
      );
    } else if (role === "POLICE") {
      const badge = badgeNumber || `POL-${Date.now().toString().slice(-6)}`;
      const existingPolice = await prisma.police.findUnique({
        where: { badgeNumber: badge },
      });
      if (existingPolice) {
        return NextResponse.json(
          { error: "Badge number already in use. Please choose another." },
          { status: 409 }
        );
      }

      createdUser = await prisma.user.create({
        data: {
          authUserId,
          username,
          email,
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

      await logAuditEvent({
        userId: createdUser.id,
        action: "POLICE_REGISTERED",
        entityId: badge,
        details: { role: "POLICE", authUserId },
      });

      return NextResponse.json(
        {
          message: "Police Officer registration successful.",
          userId: createdUser.id,
          authUserId,
          role: "POLICE",
          badgeNumber: createdUser.police?.badgeNumber,
          stationCode: createdUser.police?.stationCode,
        },
        { status: 201 }
      );
    } else {
      // APPLICANT
      if (!name || !dob || !address) {
        return NextResponse.json(
          {
            error:
              "Full name, date of birth, and residential address are required for applicant registration.",
          },
          { status: 400 }
        );
      }

      const initialAppId = `PAS-${new Date().getFullYear()}-${Math.floor(
        100000 + Math.random() * 900000
      )}`;

      createdUser = await prisma.user.create({
        data: {
          authUserId,
          username,
          email,
          role: "APPLICANT",
          applicant: {
            create: {
              applicantId: `APP-${Date.now()}`,
              name,
              dob: new Date(dob),
              address,
              applications: {
                create: {
                  applicationId: initialAppId,
                  passportType: "REGULAR (36 Pages)",
                  status: "POLICE_VERIFICATION_PENDING",
                  submissionDate: new Date(),
                },
              },
            },
          },
        },
        include: {
          applicant: {
            include: {
              applications: true,
            },
          },
        },
      });

      await logAuditEvent({
        userId: createdUser.id,
        action: "APPLICANT_REGISTERED",
        entityId: createdUser.applicant?.applicantId,
        details: { role: "APPLICANT", authUserId },
      });

      return NextResponse.json(
        {
          message: "Applicant registration successful.",
          userId: createdUser.id,
          authUserId,
          role: "APPLICANT",
          applicantId: createdUser.applicant?.applicantId,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong during registration." },
      { status: 500 }
    );
  }
}
