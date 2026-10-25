/**
 * Passport Automation System (PAS)
 * Standalone Supabase PostgreSQL Seeding Script
 *
 * Populates Supabase with realistic Passport Seva simulation demo accounts,
 * active workflows, appointments, payments, documents, and notifications.
 */

import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const { Pool } = pg;
const postgresUrl = process.env.DATABASE_URL;

if (!postgresUrl || postgresUrl.startsWith("file:")) {
  console.error("❌ ERROR: DATABASE_URL must be a valid PostgreSQL connection string.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: postgresUrl,
  ssl: postgresUrl.includes("supabase.co") ? { rejectUnauthorized: false } : undefined,
});

async function seed() {
  console.log("==================================================");
  console.log("PAS — Seeding Supabase PostgreSQL Demo Data");
  console.log("==================================================");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Seed Demo Applicant
    const applicantHash = await bcrypt.hash("Applicant@123", 10);
    const applicantRes = await client.query(
      `
      INSERT INTO "User" (username, password, email, role, "isActive")
      VALUES ($1, $2, $3, 'APPLICANT', true)
      ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password
      RETURNING id;
      `,
      ["applicant_demo", applicantHash, "applicant.demo@pas.gov.in"]
    );
    const applicantUserId = applicantRes.rows[0].id;

    const applicantProfileRes = await client.query(
      `
      INSERT INTO "Applicant" ("applicantId", name, dob, address, "userId")
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("userId") DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
      `,
      [
        "APP-20261025",
        "Aarav Sharma",
        new Date("1998-05-15T00:00:00.000Z"),
        "42 Park Avenue, Saligramam, Chennai, Tamil Nadu 600093",
        applicantUserId,
      ]
    );
    const applicantRecordId = applicantProfileRes.rows[0].id;
    console.log("✓ Seeded Applicant: applicant_demo / Applicant@123");

    // 2. Seed Passport Officer
    const officerHash = await bcrypt.hash("Officer@123", 10);
    const officerRes = await client.query(
      `
      INSERT INTO "User" (username, password, email, role, "isActive")
      VALUES ($1, $2, $3, 'OFFICER', true)
      ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password
      RETURNING id;
      `,
      ["officer_demo", officerHash, "officer.central@pas.gov.in"]
    );
    const officerUserId = officerRes.rows[0].id;

    const officerProfileRes = await client.query(
      `
      INSERT INTO "PassportOfficer" ("officerId", "branchLocation", "userId")
      VALUES ($1, $2, $3)
      ON CONFLICT ("userId") DO UPDATE SET "branchLocation" = EXCLUDED."branchLocation"
      RETURNING id;
      `,
      ["OFF-CHENNAI-01", "Regional Passport Office, Rayala Towers, Anna Salai, Chennai", officerUserId]
    );
    const officerRecordId = officerProfileRes.rows[0].id;
    console.log("✓ Seeded Officer: officer_demo / Officer@123");

    // 3. Seed Police Authority
    const policeHash = await bcrypt.hash("Police@123", 10);
    const policeRes = await client.query(
      `
      INSERT INTO "User" (username, password, email, role, "isActive")
      VALUES ($1, $2, $3, 'POLICE', true)
      ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password
      RETURNING id;
      `,
      ["police_demo", policeHash, "police.central@pas.gov.in"]
    );
    const policeUserId = policeRes.rows[0].id;

    const policeProfileRes = await client.query(
      `
      INSERT INTO "Police" ("stationCode", "badgeNumber", "userId")
      VALUES ($1, $2, $3)
      ON CONFLICT ("userId") DO UPDATE SET "stationCode" = EXCLUDED."stationCode"
      RETURNING id;
      `,
      ["PS-CHENNAI-CENTRAL", "TN-POL-88219", policeUserId]
    );
    const policeRecordId = policeProfileRes.rows[0].id;
    console.log("✓ Seeded Police: police_demo / Police@123");

    // 4. Seed Applications in Various Workflow States
    const demoApps = [
      {
        arn: "APP-20261025-4921",
        status: "POLICE_VERIFICATION_PENDING",
        serviceType: "FRESH",
        category: "NORMAL",
        givenName: "Aarav",
        surname: "Sharma",
      },
      {
        arn: "APP-20261024-8832",
        status: "APPOINTMENT_BOOKED",
        serviceType: "REISSUE",
        category: "TATKAAL",
        givenName: "Aarav",
        surname: "Sharma",
      },
      {
        arn: "APP-20261020-1194",
        status: "DISPATCHED",
        serviceType: "FRESH",
        category: "NORMAL",
        givenName: "Priya",
        surname: "Nair",
      },
      {
        arn: "APP-20261018-7712",
        status: "CLARIFICATION_REQUIRED",
        serviceType: "FRESH",
        category: "NORMAL",
        givenName: "Vikram",
        surname: "Rao",
      },
    ];

    for (const app of demoApps) {
      const appInsert = await client.query(
        `
        INSERT INTO "Application" (
          "applicationId", "passportType", "serviceType", "applicationCategory",
          "bookletType", "rpoLocation", "status", "submissionDate",
          "givenName", "surname", "gender", "dob", "placeOfBirth", "maritalStatus",
          "citizenship", "pan", "voterId", "employmentType", "educationalQualification",
          "visibleIdentificationMark", "aadhaarNumber", "fatherName", "motherName",
          "presentAddressLine1", "presentCity", "presentDistrict", "presentState",
          "presentPinCode", "policeStation", "isPermanentSame", "permanentAddress",
          "emergencyName", "emergencyRelationship", "emergencyMobile", "emergencyEmail",
          "hasPreviousPassport", "confirmedDeclaration", "applicantId", "officerId"
        )
        VALUES (
          $1, 'REGULAR (36 Pages)', $2, $3,
          '36_PAGES', 'RPO Chennai', $4, NOW(),
          $5, $6, 'MALE', '1998-05-15T00:00:00.000Z', 'Chennai', 'SINGLE',
          'By Birth', 'ABCDE1234F', 'TN/01/123/456789', 'Private Service', 'Graduate',
          'Mole on right forearm', '2345-6789-0123', 'Rajesh Sharma', 'Sunita Sharma',
          '42 Park Avenue, Saligramam', 'Chennai', 'Chennai', 'Tamil Nadu',
          '600093', 'Saligramam PS', true, '42 Park Avenue, Saligramam, Chennai 600093',
          'Rajesh Sharma', 'Father', '9876543210', 'rajesh.sharma@example.com',
          false, true, $7, $8
        )
        ON CONFLICT ("applicationId") DO UPDATE SET "status" = EXCLUDED."status"
        RETURNING id;
        `,
        [
          app.arn,
          app.serviceType,
          app.category,
          app.status,
          app.givenName,
          app.surname,
          applicantRecordId,
          officerRecordId,
        ]
      );
      const appId = appInsert.rows[0].id;

      // Seed Documents for application
      const docs = [
        { type: "Proof of Date of Birth (Aadhaar / Birth Certificate)", name: "aadhaar_card.pdf", path: `${app.arn}/proof_of_date_of_birth/aadhaar_card.pdf` },
        { type: "Proof of Present Address (Utility Bill / Rent Agreement)", name: "electricity_bill.pdf", path: `${app.arn}/proof_of_present_address/electricity_bill.pdf` },
        { type: "Proof of Identity / Voter ID", name: "voter_card.pdf", path: `${app.arn}/proof_of_identity/voter_card.pdf` },
      ];

      for (let i = 0; i < docs.length; i++) {
        await client.query(
          `
          INSERT INTO "Document" (
            "docId", "documentType", "fileStatus", "fileName", "fileSize",
            "storagePath", "mimeType", "verificationStatus", "applicationId"
          )
          VALUES ($1, $2, 'UPLOADED', $3, 358400, $4, 'application/pdf', 'VERIFIED', $5)
          ON CONFLICT ("docId") DO NOTHING;
          `,
          [`DOC-${app.arn}-${i + 1}`, docs[i].type, docs[i].name, docs[i].path, appId]
        );
      }

      // Seed Appointment
      await client.query(
        `
        INSERT INTO "Appointment" (
          "appointmentId", quota, location, date, "timeSlot", status, "applicationId"
        )
        VALUES (
          $1, $2, 'Chennai Saligramam PSK', NOW() + INTERVAL '3 days', '10:30 AM - 11:00 AM', 'BOOKED', $3
        )
        ON CONFLICT ("appointmentId") DO NOTHING;
        `,
        [`APT-${app.arn}`, app.category, appId]
      );

      // Seed Payment
      await client.query(
        `
        INSERT INTO "Payment" (
          "transactionId", amount, "baseFee", "additionalFee", status, "paymentMethod", "paymentReference", "applicationId"
        )
        VALUES (
          $1, 1500.0, 1500.0, 0.0, 'SUCCESS', 'UPI', $2, $3
        )
        ON CONFLICT ("transactionId") DO NOTHING;
        `,
        [`TXN-${app.arn}`, `UPI-${Date.now().toString().slice(-8)}`, appId]
      );

      // Seed Police Report if applicable
      if (app.status === "POLICE_VERIFICATION_COMPLETED" || app.status === "DISPATCHED") {
        await client.query(
          `
          INSERT INTO "PoliceReport" (
            "reportId", "clearanceStatus", remarks, "stationCode", "verifiedAt", "applicationId", "policeId"
          )
          VALUES (
            $1, 'CLEARED', 'Physical residential enquiry completed with clean records.', 'PS-CHENNAI-CENTRAL', NOW(), $2, $3
          )
          ON CONFLICT ("reportId") DO NOTHING;
          `,
          [`PVR-${app.arn}`, appId, policeRecordId]
        );
      }

      // Seed Passport Booklet if dispatched
      if (app.status === "DISPATCHED") {
        await client.query(
          `
          INSERT INTO "Passport" (
            "passportNumber", "issueDate", "expiryDate", "dispatchStatus", "trackingNumber", "applicationId", "officerId"
          )
          VALUES (
            $1, NOW(), NOW() + INTERVAL '10 years', 'DISPATCHED', $2, $3, $4
          )
          ON CONFLICT ("passportNumber") DO NOTHING;
          `,
          [`P8849201`, `IN202610259942`, appId, officerRecordId]
        );
      }
    }

    // Seed Notification
    await client.query(
      `
      INSERT INTO "Notification" ("userId", title, message, type, "isRead")
      VALUES ($1, 'Welcome to Passport Automation System', 'Your applicant account is active. You can track your application status anytime.', 'INFO', false);
      `,
      [applicantUserId]
    );

    await client.query("COMMIT");
    console.log("==================================================");
    console.log("🎉 SUPABASE DEMO DATABASE SEEDED SUCCESSFULLY!");
    console.log("==================================================");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seeding failed with rollback:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
