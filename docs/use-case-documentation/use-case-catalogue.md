# Use Case Identification, Catalogue, and Detailed Specifications

## 1. Use Case Catalogue

The following master catalogue enumerates all **46 functional use cases** identified in the Passport Automation System (PAS), mapped to their primary actors, supporting actors, priorities, and functional modules.

| ID | Use Case Name | Primary Actor | Supporting Actors | Priority | Functional Module |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC-01** | Browse Services Directory | Public User | — | Public | Public Discovery |
| **UC-02** | View Gazette Notices & Advisories | Public User | — | Public | Public Discovery |
| **UC-03** | Calculate Statutory Fee (GSR 516E) | Public User | FeeSchedule Engine | Public | Fee Management |
| **UC-04** | Locate PSK / POPSK Regional Centres | Public User | — | Public | PSK Centre Directory |
| **UC-05** | Query Document Advisor Checklist | Public User | — | Public | Document Advisory |
| **UC-06** | Track Application Status by ARN (Public) | Public User | India Post API | Public / Core | Status Tracking |
| **UC-07** | Lodge Public Grievance Ticket | Public User | Notification Gateway | Public | Grievance Redressal |
| **UC-08** | Register Citizen Account | Applicant | Captcha Service, Email Gateway | Core | Authentication & Security |
| **UC-09** | Citizen Login & Session Initialization | Applicant | Security Lockout Monitor | Core | Authentication & Security |
| **UC-10** | Reset Password via Email Recovery | Applicant | Email Gateway | Supporting | Authentication & Security |
| **UC-11** | Initiate Passport Application (Fresh/Reissue) | Applicant | — | Core | Application Processing |
| **UC-12** | Save Application Form Draft | Applicant | — | Supporting | Application Processing |
| **UC-13** | Declare Minor & Parental Consent | Applicant | — | Core | Application Processing |
| **UC-14** | Submit Final Passport Application | Applicant | FSM Engine, Fee Engine | Core | Application Processing |
| **UC-15** | Upload Scanned Proof Documents | Applicant | Storage Engine | Core | Document Management |
| **UC-16** | Import Documents via DigiLocker (Simulated) | Applicant | DigiLocker Gateway | Supporting | Document Management |
| **UC-17** | Settle Statutory Application Fee Online | Applicant | Payment Gateway, Email Gateway | Core | Financial Settlement |
| **UC-18** | Download Digital Payment Receipt | Applicant | — | Supporting | Financial Settlement |
| **UC-19** | Query Available PSK Appointment Slots | Applicant | PSK Capacity Manager | Core | Appointment Management |
| **UC-20** | Book PSK Appointment Slot | Applicant | FSM Engine, Notification Gateway | Core | Appointment Management |
| **UC-21** | Reschedule PSK Appointment | Applicant | AppointmentHistory Engine | Supporting | Appointment Management |
| **UC-22** | Cancel PSK Appointment | Applicant | — | Supporting | Appointment Management |
| **UC-23** | Simulate PSK Counter Flow (Counters A/B/C) | Applicant | PSK Simulation Engine | Simulation | PSK Interaction |
| **UC-24** | View Application Lifecycle Dashboard | Applicant | — | Core | Citizen Dashboard |
| **UC-25** | Respond to Officer Clarification Request | Applicant | FSM Engine | Core | Application Processing |
| **UC-26** | Track Registered Grievance Status | Applicant | — | Supporting | Grievance Redressal |
| **UC-27** | View Officer Scrutiny Dossier Queue | Passport Officer | — | Core | Officer Operations |
| **UC-28** | Scrutinize Uploaded Proof Documents | Passport Officer | Storage Engine | Core | Officer Operations |
| **UC-29** | Verify Document Proofs (Counter B) | Passport Officer | — | Core | Officer Operations |
| **UC-30** | Request Citizen Clarification / Correction | Passport Officer | Notification Gateway, FSM Engine | Core | Officer Operations |
| **UC-31** | Transmit Dossier to Police Station | Passport Officer | FSM Engine | Core | Officer Operations |
| **UC-32** | Review Police Verification Report (PVR) | Passport Officer | — | Core | Officer Operations |
| **UC-33** | Grant Passport Application Approval (Counter C)| Passport Officer | FSM Engine | Core | Officer Operations |
| **UC-34** | Reject Application under Passports Act Sec 6 | Passport Officer | FSM Engine | Core | Officer Operations |
| **UC-35** | Queue Booklet for Security Printing | Passport Officer | FSM Engine | Core | Issuance & Dispatch |
| **UC-36** | Dispatch Booklet via India Post Speed Post | Passport Officer | India Post API, Email Gateway | Core | Issuance & Dispatch |
| **UC-37** | View Assigned Police Enquiry Queue | Police Authority | — | Core | Police Verification |
| **UC-38** | Conduct Address & Field Reference Enquiry | Police Authority | Applicant / References | Core | Police Verification |
| **UC-39** | Search Criminal Records in CCTNS Database | Police Authority | CCTNS Gateway | Core | Police Verification |
| **UC-40** | Submit Electronic Police Verification Report | Police Authority | FSM Engine | Core | Police Verification |
| **UC-41** | Administrator Login & Credential Verification | Administrator | Security Session Monitor | Administrative | Administrative Governance |
| **UC-42** | Monitor Operational Analytics & Health | Administrator | — | Administrative | Administrative Governance |
| **UC-43** | Manage User Accounts, Roles & Lockouts | Administrator | AuditLog Engine | Administrative | User Management |
| **UC-44** | Configure Passport Services Directory | Administrator | — | Administrative | Service Registry |
| **UC-45** | Manage PSK & POPSK Regional Centres | Administrator | — | Administrative | Centre Management |
| **UC-46** | Maintain Statutory Fee Schedules (GSR 516E) | Administrator | — | Administrative | Fee Configuration |
| **UC-47** | Publish & Manage Official Gazette Notices | Administrator | — | Administrative | Public Information |
| **UC-48** | Triage & Redress Citizen Grievance Tickets | Administrator | Email Gateway | Administrative | Grievance Administration |

