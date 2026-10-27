# Candidate Class Identification Using Noun Phrase Approach
**Passport Automation System (PAS)**  
*Total Noun Phrases Extracted:* 60  
*Total Retained Domain Classes:* 25  
*Total Rejected Candidates:* 35  

## 1. Introduction & Methodology

The Noun Phrase Approach (Abbott's technique, 1983) is a natural language heuristic for identifying candidate classes in OOAD. By parsing system requirements, workflows, and database schemas, software engineers extract nouns as candidate entities. Not every noun is a class: attributes, verbs/operations, UI components, and synonyms must be systematically filtered out.

### Filtering Pipeline:
```text
Requirements / System Description
        |
Extract Nouns (60 Extracted)
        |
Remove Duplicates & Synonyms (8 Rejected)
        |
Remove Attributes (11 Rejected)
        |
Remove Operations (6 Rejected)
        |
Remove UI Terms (5 Rejected)
        |
Remove External Systems (5 Rejected)
        |
Final Domain Classes (25 Retained Classes)
```

## 2. Noun Phrase Extraction Table

| No. | Noun Phrase | Source / Context | Candidate Class? | Classification | Reason |
|:---:|:---|:---|:---:|:---|:---|
| 1 | **Applicant** | Citizen module / model Applicant | Yes | Final domain class | Independent citizen profile entity with demographic data and application associations. |
| 2 | **User** | Auth module / model User | Yes | Final domain class | Core authentication principal managing credentials, session tokens, and security roles. |
| 3 | **User Account** | UI authentication forms | No | Duplicate/synonym | Semantic synonym and interface manifestation of the canonical User entity. |
| 4 | **Passport Application** | Core workflow / model Application | Yes | Final domain class | Central aggregate root managing ARN, booklet type, status lifecycle, and links. |
| 5 | **Passport** | Issuance module / model Passport | Yes | Final domain class | Issued physical travel document entity with booklet number, issue date, and expiry. |
| 6 | **Application Reference Number (ARN)** | Application identifier | No | Attribute | Unique business key string attribute belonging to Application (Application.arn). |
| 7 | **Passport Service** | Service catalog / model PassportService | Yes | Final domain class | Domain catalog entity defining offerings, rules, document criteria, and turnaround SLAs. |
| 8 | **Fresh Passport** | Service option / ServiceType.FRESH | No | Enum/value | Enumeration literal value classifying Application and PassportService. |
| 9 | **Re-Issue** | Service option / ServiceType.REISSUE | No | Enum/value | Enumeration literal value indicating renewal due to expiry, exhaustion of pages, or damage. |
| 10 | **Tatkaal** | Scheme / urgency: TATKAAL | No | Attribute | Pricing, queue priority, and processing urgency modifier attribute. |
| 11 | **Police Clearance Certificate (PCC)** | Specialized service offering | No | Enum/value | Specific catalog product instance of PassportService; not a distinct class. |
| 12 | **Document** | Upload module / model Document | Yes | Final domain class | Evidence file entity storing MIME type, URI, DigiLocker authenticity, and verification state. |
| 13 | **Document Type** | Document metadata / DocumentType | No | Enum/value | Categorical enum literal (ADDRESS_PROOF, ID_PROOF, DOB_PROOF, ANNEXURE). |
| 14 | **Payment** | Billing module / model Payment | Yes | Final domain class | Financial transaction entity tracking statutory fees, gateway references, and receipts. |
| 15 | **Fee** | Pricing / Fee schedule | No | Attribute | Numerical currency amount attribute stored in Payment and FeeSchedule. |
| 16 | **Appointment** | Booking module / model Appointment | Yes | Final domain class | Physical PSK appointment slot reservation entity managing date, queue token, and attendance. |
| 17 | **PSK Centre** | Logistics / model PassportCenter | Yes | Final domain class | Physical PSK/POPSK facility entity managing address, capacity, and jurisdiction. |
| 18 | **Passport Officer** | Staff module / model PassportOfficer | Yes | Final domain class | Verification and granting personnel entity managing Counter B and Counter C workflows. |
| 19 | **Police Authority** | Enforcement / model Police | Yes | Final domain class | Station-level police authority entity managing field background inquiries and PVRs. |
| 20 | **Police Verification** | Workflow action / State | No | Operation | Operational lifecycle process and FSM status in lib/fsm.ts; not an independent class. |
| 21 | **Verification Report (PVR)** | Police module / model PoliceReport | Yes | Final domain class | Official police report entity recording residential enquiry and CCTNS check findings. |
| 22 | **Application Status** | State tracking / FSM | No | Attribute | Finite state string attribute governed by lib/fsm.ts finite state machine engine. |
| 23 | **Grievance** | Helpdesk / model Grievance | Yes | Final domain class | Citizen complaint and support ticket entity managing category, remarks, and resolution. |
| 24 | **Grievance Ticket** | Public tracking identifier | No | Duplicate/synonym | Unique ticketNumber tracking string attribute belonging to Grievance. |
| 25 | **Address** | Residential data | No | Attribute | Compound demographic address attributes stored in Applicant and PassportCenter. |
| 26 | **Applicant Profile** | Citizen dashboard UI | No | Duplicate/synonym | Presentation view presenting the Applicant domain entity on the citizen dashboard. |
| 27 | **Notification** | Alerts / model Notification | Yes | Final domain class | In-app transactional alert entity tracking message, read timestamp, and recipient. |
| 28 | **Announcement / Notice** | Public info / model Notice | Yes | Final domain class | Public advisory, circular, and news item entity published on the portal. |
| 29 | **Administrator** | Governance / model Admin | Yes | Final domain class | System administrator entity managing masters, users, invitations, and system settings. |
| 30 | **Role** | Security enum / Role | No | Enum/value | Security classification enumeration literal (APPLICANT, OFFICER, POLICE, ADMIN). |
| 31 | **Application History** | Audit / model ApplicationStatusHistory | Yes | Final domain class | Immutable chronological log entity capturing every lifecycle state transition and remark. |
| 32 | **Tracking Record** | Public tracking view | No | Operation | Dynamic search query operation and view derived from Application and history. |
| 33 | **Dispatch** | Logistics action / State | No | Operation | Operational workflow action performed by officer and logged on Passport. |
| 34 | **Passport Booklet** | Physical stationery | No | Duplicate/synonym | Physical stationery asset represented digitally by the Passport model. |
| 35 | **Document Checklist** | Advisor wizard view | No | UI element | Dynamic client-side presentation checklist generated by the guided Document Advisor. |
| 36 | **Appointment History** | Audit / model AppointmentHistory | Yes | Final domain class | Audit log entity tracking appointment rescheduling, cancellations, and former slots. |
| 37 | **Audit Log** | Security / model AuditLog | Yes | Final domain class | Tamper-evident security log entity capturing actor, action, IP, and timestamp. |
| 38 | **Password Reset Token** | Auth security / model PasswordResetToken | Yes | Final domain class | Cryptographic ephemeral token entity managing time-bounded password recovery. |
| 39 | **Login History** | Security monitoring / model LoginHistory | Yes | Final domain class | Audit entity tracking authentication attempts, IP address, user agent, and success flag. |
| 40 | **Admin Invitation** | Staff onboarding / model AdminInvitation | Yes | Final domain class | Secure invitation entity with cryptographic token for onboarding staff users. |
| 41 | **System Setting** | Configuration / model SystemSetting | Yes | Final domain class | Dynamic configuration entity storing key-value pairs for maintenance and portal flags. |
| 42 | **Notice Category** | Master taxonomy / model NoticeCategory | Yes | Final domain class | Taxonomic classification entity grouping notices into General, Alert, Tender, etc. |
| 43 | **Fee Schedule** | Tariff master / model FeeSchedule | Yes | Final domain class | Master rate-card entity specifying base fee, tatkaal surcharge, and page variants. |
| 44 | **First Name / Last Name** | Profile attributes | No | Attribute | Primitive demographic string attributes belonging to Applicant. |
| 45 | **Date of Birth** | Profile attribute | No | Attribute | Primitive temporal attribute (DateTime) belonging to Applicant. |
| 46 | **Gender** | Profile attribute | No | Attribute | Demographic classification string attribute belonging to Applicant. |
| 47 | **Email** | Identity attribute | No | Attribute | Unique communication string attribute belonging to User. |
| 48 | **Phone Number** | Identity attribute | No | Attribute | Contact string attribute belonging to Applicant and User. |
| 49 | **Password Hash** | Security credential | No | Attribute | Encrypted bcrypt credential string attribute belonging to User. |
| 50 | **Submit Application** | Workflow action | No | Operation | Business use-case operation transitioning Application to SUBMITTED. |
| 51 | **Calculate Fee** | Tariff computation | No | Operation | Stateless algorithmic business logic function in lib/fee-calculator.ts. |
| 52 | **Verify Documents** | Scrutiny action | No | Operation | Interactive scrutiny operation executed by PassportOfficer at Counter B. |
| 53 | **Grant Passport** | Statutory adjudication | No | Operation | Statutory adjudication operation executed by PassportOfficer at Counter C. |
| 54 | **Dashboard** | Web presentation | No | UI element | Client-side React page container (app/(dashboard)/...). |
| 55 | **CAPTCHA Widget** | Security UI element | No | UI element | Presentation component (components/Captcha.tsx) validating human interaction. |
| 56 | **Navigation Bar** | UI layout element | No | UI element | Structural client layout component (components/Navbar.tsx). |
| 57 | **Modal Dialog** | UI interactive window | No | UI element | Client-side presentation popup for alerts and confirmations. |
| 58 | **Payment Gateway** | External service | No | External concept | External third-party financial processor communicating via API. |
| 59 | **CCTNS Database** | External law enforcement | No | External concept | External criminal records database queried during police verification. |
| 60 | **India Post Logistics** | External carrier | No | External concept | External postal delivery carrier handling Speed Post consignment tracking. |

## 3. Candidate Class Filtering

### 3.1 Retained Domain Classes (25 Classes)
The 25 retained classes correspond 1:1 with active models in `prisma/schema.prisma`:
- **User**: Authentication & Security
- **Applicant**: Citizen Demographic Profile
- **PassportOfficer**: Staff Verification & Adjudication
- **Police**: Jurisdictional Police Authority
- **Admin**: System Governance & Superuser
- **Application**: Core Aggregate Root
- **ApplicationStatusHistory**: FSM Lifecycle Audit Trail
- **Document**: Evidence & Proof Management
- **Appointment**: Physical PSK Slot Scheduling
- **AppointmentHistory**: Appointment Reschedule Audit
- **Payment**: Financial Transaction Processing
- **PoliceReport**: Background Verification Verdict
- **Passport**: Issued Travel Credential
- **Notification**: In-App User Communication
- **AuditLog**: Security & Governance Audit
- **PasswordResetToken**: Ephemeral Auth Security
- **LoginHistory**: Security Monitoring
- **Grievance**: Citizen Redressal & Helpdesk
- **AdminInvitation**: Staff Onboarding Security
- **SystemSetting**: Dynamic Portal Configuration
- **Notice**: Public Information & Circulars
- **NoticeCategory**: Notice Taxonomy Master
- **FeeSchedule**: Master Tariff Configuration
- **PassportCenter**: Physical PSK Facility Master
- **PassportService**: Public Service Catalog

### 3.2 Attributes (11 Discarded Candidates)
Primitive properties belonging inside classes: ARN, Date of Birth, Gender, Email, Phone Number, Password Hash, Fee, Address, Application Status, Role, Document Type.

### 3.3 Operations / Verbs (6 Discarded Candidates)
Procedural behaviors and methods: Submit Application, Calculate Fee, Verify Documents, Grant Passport, Conduct Police Check, Dispatch Booklet.

### 3.4 UI / Presentation Elements (5 Discarded Candidates)
Client-side interface widgets: Dashboard, Navigation Bar, CAPTCHA Widget, Modal Dialog, Document Checklist Wizard.

### 3.5 Duplicate / Synonymous Concepts (8 Discarded Candidates)
Redundant natural language terms: User Account (synonym of User), PSK Centre (PassportCenter), Applicant Profile (Applicant), Passport Booklet (Passport), Fresh/Reissue/Tatkaal/PCC (ServiceType literals).

### 3.6 External Concepts / Actors (5 Discarded Candidates)
External autonomous boundaries: Payment Gateway, CCTNS Database, India Post Logistics, DigiLocker API, SMS/Email Gateway.

## 4. Final Candidate Classes

| No. | Final Class | Purpose in PAS | Main Responsibilities |
|:---:|:---|:---|:---|
| 1 | **User** | Authentication & Security | Authenticates credentials, manages role boundaries (APPLICANT, OFFICER, POLICE, ADMIN), and tracks login history. |
| 2 | **Applicant** | Citizen Demographic Profile | Maintains citizen demographic information, residential addresses, family lineage, and application links. |
| 3 | **PassportOfficer** | Staff Verification & Adjudication | Manages Counter B physical scrutiny, biometric registration, and Counter C statutory granting decisions. |
| 4 | **Police** | Jurisdictional Police Authority | Reviews station-level verification worklists, conducts field inquiries, and submits formal PVR reports. |
| 5 | **Admin** | System Governance & Superuser | Manages master fee schedules, centre quotas, staff invitation tokens, system settings, and audit logs. |
| 6 | **Application** | Core Aggregate Root | Maintains unique ARN, multi-step form data, booklet size, and enforces legal FSM transitions via lib/fsm.ts. |
| 7 | **ApplicationStatusHistory** | FSM Lifecycle Audit Trail | Preserves immutable chronological log of state transitions, acting user IDs, and operational remarks. |
| 8 | **Document** | Evidence & Proof Management | Manages uploaded proof files (PDF/JPEG), DigiLocker authenticity flags, and officer verification verdicts. |
| 9 | **Appointment** | Physical PSK Slot Scheduling | Manages appointment reservations, enforces daily centre booking quotas, and tracks PSK check-in tokens. |
| 10 | **AppointmentHistory** | Appointment Reschedule Audit | Logs previous appointment bookings and strictly enforces the business limit of maximum 3 reschedules. |
| 11 | **Payment** | Financial Transaction Processing | Encapsulates statutory fee payments, gateway transaction codes (TXN-YYYY-XXXX), and PDF receipts. |
| 12 | **PoliceReport** | Background Verification Verdict | Encapsulates field inquiry findings, CCTNS criminal checks, and formal verdict (CLEAR, ADVERSE, INCOMPLETE). |
| 13 | **Passport** | Issued Travel Credential | Generates unique booklet serial number, issue/expiry dates, and registers Speed Post consignment tracking. |
| 14 | **Notification** | In-App User Communication | Dispatches transactional alerts, action requests, and reminders, tracking read/unread status. |
| 15 | **AuditLog** | Security & Governance Audit | Provides tamper-evident record of privileged actions, client IP addresses, actor IDs, and payload diffs. |
| 16 | **PasswordResetToken** | Ephemeral Auth Security | Manages time-bounded, cryptographically secure hash tokens for self-service password recovery. |
| 17 | **LoginHistory** | Security Monitoring | Logs all authentication attempts, recording client IP, user agent, timestamps, and success flags. |
| 18 | **Grievance** | Citizen Redressal & Helpdesk | Manages citizen inquiries/complaints, unique ticket numbers, priority levels, and resolution remarks. |
| 19 | **AdminInvitation** | Staff Onboarding Security | Generates and validates cryptographic invitation tokens for onboarding officers and administrative staff. |
| 20 | **SystemSetting** | Dynamic Portal Configuration | Maintains system-wide key-value configuration flags (maintenance mode, alert banners, operational limits). |
| 21 | **Notice** | Public Information & Circulars | Manages official advisories, holiday lists, public circulars, and publication schedules on the portal. |
| 22 | **NoticeCategory** | Notice Taxonomy Master | Provides taxonomic categorization for public notices (e.g., General, Alert, Tender, Circular). |
| 23 | **FeeSchedule** | Master Tariff Configuration | Governs statutory fee calculations based on service type, page count (36 vs 60), age tier, and urgency. |
| 24 | **PassportCenter** | Physical PSK Facility Master | Represents physical PSK and POPSK facilities, managing geographical coordinates, jurisdictions, and daily quotas. |
| 25 | **PassportService** | Public Service Catalog | Defines public service offerings, document eligibility rules, standard processing times, and descriptions. |

