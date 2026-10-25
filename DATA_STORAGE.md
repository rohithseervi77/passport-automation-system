# Data Storage Architecture & Specification

## 1. Executive Summary

The **Passport Automation System (PAS)** operates an enterprise hybrid storage architecture where **Supabase serves as the central platform**:

1. **Authentication & Identity**: Governed exclusively by **Supabase Auth**. All user credentials, password hashing, and session tokens are isolated within Supabase's secure auth vault. **Zero passwords (plaintext or hashed) are stored in the application PostgreSQL database.**
2. **Relational / Structured Data**: Hosted on **Supabase PostgreSQL** and queried using **Prisma ORM 7** with direct pooling via `@prisma/adapter-pg`.
3. **Login & Security Audit**: Authentication events, successful logins, and failed attempts are recorded in the dedicated `LoginHistory` table (without storing attempted passwords) alongside Supabase Auth's native audit logs.
4. **Unstructured File Data**: Stored in a private **Supabase Storage** bucket (`passport-documents`) and accessed exclusively through server-minted short-lived signed URLs (5-minute TTL).

```text
                         PAS
                          |
                       Next.js
                          |
          +---------------+---------------+
          |               |               |
          v               v               v
    Supabase Auth    PostgreSQL       Supabase Storage
          |               |               |
          |               |               |
       Users          PAS Data        Documents
          |               |               |
          |               |          Private Files
          |
    Login / Sessions
    Authentication
    Password Security (Zero DB Passwords)
```

---

## 2. Storage Mapping by Data Category

| Data Category | Target Store | Description / Access Rules |
|---|---|---|
| **Authentication & Passwords** | **Supabase Auth** | Cryptographic identity vault. Passwords are never stored, logged, or returned in the PAS application database. |
| **User Profiles** | **Supabase PostgreSQL** (`User`) | Linked via `authUserId` (UUID) to Supabase Auth User. Contains `username`, `email`, `role`, `isActive`, `lastLoginAt`. |
| **Login History & Security** | **Supabase PostgreSQL** (`LoginHistory`) | Append-only record of logins: `authUserId`, `email`, `role`, `loginTime`, `logoutTime`, `success`, `ipAddress`, `userAgent`, `sessionId`. **No passwords recorded**. |
| **Applicant Profiles** | **Supabase PostgreSQL** (`Applicant`) | Full name, date of birth, residential address, linked 1:1 with `User`. |
| **Passport Applications** | **Supabase PostgreSQL** (`Application`) | Master record containing ARN, personal, family, residential, emergency, and previous passport details. |
| **Status History / Audit Logs** | **Supabase PostgreSQL** (`ApplicationStatusHistory`, `AuditLog`) | Immutable event log with IP, user agent, timestamp, actor ID. |
| **Document Metadata** | **Supabase PostgreSQL** (`Document`) | Tracks storage path, SHA/MIME type, size, verification status. |
| **Physical Documents** (PDF/JPG/PNG) | **Supabase Storage** (`passport-documents`) | **Private bucket**. No public access. 5MB quota. Strict MIME filter. |
| **Appointments** | **Supabase PostgreSQL** (`Appointment`) | Slot booking with compound index `(date, timeSlot)`. |
| **Fee Transactions** | **Supabase PostgreSQL** (`Payment`) | Unique transaction reference, base fee & Tatkaal fee breakdown. |
| **Police Verification Reports** | **Supabase PostgreSQL** (`PoliceReport`) | Clearances, station codes, adverse reasons, and officer timestamps. |
| **Issued Passports** | **Supabase PostgreSQL** (`Passport`) | 36/60-page booklet numbers, 10-year validity, India Post tracking numbers. |

---

## 3. Supabase Dashboard Navigation Guide

You can inspect, monitor, and manage the application's entire dataset directly from the Supabase Dashboard:

```text
https://supabase.com/dashboard/project/<your-project-id>
    |
    +-- 🔐 Authentication
    |      ├── Users (Inspect user IDs, emails, roles, account creation, last sign-in)
    |      └── Logs (Audit trail of logins, signups, token refreshes, password resets)
    |
    +-- 🗄️ Table Editor
    |      ├── User (Application profiles with authUserId, username, role - NO passwords)
    |      ├── LoginHistory (Who logged in, when, success/failed status, IP, session)
    |      ├── Applicant (Citizen details, addresses, DOB)
    |      ├── Application (Application Reference Numbers / ARNs, status, forms)
    |      ├── Document (File metadata, verification status, storage paths)
    |      ├── Appointment (PSK appointments, dates, slots, reschedule count)
    |      ├── Payment (Transaction IDs, fees, payment methods)
    |      ├── PoliceReport (Police enquiry status, station codes, adverse remarks)
    |      ├── Passport (Issued passport booklets, dispatch numbers)
    |      └── AuditLog (State transition forensics, officer actions)
    |
    +-- 📦 Storage
    |      └── passport-documents (Private bucket: {applicationId}/{category}/{fileName})
    |
    +-- ⚡ SQL Editor (Run schema.sql, inspect table definitions, create custom queries)
    |
    +-- 📊 Database (Connection pooler settings, backup management, replication)
    |
    └── 📋 Logs (PostgreSQL query logs, API edge requests)
```

---

## 4. Password Security Policy (Zero DB Passwords)

1. **Absolute Prohibition**: The application database does not contain `password`, `plain_password`, `user_password`, or `login_password` columns.
2. **Supabase Auth Ownership**: All password verification and hashing is delegated entirely to Supabase Auth's security engine.
3. **No Credential Leaks**: Passwords are never serialized into API responses, logged into `AuditLog` or `LoginHistory`, or accessible via administrative tools.
4. **Forgot Password Flow**: If a citizen or officer forgets their password, the `/forgot-password` workflow initiates a Supabase Auth email reset token link. The previous password is never displayed or recovered.

---

## 5. Supabase Storage: Private Document Lifecycle

### 5.1 Bucket Configuration
- **Bucket ID**: `passport-documents`
- **Visibility**: `false` (Strictly Private)
- **Maximum File Size**: `5242880` bytes (5 MB)
- **Allowed MIME Types**: `application/pdf`, `image/jpeg`, `image/png`, `image/webp`

### 5.2 Storage Hierarchy
```text
passport-documents/
├── APP-20261025-4921/
│   ├── proof_of_date_of_birth/
│   │   └── 1729864200000-aadhaar_card.pdf
│   ├── proof_of_present_address/
│   │   └── 1729864201000-electricity_bill.pdf
│   └── proof_of_identity/
│       └── 1729864202000-voter_card.pdf
```

### 5.3 Temporary Signed URLs (5-Minute Expiration)
- Direct public access to documents is forbidden.
- When an authorized user requests inspection, the server verifies identity, role, and application ownership.
- The server generates an HMAC-signed URL with a 300-second TTL (`createSignedUrl(storagePath, 300)`).