---

## 2. Detailed Use Case Specifications for Major Core Workflows

---

### UC-08: Register Citizen Account

**Goal:** Allow an unregistered Indian citizen to create a secure personal profile on the Passport Automation System.
**Primary Actor:** Citizen / Applicant
**Supporting Actors:** Security / Captcha Validator, Transactional Email Service
**Trigger:** Citizen navigates to `/register` and clicks "Create Account".
**Preconditions:**
1. The citizen must have a valid, unique email address.
2. The user must not already have an active account with the submitted email.
**Postconditions:**
1. A new `User` record is created with `role = "APPLICANT"`, `isActive = true`, and `failedLoginAttempts = 0`.
2. A corresponding `Applicant` profile record is inserted within an atomic database transaction.
3. A welcome notification email is dispatched.
**Success Guarantee:** The citizen account is persisted in the database, and the user is redirected to the login interface with a success toast.

**Main Success Scenario:**
1. Citizen accesses the Registration page (`/register`).
2. System presents registration form requiring Full Name, Email, Phone Number, Password, Confirm Password, and a dynamic Captcha challenge.
3. Citizen completes all mandatory fields, answers the Captcha challenge, and clicks "Register".
4. System validates inputs client-side using Zod schema (checks email format, phone digits, password complexity).
5. System transmits `POST /api/auth/register` with form payload and Captcha token.
6. Server validates the Captcha token against the security validator.
7. Server checks `User.findUnique({ where: { email } })` to confirm non-existence.
8. Server hashes the plaintext password using salted bcrypt (10 rounds).
9. Server executes a database `$transaction` creating the `User` and `Applicant` records.
10. System dispatches a welcome email via SMTP (`lib/email.ts`).
11. Server logs an `AuditLog` entry (`action: "USER_REGISTERED"`).
12. Server returns `201 Created`.
13. System redirects citizen to `/login` displaying confirmation message.

**Alternative Flows:**
- **A1: Citizen already registered with email:**
  - At step 7, server finds existing user record.
  - Server returns `409 Conflict ("Email address already registered")`.
  - Client displays an alert banner advising user to log in or use password recovery.

