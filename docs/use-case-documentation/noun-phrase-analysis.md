# Candidate Class Identification Using the Noun Phrase Approach

## 1. Theoretical Foundation and Methodological Procedure

In Object-Oriented Analysis and Design (OOAD) (originally formalized by Russell Abbott and popularized by Grady Booch and Rebecca Wirfs-Brock), the **Noun Phrase Approach** is a systematic linguistic analysis technique used to discover candidate classes and entities directly from system problem statements, statutory regulations, and requirements specifications.

The technique follows a rigorous multi-stage filtering pipeline:

```
[System Specification & Problem Statement]
                   │
                   ▼ (Stage 1: Extraction)
       [All Extracted Noun Phrases]
                   │
                   ▼ (Stage 2: Redundancy & Synonym Elimination)
      [Unique Candidate Noun Pool]
                   │
                   ▼ (Stage 3: Boundary & Structural Filtering)
   ┌───────────────┴────────────────┬──────────────────────────┐
   ▼                                ▼                          ▼
[Attributes / Primitive]     [Operations / Verbs]     [UI / Framework Artifacts]
(e.g., DOB, PAN, Fee)        (e.g., Submit, Login)    (e.g., Button, Page, Form)
[REJECT AS CLASS]            [REJECT AS CLASS]        [REJECT AS CLASS]
   │                                │                          │
   └───────────────┬────────────────┴──────────────────────────┘
                   │
                   ▼ (Stage 4: Semantic Domain Validation)
       [Final Retained Domain Classes & Enums]
```

### Filtering Criteria:
1. **Redundancy & Synonyms:** If two terms designate the same real-world entity (e.g., *Citizen* and *Applicant*, *Application Reference Number* and *ARN*), select the most descriptive canonical term and discard the synonym.
2. **Attributes:** Nouns that represent primitive scalar data describing another entity (e.g., *Date of Birth*, *Phone Number*, *Gender*, *Passport Number*) are allocated as class attributes, not standalone domain classes.
3. **Operations & Events:** Nouns derived from verbs describing dynamic actions (e.g., *Submission*, *Verification*, *Login*, *Dispatch*) are assigned as operations or modeled as use cases unless they maintain independent state and audit history.
4. **UI & Architectural Artifacts:** Nouns referring strictly to visual screen widgets or implementation artifacts (e.g., *Dashboard*, *Navbar*, *Button*, *Modal*, *Cookie Banner*) are discarded from the conceptual domain model.
5. **Enums & State Values:** Nouns designating discrete states (e.g., *DRAFT*, *SUBMITTED*, *APPROVED*) are modeled as enumerated types within a Finite State Machine rather than heavy persistent classes.

---

## 2. Comprehensive Noun Phrase Extraction and Filtering Table

Below is the complete extraction and filtering analysis conducted across the Passport Automation System requirements, deployed pages, and backend codebase:

