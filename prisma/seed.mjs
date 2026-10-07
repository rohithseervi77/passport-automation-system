import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

const db = new Database("dev.db");

async function seed() {
  console.log("Seeding PAS database...");

  // 1. Seed Demo Applicant
  const applicantPassword = await bcrypt.hash("Applicant@123", 10);
  const existingApplicantUser = db.prepare("SELECT id FROM User WHERE username = ?").get("applicant_demo");
  
  if (!existingApplicantUser) {
    const userInsert = db.prepare(`
      INSERT INTO User (username, password, email, role)
      VALUES (?, ?, ?, 'APPLICANT')
    `).run("applicant_demo", applicantPassword, "applicant.demo@pas.gov.in");

    const userId = userInsert.lastInsertRowid;
    const applicantId = "APP-" + Date.now().toString().slice(-8);

    db.prepare(`
      INSERT INTO Applicant (applicantId, name, dob, address, userId)
      VALUES (?, ?, ?, ?, ?)
    `).run(applicantId, "Aarav Sharma", "1998-05-15T00:00:00.000Z", "42 Park Avenue, Central City", userId);
    console.log("Created applicant_demo user");
  } else {
    console.log("applicant_demo already exists");
  }

  // 2. Seed Passport Officer
  const officerPassword = await bcrypt.hash("Officer@123", 10);
  const existingOfficerUser = db.prepare("SELECT id FROM User WHERE username = ?").get("officer_demo");

  if (!existingOfficerUser) {
    const userInsert = db.prepare(`
      INSERT INTO User (username, password, email, role)
      VALUES (?, ?, ?, 'OFFICER')
    `).run("officer_demo", officerPassword, "officer.central@pas.gov.in");

    const userId = userInsert.lastInsertRowid;
    const officerId = "OFF-CENTRAL-01";

    db.prepare(`
      INSERT INTO PassportOfficer (officerId, branchLocation, userId)
      VALUES (?, ?, ?)
    `).run(officerId, "Regional Passport Office - Central Division", userId);
    console.log("Created officer_demo user");
  } else {
    console.log("officer_demo already exists");
  }

  // 3. Seed Police Authority
  const policePassword = await bcrypt.hash("Police@123", 10);
  const existingPoliceUser = db.prepare("SELECT id FROM User WHERE username = ?").get("police_demo");

  if (!existingPoliceUser) {
    const userInsert = db.prepare(`
      INSERT INTO User (username, password, email, role)
      VALUES (?, ?, ?, 'POLICE')
    `).run("police_demo", policePassword, "police.station.central@pas.gov.in");

    const userId = userInsert.lastInsertRowid;
    const badgeNumber = "POL-90210";
    const stationCode = "PS-CENTRAL";

    db.prepare(`
      INSERT INTO Police (stationCode, badgeNumber, userId)
      VALUES (?, ?, ?)
    `).run(stationCode, badgeNumber, userId);
    console.log("Created police_demo user");
  } else {
    console.log("police_demo already exists");
  }

  console.log("Seeding complete!");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
