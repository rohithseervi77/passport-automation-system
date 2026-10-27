# CRC (Class–Responsibility–Collaborator) Indexing Cards
**Passport Automation System (PAS)**  
*Project Repository:* `passport-automation-system`  
*Live Deployment:* `https://passport-automation-system-psi.vercel.app/`  
*Domain:* Ministry of External Affairs (MEA) Passport Seva Academic Simulation  
*Academic Framework:* Object-Oriented Analysis and Design (OOAD) — Beck & Cunningham CRC Method  

---

## 1. Introduction to CRC Modeling

The **Class–Responsibility–Collaborator (CRC)** modeling technique, introduced by Kent Beck and Ward Cunningham (1989) at OOPSLA, is an informal yet powerful anthropomorphic approach to object-oriented analysis and design. Instead of viewing software systems as static data schemas, CRC modeling treats an object-oriented system as an active community of collaborating agents.

### 1.1 The CRC Acronym
CRC stands for:
- **C — Class:** A cohesive collection of similar objects representing a distinct abstraction within the problem domain. A class acts as a template defining what an object knows and what it can do.
- **R — Responsibility:** The behavioral obligations, contracts, and services provided by the class. In OOAD, responsibilities are categorized into:
  - *Doing Responsibilities:* Actions an object performs (e.g., computing fees, validating state transitions, reserving appointment slots).
  - *Knowing Responsibilities:* Knowledge encapsulated by the object (e.g., knowing its ARN, tracking previous states, maintaining proof documents).
- **C — Collaborator:** Other classes with which a given class must communicate or interact to fulfill its responsibilities. When a class cannot fulfill a responsibility alone, it delegates part of the task to a collaborator.

### 1.2 Core Questions Answered by CRC Cards
In standard Software Engineering and OOAD practice, CRC cards directly resolve three fundamental design questions:
1. **What objects/classes exist in the system?** (Established via Noun Phrase Analysis).
2. **What responsibilities belong to each class?** (Ensuring high cohesion and behavioral encapsulation).
3. **Which other classes must collaborate to complete those responsibilities?** (Ensuring loose coupling and clear message-passing contracts).

### 1.3 Behavioral Responsibilities vs. Database Fields
A common novice pitfall in OOAD is simply copying database table columns and labeling them as class responsibilities (e.g., "Stores first_name", "Stores date_of_birth"). In authentic object-oriented design:
- Database columns represent internal storage mechanisms (state).
- **CRC responsibilities represent observable behaviors, business logic, integrity enforcement, and service contracts.**

---

## 2. Complete Index of 25 CRC Indexing Cards

Below are the 25 CRC Indexing Cards corresponding to the 25 canonical domain classes of the Passport Automation System. Each card strictly reflects the actual behavior implemented in the codebase:

```text
------------------------------------------
CRC INDEXING CARD
Class:
User

Description:
Represents the core authentication principal and security identity entity within PAS, managing credentials, session tokens, and role-based authorization.

Responsibilities:
1. Authenticate user credentials against bcrypt password hashes.
2. Maintain role-based authorization boundaries (APPLICANT, OFFICER, POLICE, ADMIN).
3. Enforce account lockout and track consecutive failed login attempts.
4. Record authentication audit events and client IP signatures.
5. Invalidate active sessions upon password reset or role modification.

Collaborators:
1. Applicant
2. PassportOfficer
3. Police
4. Admin
5. LoginHistory
6. PasswordResetToken
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
Applicant

Description:
Represents a citizen applying for passport services, encapsulating personal biographical data, residential addresses, and historical application links.

Responsibilities:
1. Maintain citizen demographic profile and residential address history.
2. Validate emergency contact information and family lineage records.
3. Initiate and link new passport application instances.
4. Retrieve active and historical applications associated with citizen identity.
5. Lodge service grievances and track complaint resolution progress.

Collaborators:
1. User
2. Application
3. Grievance
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
PassportOfficer

Description:
Represents verification and granting personnel at a Passport Seva Kendra (PSK), executing document scrutiny, biometric verification, and statutory granting decisions.

Responsibilities:
1. Manage assigned counter queue (Counter B Scrutiny or Counter C Granting).
2. Cross-examine original physical documents against uploaded proofs.
3. Record document verification verdicts (VERIFIED, REJECTED, CLARIFICATION_NEEDED).
4. Register applicant biometric integrity and live photograph capture confirmations.
5. Adjudicate statutory granting or refusal decisions under the Passports Act.
6. Initiate police verification requests for granted applications.

Collaborators:
1. User
2. PassportCenter
3. Application
4. Document
5. ApplicationStatusHistory
6. PoliceReport
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
Police

Description:
Represents a jurisdictional police station authority responsible for conducting field background enquiries and criminal record checks.

Responsibilities:
1. Access and filter station-level verification worklists based on postal jurisdiction.
2. Conduct field residence enquiries and verify applicant identity and character.
3. Execute criminal record checks against the CCTNS crime database interface.
4. Submit formal Police Verification Reports (PVR) with status CLEAR, ADVERSE, or INCOMPLETE.
5. Upload signed physical enquiry sheets and official police remarks.

Collaborators:
1. User
2. PoliceReport
3. Application
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
Admin

Description:
Represents the superuser responsible for system governance, master tariff management, PSK operational capacity allocation, and security auditing.

Responsibilities:
1. Manage statutory fee schedules and tatkaal pricing surcharges.
2. Configure PSK and POPSK centre operational hours, holiday calendars, and daily quotas.
3. Issue cryptographically signed staff invitation tokens for officer onboarding.
4. Manage public circulars, news bulletins, and alert banners.
5. Inspect immutable system-wide security audit logs and active session histories.
6. Review, assign, and resolve citizen service grievances.

Collaborators:
1. User
2. AuditLog
3. SystemSetting
4. FeeSchedule
5. PassportCenter
6. Notice
7. AdminInvitation
8. Grievance
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
Application

Description:
Core aggregate root entity managing the complete end-to-end lifecycle of a passport application from initial draft to final postal delivery.

Responsibilities:
1. Generate and maintain unique Application Reference Number (ARN).
2. Validate and enforce multi-step application form integrity (personal, address, family).
3. Maintain current lifecycle state and enforce legal FSM transitions via lib/fsm.ts.
4. Associate supporting proof documents and verify mandatory document completeness.
5. Coordinate fee payment verification and lock application for appointment booking.
6. Link appointment bookings and record physical PSK attendance tokens.
7. Maintain chronological transition history and administrative remarks.

Collaborators:
1. Applicant
2. PassportCenter
3. Document
4. Appointment
5. Payment
6. PoliceReport
7. Passport
8. ApplicationStatusHistory
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
ApplicationStatusHistory

Description:
Immutable chronological audit log capturing every finite state transition undergone by an application throughout its lifecycle.

Responsibilities:
1. Record timestamped historical snapshot of every application state change.
2. Attribute every status transition to the acting User ID or automated system rule.
3. Preserve statutory operational remarks, officer notes, and rejection reasons.
4. Provide verifiable audit timeline for public ARN tracking queries.

Collaborators:
1. Application
2. User
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
Document

Description:
Represents physical proof files (PDF/JPEG) or digital records imported via DigiLocker, validating identity, address, and date of birth.

Responsibilities:
1. Encapsulate file metadata, secure storage URI, MIME type, and byte size.
2. Validate document classification category (ADDRESS_PROOF, ID_PROOF, DOB_PROOF, ANNEXURE).
3. Track digital authenticity provenance (isDigiLocker verification flag).
4. Maintain officer scrutiny verification status (PENDING, VERIFIED, REJECTED).
5. Record officer comments justifying document rejection or clarification requests.

Collaborators:
1. Application
2. PassportOfficer
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
Appointment

Description:
Manages citizen appointment reservations at physical Passport Seva Kendras, controlling slot availability, queue tokens, and physical entry.

Responsibilities:
1. Reserve designated date and time window at a specified PassportCenter.
2. Enforce daily appointment quota limits per centre facility.
3. Generate appointment confirmation slip data and scannable queue token.
4. Record physical attendance check-in timestamp at PSK reception.
5. Manage appointment status lifecycle (SCHEDULED, RESCHEDULED, COMPLETED, CANCELLED).

Collaborators:
1. Application
2. PassportCenter
3. AppointmentHistory
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
AppointmentHistory

Description:
Audit entity preserving historical appointment bookings, enforcing statutory limits on appointment rescheduling (maximum 3 modifications).

Responsibilities:
1. Log previous appointment booking slots, dates, and centres upon modification.
2. Enforce business constraint restricting rescheduling to a maximum of 3 attempts.
3. Record operational reasons for appointment cancellation or rescheduling.
4. Maintain chronological timeline of citizen appointment interactions.

Collaborators:
1. Appointment
2. User
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
Payment

Description:
Encapsulates financial transactions for statutory passport fees, tracking gateway references, settlement modes, and electronic receipts.

Responsibilities:
1. Calculate required statutory fee based on service type, booklet pages, and urgency.
2. Track payment gateway transaction identifier (TXN-YYYY-XXXX).
3. Validate electronic payment settlement status (PENDING, SUCCESS, FAILED).
4. Enforce idempotency to prevent duplicate payments on a single application.
5. Generate verifiable PDF payment confirmation receipt with statutory reference data.

Collaborators:
1. Application
2. User
3. FeeSchedule
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
PoliceReport

Description:
Represents the official investigation report submitted by the jurisdictional police authority following residential and criminal background checks.

Responsibilities:
1. Link field verification enquiry to the specific Application and jurisdictional Police station.
2. Record field enquiry findings regarding applicant residential duration and character.
3. Log CCTNS criminal records check outcome (Clear, FIR Pending, Adverse Record).
4. Store official police verification verdict (CLEAR, ADVERSE, INCOMPLETE).
5. Attach scanned physical enquiry documentation and investigating officer endorsement.

Collaborators:
1. Application
2. Police
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
Passport

Description:
Represents the issued physical travel document, managing booklet serial numbering, issue/expiry dates, and postal logistics tracking.

Responsibilities:
1. Generate unique 8-character alphanumeric passport booklet number.
2. Record date of issue and compute statutory 10-year validity expiration date.
3. Encode booklet physical specifications (36-page standard vs 60-page jumbo).
4. Log quality control inspection pass and printing batch details.
5. Associate India Post Speed Post consignment tracking barcode for dispatch monitoring.

Collaborators:
1. Application
2. PassportOfficer
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
Notification

Description:
In-app communication entity responsible for alerting applicants and staff of critical lifecycle events, appointments, and required actions.

Responsibilities:
1. Dispatch event-driven alerts to specific users upon application state changes.
2. Maintain notification urgency priority (INFO, WARNING, ACTION_REQUIRED).
3. Track read/unread status and timestamp of user acknowledgment.
4. Provide structured deep links guiding users to relevant application steps.

Collaborators:
1. User
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
AuditLog

Description:
Immutable, tamper-evident security audit log capturing high-privilege operations, data modifications, and system transactions.

Responsibilities:
1. Capture actor identity, user role, client IP address, and user-agent metadata.
2. Record target entity type, entity ID, and operational action (CREATE, UPDATE, DELETE).
3. Preserve cryptographic before-and-after payload diffs for compliance auditing.
4. Support multi-criteria querying for administrative security investigations.

Collaborators:
1. User
2. Admin
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
PasswordResetToken

Description:
Security token entity governing time-bounded, cryptographically secure self-service password recovery workflows.

Responsibilities:
1. Generate cryptographically strong, random hexadecimal reset token hash.
2. Enforce strict expiration window (e.g., 60 minutes from generation).
3. Validate token authenticity during password update requests.
4. Guarantee single-use invalidation immediately upon successful password modification.

Collaborators:
1. User
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
LoginHistory

Description:
Security monitoring entity tracking all authentication attempts across the portal to identify unauthorized access attempts and credential stuffing.

Responsibilities:
1. Record user authentication timestamps, source IP addresses, and device signatures.
2. Track authentication success or failure outcomes with specific failure codes.
3. Detect anomalous login spikes indicative of automated brute-force attacks.
4. Provide security metrics for administrative user account governance.

Collaborators:
1. User
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
Grievance

Description:
Citizen service redressal ticket entity managing citizen complaints, inquiry categorization, administrative review, and resolution tracking.

Responsibilities:
1. Generate unique, human-readable grievance tracking ticket number (e.g., GRV-2026-XXXX).
2. Categorize citizen issue (Application Delay, Appointment Issue, Police Verification, Payment Error).
3. Enable public tracking via ticket number and contact email.
4. Support administrative resolution workflows, internal notes, and citizen feedback.
5. Manage grievance lifecycle status (OPEN, UNDER_INVESTIGATION, RESOLVED, CLOSED).

Collaborators:
1. User
2. Applicant
3. Admin
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
AdminInvitation

Description:
Privileged onboarding entity enabling administrators to invite new Passport Officers and Administrators securely via cryptographic tokens.

Responsibilities:
1. Generate unique cryptographic invitation hash tied to a designated email address and role.
2. Enforce time-bounded expiration on invitation validity.
3. Validate invitation token integrity during staff account registration.
4. Invalidate invitation record upon successful user onboarding to prevent replay attacks.

Collaborators:
1. Admin
2. User
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
SystemSetting

Description:
Centralized dynamic configuration entity managing system-wide operational flags, emergency maintenance banners, and global limits.

Responsibilities:
1. Store key-value configuration pairs for dynamic runtime consumption.
2. Manage emergency maintenance mode toggle and public banner alert messages.
3. Govern global application rate limits, CAPTCHA enforcement levels, and booking quotas.
4. Provide cached configuration retrieval for high-throughput API handlers.

Collaborators:
1. Admin
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
Notice

Description:
Public information management entity representing advisories, holiday circulars, procedure changes, and tenders published on the portal.

Responsibilities:
1. Maintain public bulletin title, HTML/Markdown content body, and publication schedule.
2. Manage pinned/featured status for urgent alerts displayed on the portal homepage.
3. Track active/archived publication lifecycle states.
4. Support public search and filtering by taxonomy category.

Collaborators:
1. NoticeCategory
2. Admin
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
NoticeCategory

Description:
Taxonomic classification master grouping public notices into distinct organizational categories (e.g., General, Advisory, Tender, Press Release).

Responsibilities:
1. Define taxonomic categories and URL slugs for public bulletin categorization.
2. Group notices to facilitate filtered citizen discovery.
3. Maintain display priority ordering for navigation menus.

Collaborators:
1. Notice
2. Admin
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
FeeSchedule

Description:
Master tariff entity defining the statutory fee matrix based on service type, applicant age, page count (36 vs 60), and Tatkaal urgency.

Responsibilities:
1. Store statutory fee rate cards categorized by ServiceType and booklet size.
2. Define Tatkaal fast-track pricing surcharges.
3. Provide dynamic rate lookups for the public Fee Calculator and Payment module.
4. Maintain effective validity date ranges for statutory tariff revisions.

Collaborators:
1. Application
2. Payment
3. Admin
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
PassportCenter

Description:
Physical facility master managing Passport Seva Kendras (PSK), Post Office PSKs (POPSK), jurisdictional pin codes, and daily booking quotas.

Responsibilities:
1. Maintain physical facility address, geographic coordinates, and jurisdictional codes.
2. Configure daily appointment booking capacity across normal and Tatkaal quotas.
3. Associate stationed Passport Officers and manage workstation counter allocations.
4. Support public PSK locator queries based on state, district, or pin code.

Collaborators:
1. Application
2. Appointment
3. PassportOfficer
4. Admin
------------------------------------------
```