| Noun / Noun Phrase | Candidate? | Category / Elimination Reason | Final Decision | Mapping in System / Model |
| :--- | :---: | :--- | :--- | :--- |
| **Applicant** | **YES** | Primary real-world domain entity representing the citizen applying for a passport. Holds identity, address, and biographical state. | **Retained (Domain Class)** | `model Applicant` (`prisma/schema.prisma`) |
| **User** | **YES** | Core security and authentication entity managing email, credentials, lockout counters, and RBAC roles. | **Retained (Domain Class)** | `model User` |
| **User Account** | NO | Synonymous with `User`. Represents account security credentials already encapsulated by `User`. | **Discarded (Synonym)** | Unified into `User` |
| **Applicant Profile** | NO | Synonymous with `Applicant` particulars. Encapsulated as attributes of `Applicant`. | **Discarded (Synonym)** | Unified into `Applicant` |
| **Passport Application** | **YES** | Central transactional domain entity with unique lifecycle, statutory fee, and status tracking. | **Retained (Domain Class)** | `model Application` |
| **Application Reference Number (ARN)** | NO | Unique scalar identifier string (`ARN-YYYY-XXXXXX`) assigned to an application. Attribute of Application. | **Discarded (Attribute)** | `Application.applicationId` |
| **Passport** | **YES** | Issued statutory travel document possessing booklet number, issue date, expiry date, and postal tracking. | **Retained (Domain Class)** | `model Passport` |
| **Passport Booklet** | NO | Physical representation of the travel document; synonymous with `Passport`. | **Discarded (Synonym)** | Unified into `Passport` |
| **Passport Service** | **YES** | Persistent service catalog entity specifying rules, processing timelines, and document checklists. | **Retained (Domain Class)** | `model PassportService` |
| **Fresh Passport** | NO | Specific type of passport application. Modeled as an enumeration value of `serviceType`. | **Discarded (Enum Value)** | `Application.serviceType = "FRESH"` |
| **Re-Issue** | NO | Specific type of passport application. Modeled as an enumeration value of `serviceType`. | **Discarded (Enum Value)** | `Application.serviceType = "REISSUE"` |
| **Tatkaal Application** | NO | Expedited processing scheme. Modeled as an enumeration value of `applicationCategory`. | **Discarded (Enum Value)** | `Application.applicationCategory = "TATKAAL"` |
| **Police Clearance Certificate (PCC)**| NO | Specialized service offering; represented as a service instance in the service directory. | **Discarded (Service Instance)**| `PassportService.serviceCode = "PCC"` |
| **Document** | **YES** | Core digital proof asset (Address proof, DOB proof, etc.) with file metadata, URI, and verification status. | **Retained (Domain Class)** | `model Document` |
| **Document Type** | NO | Categorical string describing proof category (e.g., `PROOF_OF_ADDRESS`, `PROOF_OF_DOB`). | **Discarded (Attribute / Enum)** | `Document.documentType` |
| **Document Checklist** | NO | Aggregation of document requirements; stored as a JSON string attribute in `PassportService`. | **Discarded (Attribute)** | `PassportService.documentChecklist` |
| **Payment** | **YES** | Financial transactional entity capturing transaction ID, amount, payment method, gateway status, and timestamp. | **Retained (Domain Class)** | `model Payment` |
| **Fee** | NO | Monetary amount calculated under GSR 516(E). Scalar numerical attribute of Application and Payment. | **Discarded (Attribute)** | `Payment.amount`, `FeeSchedule.normalFee` |
| **Fee Schedule** | **YES** | Statutory pricing entity defining base fee, tatkaal surcharge, and discounts under Gazette GSR 516(E). | **Retained (Domain Class)** | `model FeeSchedule` |
| **Appointment** | **YES** | PSK slot reservation entity linking applicant to a specific centre, date, time slot, and queue token. | **Retained (Domain Class)** | `model Appointment` |
| **Appointment History** | **YES** | Audit trail tracking slot modifications, previous dates, new dates, and reschedule counts. | **Retained (Domain Class)** | `model AppointmentHistory` |
| **Queue Token Number** | NO | Alphanumeric physical queue token issued at PSK (e.g., `TOK-A-108`). Attribute of Appointment. | **Discarded (Attribute)** | `Appointment.appointmentId`, `Application.pskToken` |
| **Passport Center (PSK / POPSK)** | **YES** | Physical infrastructure entity representing RPOs, PSKs, and POPSKs with operating hours and slot capacities. | **Retained (Domain Class)** | `model PassportCenter` |
| **Passport Officer** | **YES** | Internal authority entity representing verifying and granting officers at PSKs with branch locations. | **Retained (Domain Class)** | `model PassportOfficer` |
| **Police Authority** | **YES** | Jurisdictional law enforcement entity representing police stations and verifying personnel. | **Retained (Domain Class)** | `model Police` |
| **Police Verification** | NO | Procedural activity / workflow step executed by police. Reified by the verification report entity. | **Discarded (Use Case / Activity)** | Represented by `UC-31` & `PoliceReport` |
| **Police Verification Report (PVR)** | **YES** | Official electronic dossier containing physical enquiry findings, CCTNS criminal checks, and clearance status. | **Retained (Domain Class)** | `model PoliceReport` |
| **Application Status** | NO | Discrete lifecycle state value (e.g., `DRAFT`, `SUBMITTED`, `APPROVED`). Modeled as an FSM string enum. | **Discarded (Enum / Value Type)**| `lib/fsm.ts` (`ApplicationStatus`) |
| **Application Status History** | **YES** | Immutable statutory audit ledger recording every state transition, timestamp, actor ID, and remarks. | **Retained (Domain Class)** | `model ApplicationStatusHistory` |
| **Grievance** | **YES** | Citizen support ticket entity capturing complaint category, description, status, and resolution notes. | **Retained (Domain Class)** | `model Grievance` |
| **Grievance Ticket** | NO | Synonymous with `Grievance`. `ticketId` is an attribute of Grievance. | **Discarded (Synonym)** | Unified into `Grievance` |
| **Address** | NO | Multi-field structured spatial data (Line 1, Line 2, City, State, PIN). Modeled as component attributes of Applicant/Application. | **Discarded (Composite Attribute)** | `Application.presentAddressLine1`, etc. |
| **Notification** | **YES** | System alert entity notifying users of payment receipts, appointment bookings, and dispatch status. | **Retained (Domain Class)** | `model Notification` |
| **Public Notice / Announcement** | **YES** | Official public circular and gazette advisory published by administrators for citizen discovery. | **Retained (Domain Class)** | `model Notice` |
| **Notice Category** | **YES** | Classification category entity for notices (e.g., Fee Revision, PSK Relocation, Passport Mela). | **Retained (Domain Class)** | `model NoticeCategory` |
| **Administrator** | **YES** | Privileged governance entity with administrative code and elevated system management rights. | **Retained (Domain Class)** | `model Admin` |
| **Admin Invitation** | **YES** | Tokenized security invitation record used to onboard new administrators securely. | **Retained (Domain Class)** | `model AdminInvitation` |
| **Role** | NO | RBAC categorical value (`APPLICANT`, `OFFICER`, `POLICE`, `ADMIN`). Modeled as an enumeration attribute of User. | **Discarded (Attribute / Enum)** | `User.role` |
| **Audit Log** | **YES** | Compliance and security log entity capturing sensitive operations, actor IP addresses, and payloads. | **Retained (Domain Class)** | `model AuditLog` |
| **Login History** | **YES** | Session tracking entity recording login timestamps, IP addresses, session IDs, and revocation flags. | **Retained (Domain Class)** | `model LoginHistory` |
| **Password Reset Token** | **YES** | Cryptographic security token entity with expiration timestamps used for self-service password recovery. | **Retained (Domain Class)** | `model PasswordResetToken` |
| **System Setting** | **YES** | Key-value configuration entity managing global system flags, maintenance modes, and portal parameters. | **Retained (Domain Class)** | `model SystemSetting` |
| **Tracking Record** | NO | Dynamic aggregation of `ApplicationStatusHistory` and `Passport.trackingNumber`. Computed via API. | **Discarded (Dynamic View / Query)**| Handled by `/api/track` route |
| **Dispatch** | NO | Operational event wherein a booklet is handed over to India Post. Attribute and state transition in Passport. | **Discarded (Event / State)** | `Passport.dispatchStatus = "DISPATCHED"` |
| **Speed Post Tracking Number** | NO | Alphanumeric consignment barcode (e.g., `EM123456789IN`). Scalar attribute of Passport. | **Discarded (Attribute)** | `Passport.trackingNumber` |
| **Date of Birth (DOB)** | NO | Temporal timestamp identifying birth date. Scalar attribute of Applicant and Application. | **Discarded (Attribute)** | `Applicant.dob`, `Application.dob` |
| **Password / Password Hash** | NO | Security credential. Handled externally by Supabase Auth / bcrypt; not an independent domain class. | **Discarded (Security Attribute)**| Authentication managed in Auth layer |
| **Submit / Submission** | NO | Dynamic operation invoked by Applicant. Modeled as a method on Application and a primary use case. | **Discarded (Operation / Use Case)**| `Application.submit()`, `UC-08` |
| **Login / Logout** | NO | Authentication use case / security session lifecycle events. | **Discarded (Use Case / Operation)**| `UC-06`, `/api/auth/login` |
| **Dashboard** | NO | User interface layout container displaying personalized metrics. Pure UI presentation component. | **Discarded (UI Component)** | `app/applicant/dashboard/page.tsx` |
| **Button / Form / Modal** | NO | Client-side visual interactive controls. Presentation framework artifacts. | **Discarded (UI Component)** | React / Tailwind UI widgets |
| **Captcha / Captcha Token** | NO | Temporary challenge-response security verification string. Transient parameter in auth routes. | **Discarded (Transient Security Param)**| Verified in memory |

