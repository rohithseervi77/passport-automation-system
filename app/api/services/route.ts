import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category")?.trim() || "";
    const q = searchParams.get("q")?.trim() || "";

    const where: any = {
      isActive: true,
    };

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { shortDescription: { contains: q, mode: "insensitive" } },
        { eligibility: { contains: q, mode: "insensitive" } },
        { serviceCode: { contains: q, mode: "insensitive" } },
      ];
    }

    const services = await prisma.passportService.findMany({
      where,
      orderBy: { displayOrder: "asc" },
    });

    // Parse JSON checklists and steps
    const formatted = services.map((s) => {
      let checklist: string[] = [];
      let steps: string[] = [];
      try {
        checklist = typeof s.documentChecklist === "string" ? JSON.parse(s.documentChecklist) : s.documentChecklist;
      } catch {
        checklist = [s.documentChecklist];
      }
      try {
        steps = typeof s.stepByStepGuide === "string" ? JSON.parse(s.stepByStepGuide) : s.stepByStepGuide;
      } catch {
        steps = [s.stepByStepGuide];
      }

      return {
        id: s.serviceCode,
        title: s.title,
        category: s.category,
        badge: s.badge || s.category,
        badgeColor: s.badgeColor || "bg-blue-100 text-blue-900 border-blue-200",
        description: s.shortDescription,
        eligibility: s.eligibility,
        applicantCategory: s.category === "CITIZEN_CORE" ? "Ordinary Citizens, Minors, Seniors" : "Specialized & Eligible Applicants",
        documentGuidance: checklist,
        processOverview: steps,
        fee: s.normalFee !== null ? (s.tatkaalFee ? `₹${s.normalFee.toLocaleString("en-IN")} (Normal) / ₹${s.tatkaalFee.toLocaleString("en-IN")} (Tatkaal)` : `₹${s.normalFee.toLocaleString("en-IN")}`) : "Exempted / Statutory",
        annexures: "Official Prescribed Annexures",
        link: s.serviceCode === "FRESH" ? "/applicant/application?service=FRESH" : s.serviceCode === "REISSUE" ? "/applicant/application?service=REISSUE" : s.serviceCode === "TATKAAL" ? "/applicant/application?service=FRESH&quota=TATKAAL" : s.serviceCode === "PCC" ? "/applicant/application?service=FRESH&type=PCC" : undefined,
        isSimulatedWorkflow: ["FRESH", "REISSUE", "TATKAAL", "PCC"].includes(s.serviceCode),
        officialSourceUrl: s.officialSourceUrl || "https://www.passportindia.gov.in",
      };
    });

    const allCategories = [
      { key: "ALL", label: "All Passport Services" },
      { key: "CITIZEN_CORE", label: "Citizen Core Workflows" },
      { key: "SPECIALIZED", label: "Specialized Services" },
      { key: "STATUTORY_PERMITS", label: "Statutory & Missions" },
      { key: "LEGAL_ANNEXURES", label: "Legal Framework & Annexures" },
    ];

    return NextResponse.json({
      success: true,
      total: formatted.length,
      services: formatted,
      categories: allCategories,
      disclaimer: "Academic Simulation — Services database queried dynamically from PostgreSQL.",
    });
  } catch (error: any) {
    console.error("Services API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch passport services from database", details: error?.message },
      { status: 500 }
    );
  }
}
