# Passport Automation System (PAS) — UML 2.5 Specification & Documentation Suite

## 1. Academic & System Overview

This folder contains the complete, rigorous **Object-Oriented Analysis & Design (OOAD) / Software Engineering** UML 2.5 documentation suite for the **Passport Automation System (PAS)**.

The diagrams in this repository are **not generic templates**; every class, attribute, association, state transition, REST route handler, and deployment node is strictly reverse-engineered from and mapped directly to the actual, running codebase:
- **Application Framework**: Next.js 16+ (App Router, Server Actions, Route Handlers)
- **Frontend / UI**: React 19, TypeScript 5, Tailwind CSS
- **Data Access & ORM**: Prisma ORM 6.x (25 normalized relational models)
- **Database Engine**: PostgreSQL (Production) / SQLite (Local Academic Environment)
- **State Machine Core**: Finite State Machine (`lib/fsm.ts`) enforcing 37 discrete lifecycle stages
- **Statutory Rules Reference**: Passports Act, 1967 & Passport Rules, 1980 (GSR 516E Fee Schedule)

---

## 2. Directory Layout

```text
/UML
│
├── 01-use-case/
│   ├── use-case-diagram.puml              # Full PlantUML source for all actors & use cases
│   ├── use-case-diagram.mmd               # Mermaid source
│   └── use-case-diagram.png               # High-resolution raster diagram
│
├── 02-class/
│   ├── class-diagram.puml                 # PlantUML domain class diagram (25 Prisma entities)
│   ├── class-diagram.mmd                  # Mermaid source
│   └── class-diagram.png                  # High-resolution raster diagram
│
├── 03-state-chart/
│   ├── application-state-chart.puml/.mmd/.png    # Core 37-state Passport Application FSM
│   ├── appointment-state-chart.puml/.mmd/.png    # PSK Slot Booking & Token Lifecycle
│   ├── document-state-chart.puml/.mmd/.png       # Document Scrutiny & Verification Lifecycle
│   ├── police-verification-state-chart.puml/.mmd/.png # PVR Enquiry & CCTNS Background Check
│   ├── grievance-state-chart.puml/.mmd/.png      # Citizen Grievance Redressal Lifecycle
│   └── user-state-chart.puml/.mmd/.png           # Auth Security & 30-min Lockout Lifecycle
│
├── 04-sequence/
│   ├── registration-sequence.puml/.mmd/.png      # Citizen Registration & Captcha Validation
│   ├── application-sequence.puml/.mmd/.png       # Multi-Step Form Submission & Fee Calculation
│   ├── payment-sequence.puml/.mmd/.png           # Gateway Integration & Challan Verification
│   ├── appointment-sequence.puml/.mmd/.png       # PSK Quota Reservation & Token Issuance
│   ├── document-verification-sequence.puml/.mmd/.png # Counter B Original Proof Scrutiny
│   ├── police-verification-sequence.puml/.mmd/.png # Field Verification & PVR Submission
│   ├── tracking-sequence.puml/.mmd/.png          # Public ARN Status Tracking & Postal Transit
│   └── grievance-sequence.puml/.mmd/.png         # Grievance Submission, Inquiry & Resolution
│
├── 05-object/
│   ├── object-diagram.puml/.mmd/.png             # System Instance Snapshot (Dispatched Passport)
│
├── 06-component/
│   ├── component-diagram.puml/.mmd/.png          # Layered Software Component & Interface Architecture
│
├── 07-deployment/
│   ├── deployment-diagram.puml/.mmd/.png         # Vercel Edge, Serverless & Supabase Cloud Architecture
│
├── 08-collaboration/
│   ├── application-collaboration.puml/.mmd/.png  # Communication Diagram with Numbered Messages
│
├── scripts/
│   └── build_uml_pngs.mjs                        # Automated high-resolution PNG generation tool
│
├── README.md                                     # This academic overview
└── UML-INDEX.md                                  # Complete diagram registry & Viva mapping table
```

---

## 3. Core Actors & System Roles

| Actor | Source Mapping | Role Description & Key Responsibilities |
| :--- | :--- | :--- |
| **Public Visitor** | Public Routes (`/news`, `/services`, `/centers`, `/track`) | Unauthenticated citizen who browses official notices, computes passport fees under GSR 516E, locates regional PSK centres, and tracks live application status using ARN and DOB. |
| **Applicant (Citizen)** | `User` (role=`APPLICANT`), `Applicant` model | Registered citizen who completes passport forms (Fresh/Reissue, Normal/Tatkaal), uploads KYC proofs, pays statutory fees, schedules appointments, and files grievances. |
| **Passport Officer** | `User` (role=`PASSPORT_OFFICER`), `PassportOfficer` model | PSK official performing Counter B document scrutiny (`DOCUMENT_VERIFICATION`), capturing biometrics, Counter C granting approval under Section 6 (`OFFICER_REVIEW`), and passport printing/dispatch. |
| **Police Officer** | `User` (role=`POLICE`), `Police` model | Station In-Charge or Field Constable/SI conducting physical address enquiry, checking local CCTNS criminal database, and submitting Favourable (`CLEARED`) or `ADVERSE` PVRs. |
| **Administrator** | `User` (role=`ADMIN`), `Admin` model | System administrator managing user credentials, service categories, regional PSK centers, statutory fee schedules, official gazette notices, and system audit logs. |

