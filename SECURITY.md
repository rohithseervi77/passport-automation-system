# Security Architecture & Access Control Specification

## 1. Security Overview & Threat Model

The **Passport Automation System (PAS)** implements enterprise defense-in-depth principles where **Supabase serves as the core authentication, database, storage, and security foundation**. This document specifies the cryptographic guarantees, access controls, password safety rules, and forensic capabilities implemented across the platform.

---

## 2. Password Security — Non-Negotiable Policy

### 2.1 Complete Absence of Database Passwords
- **No Password Columns**: The application database tables (`User`, `Applicant`, `LoginHistory`, etc.) contain **ZERO** password columns (`password`, `plain_password`, `user_password`, `login_password` are strictly forbidden).
- **Supabase Auth Vault**: All user credentials, password hashing, and cryptographic verification are handled exclusively by **Supabase Auth**.
- **No In-Transit Leaks**: The application never serializes passwords into API responses, audit tables, cookies, local storage, or console logs.
- **No Password Retrieval**: Under no circumstances can any user or administrator retrieve or view plaintext passwords. Password resets must proceed via secure email verification tokens issued by Supabase Auth.

---

## 3. Login History & Authentication Forensics

### 3.1 Immutable Login Audit (`LoginHistory`)
Every authentication event is recorded in the `LoginHistory` PostgreSQL table:
- **`authUserId`**: Unique Supabase Auth user UUID
- **`email`**: User login identifier
- **`role`**: User authorization role (`APPLICANT`, `OFFICER`, `POLICE`, `ADMIN`)
- **`loginTime`**: Server-side timestamp of login
- **`logoutTime`**: Server-side timestamp of session termination
- **`success`**: Boolean (`true` for authenticated, `false` for failed attempt)
- **`ipAddress`**: Client IP address extracted from `X-Forwarded-For`
- **`userAgent`**: Browser and operating system footprint
- **`sessionId`**: Unique session UUID for tracking active logins

### 3.2 Failed Login Protection
- When an invalid password is provided, a failed event is recorded with `success: false`.
- **CRITICAL**: The attempted password string is **NEVER recorded or logged**.
- Accounts are locked for 15 minutes after 5 consecutive failed attempts to prevent automated brute-force credential stuffing.

### 3.3 Restricted Access
- **Applicants**: Cannot view other users' login histories.
- **Officers & Police**: Cannot view system-wide authentication activity.
- **Administrators**: Can inspect the centralized **Login Activity Console** under the Admin Dashboard (`/admin/dashboard` -> `Login Activity`).

---

## 4. Role-Based Access Control (RBAC) Matrix

| Resource / Action | Applicant | Passport Officer | Police Authority | Admin | Public / Guest |
|---|:---:|:---:|:---:|:---:|:---:|
| **Public ARN Tracking (`/track`)** | Read Own | Read All | Read All | Read All | Read Status by ARN |
| **Passport Application Form** | Edit Own Draft | Read Queue | Read Queue | Manage | No Access |
| **Document Upload** | Upload Own | No Direct Upload | No Direct Upload | Manage | No Access |
| **Document Inspection (Signed URL)** | Read Own Docs | Scrutinize Queue | Background Verify | Read All | **No Access** |
| **Officer Review & Approval** | No Access | Scrutinize/Grant | No Access | Manage | No Access |
| **Police Verification Reports** | No Access | Read Completed | Conduct/Submit | Manage | No Access |
| **Login Activity Dashboard** | No Access | No Access | No Access | Full Oversight | No Access |
| **Application Audit Trail** | No Access | No Access | No Access | Read Full Audit | No Access |

---

## 5. Preventing Insecure Direct Object References (IDOR)

Application and document ownership checks are validated server-side on every request:

```typescript
// Strict Applicant Ownership Enforcement
const applicant = await prisma.applicant.findUnique({
  where: { userId: currentSessionUserId },
  include: { applications: true },
});

const ownsApplication = applicant?.applications.some(
  (app) => app.id === targetApplicationId
);

if (!ownsApplication) {
  return NextResponse.json(
    { error: "Access denied. You do not own this application." },
    { status: 403 }
  );
}
```

---

## 6. Private Document Storage Security

### 6.1 Upload Validation
All document uploads pass through strict multi-stage validation in `app/api/applicant/documents/route.ts`:
1. **Authentication Verification**: Rejects unauthenticated callers immediately.
2. **Quota Enforcement**: Hard limit of **5 MB** per document.
3. **MIME Whitelist**: Strictly restricted to `application/pdf`, `image/jpeg`, `image/png`, `image/webp`. Executables (`.exe`, `.bat`, `.cmd`, `.sh`) and scripts (`.svg`, `.js`) are rejected.
4. **Filename Sanitization**: Removes all non-alphanumeric characters to prevent directory traversal (`../`).

### 6.2 Temporary Signed URLs
- The `passport-documents` bucket is configured as **Strictly Private**.
- Temporary URLs are generated dynamically with an HMAC signature expiring in **300 seconds (5 minutes)**:
  ```typescript
  const { data } = await supabase.storage
    .from("passport-documents")
    .createSignedUrl(storagePath, 300);
  ```
- Expired or manipulated links are rejected with HTTP 403.

---

## 7. Secrets Management & Credential Protection

1. **Service Role Isolation**: `SUPABASE_SERVICE_ROLE_KEY` is restricted strictly to server-side code (`lib/supabase.ts`). It is never bundled into client components (`NEXT_PUBLIC_` prefix is strictly forbidden for this key).
2. **Version Control Safety**: `.env`, `.env.local`, and SQLite database files are excluded via `.gitignore` to prevent secret leaks to version control.
3. **Vercel Vault**: Production secrets are injected exclusively via Vercel's secure environment variable vault.
