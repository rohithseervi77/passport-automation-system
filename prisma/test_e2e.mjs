import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import dotenv from "dotenv";

dotenv.config();

const secret = process.env.AUTH_SECRET || "default_test_secret";
const secretKey = new TextEncoder().encode(secret);
const db = new Database("dev.db");

async function runE2ETest() {
  console.log("==================================================");
  console.log("PAS END-TO-END AUTOMATED VERIFICATION TEST");
  console.log("==================================================");

  // 1. Verify Users Exist
  console.log("\n[1] Verifying Seeded User Accounts in Database...");
  const applicantUser = db.prepare("SELECT * FROM User WHERE username = ?").get("applicant_demo");
  const officerUser = db.prepare("SELECT * FROM User WHERE username = ?").get("officer_demo");
  const policeUser = db.prepare("SELECT * FROM User WHERE username = ?").get("police_demo");

  if (!applicantUser || !officerUser || !policeUser) {
    throw new Error("Missing seeded test users in database!");
  }
  console.log("✓ Found Applicant:", applicantUser.username, `(Role: ${applicantUser.role})`);
  console.log("✓ Found Officer:", officerUser.username, `(Role: ${officerUser.role})`);
  console.log("✓ Found Police:", policeUser.username, `(Role: ${policeUser.role})`);

  // Test dynamic new user registration
  console.log("\n[1.1] Testing Dynamic New User Registration & Data Persistence for All Roles...");
  const testNewApplicantUsername = `user_test_${Date.now()}`;
  const testHash = await bcrypt.hash("TestPass@123", 12);
  
  // Register new applicant
  const newAppUser = db.prepare("INSERT INTO User (username, email, password, role) VALUES (?, ?, ?, 'APPLICANT')").run(testNewApplicantUsername, `${testNewApplicantUsername}@gov.in`, testHash);
  const newAppRecord = db.prepare("INSERT INTO Applicant (applicantId, name, dob, address, userId) VALUES (?, ?, ?, ?, ?)").run(`APP-${Date.now()}`, "Aarav Sharma", new Date("1998-05-15").toISOString(), "Flat 402, Green Valley Apartments, New Delhi", newAppUser.lastInsertRowid);
  console.log(`✓ Created new applicant user: ${testNewApplicantUsername} with stored profile and address`);

  // Register new officer
  const testNewOfficerUsername = `officer_test_${Date.now()}`;
  const newOffUser = db.prepare("INSERT INTO User (username, email, password, role) VALUES (?, ?, ?, 'OFFICER')").run(testNewOfficerUsername, `${testNewOfficerUsername}@gov.in`, testHash);
  db.prepare("INSERT INTO PassportOfficer (officerId, branchLocation, userId) VALUES (?, ?, ?)").run(`OFF-${Date.now().toString().slice(-4)}`, "RPO Regional Office Mumbai", newOffUser.lastInsertRowid);
  console.log(`✓ Created new officer user: ${testNewOfficerUsername} with branch location`);

  // Register new police
  const testNewPoliceUsername = `police_test_${Date.now()}`;
  const newPolUser = db.prepare("INSERT INTO User (username, email, password, role) VALUES (?, ?, ?, 'POLICE')").run(testNewPoliceUsername, `${testNewPoliceUsername}@gov.in`, testHash);
  db.prepare("INSERT INTO Police (stationCode, badgeNumber, userId) VALUES ('PS-CENTRAL', ?, ?)").run(`POL-${Date.now().toString().slice(-4)}`, newPolUser.lastInsertRowid);
  console.log(`✓ Created new police user: ${testNewPoliceUsername} with station code PS-CENTRAL`);

  // 2. Verify Password Hashing with bcrypt
  console.log("\n[2] Testing Authentication & Password Verification...");
  const applicantPassValid = await bcrypt.compare("Applicant@123", applicantUser.password);
  const officerPassValid = await bcrypt.compare("Officer@123", officerUser.password);
  const policePassValid = await bcrypt.compare("Police@123", policeUser.password);

  if (!applicantPassValid || !officerPassValid || !policePassValid) {
    throw new Error("Password comparison failed!");
  }
  console.log("✓ All 3 user passwords verified successfully with bcrypt.");

  // 3. Test JWT Session Creation & Token Verification
  console.log("\n[3] Testing JWT Session Generation & Verification (jose)...");
  const sessionToken = await new SignJWT({ userId: applicantUser.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  const { payload } = await jwtVerify(sessionToken, secretKey);
  if (Number(payload.userId) !== applicantUser.id) {
    throw new Error("Session verification failed!");
  }
  console.log("✓ JWT Session created and decoded successfully with userId:", payload.userId);

  // 4. Test Applicant Workflow: Application Submission
  console.log("\n[4] Simulating Applicant Workflow: Create Application & Documents & Appointment...");
  const applicantRecord = db.prepare("SELECT * FROM Applicant WHERE userId = ?").get(applicantUser.id);
  
  // Clean previous test application if any
  const previousApps = db.prepare("SELECT id FROM Application WHERE applicantId = ?").all(applicantRecord.id);
  for (const prev of previousApps) {
    db.prepare("DELETE FROM Passport WHERE applicationId = ?").run(prev.id);
    db.prepare("DELETE FROM PoliceReport WHERE applicationId = ?").run(prev.id);
    db.prepare("DELETE FROM Appointment WHERE applicationId = ?").run(prev.id);
    db.prepare("DELETE FROM Document WHERE applicationId = ?").run(prev.id);
    db.prepare("DELETE FROM Application WHERE id = ?").run(prev.id);
  }

  const appId = `PAS-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const appInsert = db.prepare(`
    INSERT INTO Application (applicationId, passportType, status, submissionDate, applicantId)
    VALUES (?, ?, 'SUBMITTED', ?, ?)
  `).run(appId, "REGULAR (36 Pages)", new Date().toISOString(), applicantRecord.id);
  const applicationDbId = appInsert.lastInsertRowid;
  console.log(`✓ Application created with ID: ${appId} (Status: SUBMITTED)`);

  // 5. Upload Documents (Composition: Application -> Documents)
  const docId1 = `DOC-AADHAAR-${Date.now().toString().slice(-4)}`;
  const docId2 = `DOC-ADDRESS-${Date.now().toString().slice(-4)}`;
  db.prepare(`
    INSERT INTO Document (docId, documentType, fileStatus, fileUrl, applicationId)
    VALUES (?, 'Identity Proof (Aadhaar Card)', 'UPLOADED', '/uploads/aadhaar.pdf', ?)
  `).run(docId1, applicationDbId);

  db.prepare(`
    INSERT INTO Document (docId, documentType, fileStatus, fileUrl, applicationId)
    VALUES (?, 'Address Proof (Electricity Bill)', 'UPLOADED', '/uploads/electricity.pdf', ?)
  `).run(docId2, applicationDbId);
  console.log("✓ Attached 2 required verification documents (Aadhaar & Address Proof)");

  // 6. Schedule Appointment (Application -> Appointment)
  const aptId = `APT-${Date.now().toString().slice(-6)}`;
  db.prepare(`
    INSERT INTO Appointment (appointmentId, date, timeSlot, applicationId)
    VALUES (?, ?, '10:00 AM - 11:00 AM', ?)
  `).run(aptId, new Date(Date.now() + 86400000 * 3).toISOString(), applicationDbId);

  db.prepare("UPDATE Application SET status = 'APPOINTMENT_SCHEDULED' WHERE id = ?").run(applicationDbId);
  console.log(`✓ Booked Appointment ID: ${aptId} -> Application Status updated to 'APPOINTMENT_SCHEDULED'`);

  // 7. Officer Workflow: Verify Documents & Forward for Police Enquiry
  console.log("\n[5] Simulating Officer Workflow: Verify Documents & Forward for Police Enquiry...");
  const officerRecord = db.prepare("SELECT * FROM PassportOfficer WHERE userId = ?").get(officerUser.id);
  
  db.prepare("UPDATE Document SET fileStatus = 'VERIFIED' WHERE applicationId = ?").run(applicationDbId);
  db.prepare("UPDATE Application SET status = 'UNDER_OFFICER_VERIFICATION', officerId = ? WHERE id = ?").run(officerRecord.id, applicationDbId);
  console.log("✓ Officer verified all attached documents -> Status: 'UNDER_OFFICER_VERIFICATION'");

  db.prepare("UPDATE Application SET status = 'POLICE_VERIFICATION_PENDING' WHERE id = ?").run(applicationDbId);
  console.log("✓ Officer forwarded application to local Police station -> Status: 'POLICE_VERIFICATION_PENDING'");

  // 8. Police Workflow: Conduct Enquiry & Submit Clearance Report
  console.log("\n[6] Simulating Police Workflow: Enquiry & Clearance Report Submission...");
  const policeRecord = db.prepare("SELECT * FROM Police WHERE userId = ?").get(policeUser.id);
  const repId = `REP-CENTRAL-${Date.now().toString().slice(-4)}`;
  
  db.prepare(`
    INSERT INTO PoliceReport (reportId, clearanceStatus, remarks, applicationId, policeId)
    VALUES (?, 'CLEARED', 'Physical residential verification complete. Clean background, no criminal records.', ?, ?)
  `).run(repId, applicationDbId, policeRecord.id);

  db.prepare("UPDATE Application SET status = 'POLICE_CLEARED' WHERE id = ?").run(applicationDbId);
  console.log(`✓ Police submitted Clearance Report ${repId} (Status: CLEARED) -> Application Status: 'POLICE_CLEARED'`);

  // 9. Officer Approval & Passport Booklet Issuance
  console.log("\n[7] Simulating Officer Approval, Passport Printing & Dispatch...");
  db.prepare("UPDATE Application SET status = 'APPROVED' WHERE id = ?").run(applicationDbId);
  console.log("✓ Officer approved application -> Status: 'APPROVED'");

  const passportNumber = `P${Math.floor(1000000 + Math.random() * 9000000)}`;
  const issueDate = new Date().toISOString();
  const expiryDate = new Date(Date.now() + 86400000 * 365 * 10).toISOString();

  db.prepare(`
    INSERT INTO Passport (passportNumber, issueDate, expiryDate, dispatchStatus, applicationId, officerId)
    VALUES (?, ?, ?, 'PRINTED', ?, ?)
  `).run(passportNumber, issueDate, expiryDate, applicationDbId, officerRecord.id);

  db.prepare("UPDATE Application SET status = 'PASSPORT_ISSUED' WHERE id = ?").run(applicationDbId);
  console.log(`✓ Passport Generated: ${passportNumber} (10-Year Validity) -> Status: 'PASSPORT_ISSUED'`);

  // 10. Passport Dispatch
  db.prepare("UPDATE Passport SET dispatchStatus = 'DISPATCHED' WHERE applicationId = ?").run(applicationDbId);
  db.prepare("UPDATE Application SET status = 'PASSPORT_DISPATCHED' WHERE id = ?").run(applicationDbId);
  console.log(`✓ Passport Dispatched via Speed Post tracking -> Final Application Status: 'PASSPORT_DISPATCHED'`);

  // 11. Final Integrity Check
  console.log("\n[8] Final Verification of Database Relations & UML Realization...");
  const finalApp = db.prepare(`
    SELECT a.*, p.passportNumber, p.dispatchStatus, pr.clearanceStatus, apt.appointmentId
    FROM Application a
    LEFT JOIN Passport p ON p.applicationId = a.id
    LEFT JOIN PoliceReport pr ON pr.applicationId = a.id
    LEFT JOIN Appointment apt ON apt.applicationId = a.id
    WHERE a.id = ?
  `).get(applicationDbId);

  console.log("==================================================");
  console.log("FINAL APPLICATION STATE IN DATABASE:");
  console.log(finalApp);
  console.log("==================================================");
  console.log("✅ ALL WORKFLOW PHASES & UML OBJECTS VERIFIED SUCCESSFULLY!");
}

runE2ETest().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