```text
------------------------------------------
CRC INDEXING CARD
Class:
PassportService

Description:
Public service catalog master defining passport service categories (Fresh, Re-issue, Tatkaal, PCC), eligibility rules, and required document checklists.

Responsibilities:
1. Maintain public catalog of passport products and statutory services.
2. Define mandatory document proof checklists for each service category.
3. Specify standard turnaround Service Level Agreements (SLAs) for citizen reference.
4. Drive the interactive guided Document Advisor wizard on the public portal.

Collaborators:
1. Admin
2. Application
------------------------------------------
```

---

## 3. CRC Collaboration Analysis

To demonstrate how the 25 domain classes interact dynamically to execute complex system workflows, the table below maps core responsibilities to collaborating classes and explains why each collaboration is required:

| Class | Core Responsibility | Collaborating Class | Technical Rationale for Collaboration |
|:---|:---|:---|:---|
| **User** | Enforce role-based access | `Applicant`, `PassportOfficer`, `Police`, `Admin` | User verifies security role and navigates to specialized profile entity. |
| **Applicant** | Initiate new passport application | `Application` | Applicant delegates application state management and ARN creation to `Application`. |
| **Application** | Maintain legal FSM transitions | `ApplicationStatusHistory` | Application delegates immutable logging of every state change and remark to `ApplicationStatusHistory`. |
| **Application** | Validate supporting document proofs | `Document` | Application inspects linked `Document` records to ensure all mandatory proof types exist. |
| **Application** | Ensure fee settlement prior to booking | `Payment` | Application verifies that a linked `Payment` record exists with status `SUCCESS`. |
| **Appointment** | Reserve slot within daily capacity | `PassportCenter` | Appointment checks `PassportCenter` daily capacity and booked slots to prevent overbooking. |
| **Appointment** | Enforce 3-reschedule limit | `AppointmentHistory` | Appointment counts prior records in `AppointmentHistory` before permitting slot modification. |
| **Payment** | Compute exact statutory fee | `FeeSchedule` | Payment queries `FeeSchedule` rate card matching service type, booklet size, and urgency. |
| **PassportOfficer** | Scrutinize citizen proofs at Counter B | `Document`, `Application` | Officer examines physical originals against `Document` and advances `Application` state. |
| **PassportOfficer** | Grant application at Counter C | `Application`, `PoliceReport` | Officer adjudicates granting decision and dispatches police verification request. |
| **Police** | Submit field verification findings | `PoliceReport`, `Application` | Police officer populates `PoliceReport` and transitions `Application` to verification state. |
| **Passport** | Issue booklet and track delivery | `Application` | Passport generates booklet serial number and binds Speed Post consignment to `Application`. |
| **Admin** | Onboard new staff officers | `AdminInvitation`, `User` | Admin generates cryptographic token via `AdminInvitation` to create verified staff `User`. |
| **Grievance** | Track citizen redressal ticket | `User`, `Admin` | Grievance associates complaint with authenticated `User` and notifies `Admin` desk. |
| **Notice** | Categorize public bulletins | `NoticeCategory` | Notice references `NoticeCategory` to structure circulars into alerts, tenders, and news. |

