# Class-Responsibility-Collaborator (CRC) Cards

## 1. CRC Methodology and Academic Purpose

The **Class-Responsibility-Collaborator (CRC) Modeling technique** (pioneered by Ward Cunningham and Kent Beck) is an established object-oriented design methodology used to divide a complex system into manageable abstractions, delineate their behavioral obligations, and determine the message-passing pathways between collaborating entities.

Each CRC Card encapsulates three fundamental facets:
1. **Class Name:** The distinct conceptual domain entity.
2. **Responsibilities:** The high-level behavioral obligations, business rules, and state knowledge maintained by the class.
3. **Collaborators:** The other domain classes with which this class must interact to fulfill its obligations.

---

## 2. Individual CRC Indexing Cards

-------------------------------------------------------------------------
### CRC CARD 01: User
**Class:** `User`
**Package / Layer:** Security & Authentication Layer

**Responsibilities:**
1. Maintain system-wide user credentials, unique email identity, and username.
2. Enforce Role-Based Access Control (RBAC) across APPLICANT, OFFICER, POLICE, and ADMIN.
3. Track failed authentication attempts and enforce automated 30-minute account lockouts after 5 consecutive failures.
4. Record last login timestamps and account active/deactivated lifecycle states.
5. Provide navigation access to linked polymorphic role profiles.

**Collaborators:**
- `Applicant`
- `PassportOfficer`
- `Police`
- `Admin`
- `LoginHistory`
- `AuditLog`
- `Notification`
- `PasswordResetToken`
-------------------------------------------------------------------------

-------------------------------------------------------------------------
### CRC CARD 02: Applicant
**Class:** `Applicant`
**Package / Layer:** Citizen Profile & Biographical Layer

**Responsibilities:**
1. Encapsulate permanent citizen demographic information (Full Name, Date of Birth, Gender, Place of Birth, Address).
2. Maintain foreign key association to the parent authenticated `User`.
3. Act as the primary initiator for one or more passport service applications.
4. Maintain ownership of all submitted citizen dossiers and grievance tickets.

**Collaborators:**
- `User`
- `Application`
- `Document`
- `Appointment`
- `Grievance`
-------------------------------------------------------------------------

-------------------------------------------------------------------------
### CRC CARD 03: Application
**Class:** `Application`
**Package / Layer:** Transactional Core / Domain Engine

**Responsibilities:**
1. Serve as the central transactional aggregate root for all passport processing workflows.
2. Maintain unique Application Reference Number (ARN) (`ARN-YYYY-XXXXXX`).
3. Store service scheme parameters (Fresh vs Re-issue, Normal vs Tatkaal, 36 vs 60 pages).
4. Persist multi-step form fields (Personal, Family, Present Address, Emergency Contact, Previous Passport, Statutory Disqualification Declarations).
5. Enforce deterministic state transitions using the 37-state Finite State Machine (`lib/fsm.ts`).
6. Enforce minor parental consent rules and expedite Tatkaal processing flags.
7. Record officer clarification demands, citizen responses, and formal rejection grounds under Section 6 of the Passports Act, 1967.

**Collaborators:**
- `Applicant`
- `PassportOfficer`
- `Document`
- `Appointment`
- `Payment`
- `PoliceReport`
- `Passport`
- `ApplicationStatusHistory`
- `FeeSchedule`
-------------------------------------------------------------------------

-------------------------------------------------------------------------
### CRC CARD 04: ApplicationStatusHistory
**Class:** `ApplicationStatusHistory`
**Package / Layer:** Audit & Regulatory Compliance Layer

**Responsibilities:**
1. Maintain an immutable, append-only historical audit trail of all lifecycle state transitions.
2. Record initial (`fromStatus`) and target (`toStatus`) state milestones.
3. Capture exact timestamp, actor identifier, system role, and regulatory remarks for each transition.
4. Provide structured historical datasets for public ARN progress tracking and administrative audits.