---

## 3. Discarded False Candidates and Rejection Rationale

To ensure strict academic rigor, each discarded candidate noun is classified into its formal rejection category:

### 3.1 Attributes Discarded from Class Hierarchy
- **`Date of Birth` & `Gender`:** Pure scalar values describing biographical properties of an `Applicant`. Creating a class for `DateOfBirth` would result in an anemic class without domain behavior.
- **`Application Reference Number (ARN)`:** A formatted alphanumeric string (`ARN-YYYY-XXXXXX`) that functions as an alternate unique business key for the `Application` entity.
- **`Fee Amount`:** A numerical quantity calculated dynamically by evaluating the application's age, service type, and scheme against the `FeeSchedule`.
- **`Tracking Number`:** An India Post Speed Post consignment barcode stored as a string within the `Passport` entity once dispatched.
- **`Queue Token`:** A daily serialized counter issued at PSK check-in, stored on the `Appointment` and `Application` records.

### 3.2 Operations and Dynamic Verbs Discarded
- **`Submit Application`:** A core business operation that mutates an application's state from `DRAFT` to `SUBMITTED`. Modeled as an operation on `Application` and documented as `UC-08`.
- **`Verify Document`:** An action executed by a `PassportOfficer` that updates the `verificationStatus` attribute of a `Document`.
- **`Conduct Enquiry`:** A field activity carried out by a `Police` officer that produces a `PoliceReport`.

