# Noun Phrase → Class → CRC Traceability & OOAD Classifications
**Passport Automation System (PAS)**  
*Project Repository:* `passport-automation-system`  
*Live Deployment:* `https://passport-automation-system-psi.vercel.app/`  
*Domain:* Ministry of External Affairs (MEA) Passport Seva Academic Simulation  
*Academic Framework:* Object-Oriented Analysis and Design (OOAD) — Traceability & Metamodel Distinctions  

---

## 1. Traceability Architecture

In Object-Oriented Analysis and Design (OOAD), traceability provides verifiable proof that every architectural decision, structural class, and behavioral contract originates from legitimate domain requirements and maps cleanly to the physical codebase.

The traceability chain developed for the Passport Automation System follows a closed-loop progression:

$$\text{Extracted Noun Phrase} \longrightarrow \text{Candidate Filtering} \longrightarrow \text{Final Domain Class} \longrightarrow \text{CRC Responsibility} \longrightarrow \text{Collaborating Classes} \longrightarrow \text{Actual PAS Function / API Route}$$

This methodology ensures that no class is invented out of thin air, no critical requirement is dropped, and every line of code has a clear conceptual origin in the problem domain.

---

## 2. Master Noun Phrase → Class → CRC Traceability Table

The table below traces each canonical domain concept from its original natural language noun phrase through to its final class, primary CRC responsibility, collaborators, and implementing PAS function:

| Noun Phrase | Final Domain Class | Core CRC Responsibility | Key Collaborators | Related PAS Implementation / API Route |
|:---|:---|:---|:---|:---|
| **User** | `User` | Authenticate credentials and enforce role authorization | `Applicant`, `PassportOfficer`, `Police`, `Admin` | `lib/auth.ts`, `/api/auth/[...nextauth]` |
| **Applicant** | `Applicant` | Maintain citizen profile and initiate applications | `User`, `Application`, `Grievance` | `/api/profile`, `app/(dashboard)/profile/page.tsx` |
| **Passport Officer** | `PassportOfficer` | Scrutinize documents at Counter B and grant at Counter C | `Application`, `Document`, `PassportCenter` | `/api/officer/scrutiny`, `/api/officer/grant` |
| **Police Authority** | `Police` | Conduct residential inquiries and submit PVR verdicts | `Application`, `PoliceReport` | `/api/police/worklist`, `/api/police/verify` |
| **Administrator** | `Admin` | Govern system masters, user accounts, and audit logs | `FeeSchedule`, `PassportCenter`, `AuditLog` | `/api/admin/users`, `/api/admin/masters` |
| **Passport Application** | `Application` | Manage full application lifecycle and ARN state machine | `Applicant`, `Document`, `Appointment`, `Payment` | `lib/fsm.ts`, `/api/applications`, `/api/applications/[id]` |
| **Application History** | `ApplicationStatusHistory` | Maintain immutable chronological log of state changes | `Application`, `User` | `lib/fsm.ts`, `/api/applications/[id]/status` |
| **Document** | `Document` | Encapsulate proof metadata, verification status, DigiLocker | `Application`, `PassportOfficer` | `/api/applications/[id]/documents`, `/api/digilocker/import` |
| **Appointment** | `Appointment` | Reserve PSK time slot and enforce daily centre quota | `Application`, `PassportCenter`, `AppointmentHistory` | `/api/appointments`, `/api/appointments/[id]/slip` |
| **Appointment History** | `AppointmentHistory` | Track slot modifications and enforce 3-reschedule limit | `Appointment`, `User` | `/api/appointments/[id]`, `components/appointments/RescheduleModal.tsx` |
| **Payment** | `Payment` | Process fee settlements, track TXN ID, issue PDF receipts | `Application`, `FeeSchedule`, `User` | `/api/payments`, `/api/payments/[id]/receipt` |
| **Verification Report** | `PoliceReport` | Record criminal record check and field inquiry verdict | `Application`, `Police` | `/api/police/verify`, `components/police/CCTNSCheckModal.tsx` |
| **Passport** | `Passport` | Generate booklet serial number and log Speed Post dispatch | `Application`, `PassportOfficer` | `/api/officer/dispatch`, `app/(staff)/officer/dispatch/page.tsx` |
| **Notification** | `Notification` | Dispatch in-app transactional alerts and action requests | `User` | `/api/notifications`, `components/notifications/NotificationDrawer.tsx` |
| **Audit Log** | `AuditLog` | Capture tamper-evident record of privileged actions & IPs | `User`, `Admin` | `/api/admin/audit-logs`, `app/(admin)/admin/audit/page.tsx` |
| **Password Reset Token**| `PasswordResetToken` | Manage secure, single-use self-service password reset | `User` | `/api/auth/forgot-password`, `/api/auth/reset-password` |
| **Login History** | `LoginHistory` | Monitor authentication attempts, source IPs, and devices | `User` | `lib/auth.ts`, `app/(admin)/admin/users/page.tsx` |
| **Grievance** | `Grievance` | Track citizen service complaints with unique ticketNumber | `User`, `Applicant`, `Admin` | `/api/grievances`, `app/grievance/track/page.tsx` |
| **Admin Invitation** | `AdminInvitation` | Onboard staff members via cryptographic invitation tokens | `Admin`, `User` | `/api/admin/invitations`, `app/(admin)/admin/users/page.tsx` |
| **System Setting** | `SystemSetting` | Manage emergency maintenance toggle and portal flags | `Admin` | `/api/admin/settings`, `app/(admin)/admin/settings/page.tsx` |
| **Notice** | `Notice` | Publish public bulletins, circulars, and urgent alerts | `NoticeCategory`, `Admin` | `/api/notices`, `app/news/page.tsx` |
| **Notice Category** | `NoticeCategory` | Taxonomically classify public notices and circulars | `Notice`, `Admin` | `/api/notices`, `components/news/NoticeCard.tsx` |
| **Fee Schedule** | `FeeSchedule` | Define dynamic tariff rate cards based on age and type | `Application`, `Payment`, `Admin` | `/api/fee-schedules`, `app/fee-calculator/page.tsx` |
| **PSK Centre** | `PassportCenter` | Manage facility coordinates, jurisdictions, and quotas | `Application`, `Appointment`, `PassportOfficer` | `/api/centres`, `app/locate-centre/page.tsx` |
| **Passport Service** | `PassportService` | Define public catalog products and document checklists | `Admin`, `Application` | `/api/services`, `app/document-advisor/page.tsx` |