**Collaborators:**
- `Application`
- `User`
- `PassportOfficer`
- `Police`
-------------------------------------------------------------------------

-------------------------------------------------------------------------
### CRC CARD 05: Document
**Class:** `Document`
**Package / Layer:** Evidence & KYC Scrutiny Layer

**Responsibilities:**
1. Maintain metadata for scanned citizen proof attachments (Address proof, DOB certificate, Non-ECR proof, Annexures).
2. Store file properties (filename, MIME type, file size, encrypted storage path / signed URL).
3. Track proof scrutiny lifecycle (`UPLOADED` $\rightarrow$ `PENDING` $\rightarrow$ `VERIFIED` / `CORRECTION_REQUIRED` / `REJECTED`).
4. Record verifying officer ID, inspection timestamp, and defect correction instructions.

**Collaborators:**
- `Application`
- `PassportOfficer`
- `Applicant`
-------------------------------------------------------------------------

-------------------------------------------------------------------------
### CRC CARD 06: Appointment
**Class:** `Appointment`
**Package / Layer:** Logistics & PSK Capacity Management Layer

**Responsibilities:**
1. Manage physical appointment bookings at designated Passport Seva Kendras (PSK/POPSK).
2. Associate booked application with specific date, 15-minute time slot, and operational centre.
3. Generate and assign serialized physical PSK arrival queue tokens (e.g., `TOK-A-108`).
4. Enforce statutory slot rescheduling limits (maximum 3 modifications allowed per application).
5. Track appointment lifecycle status (`BOOKED`, `CHECKED_IN`, `COMPLETED`, `RESCHEDULED`, `CANCELLED`, `NO_SHOW`).

**Collaborators:**
- `Application`
- `PassportCenter`
- `AppointmentHistory`
- `Applicant`
-------------------------------------------------------------------------

-------------------------------------------------------------------------
### CRC CARD 07: AppointmentHistory
**Class:** `AppointmentHistory`
**Package / Layer:** Appointment Rescheduling Audit Layer

**Responsibilities:**
1. Record previous and newly requested appointment dates and time slots upon reschedule events.
2. Track timestamp, initiating actor, and justification reason for appointment modifications.
3. Prevent quota gaming and unauthorized excess slot hoarding.

**Collaborators:**
- `Appointment`
- `Application`
- `Applicant`
-------------------------------------------------------------------------

-------------------------------------------------------------------------
### CRC CARD 08: Payment
**Class:** `Payment`
**Package / Layer:** Financial Settlement Layer

**Responsibilities:**
1. Capture financial transaction details for statutory passport application fees.
2. Maintain unique transaction reference identifiers (`TXN-YYYY-XXXXXX`).
3. Differentiate between statutory base fee, Tatkaal surcharges, and age-based statutory discounts.
4. Track payment settlement states (`PENDING`, `SUCCESS`, `FAILED`) and payment modes (UPI, Net Banking, Card).
5. Provide verification proofs required to unlock PSK appointment booking quotas.

**Collaborators:**
- `Application`
- `FeeSchedule`
- `Applicant`
- `Notification`
-------------------------------------------------------------------------

-------------------------------------------------------------------------
### CRC CARD 09: PoliceReport
**Class:** `PoliceReport`
**Package / Layer:** Law Enforcement & Field Verification Layer

**Responsibilities:**
1. Serve as the official electronic Police Verification Report (PVR) dossier.
2. Link verification case to jurisdictional police station and assigned field officer.
3. Record findings on applicant physical presence, address genuineness, continuous stay duration, and citizenship.
4. Document criminal background search outcomes against local FIR records and the national CCTNS database.
5. Formulate final clearance recommendation (`CLEARED`, `ADVERSE`, `CLARIFICATION_REQUIRED`) with statutory remarks.

**Collaborators:**
- `Application`
- `Police`
- `PassportOfficer`
-------------------------------------------------------------------------

