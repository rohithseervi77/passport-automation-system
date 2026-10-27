# System Implementation & Technical Traceability

## 1. Functional Requirements Traceability Matrix (FRTM)

The following matrix maps every high-level software engineering functional requirement to its corresponding Use Case, acting role, and source code module:

| Req ID | Functional Requirement Specification | Realized Use Case | Primary Actor | Source Code Module |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | The system shall permit unauthenticated citizens to browse public notices, circulars, and advisories filterable by category and year. | `UC-02: View Gazette Notices` | Public User | `app/news/page.tsx`<br>`app/api/news/route.ts` |
| **FR-02** | The system shall calculate statutory fees dynamically under Gazette GSR 516(E) based on service, scheme, age, and booklet size. | `UC-03: Calculate Fee` | Public User / Applicant | `app/fee-calculator/page.tsx`<br>`app/api/fees/calculate/route.ts` |
| **FR-03** | The system shall enable citizens to locate regional PSK, POPSK, and RPO offices with addresses, jurisdictional areas, and hours. | `UC-04: Locate Centres` | Public User | `app/locate-centre/page.tsx`<br>`app/api/centres/route.ts` |
| **FR-04** | The system shall allow public tracking of an application status using ARN, Date of Birth, and Captcha verification. | `UC-06: Track Status by ARN` | Public User | `app/track/page.tsx`<br>`app/api/track/route.ts` |
| **FR-05** | The system shall allow citizens to register with email, phone, and password, validated with interactive Captcha. | `UC-08: Register Account` | Applicant | `app/register/page.tsx`<br>`app/api/auth/register/route.ts` |
| **FR-06** | The system shall enforce salted bcrypt password hashing and lock accounts for 30 minutes following 5 consecutive failed logins. | `UC-09: Citizen Login` | Applicant / User | `lib/auth.ts`<br>`app/api/auth/login/route.ts` |
| **FR-07** | The system shall provide single-use, time-limited cryptographic password reset links via email. | `UC-10: Reset Password` | Applicant / User | `app/forgot-password/page.tsx`<br>`app/api/auth/forgot-password/route.ts` |
| **FR-08** | The system shall guide applicants through a 7-step passport application wizard supporting Fresh, Reissue, Normal, and Tatkaal. | `UC-11: Initiate Application` | Applicant | `app/applicant/application/page.tsx`<br>`app/api/applicant/application/route.ts`|
| **FR-09** | The system shall save partial application form progress as drafts and permit subsequent editing prior to submission. | `UC-12: Save Application Draft` | Applicant | `app/applicant/application/page.tsx`<br>`app/api/applicant/application/route.ts`|
| **FR-10** | The system shall enforce mandatory parental consent declarations (Annexure C/D) for applicants under 18 years of age. | `UC-13: Declare Minor Consent`| Applicant | `app/applicant/application/page.tsx`<br>`model Application` |
| **FR-11** | The system shall generate a unique 12-character Application Reference Number (ARN) upon final form submission. | `UC-14: Submit Application` | Applicant | `app/api/applicant/application/route.ts` |
| **FR-12** | The system shall accept PDF and JPG proof attachments up to 2MB, validate MIME types, and store file metadata securely. | `UC-15: Upload Proof Documents`| Applicant | `app/applicant/documents/page.tsx`<br>`app/api/applicant/documents/route.ts`|
| **FR-13** | The system shall simulate electronic DigiLocker document importation for verified identity documents. | `UC-16: Import DigiLocker` | Applicant | `app/api/digilocker/import/route.ts` |
| **FR-14** | The system shall integrate with a simulated payment gateway supporting UPI, Net Banking, and Cards, issuing unique transaction IDs. | `UC-17: Settle Application Fee`| Applicant | `app/applicant/payment/page.tsx`<br>`app/api/applicant/payment/route.ts` |
| **FR-15** | The system shall generate and display a downloadable statutory digital payment receipt upon successful payment settlement. | `UC-18: Download Receipt` | Applicant | `app/applicant/payment/page.tsx`<br>`model Payment` |
| **FR-16** | The system shall enforce PSK slot quotas, permitting appointment booking only for applications with status PAYMENT_COMPLETED. | `UC-20: Book Appointment` | Applicant | `app/applicant/appointment/page.tsx`<br>`app/api/applicant/appointment/route.ts`|
| **FR-17** | The system shall allow slot rescheduling up to a maximum limit of 3 times, logging each event in an appointment history audit trail. | `UC-21: Reschedule Appointment`| Applicant | `app/applicant/appointment/page.tsx`<br>`app/api/applicant/appointment/reschedule`|
| **FR-18** | The system shall provide an interactive simulation of physical PSK counter traversal (Counters A, B, and C). | `UC-23: Simulate PSK Flow` | Applicant | `app/applicant/psk-simulation/page.tsx` |
| **FR-19** | The system shall provide a dedicated dashboard displaying application milestone stepper, action buttons, and alerts. | `UC-24: View Dashboard` | Applicant | `app/applicant/dashboard/page.tsx` |
| **FR-20** | The system shall allow applicants to upload replacement proofs and explanatory notes when a clarification notice is received. | `UC-25: Respond Clarification` | Applicant | `app/applicant/status/page.tsx`<br>`app/api/applicant/status/route.ts` |
| **FR-21** | The system shall provide a public and authenticated citizen grievance logging system with unique ticket identifiers. | `UC-07: Lodge Grievance`<br>`UC-26: Track Grievance` | Public / Applicant | `app/grievance/page.tsx`<br>`app/api/grievance/route.ts` |
| **FR-22** | The system shall display assigned scrutiny dossiers to authenticated Passport Officers filtered by processing stage. | `UC-27: View Scrutiny Queue` | Passport Officer | `app/officer/dashboard/page.tsx`<br>`app/api/officer/applications/route.ts` |
| **FR-23** | The system shall enable Verifying Officers at Counter B to inspect digital documents and mark them VERIFIED or CORRECTION_REQUIRED. | `UC-29: Verify Proofs` | Passport Officer | `app/officer/dashboard/page.tsx`<br>`app/api/officer/action/route.ts` |
| **FR-24** | The system shall allow officers to issue formal clarification notices specifying deficiencies and pausing processing. | `UC-30: Request Clarification` | Passport Officer | `app/officer/dashboard/page.tsx`<br>`app/api/officer/action/route.ts` |
| **FR-25** | The system shall automatically transmit verified dossiers to the jurisdictional police station for address and criminal inquiry. | `UC-31: Transmit to Police` | Passport Officer / System | `app/api/officer/action/route.ts`<br>`model PoliceReport` |
| **FR-26** | The system shall provide Granting Officers with a consolidated view of applicant data, Counter B checklist, and completed PVR. | `UC-32: Review PVR Dossier` | Passport Officer | `app/officer/dashboard/page.tsx` |
| **FR-27** | The system shall generate an 8-character unique passport booklet number upon Granting Officer statutory approval. | `UC-33: Grant Approval` | Passport Officer | `app/api/officer/action/route.ts`<br>`model Passport` |
| **FR-28** | The system shall allow officers to refuse applications citing Section 6 statutory grounds and recording legal justifications. | `UC-34: Reject Application` | Passport Officer | `app/api/officer/action/route.ts`<br>`model Application` |
| **FR-29** | The system shall queue approved applications for laser engraving and simulate physical booklet security printing. | `UC-35: Queue Printing` | Passport Officer | `app/api/officer/action/route.ts`<br>`lib/fsm.ts` |
| **FR-30** | The system shall assign an India Post Speed Post tracking number upon dispatch and notify the citizen via email. | `UC-36: Dispatch Speed Post` | Passport Officer | `app/api/officer/action/route.ts`<br>`model Passport` |
| **FR-31** | The system shall provide a dedicated portal for police stations to inspect assigned verification cases. | `UC-37: View Enquiry Queue` | Police Authority | `app/police/dashboard/page.tsx`<br>`app/api/police/enquiries/route.ts` |
| **FR-32** | The system shall record field verification outcomes (address verified, applicant met, duration of stay, neighbor interviews). | `UC-38: Conduct Enquiry` | Police Authority | `app/police/dashboard/page.tsx`<br>`model PoliceReport` |
| **FR-33** | The system shall simulate cross-checking applicant criminal records against the national CCTNS database. | `UC-39: Search CCTNS DB` | Police Authority | `app/police/dashboard/page.tsx` |
| **FR-34** | The system shall submit signed electronic Police Verification Reports categorized as CLEARED or ADVERSE. | `UC-40: Submit PVR` | Police Authority | `app/api/police/report/route.ts`<br>`model PoliceReport` |
| **FR-35** | The system shall provide administrators with executive KPI metrics on throughput, revenue, and pending queues. | `UC-42: Monitor Analytics` | Administrator | `app/admin/dashboard/page.tsx`<br>`app/api/admin/stats/route.ts` |
| **FR-36** | The system shall enable administrators to manage user accounts, assign RBAC roles, and unlock locked accounts. | `UC-43: Manage Accounts` | Administrator | `app/admin/users/page.tsx`<br>`app/api/admin/users/route.ts` |
| **FR-37** | The system shall support administrative management of the dynamic passport services catalog and fee schedules. | `UC-44: Configure Services`<br>`UC-46: Maintain Fees` | Administrator | `app/admin/fees/page.tsx`<br>`app/api/admin/fees/route.ts` |
| **FR-38** | The system shall allow administrators to create, edit, schedule, pin, and batch import public notices and circulars. | `UC-47: Publish Notices`<br>`UC-48: Batch Import Notices`| Administrator | `app/admin/notices/page.tsx`<br>`app/api/admin/notices/import/route.ts` |
| **FR-39** | The system shall record all security-sensitive actions in an unalterable audit log capturing actor IP, timestamp, and payload. | `UC-43: Manage Accounts` | Administrator | `app/admin/audit-logs/page.tsx`<br>`app/api/admin/audit-logs/route.ts` |

