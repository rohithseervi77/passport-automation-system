import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

const db = new Database("dev.db");

async function seed() {
  console.log("Seeding PAS database with realistic demo accounts and workflow scenarios...");

  // 1. Seed Demo Applicant
  const applicantPassword = await bcrypt.hash("Applicant@123", 10);
  let applicantUser = db.prepare("SELECT id FROM User WHERE username = ?").get("applicant_demo");
  let applicantRecord;

  if (!applicantUser) {
    const userInsert = db.prepare(`
      INSERT INTO User (username, password, email, role)
      VALUES (?, ?, ?, 'APPLICANT')
    `).run("applicant_demo", applicantPassword, "applicant.demo@pas.gov.in");

    const userId = userInsert.lastInsertRowid;
    const applicantId = "APP-20261025";

    const appInsert = db.prepare(`
      INSERT INTO Applicant (applicantId, name, dob, address, phone, userId)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(applicantId, "Aarav Sharma", "1998-05-15T00:00:00.000Z", "42 Park Avenue, Saligramam, Chennai, Tamil Nadu 600093", "9876543210", userId);

    applicantRecord = { id: appInsert.lastInsertRowid, userId };
    console.log("Created applicant_demo user");
  } else {
    applicantRecord = db.prepare("SELECT id, userId FROM Applicant WHERE userId = ?").get(applicantUser.id);
    console.log("applicant_demo already exists");
  }

  // 2. Seed Passport Officer
  const officerPassword = await bcrypt.hash("Officer@123", 10);
  let officerUser = db.prepare("SELECT id FROM User WHERE username = ?").get("officer_demo");
  let officerRecord;

  if (!officerUser) {
    const userInsert = db.prepare(`
      INSERT INTO User (username, password, email, role)
      VALUES (?, ?, ?, 'OFFICER')
    `).run("officer_demo", officerPassword, "officer.central@pas.gov.in");

    const userId = userInsert.lastInsertRowid;
    const officerId = "OFF-CHENNAI-01";

    const offInsert = db.prepare(`
      INSERT INTO PassportOfficer (officerId, branchLocation, userId)
      VALUES (?, ?, ?)
    `).run(officerId, "Regional Passport Office - Chennai (Rayala Towers)", userId);

    officerRecord = { id: offInsert.lastInsertRowid, userId };
    console.log("Created officer_demo user");
  } else {
    officerRecord = db.prepare("SELECT id, userId FROM PassportOfficer WHERE userId = ?").get(officerUser.id);
    console.log("officer_demo already exists");
  }

  // 3. Seed Police Authority
  const policePassword = await bcrypt.hash("Police@123", 10);
  let policeUser = db.prepare("SELECT id FROM User WHERE username = ?").get("police_demo");
  let policeRecord;

  if (!policeUser) {
    const userInsert = db.prepare(`
      INSERT INTO User (username, password, email, role)
      VALUES (?, ?, ?, 'POLICE')
    `).run("police_demo", policePassword, "police.station.central@pas.gov.in");

    const userId = userInsert.lastInsertRowid;
    const badgeNumber = "POL-90210";
    const stationCode = "PS-SALIGRAMAM";

    const polInsert = db.prepare(`
      INSERT INTO Police (stationCode, badgeNumber, officerName, district, userId)
      VALUES (?, ?, ?, ?, ?)
    `).run(stationCode, badgeNumber, "S. Vijayakumar", "Chennai City Police", userId);

    policeRecord = { id: polInsert.lastInsertRowid, userId };
    console.log("Created police_demo user");
  } else {
    policeRecord = db.prepare("SELECT id, userId FROM Police WHERE userId = ?").get(policeUser.id);
    console.log("police_demo already exists");
  }

  // Helper to create application if ARN doesn't exist
  function ensureApplication(appData) {
    const existing = db.prepare("SELECT id FROM Application WHERE applicationId = ?").get(appData.applicationId);
    if (existing) {
      return existing.id;
    }

    const stmt = db.prepare(`
      INSERT INTO Application (
        applicationId, passportType, serviceType, applicationCategory, bookletType, rpoLocation, status,
        givenName, surname, gender, dob, placeOfBirth, maritalStatus, citizenship, pan, aadhaarNumber,
        fatherName, motherName, spouseName, presentAddressLine1, presentCity, presentDistrict, presentState,
        presentPinCode, policeStation, isPermanentSame, emergencyName, emergencyRelationship, emergencyMobile,
        emergencyEmail, hasPreviousPassport, hasCriminalRecord, hasPendingProceedings, hasLostPassport,
        confirmedDeclaration, applicantId, officerId, clarificationReason
      ) VALUES (
        @applicationId, @passportType, @serviceType, @applicationCategory, @bookletType, @rpoLocation, @status,
        @givenName, @surname, @gender, @dob, @placeOfBirth, @maritalStatus, @citizenship, @pan, @aadhaarNumber,
        @fatherName, @motherName, @spouseName, @presentAddressLine1, @presentCity, @presentDistrict, @presentState,
        @presentPinCode, @policeStation, @isPermanentSame, @emergencyName, @emergencyRelationship, @emergencyMobile,
        @emergencyEmail, @hasPreviousPassport, @hasCriminalRecord, @hasPendingProceedings, @hasLostPassport,
        @confirmedDeclaration, @applicantId, @officerId, @clarificationReason
      )
    `);

    const result = stmt.run({
      ...appData,
      applicantId: applicantRecord.id,
      officerId: officerRecord?.id || null,
    });

    console.log(`Created application ${appData.applicationId} (${appData.status})`);
    return result.lastInsertRowid;
  }

  // Seed Scenario 1: Active application for applicant_demo in APPOINTMENT_BOOKED
  const app1Id = ensureApplication({
    applicationId: "PAS202610250001",
    passportType: "REGULAR (36 Pages)",
    serviceType: "FRESH",
    applicationCategory: "NORMAL",
    bookletType: "36_PAGES",
    rpoLocation: "RPO Chennai",
    status: "APPOINTMENT_BOOKED",
    givenName: "Aarav",
    surname: "Sharma",
    gender: "MALE",
    dob: "1998-05-15T00:00:00.000Z",
    placeOfBirth: "Chennai, Tamil Nadu",
    maritalStatus: "Single",
    citizenship: "By Birth",
    pan: "ABCDE1234F",
    aadhaarNumber: "987654321098",
    fatherName: "Ramesh Sharma",
    motherName: "Sunita Sharma",
    spouseName: null,
    presentAddressLine1: "42 Park Avenue, Saligramam",
    presentCity: "Chennai",
    presentDistrict: "Chennai",
    presentState: "Tamil Nadu",
    presentPinCode: "600093",
    policeStation: "PS-SALIGRAMAM",
    isPermanentSame: 1,
    emergencyName: "Ramesh Sharma",
    emergencyRelationship: "Father",
    emergencyMobile: "9876543211",
    emergencyEmail: "ramesh.sharma@example.com",
    hasPreviousPassport: 0,
    hasCriminalRecord: 0,
    hasPendingProceedings: 0,
    hasLostPassport: 0,
    confirmedDeclaration: 1,
    clarificationReason: null,
  });

  // Ensure Payment for App 1
  const existingPayment1 = db.prepare("SELECT id FROM Payment WHERE applicationId = ?").get(app1Id);
  if (!existingPayment1) {
    db.prepare(`
      INSERT INTO Payment (transactionId, amount, baseFee, additionalFee, status, paymentMethod, paymentReference, applicationId)
      VALUES (?, 1500, 1500, 0, 'SUCCESS', 'UPI', 'applicant@okaxis', ?)
    `).run("PAY202610250001", app1Id);
  }

  // Ensure Appointment for App 1
  const existingAppt1 = db.prepare("SELECT id FROM Appointment WHERE applicationId = ?").get(app1Id);
  if (!existingAppt1) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    db.prepare(`
      INSERT INTO Appointment (appointmentId, location, quota, date, timeSlot, status, rescheduleCount, applicationId)
      VALUES (?, 'PSK Chennai - Saligramam (Ground Floor, Bharani Colony)', 'NORMAL', ?, '10:00 AM - 11:00 AM', 'BOOKED', 0, ?)
    `).run("APT202610250001", futureDate.toISOString(), app1Id);
  }

  // Ensure Documents for App 1
  const existingDoc1 = db.prepare("SELECT id FROM Document WHERE applicationId = ?").get(app1Id);
  if (!existingDoc1) {
    db.prepare(`
      INSERT INTO Document (docId, documentType, fileStatus, fileName, fileSize, fileUrl, applicationId)
      VALUES (?, 'Proof of Identity (Aadhaar Card)', 'VERIFIED', 'aadhaar_card_verified.pdf', 380000, '/uploads/aadhaar.pdf', ?)
    `).run("DOC-102501-891", app1Id);

    db.prepare(`
      INSERT INTO Document (docId, documentType, fileStatus, fileName, fileSize, fileUrl, applicationId)
      VALUES (?, 'Proof of Address (Electricity / Water Bill)', 'VERIFIED', 'tneb_electricity_bill.pdf', 410000, '/uploads/tneb.pdf', ?)
    `).run("DOC-102502-892", app1Id);
  }

  // Scenario 2: Application in POLICE_VERIFICATION_PENDING (Ready for police enquiry)
  const app2Id = ensureApplication({
    applicationId: "PAS202610250002",
    passportType: "REGULAR (36 Pages)",
    serviceType: "FRESH",
    applicationCategory: "TATKAAL",
    bookletType: "36_PAGES",
    rpoLocation: "RPO Chennai",
    status: "POLICE_VERIFICATION_PENDING",
    givenName: "Priya",
    surname: "Natarajan",
    gender: "FEMALE",
    dob: "1995-09-22T00:00:00.000Z",
    placeOfBirth: "Coimbatore, Tamil Nadu",
    maritalStatus: "Married",
    citizenship: "By Birth",
    pan: "PQXYZ9876G",
    aadhaarNumber: "876543210987",
    fatherName: "K. Natarajan",
    motherName: "Lakshmi Natarajan",
    spouseName: "R. Karthik",
    presentAddressLine1: "Flat 3B, Sri Krishna Apartments, Saligramam",
    presentCity: "Chennai",
    presentDistrict: "Chennai",
    presentState: "Tamil Nadu",
    presentPinCode: "600093",
    policeStation: "PS-SALIGRAMAM",
    isPermanentSame: 1,
    emergencyName: "R. Karthik",
    emergencyRelationship: "Spouse",
    emergencyMobile: "9840123456",
    emergencyEmail: "karthik.r@example.com",
    hasPreviousPassport: 0,
    hasCriminalRecord: 0,
    hasPendingProceedings: 0,
    hasLostPassport: 0,
    confirmedDeclaration: 1,
    clarificationReason: null,
  });

  // Scenario 3: Application in POLICE_CLEARED (Ready for Officer Approval)
  const app3Id = ensureApplication({
    applicationId: "PAS202610250003",
    passportType: "REGULAR (60 Pages)",
    serviceType: "FRESH",
    applicationCategory: "NORMAL",
    bookletType: "60_PAGES",
    rpoLocation: "RPO Chennai",
    status: "POLICE_VERIFICATION_COMPLETED",
    givenName: "Vignesh",
    surname: "Sundaram",
    gender: "MALE",
    dob: "1992-12-04T00:00:00.000Z",
    placeOfBirth: "Madurai, Tamil Nadu",
    maritalStatus: "Single",
    citizenship: "By Birth",
    pan: "VSUND4521M",
    aadhaarNumber: "765432109876",
    fatherName: "M. Sundaram",
    motherName: "V. Meenakshi",
    spouseName: null,
    presentAddressLine1: "15 Gandhi Road, Saligramam",
    presentCity: "Chennai",
    presentDistrict: "Chennai",
    presentState: "Tamil Nadu",
    presentPinCode: "600093",
    policeStation: "PS-SALIGRAMAM",
    isPermanentSame: 1,
    emergencyName: "M. Sundaram",
    emergencyRelationship: "Father",
    emergencyMobile: "9841987654",
    emergencyEmail: "sundaram.m@example.com",
    hasPreviousPassport: 0,
    hasCriminalRecord: 0,
    hasPendingProceedings: 0,
    hasLostPassport: 0,
    confirmedDeclaration: 1,
    clarificationReason: null,
  });

  // Ensure Police Report for App 3 (CLEARED)
  const existingRep3 = db.prepare("SELECT id FROM PoliceReport WHERE applicationId = ?").get(app3Id);
  if (!existingRep3) {
    db.prepare(`
      INSERT INTO PoliceReport (reportId, clearanceStatus, remarks, stationCode, verifiedAt, applicationId, policeId)
      VALUES (?, 'CLEARED', 'Physical field enquiry conducted at applicant residence. Interacted with local residents. Clean CCTNS records with zero criminal antecedents.', 'PS-SALIGRAMAM', ?, ?, ?)
    `).run("PVR202610250003", new Date().toISOString(), app3Id, policeRecord?.id || null);
  }

  // Scenario 4: Application in CLARIFICATION_REQUIRED
  const app4Id = ensureApplication({
    applicationId: "PAS202610250004",
    passportType: "REGULAR (36 Pages)",
    serviceType: "REISSUE",
    applicationCategory: "NORMAL",
    bookletType: "36_PAGES",
    rpoLocation: "RPO Chennai",
    status: "CLARIFICATION_REQUIRED",
    givenName: "Divya",
    surname: "Balakrishnan",
    gender: "FEMALE",
    dob: "1990-03-20T00:00:00.000Z",
    placeOfBirth: "Tiruchirappalli, Tamil Nadu",
    maritalStatus: "Married",
    citizenship: "By Birth",
    pan: "DBALA7812H",
    aadhaarNumber: "654321098765",
    fatherName: "S. Balakrishnan",
    motherName: "B. Radhika",
    spouseName: "A. Suresh",
    presentAddressLine1: "29 North Mada Street, Vadapalani",
    presentCity: "Chennai",
    presentDistrict: "Chennai",
    presentState: "Tamil Nadu",
    presentPinCode: "600026",
    policeStation: "PS-VADAPALANI",
    isPermanentSame: 1,
    emergencyName: "A. Suresh",
    emergencyRelationship: "Spouse",
    emergencyMobile: "9884123987",
    emergencyEmail: "suresh.a@example.com",
    hasPreviousPassport: 1,
    hasCriminalRecord: 0,
    hasPendingProceedings: 0,
    hasLostPassport: 0,
    confirmedDeclaration: 1,
    clarificationReason: "Discrepancy noted between present residential address proof and old passport record. Please clarify duration of stay at current address.",
  });

  // Scenario 5: Application in DISPATCHED (Completed workflow with Passport & Speed Post)
  const app5Id = ensureApplication({
    applicationId: "PAS202610250005",
    passportType: "REGULAR (36 Pages)",
    serviceType: "FRESH",
    applicationCategory: "TATKAAL",
    bookletType: "36_PAGES",
    rpoLocation: "RPO Chennai",
    status: "DISPATCHED",
    givenName: "Karthik",
    surname: "Raman",
    gender: "MALE",
    dob: "1994-07-11T00:00:00.000Z",
    placeOfBirth: "Chennai, Tamil Nadu",
    maritalStatus: "Single",
    citizenship: "By Birth",
    pan: "KRAMA3901P",
    aadhaarNumber: "543210987654",
    fatherName: "T. Raman",
    motherName: "R. Geetha",
    spouseName: null,
    presentAddressLine1: "88 First Cross Street, Saligramam",
    presentCity: "Chennai",
    presentDistrict: "Chennai",
    presentState: "Tamil Nadu",
    presentPinCode: "600093",
    policeStation: "PS-SALIGRAMAM",
    isPermanentSame: 1,
    emergencyName: "T. Raman",
    emergencyRelationship: "Father",
    emergencyMobile: "9444123456",
    emergencyEmail: "raman.t@example.com",
    hasPreviousPassport: 0,
    hasCriminalRecord: 0,
    hasPendingProceedings: 0,
    hasLostPassport: 0,
    confirmedDeclaration: 1,
    clarificationReason: null,
  });

  // Ensure Passport for App 5
  const existingPass5 = db.prepare("SELECT id FROM Passport WHERE applicationId = ?").get(app5Id);
  if (!existingPass5) {
    const issueDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 10);

    db.prepare(`
      INSERT INTO Passport (passportNumber, issueDate, expiryDate, dispatchStatus, trackingNumber, applicationId, officerId)
      VALUES (?, ?, ?, 'DISPATCHED', ?, ?, ?)
    `).run("P7819203", issueDate.toISOString(), expiryDate.toISOString(), "IN202610257819TRK", app5Id, officerRecord?.id || null);
  }

  console.log("Seeding complete! All scenarios successfully provisioned.");
}

seed().catch((err) => {
  console.error("Seed execution error:", err);
  process.exit(1);
});