**Exception Flows:**
- **E1: Captcha Verification Failure:**
  - At step 6, submitted Captcha answer is incorrect.
  - Server returns `400 Bad Request ("Invalid Captcha challenge")`.
  - Client refreshes Captcha challenge and prompts citizen to re-enter.
- **E2: Network or Database Connection Outage:**
  - At step 9, database transaction fails.
  - System aborts transaction, returns `500 Internal Server Error`, and prompts user to retry.

**Business Rules:**
- Password must be at least 8 characters and contain at least one uppercase letter, one number, and one special symbol.
- Accounts are created with `role = "APPLICANT"` by default.

---

### UC-11: Initiate Passport Application (Fresh / Re-issue)

**Goal:** Enable an authenticated citizen to create, populate, and submit an electronic passport application dossier.
**Primary Actor:** Citizen / Applicant
**Supporting Actors:** FSM State Engine (`lib/fsm.ts`), Statutory Fee Calculation Engine
**Trigger:** Applicant clicks "Apply for Fresh Passport / Re-issue" on `/applicant/dashboard`.
**Preconditions:**
1. Applicant must be authenticated with active `APPLICANT` session.
2. Applicant profile record must exist.
**Postconditions:**
1. A new `Application` entity is created with unique ARN (`ARN-YYYY-XXXXXX`).
2. Application state is initialized to `DRAFT` or transitions to `SUBMITTED` $\rightarrow$ `PAYMENT_PENDING`.
3. Initial `ApplicationStatusHistory` record is logged.
**Success Guarantee:** The application dossier is saved in the database with a unique ARN and calculated fee.

**Main Success Scenario:**
1. Applicant navigates to `/applicant/application`.
2. System loads the 7-step Application Wizard:
   - *Step 1:* Service Type (Fresh vs Re-issue), Scheme (Normal vs Tatkaal), Booklet Size (36 vs 60 pages).
   - *Step 2:* Applicant Personal Particulars (givenName, surname, DOB, place of birth, marital status, Aadhaar, PAN).
   - *Step 3:* Family Particulars (Father, Mother, Spouse, Legal Guardian).
   - *Step 4:* Present & Permanent Address Particulars, Jurisdictional Police Station.
   - *Step 5:* Emergency Contact Particulars.
   - *Step 6:* Previous Passport Details (if Reissue) & grounds for re-issue.
   - *Step 7:* Statutory Disqualification Declarations (criminal proceedings, loss of passport).
3. Applicant completes all steps and clicks "Save and Review".
4. System validates all field constraints and displays consolidated review screen.
5. Applicant checks legal confirmation declaration and clicks "Submit Application".
6. System sends `POST /api/applicant/application`.
7. Server generates unique Application Reference Number (`ARN-2026-XXXXXX`).
8. Server invokes `canTransition("DRAFT", "SUBMITTED")` in `lib/fsm.ts` $\rightarrow$ validates `true`.
9. Server evaluates statutory fee via `FeeSchedule` (e.g., Normal 36-page Adult = ₹1,500; Tatkaal = ₹3,500).
10. Server executes atomic transaction:
    - Inserts `Application` with status `SUBMITTED`.
    - Inserts `ApplicationStatusHistory` (`fromStatus: "DRAFT"`, `toStatus: "SUBMITTED"`).
    - Updates status to `PAYMENT_PENDING`.
    - Inserts `ApplicationStatusHistory` (`fromStatus: "SUBMITTED"`, `toStatus: "PAYMENT_PENDING"`).
11. Server returns `201 Created` with ARN and statutory fee amount.
12. System renders Submission Confirmation card and prompts applicant to proceed to fee payment.

**Alternative Flows:**
- **A1: Applicant saves progress as draft:**
  - At step 3, applicant clicks "Save Draft".
  - System persists partial data with status `DRAFT` and `draftStep` index.
  - Applicant can resume editing later from dashboard.