---

## 2. API / Implementation Route Mapping

The table below maps user-facing interactions directly to their backing Next.js Route Handlers and Prisma database actions:

| Use Case ID | User-Facing Frontend Page | Next.js API Route Handler | HTTP Method | Backing Prisma Model Action |
| :--- | :--- | :--- | :---: | :--- |
| `UC-01` | `/services` | `/api/services` | `GET` | `prisma.passportService.findMany()` |
| `UC-02` | `/news`, `/news/[slug]` | `/api/news`, `/api/news/[slug]` | `GET` | `prisma.notice.findMany()`, `findUnique()` |
| `UC-03` | `/fee-calculator` | `/api/fees/calculate` | `GET` | `prisma.feeSchedule.findFirst()` |
| `UC-04` | `/locate-centre` | `/api/centres` | `GET` | `prisma.passportCenter.findMany()` |
| `UC-06` | `/track` | `/api/track` | `GET` | `prisma.application.findFirst({ include: ... })` |
| `UC-07` | `/grievance` | `/api/grievance` | `POST` | `prisma.grievance.create()` |
| `UC-08` | `/register` | `/api/auth/register` | `POST` | `prisma.$transaction([user.create, applicant.create])`|
| `UC-09` | `/login` | `/api/auth/login` | `POST` | `prisma.user.findUnique()`, `loginHistory.create()` |
| `UC-10` | `/forgot-password`, `/reset-password` | `/api/auth/forgot-password`, `reset-password` | `POST` | `passwordResetToken.create()`, `user.update()` |
| `UC-11` | `/applicant/application` | `/api/applicant/application` | `POST` | `prisma.application.create()`, `history.create()` |
| `UC-12` | `/applicant/application` | `/api/applicant/application` | `PATCH` | `prisma.application.update({ status: "DRAFT" })` |
| `UC-14` | `/applicant/application` | `/api/applicant/application` | `POST` | `prisma.$transaction([app.update, history.create])` |
| `UC-15` | `/applicant/documents` | `/api/applicant/documents` | `POST` | `prisma.document.create()` |
| `UC-16` | `/applicant/documents` | `/api/digilocker/import` | `POST` | `prisma.document.createMany()` |
| `UC-17` | `/applicant/payment` | `/api/applicant/payment` | `POST` | `prisma.$transaction([payment.create, app.update])` |
| `UC-19` | `/applicant/appointment` | `/api/applicant/appointment` | `GET` | `prisma.appointment.groupBy()`, `center.findUnique()`|
| `UC-20` | `/applicant/appointment` | `/api/applicant/appointment` | `POST` | `prisma.$transaction([appt.create, app.update])` |
| `UC-21` | `/applicant/appointment` | `/api/applicant/appointment/reschedule` | `POST` | `prisma.$transaction([appt.update, history.create])`|
| `UC-22` | `/applicant/appointment` | `/api/applicant/appointment` | `DELETE` | `prisma.appointment.update({ status: "CANCELLED" })`|
| `UC-24` | `/applicant/dashboard` | `/api/applicant/status` | `GET` | `prisma.application.findUnique({ include: ... })` |
| `UC-25` | `/applicant/status` | `/api/applicant/status` | `POST` | `prisma.$transaction([app.update, doc.create])` |
| `UC-26` | `/grievance` | `/api/grievance` | `GET` | `prisma.grievance.findMany({ where: { userId } })` |
| `UC-27` | `/officer/dashboard` | `/api/officer/applications` | `GET` | `prisma.application.findMany({ where: ... })` |
| `UC-28` | `/officer/dashboard` | `/api/documents/[docId]/signed-url` | `GET` | Storage engine signed URL generation |
| `UC-29` | `/officer/dashboard` | `/api/officer/action` | `POST` | `prisma.document.update({ verificationStatus })` |
| `UC-30` | `/officer/dashboard` | `/api/officer/action` | `POST` | `prisma.application.update({ clarificationReason })`|
| `UC-31` | `/officer/dashboard` | `/api/officer/action` | `POST` | `prisma.$transaction([app.update, policeReport.create])`|
| `UC-33` | `/officer/dashboard` | `/api/officer/action` | `POST` | `prisma.$transaction([passport.create, app.update])` |
| `UC-34` | `/officer/dashboard` | `/api/officer/action` | `POST` | `prisma.application.update({ status: "REJECTED" })` |
| `UC-36` | `/officer/dashboard` | `/api/officer/action` | `POST` | `prisma.passport.update({ dispatchStatus: "DISPATCHED" })`|
| `UC-37` | `/police/dashboard` | `/api/police/enquiries` | `GET` | `prisma.policeReport.findMany({ where: { station } })`|
| `UC-40` | `/police/dashboard` | `/api/police/report` | `POST` | `prisma.$transaction([pvr.update, app.update])` |
| `UC-41` | `/admin/login` | `/api/admin/login` | `POST` | `prisma.admin.findUnique()`, `loginHistory.create()` |
| `UC-42` | `/admin/dashboard` | `/api/admin/stats` | `GET` | `prisma.application.count()`, aggregation queries |
| `UC-43` | `/admin/users` | `/api/admin/users`, `/api/admin/users/[id]/role` | `GET`, `PATCH` | `prisma.user.update({ role, isActive })` |
| `UC-44` | `/admin/settings` | `/api/admin/settings` | `GET`, `POST` | `prisma.systemSetting.upsert()` |
| `UC-45` | `/admin/centres` | `/api/admin/centres`, `/api/admin/centres/[id]` | `GET`, `POST` | `prisma.passportCenter.create()`, `update()` |
| `UC-46` | `/admin/fees` | `/api/admin/fees` | `GET`, `POST` | `prisma.feeSchedule.create()`, `update()` |
| `UC-47` | `/admin/notices` | `/api/admin/notices`, `/api/admin/notices/[id]` | `GET`, `POST` | `prisma.notice.create()`, `update()` |
| `UC-48` | `/admin/notices` | `/api/admin/notices/import` | `POST` | `prisma.notice.createMany()` |
| `UC-48` | `/admin/grievances` | `/api/admin/grievances` | `GET`, `POST` | `prisma.grievance.update({ status: "RESOLVED" })` |

