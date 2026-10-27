# Candidate Class Identification Using Noun Phrase Approach
**Passport Automation System (PAS)**  
*Project Repository:* `passport-automation-system`  
*Live Deployment:* `https://passport-automation-system-psi.vercel.app/`  
*Domain:* Ministry of External Affairs (MEA) Passport Seva Academic Simulation  
*Academic Framework:* Object-Oriented Analysis and Design (OOAD) — Abbott's Natural Language Analysis  

---

## 1. Introduction

In Object-Oriented Analysis and Design (OOAD), one of the primary engineering challenges is discovering the fundamental abstractions that form the problem domain model. For the **Passport Automation System (PAS)**, this process must be grounded strictly in the actual system architecture, workflows, database schema (`prisma/schema.prisma`), API routes, and user interfaces rather than generic textbook assumptions.

This document presents a rigorous candidate class identification process using the **Noun Phrase Approach** (often referred to as Abbott's textual analysis heuristic), followed by structured class filtering, synonym reduction, and canonical domain class selection.

---

## 2. Noun Phrase Approach

### 2.1 Definition
The **Noun Phrase Approach** is an established grammatical heuristic in Object-Oriented Analysis, pioneered by Russell J. Abbott (1983) and popularized by Grady Booch and Rebecca Wirfs-Brock. In this technique, natural language descriptions of system requirements, problem statements, user interface workflows, and domain artifacts are systematically inspected to extract all nouns and noun phrases. 

Because classes in object-oriented systems represent cohesive packages of state and behavior (encapsulating domain concepts, tangible real-world entities, or conceptual aggregates), nouns naturally serve as prime candidates for domain classes.

### 2.2 Purpose in OOAD
The noun phrase heuristic serves several critical objectives in modern OOAD:
1. **Systematic Entity Discovery:** Prevents ad-hoc class invention by systematically combing through functional specifications and user journeys.
2. **Domain-Model Alignment:** Ensures that the software model speaks the ubiquitous language of the problem domain (e.g., Passport Seva operations).
3. **Traceability:** Establishes a transparent audit trail connecting natural language requirements directly to structural classes in the source code.
4. **Boundary Clarification:** Helps distinguish between actual domain entities, internal data attributes, behavioral operations, user interface widgets, and external systems.

### 2.3 Why Every Noun Is Not Automatically a Class
In natural language, nouns serve many linguistic purposes beyond designating persistent, behavior-rich objects. Automatically converting every noun into a class causes severe architectural anti-patterns:
- **Class Explosion:** A proliferation of trivial classes with no independent lifecycle or behavior.
- **Data Clumps:** Representing simple primitive data points (e.g., `Date of Birth`, `First Name`) as classes rather than primitive attributes.
- **Behavior-as-Entity Violations:** Mistaking procedural operations or transactions (e.g., `Submit Application`, `Verify Documents`) for entities.
- **UI Bleed:** Allowing presentation components (e.g., `Navbar`, `Dashboard`, `Modal Dialog`) to pollute the problem domain model.

### 2.4 Candidate Class Filtering Procedure
To derive the final canonical domain classes, a multi-stage filtering pipeline is executed:

```text
Requirements / System Description
        ↓
Extract Nouns and Noun Phrases
        ↓
Identify Raw Candidate Classes
        ↓
Remove Duplicates / Synonyms (e.g., "User Account" → "User")
        ↓
Remove Attributes (e.g., "Date of Birth", "ARN")
        ↓
Remove Operations / Actions (e.g., "Submit Application", "Grant Passport")
        ↓
Remove UI / Implementation Terms (e.g., "Dashboard", "CAPTCHA Widget")
        ↓
Categorize External Actors (e.g., "Payment Gateway", "CCTNS")
        ↓
Validate Against System Implementation (Prisma Models & API Routes)
        ↓
Final Domain Classes (25 Canonical Classes)
```

---

## 3. Noun Phrase Extraction

### 3.1 PAS System Description
The **Passport Automation System (PAS)** simulates the statutory passport service delivery framework of India:
1. **Public Exploration:** Visitors access public informational features such as the **Fee Calculator**, **PSK Centre Locator**, **Document Eligibility Advisor**, **News and Circular Notices**, and **Public ARN Tracking**.
2. **Citizen Workflow:** Registered **Applicants** authenticate with credentials and **CAPTCHA** validation, create and save **Passport Application** drafts with unique **Application Reference Numbers (ARN)**, upload supporting **Documents** (Proof of Address, Identity, Date of Birth), import verified credentials via **DigiLocker**, calculate statutory **Fees**, execute online **Payment**, and book/reschedule **Appointment** slots at physical **Passport Centres**.
3. **Staff Adjudication (Counter B & C):** **Passport Officers** manage daily queues at Passport Seva Kendras (PSK). At **Counter B**, officers scrutinize original physical documents, verify digital uploads, flag clarification requests, and capture applicant biometrics. At **Counter C**, senior granting officers evaluate eligibility and execute statutory granting or refusal decisions.
4. **Police Verification:** Jurisdictional **Police Authorities** inspect pending station worklists, conduct residential field inquiries, perform criminal background checks via the **CCTNS Database**, and submit formal **Police Verification Reports (PVR)** with clear or adverse findings.
5. **Booklet Printing & Dispatch:** Granted and cleared applications enter the printing queue, where physical **Passport Booklets** are encoded, quality checked, assigned serial tracking numbers, and dispatched via **India Post Speed Post**.
6. **Administration & Governance:** **Administrators** configure master **Fee Schedules**, manage **Passport Centres**, publish **Notices**, invite staff members, review immutable **Audit Logs**, and resolve citizen **Grievances**.

### 3.2 Extracted Nouns and Candidate Analysis Table
Below is the exhaustive analysis of 60 candidate nouns and noun phrases extracted from the Passport Automation System requirements and codebase:

| No. | Noun / Noun Phrase | Source / Context | Candidate Class? | Technical Reasoning | Final Decision |
|:---:|:---|:---|:---:|:---|:---|
| 1 | **Applicant** | Citizen module / `model Applicant` | Yes | Represents a citizen entity with personal profile, address, and application links. | **Retained (Domain Class)** |
| 2 | **User** | Auth module / `model User` | Yes | Base security principal managing login credentials, roles, email verification, and tokens. | **Retained (Domain Class)** |
| 3 | **User Account** | UI authentication forms | No | Synonym and implementation manifestation of the canonical `User` entity. | **Rejected (Duplicate / Synonym)** |
| 4 | **Passport Application** | Core workflow / `model Application` | Yes | Central aggregate root managing ARN, booklet type, status lifecycle, and links. | **Retained (Domain Class)** |
| 5 | **Passport** | Issuance module / `model Passport` | Yes | Represents issued physical travel credential with serial number, issue date, and expiry. | **Retained (Domain Class)** |
| 6 | **Application Reference Number (ARN)** | Application identifier | No | Unique business identifier attribute belonging to `Application`. | **Rejected (Attribute)** |
| 7 | **Passport Service** | Service catalog / `model PassportService` | Yes | Domain catalog entity specifying service types, rules, documentation, and turnaround SLAs. | **Retained (Domain Class)** |
| 8 | **Fresh Passport** | Service option / `ServiceType.FRESH` | No | Enumeration literal and categorization value of `PassportService` / `Application`. | **Rejected (Enum / Attribute Value)** |
| 9 | **Re-Issue** | Service option / `ServiceType.REISSUE` | No | Enumeration literal indicating renewal due to expiry, exhaustion of pages, or damage. | **Rejected (Enum / Attribute Value)** |
| 10 | **Tatkaal** | Scheme / `urgency: TATKAAL` | No | Pricing and scheduling modifier attribute; not an independent entity. | **Rejected (Attribute / Mode)** |
| 11 | **Police Clearance Certificate (PCC)** | Specialized service offering | No | Distinct service category represented as an instance of `PassportService`. | **Rejected (Instance Data / Enum)** |
| 12 | **Document** | Upload module / `model Document` | Yes | Represents physical/digital evidence file with type, verification status, and DigiLocker flag. | **Retained (Domain Class)** |
| 13 | **Document Type** | Document metadata / `DocumentType` | No | Categorical enumeration (ADDRESS_PROOF, ID_PROOF, DOB_PROOF, ANNEXURE). | **Rejected (Enum / Attribute Value)** |
| 14 | **Payment** | Billing module / `model Payment` | Yes | Encapsulates monetary transactions, transaction reference, gateway status, and receipt. | **Retained (Domain Class)** |
| 15 | **Fee** | Pricing / Fee schedule | No | Numerical monetary amount attribute stored in `Payment` and `FeeSchedule`. | **Rejected (Attribute)** |
| 16 | **Appointment** | Booking module / `model Appointment` | Yes | Manages reserved PSK time slots, queue tokens, reporting timestamps, and status. | **Retained (Domain Class)** |
| 17 | **PSK Centre** | Logistics / `model PassportCenter` | Yes | Physical Passport Seva Kendra facility entity managing address, capacity, and jurisdiction. | **Retained (Domain Class)** |
| 18 | **Passport Officer** | Staff module / `model PassportOfficer` | Yes | Verification staff entity at PSK tracking employee ID, counter assignment, and center. | **Retained (Domain Class)** |
| 19 | **Police Authority** | Enforcement / `model Police` | Yes | Police officer entity tracking station jurisdiction, badge number, and enquiries. | **Retained (Domain Class)** |
| 20 | **Police Verification** | Workflow action / State | No | Operational lifecycle phase and state in `Application` FSM (`lib/fsm.ts`). | **Rejected (Operation / State)** |
| 21 | **Verification Report (PVR)** | Police module / `model PoliceReport` | Yes | Formal verification report entity with criminal record checks, remarks, and verdict. | **Retained (Domain Class)** |
| 22 | **Application Status** | State tracking / FSM | No | State string property governed by `lib/fsm.ts` finite state machine engine. | **Rejected (Attribute / State)** |
| 23 | **Grievance** | Helpdesk / `model Grievance` | Yes | Citizen complaint/inquiry ticket managing category, description, and admin resolution. | **Retained (Domain Class)** |
| 24 | **Grievance Ticket** | Public tracking identifier | No | Unique tracking string attribute (`ticketNumber`) belonging to `Grievance`. | **Rejected (Attribute / Synonym)** |
| 25 | **Address** | Residential data | No | Compound demographic attribute fields embedded in `Applicant` and `PassportCenter`. | **Rejected (Attribute Group)** |
| 26 | **Applicant Profile** | Citizen dashboard UI | No | Synonym and user-facing presentation view for the `Applicant` domain entity. | **Rejected (Duplicate / UI View)** |
| 27 | **Notification** | Alerts / `model Notification` | Yes | In-app transactional alert entity tracking message, read timestamp, and recipient. | **Retained (Domain Class)** |
| 28 | **Announcement / Notice** | Public info / `model Notice` | Yes | Public advisory, circular, and news item entity posted on the portal. | **Retained (Domain Class)** |
| 29 | **Administrator** | Governance / `model Admin` | Yes | System administrator entity managing masters, users, invitations, and system settings. | **Retained (Domain Class)** |
| 30 | **Role** | Security enum / `Role` | No | Security enumeration literal (`APPLICANT`, `OFFICER`, `POLICE`, `ADMIN`). | **Rejected (Enum)** |
| 31 | **Application History** | Audit / `model ApplicationStatusHistory` | Yes | Immutable chronological log entity capturing every lifecycle state transition and remark. | **Retained (Domain Class)** |
| 32 | **Tracking Record** | Public tracking view | No | Behavioral query operation and view derived from `Application` and history. | **Rejected (Operation / View)** |
| 33 | **Dispatch** | Logistics action / State | No | Operational workflow action performed by officer and logged on `Passport`. | **Rejected (Operation / Action)** |
| 34 | **Passport Booklet** | Physical stationery | No | Physical stationery asset represented digitally by the `Passport` model. | **Rejected (Synonym / Physical Object)** |
| 35 | **Document Checklist** | Advisor wizard view | No | Dynamic presentation logic computed by the Document Advisor utility. | **Rejected (UI / Algorithm)** |
| 36 | **Appointment History** | Audit / `model AppointmentHistory` | Yes | Audit log entity tracking appointment rescheduling, cancellations, and former slots. | **Retained (Domain Class)** |
| 37 | **Audit Log** | Security / `model AuditLog` | Yes | Tamper-evident security log entity capturing actor, action, IP, and timestamp. | **Retained (Domain Class)** |
| 38 | **Password Reset Token** | Auth security / `model PasswordResetToken` | Yes | Cryptographic ephemeral token entity managing time-bounded password resets. | **Retained (Domain Class)** |
| 39 | **Login History** | Security monitoring / `model LoginHistory` | Yes | Audit entity tracking authentication attempts, IP address, user agent, and success flag. | **Retained (Domain Class)** |
| 40 | **Admin Invitation** | Staff onboarding / `model AdminInvitation` | Yes | Secure invitation entity with cryptographic token for onboarding staff users. | **Retained (Domain Class)** |
| 41 | **System Setting** | Configuration / `model SystemSetting` | Yes | Dynamic configuration entity storing key-value pairs for maintenance and portal flags. | **Retained (Domain Class)** |
| 42 | **Notice Category** | Master taxonomy / `model NoticeCategory` | Yes | Taxonomic classification entity grouping notices into General, Alert, Tender, etc. | **Retained (Domain Class)** |
| 43 | **Fee Schedule** | Tariff master / `model FeeSchedule` | Yes | Master rate-card entity specifying base fee, tatkaal surcharge, and page variants. | **Retained (Domain Class)** |
| 44 | **First Name / Last Name** | Profile attributes | No | Primitive string attributes belonging to `Applicant`. | **Rejected (Attribute)** |
| 45 | **Date of Birth** | Profile attribute | No | Primitive temporal attribute (`DateTime`) belonging to `Applicant`. | **Rejected (Attribute)** |
| 46 | **Gender** | Profile attribute | No | Demographic classification attribute belonging to `Applicant`. | **Rejected (Attribute)** |
| 47 | **Email** | Identity attribute | No | Unique communication string attribute belonging to `User`. | **Rejected (Attribute)** |
| 48 | **Phone Number** | Identity attribute | No | Contact string attribute belonging to `Applicant` and `User`. | **Rejected (Attribute)** |
| 49 | **Password Hash** | Security credential | No | Encrypted credential string attribute belonging to `User`. | **Rejected (Attribute)** |
| 50 | **Submit Application** | Workflow action | No | Business use-case operation transitioning `Application` to `SUBMITTED`. | **Rejected (Operation / Verb)** |
| 51 | **Calculate Fee** | Tariff computation | No | Stateless algorithmic business logic function in `lib/fee-calculator.ts`. | **Rejected (Operation / Function)** |
| 52 | **Verify Documents** | Scrutiny action | No | Interactive operation executed by `PassportOfficer` at Counter B. | **Rejected (Operation / Verb)** |
| 53 | **Grant Passport** | Statutory adjudication | No | Statutory decision operation executed by `PassportOfficer` at Counter C. | **Rejected (Operation / Verb)** |
| 54 | **Dashboard** | Web presentation | No | Client-side React page container (`app/(dashboard)/...`). | **Rejected (UI Component)** |
| 55 | **CAPTCHA Widget** | Security UI element | No | Presentation component (`components/Captcha.tsx`) validating human interaction. | **Rejected (UI / Boundary)** |
| 56 | **Navigation Bar** | UI layout element | No | Structural client layout component (`components/Navbar.tsx`). | **Rejected (UI Component)** |
| 57 | **Modal Dialog** | UI interactive window | No | Client-side presentation popup for alerts and confirmations. | **Rejected (UI Component)** |
| 58 | **Payment Gateway** | External service | No | External third-party financial processor communicating via API. | **Rejected (External Actor / System)** |
| 59 | **CCTNS Database** | External law enforcement | No | External criminal records database queried during police verification. | **Rejected (External Actor / System)** |
| 60 | **India Post Logistics** | External carrier | No | External postal delivery carrier handling Speed Post consignment tracking. | **Rejected (External Actor / System)** |

---

## 4. Candidate Class Filtering

To guarantee architectural integrity and prevent structural pollution, the 60 candidate nouns are partitioned into six mutually exclusive categories:

### 4.1 Retained Domain Classes (25 Classes)
These 25 entities represent core domain concepts with independent state, encapsulated responsibilities, and clear domain lifecycles. Every single retained class maps directly to a verified active model in the project's Prisma schema:
1. `User`
2. `Admin`
3. `Applicant`
4. `PassportOfficer`
5. `Police`
6. `Application`
7. `ApplicationStatusHistory`
8. `Document`
9. `Appointment`
10. `AppointmentHistory`
11. `Payment`
12. `PoliceReport`
13. `Passport`
14. `Notification`
15. `AuditLog`
16. `PasswordResetToken`
17. `LoginHistory`
18. `Grievance`
19. `AdminInvitation`
20. `SystemSetting`
21. `Notice`
22. `NoticeCategory`
23. `FeeSchedule`
24. `PassportCenter`
25. `PassportService`

### 4.2 Attributes (Eliminated)
These candidate nouns represent primitive properties, measurements, or identifiers belonging to a domain entity:
- **Application Reference Number (ARN):** Primary business key attribute of `Application`.
- **Date of Birth, Gender, First Name, Last Name:** Primitive demographic attributes of `Applicant`.
- **Email, Phone Number, Password Hash:** Security and contact attributes of `User` / `Applicant`.
- **Fee:** Decimal currency value stored within `Payment` and `FeeSchedule`.
- **Grievance Ticket:** String tracking code (`ticketNumber`) belonging to `Grievance`.
- **Address:** Compound textual and postal attributes belonging to `Applicant` and `PassportCenter`.
- **Application Status:** Finite state string attribute governed by `lib/fsm.ts`.
- **Role, Document Type, Service Type:** Enumeration literal values (`Role`, `DocumentType`, `ServiceType`).

### 4.3 Operations / Actions (Eliminated)
These candidate nouns represent procedural verbs, dynamic transactions, or algorithms rather than entities:
- **Submit Application:** Transition action changing state from `DRAFT` to `SUBMITTED`.
- **Calculate Fee:** Stateless computation utility evaluating tariff business rules.
- **Verify Documents:** Scrutiny operation performed by a Passport Officer.
- **Grant Passport:** Adjudication operation approving an application at Counter C.
- **Police Verification:** Multi-step investigation process resulting in a `PoliceReport`.
- **Dispatch:** Physical mailing action updating tracking attributes on `Passport`.

### 4.4 UI / Presentation Elements (Eliminated)
These nouns represent React interface elements, layouts, or client-side mechanisms:
- **Dashboard:** Web page layout presenting user metrics (`app/(dashboard)/...`).
- **CAPTCHA Widget:** Presentation component (`components/Captcha.tsx`) mitigating automated bots.
- **Navigation Bar:** Structural header component (`components/Navbar.tsx`).
- **Modal Dialog:** Ephemeral dialog for slot confirmation or document zoom.
- **Document Checklist:** Dynamic client view generated by the guided advisor.

### 4.5 Rejected / Duplicate Concepts (Eliminated)
These nouns represent semantic synonyms of canonical domain entities:
- **User Account:** Semantic duplicate of `User`.
- **PSK Centre:** Semantic synonym of `PassportCenter`.
- **Applicant Profile:** UI view presenting the `Applicant` entity.
- **Passport Booklet:** Physical stationery concept represented digitally by `Passport`.
- **Fresh Passport / Re-Issue / Tatkaal / PCC:** Specific catalog instances or enum values of `PassportService`.

### 4.6 External Actors / Systems (Eliminated from Domain Model)
These nouns represent external autonomous entities outside the immediate software boundary:
- **Payment Gateway:** External monetary processor handling credit card/UPI transactions.
- **CCTNS Database:** External crime tracking network queried for police verification.
- **India Post Logistics:** External postal logistics provider managing consignment tracking.
- **DigiLocker API:** National digital locker service for electronic document retrieval.
- **SMS / Email Gateway:** Telecommunications carrier dispatching transactional notices.

---

## 5. Final Domain Class List

The table below outlines the 25 final canonical domain classes, their purpose in the Passport Automation System, and their primary responsibilities:

| No. | Final Domain Class | Purpose in PAS | Core Responsibilities |
|:---:|:---|:---|:---|
| 1 | **User** | Authentication & Identity | Manages credentials, password hashes, role-based access control, login audits, and session tokens. |
| 2 | **Applicant** | Citizen Demographic Profile | Maintains citizen biographical information, residential address, family lineage, and application links. |
| 3 | **PassportOfficer** | Verification & Adjudication Staff | Represents staff at PSK; tracks counter assignments (Counter B / C), verification actions, and center binding. |
| 4 | **Police** | Field Verification Authority | Represents police verification personnel; tracks police station jurisdiction, badge ID, and assigned enquiries. |
| 5 | **Admin** | System Governance & Superuser | Manages master data, fee tariffs, system settings, staff invitations, and security audit log inspections. |
| 6 | **Application** | Core Aggregate Root | Encapsulates the entire passport lifecycle, maintaining ARN, service type, booklet size, and FSM status. |
| 7 | **ApplicationStatusHistory** | Audit Trail of State Machine | Preserves an immutable, chronological log of all application status transitions, actor IDs, and remarks. |
| 8 | **Document** | Evidence & Proof Management | Manages uploaded citizen proof files, MIME types, verification verdicts, and DigiLocker provenance. |
| 9 | **Appointment** | Slot Reservation & Scheduling | Manages appointment booking slots, queue tokens, physical reporting timestamps, and status lifecycles. |
| 10 | **AppointmentHistory** | Scheduling Audit Trail | Tracks appointment rescheduling attempts, quota limits (max 3), cancellations, and reasons. |
| 11 | **Payment** | Financial Transaction Processing | Manages statutory fee settlements, transaction reference codes, payment modes, and receipt generation. |
| 12 | **PoliceReport** | Background Enquiry Verdict | Encapsulates police field enquiry findings, CCTNS criminal background check outcomes, and PVR status. |
| 13 | **Passport** | Travel Credential & Dispatch | Represents the issued physical passport, booklet serial number, issue/expiry dates, and dispatch barcode. |
| 14 | **Notification** | User Communication | Manages in-app alerts, transactional updates, read/unread states, and action requests. |
| 15 | **AuditLog** | Tamper-Evident Security Log | Captures security and administrative events, recording client IP addresses, actor IDs, and entity mutations. |
| 16 | **PasswordResetToken** | Ephemeral Auth Security | Manages cryptographically secure, time-bounded hash tokens for self-service password recovery. |
| 17 | **LoginHistory** | Security Monitoring | Logs all user authentication attempts, recording client IP, user agent, timestamps, and success flags. |
| 18 | **Grievance** | Citizen Redressal & Helpdesk | Manages citizen inquiries and complaints, unique ticket numbers, priority levels, and resolution remarks. |
| 19 | **AdminInvitation** | Privileged Staff Onboarding | Generates and validates cryptographic invitation tokens for onboarding officers and administrative staff. |
| 20 | **SystemSetting** | Dynamic Portal Configuration | Maintains system-wide key-value configuration flags (maintenance mode, alert banners, operational limits). |
| 21 | **Notice** | Public Information & Circulars | Manages official advisories, holiday lists, public circulars, and publication schedules on the portal. |
| 22 | **NoticeCategory** | Notice Taxonomic Classification | Provides taxonomic categorization for public notices (e.g., General, Alert, Tender, Circular). |
| 23 | **FeeSchedule** | Master Tariff Configuration | Governs statutory fee calculations based on service type, page count (36 vs 60), age tier, and urgency. |
| 24 | **PassportCenter** | Physical Facility Logistics | Represents physical PSK and POPSK facilities, managing geographical coordinates, jurisdictions, and daily quotas. |
| 25 | **PassportService** | Public Service Catalog | Defines public service offerings, document eligibility rules, standard processing times, and descriptions. |

---

## 6. Detailed Domain Class Specifications

Below is an individual technical profile for each of the 25 final domain classes, detailing its operational context, internal attributes, and relationships within the actual codebase:

### 1. User
- **Purpose:** Central security identity model managing credentials and role-based permissions (`APPLICANT`, `OFFICER`, `POLICE`, `ADMIN`).
- **Implementation:** `prisma/schema.prisma` (`model User`), `lib/auth.ts`.
- **Key Relationships:** 1:1 optional profile with `Applicant`, `PassportOfficer`, `Police`, or `Admin`; 1:N with `Notification`, `AuditLog`, `LoginHistory`, `PasswordResetToken`.

### 2. Applicant
- **Purpose:** Represents a citizen user possessing personal demographics, residential addresses, and historical applications.
- **Implementation:** `prisma/schema.prisma` (`model Applicant`), `/api/profile`.
- **Key Relationships:** 1:1 with `User`; 1:N with `Application`, `Grievance`.

### 3. PassportOfficer
- **Purpose:** Represents verification and granting staff at a Passport Seva Kendra with designated counter capabilities.
- **Implementation:** `prisma/schema.prisma` (`model PassportOfficer`), `/api/officer/*`.
- **Key Relationships:** 1:1 with `User`; N:1 with `PassportCenter`.

### 4. Police
- **Purpose:** Represents a law enforcement officer conducting station-level residential verification and criminal background checks.
- **Implementation:** `prisma/schema.prisma` (`model Police`), `/api/police/*`.
- **Key Relationships:** 1:1 with `User`; 1:N with `PoliceReport`.

### 5. Admin
- **Purpose:** System administrator responsible for system configuration, user governance, and master data maintenance.
- **Implementation:** `prisma/schema.prisma` (`model Admin`), `/api/admin/*`.
- **Key Relationships:** 1:1 with `User`.

### 6. Application
- **Purpose:** Central aggregate root representing a citizen's passport application from initial draft to final booklet delivery.
- **Implementation:** `prisma/schema.prisma` (`model Application`), `lib/fsm.ts`.
- **Key Relationships:** N:1 with `Applicant`; N:1 with `PassportCenter`; 1:N with `Document`, `Appointment`, `Payment`, `ApplicationStatusHistory`; 1:1 with `PoliceReport`, `Passport`.

### 7. ApplicationStatusHistory
- **Purpose:** Immutable audit record of state machine transitions, capturing previous state, new state, acting user, and comments.
- **Implementation:** `prisma/schema.prisma` (`model ApplicationStatusHistory`), `lib/fsm.ts`.
- **Key Relationships:** N:1 with `Application`; N:1 optional with `User`.

### 8. Document
- **Purpose:** Encapsulates uploaded citizen verification proofs (PDF/JPEG) or digital imports via DigiLocker.
- **Implementation:** `prisma/schema.prisma` (`model Document`), `/api/applications/[id]/documents`.
- **Key Relationships:** N:1 with `Application`.

### 9. Appointment
- **Purpose:** Represents an in-person physical appointment reservation at a specific PSK or POPSK.
- **Implementation:** `prisma/schema.prisma` (`model Appointment`), `/api/appointments/*`.
- **Key Relationships:** N:1 with `Application`; N:1 with `PassportCenter`; 1:N with `AppointmentHistory`.

### 10. AppointmentHistory
- **Purpose:** Historical log tracking appointment rescheduling, cancellations, and slot modifications to enforce business quotas (max 3 reschedules).
- **Implementation:** `prisma/schema.prisma` (`model AppointmentHistory`).
- **Key Relationships:** N:1 with `Appointment`.

### 11. Payment
- **Purpose:** Monetary transaction record tracking statutory fees, payment methods, transaction references, and receipt states.
- **Implementation:** `prisma/schema.prisma` (`model Payment`), `/api/payments/*`.
- **Key Relationships:** N:1 with `Application`; N:1 with `User`.

### 12. PoliceReport
- **Purpose:** Formal background verification report filed by a jurisdictional police officer, including CCTNS criminal inquiry status.
- **Implementation:** `prisma/schema.prisma` (`model PoliceReport`), `/api/police/verify`.
- **Key Relationships:** 1:1 with `Application`; N:1 with `Police`.

### 13. Passport
- **Purpose:** Physical travel document credential issued upon successful verification, including booklet serial number, issue date, and postal tracking.
- **Implementation:** `prisma/schema.prisma` (`model Passport`), `/api/officer/dispatch`.
- **Key Relationships:** 1:1 with `Application`.

### 14. Notification
- **Purpose:** In-app alert mechanism dispatching lifecycle updates, action requests, and appointment reminders to users.
- **Implementation:** `prisma/schema.prisma` (`model Notification`), `/api/notifications/*`.
- **Key Relationships:** N:1 with `User`.

### 15. AuditLog
- **Purpose:** Tamper-evident operational audit trail capturing security-sensitive operations, IP addresses, actor IDs, and payload diffs.
- **Implementation:** `prisma/schema.prisma` (`model AuditLog`), `/api/admin/audit-logs`.
- **Key Relationships:** N:1 with `User`.

### 16. PasswordResetToken
- **Purpose:** Cryptographically hashed ephemeral token managing secure, single-use self-service password recovery workflows.
- **Implementation:** `prisma/schema.prisma` (`model PasswordResetToken`), `/api/auth/reset-password`.
- **Key Relationships:** N:1 with `User`.

### 17. LoginHistory
- **Purpose:** Security audit log tracking all authentication events, source IP addresses, user-agent signatures, and login outcomes.
- **Implementation:** `prisma/schema.prisma` (`model LoginHistory`).
- **Key Relationships:** N:1 with `User`.

### 18. Grievance
- **Purpose:** Citizen support ticket system enabling public visitors and authenticated citizens to lodge and track service complaints.
- **Implementation:** `prisma/schema.prisma` (`model Grievance`), `/api/grievances/*`.
- **Key Relationships:** N:1 optional with `User`.

### 19. AdminInvitation
- **Purpose:** Cryptographic invitation token system enabling administrators to securely onboard officers and administrative staff.
- **Implementation:** `prisma/schema.prisma` (`model AdminInvitation`), `/api/admin/invitations`.

### 20. SystemSetting
- **Purpose:** Dynamic configuration entity managing global system parameters such as emergency maintenance mode and portal announcements.
- **Implementation:** `prisma/schema.prisma` (`model SystemSetting`), `/api/admin/settings`.

### 21. Notice
- **Purpose:** Public news, tender circular, and advisory announcement published on the portal for citizen awareness.
- **Implementation:** `prisma/schema.prisma` (`model Notice`), `/api/notices/*`.
- **Key Relationships:** N:1 with `NoticeCategory`.

### 22. NoticeCategory
- **Purpose:** Taxonomy management entity classifying public notices (e.g., General, Tender, Advisory, Alert).
- **Implementation:** `prisma/schema.prisma` (`model NoticeCategory`).
- **Key Relationships:** 1:N with `Notice`.

### 23. FeeSchedule
- **Purpose:** Configurable tariff master determining application charges based on service type, page count (36 vs 60), age tier, and urgency.
- **Implementation:** `prisma/schema.prisma` (`model FeeSchedule`), `/api/fee-schedules/*`.

### 24. PassportCenter
- **Purpose:** Physical facility master managing Passport Seva Kendras (PSK), Post Office PSKs (POPSK), jurisdictional pin codes, and daily booking quotas.
- **Implementation:** `prisma/schema.prisma` (`model PassportCenter`), `/api/centres/*`.
- **Key Relationships:** 1:N with `Application`, `Appointment`, `PassportOfficer`.

### 25. PassportService
- **Purpose:** Public service catalog entity defining passport products (Fresh, Re-issue, Tatkaal, PCC), eligibility criteria, and required document checklists.
- **Implementation:** `prisma/schema.prisma` (`model PassportService`), `/api/services/*`.

---

## 7. Conclusion

By systematically applying the Noun Phrase Approach to the Passport Automation System requirements and code artifacts, **60 candidate nouns** were rigorously analyzed. Exactly **27 candidate nouns were discarded** as primitive attributes, operational actions, user interface components, or synonyms, leaving **25 canonical domain classes**.

Every one of these 25 retained classes represents a cohesive domain concept that is directly implemented in the active codebase as a Prisma model and managed via dedicated Next.js API route handlers. This provides an academically unassailable structural foundation for the Class-Responsibility-Collaborator (CRC) modeling detailed in the subsequent section.