- **A2: Minor applicant workflow:**
  - In Step 2, applicant enters DOB $\le$ 18 years.
  - System automatically sets `isMinor = true` and exposes mandatory parental consent declaration fields.

**Exception Flows:**
- **E1: Incomplete mandatory particulars:**
  - Client highlights defective fields and blocks submission until resolved.
- **E2: Statutory disqualification declared:**
  - If applicant ticks active criminal proceedings, system flags application dossier with `hasCriminalRecord = true` for mandatory senior officer scrutiny.

---

### UC-17: Settle Statutory Application Fee Online

**Goal:** Enable an applicant to pay the statutory passport fee online and unlock PSK appointment booking.
**Primary Actor:** Citizen / Applicant
**Supporting Actors:** Payment Gateway (SBI ePay / UPI / Bharatkosh simulation), Email Notification Service
**Trigger:** Applicant clicks "Pay Now" on `/applicant/payment`.
**Preconditions:**
1. Application must be in `PAYMENT_PENDING` status.
2. Statutory fee amount must be computed and greater than zero.
**Postconditions:**
1. A new `Payment` record is created with status `SUCCESS` and unique `transactionId`.
2. Application state advances from `PAYMENT_PENDING` $\rightarrow$ `PAYMENT_COMPLETED`.
3. Digital payment receipt is generated and emailed to the citizen.
4. PSK appointment reservation quota is unlocked.
**Success Guarantee:** Payment is recorded, state is updated to `PAYMENT_COMPLETED`, and receipt is issued.

**Main Success Scenario:**
1. Applicant views payment summary showing ARN, service type, base fee, and total payable amount.
2. Applicant selects payment mode (UPI, Net Banking, Credit/Debit Card) and clicks "Proceed to Payment".
3. Client dispatches `POST /api/applicant/payment` with `applicationId` and `paymentMethod`.
4. Server creates a `Payment` record with status `PENDING` and transaction reference `TXN-2026-XXXXXX`.
5. Server interfaces with the simulated payment gateway and returns a secure payment checkout session.
6. Applicant completes simulated payment authentication (UPI PIN / OTP).
7. Gateway returns signed payment confirmation callback (`status: "SUCCESS"`).
8. Server verifies transaction integrity signature.
9. Server calls `canTransition("PAYMENT_PENDING", "PAYMENT_COMPLETED")` $\rightarrow$ validates `true`.
10. Server executes atomic transaction:
    - Updates `Payment` status to `SUCCESS` with `paidAt = now()`.
    - Updates `Application` status to `PAYMENT_COMPLETED`.
    - Inserts `ApplicationStatusHistory` (`fromStatus: "PAYMENT_PENDING"`, `toStatus: "PAYMENT_COMPLETED"`, `remarks: "Statutory fee paid online"`).
11. Server triggers email notification with attached digital receipt.
12. Client displays Payment Success screen with "Download Receipt" and "Book Appointment" buttons.

**Alternative Flows:**
- **A1: Gateway timeout / payment decline:**
  - Gateway returns failure callback.
  - Server sets `Payment.status = "FAILED"`.
  - Application status moves to `PAYMENT_FAILED`.
  - Client displays retry button allowing applicant to attempt payment again.

---

### UC-20: Book PSK Appointment Slot

**Goal:** Allow an applicant with a paid application to reserve a physical time slot at a Passport Seva Kendra.
**Primary Actor:** Citizen / Applicant
**Supporting Actors:** PSK Capacity Manager, FSM Engine, Notification Service
**Trigger:** Applicant clicks "Schedule Appointment" on `/applicant/appointment`.
**Preconditions:**
1. Application must have status `PAYMENT_COMPLETED`.
2. The selected centre must have open appointment capacity for the chosen date.
**Postconditions:**
1. An `Appointment` record is created linking application, centre, date, and 15-minute time slot.
2. A serialized queue token (`TOK-A-XXX`) is generated.
3. Application status advances to `APPOINTMENT_BOOKED`.
4. Appointment acknowledgment slip with QR code is generated.
**Success Guarantee:** The PSK capacity slot is decremented by 1, appointment is confirmed, and appointment slip is issued.

