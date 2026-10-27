# Table: Crc Table

| Class Name | Architectural Role | Core Responsibilities | Collaborating Classes |
| --- | --- | --- | --- |
| User | Security / Identity | Manages identity credentials, password hash, role-based authorization, login history, and token links. | Applicant, PassportOfficer, Police, Admin, LoginHistory, PasswordResetToken |
| Applicant | Domain Profile | Encapsulates citizen personal profile, residential address, emergency contact, and family lineage. | User, Application, Document, Grievance |
| PassportOfficer | Staff Domain | Represents verification staff at PSK; records counter assignments (Counter B / Counter C). | User, PassportCenter, Application, ApplicationStatusHistory, Passport |
| Police | Enforcement Domain | Represents local station police authority; manages field enquiry assignments and report submissions. | User, PoliceReport, Application |
| Admin | System Governance | Represents superuser managing master data, system settings, staff invitations, and audit review. | User, AuditLog, SystemSetting, AdminInvitation, FeeSchedule, PassportCenter, Notice |
| Application | Core Aggregate Root | Maintains ARN, service type, booklet size, applicant links, state transition history, and status flags. | Applicant, PassportCenter, Document, Appointment, Payment, PoliceReport, Passport, ApplicationStatusHistory |
| ApplicationStatusHistory | Audit Trail | Maintains immutable chronological log of state changes, remarks, and user actors. | Application, User |
| Document | Verification Aggregate | Encapsulates uploaded citizen files, verification status, file metadata, and DigiLocker provenance. | Application, PassportOfficer |
| Appointment | Scheduling Domain | Manages appointment booking slots, queue tokens, reporting timestamps, and status lifecycle. | Application, PassportCenter, AppointmentHistory |
| AppointmentHistory | Scheduling Audit | Stores audit trail of booking reschedules, slot changes, cancellations, and operational reasons. | Appointment, User |
| Payment | Financial Domain | Encapsulates transaction reference, payment gateway interactions, receipt generation, and status. | Application, User, External: PaymentGateway |
| PoliceReport | Verification Domain | Encapsulates field verification findings, criminal record checks, report status, and officer comments. | Application, Police, External: CCTNSDatabase |
| Passport | Issuance Aggregate | Maintains issued passport credentials, passport number, booklet type, dispatch tracking, and expiry. | Application, PassportOfficer, External: IndiaPostLogistics |
| Notification | Communication Domain | Maintains in-app alerts, read status, urgency flags, and user dispatch references. | User, External: EmailSMSGateway |
| AuditLog | Compliance / Security | Provides tamper-evident record of privileged actions, IP addresses, actor IDs, and payload diffs. | User, Admin |
| PasswordResetToken | Auth Security | Generates and validates time-bounded cryptographically secure reset hashes for account recovery. | User |
| LoginHistory | Auth Security | Logs user authentication attempts, client IP addresses, user agents, and success/failure flags. | User |
| Grievance | Citizen Redressal | Manages citizen and public grievances, categorization, resolution remarks, and status tracking. | User, Applicant, Admin |
| AdminInvitation | Staff Onboarding | Manages secure single-use invitation tokens for onboarding officers and administrative personnel. | Admin, User |
| SystemSetting | Configuration Master | Provides centralized dynamic configuration for maintenance banners, application fees, and rules. | Admin |
| Notice | Public Information | Maintains public bulletins, advisory circulars, urgent announcements, and publication schedules. | NoticeCategory, Admin |
| NoticeCategory | Taxonomy Master | Provides classification taxonomy for portal notices, alerts, and operational bulletins. | Notice, Admin |
| FeeSchedule | Financial Master | Defines dynamic rate cards based on service type, applicant age, page count, and tatkaal urgency. | Application, Payment, Admin |
| PassportCenter | Logistics Master | Maintains physical PSK/POPSK facility profiles, jurisdiction codes, capacities, and contact info. | Application, Appointment, PassportOfficer, Admin |
| PassportService | Service Catalog | Maintains public catalog of passport services, documentation requirements, and standard SLAs. | Admin, Application |

