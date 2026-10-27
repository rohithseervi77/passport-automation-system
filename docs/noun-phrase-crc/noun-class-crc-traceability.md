# Noun Phrase  ->  Class  ->  CRC Traceability & OOAD Classifications
**Passport Automation System (PAS)**  

*Total Traceability Mappings:* 25  

## 1. Master Traceability Table

| Noun Phrase | Final Class | Responsibility | Collaborator | Actual PAS Function |
|:---|:---|:---|:---|:---|
| **User** | `User` | Authenticate credentials and enforce role authorization | `Applicant, PassportOfficer, Police, Admin` | `lib/auth.ts, /api/auth/[...nextauth]` |
| **Applicant** | `Applicant` | Maintain citizen profile and initiate applications | `User, Application, Grievance` | `/api/profile, app/(dashboard)/profile/page.tsx` |
| **Passport Officer** | `PassportOfficer` | Scrutinize documents at Counter B and grant at Counter C | `Application, Document, PassportCenter` | `/api/officer/scrutiny, /api/officer/grant` |
| **Police Authority** | `Police` | Conduct residential inquiries and submit PVR verdicts | `Application, PoliceReport` | `/api/police/worklist, /api/police/verify` |
| **Administrator** | `Admin` | Govern system masters, user accounts, and audit logs | `FeeSchedule, PassportCenter, AuditLog` | `/api/admin/users, /api/admin/masters` |
| **Passport Application** | `Application` | Manage full application lifecycle and ARN state machine | `Applicant, Document, Appointment, Payment` | `lib/fsm.ts, /api/applications` |
| **Application History** | `ApplicationStatusHistory` | Maintain immutable chronological log of state changes | `Application, User` | `lib/fsm.ts, /api/applications/[id]/status` |
| **Document** | `Document` | Encapsulate proof metadata, verification status, DigiLocker | `Application, PassportOfficer` | `/api/applications/[id]/documents` |
| **Appointment** | `Appointment` | Reserve PSK time slot and enforce daily centre quota | `Application, PassportCenter, AppointmentHistory` | `/api/appointments` |
| **Appointment History** | `AppointmentHistory` | Track slot modifications and enforce 3-reschedule limit | `Appointment, User` | `components/appointments/RescheduleModal.tsx` |
| **Payment** | `Payment` | Process fee settlements, track TXN ID, issue PDF receipts | `Application, FeeSchedule, User` | `/api/payments, /api/payments/[id]/receipt` |
| **Verification Report** | `PoliceReport` | Record criminal record check and field inquiry verdict | `Application, Police` | `/api/police/verify, components/police/CCTNSCheckModal.tsx` |
| **Passport** | `Passport` | Generate booklet serial number and log Speed Post dispatch | `Application, PassportOfficer` | `/api/officer/dispatch` |
| **Notification** | `Notification` | Dispatch in-app transactional alerts and action requests | `User` | `/api/notifications` |
| **Audit Log** | `AuditLog` | Capture tamper-evident record of privileged actions & IPs | `User, Admin` | `/api/admin/audit-logs` |
| **Password Reset Token** | `PasswordResetToken` | Manage secure, single-use self-service password reset | `User` | `/api/auth/forgot-password` |
| **Login History** | `LoginHistory` | Monitor authentication attempts, source IPs, and devices | `User` | `lib/auth.ts` |
| **Grievance** | `Grievance` | Track citizen service complaints with unique ticketNumber | `User, Applicant, Admin` | `/api/grievances, app/grievance/track/page.tsx` |
| **Admin Invitation** | `AdminInvitation` | Onboard staff members via cryptographic invitation tokens | `Admin, User` | `/api/admin/invitations` |
| **System Setting** | `SystemSetting` | Manage emergency maintenance toggle and portal flags | `Admin` | `/api/admin/settings` |
| **Notice** | `Notice` | Publish public bulletins, circulars, and urgent alerts | `NoticeCategory` | `/api/notices, app/news/page.tsx` |
| **Notice Category** | `NoticeCategory` | Taxonomically classify public notices and circulars | `Notice, Admin` | `/api/notices, components/news/NoticeCard.tsx` |
| **Fee Schedule** | `FeeSchedule` | Define dynamic tariff rate cards based on age and type | `Application, Payment, Admin` | `/api/fee-schedules, app/fee-calculator/page.tsx` |
| **PSK Centre** | `PassportCenter` | Manage facility coordinates, jurisdictions, and quotas | `Application, Appointment, PassportOfficer` | `/api/centres, app/locate-centre/page.tsx` |
| **Passport Service** | `PassportService` | Define public catalog products and document checklists | `Admin, Application` | `/api/services, app/document-advisor/page.tsx` |

## 2. Important OOAD Distinctions in PAS

| OOAD Concept | Formal Academic Definition | Concrete PAS Implementation Example |
|:---|:---|:---|
| **1. Actor** | An external entity interacting across the system boundary. | `Citizen / Applicant`, `Passport Officer`, `Police Authority`, `System Admin`. |
| **2. Domain Class** | A software blueprint encapsulating state and behavior representing a domain concept. | `Application`, `Document`, `Appointment`, `Payment`, `Passport`. |
| **3. Attribute** | A named primitive property belonging to a class holding internal state. | `Application.arn`, `Applicant.dateOfBirth`, `User.email`, `Payment.amount`. |
| **4. Operation** | An executable method or service that a class instance performs. | `Application.validateTransitions()`, `Appointment.rescheduleSlot()`. |
| **5. Use Case** | A sequence of actions performed by system with actors to yield value. | `UC-05: Initiate Fresh Passport Application`, `UC-17: Book Appointment`. |
| **6. UI Component** | A presentation-layer widget mediating screen interaction. | `components/Captcha.tsx`, `components/Navbar.tsx`, `SlotPickerModal.tsx`. |