**Main Success Scenario:**
1. Applicant selects regional PSK Centre from dynamic dropdown (`/api/centres`).
2. System queries `/api/applicant/appointment?centerId=...` and displays calendar with available dates.
3. Applicant selects a date; system renders 15-minute slot grid with real-time remaining capacity.
4. Applicant selects slot (e.g., "10:15 AM - 10:30 AM") and clicks "Book Appointment".
5. Client sends `POST /api/applicant/appointment`.
6. Server verifies application fee status is `PAYMENT_COMPLETED`.
7. Server locks slot atomically and checks booked count against `PassportCenter.slotCapacity`.
8. Server generates serialized token (e.g., `TOK-A-108`).
9. Server validates FSM transition: `canTransition("PAYMENT_COMPLETED", "APPOINTMENT_BOOKED")`.
10. Server executes database transaction:
    - Inserts `Appointment` record with status `BOOKED`.
    - Updates `Application` status to `APPOINTMENT_BOOKED`.
    - Inserts `ApplicationStatusHistory` (`fromStatus: "PAYMENT_COMPLETED"`, `toStatus: "APPOINTMENT_BOOKED"`).
11. Server sends SMS/Email appointment confirmation with reporting instructions.
12. Client renders printable Appointment Slip containing barcode, reporting time, and mandatory document checklist.

**Alternative Flows:**
- **A1: Selected slot fills concurrently:**
  - Server detects capacity limit reached during locking.
  - Server returns `409 Conflict ("Selected slot is fully booked. Please select another slot.")`.
  - Client refreshes slot grid and prompts user to pick an alternate time.

---

### UC-28: Scrutinize Uploaded Proof Documents (Counter B)

**Goal:** Enable a Passport Verifying Officer to scrutinize uploaded digital KYC proofs against physical original certificates.
**Primary Actor:** Passport Officer
**Supporting Actors:** Document Storage Service, FSM Engine, Notification Service
**Trigger:** Officer selects an application from the scrutiny queue on `/officer/dashboard`.
**Preconditions:**
1. Officer must be authenticated with `OFFICER` role.
2. Application must be in `DOCUMENT_VERIFICATION` status (citizen checked in at PSK Counter A).
**Postconditions:**
1. Each inspected document is marked `VERIFIED` or `CORRECTION_REQUIRED`.
2. If all mandatory proofs are approved, application transitions to `DOCUMENT_VERIFIED`.
3. If defects exist, application transitions to `CLARIFICATION_REQUIRED`.
**Success Guarantee:** All proof documents are stamped with officer ID and verification status.

**Main Success Scenario:**
1. Officer opens application dossier by ARN.
2. System displays applicant biographical details alongside uploaded document gallery.
3. For each document (Address Proof, DOB Proof, Non-ECR Certificate):
   - Officer inspects digital preview via secure signed URL (`/api/documents/[docId]/signed-url`).
   - Officer compares digital particulars with original certificates presented at Counter B desk.
   - Officer clicks "Verify & Approve Document".
   - System updates `Document.verificationStatus = "VERIFIED"` and records `verifiedBy = officerId`.
4. Once all mandatory proofs are marked `VERIFIED`, officer clicks "Finalize Document Scrutiny".
5. Officer submits biometric confirmation (photo and fingerprints captured).
6. Server validates transition: `canTransition("DOCUMENT_VERIFICATION", "DOCUMENT_VERIFIED")`.
7. Server updates `Application.status = "DOCUMENT_VERIFIED"`.
8. Server automatically triggers police verification routing (`POLICE_VERIFICATION_PENDING`) and creates a pending `PoliceReport` docket.
9. System logs `ApplicationStatusHistory` and returns exit token to citizen.

**Alternative Flows:**
- **A1: Document deficient, forged, or mismatched:**
  - Officer clicks "Flag Correction Required" on a specific document.
  - Officer enters detailed defect reason (e.g., "Electricity bill older than 3 months; submit Aadhaar or Bank passbook").
  - System updates `Document.verificationStatus = "CORRECTION_REQUIRED"`.
  - Officer clicks "Issue Clarification Notice".
  - Server transitions application to `CLARIFICATION_REQUIRED`.
  - System dispatches automated SMS/Email alert to applicant with instructions to re-upload proofs.

