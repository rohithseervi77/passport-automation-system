-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'APPLICANT'
);

-- CreateTable
CREATE TABLE "Applicant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dob" DATETIME NOT NULL,
    "address" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Applicant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PassportOfficer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "officerId" TEXT NOT NULL,
    "branchLocation" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "PassportOfficer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Police" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stationCode" TEXT NOT NULL,
    "badgeNumber" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Police_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationId" TEXT NOT NULL,
    "passportType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submissionDate" DATETIME,
    "applicantId" INTEGER NOT NULL,
    "officerId" INTEGER,
    CONSTRAINT "Application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Application_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "PassportOfficer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "docId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileStatus" TEXT NOT NULL,
    "fileUrl" TEXT,
    "applicationId" INTEGER NOT NULL,
    CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "appointmentId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "applicationId" INTEGER NOT NULL,
    CONSTRAINT "Appointment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PoliceReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reportId" TEXT NOT NULL,
    "clearanceStatus" TEXT NOT NULL,
    "remarks" TEXT,
    "applicationId" INTEGER NOT NULL,
    "policeId" INTEGER NOT NULL,
    CONSTRAINT "PoliceReport_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PoliceReport_policeId_fkey" FOREIGN KEY ("policeId") REFERENCES "Police" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Passport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "passportNumber" TEXT NOT NULL,
    "issueDate" DATETIME NOT NULL,
    "expiryDate" DATETIME NOT NULL,
    "dispatchStatus" TEXT NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "officerId" INTEGER,
    CONSTRAINT "Passport_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Passport_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "PassportOfficer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_applicantId_key" ON "Applicant"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_userId_key" ON "Applicant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PassportOfficer_officerId_key" ON "PassportOfficer"("officerId");

-- CreateIndex
CREATE UNIQUE INDEX "PassportOfficer_userId_key" ON "PassportOfficer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Police_badgeNumber_key" ON "Police"("badgeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Police_userId_key" ON "Police"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_applicationId_key" ON "Application"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Document_docId_key" ON "Document"("docId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_appointmentId_key" ON "Appointment"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_applicationId_key" ON "Appointment"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "PoliceReport_reportId_key" ON "PoliceReport"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "Passport_passportNumber_key" ON "Passport"("passportNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Passport_applicationId_key" ON "Passport"("applicationId");
