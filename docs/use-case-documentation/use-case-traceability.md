# Candidate Class ➔ CRC ➔ Use Case Traceability Matrix

## 1. Methodological Purpose of the Traceability Chain

A foundational criterion for university-level Object-Oriented Analysis and Design (OOAD) is **rigorous traceability**. Every conceptual entity identified during linguistic noun phrase extraction must be accounted for across CRC behavioral modeling, use case realization, and actual code-level backend implementation:

```
[Noun Phrase Analysis] ──▶ [Candidate Domain Class] ──▶ [CRC Responsibility] ──▶ [Use Case Realization] ──▶ [Code / Database Model]
```

This ensures that:
1. No orphan classes exist without operational responsibilities or use case support.
2. No use cases exist without supporting domain entity collaborators.
3. The software architecture faithfully reflects the problem domain.

---

## 2. End-to-End OOAD Traceability Matrix

| Candidate Class | Primary CRC Responsibility | Realized Use Case(s) | Primary Actor | Implementation File / Model |
| :--- | :--- | :--- | :--- | :--- |
| **`User`** | Manage authentication credentials, enforce RBAC roles, track security lockouts. | `UC-08: Register Account`<br>`UC-09: Login`<br>`UC-10: Reset Password`<br>`UC-43: Manage User Accounts` | Applicant / Officer / Police / Admin | `lib/auth.ts`<br>`model User` |
| **`Applicant`** | Maintain citizen demographic profile, address particulars, application ownership. | `UC-08: Register Account`<br>`UC-11: Initiate Application`<br>`UC-24: View Dashboard` | Applicant | `app/applicant/dashboard/page.tsx`<br>`model Applicant` |
| **`Application`** | Core transactional aggregate root; multi-step dossier fields, FSM state enforcement. | `UC-11: Initiate Application`<br>`UC-12: Save Draft`<br>`UC-14: Submit Application`<br>`UC-25: Respond Clarification` | Applicant / Officer | `app/api/applicant/application/route.ts`<br>`model Application`<br>`lib/fsm.ts` |
| **`ApplicationStatusHistory`** | Immutable append-only state transition audit trail, timestamps, and officer remarks. | `UC-06: Track Status by ARN`<br>`UC-14: Submit Application`<br>`UC-24: View Dashboard`<br>`UC-33: Grant Approval` | System / Officer / Police | `lib/fsm.ts`<br>`model ApplicationStatusHistory` |
| **`Document`** | Encapsulate scanned KYC proof metadata, storage URIs, and verification status lifecycle. | `UC-15: Upload Proof Documents`<br>`UC-16: Import DigiLocker`<br>`UC-28: Scrutinize Proofs`<br>`UC-29: Verify Proofs` | Applicant / Passport Officer | `app/api/applicant/documents/route.ts`<br>`model Document` |
| **`Appointment`** | Manage PSK reservation quotas, 15-minute slot allocations, and queue token issuance. | `UC-19: Query Slots`<br>`UC-20: Book Appointment`<br>`UC-21: Reschedule Appointment`<br>`UC-22: Cancel Appointment` | Applicant | `app/api/applicant/appointment/route.ts`<br>`model Appointment` |
| **`AppointmentHistory`** | Audit trail of appointment reschedules, previous slots, and reasons. | `UC-21: Reschedule Appointment` | Applicant | `app/api/applicant/appointment/reschedule/route.ts`<br>`model AppointmentHistory` |
| **`Payment`** | Record statutory fee transaction, gateway reference ID, payment mode, and receipt. | `UC-17: Settle Application Fee`<br>`UC-18: Download Receipt` | Applicant | `app/api/applicant/payment/route.ts`<br>`model Payment` |
| **`PoliceReport`** | Electronic Police Verification Report (PVR); field findings, CCTNS checks, clearance status. | `UC-31: Transmit to Police`<br>`UC-38: Conduct Enquiry`<br>`UC-39: Search CCTNS`<br>`UC-40: Submit PVR` | Police Authority / Passport Officer | `app/api/police/report/route.ts`<br>`model PoliceReport` |
| **`Passport`** | Sovereign travel document record; booklet number (`PXXXXXXX`), validity dates, Speed Post tracking. | `UC-33: Grant Approval`<br>`UC-35: Queue Printing`<br>`UC-36: Dispatch Speed Post`<br>`UC-06: Track Application` | Passport Officer / Public User | `app/api/officer/action/route.ts`<br>`model Passport` |
| **`PassportOfficer`** | Manage Counter B document verification, clarification notices, Counter C granting, and dispatch. | `UC-27: View Scrutiny Queue`<br>`UC-28: Scrutinize Proofs`<br>`UC-30: Request Clarification`<br>`UC-33: Grant Approval`<br>`UC-34: Reject Application` | Passport Officer | `app/officer/dashboard/page.tsx`<br>`app/api/officer/applications/route.ts`<br>`model PassportOfficer` |
| **`Police`** | Station jurisdiction management, field enquiry dispatch, criminal database screening. | `UC-37: View Enquiry Queue`<br>`UC-38: Conduct Enquiry`<br>`UC-40: Submit PVR` | Police Authority | `app/police/dashboard/page.tsx`<br>`app/api/police/enquiries/route.ts`<br>`model Police` |
| **`Admin`** | System governance, role administration, security lockout overrides, master registry control. | `UC-41: Admin Login`<br>`UC-42: Monitor Analytics`<br>`UC-43: Manage Accounts`<br>`UC-48: Redress Grievances` | Administrator | `app/admin/dashboard/page.tsx`<br>`app/api/admin/users/route.ts`<br>`model Admin` |
| **`PassportCenter`** | Regional PSK, POPSK, and RPO master registry, daily capacities, slot limits. | `UC-04: Locate Centres`<br>`UC-19: Query Slots`<br>`UC-45: Manage PSK Centres` | Public User / Applicant / Admin | `app/api/centres/route.ts`<br>`model PassportCenter` |
| **`PassportService`** | Database-driven catalog of citizen services, eligibility criteria, document checklists. | `UC-01: Browse Services`<br>`UC-05: Query Checklist`<br>`UC-11: Initiate Application`<br>`UC-44: Configure Services` | Public User / Applicant / Admin | `app/api/services/route.ts`<br>`model PassportService` |
| **`FeeSchedule`** | Statutory pricing rules under GSR 516(E), Tatkaal surcharges, age discount formulas. | `UC-03: Calculate Fee`<br>`UC-11: Initiate Application`<br>`UC-17: Settle Fee`<br>`UC-46: Maintain Fees` | Public User / Applicant / Admin | `app/api/fees/calculate/route.ts`<br>`model FeeSchedule` |
| **`Notice`** | Official gazette circulars, advisories, multi-year filtering, batch import. | `UC-02: View Notices`<br>`UC-47: Publish Notices`<br>`UC-48: Batch Import Notices` | Public User / Admin | `app/api/news/route.ts`<br>`app/api/admin/notices/route.ts`<br>`model Notice` |
| **`NoticeCategory`** | Taxonomy and display ordering for public circulars and notifications. | `UC-02: View Notices`<br>`UC-47: Publish Notices` | Public User / Admin | `model NoticeCategory` |
| **`Grievance`** | Citizen helpdesk tickets, investigation remarks, formal resolution logging. | `UC-07: Lodge Grievance`<br>`UC-26: Track Grievance`<br>`UC-48: Triage Grievances` | Public User / Applicant / Admin | `app/api/grievance/route.ts`<br>`app/api/admin/grievances/route.ts`<br>`model Grievance` |
| **`Notification`** | Real-time user transactional alerts (fee receipts, appointments, dispatch alerts). | `UC-17: Settle Fee`<br>`UC-20: Book Appointment`<br>`UC-36: Dispatch Speed Post` | Applicant / User | `app/api/notifications/route.ts`<br>`model Notification` |
| **`AuditLog`** | Compliance and forensic logging of privileged actions, IP addresses, and payloads. | `UC-43: Manage User Accounts`<br>`UC-42: Monitor Analytics` | Administrator | `app/api/admin/audit-logs/route.ts`<br>`model AuditLog` |
| **`LoginHistory`** | User session security tracking, login timestamps, session revocation. | `UC-09: Login`<br>`UC-41: Admin Login`<br>`UC-43: Manage User Accounts` | User / Administrator | `app/api/admin/security/sessions/route.ts`<br>`model LoginHistory` |
| **`PasswordResetToken`** | Cryptographic single-use token generation and expiration enforcement. | `UC-10: Reset Password` | Applicant / User | `app/api/auth/forgot-password/route.ts`<br>`app/api/auth/reset-password/route.ts`<br>`model PasswordResetToken` |
| **`AdminInvitation`** | Tokenized invitation links for onboarding new administrative staff. | `UC-43: Manage User Accounts` | Administrator | `app/api/admin/invitations/route.ts`<br>`model AdminInvitation` |
| **`SystemSetting`** | Portal-wide system configuration parameters and operational switches. | `UC-42: Monitor Analytics` | Administrator | `app/api/admin/settings/route.ts`<br>`model SystemSetting` |

---

## 3. Completeness Verification

- **Total Extracted Candidate Nouns:** 52
- **Discarded False Candidates (Attributes, Operations, UI artifacts, Enums):** 27
- **Retained Final Domain Classes:** 25
- **Mapped CRC Cards:** 25
- **Mapped Functional Use Cases:** 48
- **Mapped Prisma Database Models:** 25 (100% 1-to-1 correspondence with `prisma/schema.prisma`)
- **Orphan Entities Discovered:** 0 (Zero orphaned entities; every domain class participates directly in at least one documented use case)
