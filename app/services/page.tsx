"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { 
  FileText, 
  Clock, 
  ShieldCheck, 
  Award, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  BookOpen,
  Globe2,
  FileBadge,
  FileCheck2,
  Cpu,
  Scale,
  X,
  Building,
  Info
} from "lucide-react";

interface ServiceItem {
  id: string;
  title: string;
  category: "CITIZEN_CORE" | "SPECIALIZED" | "STATUTORY_PERMITS" | "LEGAL_ANNEXURES";
  badge: string;
  badgeColor: string;
  description: string;
  eligibility: string;
  applicantCategory: string;
  documentGuidance: string[];
  processOverview: string[];
  fee: string;
  annexures: string;
  link?: string;
  isSimulatedWorkflow: boolean;
  officialSourceUrl: string;
}

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | "CITIZEN_CORE" | "SPECIALIZED" | "STATUTORY_PERMITS" | "LEGAL_ANNEXURES">("ALL");

  const services: ServiceItem[] = [
    // 1. Core Citizen Services (Implemented workflows)
    {
      id: "FRESH",
      title: "Fresh Passport",
      category: "CITIZEN_CORE",
      badge: "Citizen Core Workflow",
      badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
      description: "For Indian citizens applying for an ordinary international passport for the very first time. Standard 10-year validity for adults or 5 years for minors.",
      eligibility: "All citizens of India by birth, descent, registration, or naturalization.",
      applicantCategory: "Ordinary Citizens, Minors, Senior Citizens, Students",
      documentGuidance: [
        "Proof of Date of Birth: Municipal Birth Certificate or Class 10/Matriculation mark sheet",
        "Proof of Present Residential Address: Aadhaar, Electricity Bill, Bank Passbook, or Voter ID",
        "Proof of Identity: PAN Card, Voter ID, or Driving License",
        "Non-ECR Proof (if applicable): Matriculation or higher degree certificate",
      ],
      processOverview: [
        "1. Complete online application form and verify applicant, family, and address particulars",
        "2. Pay statutory fee (₹2,500 for 36p or ₹3,500 for 60p; 10% concession for minors ≤ 8 & seniors ≥ 60)",
        "3. Book biometric appointment at nearest PSK or POPSK",
        "4. Attend PSK physical document scrutiny and biometric recording",
        "5. Complete field police verification at jurisdictional police station",
        "6. Passport booklet printing and Speed Post delivery with live tracking",
      ],
      fee: "₹2,500 (36p) / ₹3,500 (60p) [10% discount for fresh minors ≤ 8 / seniors ≥ 60]",
      annexures: "Standard Application Undertaking (Self-Declaration)",
      link: "/applicant/application?service=FRESH",
      isSimulatedWorkflow: true,
      officialSourceUrl: "https://www.passportindia.gov.in/psp/ApplyPassport",
    },
    {
      id: "REISSUE",
      title: "Passport Re-issue / Renewal",
      category: "CITIZEN_CORE",
      badge: "Existing Holders",
      badgeColor: "bg-indigo-100 text-indigo-900 border-indigo-200",
      description: "For citizens holding an existing passport that has expired, is expiring within 1 year, pages exhausted, lost, damaged, or requires change in personal particulars (address, name, spouse name).",
      eligibility: "Existing Indian passport holders whose booklets require renewal, replacement, or modification.",
      applicantCategory: "Existing Passport Holders",
      documentGuidance: [
        "Old original passport with self-attested copies of first two and last two pages",
        "Proof of present address (if address has changed since previous passport)",
        "Documentary evidence for change in personal particulars (e.g. Marriage Certificate for spouse name addition, Gazette for name change)",
        "Police First Information Report (FIR) and Annexure F in case of lost or stolen booklet",
      ],
      processOverview: [
        "1. Fill re-issue application form citing existing passport number, issue date, and expiry date",
        "2. Select re-issue reason (Validity Expired / Pages Exhausted / Lost / Damaged / Particulars Change)",
        "3. Pay statutory fee (₹2,500 for 36p / ₹3,500 for 60p)",
        "4. Attend PSK physical document scrutiny; previous passport cancelled and returned",
        "5. Police verification conducted if address changed or validity expired > 3 years",
        "6. Fresh booklet dispatched via Speed Post",
      ],
      fee: "₹2,500 (36p) / ₹3,500 (60p)",
      annexures: "Annexure E / Annexure F (if lost/damaged)",
      link: "/applicant/application?service=REISSUE",
      isSimulatedWorkflow: true,
      officialSourceUrl: "https://www.passportindia.gov.in/psp/ApplyPassport",
    },
    {
      id: "TATKAAL",
      title: "Tatkaal Expedited Passport",
      category: "CITIZEN_CORE",
      badge: "Fast-Track Priority",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
      description: "Expedited passport issuance for urgent overseas business, emergency medical requirements, or imminent international travel with guaranteed priority slots.",
      eligibility: "Indian citizens requiring fast-track passport without criminal history or adverse verification reports.",
      applicantCategory: "Urgent Citizen Travel",
      documentGuidance: [
        "Three mandatory identity and address documents from the prescribed Tatkaal list (e.g. Aadhaar Card, PAN Card, Voter ID, Service ID)",
        "Tatkaal verification undertaking (Annexure F)",
        "Proof of urgent travel requirement (optional but recommended for expedited approval)",
      ],
      processOverview: [
        "1. Complete online application selecting Tatkaal scheme",
        "2. Pay total Tatkaal fee of ₹5,000 (36p) or ₹6,000 (60p)",
        "3. Secure prioritized Tatkaal quota slot released daily at 02:00 PM",
        "4. Expedited PSK processing at dedicated Counter A/B/C",
        "5. Passport booklet printed and dispatched within 1–3 working days on post-police verification basis",
      ],
      fee: "₹5,000 (36p) / ₹6,000 (60p) [Total inclusive amount]",
      annexures: "Annexure F (Tatkaal Undertaking)",
      link: "/applicant/application?service=FRESH&quota=TATKAAL",
      isSimulatedWorkflow: true,
      officialSourceUrl: "https://www.passportindia.gov.in/psp/ApplyPassport",
    },
    {
      id: "PCC",
      title: "Police Clearance Certificate (PCC)",
      category: "CITIZEN_CORE",
      badge: "Emigration & Visa Clearance",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-200",
      description: "Statutory certificate issued to Indian passport holders who require clearance from local police authorities for foreign employment, immigration, residency, or long-term overseas visas.",
      eligibility: "Indian passport holders residing in India or abroad with clear police records.",
      applicantCategory: "Overseas Job Seekers, Immigrants, Visa Applicants",
      documentGuidance: [
        "Valid original Indian Passport with self-attested copies",
        "Proof of present residential address (minimum 1 year continuous residency)",
        "Foreign employer offer letter, employment visa contract, or embassy immigration notice",
      ],
      processOverview: [
        "1. Submit online PCC request referencing valid passport number",
        "2. Pay statutory fee of ₹750",
        "3. Complete physical biometric presence and document scrutiny at PSK/POPSK",
        "4. Jurisdictional police station conducts residential character and antecedents check",
        "5. Police Commissionerate uploads clearance report",
        "6. PCC certificate issued and dispatched to applicant",
      ],
      fee: "₹750 (Tatkaal not applicable)",
      annexures: "Employment / Immigration Declaration",
      link: "/applicant/application?service=FRESH&type=PCC",
      isSimulatedWorkflow: true,
      officialSourceUrl: "https://www.passportindia.gov.in/psp/ApplyPassport",
    },

    // 2. Specialized Informational Services
    {
      id: "DIPLOMATIC_OFFICIAL",
      title: "Diplomatic and Official Passport",
      category: "SPECIALIZED",
      badge: "Government & State Deputation",
      badgeColor: "bg-purple-100 text-purple-900 border-purple-200",
      description: "Maroon-covered Diplomatic passports and White-covered Official passports issued exclusively to Government of India officials, diplomats, Members of Parliament, and authorized state delegates on official overseas missions.",
      eligibility: "Diplomats, Ministers, MPs, judicial officers, and central government officials on official foreign assignments.",
      applicantCategory: "State Officials & Diplomatic Corps",
      documentGuidance: [
        "Official Cadre Clearance / Deputation Order from parent Ministry or Department",
        "Political Clearance certificate from CPV Division, Ministry of External Affairs",
        "Safe-custody certificate or surrender proof of existing Ordinary Passport",
        "Official Forwarding Letter on Department letterhead signed by Head of Office",
      ],
      processOverview: [
        "1. Application processed exclusively via Consular, Passport & Visa (CPV) Division at Patiala House, New Delhi",
        "2. Requires Departmental sanction and administrative clearance",
        "3. Verification conducted directly by MEA Diplomatic Section",
        "4. Diplomatic (Maroon) or Official (White) booklet issued for the duration of the official deputation",
      ],
      fee: "Exempted / Government Funded for Official Duties",
      annexures: "Cadre Clearance Certificate & Political Clearance Dossier",
      isSimulatedWorkflow: false,
      officialSourceUrl: "https://www.passportindia.gov.in/psp/DiplomaticPassport",
    },
    {
      id: "SURRENDER_CERTIFICATE",
      title: "Passport Surrender Certificate & Renunciation",
      category: "SPECIALIZED",
      badge: "Citizenship Transition",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
      description: "Under the Indian Citizenship Act, 1955, dual citizenship is not permitted. Persons of Indian Origin acquiring foreign citizenship must formally surrender their Indian passport and obtain a Surrender Certificate.",
      eligibility: "Indian citizens who have acquired nationality/citizenship of a foreign country.",
      applicantCategory: "Former Indian Citizens (PIO / OCI Applicants)",
      documentGuidance: [
        "Last held original Indian Passport",
        "Naturalization Certificate or Foreign Passport copy",
        "Proof of address in foreign country or Indian present residence",
        "Sworn affidavit regarding non-misuse of Indian passport post-naturalization",
      ],
      processOverview: [
        "1. File online surrender application on portal",
        "2. Pay prescribed surrender fee (varies based on whether passport was used after acquiring foreign nationality)",
        "3. Submit physical Indian passport to RPO or Indian Embassy / Consulate",
        "4. Passport cancelled with stamp 'Cancelled on acquisition of foreign nationality'",
        "5. Official Surrender Certificate issued (mandatory for OCI Card application)",
      ],
      fee: "₹5,000 (Standard surrender within grace period) / Applicable penalty for delay",
      annexures: "Renunciation Declaration (Form XXII)",
      isSimulatedWorkflow: false,
      officialSourceUrl: "https://www.passportindia.gov.in/psp/SurrenderCertificate",
    },
    {
      id: "IDENTITY_CERTIFICATE",
      title: "Identity Certificate (IC) for Stateless Persons",
      category: "SPECIALIZED",
      badge: "Stateless & Tibetan Refugees",
      badgeColor: "bg-teal-100 text-teal-900 border-teal-200",
      description: "Yellow-covered travel document issued to stateless persons and Tibetan refugees residing in India who do not possess any national passport.",
      eligibility: "Tibetan refugees and recognized stateless persons holding valid Indian Registration Certificates (RC).",
      applicantCategory: "Tibetan Refugees & Stateless Residents",
      documentGuidance: [
        "Valid Registration Certificate (RC) issued by Foreigners Regional Registration Officer (FRRO)",
        "Central Tibetan Relief Committee (CTRC) recommendation letter",
        "Proof of residence in India (minimum 5 years continuous settlement)",
        "Personal particulars and family pedigree declaration",
      ],
      processOverview: [
        "1. Application forwarded through RPO Delhi or designated Regional Passport Office",
        "2. Requires Intelligence Bureau and state police security clearance",
        "3. Valid for 10 years for international travel with return visa endorsement",
      ],
      fee: "₹1,000 (Standard statutory processing)",
      annexures: "Annexure I (Identity Certificate Affidavit)",
      isSimulatedWorkflow: false,
      officialSourceUrl: "https://www.passportindia.gov.in/psp/IdentityCertificate",
    },
    {
      id: "LOC_PERMIT",
      title: "Line of Control (LoC) Travel Permit",
      category: "STATUTORY_PERMITS",
      badge: "Cross-LoC Family Visits",
      badgeColor: "bg-cyan-100 text-cyan-900 border-cyan-200",
      description: "Special travel permit issued to permanent residents of Jammu and Kashmir for cross-Line of Control (LoC) travel to visit divided family members.",
      eligibility: "Permanent residents of Jammu and Kashmir visiting close relatives across the LoC.",
      applicantCategory: "J&K Residents (Cross-LoC Family Reunions)",
      documentGuidance: [
        "State Subject / Domicile Certificate of Jammu & Kashmir",
        "Proof of relation with relatives residing across the LoC",
        "Local police character verification certificate",
        "Designated cross-LoC trade/travel application form",
      ],
      processOverview: [
        "1. Application verified by designated District Trade and Travel Authorities (TFO)",
        "2. Dual-side nodal security verification conducted",
        "3. LoC Travel Permit booklet issued with single/multiple entry validity",
      ],
      fee: "Statutory processing fee applicable as per J&K Home Department guidelines",
      annexures: "Family Relationship Undertaking",
      isSimulatedWorkflow: false,
      officialSourceUrl: "https://www.passportindia.gov.in/psp/LocPermit",
    },
    {
      id: "MISSIONS_ABROAD",
      title: "Passport Services through Indian Missions Abroad",
      category: "STATUTORY_PERMITS",
      badge: "Non-Resident Indians (NRIs)",
      badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
      description: "Full suite of passport renewal, Emergency Certificate (EC), and Police Clearance services provided to Non-Resident Indians through 190+ Indian Embassies, High Commissions, and Consulates globally.",
      eligibility: "Indian citizens temporarily or permanently residing in foreign countries.",
      applicantCategory: "Non-Resident Indians (NRIs), Students Abroad, Expatriates",
      documentGuidance: [
        "Existing Indian Passport copy and physical booklet",
        "Valid foreign residence permit, work visa, or Iqama copy",
        "Proof of current residential address in host country (utility bill/lease)",
        "Annexure E (Self-Declaration for NRIs)",
      ],
      processOverview: [
        "1. File online application via Global Passport Seva Portal (GPSP)",
        "2. Submit documents at outsourced visa/passport application centres (VFS/BLS)",
        "3. Verification coordinated between Embassy and parent RPO in India",
        "4. Printed booklet dispatched via secure courier in host country",
      ],
      fee: "Payable in local host currency (equivalent to standard MEA fee schedule)",
      annexures: "Annexure E / NRI Declaration",
      isSimulatedWorkflow: false,
      officialSourceUrl: "https://embassy.passportindia.gov.in",
    },
    {
      id: "GEP_VERIFICATION",
      title: "Global Entry Program (GEP) Background Verification",
      category: "STATUTORY_PERMITS",
      badge: "Expedited US Entry Facilitation",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-200",
      description: "Background vetting and clearance conducted by Regional Passport Offices in coordination with police authorities for Indian citizens applying for the US Customs and Border Protection Global Entry Program.",
      eligibility: "Indian passport holders enrolled in the US Trusted Traveler Program (TTP).",
      applicantCategory: "Frequent US Business Travelers",
      documentGuidance: [
        "Valid Indian Passport with minimum 1-year remaining validity",
        "Global Entry PASS ID / Application ID from US CBP",
        "Proof of Indian residential address",
      ],
      processOverview: [
        "1. Applicant submits GEP application on US CBP TTP portal and receives PASS ID",
        "2. Logs into Passport Seva portal to initiate Indian background verification",
        "3. Attends PSK appointment for biometric scrutiny",
        "4. Inter-agency security vetting and police verification conducted",
        "5. Clearance result transmitted securely to US Customs and Border Protection",
      ],
      fee: "₹500 (Indian inter-agency verification processing fee)",
      annexures: "GEP Authorization & Consent Undertaking",
      isSimulatedWorkflow: false,
      officialSourceUrl: "https://www.passportindia.gov.in/psp/GepVerification",
    },
    {
      id: "EPASSPORT_CHIP",
      title: "ePassport & Biometric Chip Architecture",
      category: "LEGAL_ANNEXURES",
      badge: "Next-Gen Travel Document",
      badgeColor: "bg-violet-100 text-violet-900 border-violet-200",
      description: "Comprehensive information architecture covering India's next-generation ePassports embedded with tamper-proof ICAO 9303 compliant contactless microchips encoding biometric signatures and facial recognition data.",
      eligibility: "Phased rollout across all Regional Passport Offices for fresh and re-issue applicants.",
      applicantCategory: "All Future Passport Applicants",
      documentGuidance: [
        "Same document checklist as standard Fresh or Re-issue application",
        "Digital biometric capture performed directly at PSK Counter A",
      ],
      processOverview: [
        "1. Microchip embedded inside booklet cover carrying Public Key Infrastructure (PKI)",
        "2. Stores facial biometric, digital signature of issuing officer, and encrypted biographical data",
        "3. Compatible with automated eGates at international airports worldwide",
        "4. Enhances national border security and eliminates fraudulent duplication",
      ],
      fee: "Included within standard July 2026 fee schedule (No separate chip fee)",
      annexures: "ICAO Doc 9303 Compliance Guidelines",
      isSimulatedWorkflow: false,
      officialSourceUrl: "https://www.passportindia.gov.in/psp/ePassport",
    },
    {
      id: "PASSPORT_ACT_1967",
      title: "Passport Act, 1967 & Passport Rules, 1980",
      category: "LEGAL_ANNEXURES",
      badge: "Statutory & Legal Framework",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
      description: "The primary legislative acts governing the issuance, refusal, impounding, revocation, and regulatory standards of passports and travel documents in the Republic of India.",
      eligibility: "Public legal reference for applicants, legal practitioners, and researchers.",
      applicantCategory: "General Public & Legal Reference",
      documentGuidance: [
        "Section 6: Statutory grounds for refusal of passport (pending criminal proceedings, non-citizen status)",
        "Section 10: Impounding and revocation protocols by statutory Passport Authorities",
        "Section 12: Penal provisions for providing false information, suppression of facts, or fraudulent documents",
      ],
      processOverview: [
        "All decisions in this Passport Automation System simulate statutory compliance with Section 5, 6, and 10 of the Passports Act, 1967.",
      ],
      fee: "Statutory Law Reference — Open Access",
      annexures: "Full Text: The Passports Act, 1967 (Act No. 15 of 1967)",
      isSimulatedWorkflow: false,
      officialSourceUrl: "https://www.passportindia.gov.in/psp/ActsAndRules",
    },
    {
      id: "ANNEXURES_AFFIDAVITS",
      title: "Prescribed Annexures, Affidavits & Declarations",
      category: "LEGAL_ANNEXURES",
      badge: "Official Legal Templates",
      badgeColor: "bg-rose-100 text-rose-900 border-rose-200",
      description: "Complete catalogue of statutory Annexures (Annexure A to I) required for specialized applicant cases, minors, single parents, lost passports, and government employees.",
      eligibility: "Applicants with conditional or specialized application prerequisites.",
      applicantCategory: "Government Employees, Minors with Single Parents, Tatkaal Applicants",
      documentGuidance: [
        "Annexure A: Identity Certificate for Central/State Government employees",
        "Annexure C: Declaration by single parent applying for minor passport",
        "Annexure D: Joint declaration by both parents for minor passport issuance",
        "Annexure E: Standard self-declaration on plain paper by citizen applicants",
        "Annexure F: Sworn affidavit for Tatkaal scheme and lost/damaged replacement",
        "Annexure G: Prior Intimation Letter (PI) by government / PSU employees",
      ],
      processOverview: [
        "1. Identify the relevant annexure applicable to your scenario",
        "2. Print standard non-judicial stamp paper or plain paper as prescribed",
        "3. Attest before Executive Magistrate, Notary Public, or self-attest as mandated",
        "4. Upload via Document Advisor and present original during PSK physical visit",
      ],
      fee: "Templates provided free of charge",
      annexures: "Official Annexure Templates A, C, D, E, F, G, H, I",
      isSimulatedWorkflow: false,
      officialSourceUrl: "https://www.passportindia.gov.in/psp/FormsAndAnnexures",
    },
  ];

  const filteredServices = services.filter((s) => {
    if (activeTab === "ALL") return true;
    return s.category === activeTab;
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16 flex flex-col justify-between">
      <div>
        <Navbar role="APPLICANT" userName="Citizen Portal" />

        {/* Hero Section */}
        <div className="bg-[#002B49] text-white py-10 px-4 sm:px-6 border-b border-blue-900">
          <div className="mx-auto max-w-6xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-800/80 text-blue-200 text-xs font-semibold mb-2 border border-blue-700/60">
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              Consular, Passport & Visa Services Directory
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Catalogue of Passport & Statutory Travel Services
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-blue-200/90 max-w-2xl leading-relaxed">
              Explore the comprehensive directory of citizen passport issuance workflows, specialized diplomatic
              and official documents, overseas consular services, statutory permits, and official legal annexures.
            </p>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-blue-800/60 text-xs">
              {[
                { id: "ALL", label: `All Services (${services.length})` },
                { id: "CITIZEN_CORE", label: "Citizen Core (Apply Online)" },
                { id: "SPECIALIZED", label: "Specialized & Diplomatic" },
                { id: "STATUTORY_PERMITS", label: "Permits & Overseas NRIs" },
                { id: "LEGAL_ANNEXURES", label: "Legal Rules & Annexures" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    activeTab === tab.id
                      ? "bg-white text-blue-950 shadow-xs"
                      : "bg-blue-900/60 text-blue-200 hover:bg-blue-800/80 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between relative overflow-hidden group"
              >
                <div>
                  {/* Category Badge & Workflow Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${service.badgeColor}`}>
                      {service.badge}
                    </span>
                    {service.isSimulatedWorkflow ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Interactive Workflow
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Informational Guide
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-950 transition">
                    {service.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                    {service.description}
                  </p>

                  {/* Quick particulars */}
                  <div className="space-y-1.5 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>Statutory Fee:</span>
                      <strong className="text-slate-800 font-mono">{service.fee.split(" ")[0]}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Applicant Scope:</span>
                      <span className="text-slate-700 truncate max-w-[180px]">{service.applicantCategory.split(",")[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedService(service)}
                    className="text-xs font-bold text-blue-950 hover:underline flex items-center gap-1"
                  >
                    View Service Guide →
                  </button>

                  {service.isSimulatedWorkflow && service.link && (
                    <Link
                      href={service.link}
                      className="px-3 py-1.5 rounded-lg bg-blue-950 text-white text-xs font-semibold hover:bg-blue-900 transition shadow-2xs"
                    >
                      Apply Online
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comprehensive Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl text-xs space-y-5">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border mb-1.5 inline-block ${selectedService.badgeColor}`}>
                  {selectedService.badge}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {selectedService.title}
                </h2>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Statutory Fee: <strong>{selectedService.fee}</strong>
                </span>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Purpose & Overview */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                Purpose & Service Description
              </h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                {selectedService.description}
              </p>
            </div>

            {/* Eligibility */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block text-[11px] uppercase">
                Eligibility & Target Category:
              </span>
              <p className="text-slate-700 leading-relaxed">
                {selectedService.eligibility}
              </p>
            </div>

            {/* Document Guidance */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-blue-950" />
                Prescribed Document Checklist:
              </h4>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside leading-relaxed pl-1">
                {selectedService.documentGuidance.map((doc, idx) => (
                  <li key={idx}>{doc}</li>
                ))}
              </ul>
            </div>

            {/* Process Steps */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-950" />
                Statutory Workflow Protocol:
              </h4>
              <div className="space-y-1.5 text-slate-700 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                {selectedService.processOverview.map((step, idx) => (
                  <p key={idx} className="text-[11px] leading-relaxed">
                    {step}
                  </p>
                ))}
              </div>
            </div>

            {/* Mandatory Annexures */}
            <div>
              <span className="font-bold text-slate-800 block text-[11px] uppercase mb-0.5">
                Applicable Forms & Annexures:
              </span>
              <p className="text-slate-600 font-mono text-[11px]">
                {selectedService.annexures}
              </p>
            </div>

            {/* Footer with Links */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href={selectedService.officialSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-950 font-bold hover:underline inline-flex items-center gap-1"
              >
                Official Passport Seva Portal Reference
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Close
                </button>
                {selectedService.isSimulatedWorkflow && selectedService.link && (
                  <Link
                    href={selectedService.link}
                    className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-blue-950 text-white font-bold text-xs hover:bg-blue-900 shadow-xs text-center"
                  >
                    Start Online Application →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-12">
        <p>Passport Automation System (PAS) • Academic Software Architecture & Workflow Simulation</p>
      </footer>
    </main>
  );
}