---

## 4. Entity Mapping to Actual Codebase

| UML Entity | Prisma Model / Code Source | Primary Responsibilities & Attributes |
| :--- | :--- | :--- |
| `User` | `prisma/schema.prisma` (`model User`) | Central authentication entity; stores email, bcrypt password hash, role enum, account active status, failed login attempt counters, and lockout expiration timestamps. |
| `Applicant` | `prisma/schema.prisma` (`model Applicant`) | Stores citizen biographical details, date of birth, place of birth, father/mother/spouse names, marital status, and physical residential address. |
| `Application` | `prisma/schema.prisma` (`model Application`) | Core transactional entity; stores unique ARN (`ARN-YYYY-XXXXXX`), service type, scheme, booklet size, statutory fee, and current FSM state. |
| `ApplicationStatusHistory` | `prisma/schema.prisma` (`model ApplicationStatusHistory`) | Immutable audit ledger tracking every state transition (`fromStatus` -> `toStatus`), timestamp, actor ID, and regulatory remarks. |
| `Document` | `prisma/schema.prisma` (`model Document`) | Uploaded PDF/JPEG proofs of address, date of birth, non-ECR qualification, and annexures with verification stamps and officer IDs. |
| `Appointment` | `prisma/schema.prisma` (`model Appointment`) | PSK reservation linking applicant to a specific centre, date, time slot, and queue token number (`TOK-A-XXX`). |
| `Payment` | `prisma/schema.prisma` (`model Payment`) | Statutory fee transaction record capturing transaction ID (`TXN-YYYY-XXXXXX`), payment gateway, amount, and payment status (`COMPLETED`). |
| `PoliceReport` | `prisma/schema.prisma` (`model PoliceReport`) | Electronic Police Verification Report (PVR) capturing address verification, criminal background, stay duration, field officer rank, and clearance status. |
| `Passport` | `prisma/schema.prisma` (`model Passport`) | Issued travel document record containing official passport booklet number (`PXXXXXXX`), issue date, expiry date, and Speed Post tracking number. |
| `Grievance` | `prisma/schema.prisma` (`model Grievance`) | Citizen helpdesk ticket (`GRV-YYYY-XXXXX`) recording complaints, priority level, investigation findings, and officer resolution notes. |
| `PassportCenter` | `prisma/schema.prisma` (`model PassportCenter`) | Regional Passport Office (RPO) / Passport Seva Kendra (PSK) metadata, daily slot capacity, and jurisdictional districts. |
| `PassportService` | `prisma/schema.prisma` (`model PassportService`) | Catalog of citizen services (Fresh Passport, Re-issue, Tatkaal, Police Clearance Certificate, Diplomatic) rendered dynamically from database. |
| `FeeSchedule` | `prisma/schema.prisma` (`model FeeSchedule`) | Gazette fee table specifying base fee, tatkaal surcharge, and late fee per service and booklet size. |
| `Notice` | `prisma/schema.prisma` (`model Notice`) | Official public advisory, gazette notice, circular, and news alert managed dynamically by administrators. |
| `AuditLog` | `prisma/schema.prisma` (`model AuditLog`) | Security compliance log capturing critical events, IP addresses, and user actions. |

---

## 5. Editing and Regenerating Diagrams

Both **PlantUML** (`.puml`) and **Mermaid** (`.mmd`) source files are supplied for every diagram:
- **PlantUML (`.puml`)**: Industry-standard, pixel-perfect UML syntax with full support for skin parameters, interfaces, packages, and notes. Can be previewed in VS Code using the *PlantUML extension*.
- **Mermaid (`.mmd`)**: Native markdown-compatible format supported by GitHub, GitLab, and Notion.

### How to Regenerate All PNGs

A custom, automated Node.js generation script is provided at `scripts/build_uml_pngs.mjs`.

To rebuild all 20 diagram images at high resolution:
```bash
node scripts/build_uml_pngs.mjs
```
The script reads each `.puml` file, transmits it to the Kroki rendering engine, and generates the corresponding crisp `.png` file in its folder.
