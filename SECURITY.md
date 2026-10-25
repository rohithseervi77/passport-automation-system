# Security Architecture & Access Control Specification

## 1. Security Overview & Threat Model

The **Passport Automation System (PAS)** implements defense-in-depth security principles across application, transport, database, and storage layers. This document outlines the security controls, access models, cryptographic guarantees, and data protection policies implemented in the production release.

---

## 2. Authentication Architecture

### 2.1 Password Hashing & Salt Strategy
- User passwords are encrypted using **`bcryptjs`** with an adaptive work factor of 10-12 salt rounds.
- Plaintext passwords are never stored, logged, or serialized into database responses or audit tables.

### 2.2 Session Management
- Sessions are issued as cryptographically signed JSON Web Tokens (JWT) using **`jose`** with **HMAC SHA-256 (`HS256`)**.
- Tokens are stored exclusively in **`HTTP-only`**, **`SameSite=Lax`**, **`Secure`** cookies named `pas_session`.
- Sessions expire after 7 days and are automatically revalidated on every server-rendered page or API invocation.
- Client-side JavaScript has zero access to the cookie payload, neutralizing Cross-Site Scripting (XSS) session theft.

### 2.3 Brute-Force & Lockout Protection
- Failed authentication attempts are tracked per account (`failedLoginAttempts`).
- After **5 consecutive failed attempts**, the account is locked for **15 minutes** (`lockedUntil`).
- Every failed login attempt is recorded in the immutable `AuditLog` table with client IP and User-Agent headers.

---

## 3. Role-Based Access Control (RBAC) Matrix

| Resource / Endpoint | Applicant | Passport Officer | Police Authority | Admin | Public / Guest |
|---|:---:|:---:|:---:|:---:|:---:|
| **Landing & Tracking (`/track`)** | Read Own | Read All | Read All | Read All | Read by ARN only |
| **Apply / Edit Application** | Write Own Draft | Read Assigned | Read Assigned | Read All | No Access |
| **Document Upload** | Write Own | No Direct Upload | No Direct Upload | Manage | No Access |
| **Document Viewing (Signed URL)** | Read Own Docs | Read All Queue | Read Verification | Read All | **No Access** |
| **Officer Scrutiny & Approval** | No Access | Full Verify/Approve | No Access | Manage | No Access |
| **Police Verification Reports** | No Access | Read Completed | Write / Submit | Manage | No Access |
| **Passport Dispatch Status** | Read Own | Write / Dispatch | Read Assigned | Manage | Read by Tracking # |
| **Audit Logs** | No Access | No Access | No Access | Read Full Audit | No Access |

---

## 4. Preventing Insecure Direct Object References (IDOR)

Application ownership verification is strictly enforced at the database query layer:

```typescript
// Example: Strict Applicant Ownership Enforcement
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

## 5. Row Level Security (RLS) & PostgreSQL Policies

PostgreSQL Row Level Security (RLS) is enabled across all system tables (`User`, `Applicant`, `Application`, `Document`, `Appointment`, `Payment`, `PoliceReport`, `Passport`, `AuditLog`).

- **Application Backend Access**: The Next.js application connects via the trusted Supabase pooler or direct connection using the configured service role or postgres credentials, ensuring centralized policy enforcement within server-side API handlers.
- **Client Direct Access**: Direct client queries to the PostgreSQL database from the browser are blocked by default unless explicitly granted.

---

## 6. Private Document Storage Security

### 6.1 Upload Validation
All document uploads pass through strict multi-stage validation in `app/api/applicant/documents/route.ts`:
1. **Authentication Check**: Rejects unauthenticated callers.
2. **Quota Check**: Hard limit of **5 MB** per document.
3. **MIME Whitelist**: Strictly limited to `application/pdf`, `image/jpeg`, `image/png`, `image/webp`. Executable files, SVG scripts, and archive files are rejected immediately.
4. **Filename Sanitization**: Strip non-alphanumeric characters to prevent directory traversal attacks (`../`).

### 6.2 Temporary Signed URLs
- Documents are never served directly via public URLs.
- The route `/api/documents/[docId]/signed-url` generates temporary signed URLs using the Supabase Storage HMAC signer:
  ```typescript
  const { data } = await supabase.storage
    .from("passport-documents")
    .createSignedUrl(storagePath, 300); // Expires in 5 minutes
  ```
- Once the 5-minute window elapses, the signed token expires and cannot be reused.

---

## 7. Audit Logging & Forensics

The system maintains an append-only audit trail via `lib/audit.ts` and the `AuditLog` table:
- **Events Logged**:
  - `LOGIN_SUCCESS`, `LOGIN_FAILED`
  - `DOCUMENT_UPLOAD`, `DOCUMENT_VIEWED`, `DOCUMENT_DELETE`
  - `OFFICER_VERIFY_DOCS`, `OFFICER_ACTION_APPROVE`, `OFFICER_ACTION_REJECT`
  - `POLICE_VERIFICATION_SUBMITTED`
  - `APPLICATION_STATUS_TRANSITION`
- **Recorded Metadata**: Actor user ID, entity reference (ARN / doc ID), event payload details, client IP address (from `X-Forwarded-For`), and browser User-Agent.

---

## 8. Secrets Management

1. **Service Role Isolation**: `SUPABASE_SERVICE_ROLE_KEY` is restricted strictly to server-side code (`lib/supabase.ts`). It is never bundled into client components (`NEXT_PUBLIC_` prefix is strictly forbidden for this key).
2. **Ignored Configuration Files**: `.env`, `.env.local`, and SQLite database files are excluded via `.gitignore` to prevent secret leaks to version control.
3. **Vercel Environment Variables**: Production secrets are injected exclusively via Vercel's secure environment variable vault.
