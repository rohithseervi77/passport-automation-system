import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const { Pool } = pg;
const postgresUrl = process.env.DATABASE_URL;

if (!postgresUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({
  connectionString: postgresUrl,
  ssl: { rejectUnauthorized: false },
});

async function runSeed() {
  const client = await pool.connect();
  console.log("Connected to Supabase PostgreSQL for News, Fees, and Centres seed...");

  try {
    await client.query("BEGIN");

    // 1. Seed Notice Categories
    const categories = [
      { name: "Appointment Availability & Schedules", slug: "appointment-schedules", desc: "Daily appointment slot releases, Tatkaal quotas, and booking advisories", order: 1 },
      { name: "PSK, POPSK & RPO Announcements", slug: "psk-rpo-announcements", desc: "Operational updates from Regional Passport Offices and citizen seva kendras", order: 2 },
      { name: "Centre Relocation & Service Disruption", slug: "relocation-disruptions", desc: "Temporary office closures, venue relocations, and weather advisories", order: 3 },
      { name: "Passport Fee & Payment Updates", slug: "fee-payment-updates", desc: "Gazette notifications, statutory fee revisions, and payment mode circulars", order: 4 },
      { name: "Document Requirements & Eligibility", slug: "document-advisories", desc: "Proof of birth, address documentation, non-ECR criteria, and annexures", order: 5 },
      { name: "Police Clearance Certificates (PCC)", slug: "pcc-notices", desc: "Guidelines for overseas employment, immigration, and jurisdictional checks", order: 6 },
      { name: "Mobile Passport Camps & Special Drives", slug: "special-drives", desc: "Weekend melas, mobile passport vans, and campus citizen outreach drives", order: 7 },
      { name: "Public Notices, Advisories & Circulars", slug: "public-circulars", desc: "Statutory circulars, fake portal warnings, and citizen fraud alerts", order: 8 },
      { name: "Service Process Updates & General", slug: "general-announcements", desc: "General information architecture, DigiLocker integration, and service FAQs", order: 9 },
    ];

    for (const c of categories) {
      await client.query(
        `INSERT INTO "NoticeCategory" (name, slug, description, "displayOrder", "isActive", "createdAt")
         VALUES ($1, $2, $3, $4, true, NOW())
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, "displayOrder" = EXCLUDED."displayOrder"`,
        [c.name, c.slug, c.desc, c.order]
      );
    }
    console.log(`✓ Seeded ${categories.length} Notice Categories`);

    // 2. Seed News & Public Notices
    const notices = [
      {
        noticeId: "NOT-2026-001",
        slug: "revised-passport-fee-schedule-july-2026",
        title: "Gazette Notification: Revised Passport and Travel Document Fee Schedule Effective from 1 July 2026",
        summary: "Statutory revision of passport issuance fees published under Gazette Notification G.S.R. 516(E) dated 25 June 2026. Adult standard passport fixed at ₹2,500 with Tatkaal inclusive total at ₹5,000. 10% concession applies for fresh eligible minors (<= 8 yrs) and senior citizens (>= 60 yrs).",
        content: `### Ministry of External Affairs — Official Gazette Notification G.S.R. 516(E)

**Effective Date:** 1 July 2026  
**Reference:** G.S.R. 516(E) dated 25 June 2026  
**Issuing Authority:** Ministry of External Affairs, Government of India (CPV Division)

In exercise of the powers conferred by Section 24 of the Passports Act, 1967 (15 of 1967), the Central Government hereby amends the Passport Rules, 1980, introducing the updated statutory fee structure across all Regional Passport Offices (RPOs), Passport Seva Kendras (PSKs), and Post Office Passport Seva Kendras (POPSKs) nationwide.

---

### Key Fee Highlights:
1. **Fresh / Re-issue Normal Adult Passport (36 Pages, 10-Year Validity):**  
   Statutory Fee: **₹2,500**  
   Tatkaal Processing (Inclusive of normal fee): **₹5,000**

2. **Frequent Traveler Passport (60 Pages Jumbo Booklet):**  
   Statutory Fee: **₹3,500**  
   Tatkaal Processing (Inclusive of normal fee): **₹6,000**

3. **Minor Passport (Under 18 Years, 36 Pages, 5-Year Validity / till age 18):**  
   Statutory Fee: **₹1,750**  
   Tatkaal Processing: **₹4,250**

4. **10% Special Concession on Fresh Applications:**  
   A statutory **10% rebate on basic application fee** is applicable to:
   - Fresh applications for children up to 8 years of age.
   - Fresh applications for senior citizens aged 60 years and above.
   *(Note: The 10% discount does not apply to passport re-issue or Tatkaal surcharges).*

5. **Lost / Damaged Passport Replacement:**  
   Adult (36 Pages): **₹5,000** (Tatkaal: **₹7,500**)  
   Adult (60 Pages): **₹6,000** (Tatkaal: **₹8,500**)  
   Minor (36 Pages): **₹4,250** (Tatkaal: **₹6,750**)

6. **Police Clearance Certificate (PCC):**  
   Statutory Fee: **₹750** (Tatkaal not applicable).

---
*Notice Type: Academic Simulation Document reflecting verified Gazette notifications for educational training purposes.*`,
        category: "Passport Fee & Payment Updates",
        priority: "CRITICAL",
        status: "PUBLISHED",
        isPinned: true,
        region: "All India",
        affectedCentre: "All Regional Passport Offices, PSKs & POPSKs",
        sourceLabel: "Official Gazette Notification G.S.R. 516(E)",
        sourceUrl: "https://www.passportindia.gov.in/psp/Notification",
        attachmentName: "Passport_Fee_Schedule_Gazette_2026.pdf",
      },
      {
        noticeId: "NOT-2026-002",
        slug: "special-saturday-passport-mela-chennai-psk",
        title: "Special Saturday Passport Mela across RPO Chennai Kendras to Expedite Backlog Clearance",
        summary: "Regional Passport Office Chennai announces Special Saturday Passport Drives across PSK Saligramam, PSK Tambaram, and PSK Aminjikarai. Over 1,500 additional citizen appointment slots released.",
        content: `### Regional Passport Office — Chennai Press Release

RPO Chennai has scheduled a dedicated **Saturday Passport Mela** on upcoming weekends to facilitate working professionals, students, and senior citizens seeking appointment slots.

- **Participating Kendras:**
  1. PSK Saligramam (Bharmaramba Complex)
  2. PSK Tambaram (GST Road)
  3. PSK Aminjikarai (Rayala Towers)
- **Slots Released:** 1,500 Normal Quota appointments per Saturday.
- **Eligible Categories:** Fresh Passport, Passport Re-issue, Police Clearance Certificate (PCC).
- **Booking Procedure:** Appointments must be booked online through the passport portal. No walk-in tokens will be issued without prior appointment slips.`,
        category: "Mobile Passport Camps & Special Drives",
        priority: "IMPORTANT",
        status: "PUBLISHED",
        isPinned: true,
        region: "RPO Chennai",
        affectedCentre: "PSK Saligramam, PSK Tambaram, PSK Aminjikarai",
        sourceLabel: "RPO Chennai Official Press Bulletin",
        sourceUrl: "https://www.passportindia.gov.in/psp/News",
        attachmentName: "Chennai_Passport_Mela_Schedule.pdf",
      },
      {
        noticeId: "NOT-2026-003",
        slug: "daily-appointment-slot-release-timing-advisory",
        title: "Advisory: Standardized Daily Appointment Slot Release at 12:00 PM and Tatkaal at 02:00 PM",
        summary: "Citizen advisory regarding the scheduled release of appointment quotas. Normal slots refresh daily at 12:00 Noon, while Tatkaal emergency quota slots open at 02:00 PM on working days.",
        content: `### Citizen Information Advisory — Online Appointment Scheduling

To ensure equitable distribution and transparency in appointment booking, all applicants are advised of the standardized schedule for appointment quota release:

1. **Normal Application Slots:** Released daily at **12:00 PM (Noon)** for the subsequent 5 working days.
2. **Tatkaal Quota Slots:** Released daily at **02:00 PM** for the next working day.
3. **Rescheduling Limit:** Applicants are allowed to reschedule booked appointments a maximum of **3 times within 1 year** of original application submission.
4. **Cancellation Window:** Appointments can be rescheduled or cancelled up to **24 hours prior** to the booked time slot.`,
        category: "Appointment Availability & Schedules",
        priority: "IMPORTANT",
        status: "PUBLISHED",
        isPinned: false,
        region: "All India",
        affectedCentre: "All PSKs and POPSKs",
        sourceLabel: "Passport Seva Directorate Operational Circular",
        sourceUrl: "https://www.passportindia.gov.in/psp/News",
      },
      {
        noticeId: "NOT-2026-004",
        slug: "relocation-popsk-vellore-head-post-office",
        title: "Relocation of Post Office Passport Seva Kendra (POPSK) Vellore to Head Post Office Campus",
        summary: "POPSK Vellore has successfully transitioned operations to the modernized Head Post Office building, Officers Line, Vellore with biometric kiosks and enhanced citizen waiting lounges.",
        content: `### Notice of Centre Relocation — POPSK Vellore

Citizens and applicants in Vellore, Ranipet, and Tirupattur districts are hereby informed that the Post Office Passport Seva Kendra (POPSK) Vellore has relocated:

- **New Address:** Ground Floor, Head Post Office Campus, Officers Line, Vellore, Tamil Nadu — 632001.
- **Facilities:** 4 Biometric capture counters, digital token display, senior citizen lounge, and dedicated document verification counters.
- **Operating Hours:** 09:00 AM to 05:00 PM (Monday through Friday).
- **Existing Bookings:** All applicants with appointments scheduled for POPSK Vellore will be processed seamlessly at the new premises.`,
        category: "Centre Relocation & Service Disruption",
        priority: "NORMAL",
        status: "PUBLISHED",
        isPinned: false,
        region: "Tamil Nadu",
        affectedCentre: "POPSK Vellore",
        sourceLabel: "Department of Posts & RPO Joint Circular",
        sourceUrl: "https://www.passportindia.gov.in/psp/News",
      },
      {
        noticeId: "NOT-2026-005",
        slug: "mandatory-pcc-verification-and-document-guidelines",
        title: "Strict Guidelines for Police Clearance Certificate (PCC) Applications for Overseas Employment",
        summary: "Mandatory physical document verification and address scrutiny protocols announced for citizens applying for Police Clearance Certificates for employment, long-term visas, and residency.",
        content: `### Operational Circular: Police Clearance Certificate (PCC) Scrutiny

All applicants applying for Police Clearance Certificates (PCC) are advised to observe the following statutory prerequisites:

1. **Physical Presence Mandatory:** Biometric recording and original document scrutiny require physical attendance at the PSK/POPSK.
2. **Mandatory Documentation:** Valid original Passport, Proof of current residential address (minimum 1 year continuous residency), and foreign employer letter or visa sponsorship contract.
3. **Police Enquiry Workflow:** Upon PSK scrutiny, the clearance dossier is electronically dispatched to the jurisdictional police station for field address verification.`,
        category: "Police Clearance Certificates (PCC)",
        priority: "NORMAL",
        status: "PUBLISHED",
        isPinned: false,
        region: "All India",
        affectedCentre: "All Regional Passport Offices",
        sourceLabel: "CPV Division / Bureau of Police Research Circular",
        sourceUrl: "https://www.passportindia.gov.in/psp/News",
      },
      {
        noticeId: "NOT-2026-006",
        slug: "caution-fake-portals-and-unauthorized-intermediaries",
        title: "Public Warning: Caution Against Fraudulent Portals and Unauthorized Middlemen Charging Exorbitant Fees",
        summary: "Citizens are strictly advised that the official Passport Seva portal is passportindia.gov.in. Avoid third-party unauthorized websites charging extra fees for appointments or document advisory.",
        content: `### Public Advisory: Anti-Fraud and Cyber Security Notice

It has come to the attention of the Ministry that several fake websites and dubious mobile applications with domain names similar to the official Passport Seva portal are attempting to mislead citizens and charge unauthorized consultation fees.

1. **Official Government Website:** The ONLY official portal for passport services in India is **https://www.passportindia.gov.in**.
2. **Academic Simulation System:** This application (PAS) is an **academic educational software simulation** and does not process real government passports or charge real money.
3. **Never Share OTP or Passwords:** No passport authority will ever request your OTP, banking details, or portal passwords over phone or SMS.`,
        category: "Public Notices, Advisories & Circulars",
        priority: "CRITICAL",
        status: "PUBLISHED",
        isPinned: false,
        region: "All India",
        affectedCentre: "Public Domain",
        sourceLabel: "Cyber Crime Cell & Ministry of External Affairs",
        sourceUrl: "https://www.passportindia.gov.in/psp/News",
      },
      {
        noticeId: "NOT-2026-007",
        slug: "student-advisory-expedited-study-abroad-passport-appointments",
        title: "Student Advisory: Special Window for Higher Education Passport Processing for Fall Admissions",
        summary: "Dedicated facilitation desk and appointment slots made available for bona fide students holding university admission offers, fellowship awards, or foreign entrance exam registrations.",
        content: `### Student Passport Facilitation Circular

To support students travelling abroad for upcoming university admissions, Regional Passport Offices have introduced dedicated student facilitation counters:

- **Eligibility:** Students with formal admission letters, I-20 forms, or university enrollment verification.
- **Documents Required:** Bonafide student certificate from current institution, foreign university offer letter, standard identity, address, and date of birth proofs.
- **Processing Time:** Student applications under Tatkaal or priority verification are targeted for dispatch within 3–5 working days post police clearance.`,
        category: "Document Requirements & Eligibility",
        priority: "NORMAL",
        status: "PUBLISHED",
        isPinned: false,
        region: "All India",
        affectedCentre: "All Regional Passport Offices",
        sourceLabel: "Education Outreach Wing / MEA",
        sourceUrl: "https://www.passportindia.gov.in/psp/News",
      },
      {
        noticeId: "NOT-2026-008",
        slug: "mobile-passport-van-service-coastal-districts-tamil-nadu",
        title: "Deployment of Mobile Passport Vans (MPV) in Coastal Districts of Tamil Nadu",
        summary: "State-of-the-art Mobile Passport Vans equipped with satellite biometric units dispatched to Ramanathapuram, Kanyakumari, and Nagapattinam for on-spot citizen application processing.",
        content: `### Citizen Outreach Drive: Mobile Passport Vans (MPV)

RPO Madurai and RPO Chennai announce the field deployment of Mobile Passport Vans (MPVs) to deliver doorstep passport services to coastal fisherfolk, maritime workers, and rural residents:

- **Locations Covered:** Ramanathapuram, Nagapattinam, Kanyakumari, and Tuticorin coastal taluks.
- **Services Offered:** Biometric enrollment, original document scanning, citizen fee payment assistance, and application submission.
- **Schedule:** Mondays and Thursdays at designated Panchayat Union offices.`,
        category: "Mobile Passport Camps & Special Drives",
        priority: "NORMAL",
        status: "PUBLISHED",
        isPinned: false,
        region: "Tamil Nadu",
        affectedCentre: "Mobile Van Units MPV-01, MPV-02",
        sourceLabel: "RPO Madurai & Chennai Outreach Initiative",
        sourceUrl: "https://www.passportindia.gov.in/psp/News",
      },
    ];

    for (const n of notices) {
      await client.query(
        `INSERT INTO "Notice" (
          "noticeId", slug, title, summary, content, category, priority, status,
          "isPinned", "isSimulated", "publishedAt", "effectiveDate", region,
          "affectedCentre", "sourceLabel", "sourceUrl", "attachmentName", author, "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), $11, $12, $13, $14, $15, 'Admin Editorial Desk', NOW(), NOW())
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          content = EXCLUDED.content,
          category = EXCLUDED.category,
          priority = EXCLUDED.priority,
          status = EXCLUDED.status,
          "isPinned" = EXCLUDED."isPinned",
          region = EXCLUDED.region,
          "affectedCentre" = EXCLUDED."affectedCentre",
          "sourceLabel" = EXCLUDED."sourceLabel",
          "sourceUrl" = EXCLUDED."sourceUrl",
          "attachmentName" = EXCLUDED."attachmentName",
          "updatedAt" = NOW()`,
        [
          n.noticeId, n.slug, n.title, n.summary, n.content, n.category, n.priority, n.status,
          n.isPinned, true, n.region || null, n.affectedCentre || null, n.sourceLabel, n.sourceUrl, n.attachmentName || null,
        ]
      );
    }
    console.log(`✓ Seeded ${notices.length} News & Public Notices`);

    // 3. Seed Fee Schedules (Official 1 July 2026 GSR 516(E))
    const feeSchedules = [
      // Adult 36 pages
      { serviceType: "FRESH", category: "NORMAL", booklet: "36_PAGES", minAge: 18, maxAge: 59, normalFee: 2500, tatkaalFee: 5000, discount: 0, isLost: false, desc: "Adult Fresh Passport (36 Pages) — 10 Years Validity" },
      { serviceType: "FRESH", category: "NORMAL", booklet: "60_PAGES", minAge: 18, maxAge: 59, normalFee: 3500, tatkaalFee: 6000, discount: 0, isLost: false, desc: "Adult Fresh Jumbo Booklet (60 Pages) — 10 Years Validity" },
      
      // Minor up to 8 years (10% discount on fresh)
      { serviceType: "FRESH", category: "NORMAL", booklet: "36_PAGES", minAge: 0, maxAge: 8, normalFee: 1750, tatkaalFee: 4250, discount: 10, isLost: false, desc: "Minor Fresh Passport (Age up to 8 Years) — 10% Statutory Discount Eligible" },
      
      // Minor 9 to 17 years
      { serviceType: "FRESH", category: "NORMAL", booklet: "36_PAGES", minAge: 9, maxAge: 17, normalFee: 1750, tatkaalFee: 4250, discount: 0, isLost: false, desc: "Minor Fresh Passport (Age 9 to 17 Years) — 5 Years Validity / till age 18" },

      // Senior citizen 60+ (10% discount on fresh)
      { serviceType: "FRESH", category: "NORMAL", booklet: "36_PAGES", minAge: 60, maxAge: 120, normalFee: 2500, tatkaalFee: 5000, discount: 10, isLost: false, desc: "Senior Citizen Fresh Passport (36 Pages) — 10% Statutory Discount Eligible" },
      { serviceType: "FRESH", category: "NORMAL", booklet: "60_PAGES", minAge: 60, maxAge: 120, normalFee: 3500, tatkaalFee: 6000, discount: 10, isLost: false, desc: "Senior Citizen Fresh Jumbo Passport (60 Pages) — 10% Statutory Discount Eligible" },

      // Reissue (No discount)
      { serviceType: "REISSUE", category: "NORMAL", booklet: "36_PAGES", minAge: 18, maxAge: 120, normalFee: 2500, tatkaalFee: 5000, discount: 0, isLost: false, desc: "Adult Passport Re-issue / Renewal (36 Pages)" },
      { serviceType: "REISSUE", category: "NORMAL", booklet: "60_PAGES", minAge: 18, maxAge: 120, normalFee: 3500, tatkaalFee: 6000, discount: 0, isLost: false, desc: "Adult Passport Re-issue / Renewal (60 Pages)" },
      { serviceType: "REISSUE", category: "NORMAL", booklet: "36_PAGES", minAge: 0, maxAge: 17, normalFee: 1750, tatkaalFee: 4250, discount: 0, isLost: false, desc: "Minor Passport Re-issue (36 Pages)" },

      // Lost or Damaged Passports
      { serviceType: "LOST_DAMAGED", category: "NORMAL", booklet: "36_PAGES", minAge: 18, maxAge: 120, normalFee: 5000, tatkaalFee: 7500, discount: 0, isLost: true, desc: "Lost / Damaged Adult Passport Replacement (36 Pages)" },
      { serviceType: "LOST_DAMAGED", category: "NORMAL", booklet: "60_PAGES", minAge: 18, maxAge: 120, normalFee: 6000, tatkaalFee: 8500, discount: 0, isLost: true, desc: "Lost / Damaged Adult Passport Replacement (60 Pages)" },
      { serviceType: "LOST_DAMAGED", category: "NORMAL", booklet: "36_PAGES", minAge: 0, maxAge: 17, normalFee: 4250, tatkaalFee: 6750, discount: 0, isLost: true, desc: "Lost / Damaged Minor Passport Replacement (36 Pages)" },

      // Police Clearance Certificate
      { serviceType: "PCC", category: "NORMAL", booklet: "NA", minAge: 0, maxAge: 120, normalFee: 750, tatkaalFee: null, discount: 0, isLost: false, desc: "Police Clearance Certificate (PCC) & Miscellaneous Verification" },
    ];

    await client.query('DELETE FROM "FeeSchedule"');
    for (const f of feeSchedules) {
      await client.query(
        `INSERT INTO "FeeSchedule" (
          "serviceType", "applicationCategory", "bookletType", "minAge", "maxAge",
          "isLostOrDamaged", "normalFee", "tatkaalFee", "discountPercentage",
          "effectiveFrom", "gazetteReference", "sourceUrl", description, "lastVerifiedAt", "isActive", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, '2026-07-01T00:00:00Z', 'G.S.R. 516(E) dated 25 June 2026', 'https://www.passportindia.gov.in/psp/Notification', $10, NOW(), true, NOW(), NOW())`,
        [
          f.serviceType, f.category, f.booklet, f.minAge, f.maxAge,
          f.isLost, f.normalFee, f.tatkaalFee, f.discount, f.desc,
        ]
      );
    }
    console.log(`✓ Seeded ${feeSchedules.length} Official Fee Schedules (Gazette G.S.R. 516(E))`);

    // 4. Seed Representative Passport Centres
    const centres = [
      { code: "PSK-CHN-01", name: "Passport Seva Kendra - Saligramam", type: "PSK", address: "Bharmaramba Complex, No. 138, Arcot Road, Saligramam", locality: "Saligramam", city: "Chennai", district: "Chennai", state: "Tamil Nadu", pin: "600093", rpo: "RPO Chennai", capacity: 350 },
      { code: "PSK-CHN-02", name: "Passport Seva Kendra - Aminjikarai", type: "PSK", address: "Rayala Towers, 781-785, Anna Salai, Aminjikarai", locality: "Anna Salai", city: "Chennai", district: "Chennai", state: "Tamil Nadu", pin: "600002", rpo: "RPO Chennai", capacity: 400 },
      { code: "PSK-CHN-03", name: "Passport Seva Kendra - Tambaram", type: "PSK", address: "MEPZ Special Economic Zone Road, Kadaperi, Tambaram", locality: "Tambaram", city: "Chennai", district: "Chengalpattu", state: "Tamil Nadu", pin: "600045", rpo: "RPO Chennai", capacity: 300 },
      { code: "POPSK-VEL-01", name: "Post Office Passport Seva Kendra - Vellore", type: "POPSK", address: "Head Post Office Campus, Officers Line", locality: "Officers Line", city: "Vellore", district: "Vellore", state: "Tamil Nadu", pin: "632001", rpo: "RPO Chennai", capacity: 100 },
      { code: "POPSK-KAN-01", name: "Post Office Passport Seva Kendra - Kanchipuram", type: "POPSK", address: "Head Post Office, Nellukkara Street", locality: "Big Kanchipuram", city: "Kanchipuram", district: "Kanchipuram", state: "Tamil Nadu", pin: "631501", rpo: "RPO Chennai", capacity: 80 },
      { code: "PSK-DEL-01", name: "Passport Seva Kendra - Herald House, ITO", type: "PSK", address: "Herald House, 5-A, Bahadur Shah Zafar Marg, ITO", locality: "ITO", city: "New Delhi", district: "Central Delhi", state: "Delhi", pin: "110002", rpo: "RPO Delhi", capacity: 500 },
      { code: "PSK-DEL-02", name: "Passport Seva Kendra - Bhikaji Cama Place", type: "PSK", address: "Hudco Vishala Building, 14, Bhikaji Cama Place", locality: "R.K. Puram", city: "New Delhi", district: "South Delhi", state: "Delhi", pin: "110066", rpo: "RPO Delhi", capacity: 450 },
      { code: "PSK-MUM-01", name: "Passport Seva Kendra - Lower Parel", type: "PSK", address: "Trade Centre, Kamala Mills Compound, Senapati Bapat Marg", locality: "Lower Parel", city: "Mumbai", district: "Mumbai City", state: "Maharashtra", pin: "400013", rpo: "RPO Mumbai", capacity: 450 },
      { code: "PSK-BLR-01", name: "Passport Seva Kendra - Lalbagh Road", type: "PSK", address: "No. 45, Prestige Libra, Lalbagh Road", locality: "Shanti Nagar", city: "Bengaluru", district: "Bengaluru Urban", state: "Karnataka", pin: "560027", rpo: "RPO Bengaluru", capacity: 500 },
      { code: "PSK-HYD-01", name: "Passport Seva Kendra - Begumpet", type: "PSK", address: "Gowra Trinity, Chiran Fort Club Lane, Begumpet", locality: "Begumpet", city: "Hyderabad", district: "Hyderabad", state: "Telangana", pin: "500016", rpo: "RPO Hyderabad", capacity: 450 },
    ];

    for (const c of centres) {
      await client.query(
        `INSERT INTO "PassportCenter" (
          "centerCode", name, type, address, locality, city, district, state, "pinCode",
          "associatedRpo", "operatingHours", status, "dailyCapacity", "slotCapacity", "isDemo", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, '09:00 AM - 05:00 PM (Monday to Friday)', 'ACTIVE', $11, 20, true, NOW(), NOW())
        ON CONFLICT ("centerCode") DO UPDATE SET
          name = EXCLUDED.name,
          address = EXCLUDED.address,
          locality = EXCLUDED.locality,
          city = EXCLUDED.city,
          district = EXCLUDED.district,
          state = EXCLUDED.state,
          "pinCode" = EXCLUDED."pinCode",
          "associatedRpo" = EXCLUDED."associatedRpo",
          "dailyCapacity" = EXCLUDED."dailyCapacity",
          "updatedAt" = NOW()`,
        [
          c.code, c.name, c.type, c.address, c.locality, c.city, c.district, c.state, c.pin,
          c.rpo, c.capacity,
        ]
      );
    }
    console.log(`✓ Seeded ${centres.length} Passport Centres & PSKs/POPSKs`);

    await client.query("COMMIT");
    console.log("✅ All News, Fees, and Centres successfully seeded into PostgreSQL!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed error:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