---

### UC-40: Submit Electronic Police Verification Report (PVR)

**Goal:** Allow a jurisdictional police officer to record field enquiry findings, criminal background check results, and submit an official PVR.
**Primary Actor:** Police Authority
**Supporting Actors:** CCTNS Database Gateway, FSM Engine
**Trigger:** Police officer clicks "Submit PVR" on `/police/dashboard`.
**Preconditions:**
1. Police officer must be authenticated with role `POLICE`.
2. Application must be assigned to officer's station code in `POLICE_VERIFICATION_PENDING` / `IN_PROGRESS`.
**Postconditions:**
1. `PoliceReport` record is updated with findings and final clearance status (`CLEARED` or `ADVERSE`).
2. Application status advances to `POLICE_VERIFICATION_COMPLETED`.
3. Application dossier is routed to Granting Officer (Counter C) review queue.
**Success Guarantee:** Signed PVR docket is attached to application dossier and transmitted to RPO.

**Main Success Scenario:**
1. Police officer accesses assigned enquiries on `/police/dashboard`.
2. Officer selects application dossier and reviews applicant residential address and family particulars.
3. Officer conducts physical site visit to address and interviews two local referees.
4. Officer queries CCTNS / state crime records for criminal proceedings or pending non-bailable warrants.
5. Officer opens PVR Submission Form:
   - Sets `addressVerified = true`.
   - Sets `applicantMet = true`.
   - Sets `stayDurationYears = 3`.
   - Sets `criminalRecord = false`.
   - Sets `citizenshipVerified = true`.
   - Enters field officer name, rank, and station remarks: "Local enquiries confirm good character and bona fide continuous residence."
6. Officer selects recommendation: "Favourable / Clear (CLEARED)" and clicks "Submit PVR".
7. Client posts payload to `/api/police/report`.
8. Server verifies officer station jurisdiction.
9. Server validates FSM transition: `canTransition("POLICE_VERIFICATION_PENDING", "POLICE_VERIFICATION_COMPLETED")`.
10. Server executes database transaction:
    - Updates `PoliceReport` with findings, `clearanceStatus = "CLEARED"`, and `verifiedAt = now()`.
    - Updates `Application.status = "POLICE_VERIFICATION_COMPLETED"`.
    - Inserts `ApplicationStatusHistory` (`fromStatus: "POLICE_VERIFICATION_PENDING"`, `toStatus: "POLICE_VERIFICATION_COMPLETED"`, `remarks: "Clear PVR received from station"`).
11. Server advances application to Counter C Granting Officer queue (`OFFICER_REVIEW`).
12. System returns confirmation and removes enquiry from active police station queue.

**Alternative Flows:**
- **A1: Adverse report (Criminal record or false address detected):**
  - In step 5, officer marks `criminalRecord = true` or `addressVerified = false`.
  - Officer enters FIR number, sections of law, and detailed adverse remarks.
  - Officer submits recommendation as `ADVERSE`.
  - Server sets `PoliceReport.clearanceStatus = "ADVERSE"`.
  - Application transitions to `POLICE_VERIFICATION_COMPLETED` with an adverse flag.
  - Case is escalated to Granting Officer for statutory show-cause notice or refusal under Section 6(2) of the Passports Act.

---

### UC-33: Grant Passport Application Approval (Counter C)

**Goal:** Enable a Senior Passport Granting Officer to perform final statutory scrutiny under the Passports Act, 1967, approve passport issuance, and assign a unique passport number.
**Primary Actor:** Passport Officer (Granting Officer)
**Supporting Actors:** FSM Engine, Passport Booklet Generator
**Trigger:** Officer clicks "Approve & Grant Passport" on `/officer/dashboard`.
**Preconditions:**
1. Application must be in `OFFICER_REVIEW` or `POLICE_VERIFICATION_COMPLETED`.
2. Counter B document verification must be `VERIFIED`.
3. PVR must be evaluated (or applicant qualifies for Tatkaal post-police issuance).
**Postconditions:**
1. Application state advances to `APPROVED`.
2. A new `Passport` record is created with an 8-character alphanumeric passport number (`PXXXXXXX`).
3. Application enters the security booklet manufacturing queue (`PRINTING`).
**Success Guarantee:** Application is legally granted, unique passport number is assigned, and booklet printing is initiated.