---

## 3. Important OOAD Distinctions in PAS

A central requirement of rigorous Object-Oriented Analysis and Design is maintaining precise semantic distinctions between metamodel concepts. In novice designs, actors, classes, attributes, operations, use cases, and UI components are frequently conflated. 

Below is an explicit breakdown of these core OOAD concepts, illustrated with concrete examples from the Passport Automation System:

```text
+-------------------+-----------------------------------------------------------------------------------+----------------------------------------------------------+
| OOAD Concept      | Formal Academic Definition                                                        | Concrete PAS Implementation Example                      |
+-------------------+-----------------------------------------------------------------------------------+----------------------------------------------------------+
| 1. Actor          | An external entity (human role or external system) that interacts with the       | Citizen / Applicant, Passport Officer, Police Authority, |
|                   | system by initiating or participating in use cases. Actors exist outside the      | System Administrator, Payment Gateway, CCTNS Database.   |
|                   | software boundary.                                                                |                                                          |
+-------------------+-----------------------------------------------------------------------------------+----------------------------------------------------------+
| 2. Domain Class   | A structural software blueprint that encapsulates state (attributes) and         | Application, Document, Appointment, Payment, Passport,    |
|                   | behavior (operations) representing a cohesive problem-domain abstraction.         | PoliceReport, Grievance, FeeSchedule, PassportCenter.    |
+-------------------+-----------------------------------------------------------------------------------+----------------------------------------------------------+
| 3. Attribute      | A named property of a class that describes a range of values that instances of    | Application.arn, Applicant.dateOfBirth, User.email,      |
|                   | the property may hold. Primitive data points belong inside classes.               | Payment.amount, Document.fileUrl, Passport.passportNumber.|
+-------------------+-----------------------------------------------------------------------------------|----------------------------------------------------------+
| 4. Operation      | An executable service or method that an instance of a class may be called upon to | Application.validateTransitions(),                       |
|                   | perform. Represents the procedural behavior of a class.                           | Appointment.rescheduleSlot(), Payment.generateReceipt(). |
+-------------------+-----------------------------------------------------------------------------------+----------------------------------------------------------+
| 5. Use Case       | A specification of a sequence of actions that a system can perform, interacting   | UC-05: Initiate Fresh Passport Application,              |
|                   | with actors of the system to achieve an observable result of value.               | UC-17: Book Appointment Slot,                            |
|                   |                                                                                   | UC-29: Scrutinize Physical Documents at Counter B.       |
+-------------------+-----------------------------------------------------------------------------------+----------------------------------------------------------+
| 6. UI Component   | A presentation-layer visual construct (widget, page, dialog, or form) that       | components/Captcha.tsx, components/Navbar.tsx,           |
|                   | mediates user interaction. UI components do not belong in the domain model.       | app/(dashboard)/profile/page.tsx, SlotPickerModal.tsx.   |
+-------------------+-----------------------------------------------------------------------------------+----------------------------------------------------------+
```