-------------------------------------------------------------------------
### CRC CARD 10: Passport
**Class:** `Passport`
**Package / Layer:** Travel Document Issuance & Postal Logistics Layer

**Responsibilities:**
1. Represent the issued sovereign travel document.
2. Generate and store unique 8-character alphanumeric passport booklet numbers (`PXXXXXXX`).
3. Record statutory issue date and calculated 10-year validity expiry date (or 5 years for minors).
4. Track manufacturing and delivery states (`PRINTING`, `READY`, `DISPATCHED`, `DELIVERED`).
5. Maintain India Post Speed Post consignment tracking numbers (`INxxxxxxxxxxTRK`) for transit monitoring.

**Collaborators:**
- `Application`
- `PassportOfficer`
- `Applicant`
- `Notification`
-------------------------------------------------------------------------

-------------------------------------------------------------------------
### CRC CARD 11: PassportOfficer
**Class:** `PassportOfficer`
**Package / Layer:** Departmental Authority Layer

**Responsibilities:**
1. Maintain officer badge identifier, employee code, and assigned RPO/PSK branch location.
2. Inspect application queues and execute Counter B document scrutiny on uploaded proofs.
3. Issue defect correction notices or request formal applicant clarifications.
4. Route dossiers to police verification or process Tatkaal post-police exemptions.
5. Perform Counter C Granting Officer evaluation under Section 6 of the Passports Act 1967.
6. Authorize booklet printing and record India Post dispatch tracking consignment details.

**Collaborators:**
- `User`
- `Application`
- `Document`
- `PoliceReport`
- `Passport`
- `Notification`
-------------------------------------------------------------------------

-------------------------------------------------------------------------
### CRC CARD 12: Police
**Class:** `Police`
**Package / Layer:** Jurisdictional Police Department Layer

**Responsibilities:**
1. Maintain police station code, district jurisdiction, and officer badge credentials.
2. Query pending police verification requests routed from regional passport offices.
3. Conduct address visits, neighbor interviews, and local crime record inspections.
4. Prepare and submit authenticated electronic Police Verification Reports (PVR).

**Collaborators:**
- `User`
- `PoliceReport`
- `Application`
-------------------------------------------------------------------------

-------------------------------------------------------------------------
### CRC CARD 13: Admin
**Class:** `Admin`
**Package / Layer:** Governance & System Administration Layer

**Responsibilities:**
1. Hold elevated administrative authorization credentials.
2. Oversee system health, service metrics, and end-to-end processing throughput.
3. Manage user accounts, role promotions, and security lockouts.
4. Maintain master registries: PSK centres, statutory fee schedules, and public notices.
5. Triage and assign citizen grievance redressal tickets.

**Collaborators:**
- `User`
- `Application`
- `PassportCenter`
- `FeeSchedule`
- `Notice`
- `Grievance`
- `AuditLog`
-------------------------------------------------------------------------

-------------------------------------------------------------------------
### CRC CARD 14: PassportCenter
**Class:** `PassportCenter`
**Package / Layer:** Infrastructure & Regional PSK Directory Layer

**Responsibilities:**
1. Maintain official master records for RPOs, PSKs, and Post Office PSKs (POPSK).
2. Store physical address, jurisdictional districts, pincodes, and operational hours.
3. Enforce daily appointment capacities and slot distribution quotas (e.g., 200 daily applicants, 20 per 15-min window).
4. Provide search and lookup APIs for citizen centre locator utilities.

**Collaborators:**
- `Appointment`
- `Admin`
- `Application`
-------------------------------------------------------------------------

-------------------------------------------------------------------------
### CRC CARD 15: PassportService
**Class:** `PassportService`
**Package / Layer:** Citizen Services Directory Layer

**Responsibilities:**
1. Store catalog of supported passport services (Fresh, Re-issue, Tatkaal, PCC, Diplomatic).
2. Define eligibility rules, baseline validity periods, and expected processing timelines.
3. Maintain structured JSON checklists of required KYC documents and step-by-step guidance.
4. Provide dynamic database-driven content for public services discovery.