**Main Success Scenario:**
1. Granting Officer reviews applicant dossier, Counter B officer verification checklist, and Police Verification Report.
2. Officer confirms applicant is not disqualified under Section 6 of the Passports Act, 1967.
3. Officer clicks "Approve & Grant Passport".
4. Server generates unique passport number (e.g., `P9041285`).
5. Server computes 10-year validity dates (`issueDate = now()`, `expiryDate = now() + 10 years`).
6. Server validates transition: `canTransition("OFFICER_REVIEW", "APPROVED")`.
7. Server executes database transaction:
    - Inserts `Passport` record with `passportNumber`, dates, and `dispatchStatus = "PRINTING"`.
    - Updates `Application.status = "APPROVED"`.
    - Inserts `ApplicationStatusHistory` (`fromStatus: "OFFICER_REVIEW"`, `toStatus: "APPROVED"`, `remarks: "Application approved by Granting Officer"`).
    - Transitions `Application.status = "PRINTING"`.
    - Inserts `ApplicationStatusHistory` (`fromStatus: "APPROVED"`, `toStatus: "PRINTING"`, `remarks: "Queued for security laser printing"`).
8. Server sends congratulations notification to applicant.
9. System displays confirmation badge and routes dossier to printing manager.

**Alternative Flows:**
- **A1: Statutory Disqualification / Rejection:**
  - In step 2, officer finds statutory disqualification (e.g., suppressed criminal conviction or citizenship doubt).
  - Officer enters detailed refusal order citing Section 6.
  - Officer clicks "Reject Application".
  - System sets `Application.status = "REJECTED"` and records `rejectionReason`.
  - System logs refusal in `ApplicationStatusHistory` and notifies citizen.

---

### UC-06: Track Application Status by ARN (Public Tracking)

**Goal:** Allow a citizen or public visitor to query real-time passport processing milestones using an ARN and Date of Birth without requiring login credentials.
**Primary Actor:** Public User / Applicant
**Supporting Actors:** Security / Captcha Service, India Post Logistics API
**Trigger:** Citizen accesses `/track`, enters details, and clicks "Track Status".
**Preconditions:** None (Publicly available).
**Postconditions:** System displays the current lifecycle milestone, status history, and postal tracking data.
**Success Guarantee:** The exact application stage and Speed Post consignment details are rendered.

**Main Success Scenario:**
1. Citizen navigates to `/track`.
2. Citizen enters Application Reference Number (e.g., `ARN-2026-004218`), Date of Birth (`1995-08-14`), and solves Captcha.
3. Client dispatches `GET /api/track?arn=...&dob=...&captcha=...`.
4. Server validates Captcha challenge.
5. Server queries `Application` matching ARN and Applicant DOB, including `statusHistory` and `passport`.
6. Server maps internal FSM status to 7-stage citizen progress milestone:
   - Stage 1: Application Submitted & Fee Paid
   - Stage 2: PSK Appointment Scheduled
   - Stage 3: PSK Document Scrutiny Completed
   - Stage 4: Police Verification Cleared
   - Stage 5: Granting Officer Evaluation
   - Stage 6: Security Booklet Printing
   - Stage 7: Dispatched via Speed Post / Delivered
7. If application is `DISPATCHED`, server interfaces with simulated India Post API to retrieve latest transit scans.
8. Server returns `200 OK` with milestone data, history entries, and postal consignment status.
9. Client renders interactive visual stepper, timeline of past actions, and Speed Post tracking card.

**Alternative Flows:**
- **A1: Record not found:**
  - If no record matches ARN and DOB, server returns `404 Not Found`.
  - Client displays banner: "No application found matching the provided ARN and Date of Birth. Please verify credentials."
