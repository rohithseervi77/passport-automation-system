import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

async function seedServices() {
  const client = await pool.connect();
  try {
    console.log("Seeding Passport Services into Supabase PostgreSQL...");

    const services = [
      {
        serviceCode: "FRESH",
        title: "Fresh Passport",
        category: "CITIZEN_CORE",
        badge: "Citizen Core Workflow",
        badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
        shortDescription: "For Indian citizens applying for an ordinary international passport for the very first time. Standard 10-year validity for adults or 5 years for minors.",
        eligibility: "All citizens of India by birth, descent, registration, or naturalization.",
        processingTime: "15-20 Working Days (Post Police Verification)",
        normalFee: 2500,
        tatkaalFee: 5000,
        validity: "10 Years (Adults) / 5 Years (Minors)",
        documentChecklist: JSON.stringify([
          "Proof of Date of Birth: Municipal Birth Certificate or Class 10/Matriculation mark sheet",
          "Proof of Present Residential Address: Aadhaar, Electricity Bill, Bank Passbook, or Voter ID",
          "Proof of Identity: PAN Card, Voter ID, or Driving License",
          "Non-ECR Proof (if applicable): Matriculation or higher degree certificate"
        ]),
        stepByStepGuide: JSON.stringify([
          "1. Complete online application form and verify applicant, family, and address particulars",
          "2. Pay statutory fee (₹2,500 for 36p or ₹3,500 for 60p; 10% concession for minors ≤ 8 & seniors ≥ 60)",
          "3. Book biometric appointment at nearest PSK or POPSK",
          "4. Attend PSK physical document scrutiny and biometric recording",
          "5. Complete field police verification at jurisdictional police station",
          "6. Passport booklet printing and Speed Post delivery with live tracking"
        ]),
        officialSource: "Passport Seva Directorate (CPV Division, MEA)",
        officialSourceUrl: "https://www.passportindia.gov.in/psp/ApplyPassport",
        displayOrder: 1,
      },
      {
        serviceCode: "REISSUE",
        title: "Passport Re-issue / Renewal",
        category: "CITIZEN_CORE",
        badge: "Existing Holders",
        badgeColor: "bg-indigo-100 text-indigo-900 border-indigo-200",
        shortDescription: "For citizens holding an existing passport that has expired, is expiring within 1 year, pages exhausted, lost, damaged, or requires change in personal particulars.",
        eligibility: "Existing Indian passport holders whose booklets require renewal, replacement, or modification.",
        processingTime: "7-15 Working Days",
        normalFee: 2500,
        tatkaalFee: 5000,
        validity: "10 Years (Adults)",
        documentChecklist: JSON.stringify([
          "Old original passport with self-attested copies of first two and last two pages",
          "Proof of present address (if address has changed since previous passport)",
          "Documentary evidence for change in personal particulars (e.g. Marriage Certificate for spouse name addition, Gazette for name change)",
          "Police First Information Report (FIR) and Annexure F in case of lost or stolen booklet"
        ]),
        stepByStepGuide: JSON.stringify([
          "1. Fill re-issue application form citing existing passport number, issue date, and expiry date",
          "2. Select re-issue reason (Validity Expired / Pages Exhausted / Lost / Damaged / Particulars Change)",
          "3. Pay statutory fee (₹2,500 for 36p / ₹3,500 for 60p)",
          "4. Attend PSK physical document scrutiny; previous passport cancelled and returned",
          "5. Police verification conducted if address changed or validity expired > 3 years",
          "6. Fresh booklet dispatched via Speed Post"
        ]),
        officialSource: "Passport Seva Directorate (CPV Division, MEA)",
        officialSourceUrl: "https://www.passportindia.gov.in/psp/ApplyPassport",
        displayOrder: 2,
      },
      {
        serviceCode: "TATKAAL",
        title: "Tatkaal Expedited Passport",
        category: "CITIZEN_CORE",
        badge: "Fast-Track Priority",
        badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
        shortDescription: "Expedited passport issuance for urgent overseas business, emergency medical requirements, or imminent international travel with guaranteed priority slots.",
        eligibility: "Indian citizens requiring fast-track passport without criminal history or adverse verification reports.",
        processingTime: "1-3 Working Days (Post PSK Granting)",
        normalFee: 2500,
        tatkaalFee: 5000,
        validity: "10 Years (Adults)",
        documentChecklist: JSON.stringify([
          "Three mandatory identity and address documents from the prescribed Tatkaal list (e.g. Aadhaar Card, PAN Card, Voter ID, Service ID)",
          "Tatkaal verification undertaking (Annexure F)",
          "Proof of urgent travel requirement (optional but recommended for expedited approval)"
        ]),
        stepByStepGuide: JSON.stringify([
          "1. Complete online application selecting Tatkaal scheme",
          "2. Pay total Tatkaal fee of ₹5,000 (36p) or ₹6,000 (60p)",
          "3. Secure prioritized Tatkaal quota slot released daily at 02:00 PM",
          "4. Expedited PSK processing at dedicated Counter A/B/C",
          "5. Passport booklet printed and dispatched within 1–3 working days on post-police verification basis"
        ]),
        officialSource: "Passport Seva Directorate (CPV Division, MEA)",
        officialSourceUrl: "https://www.passportindia.gov.in/psp/ApplyPassport",
        displayOrder: 3,
      },
      {
        serviceCode: "PCC",
        title: "Police Clearance Certificate (PCC)",
        category: "CITIZEN_CORE",
        badge: "Emigration & Visa Clearance",
        badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-200",
        shortDescription: "Statutory certificate issued to Indian passport holders who require clearance from local police authorities for foreign employment, immigration, residency, or long-term overseas visas.",
        eligibility: "Indian passport holders residing in India or abroad with clear police records.",
        processingTime: "7-14 Working Days",
        normalFee: 750,
        tatkaalFee: null,
        validity: "6 Months",
        documentChecklist: JSON.stringify([
          "Valid original Indian Passport with self-attested copies",
          "Proof of present residential address (minimum 1 year continuous residency)",
          "Foreign employer offer letter, employment visa contract, or embassy immigration notice"
        ]),
        stepByStepGuide: JSON.stringify([
          "1. Submit online PCC request referencing valid passport number",
          "2. Pay statutory fee of ₹750",
          "3. Complete physical biometric presence and document scrutiny at PSK/POPSK",
          "4. Jurisdictional police station conducts residential character and antecedents check",
          "5. Police Commissionerate uploads clearance report",
          "6. PCC certificate issued and dispatched to applicant"
        ]),
        officialSource: "Passport Seva Directorate (CPV Division, MEA)",
        officialSourceUrl: "https://www.passportindia.gov.in/psp/ApplyPassport",
        displayOrder: 4,
      },
      {
        serviceCode: "DIPLOMATIC_OFFICIAL",
        title: "Diplomatic and Official Passport",
        category: "SPECIALIZED",
        badge: "Government & State Deputation",
        badgeColor: "bg-purple-100 text-purple-900 border-purple-200",
        shortDescription: "Maroon-covered Diplomatic passports and White-covered Official passports issued exclusively to Government of India officials, diplomats, Members of Parliament, and authorized state delegates on official overseas missions.",
        eligibility: "Diplomats, Ministers, MPs, judicial officers, and central government officials on official foreign assignments.",
        processingTime: "Targeted: 5-7 Working Days",
        normalFee: 0,
        tatkaalFee: null,
        validity: "Duration of Official Deputation (Max 5 Years)",
        documentChecklist: JSON.stringify([
          "Official Cadre Clearance / Deputation Order from parent Ministry or Department",
          "Political Clearance certificate from CPV Division, Ministry of External Affairs",
          "Safe-custody certificate or surrender proof of existing Ordinary Passport",
          "Official Forwarding Letter on Department letterhead signed by Head of Office"
        ]),
        stepByStepGuide: JSON.stringify([
          "1. Application processed exclusively via Consular, Passport & Visa (CPV) Division at Patiala House, New Delhi",
          "2. Requires Departmental sanction and administrative clearance",
          "3. Verification conducted directly by MEA Diplomatic Section",
          "4. Diplomatic (Maroon) or Official (White) booklet issued for the duration of the official deputation"
        ]),
        officialSource: "CPV Division, Ministry of External Affairs",
        officialSourceUrl: "https://www.passportindia.gov.in/psp/DiplomaticPassport",
        displayOrder: 5,
      },
      {
        serviceCode: "SURRENDER_CERTIFICATE",
        title: "Passport Surrender Certificate & Renunciation",
        category: "SPECIALIZED",
        badge: "Citizenship Transition",
        badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
        shortDescription: "Under the Indian Citizenship Act, 1955, dual citizenship is not permitted. Persons of Indian Origin acquiring foreign citizenship must formally surrender their Indian passport and obtain a Surrender Certificate.",
        eligibility: "Indian citizens who have acquired nationality/citizenship of a foreign country.",
        processingTime: "10-15 Working Days",
        normalFee: 5000,
        tatkaalFee: null,
        validity: "Permanent Certificate",
        documentChecklist: JSON.stringify([
          "Last held original Indian Passport",
          "Naturalization Certificate or Foreign Passport copy",
          "Proof of address in foreign country or Indian present residence",
          "Sworn affidavit regarding non-misuse of Indian passport post-naturalization"
        ]),
        stepByStepGuide: JSON.stringify([
          "1. File online surrender application on portal",
          "2. Pay prescribed surrender fee",
          "3. Submit physical Indian passport to RPO or Indian Embassy / Consulate",
          "4. Passport cancelled with stamp 'Cancelled on acquisition of foreign nationality'",
          "5. Official Surrender Certificate issued (mandatory for OCI Card application)"
        ]),
        officialSource: "Ministry of External Affairs Citizenship Wing",
        officialSourceUrl: "https://www.passportindia.gov.in/psp/SurrenderCertificate",
        displayOrder: 6,
      },
      {
        serviceCode: "IDENTITY_CERTIFICATE",
        title: "Identity Certificate (IC) for Stateless Persons",
        category: "SPECIALIZED",
        badge: "Stateless & Tibetan Refugees",
        badgeColor: "bg-teal-100 text-teal-900 border-teal-200",
        shortDescription: "Yellow-covered travel document issued to stateless persons and Tibetan refugees residing in India who do not possess any national passport.",
        eligibility: "Tibetan refugees and recognized stateless persons holding valid Indian Registration Certificates (RC).",
        processingTime: "30-45 Working Days (Inter-agency Clearance)",
        normalFee: 1000,
        tatkaalFee: null,
        validity: "10 Years",
        documentChecklist: JSON.stringify([
          "Valid Registration Certificate (RC) issued by Foreigners Regional Registration Officer (FRRO)",
          "Central Tibetan Relief Committee (CTRC) recommendation letter",
          "Proof of residence in India (minimum 5 years continuous settlement)",
          "Personal particulars and family pedigree declaration"
        ]),
        stepByStepGuide: JSON.stringify([
          "1. Application forwarded through RPO Delhi or designated Regional Passport Office",
          "2. Requires Intelligence Bureau and state police security clearance",
          "3. Valid for 10 years for international travel with return visa endorsement"
        ]),
        officialSource: "Ministry of Home Affairs & MEA Refugee Protocol Desk",
        officialSourceUrl: "https://www.passportindia.gov.in/psp/IdentityCertificate",
        displayOrder: 7,
      },
      {
        serviceCode: "LOC_PERMIT",
        title: "Line of Control (LoC) Travel Permit",
        category: "STATUTORY_PERMITS",
        badge: "Cross-LoC Family Visits",
        badgeColor: "bg-cyan-100 text-cyan-900 border-cyan-200",
        shortDescription: "Special travel permit issued to permanent residents of Jammu and Kashmir for cross-Line of Control (LoC) travel to visit divided family members.",
        eligibility: "Permanent residents of Jammu and Kashmir visiting close relatives across the LoC.",
        processingTime: "30-60 Working Days (Dual-side Clearance)",
        normalFee: 0,
        tatkaalFee: null,
        validity: "2 Years (Triple Entry Permit)",
        documentChecklist: JSON.stringify([
          "State Subject / Domicile Certificate of Jammu & Kashmir",
          "Proof of relation with relatives residing across the LoC",
          "Local police character verification certificate",
          "Designated cross-LoC trade/travel application form"
        ]),
        stepByStepGuide: JSON.stringify([
          "1. Application verified by designated District Trade and Travel Authorities (TFO)",
          "2. Dual-side nodal security verification conducted",
          "3. LoC Travel Permit booklet issued with single/multiple entry validity"
        ]),
        officialSource: "Trade & Facilitation Officer (TFO) / J&K Home Department",
        officialSourceUrl: "https://www.passportindia.gov.in/psp/LocPermit",
        displayOrder: 8,
      },
      {
        serviceCode: "MISSIONS_ABROAD",
        title: "Passport Services through Indian Missions Abroad",
        category: "STATUTORY_PERMITS",
        badge: "Non-Resident Indians (NRIs)",
        badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
        shortDescription: "Full suite of passport renewal, Emergency Certificate (EC), and Police Clearance services provided to Non-Resident Indians through 190+ Indian Embassies, High Commissions, and Consulates globally.",
        eligibility: "Indian citizens temporarily or permanently residing in foreign countries.",
        processingTime: "10-25 Working Days (Host Mission Schedule)",
        normalFee: 2500,
        tatkaalFee: 5000,
        validity: "10 Years (Adults)",
        documentChecklist: JSON.stringify([
          "Existing Indian Passport copy and physical booklet",
          "Valid foreign residence permit, work visa, or Iqama copy",
          "Proof of current residential address in host country (utility bill/lease)",
          "Annexure E (Self-Declaration for NRIs)"
        ]),
        stepByStepGuide: JSON.stringify([
          "1. File online application via Global Passport Seva Portal (GPSP)",
          "2. Submit documents at outsourced visa/passport application centres (VFS/BLS)",
          "3. Verification coordinated between Embassy and parent RPO in India",
          "4. Printed booklet dispatched via secure courier in host country"
        ]),
        officialSource: "Global Passport Seva Portal (GPSP) / MEA Diplomatic Missions",
        officialSourceUrl: "https://embassy.passportindia.gov.in",
        displayOrder: 9,
      },
      {
        serviceCode: "GEP_VERIFICATION",
        title: "Global Entry Program (GEP) Background Verification",
        category: "STATUTORY_PERMITS",
        badge: "Expedited US Entry Facilitation",
        badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-200",
        shortDescription: "Background vetting and clearance conducted by Regional Passport Offices in coordination with police authorities for Indian citizens applying for the US Customs and Border Protection Global Entry Program.",
        eligibility: "Indian passport holders enrolled in the US Trusted Traveler Program (TTP).",
        processingTime: "15-30 Working Days",
        normalFee: 500,
        tatkaalFee: null,
        validity: "5 Years (Aligned with US TTP)",
        documentChecklist: JSON.stringify([
          "Valid Indian Passport with minimum 1-year remaining validity",
          "Global Entry PASS ID / Application ID from US CBP",
          "Proof of Indian residential address"
        ]),
        stepByStepGuide: JSON.stringify([
          "1. Applicant submits GEP application on US CBP TTP portal and receives PASS ID",
          "2. Logs into Passport Seva portal to initiate Indian background verification",
          "3. Attends PSK appointment for biometric scrutiny",
          "4. Inter-agency security vetting and police verification conducted",
          "5. Clearance result transmitted securely to US Customs and Border Protection"
        ]),
        officialSource: "US CBP & MEA Joint Facilitation Framework",
        officialSourceUrl: "https://www.passportindia.gov.in/psp/GepVerification",
        displayOrder: 10,
      },
      {
        serviceCode: "EPASSPORT_CHIP",
        title: "ePassport & Biometric Chip Architecture",
        category: "LEGAL_ANNEXURES",
        badge: "Next-Gen Travel Document",
        badgeColor: "bg-violet-100 text-violet-900 border-violet-200",
        shortDescription: "Comprehensive information architecture covering India's next-generation ePassports embedded with tamper-proof ICAO 9303 compliant contactless microchips encoding biometric signatures and facial recognition data.",
        eligibility: "Phased rollout across all Regional Passport Offices for fresh and re-issue applicants.",
        processingTime: "Standard Issuance Timelines Apply",
        normalFee: 2500,
        tatkaalFee: 5000,
        validity: "10 Years (Adults)",
        documentChecklist: JSON.stringify([
          "Same document checklist as standard Fresh or Re-issue application",
          "Digital biometric capture performed directly at PSK Counter A"
        ]),
        stepByStepGuide: JSON.stringify([
          "1. Microchip embedded inside booklet cover carrying Public Key Infrastructure (PKI)",
          "2. Stores facial biometric, digital signature of issuing officer, and encrypted biographical data",
          "3. Compatible with automated eGates at international airports worldwide",
          "4. Enhances national border security and eliminates fraudulent duplication"
        ]),
        officialSource: "India Security Press (ISP Nashik) & MEA CPV Division",
        officialSourceUrl: "https://www.passportindia.gov.in/psp/ePassport",
        displayOrder: 11,
      },
      {
        serviceCode: "PASSPORT_ACT_1967",
        title: "Passport Act, 1967 & Passport Rules, 1980",
        category: "LEGAL_ANNEXURES",
        badge: "Statutory & Legal Framework",
        badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
        shortDescription: "The primary legislative acts governing the issuance, refusal, impounding, revocation, and regulatory standards of passports and travel documents in the Republic of India.",
        eligibility: "Public legal reference for applicants, legal practitioners, and researchers.",
        processingTime: "Statutory Regulatory Standards",
        normalFee: 0,
        tatkaalFee: null,
        validity: "Continuous Statutory Operation",
        documentChecklist: JSON.stringify([
          "Section 6: Statutory grounds for refusal of passport (pending criminal proceedings, non-citizen status)",
          "Section 10: Impounding and revocation protocols by statutory Passport Authorities",
          "Section 12: Penal provisions for providing false information, suppression of facts, or fraudulent documents"
        ]),
        stepByStepGuide: JSON.stringify([
          "All decisions in this Passport Automation System simulate statutory compliance with Section 5, 6, and 10 of the Passports Act, 1967."
        ]),
        officialSource: "Ministry of Law & Justice / Ministry of External Affairs",
        officialSourceUrl: "https://www.passportindia.gov.in/psp/ActsAndRules",
        displayOrder: 12,
      },
      {
        serviceCode: "ANNEXURES_AFFIDAVITS",
        title: "Prescribed Annexures, Affidavits & Declarations",
        category: "LEGAL_ANNEXURES",
        badge: "Statutory Forms & Templates",
        badgeColor: "bg-rose-100 text-rose-900 border-rose-200",
        shortDescription: "Prescribed standard proformas under Passport Rules: Annexure A (No Objection), Annexure C (Single Parent Minor), Annexure D (Minor Consent), Annexure E (Standard Affidavit), Annexure F (Lost/Damaged), Annexure G (Identity Verification).",
        eligibility: "Applicants required to submit specialized affidavits based on individual circumstances.",
        processingTime: "Executed during Application Filing",
        normalFee: 0,
        tatkaalFee: null,
        validity: "Concurrent with Application Dossier",
        documentChecklist: JSON.stringify([
          "Annexure A: Identity Certificate from parent government employer",
          "Annexure C: Declaration by single parent or guardian for minor passport",
          "Annexure D: Joint declaration by both parents for minor passport",
          "Annexure E: Standard self-declaration of address, citizenship, and no criminal proceedings",
          "Annexure F: Affidavit regarding lost or damaged passport circumstances",
          "Annexure G: Prior Intimation Letter (PIL) to government employer"
        ]),
        stepByStepGuide: JSON.stringify([
          "1. Download the prescribed statutory annexure format from the portal",
          "2. Print on non-judicial stamp paper of prescribed minimum value or plain paper as specified",
          "3. Attestation by Judicial Magistrate, Notary Public, or Executive Magistrate where required",
          "4. Upload scanned PDF under document verification section and present original during PSK visit"
        ]),
        officialSource: "Passport Seva Legal Registry (CPV Division)",
        officialSourceUrl: "https://www.passportindia.gov.in/psp/Annexures",
        displayOrder: 13,
      },
    ];

    for (const s of services) {
      await client.query(
        `INSERT INTO "PassportService" (
          "serviceCode", title, "shortDescription", category, badge, "badgeColor",
          "processingTime", "normalFee", "tatkaalFee", validity, eligibility,
          "documentChecklist", "stepByStepGuide", "officialSource", "officialSourceUrl",
          "displayOrder", "isActive", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, true, NOW(), NOW())
        ON CONFLICT ("serviceCode") DO UPDATE SET
          title = EXCLUDED.title,
          "shortDescription" = EXCLUDED."shortDescription",
          category = EXCLUDED.category,
          badge = EXCLUDED.badge,
          "badgeColor" = EXCLUDED."badgeColor",
          "processingTime" = EXCLUDED."processingTime",
          "normalFee" = EXCLUDED."normalFee",
          "tatkaalFee" = EXCLUDED."tatkaalFee",
          validity = EXCLUDED.validity,
          eligibility = EXCLUDED.eligibility,
          "documentChecklist" = EXCLUDED."documentChecklist",
          "stepByStepGuide" = EXCLUDED."stepByStepGuide",
          "officialSource" = EXCLUDED."officialSource",
          "officialSourceUrl" = EXCLUDED."officialSourceUrl",
          "displayOrder" = EXCLUDED."displayOrder",
          "updatedAt" = NOW()`,
        [
          s.serviceCode, s.title, s.shortDescription, s.category, s.badge, s.badgeColor,
          s.processingTime, s.normalFee, s.tatkaalFee, s.validity, s.eligibility,
          s.documentChecklist, s.stepByStepGuide, s.officialSource, s.officialSourceUrl,
          s.displayOrder,
        ]
      );
    }

    console.log(`✓ Successfully seeded all ${services.length} Passport Services into PostgreSQL!`);
  } catch (err) {
    console.error("Seed error:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seedServices();
