import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transitionApplicationStatus } from "@/lib/applicationService";

// Helper to generate realistic ARN: PAS + YYYYMMDD + 4 digits
function generateARN(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const randomSuffix = String(Math.floor(1000 + Math.random() * 9000));
  return `PAS${year}${month}${day}${randomSuffix}`;
}

// GET current applicant's active application
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applicant = await prisma.applicant.findUnique({
      where: { userId },
      include: {
        applications: {
          orderBy: { id: "desc" },
          take: 1,
          include: {
            documents: true,
            appointment: true,
            policeReports: {
              orderBy: { id: "desc" },
              include: { police: true },
            },
            passport: true,
            officer: true,
            statusHistory: {
              orderBy: { changedAt: "desc" },
            },
          },
        },
      },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Applicant profile not found" }, { status: 404 });
    }

    const application = applicant.applications[0] || null;

    return NextResponse.json({
      applicant,
      application,
    });
  } catch (error) {
    console.error("Fetch application error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST create, save draft, or submit full application wizard
export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applicant = await prisma.applicant.findUnique({
      where: { userId },
      include: {
        applications: {
          orderBy: { id: "desc" },
          take: 1,
        },
      },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Applicant profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { action = "SAVE_DRAFT" } = body;
    const isSubmit = action === "SUBMIT";

    // Extract fields
    const {
      serviceType = "FRESH",
      applicationCategory = "NORMAL",
      bookletType = "36_PAGES",
      rpoLocation = "RPO Chennai",
      priority: customPriority,
      draftStep = 1,
      reissueReason,
      isMinor: clientIsMinor,
      parentConsent = false,
      pskLocation,
      // Personal
      givenName,
      surname,
      gender,
      dob,
      placeOfBirth,
      maritalStatus,
      citizenship = "By Birth",
      pan,
      voterId,
      employmentType,
      educationalQualification,
      visibleIdentificationMark,
      aadhaarNumber,
      // Family
      fatherName,
      motherName,
      spouseName,
      legalGuardianName,
      // Address
      presentAddressLine1,
      presentAddressLine2,
      presentCity,
      presentDistrict,
      presentState,
      presentPinCode,
      policeStation,
      isPermanentSame = true,
      permanentAddress,
      // Emergency
      emergencyName,
      emergencyRelationship,
      emergencyMobile,
      emergencyEmail,
      emergencyAddress,
      // Previous
      hasPreviousPassport = false,
      prevPassportNumber,
      prevIssueDate,
      prevExpiryDate,
      prevPlaceOfIssue,
      // Declarations
      hasCriminalRecord = false,
      criminalRecordDetails,
      hasPendingProceedings = false,
      pendingProceedingsDetails,
      hasLostPassport = false,
      lostPassportDetails,
      confirmedDeclaration = false,
      // Clarification response if applicant was responding
      clarificationResponse,
    } = body;

    // Auto-detect Minor applicant status (<18 years)
    let isMinor = Boolean(clientIsMinor);
    let ageInYears: number | null = null;
    if (dob) {
      const birthDate = new Date(dob);
      const now = new Date();
      if (!isNaN(birthDate.getTime())) {
        ageInYears = (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        if (ageInYears < 18) {
          isMinor = true;
        }
      }
    }

    // Auto-derive application SLA priority
    let priority = customPriority || "NORMAL";
    if (applicationCategory === "TATKAAL") {
      priority = "URGENT";
    } else if (hasLostPassport || reissueReason === "LOST" || reissueReason === "DAMAGED") {
      priority = "HIGH";
    }

    // Server-side validation for submission
    if (isSubmit) {
      if (!givenName || givenName.trim().length < 2) {
        return NextResponse.json({ error: "Valid Given Name (minimum 2 characters) is required." }, { status: 400 });
      }
      if (!dob) {
        return NextResponse.json({ error: "Date of Birth is required." }, { status: 400 });
      }
      const birthDate = new Date(dob);
      const now = new Date();
      if (isNaN(birthDate.getTime()) || birthDate >= now) {
        return NextResponse.json({ error: "Date of Birth cannot be in the future." }, { status: 400 });
      }
      if (ageInYears && ageInYears > 120) {
        return NextResponse.json({ error: "Please provide a realistic Date of Birth." }, { status: 400 });
      }
      if (isMinor && !parentConsent) {
        return NextResponse.json({ error: "Parent/Legal Guardian consent (Annexure D) is required for minor applicants." }, { status: 400 });
      }
      if (isMinor && !fatherName && !motherName && !legalGuardianName) {
        return NextResponse.json({ error: "At least one parent or legal guardian name is mandatory for minors." }, { status: 400 });
      }
      if (!presentAddressLine1 || !presentCity || !presentPinCode) {
        return NextResponse.json({ error: "Complete present address with City and PIN Code is required." }, { status: 400 });
      }
      const pinRegex = /^[1-9][0-9]{5}$/;
      if (!pinRegex.test(presentPinCode.trim())) {
        return NextResponse.json({ error: "PIN Code must be a valid 6-digit Indian postal code." }, { status: 400 });
      }
      if (!emergencyMobile || emergencyMobile.replace(/\D/g, "").length < 10) {
        return NextResponse.json({ error: "A valid 10-digit emergency contact phone number is required." }, { status: 400 });
      }
      if (!confirmedDeclaration) {
        return NextResponse.json({ error: "You must check the confirmation declaration before submitting." }, { status: 400 });
      }
      if (serviceType === "REISSUE" && !prevPassportNumber) {
        return NextResponse.json({ error: "Previous Passport Number is required for Re-issue applications." }, { status: 400 });
      }
    }

    // Full address string for applicant profile sync
    const compositeAddress = `${presentAddressLine1 || ""}, ${presentAddressLine2 || ""}, ${presentCity || ""}, ${presentDistrict || ""}, ${presentState || ""} - ${presentPinCode || ""}`.replace(/^,\s*|,\s*$/g, "");

    if (compositeAddress.trim()) {
      await prisma.applicant.update({
        where: { id: applicant.id },
        data: {
          name: `${givenName || ""} ${surname || ""}`.trim() || applicant.name,
          address: compositeAddress,
          dob: dob ? new Date(dob) : applicant.dob,
        },
      });
    }

    const existingApp = applicant.applications[0];
    const passportTypeLabel = `${serviceType === "FRESH" ? "Fresh Passport" : "Re-issue Passport"} - ${applicationCategory} (${bookletType === "60_PAGES" ? "60 Pages" : "36 Pages"})`;

    const appData = {
      passportType: passportTypeLabel,
      serviceType,
      applicationCategory,
      bookletType,
      rpoLocation,
      // Personal
      givenName,
      surname,
      gender,
      dob: dob ? new Date(dob) : null,
      placeOfBirth,
      maritalStatus,
      citizenship,
      pan,
      voterId,
      employmentType,
      educationalQualification,
      visibleIdentificationMark,
      aadhaarNumber,
      // Family
      fatherName,
      motherName,
      spouseName,
      legalGuardianName,
      // Address
      presentAddressLine1,
      presentAddressLine2,
      presentCity,
      presentDistrict,
      presentState,
      presentPinCode,
      policeStation,
      isPermanentSame: Boolean(isPermanentSame),
      permanentAddress: isPermanentSame ? compositeAddress : permanentAddress,
      // Emergency
      emergencyName,
      emergencyRelationship,
      emergencyMobile,
      emergencyEmail,
      emergencyAddress,
      // Previous
      hasPreviousPassport: Boolean(hasPreviousPassport || serviceType === "REISSUE"),
      prevPassportNumber,
      prevIssueDate: prevIssueDate ? new Date(prevIssueDate) : null,
      prevExpiryDate: prevExpiryDate ? new Date(prevExpiryDate) : null,
      prevPlaceOfIssue,
      // Other
      hasCriminalRecord: Boolean(hasCriminalRecord),
      criminalRecordDetails,
      hasPendingProceedings: Boolean(hasPendingProceedings),
      pendingProceedingsDetails,
      hasLostPassport: Boolean(hasLostPassport),
      lostPassportDetails,
      confirmedDeclaration: Boolean(confirmedDeclaration),
      // Upgraded Workflow Details
      reissueReason: serviceType === "REISSUE" ? (reissueReason || "EXPIRING_SOON") : null,
      isMinor: Boolean(isMinor),
      parentConsent: Boolean(parentConsent),
      priority,
      draftStep: typeof draftStep === "number" ? draftStep : 1,
      pskLocation: pskLocation || null,
    };

    let application;

    if (existingApp) {
      const isRespondingToClarification = existingApp.status === "CLARIFICATION_REQUIRED" && clarificationResponse;
      const nextStatus = isSubmit 
        ? (existingApp.status === "DRAFT" ? "SUBMITTED" : existingApp.status)
        : (isRespondingToClarification ? "OFFICER_REVIEW" : existingApp.status);

      application = await prisma.application.update({
        where: { id: existingApp.id },
        data: {
          ...appData,
          status: nextStatus,
          submissionDate: isSubmit ? (existingApp.submissionDate || new Date()) : existingApp.submissionDate,
          ...(clarificationResponse
            ? {
                clarificationResponse,
                clarificationRespondedAt: new Date(),
              }
            : {}),
        },
        include: {
          documents: true,
          appointment: true,
          policeReports: true,
          passport: true,
          statusHistory: true,
        },
      });

      // Status history entry on submit or clarification response
      if (isSubmit && existingApp.status === "DRAFT") {
        await prisma.applicationStatusHistory.create({
          data: {
            applicationId: existingApp.id,
            fromStatus: "DRAFT",
            toStatus: "SUBMITTED",
            remarks: "Applicant submitted completed application wizard.",
            performedBy: applicant.name,
            role: "APPLICANT",
            changedById: userId,
          },
        });
      } else if (isRespondingToClarification) {
        await prisma.applicationStatusHistory.create({
          data: {
            applicationId: existingApp.id,
            fromStatus: "CLARIFICATION_REQUIRED",
            toStatus: "OFFICER_REVIEW",
            remarks: `Applicant responded: ${clarificationResponse}`,
            performedBy: applicant.name,
            role: "APPLICANT",
            changedById: userId,
          },
        });
      }
    } else {
      // Create new Application with clean ARN format
      const newARN = generateARN();
      application = await prisma.application.create({
        data: {
          ...appData,
          applicationId: newARN,
          status: isSubmit ? "SUBMITTED" : "DRAFT",
          submissionDate: isSubmit ? new Date() : null,
          applicantId: applicant.id,
        },
        include: {
          documents: true,
          appointment: true,
          policeReports: true,
          passport: true,
          statusHistory: true,
        },
      });

      // Record status history
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          fromStatus: "NONE",
          toStatus: isSubmit ? "SUBMITTED" : "DRAFT",
          remarks: isSubmit 
            ? "New application registered and submitted."
            : "Draft application created.",
          performedBy: applicant.name,
          role: "APPLICANT",
          changedById: userId,
        },
      });

      if (isSubmit) {
        await prisma.notification.create({
          data: {
            userId,
            title: "Application Submitted Successfully",
            message: `Your passport application with ARN ${newARN} has been submitted. Next step: Please proceed to fee payment.`,
            type: "SUCCESS",
          },
        });
      }
    }

    return NextResponse.json({
      message: isSubmit
        ? "Application submitted successfully! Your Application Reference Number (ARN) has been generated."
        : "Draft saved successfully. You can resume at any time.",
      application,
      arn: application.applicationId,
    });
  } catch (error) {
    console.error("Save application error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