### 3.3 UI and Presentation Artifacts Discarded
- **`Dashboard` (`ApplicantDashboard`, `OfficerDashboard`):** React components responsible for rendering UI layouts, stat cards, and navigation links. They possess no independent domain persistence or business rules.
- **`Cookie Banner` / `Privacy Modal`:** Client-side UI controls for capturing consent. Discarded from the domain class diagram.
- **`Page` / `Navbar`:** Presentation shell components in Next.js.

### 3.4 Enumerations and State Values
- **`Application Status`:** Represents discrete milestones (`DRAFT`, `SUBMITTED`, `PAYMENT_PENDING`, `APPROVED`, etc.). Modeled as an enumeration value within the `Application` model and governed by `lib/fsm.ts`.

---

## 4. Final Retained Domain Classes

Following the noun phrase extraction and elimination process, **25 canonical domain entities** are retained. Each represents a cohesive, persistent, state-bearing business concept directly supported by the application's Prisma schema:

1. **`User`**: Central identity and RBAC authentication boundary.
2. **`Applicant`**: Citizen biographical profile and applicant identity.
3. **`PassportOfficer`**: PSK verification and granting official.
4. **`Police`**: Jurisdictional police station verification station.
5. **`Admin`**: System governance administrator.
6. **`Application`**: Core transactional passport service application dossier.
7. **`ApplicationStatusHistory`**: Immutable regulatory status transition ledger.
8. **`Document`**: Uploaded KYC proofs (address, identity, DOB, non-ECR).
9. **`Appointment`**: PSK slot reservation and queue booking.
10. **`AppointmentHistory`**: Appointment rescheduling and modification audit trail.
11. **`Payment`**: Statutory fee payment transaction record.
12. **`PoliceReport`**: Electronic Police Verification Report (PVR).
13. **`Passport`**: Issued travel document and Speed Post dispatch record.
14. **`Grievance`**: Citizen public grievance redressal ticket.
15. **`PassportCenter`**: Regional PSK, POPSK, and RPO center catalog.
16. **`PassportService`**: Database-driven catalog of citizen passport services.
17. **`FeeSchedule`**: Gazette GSR 516(E) statutory pricing and fee rules.
18. **`Notice`**: Official public advisories, circulars, and gazette notifications.
19. **`NoticeCategory`**: Taxonomy and categorization for public notices.
20. **`Notification`**: Real-time user alert and communication message.
21. **`AuditLog`**: Security compliance and privileged operational event log.
22. **`LoginHistory`**: Historical authentication session and IP tracking log.
23. **`PasswordResetToken`**: Self-service cryptographic password recovery token.
24. **`AdminInvitation`**: Administrator onboarding invitation token.
25. **`SystemSetting`**: Portal-wide system configuration parameters.