---

## 3. Role-Based Access Control (RBAC) Module Authorization Matrix

The table below catalogs which application functional modules are accessible to each actor role under the security guard implementation in `lib/auth.ts`:

| Functional Module | Public User | Applicant | Passport Officer | Police Authority | Administrator |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Public Services & Discovery** (`/`, `/services`, `/news`) | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** |
| **Statutory Fee Calculator** (`/fee-calculator`) | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** |
| **PSK / POPSK Centre Locator** (`/locate-centre`) | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** |
| **Public ARN Status Tracking** (`/track`) | **ALLOWED** | **ALLOWED** | RESTRICTED | RESTRICTED | RESTRICTED |
| **Citizen Account Registration** (`/register`) | **ALLOWED** | RESTRICTED | RESTRICTED | RESTRICTED | RESTRICTED |
| **Citizen Authentication** (`/login`) | **ALLOWED** | **ALLOWED** | RESTRICTED | RESTRICTED | RESTRICTED |
| **Applicant Dashboard** (`/applicant/dashboard`) | FORBIDDEN | **ALLOWED** | FORBIDDEN | FORBIDDEN | FORBIDDEN |
| **Application Wizard** (`/applicant/application`) | FORBIDDEN | **ALLOWED** | FORBIDDEN | FORBIDDEN | FORBIDDEN |
| **Document Upload & DigiLocker** (`/applicant/documents`) | FORBIDDEN | **ALLOWED** | FORBIDDEN | FORBIDDEN | FORBIDDEN |
| **Fee Payment Gateway** (`/applicant/payment`) | FORBIDDEN | **ALLOWED** | FORBIDDEN | FORBIDDEN | FORBIDDEN |
| **PSK Appointment Booking** (`/applicant/appointment`) | FORBIDDEN | **ALLOWED** | FORBIDDEN | FORBIDDEN | FORBIDDEN |
| **PSK Simulation Walkthrough** (`/applicant/psk-simulation`)| FORBIDDEN | **ALLOWED** | FORBIDDEN | FORBIDDEN | FORBIDDEN |
| **Citizen Clarification Upload** (`/applicant/status`) | FORBIDDEN | **ALLOWED** | FORBIDDEN | FORBIDDEN | FORBIDDEN |
| **Officer Scrutiny Console** (`/officer/dashboard`) | FORBIDDEN | FORBIDDEN | **ALLOWED** | FORBIDDEN | FORBIDDEN |
| **Document Verification Actions** (`/api/officer/action`) | FORBIDDEN | FORBIDDEN | **ALLOWED** | FORBIDDEN | FORBIDDEN |
| **Police Verification Queue** (`/police/dashboard`) | FORBIDDEN | FORBIDDEN | FORBIDDEN | **ALLOWED** | FORBIDDEN |
| **PVR Submission** (`/api/police/report`) | FORBIDDEN | FORBIDDEN | FORBIDDEN | **ALLOWED** | FORBIDDEN |
| **Admin Console & Analytics** (`/admin/dashboard`) | FORBIDDEN | FORBIDDEN | FORBIDDEN | FORBIDDEN | **ALLOWED** |
| **User & Role Administration** (`/admin/users`, `/admin/roles`)| FORBIDDEN | FORBIDDEN | FORBIDDEN | FORBIDDEN | **ALLOWED** |
| **Statutory Fee Schedule Admin** (`/admin/fees`) | FORBIDDEN | FORBIDDEN | FORBIDDEN | FORBIDDEN | **ALLOWED** |
| **Notice Publishing & CSV Import** (`/admin/notices`) | FORBIDDEN | FORBIDDEN | FORBIDDEN | FORBIDDEN | **ALLOWED** |
| **Security Audit Logs & Sessions** (`/admin/security`) | FORBIDDEN | FORBIDDEN | FORBIDDEN | FORBIDDEN | **ALLOWED** |
| **Grievance Redressal Desk** (`/admin/grievances`) | FORBIDDEN | FORBIDDEN | FORBIDDEN | FORBIDDEN | **ALLOWED** |
