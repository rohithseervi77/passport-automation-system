# Table: Requirements Traceability

| Req ID | Functional Requirement Description | Mapped Use Cases | Domain Models | API Endpoint | Frontend Page / Component |
| --- | --- | --- | --- | --- | --- |
| FR-01 | Citizen Self-Registration with Email Verification | UC-01 | User, Applicant | /api/auth/register | app/(auth)/register/page.tsx |
| FR-02 | Role-Based Authentication with CAPTCHA Validation | UC-02 | User, LoginHistory | /api/auth/[...nextauth] | app/(auth)/login/page.tsx |
| FR-03 | Cryptographic Self-Service Password Reset | UC-03 | PasswordResetToken, User | /api/auth/forgot-password | app/(auth)/forgot-password/page.tsx |
| FR-04 | Citizen Profile & Residential Address Management | UC-04 | Applicant, User | /api/profile | app/(dashboard)/profile/page.tsx |
| FR-05 | Fresh Passport Application Initiation with Unique ARN | UC-05 | Application, Applicant | /api/applications | app/(dashboard)/applications/new/page.tsx |
| FR-06 | Reissue / Renewal Passport Workflow Processing | UC-06 | Application, Applicant | /api/applications | app/(dashboard)/applications/new/page.tsx |
| FR-07 | Tatkaal Fast-Track Application Workflow Handling | UC-07 | Application, FeeSchedule | /api/applications | app/(dashboard)/applications/new/page.tsx |
| FR-08 | Incremental Multi-Step Form Persistence & Draft Resumption | UC-08 | Application | /api/applications/[id] | app/(dashboard)/applications/[id]/edit/page.tsx |
| FR-09 | Supporting Document Upload with File Size/Type Validation | UC-09 | Document, Application | /api/applications/[id]/documents | components/applications/DocumentUpload.tsx |
| FR-10 | Simulated DigiLocker Direct Document Verification | UC-10 | Document, Application | /api/digilocker/import | components/applications/DigiLockerModal.tsx |
| FR-11 | Application Final Review & State Transition to SUBMITTED | UC-11 | Application, ApplicationStatusHistory | /api/applications/[id] | app/(dashboard)/applications/[id]/page.tsx |
| FR-12 | Stateless Dynamic Tariff & Fee Calculator Computation | UC-12 | FeeSchedule | /api/fee-schedules | app/fee-calculator/page.tsx |
| FR-13 | Integrated Electronic Payment Processing via Gateway | UC-13 | Payment, Application | /api/payments | app/(dashboard)/payments/page.tsx |
| FR-14 | Verifiable PDF Payment Receipt Generation & Export | UC-14 | Payment, Application | /api/payments/[id]/receipt | components/payments/ReceiptView.tsx |
| FR-15 | Passport Seva Kendra (PSK) Directory Search & Geocoding | UC-15, UC-26 | PassportCenter | /api/centres | app/locate-centre/page.tsx |
| FR-16 | Real-Time Appointment Slot Calendar Availability Checking | UC-16 | Appointment, PassportCenter | /api/appointments | components/appointments/SlotPicker.tsx |
| FR-17 | Appointment Slot Booking with Daily Center Quota Enforcing | UC-17 | Appointment, Application | /api/appointments | app/(dashboard)/appointments/book/page.tsx |
| FR-18 | Appointment Rescheduling with Maximum 3-Attempt Constraint | UC-18 | Appointment, AppointmentHistory | /api/appointments/[id] | components/appointments/RescheduleModal.tsx |
| FR-19 | Appointment Cancellation and Quota Inventory Release | UC-19 | Appointment, PassportCenter | /api/appointments/[id] | components/appointments/CancelModal.tsx |
| FR-20 | Appointment Confirmation Slip Generation with QR Data | UC-20 | Appointment, Application | /api/appointments/[id]/slip | components/appointments/SlipView.tsx |
| FR-21 | Public Application Tracking via ARN & Date of Birth | UC-21 | Application, ApplicationStatusHistory | /api/track | app/track/page.tsx |
| FR-22 | In-App Notification Dispatch & Read Status Management | UC-22 | Notification, User | /api/notifications | components/notifications/NotificationDrawer.tsx |
| FR-23 | Public and Authenticated Grievance Ticket Submission | UC-23 | Grievance, User | /api/grievances | app/grievance/page.tsx |
| FR-24 | Grievance Lifecycle Tracking and Resolution Querying | UC-24 | Grievance | /api/grievances/[id] | app/grievance/track/page.tsx |
| FR-25 | Interactive Guided Document Eligibility Advisor Wizard | UC-25 | PassportService | /api/services | app/document-advisor/page.tsx |
| FR-26 | Public News, Public Notices, and Tender Circulars Portal | UC-27 | Notice, NoticeCategory | /api/notices | app/news/page.tsx |
| FR-27 | Passport Officer Queue Management for Counter B Scrutiny | UC-28 | Application, Appointment | /api/officer/queue | app/(staff)/officer/queue/page.tsx |
| FR-28 | Physical Document Scrutiny & Cross-Verification at Counter B | UC-29 | Document, ApplicationStatusHistory | /api/officer/scrutiny | app/(staff)/officer/scrutiny/[id]/page.tsx |
| FR-29 | Biometric and Facial Photograph Capture Recording | UC-30 | Application, ApplicationStatusHistory | /api/officer/scrutiny | components/officer/BiometricPanel.tsx |
| FR-30 | Officer Clarification / Additional Document Request Dispatch | UC-31 | Application, Notification | /api/officer/scrutiny | components/officer/ClarificationDialog.tsx |
| FR-31 | Passport Granting / Refusal Statutory Decision at Counter C | UC-32 | Application, ApplicationStatusHistory | /api/officer/grant | app/(staff)/officer/grant/[id]/page.tsx |
| FR-32 | Police Verification Worklist Review for Station Jurisdiction | UC-34 | PoliceReport, Application | /api/police/worklist | app/(staff)/police/page.tsx |
| FR-33 | CCTNS Crime Database Background Check Recording | UC-35 | PoliceReport | /api/police/verify | components/police/CCTNSCheckModal.tsx |
| FR-34 | Police Verification Report (Clear/Adverse/Incomplete) Submission | UC-36 | PoliceReport, ApplicationStatusHistory | /api/police/verify | app/(staff)/police/verify/[id]/page.tsx |
| FR-35 | Booklet Serial Number Assignment and Print QC Logging | UC-38 | Passport, Application | /api/officer/dispatch | app/(staff)/officer/printing/page.tsx |
| FR-36 | India Post Speed Post Dispatch Registration & Barcode Generation | UC-39 | Passport, ApplicationStatusHistory | /api/officer/dispatch | app/(staff)/officer/dispatch/page.tsx |
| FR-37 | System Master Management (Tariffs, PSK Quotas, Notices) | UC-40, UC-41, UC-42 | FeeSchedule, PassportCenter, Notice | /api/fee-schedules, /api/centres | app/(admin)/admin/masters/page.tsx |
| FR-38 | User Account Governance, Role Assignment & Invitation Workflow | UC-43, UC-44 | User, AdminInvitation | /api/admin/users, /api/admin/invitations | app/(admin)/admin/users/page.tsx |
| FR-39 | System-Wide Immutable Audit Log Review & Maintenance Controls | UC-45, UC-47 | AuditLog, SystemSetting | /api/admin/audit-logs, /api/admin/settings | app/(admin)/admin/audit/page.tsx |

