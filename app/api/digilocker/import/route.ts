import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

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

    if (!applicant || !applicant.applications[0]) {
      return NextResponse.json(
        { error: "No active passport application found." },
        { status: 400 }
      );
    }

    const application = applicant.applications[0];
    const body = await req.json();
    const { selectedCertificates, aadhaarNumber, citizenName } = body;

    const importedDocs = [];

    // 1. Process UIDAI e-Aadhaar
    if (selectedCertificates?.aadhaar) {
      const aadhaarDocs = [
        {
          type: "Proof of Identity (Aadhaar Card) - DigiLocker Verified",
          name: "UIDAI_eAadhaar_DigiLocker_Verified.pdf",
          size: 421888,
        },
        {
          type: "Proof of Address (Aadhaar Card) - DigiLocker Verified",
          name: "UIDAI_eAadhaar_Address_DigiLocker.pdf",
          size: 421888,
        },
        {
          type: "Proof of Date of Birth (Aadhaar Card) - DigiLocker Verified",
          name: "UIDAI_eAadhaar_DOB_DigiLocker.pdf",
          size: 421888,
        },
      ];

      for (const d of aadhaarDocs) {
        const existing = await prisma.document.findFirst({
          where: { applicationId: application.id, documentType: d.type },
        });

        const docId = existing
          ? existing.docId
          : `DOC-DIGI-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

        const saved = await prisma.document.upsert({
          where: { docId },
          update: {
            fileStatus: "VERIFIED",
            fileName: d.name,
            fileSize: d.size,
            mimeType: "application/pdf",
            fileUrl: `/digilocker/${d.name}`,
            storagePath: `digilocker/${application.applicationId}/${d.name}`,
            verificationStatus: "VERIFIED",
            verifiedBy: "DIGILOCKER_UIDAI_GATEWAY",
            verifiedAt: new Date(),
          },
          create: {
            docId,
            documentType: d.type,
            fileStatus: "VERIFIED",
            fileName: d.name,
            fileSize: d.size,
            mimeType: "application/pdf",
            fileUrl: `/digilocker/${d.name}`,
            storagePath: `digilocker/${application.applicationId}/${d.name}`,
            verificationStatus: "VERIFIED",
            verifiedBy: "DIGILOCKER_UIDAI_GATEWAY",
            verifiedAt: new Date(),
            applicationId: application.id,
          },
        });

        importedDocs.push(saved);
      }
    }

    // 2. Process CBSE Class X Certificate
    if (selectedCertificates?.classX) {
      const classXType = "Proof of Date of Birth (10th Standard School Marksheet) - DigiLocker Verified";
      const existing = await prisma.document.findFirst({
        where: { applicationId: application.id, documentType: classXType },
      });

      const docId = existing
        ? existing.docId
        : `DOC-CBSE-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      const saved = await prisma.document.upsert({
        where: { docId },
        update: {
          fileStatus: "VERIFIED",
          fileName: "CBSE_ClassX_Passing_DigiLocker.pdf",
          fileSize: 312000,
          mimeType: "application/pdf",
          fileUrl: "/digilocker/CBSE_ClassX_Passing_DigiLocker.pdf",
          storagePath: `digilocker/${application.applicationId}/CBSE_ClassX_Passing_DigiLocker.pdf`,
          verificationStatus: "VERIFIED",
          verifiedBy: "DIGILOCKER_CBSE_GATEWAY",
          verifiedAt: new Date(),
        },
        create: {
          docId,
          documentType: classXType,
          fileStatus: "VERIFIED",
          fileName: "CBSE_ClassX_Passing_DigiLocker.pdf",
          fileSize: 312000,
          mimeType: "application/pdf",
          fileUrl: "/digilocker/CBSE_ClassX_Passing_DigiLocker.pdf",
          storagePath: `digilocker/${application.applicationId}/CBSE_ClassX_Passing_DigiLocker.pdf`,
          verificationStatus: "VERIFIED",
          verifiedBy: "DIGILOCKER_CBSE_GATEWAY",
          verifiedAt: new Date(),
          applicationId: application.id,
        },
      });

      importedDocs.push(saved);
    }

    // 3. Process PAN Verification Record
    if (selectedCertificates?.pan) {
      const panType = "Proof of Identity (PAN Card) - DigiLocker Verified";
      const existing = await prisma.document.findFirst({
        where: { applicationId: application.id, documentType: panType },
      });

      const docId = existing
        ? existing.docId
        : `DOC-PAN-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      const saved = await prisma.document.upsert({
        where: { docId },
        update: {
          fileStatus: "VERIFIED",
          fileName: "IncomeTax_PAN_Verification_DigiLocker.pdf",
          fileSize: 245000,
          mimeType: "application/pdf",
          fileUrl: "/digilocker/IncomeTax_PAN_Verification_DigiLocker.pdf",
          storagePath: `digilocker/${application.applicationId}/IncomeTax_PAN_Verification_DigiLocker.pdf`,
          verificationStatus: "VERIFIED",
          verifiedBy: "DIGILOCKER_ITD_GATEWAY",
          verifiedAt: new Date(),
        },
        create: {
          docId,
          documentType: panType,
          fileStatus: "VERIFIED",
          fileName: "IncomeTax_PAN_Verification_DigiLocker.pdf",
          fileSize: 245000,
          mimeType: "application/pdf",
          fileUrl: "/digilocker/IncomeTax_PAN_Verification_DigiLocker.pdf",
          storagePath: `digilocker/${application.applicationId}/IncomeTax_PAN_Verification_DigiLocker.pdf`,
          verificationStatus: "VERIFIED",
          verifiedBy: "DIGILOCKER_ITD_GATEWAY",
          verifiedAt: new Date(),
          applicationId: application.id,
        },
      });

      importedDocs.push(saved);
    }

    // Audit Log Entry
    await logAuditEvent({
      userId,
      action: "DIGILOCKER_DOCUMENTS_VERIFIED",
      entityId: application.applicationId,
      details: {
        applicationId: application.applicationId,
        citizenName,
        documentsImported: importedDocs.length,
        isCounterAWaived: true,
      },
    });

    return NextResponse.json({
      message: "DigiLocker certificates successfully imported and verified.",
      documents: importedDocs,
      counterAWaived: true,
    });
  } catch (error) {
    console.error("DigiLocker import error:", error);
    return NextResponse.json({ error: "Failed to import DigiLocker certificates." }, { status: 500 });
  }
}