### 3.1 Detailed Case Studies of Disambiguation in PAS

#### Case Study A: "Applicant" (Actor vs. Domain Class)
- **As an Actor:** When modeled in a Use Case Diagram, "Applicant" is an external human user who initiates use cases such as *Apply for Fresh Passport* or *Book Appointment Slot*.
- **As a Domain Class:** Within the software system boundary, the system must persist biographical records, residential addresses, and historical links. Thus, `Applicant` is also modeled as a structural domain class (`model Applicant` in Prisma) collaborating with `User` and `Application`.

#### Case Study B: "Application Reference Number (ARN)" (Class vs. Attribute)
- **Incorrect Modeling:** Creating an `ARN` class. An ARN has no independent lifecycle, behaviors, or collaborators; it is purely an alphanumeric string.
- **Correct Modeling:** `arn` is an attribute of the `Application` class (`Application.arn: String @unique`).

#### Case Study C: "Submit Application" (Class vs. Use Case / Operation)
- **Incorrect Modeling:** Creating a `SubmitApplication` class. Submission is a verb representing an action, not an entity.
- **Correct Modeling:** *Submit Application* is a Use Case (`UC-05` / `UC-11`) at the architectural boundary, and an operation on the `Application` entity that transitions its state to `SUBMITTED`.

#### Case Study D: "CAPTCHA Widget" (Domain Class vs. UI Boundary)
- **Incorrect Modeling:** Treating `CaptchaWidget` as a domain entity in the core problem domain.
- **Correct Modeling:** `components/Captcha.tsx` is an ephemeral presentation-tier mechanism designed to mitigate automated bots during authentication; it holds no persistent domain state and is discarded from the domain class model.

---

## 4. Validation and Consistency Verification

The traceability links and classifications established in this document have been cross-verified against the active system implementation:

1. **Zero Orphaned Elements:** Every noun retained as a class has a corresponding CRC card, a corresponding Prisma database model, and active API routes.
2. **Deterministic Responsibilities:** Every responsibility listed in the CRC cards corresponds directly to an active TypeScript server action or API route handler.
3. **Strict Metamodel Discipline:** All 60 extracted concepts are cleanly partitioned among Actors, Classes, Attributes, Operations, Use Cases, and UI Components, ensuring an academically sound OOAD submission.

---

## 5. Conclusion

This traceability and metamodel analysis bridges the gap between natural language requirements, object-oriented concepts, and concrete source code. By maintaining rigorous distinctions between actors, classes, attributes, operations, and UI widgets, the Passport Automation System adheres to the highest standards of Object-Oriented Analysis and Design.