**Collaborators:**
- `Application`
- `FeeSchedule`
- `Admin`
-------------------------------------------------------------------------

-------------------------------------------------------------------------
### CRC CARD 16: FeeSchedule
**Class:** `FeeSchedule`
**Package / Layer:** Statutory Gazette Pricing Rules Layer

**Responsibilities:**
1. Model official Gazette GSR 516(E) statutory passport fee structures.
2. Determine fee rates based on service type, scheme (Normal vs Tatkaal), booklet size (36 vs 60), and age bracket.
3. Apply statutory fee concessions (10% rebate for fresh minors $\le$ 8 years and senior citizens $\ge$ 60 years).
4. Supply dynamic pricing inputs to the public fee calculator and payment gateway.

**Collaborators:**
- `PassportService`
- `Application`
- `Payment`
- `Admin`
-------------------------------------------------------------------------

-------------------------------------------------------------------------
### CRC CARD 17: Notice
**Class:** `Notice`
**Package / Layer:** Public Communications & Gazette Notifications Layer

**Responsibilities:**
1. Store official circulars, passport mela announcements, operational advisories, and gazette notices.
2. Support content taxonomy, priority tagging (NORMAL, IMPORTANT, CRITICAL), and pinned status.
3. Filter announcements by year (2025, 2026), affected PSK centre, and jurisdiction.
4. Support administrative publishing, scheduling, archiving, and batch CSV/JSON importation.

**Collaborators:**
- `NoticeCategory`
- `Admin`
- `User`
-------------------------------------------------------------------------

-------------------------------------------------------------------------
### CRC CARD 18: Grievance
**Class:** `Grievance`
**Package / Layer:** Citizen Redressal & Helpdesk Layer

**Responsibilities:**
1. Manage citizen complaint tickets (`GRV-YYYY-XXXXX`) regarding delays, PSK issues, or dispatch queries.
2. Track resolution lifecycle (`OPEN` $\rightarrow$ `IN_REVIEW` $\rightarrow$ `RESPONDED` $\rightarrow$ `RESOLVED` $\rightarrow$ `CLOSED`).
3. Store officer investigation remarks, resolution timestamps, and citizen satisfaction ratings.

**Collaborators:**
- `User`
- `Application`
- `Admin`
- `Applicant`
-------------------------------------------------------------------------

-------------------------------------------------------------------------
### CRC CARD 19: Notification
**Class:** `Notification`
**Package / Layer:** Communication & Messaging Layer

**Responsibilities:**
1. Maintain personalized transactional alerts for citizens (payment success, appointment booked, dispatched).
2. Track read/unread status, alert urgency types (INFO, SUCCESS, WARNING, ALERT), and timestamps.

**Collaborators:**
- `User`
- `Application`
- `Payment`
- `Appointment`
- `Passport`
-------------------------------------------------------------------------

-------------------------------------------------------------------------
### CRC CARD 20: AuditLog
**Class:** `AuditLog`
**Package / Layer:** Enterprise Governance & Security Audit Layer

**Responsibilities:**
1. Capture security-critical actions (LOGIN, ROLE_CHANGE, STATUS_OVERRIDE, SESSION_REVOKE).
2. Record IP address, user-agent string, affected entity ID, JSON details payload, and timestamp.
3. Provide unalterable compliance logs for administrative forensic investigation.

**Collaborators:**
- `User`
- `Admin`
-------------------------------------------------------------------------

---

## 3. Consolidated CRC Cards Table