---

## 4. CRC Validation and Consistency Check

To ensure that the CRC model satisfies strict academic software engineering standards (OOAD / UML 2.5), the model was verified against the following 10 formal consistency criteria:

1. **Responsibility Ownership:** Every responsibility is allocated to the class with the information and context necessary to fulfill it (High Cohesion / Information Expert pattern).
2. **Elimination of Redundancy:** No behavioral responsibility is duplicated across multiple classes; shared functionality is delegated via clean associations.
3. **Justified Collaborations:** Every identified collaborator is necessary to complete a designated responsibility; no frivolous or circular couplings exist.
4. **Behavior-Oriented Formulation:** All responsibilities represent concrete operations, validations, or state management contracts rather than static database column descriptions.
5. **Direct Class Alignment:** All 25 CRC cards correspond 1:1 with the 25 canonical domain classes derived from Noun Phrase Analysis.
6. **Implementation Fidelity:** Every responsibility and collaboration corresponds directly to active TypeScript functions, Prisma relational queries, and Next.js route handlers.
7. **No UI Contamination:** Presentation elements (e.g., `Dashboard`, `Navbar`, `Modal`, `CaptchaWidget`) are strictly excluded from the domain CRC cards.
8. **No Attribute Confusion:** Simple data fields (e.g., `dateOfBirth`, `arn`, `email`, `fee`) are modeled as encapsulated state within classes, not independent CRC cards.
9. **Actor-Class Disambiguation:** External entities (e.g., `Payment Gateway`, `CCTNS Database`, `India Post`) are recognized as external boundary systems, while staff and citizen profiles are modeled as internal domain entities.
10. **Use Case Consistency:** The CRC responsibilities fully cover all 48 system use cases (`UC-01` to `UC-48`), guaranteeing that the system can execute all end-to-end workflows.

---

## 5. Conclusion

The 25 CRC Indexing Cards provide a comprehensive behavioral specification of the Passport Automation System. By clearly decoupling knowing and doing responsibilities from raw persistence schemas, the CRC model bridges textual requirements with concrete object-oriented implementation, providing an academically rigorous design ready for UML class and sequence diagram realization.
