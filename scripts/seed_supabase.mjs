/**
 * Passport Automation System (PAS)
 * Standalone Supabase PostgreSQL Seeding Script
 *
 * Populates Supabase Auth with identities and Supabase PostgreSQL with
 * application data, appointments, payments, documents, and login history.
 *
 * ABSOLUTELY NO PASSWORDS ARE STORED IN POSTGRESQL.
 */

import pg from "pg";
import dotenv from "dotenv";
import crypto from "crypto";

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
  console.log("PAS — Seeding Supabase (Zero Passwords in PostgreSQL)");
  console.log("==================================================");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Seed Demo Applicant Profile
    const applicantAuthId = "a1000000-0000-0000-0000-000000000001";
    const applicantRes = await client.query(
      `
      INSERT INTO "User" ("authUserId", username, email, role, "isActive", "lastLoginAt")
      VALUES ($1, $2, $3, 'APPLICANT', true, NOW())
      ON CONFLICT (username) DO UPDATE SET "authUserId" = EXCLUDED."authUserId"
      RETURNING id;
      `,
      [applicantAuthId, "applicant_demo", "applicant.demo@pas.gov.in"]
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
    console.log("✓ Seeded Applicant profile: applicant_demo (Supabase Auth ID:", applicantAuthId, ")");

    // 2. Seed Passport Officer Profile
    const officerAuthId = "a1000000-0000-0000-0000-000000000002";
    const officerRes = await client.query(
      `
      INSERT INTO "User" ("authUserId", username, email, role, "isActive", "lastLoginAt")
      VALUES ($1, $2, $3, 'OFFICER', true, NOW())
      ON CONFLICT (username) DO UPDATE SET "authUserId" = EXCLUDED."authUserId"
      RETURNING id;
      `,
      [officerAuthId, "officer_demo", "officer.central@pas.gov.in"]
    );
    const officerUserId = officerRes.rows[0].id;

    const officerProfileRes = await client.query(
      `
      INSERT INTO "PassportOfficer" ("officerId", "branchLocation", "userId")
      VALUES ($1, $2, $3)
      ON CONFLICT ("userId") DO UPDATE SET "branchLocation" = EXCLUDED."branchLocation"
      RETURNING id;
      `,
      [
        "OFF-CHENNAI-01",
        "Regional Passport Office, Rayala Towers, Anna Salai, Chennai",
        officerUserId,
      ]
    );
    const officerRecordId = officerProfileRes.rows[0].id;
    console.log("✓ Seeded Officer profile: officer_demo (Supabase Auth ID:", officerAuthId, ")");

    // 3. Seed Police Authority Profile
    const policeAuthId = "a1000000-0000-0000-0000-000000000003";
    const policeRes = await client.query(
      `
      INSERT INTO "User" ("authUserId", username, email, role, "isActive", "lastLoginAt")
      VALUES ($1, $2, $3, 'POLICE', true, NOW())
      ON CONFLICT (username) DO UPDATE SET "authUserId" = EXCLUDED."authUserId"
      RETURNING id;
      `,
      [policeAuthId, "police_demo", "police.central@pas.gov.in"]
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
    console.log("✓ Seeded Police profile: police_demo (Supabase Auth ID:", policeAuthId, ")");

    // 4. Seed Initial Login Activity (LoginHistory)
    await client.query(
      `
      INSERT INTO "LoginHistory" ("authUserId", email, role, "loginTime", success, "ipAddress", "userAgent")
      VALUES 
        ($1, 'applicant.demo@pas.gov.in', 'APPLICANT', NOW() - INTERVAL '1 hour', true, '127.0.0.1', 'Mozilla/5.0 PAS-Client'),
        ($2, 'officer.central@pas.gov.in', 'OFFICER', NOW() - INTERVAL '45 minutes', true, '127.0.0.1', 'Mozilla/5.0 PAS-Officer-Terminal'),
        ($3, 'police.central@pas.gov.in', 'POLICE', NOW() - INTERVAL '30 minutes', true, '127.0.0.1', 'Mozilla/5.0 PAS-Police-Terminal'),
        ($1, 'applicant.demo@pas.gov.in', 'APPLICANT', NOW() - INTERVAL '2 hours', false, '192.168.1.100', 'Mozilla/5.0 Invalid-Attempt');
      `,
      [applicantAuthId, officerAuthId, policeAuthId]
    );
    console.log("✓ Seeded LoginHistory records (Success & Failed attempts tracked without passwords)");

    // 5. Seed Applications in Various Workflow States
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
        {
          type: "Proof of Date of Birth (Aadhaar / Birth Certificate)",
          name: "aadhaar_card.pdf",
          path: `${app.arn}/proof_of_date_of_birth/aadhaar_card.pdf`,
        },
        {
          type: "Proof of Present Address (Utility Bill / Rent Agreement)",
          name: "electricity_bill.pdf",
          path: `${app.arn}/proof_of_present_address/electricity_bill.pdf`,
        },
        {
          type: "Proof of Identity / Voter ID",
          name: "voter_card.pdf",
          path: `${app.arn}/proof_of_identity/voter_card.pdf`,
        },
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
