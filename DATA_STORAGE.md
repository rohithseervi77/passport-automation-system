# Data Storage Architecture & Specification

## 1. Executive Summary

The **Passport Automation System (PAS)** operates an enterprise hybrid storage architecture designed for security, auditability, and scalability in compliance with high-assurance government service simulations:

1. **Relational / Structured Data**: Hosted on **Supabase PostgreSQL** and queried using **Prisma ORM 7** with direct pooling via `@prisma/adapter-pg`.
2. **Unstructured File Data**: Stored in a private **Supabase Storage** bucket (`passport-documents`) and accessed exclusively through server-minted short-lived signed URLs (5-minute TTL).

```text
┌─────────────────────────────────────────────────────────────┐
│                 PAS Web Client (Next.js 16)                 │
└──────────────┬──────────────────────────────▲───────────────┘
               │ (1) Authenticated Request    │ (4) Signed URL (5-min TTL)
               ▼                              │
┌─────────────────────────────────────────────────────────────┐
│              Next.js Server API (Route Handlers)            │
│  - Session Verification (jose HS256)                        │
│  - Role-Based Access Control (RBAC)                         │
│  - Application Ownership Checks                             │
│  - Comprehensive Audit Logger                               │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
    (2) Structured Metadata         (3) Binary Upload / Signed URL
               ▼                              ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│     Prisma ORM 7 (pg)       │ │     Supabase Storage        │
│              ▼              │ │              ▼              │
│    Supabase PostgreSQL      │ │ Private 'passport-documents'│
│   (Port 6543 Pooler / RLS)  │ │   {appId}/{type}/{file}     │
└─────────────────────────────┘ └─────────────────────────────┘
```

---

## 2. Storage Mapping by Data Category

| Data Category | Target Store | Format | Security & Access Controls |
|---|---|---|---|
| **User & Authentication** | Supabase PostgreSQL (`User`) | Relational Rows | Passwords hashed with `bcryptjs` (salt 10-12); brute-force lockout. |
| **Applicant Profiles** | Supabase PostgreSQL (`Applicant`) | Relational Rows | Foreign key to `User`; 1:1 applicant relationship. |
| **Passport Applications** | Supabase PostgreSQL (`Application`) | Relational Rows | Indexed by `applicationId` (ARN), `status`, `applicantId`. |
| **Status History / Audit** | Supabase PostgreSQL (`ApplicationStatusHistory`, `AuditLog`) | Append-Only Rows | Immutable event log with IP, user agent, timestamp, actor ID. |
| **Document Metadata** | Supabase PostgreSQL (`Document`) | Relational Rows | Tracks storage path, SHA/MIME type, size, verification status. |
| **Physical Documents** (PDF/JPG/PNG) | Supabase Storage (`passport-documents`) | Binary Objects | **Private bucket**. No public access. 5MB quota. Strict MIME filter. |
| **Appointments** | Supabase PostgreSQL (`Appointment`) | Relational Rows | Slot locking with compound index `(date, timeSlot)`. |
| **Fee Transactions** | Supabase PostgreSQL (`Payment`) | Relational Rows | Unique transaction reference, base & Tatkaal fee breakdown. |
| **Police Verification Reports** | Supabase PostgreSQL (`PoliceReport`) | Relational Rows | Clearances, station codes, adverse reasons, and officer timestamps. |
| **Issued Passports** | Supabase PostgreSQL (`Passport`) | Relational Rows | 36/60-page booklet numbers, 10-year validity, India Post tracking numbers. |

---

## 3. Supabase Storage: Object Structure & Life Cycle

### 3.1 Bucket Configuration
- **Bucket ID**: `passport-documents`
- **Visibility**: `false` (Strictly Private)
- **Maximum File Size**: `5242880` bytes (5 MB)
- **Allowed MIME Types**:
  - `application/pdf`
  - `image/jpeg`
  - `image/png`
  - `image/webp`

### 3.2 Directory Hierarchy
Objects are stored hierarchically to prevent namespace collisions and simplify authorization checks:

```text
passport-documents/
├── APP-20261025-4921/
│   ├── proof_of_date_of_birth/
│   │   └── 1729864200000-aadhaar_card.pdf
│   ├── proof_of_present_address/
│   │   └── 1729864201000-electricity_bill.pdf
│   └── proof_of_identity/
│       └── 1729864202000-voter_card.pdf
└── APP-20261024-8832/
    └── ...
```

### 3.3 Temporary Signed URL Strategy
Confidential citizen identification documents are never exposed through permanent or public URLs.
1. When an applicant, verifying officer, or police authority requests document inspection, the server verifies authentication, role, and application association.
2. The server calls `supabase.storage.from('passport-documents').createSignedUrl(storagePath, 300)`.
3. The resulting signed URL includes an HMAC token that expires in **300 seconds (5 minutes)**.
4. Any attempt to use an expired or tampered link is rejected with HTTP 403 by Supabase Storage.

---

## 4. Database Schema Specification

### 4.1 Key Relational Models
- **`User`**: Account credentials, role flag (`APPLICANT`, `OFFICER`, `POLICE`, `ADMIN`), lockout tracking.
- **`Application`**: Master state record containing personal, family, residential, emergency, and previous passport details.
- **`Document`**:
  ```prisma
  model Document {
    id                 Int       @id @default(autoincrement())
    docId              String    @unique
    documentType       String
    fileStatus         String    @default("UPLOADED")
    fileUrl            String?
    fileName           String?
    fileSize           Int?
    storagePath        String?
    mimeType           String?
    verificationStatus String    @default("PENDING")
    verifiedBy         String?
    verifiedAt         DateTime?
    uploadedAt         DateTime  @default(now())
    applicationId      Int
    application        Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  }
  ```
- **`AuditLog`**:
  ```prisma
  model AuditLog {
    id        Int      @id @default(autoincrement())
    userId    Int?
    action    String
    entityId  String?
    details   String?
    ipAddress String?
    userAgent String?
    createdAt DateTime @default(now())
  }
  ```

---

## 5. Performance Optimization & Compound Indexes

To ensure sub-second response times under high concurrency, the following indexes are maintained in Supabase PostgreSQL:

```sql
-- Application Lookups
CREATE INDEX "Application_status_idx" ON "Application"("status");
CREATE INDEX "Application_applicantId_idx" ON "Application"("applicantId");
CREATE INDEX "Application_officerId_idx" ON "Application"("officerId");
CREATE INDEX "Application_submissionDate_idx" ON "Application"("submissionDate");
CREATE INDEX "Application_status_category_idx" ON "Application"("status", "applicationCategory");

-- Document Metadata
CREATE INDEX "Document_applicationId_idx" ON "Document"("applicationId");
CREATE INDEX "Document_documentType_idx" ON "Document"("documentType");
CREATE INDEX "Document_verificationStatus_idx" ON "Document"("verificationStatus");

-- Audit Log & Analytics
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
```

---

## 6. Backup, Archival & Disaster Recovery

1. **Automated Point-in-Time Recovery (PITR)**: Provided natively by Supabase PostgreSQL for up to 7-30 days of continuous transaction logs.
2. **Scheduled Backups**: Daily database dumps via `pg_dump` automated via GitHub Actions or Supabase CLI.
3. **Storage Replication**: Supabase Storage objects are backed by multi-region AWS S3 buckets with 99.999999999% (11 9s) durability.
4. **Data Portability**: The included script `scripts/migrate_sqlite_to_supabase.mjs` allows bi-directional sync and backup export between SQLite snapshots and cloud PostgreSQL instances.