| Class | Key Responsibilities | Primary Collaborators |
| :--- | :--- | :--- |
| **`User`** | Credential management, RBAC enforcement, lockout tracking, session linkage. | `Applicant`, `PassportOfficer`, `Police`, `Admin`, `AuditLog`, `LoginHistory` |
| **`Applicant`** | Citizen biographical particulars, application ownership, grievance initiation. | `User`, `Application`, `Document`, `Appointment`, `Grievance` |
| **`Application`** | Core transactional aggregate root, multi-step dossier fields, FSM lifecycle enforcement, fee association. | `Applicant`, `PassportOfficer`, `Document`, `Appointment`, `Payment`, `PoliceReport`, `Passport`, `ApplicationStatusHistory` |
| **`ApplicationStatusHistory`** | Immutable append-only transition ledger, timestamps, actor audit trail. | `Application`, `User`, `PassportOfficer`, `Police` |
| **`Document`** | Digital KYC proof metadata, storage URI management, verification status lifecycle. | `Application`, `PassportOfficer`, `Applicant` |
| **`Appointment`** | PSK slot capacity allocation, queue token issuance, rescheduling limit enforcement. | `Application`, `PassportCenter`, `AppointmentHistory`, `Applicant` |
| **`AppointmentHistory`** | Rescheduling audit trail, slot adjustment tracking, quota protection. | `Appointment`, `Application`, `Applicant` |
| **`Payment`** | Statutory fee collection, transaction ID logging, gateway verification, receipt generation. | `Application`, `FeeSchedule`, `Applicant`, `Notification` |
| **`PoliceReport`** | Electronic PVR dossier, field enquiry findings, CCTNS criminal checks, clearance recommendations. | `Application`, `Police`, `PassportOfficer` |
| **`Passport`** | Booklet number allocation (`PXXXXXXX`), statutory validity calculation, Speed Post consignment tracking. | `Application`, `PassportOfficer`, `Applicant`, `Notification` |
| **`PassportOfficer`** | Counter B document scrutiny, clarification requests, Counter C granting approval, dispatch authorization. | `User`, `Application`, `Document`, `PoliceReport`, `Passport` |
| **`Police`** | Jurisdictional queue inspection, physical field visits, crime record checks, PVR submission. | `User`, `PoliceReport`, `Application` |
| **`Admin`** | Master data management, user role assignments, fee schedules, centre capacities, grievance resolution. | `User`, `Application`, `PassportCenter`, `FeeSchedule`, `Notice`, `Grievance`, `AuditLog` |
| **`PassportCenter`** | Regional PSK/POPSK directory, operating hours, daily slot quota enforcement. | `Appointment`, `Admin`, `Application` |
| **`PassportService`** | Dynamic catalog of citizen services, eligibility criteria, document checklists, processing times. | `Application`, `FeeSchedule`, `Admin` |
| **`FeeSchedule`** | GSR 516(E) statutory fee calculation rules, Tatkaal surcharges, age-based discount percentages. | `PassportService`, `Application`, `Payment`, `Admin` |
| **`Notice`** | Official circulars, gazette notifications, multi-year filtering, batch CSV/JSON importation. | `NoticeCategory`, `Admin`, `User` |
| **`Grievance`** | Citizen helpdesk tickets, investigation tracking, resolution logging, satisfaction feedback. | `User`, `Application`, `Admin`, `Applicant` |
| **`Notification`** | Real-time user transactional alerts, payment receipts, appointment reminders, dispatch notifications. | `User`, `Application`, `Payment`, `Appointment`, `Passport` |
| **`AuditLog`** | Forensic security tracking, IP address logging, role modification tracking, system session audits. | `User`, `Admin` |
| **`LoginHistory`** | Session security monitoring, authentication timestamp logging, administrative session revocation. | `User`, `Admin` |
| **`PasswordResetToken`** | Cryptographic token generation, expiration enforcement, single-use password recovery. | `User` |
| **`NoticeCategory`** | Public advisory classification taxonomy and ordering. | `Notice`, `Admin` |
| **`AdminInvitation`** | Tokenized onboarding invitation links for new administrative personnel. | `Admin`, `User` |
| **`SystemSetting`** | Global portal key-value configuration flags and operational parameters. | `Admin` |
